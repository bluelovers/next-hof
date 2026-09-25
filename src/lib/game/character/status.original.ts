// 原始版 GetPoison（對照 HOF/Class/Char/Battle/Effect.php::GetPoison）
// 作為與移植版 getPoison 的「比較基準」。
// Original GetPoison (mirrors HOF/Class/Char/Battle/Effect.php::GetPoison), kept as a
// comparison baseline against the ported getPoison.
//
// 與移植版 getPoison 的差異（divergence from the ported getPoison）：
// - 無抗毒時，原始設定 STATE_POISON2（二階中毒）；移植版一律設定 STATE_Poison。
//   Without resistance the original sets STATE_POISON2; the port always sets STATE_Poison.
// - 原始 PoisonDamage 僅對 STATE_POISON 生效，故非抗毒中毒（POISON2）在原始中不會每回合掉血
//   （原始既有行為）；移植版統一 STATE_Poison 則會正常掉血。
//   The original PoisonDamage only triggers on STATE_POISON, so a non-resisted POISON2 wouldn't
//   tick in the original (as-implemented); the port's unified STATE_Poison ticks normally.

import { EnumState } from '../constants';
import type { Character } from './Character';
import type { RNG } from '../core/rng';

/**
 * 原始版中毒判定（對齊 PHP GetPoison）
 * Original poison roll (mirrors PHP GetPoison)
 *
 * 原始流程 / original flow:
 *   if (STATE === STATE_POISON) return false;          // 已中毒
 *   if (PoisonResist) {                                // 有抗毒
 *     prob = randInt(0,99);
 *     bePoison *= (1 - PoisonResist/100);
 *     if (prob < bePoison) { STATE = STATE_POISON; return true; }  // 抗毒成功仍為 STATE_POISON
 *     else return 'BLOCK';
 *   }
 *   STATE = STATE_POISON2;                              // 無抗毒：二階中毒
 *   return true;
 *
 * 注意：當有抗毒但缺少 rng 時，PHP 會呼叫 mt_rand；此處無法擲骰，故退化為「無抗毒」分支（POISON2）。
 * Note: the original calls mt_rand whenever PoisonResist is set; without an rng we cannot roll,
 * so we fall back to the no-resistance branch (POISON2).
 *
 * @returns false=已中毒 | true=成功中毒 | 'BLOCK'=有抗毒且機率抵抗
 *          false=already poisoned | true=poisoned | 'BLOCK'=resisted by chance
 */
export function getPoisonOriginal(char: Character, bePoison: number, rng?: RNG): boolean | 'BLOCK' {
	if (char.STATE === EnumState.Poison) return false;

	if (char.SPECIAL.PoisonResist && rng) {
		const chance = bePoison * (1 - char.SPECIAL.PoisonResist / 100);
		if (rng.randInt(0, 99) < chance) {
			char.STATE = EnumState.Poison; // 抗毒成功仍為 STATE_POISON
			return true;
		}
		return 'BLOCK';
	}

	// 無抗毒（或無 rng 無法判定抗毒）：原始設定 STATE_POISON2
	// No resistance (or no rng to resolve it): the original sets STATE_POISON2
	char.STATE = EnumState.Poison2;
	return true;
}
