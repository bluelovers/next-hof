/**
 * 技能效果套用 / Skill effect application
 * 對應 docs/log/battle/02 §3（傷害/回復）, §4（守護由 battle/guard 處理）, §7（Buff/Debuff）,
 * docs/data/skill.md（Up* /Down* /Plus* /Poison/CurePoison/HpRegen/SpRegen ...）。
 */

import { EnumPosition } from '../constants';
import type { Character } from '../character/Character';
import { charIdToString } from '../character/Character';
import { hpDamage, hpRecover, getPoison, getPoisonResist } from '../character/status';
import {
	UPMAP,
	DOWNMAP,
	PLUSMAP,
	STATUS_UP_KEYS,
	STATUS_DOWN_KEYS,
	STATUS_PLUS_KEYS,
} from '../character/status-attrs';
import type { IStatusUpKey, IStatusDownKey, IStatusPlusKey } from '../character/status-attrs';
import type { ISkillDef, IBattleEvent } from '../types';
import { EnumBattleEventType, EnumMoveText, EnumSkillDamageType } from '../types';
import { EnumDamageVariant, computeBasicDamage } from './effect.core';
import type { IDamageOption, IDamageSkillSource } from './effect.core';
import { takePercent } from '../core/percent';
import type { RNG } from '../core/rng';

/**
 * 技能執行結果 / Skill execution result
 * 介面 / interface
 */
export interface ISkillResult
{
	/** 實際造成的傷害（支援技能為 0/未設）/ damage dealt (0/unset for support skills) */
	damage?: number;
	/** 實際回復量（傷害技能未設）/ amount healed (unset for damage skills) */
	heal?: number;
	/** 產生的戰鬥事件（呼叫方併入 Battle.log）/ emitted battle events (caller merges into Battle.log) */
	events: IBattleEvent[];
}

/**
 * 物理/魔法基礎傷害計算（對應 CalcBasicDamage，移植版）
 * Physical/magic basic damage calculation (ported variant; mirrors CalcBasicDamage)
 *
 * 公式本體只有單一事實來源：effect.core.ts 的 computeBasicDamage。
 * 本函式僅以 EnumDamageVariant.Adapted 套用移植版規則（三處差異列於該列舉）：
 * - Barrier 由 barrierGuard 於呼叫前處理、玩家保護由 hpDamage 於扣血時套用（不內聯）
 * - def 豁免與穿透加算皆受 skill.pierce 閘控
 * The formula body has a single source of truth: computeBasicDamage in effect.core.ts. This
 * function only applies the ported rules via EnumDamageVariant.Adapted (the three differences are
 * documented on that enum): Barrier / player protection stay outside the formula, and both the
 * def exception and the pierce bonus are gated by skill.pierce.
 *
 * 注意：原始 PHP 的「Barrier 內聯、無條件穿透、內聯玩家保護」請見
 * effect.original.ts 的 calcBasicDamageOriginal（同一份公式的 Original 規則組態）。
 * Note: the original PHP behaviour (inline Barrier, unconditional pierce, inline player
 * protection) lives in calcBasicDamageOriginal in effect.original.ts — the Original preset of the
 * very same formula.
 *
 * @param skill - 技能欄位（ISkillDef 或最小物件字面）/ skill fields (ISkillDef or a minimal literal)
 * @param user - 施放者（提供能力與 atk）/ the caster (supplies stats and atk)
 * @param target - 目標（提供 def 與 Pierce 參照）/ the target (supplies def)
 * @param option - 倍率／穿透選項（缺省＝無）/ multiplier / pierce options (none when omitted)
 * @returns 最終傷害 / the final damage
 */
export function calcBasicDamage(
	skill: IDamageSkillSource,
	user: Character,
	target: Character,
	option?: IDamageOption,
): number
{
	return computeBasicDamage(skill, user, target, option, EnumDamageVariant.Adapted);
}

/**
 * 回復量計算（對應 CalcRecoveryValue）
 * Heal amount calculation (mirrors CalcRecoveryValue)
 *
 * sqrt(INT)×10 + 魔法 atk，再乘 pow%；支援技能的 pow 即回復倍率。
 * sqrt(INT)×10 + magic atk, scaled by pow%; for support skills pow is the heal ratio.
 */
export function calcRecoveryValue(skill: ISkillDef, user: Character): number
{
	const heal = Math.sqrt(user.INT) * 10 + (user.atk[EnumSkillDamageType.Magic] ?? 0);
	return Math.ceil(takePercent(heal, skill.pow));
}

