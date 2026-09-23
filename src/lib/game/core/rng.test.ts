import { describe, it, expect } from 'vitest';
import { RNG } from './rng';

describe('RNG', () => {
	it('reproduces identical sequence for same seed', () => {
		const a = new RNG(12345);
		const b = new RNG(12345);
		for (let i = 0; i < 10; i++) {
			expect(a.randInt(0, 99)).toBe(b.randInt(0, 99));
		}
	});

	it('randInt is inclusive on both ends', () => {
		const rng = new RNG(7);
		for (let i = 0; i < 200; i++) {
			const v = rng.randInt(0, 99);
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThanOrEqual(99);
		}
	});

	it('shuffle returns a permutation', () => {
		const rng = new RNG(99);
		const src = [1, 2, 3, 4, 5];
		const out = rng.shuffle(src);
		expect(out.slice().sort((x, y) => x - y)).toEqual(src);
		expect(src).toEqual([1, 2, 3, 4, 5]); // 原陣列不被改變
	});
});
