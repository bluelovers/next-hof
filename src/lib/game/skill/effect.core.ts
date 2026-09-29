/**
 * 基礎傷害計算核心（單一事實來源）/ Basic damage calculation core (single source of truth)
 *
 * 移植版 calcBasicDamage（effect.ts）與原始版 calcBasicDamageOriginal（effect.original.ts）
 * 曾各寫一份完全相同的傷害公式（違反單一事實來源）；本模組把公式管線收斂為唯一實作，
 * 兩版差異（Barrier 是否內聯、def 豁免條件、穿透加算時機、玩家保護）改以
 * EnumDamageVariant 規則組態描述，差異點只在本檔出現一次。
 * The ported calcBasicDamage (effect.ts) and the original calcBasicDamageOriginal
 * (effect.original.ts) used to carry their own copy of the same formula (an SSoT violation);
 * this module collapses the pipeline into a single implementation, and the differences
 * (inline Barrier, the def-exception condition, pierce timing, player protection) are described
 * by the EnumDamageVariant rule preset — each difference appears exactly once, here.
 *
 * 公式順序 / pipeline order:
 * 1. 能力選擇（inf=Dex → DEX；否則物理 STR／魔法 INT）/ pick the stat
 * 2. base = sqrt(能力)×10 + atk[槽位]，× pow%，× option.multiply / base × pow% × multiply
 * 3. Barrier（僅 Original：消耗一次並使傷害歸 0）/ Barrier (Original only)
 * 4. 保底基準 min = 扣防禦前的 10% / floor = 10% of the pre-defence value
 * 5. def 減免（% 再定值，可豁免）/ defence reduction (% then flat, may be skipped)
 * 6. SPECIAL.Pierce[槽位] × pow% 加算（可豁免）/ pierce bonus
 * 7. 與 min 比較取大後上整 / take max with min, then ceil
 * 8. 玩家保護（僅 Original；移植版交由 hpDamage）/ player protection (Original only)
 */

import type { Character } from '../character/Character';
import { applyPlayerProtection } from '../character/status';
import { EnumDefSlot } from '../character/status-attrs';
import { EnumInfluence, EnumSkillDamageType } from '../types';
import type { ISkillDef } from '../types';

/**
 * 傷害計算所需的技能欄位 / Skill fields required by the damage calculation
 * 型別別名 / type alias
 *
 * 以 Pick 自 ISkillDef 衍生（SSoT：type / pow / inf / pierce 不在本模組重複宣告），
 * 因此 ISkillDef 與最小物件字面（如 `{ type, pow }`）皆可直接傳入。
 * Derived from ISkillDef via Pick (SSoT: type / pow / inf / pierce are not re-declared here),
 * so both a full ISkillDef and a minimal literal such as `{ type, pow }` are directly assignable.
 */
export type IDamageSkillSource = Pick<ISkillDef, 'type' | 'pow' | 'inf' | 'pierce'>;

/**
 * 基礎傷害計算的選項 / Options for the basic damage calculation
 * 介面 / interface
 *
 * 對應原始 CalcBasicDamage 的 `$option`（僅 `multiply` 與 `pierce` 兩鍵）。
 * 移植版原 IDamageOption 與原始版原 ICalcOption 內容完全相同，已合併為本單一定義。
 * Mirrors the original CalcBasicDamage's `$option` (its `multiply` and `pierce` keys).
 * The port's former IDamageOption and the original's former ICalcOption were identical and are
 * now this single definition.
 */
export interface IDamageOption
{
	/**
	 * 傷害倍率（於 pow 之後、min／def 之前套用；對齊原始 `if ($option["multiply"]) $dmg *= …`）
	 * damage multiplier (applied after pow and before min / def; mirrors the original
	 * `if ($option["multiply"]) $dmg *= …`)
	 */
	multiply?: number;
	/**
	 * 無視目標 def 的 %／定值減免（skill.pierce 是否同樣跳過 def 依變體而定）；
	 * 對齊原始 `if (!$option["pierce"])`，不影響 SPECIAL.Pierce 加算。
	 * skip the target's % and flat def reductions (whether skill.pierce also skips them depends on
	 * the variant); mirrors the original `if (!$option["pierce"])` and never affects the
	 * SPECIAL.Pierce bonus.
	 */
	pierce?: boolean;
}

/**
 * 傷害計算變體（同一份公式、兩種規則組態）/ Damage calculation variant (one formula, two rule presets)
 * 列舉 / enumeration
 *
 * 只描述三處差異；其餘公式步驟完全共用。
 * Describes only the three differences; every other pipeline step is shared.
 */
export enum EnumDamageVariant
{
	/**
	 * 移植版（適應版）：Barrier 由 barrierGuard、玩家保護由 hpDamage 於呼叫前后處理；
	 * def 豁免與穿透加算皆受 skill.pierce 閘控。
	 * port (adapted): Barrier is handled by barrierGuard and player protection by hpDamage around
	 * this call; both the def exception and the pierce bonus are gated by skill.pierce.
	 */
	Adapted = 'adapted',
	/**
	 * 原始 PHP 版：Barrier 內聯消耗並歸 0、玩家保護內聯；
	 * def 豁免只看 option.pierce、SPECIAL.Pierce 無條件加算。
	 * original PHP: Barrier is consumed inline (zeroing the damage) and player protection is inline;
	 * the def exception honours only option.pierce and SPECIAL.Pierce is added unconditionally.
	 */
	Original = 'original',
}

