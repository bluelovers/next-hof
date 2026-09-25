import { describe, it, expect } from 'vitest';
import { Character } from './Character';
import { EnumState } from '../constants';
import { EnumCharType } from '../types';
import type { RNG } from '../core/rng';
import { getPoison } from './status';
import { getPoisonOriginal } from './status.original';

describe('getPoisonOriginal (對照原始 PHP GetPoison)', () => {
	const makeChar = () =>
		new Character({
			no: 1, name: 'c', types: [EnumCharType.Char], level: 1,
			str: 10, int: 10, dex: 10, spd: 10, luk: 10, maxhp: 300, maxsp: 50,
		});

	it('無抗毒 → 設定 STATE_Poison2（與移植版 getPoison 的 STATE_Poison 不同）', () => {
		const c = makeChar();
		const r = getPoisonOriginal(c, 100);
		expect(r).toBe(true);
		expect(c.STATE).toBe(EnumState.Poison2);

		// 移植版一律 STATE_Poison
		const c2 = makeChar();
		getPoison(c2, 100);
		expect(c2.STATE).toBe(EnumState.Poison);
	});

	it('已中毒 → false', () => {
		const c = makeChar();
		c.STATE = EnumState.Poison;
		expect(getPoisonOriginal(c, 100)).toBe(false);
	});

	it('有抗毒且機率抵抗 → BLOCK（STATE 不變）', () => {
		const c = makeChar();
		c.SPECIAL.PoisonResist = 50;
		const rng = { randInt: () => 99 } as unknown as RNG; // 99 >= chance(50) → 抵抗
		expect(getPoisonOriginal(c, 100, rng)).toBe('BLOCK');
		expect(c.STATE).not.toBe(EnumState.Poison);
		expect(c.STATE).not.toBe(EnumState.Poison2);
	});

	it('有抗毒且機率成功 → STATE_Poison（與無抗毒的 POISON2 不同）', () => {
		const c = makeChar();
		c.SPECIAL.PoisonResist = 50;
		const rng = { randInt: () => 0 } as unknown as RNG; // 0 < chance(50) → 成功
		expect(getPoisonOriginal(c, 100, rng)).toBe(true);
		expect(c.STATE).toBe(EnumState.Poison);
	});
});
