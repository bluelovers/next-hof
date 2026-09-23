// 戰鬥結果 / Battle result
// 對應 docs/log/battle/02 §5（BattleResult）：依存活者判定勝/負/平。

import type { BattleTeam } from '../team/BattleTeam';


/**
 * 戰鬥結果 / Battle outcome
 * 列舉 / enumeration
 */
export enum EnumOutcome {
	Win = 'win',
	Lose = 'lose',
	Draw = 'draw',
}

export class BattleResult {
	outcome: EnumOutcome;
	turns: number;
	extend: number;

	constructor(outcome: EnumOutcome, turns: number, extend: number) {
		this.outcome = outcome;
		this.turns = turns;
		this.extend = extend;
	}
}

/** 以 team0 視角判定結果 */
export function computeOutcome(team0: BattleTeam, team1: BattleTeam): EnumOutcome {
	const a0 = team0.CountAlive();
	const a1 = team1.CountAlive();
	if (a0 === 0 && a1 === 0) return EnumOutcome.Draw;
	if (a1 === 0) return EnumOutcome.Win; // team0 存活，敵方全滅
	if (a0 === 0) return EnumOutcome.Lose; // team0 全滅
	return EnumOutcome.Draw; // 雙方皆存活（超時）
}
