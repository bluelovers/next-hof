// 敵方隊伍生成 / Enemy party generation
// 對應 docs/log/battle/04 §6.1（EnemyNumber）與 §6.2（EnemyParty）。

import type { Character } from '../character/Character';
import type { IDataRepository } from '../data/repository';
import type { RNG } from '../core/rng';
import { weightedPick, type IWeightedEntry } from '../core/random';
import { newMon } from '../character/factory';
import { levelFix } from '../character/level-fix';

// party size → [min, max] 敵人數（top_level>5 時取區間隨機）
const ENEMY_TABLE: Record<number, [number, number]> = {
	1: [1, 3],
	2: [2, 4],
	3: [3, 6],
	4: [4, 8],
	5: [5, 10],
};

/**
 * 依隊伍人數與 top_level 決定敵人數量
 * Decide the enemy count from party size and top_level
 *
 * party 夾至 1–5 查表；top_level ≤ 5 取下限，否則在 [min, max] 內隨機。
 * Clamps party to 1–5 for the table; top_level ≤ 5 takes the minimum, otherwise rolls in [min, max].
 */
export function EnemyNumber(party: number, topLevel: number, rng: RNG): number {
	const p = Math.min(Math.max(party, 1), 5);
	const [minN, maxN] = ENEMY_TABLE[p];
	if (topLevel <= 5) return minN;
	return rng.randInt(minN, maxN);
}

/**
 * 建立敵方隊伍：從 monsterList 中加權抽取並以 level_fix 調整至 topLevel。
 * monsterList 為 [monsterNo, weight] 陣列。
 *
 * Build the enemy party: weighted-picks from monsterList and level_fix-es each to topLevel.
 * monsterList is an array of [monster number, weight].
 */
export function EnemyParty(
	repo: IDataRepository,
	amount: number,
	monsterList: IWeightedEntry<number>[],
	topLevel: number,
	rng: RNG,
): Character[] {
	const enemies: Character[] = [];
	for (let i = 0; i < amount; i++) {
		const no = weightedPick(monsterList, rng);
		if (no === undefined) break;
		const def = repo.getMon(no);
		if (!def) continue;
		const e = newMon(def, repo, rng);
		levelFix(e, topLevel - e.level, rng); // 調整至 topLevel（大幅提升時隨機削減）
		enemies.push(e);
	}
	return enemies;
}
