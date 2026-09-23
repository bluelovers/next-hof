import { describe, it, expect } from 'vitest';
import { createSeedRepository } from '../data/seed-data';
import { coeMaxHp, equipAllowed } from './job';
import { EnumWeaponType } from '../types';

describe('job system (5.1)', () => {
	const repo = createSeedRepository();
	const job = repo.getJob(100)!;

	it('coeMaxHp matches the documented formula (coe.maxhp=3, str=10, level=1)', () => {
		// 100*3*1*(1 + (250-10)^2 / 250^2) = 300 * 1.0784 = 323.52
		expect(coeMaxHp(job, 10, 1)).toBeCloseTo(323.52, 1);
	});

	it('equipAllowed reflects job.equip list', () => {
		expect(equipAllowed(job, EnumWeaponType.Sword)).toBe(true);
		expect(equipAllowed(job, EnumWeaponType.Bow)).toBe(false);
	});
});
