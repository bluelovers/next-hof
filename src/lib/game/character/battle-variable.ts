// 戰鬥變數初始化 / Battle variable setup
// 對應 docs/log/battle/02 §1（SetBattleVariable）：初始化狀態、位置、能力補正與戰鬥屬性。

import { EnumState, EnumPosition } from '../constants';
import type { Character } from './Character';
import { BASE_STAT_COMP_MAP, PRIMARY_STATS } from './status-attrs';
import { skillPassive } from '../skill/passive';
import { CalcEquips } from '../item/equip';
import type { IDataRepository } from '../data/repository';
import type { RNG } from '../core/rng';

/**
 * 戰鬥變數初始化 / Battle variable setup
 * 對應 docs/log/battle/02 §1（SetBattleVariable）：初始化狀態、位置、能力補正與戰鬥屬性。
 * Mirrors SetBattleVariable: initializes state, position, bonuses, and battle stats.
 *
 * 流程 / flow:
 * 1. STATE=Alive、POSITION 隨機前/後衛（IBehavior.position 不影響開戰站位）。
 *    STATE=Alive; POSITION randomly front/back (IBehavior.position does not decide it).
 * 2. 累加被動技能(skillPassive)與裝備(CalcEquips)補正。
 *    accumulate passive-skill (skillPassive) and equipment (CalcEquips) bonuses.
 * 3. 戰鬥六維 = 基礎值 + P_* 補正；MAXHP/MAXSP/HP/SP 乘 M_*% 再加 P_*。
 *    battle stats = base + P_*; MAXHP/MAXSP/HP/SP scale by M_*% then add P_*.
 * 4. HP/SP 上限夾制。
 *    clamp HP/SP to their caps.
 */
export function setBattleVariable(char: Character, repo: IDataRepository, rng: RNG): void {
	char.STATE = EnumState.Alive;
	char.POSITION = rng.randInt(0, 1) === 0 ? EnumPosition.Front : EnumPosition.Back;

	skillPassive(char, repo);
	CalcEquips(char, repo);

	for (const k of PRIMARY_STATS) {
		const m = BASE_STAT_COMP_MAP[k];
		char[m.battle] = char[k] + char[m.comp];
	}

	char.MAXHP = Math.round(char.maxhp * (1 + char.M_MAXHP / 100) + char.P_MAXHP);
	char.HP = Math.round(char.hp * (1 + char.M_MAXHP / 100) + char.P_MAXHP);
	char.MAXSP = Math.round(char.maxsp * (1 + char.M_MAXSP / 100) + char.P_MAXSP);
	char.SP = Math.round(char.sp * (1 + char.M_MAXSP / 100) + char.P_MAXSP);

	char.HP = Math.min(char.HP, char.MAXHP);
	char.SP = Math.min(char.SP, char.MAXSP);
}
