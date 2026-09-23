// 戰鬥變數初始化 / Battle variable setup
// 對應 docs/log/battle/02 §1（SetBattleVariable）：初始化狀態、位置、能力補正與戰鬥屬性。

import { EnumState, EnumPosition } from '../constants';
import type { Character } from './Character';
import { BASE_STAT_COMP_MAP, PRIMARY_STATS } from './status-attrs';
import { skillPassive } from '../skill/passive';
import { CalcEquips } from '../item/equip';
import type { IDataRepository } from '../data/repository';
import type { RNG } from '../core/rng';

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
