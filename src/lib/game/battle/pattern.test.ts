import { describe, it, expect } from 'vitest';
import { RNG } from '../core/rng';
import { createSeedRepository } from '../data/seed-data';
import { newMon } from '../character/factory';
import { buildPattern, MultiFactJudge } from './pattern';
import { EnumJudgeCode, REVIVE_SKILL_NO } from './judge-codes';

describe('IBehavior pattern (10.2)', () => {
	const repo = createSeedRepository();

	it('monster pattern prepends flee+special and appends default attack', () => {
		const mon = newMon(repo.getMon(1000)!, repo, new RNG(1));
		const pattern = buildPattern(mon);
		expect(pattern[0]).toEqual({ judge: EnumJudgeCode.Flee, quantity: 1, action: EnumJudgeCode.ActionCode });
		expect(pattern[1]).toEqual({ judge: EnumJudgeCode.SpecialTrigger, quantity: 10, action: REVIVE_SKILL_NO });
		expect(pattern[pattern.length - 1]).toEqual({ judge: EnumJudgeCode.DefaultAttack, quantity: 0, action: EnumJudgeCode.DefaultAttack });
	});

	it('MultiFactJudge chains through judges to default action', () => {
		const mon = newMon(repo.getMon(1000)!, repo, new RNG(1));
		const pattern = buildPattern(mon);
		const action = MultiFactJudge(pattern, mon, { turn: 0 });
		expect(action).toBe(EnumJudgeCode.DefaultAttack);
	});
});
