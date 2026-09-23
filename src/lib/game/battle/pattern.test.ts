import { describe, it, expect } from 'vitest';
import { RNG } from '../core/rng';
import { createSeedRepository } from '../data/seed-data';
import { newMon } from '../character/factory';
import { buildPattern, MultiFactJudge } from './pattern';

describe('IBehavior pattern (10.2)', () => {
	const repo = createSeedRepository();

	it('monster pattern prepends [1405,1,9000]+[1940,10,3040] and appends default 1000', () => {
		const mon = newMon(repo.getMon(1000)!, repo, new RNG(1));
		// mon1000 自身 pattern = [{judge:1000,quantity:0,action:1000}]
		const pattern = buildPattern(mon);
		expect(pattern[0]).toEqual({ judge: 1405, quantity: 1, action: 9000 });
		expect(pattern[1]).toEqual({ judge: 1940, quantity: 10, action: 3040 });
		expect(pattern[pattern.length - 1]).toEqual({ judge: 1000, quantity: 0, action: 1000 });
	});

	it('MultiFactJudge chains through judges to default action', () => {
		const mon = newMon(repo.getMon(1000)!, repo, new RNG(1));
		const pattern = buildPattern(mon);
		// turn 0：1405(false) → 1940(quantity 10 未達) → 預設 1000
		const action = MultiFactJudge(pattern, mon, { turn: 0 });
		expect(action).toBe(1000);
	});
});
