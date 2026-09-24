// 技能效果套用 / Skill effect application
// 對應 docs/log/battle/02 §3（傷害/回復）, §4（守護由 battle/guard 處理）, §7（Buff/Debuff）,
// docs/data/skill.md（Up*/Down*/Plus*/Poison/CurePoison/HpRegen/SpRegen ...）。

import { EnumState } from '../constants';
import type { Character } from '../character/Character';
import { charIdToString } from '../character/Character';
import { hpDamage, hpRecover, getPoison, getNormal } from '../character/status';
import { UPMAP, DOWNMAP, PLUSMAP, EnumAtkSlot, EnumDefSlot } from '../character/status-attrs';
import type { ISkillDef, IBattleEvent } from '../types';
import { EnumInfluence, EnumBattleEventType } from '../types';
import type { RNG } from '../core/rng';


/**
 * 技能執行結果 / Skill execution result
 * 介面 / interface
 */
export interface ISkillResult {
	/** 實際造成的傷害（支援技能為 0/未設）/ damage dealt (0/unset for support skills) */
	damage?: number;
	/** 實際回復量（傷害技能未設）/ amount healed (unset for damage skills) */
	heal?: number;
	/** 產生的戰鬥事件（呼叫方併入 Battle.log）/ emitted battle events (caller merges into Battle.log) */
	events: IBattleEvent[];
}

/**
 * 物理/魔法基礎傷害計算（對應 CalcBasicDamage）
 * Physical/magic basic damage calculation (mirrors CalcBasicDamage)
 *
 * 流程 / flow:
 * 1. 依 skill.type 決定 STR/INT 與物理/魔法 atk 索引；inf=Dex 時改用 DEX。
 *    pick STR/INT and the physical/magic atk slot by skill.type; inf=Dex uses DEX instead.
 * 2. base = sqrt(能力)×10 + 使用者對應 atk，再乘 pow%。
 *    base = sqrt(stat)×10 + user's matching atk, scaled by pow%.
 * 3. 非 pierce 時套用目標 def 的 % 減免與定值減免。
 *    without pierce, apply the target's % and flat def reductions.
 * 4. 保底最小傷害為 raw 的 10%；pierce 時另加 SPECIAL.Pierce×pow%。
 *    guarantees a minimum of 10% of raw; pierce additionally adds SPECIAL.Pierce×pow%.
 */
export function calcBasicDamage(skill: ISkillDef, user: Character, target: Character): number {
	const isMagic = skill.type === 1;
	const stat = skill.inf === EnumInfluence.Dex
		? user.DEX
		: (isMagic ? user.INT : user.STR);
	const atkIdx = isMagic ? EnumAtkSlot.Mag : EnumAtkSlot.Phys;
	const base = Math.sqrt(stat) * 10 + (user.atk[atkIdx] ?? 0);
	let raw = base * (skill.pow ?? 100) / 100;

	if (!skill.pierce) {
		if (isMagic) {
			raw = raw * (1 - (target.def[EnumDefSlot.MagPct] ?? 0) / 100);
			raw = raw - (target.def[EnumDefSlot.MagFlat] ?? 0);
		} else {
			raw = raw * (1 - (target.def[EnumDefSlot.PhysPct] ?? 0) / 100);
			raw = raw - (target.def[EnumDefSlot.PhysFlat] ?? 0);
		}
	}

	const minDmg = raw * 0.1; // 最小傷害保證
	let dmg = Math.max(raw, minDmg);

	if (skill.pierce) {
		const p = user.SPECIAL.Pierce[isMagic ? EnumAtkSlot.Mag : EnumAtkSlot.Phys] ?? 0;
		dmg += (p * (skill.pow ?? 100)) / 100;
	}

	return Math.ceil(dmg);
}

/**
 * 回復量計算（對應 CalcRecoveryValue）
 * Heal amount calculation (mirrors CalcRecoveryValue)
 *
 * sqrt(INT)×10 + 魔法 atk，再乘 pow%；支援技能的 pow 即回復倍率。
 * sqrt(INT)×10 + magic atk, scaled by pow%; for support skills pow is the heal ratio.
 */
