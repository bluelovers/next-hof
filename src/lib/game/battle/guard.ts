// 守護邏輯 / Guard logic
// 對應 docs/log/battle/02 §4（Defending）：後排單體/群體攻擊被前排守護者攔截。

import { EnumState, EnumPosition } from '../constants';
import type { Character } from '../character/Character';
import type { BattleTeam } from '../team/BattleTeam';
import type { ISkillDef } from '../types';
import { EnumGuardKind, EnumTargetType, GUARD_KIND_PROBABILITY, GUARD_KIND_HP_THRESHOLD } from '../types';

/**
 * 依守護種類判斷前排守護者是否當前生效
 * Whether the front-row guardian is currently active, per its guard kind
 *
 * Always/Never 為恆真/恆假；Life25/50/75 依 HP% 門檻；
 * Prob25/50/75 以 randInt(0,99) 擲出百分比機率（無 rng 時視為 false）。
 * Always/Never are constant; Life25/50/75 check an HP% threshold;
 * Prob25/50/75 roll randInt(0,99) against a percentage chance (false without an rng).
 * 機率與閾值皆取自 GUARD_KIND_PROBABILITY / GUARD_KIND_HP_THRESHOLD 單一事實來源。
 */
export function guardActive(guardChar: Character): boolean {
	const kind = guardChar.behavior?.guard ?? EnumGuardKind.Always;
	switch (kind) {
		case EnumGuardKind.Always: return true;
		case EnumGuardKind.Never: return false;
		case EnumGuardKind.Life25: return guardChar.hpPercent() <= (GUARD_KIND_HP_THRESHOLD[kind] ?? 0);
		case EnumGuardKind.Life50: return guardChar.hpPercent() <= (GUARD_KIND_HP_THRESHOLD[kind] ?? 0);
		case EnumGuardKind.Life75: return guardChar.hpPercent() <= (GUARD_KIND_HP_THRESHOLD[kind] ?? 0);
		case EnumGuardKind.Prob25: return guardChar.rng ? guardChar.rng.randInt(0, 99) < (GUARD_KIND_PROBABILITY[kind] ?? 0) : false;
		case EnumGuardKind.Prob50: return guardChar.rng ? guardChar.rng.randInt(0, 99) < (GUARD_KIND_PROBABILITY[kind] ?? 0) : false;
		case EnumGuardKind.Prob75: return guardChar.rng ? guardChar.rng.randInt(0, 99) < (GUARD_KIND_PROBABILITY[kind] ?? 0) : false;
		default: return true;
	}
}

/**
 * 若目標位於後排且技能非全體/貫穿/支援，則回傳可攔截的前排守護者；
 * 否則回傳 null（直接命中目標）。
 * If the target is in the back row and the skill is not all/guard-piercing/support,
 * returns the intercepting front-row guardian; otherwise null (target is hit directly).
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
