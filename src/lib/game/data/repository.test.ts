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

	// 展示頁 roster：6 名玩家角色、2 個新職業、入門怪物（OpenSpec 任務 2.1）
	// Showcase roster: 6 player chars, 2 new jobs, entry monster (OpenSpec task 2.1)
	it('seed repository loads showcase roster additions', () => {
		const repo = createSeedRepository();
		expect(repo.getJob(200)?.job_name).toBe('Mage');
		expect(repo.getJob(300)?.job_name).toBe('Ranger');
		expect(repo.getCharBase(101)?.name).toBe('Swordman');
		expect(repo.getCharBase(102)?.name).toBe('Mage');
		expect(repo.getCharBase(103)?.name).toBe('Ranger');
		expect(repo.getCharBase(104)?.name).toBe('Priest');
		expect(repo.getCharBase(105)?.name).toBe('Berserker');
		expect(repo.getMon(1002)?.name).toBe('Slime');
		// 名冊固定 6 人（驗證 spec「選 1–5 人」的來源資料）
		// Roster is exactly 6 (source data for spec's "pick 1–5" rule)
		expect(SEED.chars).toHaveLength(6);
	});
});