export function calcRecoveryValue(skill: ISkillDef, user: Character): number {
	const heal = Math.sqrt(user.INT) * 10 + (user.atk[EnumAtkSlot.Mag] ?? 0);
	return Math.ceil(heal * (skill.pow ?? 100) / 100);
}


/**
 * 套用技能的状态變化（對應 StatusChanges）。增益/減益分別作用於使用者/目標。
 * Apply the skill's status changes (mirrors StatusChanges). Buffs hit the user, debuffs the target.
 *
 * - Up* → UPMAP（作用於使用者）/ Up* → UPMAP (applied to the user)
 * - Down* → DOWNMAP（作用於目標）/ Down* → DOWNMAP (applied to the target)
 * - Plus* → PLUSMAP（作用於使用者，永久加算）/ Plus* → PLUSMAP (applied to the user, permanent flat bonus)
 * - 另依欄位處理 poison / CurePoison / HpRegen / SpRegen。
 *   also handles poison / CurePoison / HpRegen / SpRegen by field.
 */
export function statusChanges(skill: ISkillDef, target: Character, user: Character, rng?: RNG): void {
	for (const key of Object.keys(skill)) {
		const n = (skill as unknown as Record<string, unknown>)[key];
		if (typeof n !== 'number') continue;
		if (UPMAP[key]) UPMAP[key](user, n);
		else if (DOWNMAP[key]) DOWNMAP[key](target, n);
		else if (PLUSMAP[key]) PLUSMAP[key](user, n);
	}

	if (skill.poison) {
		getPoison(target, skill.poison, rng);
	}
	/**
	 * CurePoison 反向條件（既有實作）：目標「非」中毒時才呼叫 getNormal。
	 * Reversed CurePoison condition (as implemented): getNormal runs only when the target is NOT poisoned.
	 */
	if (skill.CurePoison && target.STATE !== EnumState.Poison) {
		getNormal(target);
	}
	if (skill.HpRegen) target.SPECIAL.HpRegen += skill.HpRegen;
	if (skill.SpRegen) target.SPECIAL.SpRegen += skill.SpRegen;
}

/**
 * 執行一次技能效果（傷害或回復），套用 Barrier 與狀態變化。守護/目標選擇由呼叫方處理。
 * Execute one skill effect (damage or heal), applying Barrier and status changes.
 * Guard interception and target selection are handled by the caller.
 *
 * - support → calcRecoveryValue 回復路線 / support → calcRecoveryValue heal path
 * - 非 pierce 且目標 Barrier>0 → 消耗一層並完全抵擋 / non-pierce vs Barrier>0 → consume a layer, block fully
 * - 其餘 → calcBasicDamage 後經 hpDamage 套用 / otherwise → calcBasicDamage then applied via hpDamage
 */
export function applySkill(skill: ISkillDef, user: Character, target: Character, rng?: RNG): ISkillResult {
	const events: IBattleEvent[] = [];

	if (skill.support) {
		const hpBefore = target.HP;
		const heal = calcRecoveryValue(skill, user);
		const applied = hpRecover(target, heal);
		events.push({ type: EnumBattleEventType.Heal, actor: charIdToString(user.no), target: charIdToString(target.no), skill: skill.no, value: applied, hpBefore, hpAfter: target.HP });
		statusChanges(skill, target, user, rng);
		return { heal: applied, events };
	}

	const dmg = calcBasicDamage(skill, user, target);

	// 絕對防禦 Barrier：消耗一次，完全抵擋
	if (target.SPECIAL.Barrier > 0 && !skill.pierce) {
		target.SPECIAL.Barrier--;
		events.push({ type: EnumBattleEventType.Guard, actor: charIdToString(target.no), target: charIdToString(target.no), text: 'barrier' });
		return { damage: 0, events };
	}

	const hpBefore = target.HP;
	const applied = hpDamage(target, dmg);
	events.push({ type: EnumBattleEventType.Damage, actor: charIdToString(user.no), target: charIdToString(target.no), skill: skill.no, value: applied, hpBefore, hpAfter: target.HP });
	statusChanges(skill, target, user, rng);
	return { damage: applied, events };
}
