/**
 * 原始版 CalcBasicDamage（對照 HOF/Class/Skill/Effect.php::CalcBasicDamage）
 * Original CalcBasicDamage (mirrors HOF/Class/Skill/Effect.php::CalcBasicDamage)
 *
 * 公式本體不再各寫一份：本函式與移植版 calcBasicDamage（effect.ts）共用
 * effect.core.ts 的 computeBasicDamage（單一事實來源），只負責以
 * EnumDamageVariant.Original 套用原始版規則。原始版與移植版的差異僅三處，
 * 完整說明見 effect.core.ts 的 EnumDamageVariant：
 * - Barrier：公式內消耗一次並使傷害歸 0（移植版由 barrierGuard 處理）
 * - def 豁免只看 option.pierce、SPECIAL.Pierce 無條件加算（移植版受 skill.pierce 閘控）
 * - 玩家保護內聯套用 applyPlayerProtection（移植版由 hpDamage 處理）
 * - 保底 min 取「扣防禦前」的 10%（兩版一致，移植版已對齊）
 *
 * The formula body is no longer written twice: this function and the port's calcBasicDamage
 * (effect.ts) share computeBasicDamage in effect.core.ts (single source of truth) and only apply
 * the original rules via EnumDamageVariant.Original. The two variants differ in exactly three
 * places, all documented on EnumDamageVariant in effect.core.ts: inline Barrier, an option.pierce-
 * only defence exception with an unconditional SPECIAL.Pierce bonus, and inline player protection
 * (the port delegates those to barrierGuard / hpDamage). The 10% pre-defence floor is identical
 * in both variants (the port now matches the original).
 */

import type { Character } from '../character/Character';
import { EnumDamageVariant, computeBasicDamage } from './effect.core';
import type { IDamageOption, IDamageSkillSource } from './effect.core';

/**
 * 原始版基礎傷害計算（＝共用公式 + Original 規則組態）
 * Original basic damage calculation (= the shared formula under the Original rule preset)
 *
 * 完整公式順序見 effect.core.ts 的 computeBasicDamage。
 * See computeBasicDamage in effect.core.ts for the full pipeline order.
 *
 * @param skill - 技能欄位（ISkillDef 或最小物件字面）/ skill fields (ISkillDef or a minimal literal)
 * @param user - 施放者（提供能力與 atk）/ the caster (supplies stats and atk)
 * @param target - 目標（提供 def、Barrier 與玩家保護參照）/ the target (supplies defence, Barrier and the protection rules)
 * @param option - 倍率／穿透選項（缺省＝無）/ multiplier / pierce options (none when omitted)
 * @returns 最終傷害（含原始版內聯的玩家保護）/ the final damage (including the original's inline player protection)
 */
export function calcBasicDamageOriginal(
	skill: IDamageSkillSource,
	user: Character,
	target: Character,
	option: IDamageOption = {},
): number
{
	return computeBasicDamage(skill, user, target, option, EnumDamageVariant.Original);
}
