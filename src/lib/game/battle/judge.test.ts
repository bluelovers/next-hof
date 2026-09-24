import { describe, it, expect } from 'vitest';
import { RNG } from '../core/rng';
import { Character } from '../character/Character';
import { DecideJudge } from './judge';
import { EnumJudgeCode } from './judge-codes';
import { EnumCharType } from '../types';

describe('AI judge (10.1)', () => {
	function mk(): Character {
		return new Character({
			no: 1, name: 'c', types: [EnumCharType.Char], level: 1,
			str: 10, int: 10, dex: 10, spd: 10, luk: 10, maxhp: 100, maxsp: 50,
		});
	}

	it('1101 passes at HP% 40 and fails above', () => {
		const c = mk();
		c.MAXHP = 100; c.HP = 40;
		expect(DecideJudge(EnumJudgeCode.LowHp40, c)).toBe(true);
		c.HP = 41;
		expect(DecideJudge(EnumJudgeCode.LowHp40, c)).toBe(false);
	});

	it('1940 passes ~10% with a fixed seed', () => {
		const rng = new RNG(5);
		const c = mk();
		c.rng = rng;
		let cnt = 0;
		const N = 2000;
		for (let i = 0; i < N; i++) if (DecideJudge(EnumJudgeCode.SpecialTrigger, c)) cnt++;
		const ratio = cnt / N;
		expect(ratio).toBeGreaterThan(0.05);
		expect(ratio).toBeLessThan(0.15);
	});

	it('1300–1381 are empty-shell (non-matching)', () => {
		const c = mk();
		expect(DecideJudge(1350, c)).toBe(false);
	});
});