/**
 * 套用技能的状态變化，並回傳這段處理產生的戰鬥紀錄（對應 StatusChanges）。
 * Apply the skill's status changes and return the battle records this processing produced
 * (mirrors StatusChanges).
 *
 * 對齊原始 HOF/Class/Skill/Effect.php::StatusChanges：Up* / Down* / Plus* 全部作用在「目標」。
 * Mirrors the original StatusChanges: Up* / Down* / Plus* all apply to the *target*.
 *
 * - Up* / Down* / Plus* → 目標（UMAP/DOWNMAP/PLUSMAP 皆以 target 分派）
 *   Up* / Down* / Plus* → target (all dispatched to the target)
 * - 另依欄位處理 poison / poisonResist / knockback / move（目標）。CurePoison 與 HpRegen /
 *   SpRegen 改由 SkillEffect.default 處理（對齊原始 default 分支的先後：regen 在最前、
 *   CurePoison 在 summon 與 pow 之間）。umove 與 sacrifice 因「每次施法只作用一次」，
 *   改由 Battle.UseSkill 處理（不直接寫入本函式）。
 *   also handles poison / poisonResist / knockback / move (target). CurePoison and HpRegen /
 *   SpRegen are handled by SkillEffect.default instead (mirroring the original default branch's
 *   order: regen first of all, CurePoison between summon and pow). umove and sacrifice apply once
 *   per cast (not per target), so Battle.UseSkill handles them.
 *
 * 生產的紀錄（由呼叫方併入 Battle.log，再交給上級事件引擎分派）：
 * Records produced here (the caller merges them into Battle.log, where the upper event engine
 * dispatches them):
 * - Up*／Plus* 任一生效 → Buff 一筆、Down* 生效 → Debuff 一筆（每次施放對同一目標各記一筆；
 *   事件不帶原文，文案歸展示層 EnumLogCopy）。
 *   one Buff when any Up* / Plus* applied, one Debuff when any Down* applied (one each per target
 *   per cast; the event carries no copy — copy belongs to the display layer's EnumLogCopy)。
 * - 施毒成功 → Poison 一筆；抗性抵抗（'BLOCK'）與已中毒（false）不記——事件上沒有可表達
 *   「抵抗」的結構欄位，硬記會被展示成「已中毒」。
 *   poison applied → one Poison record; a resisted roll ('BLOCK') and an already-poisoned target
 *   (false) record nothing — the event has no field that could express "resisted", and logging it
 *   would render as "poisoned".
 * - 站位真的改變 → Move 一筆（knockback → text='knockback'、move → text='front'/'back'；
 *   對齊原始 KnockBack／Move 只在移動當下印字）。
 *   a row that really changes → one Move record (knockback → text = 'knockback', move →
 *   text = 'front' / 'back'; mirrors KnockBack / Move printing only on an actual move).
 *
 * @param skill - 技能定義 / skill definition
 * @param actor - 施放者（紀錄的 actor）/ the caster (the record's actor)
 * @param target - 目標 / target
 * @param rng - 隨機源（施毒機率判定）/ random source (poison chance roll)
 * @returns 產生的戰鬥紀錄 / produced battle records
 */
