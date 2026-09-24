import { describe, it, expect } from 'vitest';
import { EnumPosition, EnumTeamSide } from '../constants';
import { EnumCharType, EnumGuardKind } from '../types';
import { Character } from '../character/Character';
import { createSeedRepository } from '../data/seed-data';
import { BattleTeam } from '../team/BattleTeam';
import { Defending } from './guard';

function mk(no: number): Character {
	return new Character({
		no, name: `c${no}`, types: [EnumCharType.Mon], level: 1,
		str: 10, int: 10, dex: 10, spd: 10, luk: 10, maxhp: 100, maxsp: 50,
	});
}

describe('Guard (9.3)', () => {
	const repo = createSeedRepository();
	const normal = repo.getSkill(1000)!; // enemy/individual, 非 invalid
	const invalid = { ...repo.getSkill(1000)!, invalid: 1 };

	it('back-row target guarded by alive front always-guard; invalid hits directly', () => {
		const team = new BattleTeam(EnumTeamSide.Team1);
		const front = mk(1);
		front.POSITION = EnumPosition.Front;
		front.behavior = { guard: EnumGuardKind.Always };
		const back = mk(2);
		back.POSITION = EnumPosition.Back;
		back.behavior = { guard: EnumGuardKind.Always };
		team.add(front); team.add(back);

		expect(Defending(team, back, normal)).toBe(front);
		expect(Defending(team, back, invalid)).toBeNull(); // 貫穿命中後排
		expect(Defending(team, front, normal)).toBeNull(); // 前排本身無守護
	});
});