/**
 * 物理/魔法基礎傷害計算（唯一實作）/ Physical/magic basic damage calculation (the only implementation)
 *
 * @param skill - 技能欄位（ISkillDef 或最小物件字面）/ skill fields (ISkillDef or a minimal literal)
 * @param user - 施放者（提供能力與 atk）/ the caster (supplies stats and atk)
 * @param target - 目標（提供 def 與 Barrier 參照）/ the target (supplies defence and Barrier)
 * @param option - 倍率／穿透選項（缺省＝無）/ multiplier / pierce options (none when omitted)
 * @param variant - 規則組態（缺省＝移植版）/ rule preset (defaults to the ported variant)
 * @returns 最終傷害 / the final damage
 */
export function computeBasicDamage(
	skill: IDamageSkillSource,
	user: Character,
	target: Character,
	option: IDamageOption = {},
	variant: EnumDamageVariant = EnumDamageVariant.Adapted,
): number
{
	const isOriginal = variant === EnumDamageVariant.Original;

	/**
	 * atk 槽位即傷害類型（0=Physical、1=Magic），由 skill.type 單一來源取得。
	 * The atk slot is the damage type itself (0 = Physical, 1 = Magic), taken from skill.type.
	 */
	const atkIdx = skill.type;
	const isMagic = skill.type === EnumSkillDamageType.Magic;

	/**
	 * 1. 能力選擇：inf=Dex 一律 DEX，否則物理 STR／魔法 INT。
	 *    Stat selection: inf = Dex always uses DEX, otherwise physical STR / magic INT.
	 */
	const stat = skill.inf === EnumInfluence.Dex
		? user.DEX
		: (isMagic ? user.INT : user.STR);

	/**
	 * 2. base = sqrt(能力)×10 + 使用者對應 atk，再乘 pow%。
	 *    base = sqrt(stat)×10 + the user's matching atk, then scaled by pow%.
	 */
	let dmg = (Math.sqrt(stat) * 10 + (user.atk[atkIdx] ?? 0)) * (skill.pow ?? 100) / 100;

	/**
	 * 3. 倍率（原始 `$option["multiply"]`）：pow 之後、min／def 之前。
	 *    Multiplier (the original `$option["multiply"]`): after pow, before min / defence.
	 */
	if (option.multiply) dmg *= option.multiply;

	/**
	 * 4. Barrier（僅原始版內聯：消耗一次並使傷害歸 0）。
	 *    移植版由 barrierGuard 於呼叫前處理（規則見 effect.ts，全專案只有一條 Barrier 規則）。
	 *    Barrier (inline in the original only: consume one charge and zero the damage); the port
	 *    lets barrierGuard handle it before this call, so the codebase keeps a single Barrier rule.
	 */
	if (isOriginal && target.SPECIAL.Barrier)
	{
		target.SPECIAL.Barrier = Math.max(0, target.SPECIAL.Barrier - 1);
		dmg = 0;
	}

	/**
	 * 5. 保底基準：對齊原始 `$min = $dmg * (1/10)`，於「扣防禦前」計算。
	 *    Floor reference: mirrors the original `$min = $dmg * (1/10)`, computed BEFORE defence.
	 */
	const min = dmg * 0.1;

	/**
	 * 6. def 減免（先 % 後定值）：option.pierce 一律豁免；
	 *    移植版另受 skill.pierce 閘控，原始版的 def 豁免只看 option.pierce。
	 *    Defence reduction (% then flat): option.pierce always skips it; the port additionally lets
	 *    skill.pierce skip it, while the original honours only option.pierce.
	 */
	const skipDef = !!option.pierce || (!isOriginal && !!skill.pierce);
	if (!skipDef)
	{
		if (isMagic)
		{
			dmg *= 1 - (target.def[EnumDefSlot.MagPct] ?? 0) / 100;
			dmg -= target.def[EnumDefSlot.MagFlat] ?? 0;
		}
		else
		{
			dmg *= 1 - (target.def[EnumDefSlot.PhysPct] ?? 0) / 100;
			dmg -= target.def[EnumDefSlot.PhysFlat] ?? 0;
		}
	}

	/**
	 * 7. 穿透加算：原始版「無條件」（持有 SPECIAL.Pierce 即生效，與 option.pierce 無關）；
	 *    移植版僅在 skill.pierce 為真時加算。
	 *    Pierce bonus: the original adds it unconditionally (any SPECIAL.Pierce counts, independent
	 *    of option.pierce); the port only adds it when skill.pierce is set.
	 */
	if (isOriginal || skill.pierce)
	{
		/** Pierce 缺省（undefined）時不賦預設值，直接視為無穿透 / an absent Pierce means no bonus */
		const pierce = user.SPECIAL.Pierce;
		if (pierce)
		{
			const p = pierce[atkIdx];
			if (p) dmg += p * (skill.pow ?? 100) / 100;
		}
	}

	/**
	 * 8. 與保底比較取大後上整。
	 *    Take the larger of the damage and the floor, then ceil.
	 */
	if (dmg < min) dmg = min;
	dmg = Math.ceil(dmg);

	/**
	 * 9. 玩家保護（僅原始版內聯；移植版由 hpDamage 於扣血時套用，兩者共用
	 *    applyPlayerProtection，保護規則只有一份）。
	 *    Player protection (inline for the original only; the port applies it in hpDamage — both go
	 *    through applyPlayerProtection, so the rule exists exactly once).
	 */
	return isOriginal ? applyPlayerProtection(target, dmg) : dmg;
}
