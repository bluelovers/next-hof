// 技能效果套用 / Skill effect application
// 對應 docs/log/battle/02 §3（傷害/回復）, §4（守護由 battle/guard 處理）, §7（Buff/Debuff）,
// docs/data/skill.md（Up*/Down*/Plus*/Poison/CurePoison/HpRegen/SpRegen ...）。

import { EnumState } from '../constants';
import type { Character } from '../character/Character';
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
	damage?: number;
	heal?: number;
	events: IBattleEvent[];
}

/** 物理/魔法基礎傷害計算（對應 CalcBasicDamage） */
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

/** 回復量計算（對應 CalcRecoveryValue） */
export function calcRecoveryValue(skill: ISkillDef, user: Character): number {
	const heal = Math.sqrt(user.INT) * 10 + (user.atk[EnumAtkSlot.Mag] ?? 0);
	return Math.ceil(heal * (skill.pow ?? 100) / 100);
}


/** 套用技能的状态變化（對應 StatusChanges）。增益/減益分別作用於使用者/目標。 */
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
	if (skill.CurePoison && target.STATE !== EnumState.Poison) {
		getNormal(target);
	}
	if (skill.HpRegen) target.SPECIAL.HpRegen += skill.HpRegen;
	if (skill.SpRegen) target.SPECIAL.SpRegen += skill.SpRegen;
}

/** 執行一次技能效果（傷害或回復），套用 Barrier 與狀態變化。守護/目標選擇由呼叫方處理。 */
export function applySkill(skill: ISkillDef, user: Character, target: Character, rng?: RNG): ISkillResult {
	const events: IBattleEvent[] = [];

	if (skill.support) {
		const heal = calcRecoveryValue(skill, user);
		const applied = hpRecover(target, heal);
		events.push({ type: EnumBattleEventType.Heal, actor: String(user.no), target: String(target.no), skill: skill.no, value: applied });
		statusChanges(skill, target, user, rng);
		return { heal: applied, events };
	}

	const dmg = calcBasicDamage(skill, user, target);

	// 絕對防禦 Barrier：消耗一次，完全抵擋
	if (target.SPECIAL.Barrier > 0 && !skill.pierce) {
		target.SPECIAL.Barrier--;
		events.push({ type: EnumBattleEventType.Guard, actor: String(target.no), target: String(target.no), text: 'barrier' });
		return { damage: 0, events };
	}

	const applied = hpDamage(target, dmg);
	events.push({ type: EnumBattleEventType.Damage, actor: String(user.no), target: String(target.no), skill: skill.no, value: applied });
	statusChanges(skill, target, user, rng);
	return { damage: applied, events };
}
