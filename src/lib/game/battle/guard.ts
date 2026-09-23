// 守護邏輯 / Guard logic
// 對應 docs/log/battle/02 §4（Defending）：後排單體/群體攻擊被前排守護者攔截。

import { EnumState, EnumPosition } from '../constants';
import type { Character } from '../character/Character';
import type { BattleTeam } from '../team/BattleTeam';
import type { ISkillDef } from '../types';
import { EnumGuardKind, EnumTargetType } from '../types';

/** 依守護種類判斷前排守護者是否當前生效 */
export function guardActive(guardChar: Character): boolean {
	const kind = guardChar.behavior?.guard ?? EnumGuardKind.Always;
	switch (kind) {
		case EnumGuardKind.Always: return true;
		case EnumGuardKind.Never: return false;
		case EnumGuardKind.Life25: return guardChar.hpPercent() <= 25;
		case EnumGuardKind.Life50: return guardChar.hpPercent() <= 50;
		case EnumGuardKind.Life75: return guardChar.hpPercent() <= 75;
		case EnumGuardKind.Prob25: return guardChar.rng ? guardChar.rng.randInt(0, 99) < 25 : false;
		case EnumGuardKind.Prob50: return guardChar.rng ? guardChar.rng.randInt(0, 99) < 50 : false;
		case EnumGuardKind.Prob75: return guardChar.rng ? guardChar.rng.randInt(0, 99) < 75 : false;
		default: return true;
	}
}

/**
 * 若目標位於後排且技能非全體/貫穿/支援，則回傳可攔截的前排守護者；
 * 否則回傳 null（直接命中目標）。
 */
export function Defending(team: BattleTeam, target: Character, skill: ISkillDef): Character | null {
	if (skill.target?.[0] === EnumTargetType.All) return null;
	if (skill.invalid) return null;
	if (skill.support) return null;
	if (target.POSITION === EnumPosition.Front) return null;
	if (target.STATE === EnumState.Dead) return null;

	const guard = team.members.find(
		(g) => g.STATE !== EnumState.Dead && g.POSITION === EnumPosition.Front && guardActive(g),
	);
	return guard ?? null;
}
