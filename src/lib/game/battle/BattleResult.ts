// 戰鬥結果 / Battle result
// 對應 docs/log/battle/02 §5（BattleResult）：依存活者判定勝/負/平。

import type { BattleTeam } from '../team/BattleTeam';


/**
 * 戰鬥結果 / Battle outcome
 * 列舉 / enumeration
 */
export enum EnumOutcome {
	/** 戰勝（敵方全滅）/ victory (enemy wiped out) */
	Win = 'win',
	/** 戰敗（己方全滅）/ defeat (own side wiped out) */
	Lose = 'lose',
	/** 平手（同歸於盡或超時雙方皆存活）/ draw (both wiped out, or both alive at timeout) */
	Draw = 'draw',
}

/**
 * 戰鬥結果承載物件 / Battle result carrier
 * 介面 / class
 */
export class BattleResult {
	/** 判定結果（team0 視角）/ outcome from team0's perspective */
	outcome: EnumOutcome;
	/** 已進行回合數 / turns played */
	turns: number;
	/** 延長次數 / number of extensions */
	extend: number;

	/**
	 * 建立戰鬥結果 / Create a battle result
	 * @param outcome 判定結果 / outcome
	 * @param turns 回合數 / turns
	 * @param extend 延長次數 / extensions
	 */
	constructor(outcome: EnumOutcome, turns: number, extend: number) {
		this.outcome = outcome;
		this.turns = turns;
		this.extend = extend;
	}
}

/**
 * 以 team0 視角判定結果 / Compute the outcome from team0's perspective
 *
 * 判定順序 / order:
 * 1. 雙方存活數皆為 0 → Draw（同歸於盡）/ both sides at 0 alive → Draw (mutual annihilation)
 * 2. 敵方（team1）存活數為 0 → Win / enemy (team1) wiped → Win
 * 3. 己方（team0）存活數為 0 → Lose / own side (team0) wiped → Lose
 * 4. 其餘（雙方皆存活，通常為超時）→ Draw / otherwise (both alive, usually timeout) → Draw
 */
export function computeOutcome(team0: BattleTeam, team1: BattleTeam): EnumOutcome {
	const a0 = team0.CountAlive();
	const a1 = team1.CountAlive();
	if (a0 === 0 && a1 === 0) return EnumOutcome.Draw;
	if (a1 === 0) return EnumOutcome.Win; // team0 存活，敵方全滅 / team0 alive, enemy wiped
	if (a0 === 0) return EnumOutcome.Lose; // team0 全滅 / team0 wiped
	return EnumOutcome.Draw; // 雙方皆存活（超時）/ both sides alive (timeout)
}