export function statusChanges(skill: ISkillDef, actor: Character, target: Character, rng?: RNG): IBattleEvent[]
{
	const events: IBattleEvent[] = [];
	let buffed = false;
	let debuffed = false;

	/**
	 * 對齊原始 StatusChanges：Up/Down/Plus 全部作用在目標（$target）。
	 * Mirrors original StatusChanges: Up/Down/Plus all apply to the target ($target).
	 */
	const upFields = skill as Partial<Record<IStatusUpKey, number>>;
	const downFields = skill as Partial<Record<IStatusDownKey, number>>;
	const plusFields = skill as Partial<Record<IStatusPlusKey, number>>;

	for (const key of STATUS_UP_KEYS)
	{
		const n = upFields[key];
		if (typeof n !== 'number') continue;
		UPMAP[key](target, n);
		buffed = true;
	}
	for (const key of STATUS_DOWN_KEYS)
	{
		const n = downFields[key];
		if (typeof n !== 'number') continue;
		DOWNMAP[key](target, n);
		debuffed = true;
	}
	for (const key of STATUS_PLUS_KEYS)
	{
		const n = plusFields[key];
		if (typeof n !== 'number') continue;
		const plusFn = PLUSMAP[key];
		if (plusFn)
		{
			plusFn(target, n);
			buffed = true;
		}
	}
	if (buffed)
	{
		events.push({
			type: EnumBattleEventType.Buff,
			actor: charIdToString(actor.no),
			target: charIdToString(target.no),
			skill: skill.no,
		});
	}
	if (debuffed)
	{
		events.push({
			type: EnumBattleEventType.Debuff,
			actor: charIdToString(actor.no),
			target: charIdToString(target.no),
			skill: skill.no,
		});
	}

	if (skill.poison)
	{
		const applied = getPoison(target, skill.poison, rng);
		if (applied === true)
		{
			events.push({
				type: EnumBattleEventType.Poison,
				actor: charIdToString(actor.no),
				target: charIdToString(target.no),
				skill: skill.no,
			});
		}
	}
	/**
	 * CurePoison 與 HpRegen／SpRegen 由 SkillEffect.default 處理（對齊原始 default 分支：
	 * regen 在最前、CurePoison 在 summon 與 pow 之間；本函式不再觸碰這些欄位）。
	 * CurePoison and HpRegen / SpRegen are handled by SkillEffect.default (mirroring the original
	 * default branch: regen at the very front, CurePoison between summon and pow; this function
	 * no longer touches those fields).
	 * 抗毒只累加 SPECIAL.PoisonResist：抵抗當下已在 getPoison 決定，此處不另記紀錄。
	 * Poison resist only accumulates SPECIAL.PoisonResist: the block itself was decided in
	 * getPoison, so no separate record is added here.
	 */
	if (skill.poisonResist) getPoisonResist(target, skill.poisonResist);
	/**
	 * 擊退：強制目標移至後排（對齊原始 KnockBack；POSITION 已為 Back 時為 no-op、不產紀錄）。
	 * Knockback: force the target to the back row (mirrors original KnockBack; no-op, and no record,
	 * when the target is already in the back row).
	 */
	if (skill.knockback && target.POSITION !== EnumPosition.Back)
	{
		target.POSITION = EnumPosition.Back;
		events.push({
			type: EnumBattleEventType.Move,
			actor: charIdToString(actor.no),
			target: charIdToString(target.no),
			skill: skill.no,
			text: EnumMoveText.Knockback,
		});
	}
	/**
	 * 技能指定目標移動方向（對齊原始 Move：已在該站位時 no-op、不印字）。
	 * Skill-specified target movement (mirrors original Move: a target already in that row is a
	 * no-op and prints nothing).
	 */
	if (skill.move && target.POSITION !== skill.move)
	{
		const text = skill.move === EnumPosition.Front ? EnumMoveText.Front : EnumMoveText.Back;
		target.POSITION = skill.move;
		events.push({
			type: EnumBattleEventType.Move,
			actor: charIdToString(actor.no),
			target: charIdToString(target.no),
			skill: skill.no,
			text,
		});
	}

	return events;
}

/**
 * 絕對防禦 Barrier 的攔截判定（對齊原始 CalcBasicDamage 內聯的 Barrier 檢查）。
 * Barrier interception (mirrors the inline Barrier check inside the original CalcBasicDamage).
 *
 * 觸發時消耗一層 Barrier，回傳 Guard 事件；未觸發回傳 null。
 * A triggered interception consumes one Barrier layer and returns the Guard event; otherwise null.
 *
 * 原始 CalcBasicDamage 對每個 calc 路徑都會做這段檢查，因此 SkillEffect 的特例分支
 * （1020／1021／1022／1023／1200／2055／2030／2031／2090／2091／5002 與 default 的 pow 傷害）
 * 也必須呼叫本函式，傷害才會與原版一致地被抵銷。
 * The original CalcBasicDamage runs this check on every calc path, so SkillEffect's special
 * branches (1020 / 1021 / 1022 / 1023 / 1200 / 2055 / 2030 / 2031 / 2090 / 2091 / 5002 and the
 * default's pow damage) must call it too, otherwise their damage would not be cancelled the way
 * the original cancels it.
 *
 * 注意：原始 PHP 的 Barrier 檢查不看 pierce；移植版沿用 applySkill 既有的
 * `Barrier > 0 && !skill.pierce` 規則，使全專案只有一條 Barrier 規則。
 * Note: the original PHP check ignores pierce; the port keeps applySkill's existing
 * `Barrier > 0 && !skill.pierce` rule so the whole codebase has exactly one Barrier rule.
 *
 * @param skill - 技能定義 / skill definition
 * @param target - 被攻擊方（Barrier 持有者）/ the attacked unit (the Barrier holder)
 * @returns Guard 事件（未觸發時 null）/ the Guard event (null when not intercepted)
 */
