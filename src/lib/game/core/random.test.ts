import { describe, it, expect } from 'vitest';
import { RNG } from './rng';
import { weightedPick } from './random';

describe('weightedPick', () => {
	it('matches documented weights over many draws (fixed seed)', () => {
		const rng = new RNG(2024);
		const entries: Array<[number, number]> = [
			[1000, 4],
			[1001, 3],
			[1002, 2],
			[1003, 1],
		];
		const n = 4000;
		const counts: Record<number, number> = { 1000: 0, 1001: 0, 1002: 0, 1003: 0 };
		for (let i = 0; i < n; i++) {
			const v = weightedPick(entries, rng);
			if (v !== undefined) counts[v]++;
		}
		const ratio1000 = counts[1000] / n;
		// 1000 權重 4 / 總和 10 = 40%
		expect(ratio1000).toBeGreaterThan(0.35);
		expect(ratio1000).toBeLessThan(0.45);
		expect(counts[1000]).toBeGreaterThan(counts[1003]);
	});

	it('returns undefined for empty entries', () => {
		expect(weightedPick([], new RNG(1))).toBeUndefined();
	});
});
