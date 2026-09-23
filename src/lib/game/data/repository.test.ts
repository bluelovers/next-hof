import { describe, it, expect } from 'vitest';
import { InMemoryRepository } from './repository';
import { createSeedRepository, SEED } from './seed-data';

describe('IDataRepository', () => {
	it('InMemoryRepository returns records by key and undefined for missing', () => {
		const repo = new InMemoryRepository();
		repo.addSkill(SEED.skills[0]);
		expect(repo.getSkill(1000)?.name).toBe('Attack');
		expect(repo.getSkill(9999)).toBeUndefined();
		expect(repo.getJob(1)).toBeUndefined();
		expect(repo.getItem(1)).toBeUndefined();
		expect(repo.getMon(1)).toBeUndefined();
		expect(repo.getCharBase(1)).toBeUndefined();
	});

	it('seed repository loads representative records', () => {
		const repo = createSeedRepository();
		expect(repo.getJob(100)?.job_name).toBe('Warrior');
		expect(repo.getSkill(1000)?.name).toBe('Attack');
		expect(repo.getItem(1000)?.name).toBe('ShortSword');
		expect(repo.getCharBase(100)?.name).toBe('Warrior');
		expect(repo.getMon(1000)?.name).toBe('GoblinAxe');
		expect(repo.getMon(1001)?.level).toBe(39);
	});
});
