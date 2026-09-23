import { describe, it, expect } from 'vitest';
import { RNG } from '../core/rng';
import { createSeedRepository } from '../data/seed-data';
import { EnemyNumber, EnemyParty } from './enemy';

describe('Enemy generation (8.2)', () => {
	const repo = createSeedRepository();

	it('EnemyNumber: 1 member / top_level<=5 → 1; >5 → 1..3', () => {
		const rng = new RNG(2);
		expect(EnemyNumber(1, 3, rng)).toBe(1);
		for (let i = 0; i < 50; i++) {
			const n = EnemyNumber(1, 50, rng);
			expect(n).toBeGreaterThanOrEqual(1);
			expect(n).toBeLessThanOrEqual(3);
		}
	});

	it('EnemyParty boosts level into [floor(diff/3), round(diff+5)]', () => {
		const rng = new RNG(3);
		// mon1001 基礎 level 39，目標 50（div<=10 → 無隨機削減，精確為 50）
		const enemies = EnemyParty(repo, 1, [[1001, 1]], 50, rng);
		const e = enemies[0];
		const diff = 50 - 39;
		expect(e.level).toBeGreaterThanOrEqual(39 + Math.floor(diff / 3));
		expect(e.level).toBeLessThanOrEqual(39 + Math.round(diff + 5));
		expect(e.level).toBe(50);
	});
});
