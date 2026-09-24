// AI 判定碼 / AI judge codes
// 對應 docs/log/battle/02 §6 與 docs/log/battle/05 §3（DecideJudge）。
// 實作重點驗證碼：1101（HP% 閾值）、1940（約 10% 機率）；1300–1381 為空殼（回傳 false）。

import type { Character } from '../character/Character';
import {
	EnumJudgeCode,
	LOW_HP_THRESHOLD,
	SPECIAL_TRIGGER_CHANCE,
	isInEmptyShellRange,
	isDefaultAttackCode,
} from './judge-codes';

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
	if (isDefaultAttackCode(code)) return true;

	// 空殼判定碼範圍：文件記載為空殼（故意不觸發）
	if (isInEmptyShellRange(code)) return false;

	// 1101：HP 百分比 <= 40
	if (code === EnumJudgeCode.LowHp40) return char.hpPercent() <= LOW_HP_THRESHOLD;

	// 1405：逃跑判定（預設不觸發，避免單體戰鬥異常逃跑）
	if (code === EnumJudgeCode.Flee) return false;

	// 1940：約 10% 機率（傷染/特殊觸發）
	if (code === EnumJudgeCode.SpecialTrigger) return char.rng ? char.rng.randInt(0, 99) < SPECIAL_TRIGGER_CHANCE : false;

	// 9000：動作碼（非判定），視為不觸發判定
	if (code === EnumJudgeCode.ActionCode) return false;

	// 1205：HP 相關（預設不觸發，退回預設攻擊）
	if (code === EnumJudgeCode.HpRelated) return false;

	// 其餘未明確實作碼：保守視為條件未滿足，退回預設動作
	return false;
}
