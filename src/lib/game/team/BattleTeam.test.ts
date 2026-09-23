import { describe, it, expect } from 'vitest';
import { RNG } from '../core/rng';
import { EnumState } from '../constants';
import { Character } from '../character/Character';
import { BattleTeam } from './BattleTeam';

function mk(no: number, types: Character['types']): Character {
	return new Character({
		no, name: `c${no}`, types: Array.from(types), level: 1,
		str: 10, int: 10, dex: 10, spd: 10, luk: 10, maxhp: 100, maxsp: 50,
	});
}

describe('BattleTeam (8.1)', () => {
	it('counts exclude dead and summons; pickList draws independently', () => {
		const rng = new RNG(1);
		const team = new BattleTeam('0');
		const c1 = mk(1, new Set(['char']));
		const c2 = mk(2, new Set(['char']));
		const summon = mk(3, new Set(['mon', 'summon']));
		team.add(c1); team.add(c2); team.add(summon);

		expect(team.CountAlive()).toBe(2); // 召喚物不計入
		expect(team.CountAliveChars()).toBe(2);
		expect(team.CountTrueChars()).toBe(2);
		expect(team.CountDead()).toBe(0);

		c1.STATE = EnumState.Dead;
		expect(team.CountAlive()).toBe(1);
		expect(team.CountDead()).toBe(1);

		const list = team.pickList(20, rng);
		expect(list.length).toBe(20);
		expect(list.every((c) => c.STATE !== EnumState.Dead)).toBe(true);
	});
});
