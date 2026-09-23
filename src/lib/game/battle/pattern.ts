// 行為模式組裝 / IBehavior pattern assembly
// 對應 docs/log/battle/04 §4.2（buildPattern / MultiFactJudge）。

import type { Character } from '../character/Character';
import type { IPatternItem } from '../types';
import { DecideJudge } from './judge';

/**
 * 組裝角色完整 pattern：
 *  - 前置 [1405,1,9000]（逃跑）、[1940,10,3040]（特殊/復活）
 *  - 中間：角色自身 behavior.pattern
 *  - 末尾：預設 [1000,0,1000]
 *
 * Assemble a character's full pattern:
 *  - prelude [1405,1,9000] (flee) and [1940,10,3040] (special/revive)
 *  - middle: the character's own behavior.pattern
 *  - tail: default [1000,0,1000]
 */
export function buildPattern(char: Character): IPatternItem[] {
	const base = char.behavior?.pattern ? char.behavior.pattern.slice() : [];
	const pattern: IPatternItem[] = [];
	pattern.push({ judge: 1405, quantity: 1, action: 9000 });
	pattern.push({ judge: 1940, quantity: 10, action: 3040 });
	for (const p of base) pattern.push(p);
	pattern.push({ judge: 1000, quantity: 0, action: 1000 });
	return pattern;
}

/**
 * 依 pattern 選擇動作碼。
 * quantity 為觸發門檻：0 表示恆可觸發；否則需 battle.turn >= quantity。
 * 第一個判定通過且達門檻者回傳其 action；皆不通過回傳 null。
 *
 * Pick an action code from the pattern.
 * quantity is the trigger threshold: 0 always qualifies, otherwise battle.turn >= quantity.
 * Returns the action of the first item whose judge passes and threshold is met; null if none.
 */
export function MultiFactJudge(keys: IPatternItem[], char: Character, battle?: { turn: number }): number | null {
	const turn = battle?.turn ?? 0;
	for (const item of keys) {
		if (item.quantity === 0 || turn >= item.quantity) {
			if (DecideJudge(item.judge, char, battle)) return item.action;
		}
	}
	return null;
}
