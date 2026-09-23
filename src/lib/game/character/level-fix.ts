// 怪物等級調整 / Monster level adjustment
// 對應 docs/log/battle/03 §10 與 docs/log/battle/04 §6.3。
// 僅對怪物生效；玩家角色不受影響（回傳 false）。

import type { Character } from './Character';
import { PRIMARY_STATS } from './status-attrs';
import type { RNG } from '../core/rng';

export function levelFix(char: Character, delta = 0, rng?: RNG): boolean {
	if (char.isChar()) return false; // 玩家角色不調整

	const oldLv = char.level;
	char.level = Math.max(1, char.level + delta);
	const div = char.level / oldLv;

	if (div !== 1) {
		let factor = div;

		// 大幅等級提升（>10倍）時，成長倍率隨機削減（50%~175%）
		if (delta > 0 && div > 10) {
			const r = rng ?? char.rng;
			const reduce = r ? r.randInt(0, 5) : 0;
			const mult = r ? r.randFloat() * 1.25 + 0.5 : 1; // 0.5 ~ 1.75
			factor = (factor - reduce) * mult;
		}

		for (const k of PRIMARY_STATS) {
			char[k] = Math.ceil(char[k] * factor);
		}
		char.maxhp = Math.ceil(char.maxhp * factor);
		char.maxsp = Math.ceil(char.maxsp * factor);
		char.hp = char.maxhp;
		char.sp = char.maxsp;
	}

	return true;
}