export function barrierGuard(skill: ISkillDef, target: Character): IBattleEvent | null
{
	/** 缺省 undefined 時視為 0（無 Barrier），不寫入實例 */
	const barrier = target.getSpecial('Barrier') ?? 0;
	if (barrier > 0 && !skill.pierce)
	{
		target.setSpecial('Barrier', barrier - 1);
		/**
		 * 帶 skill 編號：攔截是「這次技能」造成的，上級事件引擎才能掛回同一筆技能事件。
		 * Carries the skill number: the interception belongs to *this* skill use, so the upper event
		 * engine can attach it to the same skill event.
		 */
		return {
			type: EnumBattleEventType.Guard,
			actor: charIdToString(target.no),
			target: charIdToString(target.no),
			skill: skill.no,
			text: 'barrier',
		};
	}
	return null;
}

/**
 * Barrier 攔截判定 → calcBasicDamage → Damage 事件（applyDamage 與 applySkill 的共同傷害路徑）
 * Barrier interception → calcBasicDamage → Damage record (the damage path shared by applyDamage
 * and applySkill)
 *
 * 兩個公開函式的傷害流程原本各寫一份（違反單一事實來源），已收斂至本函式；
 * 是否在傷害之後再套狀態變化，由呼叫方決定。
 * The damage flow used to be written separately in both public functions (an SSoT violation) and
 * is now collapsed into this one; whether status changes follow the damage is up to the caller.
 *
 * @returns result＝傷害結果；guarded＝是否遭 Barrier 攔截（攔截時呼叫方不得再套狀態變化）
 *          result = the damage outcome; guarded = whether the barrier intercepted (the caller
 *          must not apply status changes in that case)
 */
function _damageOnce(
	skill: ISkillDef,
	user: Character,
	target: Character,
): { result: ISkillResult; guarded: boolean }
{
	const guard = barrierGuard(skill, target);
	if (guard) return { result: { damage: 0, events: [guard] }, guarded: true };

	const dmg = calcBasicDamage(skill, user, target);
	const hpBefore = target.HP;
	const applied = hpDamage(target, dmg);
	return {
		result: {
			damage: applied,
			events: [
				{
					type: EnumBattleEventType.Damage,
					actor: charIdToString(user.no),
					target: charIdToString(target.no),
					skill: skill.no,
					value: applied,
					hpBefore,
					hpAfter: target.HP,
				},
			],
		},
		guarded: false,
	};
}

/**
 * 執行一次傷害效果但「不套狀態變化」（Barrier 攔截 → calcBasicDamage → Damage 事件）。
 * Execute one damage effect *without* status changes (Barrier → calcBasicDamage → Damage record).
 *
 * 傷害流程共用 _damageOnce（SSoT），本函式在產出 Damage 事件後即返回，**不**套狀態變化。
 * 理由：SkillEffect.default 的原始分支（`if ($skill["pow"]) { ... $dmg = CalcBasicDamage;
 * DamageHP; }`）在 PHP 裡不呼叫 StatusChanges——狀態變化統一由 default 尾端的那次
 * StatusChanges 處理——因此不能沿用會多做一次狀態變化的 applySkill。
 * The damage flow is shared via _damageOnce (SSoT); this function returns right after the Damage
 * record and applies **no** status changes. Reason: SkillEffect's original default branch
 * (`if ($skill["pow"]) { ... CalcBasicDamage; DamageHP; }`) does not call StatusChanges — the
 * single StatusChanges at the end of default owns that — so applySkill, which would apply the
 * statuses one extra time, cannot be used there.
 *
 * @returns 技能執行結果（damage＝實際扣血；Barrier 攔截時為 0）/ skill result (damage = HP actually
 * lost; 0 when the barrier intercepted)
 */
export function applyDamage(skill: ISkillDef, user: Character, target: Character): ISkillResult
{
	return _damageOnce(skill, user, target).result;
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
export function applySkill(skill: ISkillDef, user: Character, target: Character, rng?: RNG): ISkillResult
{
	const events: IBattleEvent[] = [];

	if (skill.support)
	{
		const hpBefore = target.HP;
		const heal = calcRecoveryValue(skill, user);
		const applied = hpRecover(target, heal);
		events.push({
			type: EnumBattleEventType.Heal,
			actor: charIdToString(user.no),
			target: charIdToString(target.no),
			skill: skill.no,
			value: applied,
			hpBefore,
			hpAfter: target.HP,
		});
		events.push(...statusChanges(skill, user, target, rng));
		return { heal: applied, events };
	}

	/**
	 * 傷害路徑共用 _damageOnce（SSoT）；Barrier 攔截時直接返回，不套狀態變化。
	 * The damage path is shared via _damageOnce (SSoT); when the barrier intercepts we return
	 * without applying status changes.
	 */
	const { result, guarded } = _damageOnce(skill, user, target);
	if (guarded) return result;

	result.events.push(...statusChanges(skill, user, target, rng));
	return result;
}
