// 加權隨機選擇 / Weighted random pick
// 對應原始 HOF_Class_Battle_Team::pick()：
//   $max += $val[weight]; $pos = randInt(0,$max); 洗牌後依序累計選中。
// 此處 entry 採用 [value, weight]（對應 docs 範例 [1000,4] = [敵人編號, 權重]）。

import { RNG } from './rng';


/**
 * 加權隨機項目 / Weighted random entry
 * 型別別名 / type alias
 */
export type IWeightedEntry<T> = [value: T, weight: number];

/**
 * 依權重隨機選擇一個項目。
 * @param entries [value, weight] 陣列（weight > 0）
 * @param rng 可注入的隨機源
 * @returns 選中的 value；空陣列回傳 undefined
 */
export function weightedPick<T>(entries: readonly IWeightedEntry<T>[], rng: RNG): T | undefined {
	if (entries.length === 0) return undefined;

	let max = 0;
	for (const [, w] of entries) max += w;

	const pos = rng.randInt(0, max); // 含兩端，對應 mt_rand(0,$max)

	// 洗牌確保機率均勻分佈（對應 array_shuffle）
	const shuffled = rng.shuffle(entries);

	let upp = 0;
	for (const [value, w] of shuffled) {
		upp += w;
		if (pos <= upp) return value;
	}

	// 兜底（pos == max 時最後一項必定命中；此處為安全網）
	return shuffled[shuffled.length - 1][0];
}
