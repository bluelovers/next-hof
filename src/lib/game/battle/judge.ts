// AI 判定碼 / AI judge codes
// 對應 docs/log/battle/02 §6 與 docs/log/battle/05 §3（DecideJudge）。
// 實作重點驗證碼：1101（HP% 閾值）、1940（約 10% 機率）；1300–1381 為空殼（回傳 false）。

import type { Character } from '../character/Character';

/**
 * 判定某行為條件碼是否成立。
 * Evaluate whether a behavior condition (judge code) holds.
 *
 * 已實作 / implemented: 1000/1001（恆真 default）、1101（HP% ≤ 40）、1940（約 10% 機率）；
 * 1300–1381、1405、9000、1205 及其餘未實作碼一律回傳 false（保守退回預設動作）。
 * 1300–1381, 1405, 9000, 1205 and any unimplemented code return false (conservatively falls back to the default action).
 *
 * @param code 判定碼 / judge code
 * @param char 觸發角色 / acting character
 * @param battle 戰鬥（可選，部分判定會參考 turn 等）/ battle (optional; some codes inspect turn, etc.)
 * @returns 是否成立 / whether the condition holds
 */
export function DecideJudge(code: number, char: Character, battle?: unknown): boolean {
	// 預設動作碼：恆真
	if (code === 1000 || code === 1001) return true;

	// 1300–1381：文件記載為空殼（故意不觸發）
	if (code >= 1300 && code <= 1381) return false;

	// 1101：HP 百分比 <= 40
	if (code === 1101) return char.hpPercent() <= 40;

	// 1405：逃跑判定（預設不觸發，避免單體戰鬥異常逃跑）
	if (code === 1405) return false;

	// 1940：約 10% 機率（傷染/特殊觸發）
	if (code === 1940) return char.rng ? char.rng.randInt(0, 99) < 10 : false;

	// 9000：動作碼（非判定），視為不觸發判定
	if (code === 9000) return false;

	// 1205：HP 相關（預設不觸發，退回預設攻擊）
	if (code === 1205) return false;

	// 其餘未明確實作碼：保守視為條件未滿足，退回預設動作
	return false;
}
