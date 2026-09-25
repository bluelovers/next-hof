// 原始版 CalcBasicDamage（對照 HOF/Class/Skill/Effect.php::CalcBasicDamage）
// 作為與移植版 calcBasicDamage（適應版）的「比較基準」。
// Original CalcBasicDamage (mirrors HOF/Class/Skill/Effect.php::CalcBasicDamage), kept as a
// comparison baseline against the ported calcBasicDamage (adapted).
//
// 與移植版 calcBasicDamage 的差異（divergence from the ported calcBasicDamage）：
// - 穿透（SPECIAL.Pierce）：原始「無條件」加算（只要有 SPECIAL.Pierce 即生效，與 option.pierce 無關）；
//   移植版僅在 skill.pierce 為真時加算。
//   Pierce (SPECIAL.Pierce): the original adds it UNCONDITIONALLY (whenever SPECIAL.Pierce is set,
//   independent of option.pierce); the port only adds it when skill.pierce is set.
// - Barrier：原始在函式內消耗並使傷害歸 0；移植版由 Battle.UseSkill 處理。
//   Barrier: the original consumes it inside the function and zeroes damage; the port handles it in Battle.UseSkill.
// - 玩家保護（低等 / 不致死）：原始在函式尾端處理；移植版由 hpDamage 處理。
//   Player protection (low-level / non-lethal): handled at the end of the original function; the port handles it in hpDamage.
// - 保底最小傷害的基準：原始取「扣防禦前」的 10%；移植版已對齊（先算 min 再扣防）。
//   Floor reference: the original uses 10% of the PRE-defence value; the port now matches (computes min before defence).

import { EnumSkillDamageType, EnumInfluence } from '../types';
import type { Character } from '../character/Character';
import { EnumAtkSlot, EnumDefSlot } from '../character/status-attrs';

/**
 * 傳入技能的最小必要欄位（結構型別，可直接傳入 ISkillDef）。
 * Minimal skill fields required (structural type; a full ISkillDef is assignable).
 */
export interface ICalcSkillMinimal {
	/** 傷害類型：0=物理、1=魔法 / damage type: 0=physical, 1=magic */
	type: EnumSkillDamageType;
	/** 威力倍率 % / power % */
	pow?: number;
	/** 參照能力（dex 改用 DEX）/ influencing stat (dex => DEX) */
	inf?: EnumInfluence;
}

/**
 * 額外選項（對齊原始 CalcBasicDamage 的 $option）。
 * Extra options (mirrors the original CalcBasicDamage $option).
 */
export interface ICalcOption {
	/** 傷害倍率（ChargeAttack ×4、Hit&Away ×3、PoisonBlow ×6、SoulRevenge ×N 等）/
	 *  damage multiplier (ChargeAttack ×4, Hit&Away ×3, PoisonBlow ×6, SoulRevenge ×N, ...) */
	multiply?: number;
	/** 是否跳過防禦減免（對齊原始 $option["pierce"]；注意：不影響 SPECIAL.Pierce 加算）/
	 *  whether to skip defence reduction (mirrors original $option["pierce"]; does NOT gate the SPECIAL.Pierce add) */
	pierce?: boolean;
}

/**
 * 原始版基礎傷害計算（對齊 PHP CalcBasicDamage）
 * Original basic damage calculation (mirrors PHP CalcBasicDamage)
 *
 * 完整還原原始順序 / faithfully restores the original ordering:
 *   1. base = sqrt(stat)×10 + atk[slot]; raw = base × pow%
 *   2. raw × option.multiply（若有）
 *   3. Barrier：消耗一次並使 raw=0
 *   4. min = raw × 0.1（扣防禦「前」的保底基準）
 *   5. 非 pierce 時扣 def（% 與定值）
 *   6. 加算 SPECIAL.Pierce[slot]（無條件，與 option.pierce 無關）
 *   7. 與 min 比較取大
 *   8. ceil
 *   9. 玩家保護（isChar && dmg>20：不致死 / 低等減傷）
 */
export function calcBasicDamageOriginal(
	skill: ICalcSkillMinimal,
	user: Character,
	target: Character,
	option: ICalcOption = {},
): number {
	const isMagic = skill.type === EnumSkillDamageType.Magic;
	const stat = skill.inf === EnumInfluence.Dex
		? user.DEX
		: (isMagic ? user.INT : user.STR);
	const atkIdx = isMagic ? EnumAtkSlot.Mag : EnumAtkSlot.Phys;

	let dmg = Math.sqrt(stat) * 10;
	dmg += user.atk[atkIdx] ?? 0;
	dmg *= (skill.pow ?? 100) / 100;

	if (option.multiply) dmg *= option.multiply;

	// Barrier：消耗一次並使傷害歸 0（對齊原始）
	// Barrier: consume one charge and zero the damage (mirrors original)
	if (target.SPECIAL.Barrier) {
		target.SPECIAL.Barrier = Math.max(0, target.SPECIAL.Barrier - 1);
		dmg = 0;
	}

	// 保底基準：對齊原始 `$min = $dmg * (1/10)`，於「扣防禦前」計算（含 barrier 後的值）。
	// Floor reference: mirrors original `$min = $dmg * (1/10)`, computed BEFORE defence reduction (after Barrier).
	const min = dmg * 0.1;

	if (!option.pierce) {
		if (isMagic) {
			dmg *= 1 - (target.def[EnumDefSlot.MagPct] ?? 0) / 100;
			dmg -= target.def[EnumDefSlot.MagFlat] ?? 0;
		} else {
			dmg *= 1 - (target.def[EnumDefSlot.PhysPct] ?? 0) / 100;
			dmg -= target.def[EnumDefSlot.PhysFlat] ?? 0;
		}
	}

	// 穿透：原始「無條件」加算（只要有 SPECIAL.Pierce[slot] 即生效，與 option.pierce 無關）。
	// Pierce: the original adds it UNCONDITIONALLY whenever SPECIAL.Pierce[slot] is set, independent of option.pierce.
	if (user.SPECIAL.Pierce[atkIdx]) {
		dmg += (user.SPECIAL.Pierce[atkIdx] ?? 0) * (skill.pow ?? 100) / 100;
	}

	if (dmg < min) dmg = min;

	dmg = Math.ceil(dmg);

	// 玩家保護（對齊原始尾端處理）
	// Player protection (mirrors original end-of-function handling)
	if (target.isChar() && dmg > 20) {
		if (target.HP > 10 && dmg >= target.HP) {
			dmg = target.HP - 1; // 不致死
		} else if (target.level < 10 && target.MAXHP < 200) {
			dmg -= Math.max(10, 25 - target.level); // 低等減傷
		}
	}

	return dmg;
}
