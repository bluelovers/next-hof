/**
 * 其他資源（Item/Job/Skill）轉換 + 文字 id loader 測試 / converters for the other kinds
 * 測試資料來自 fixtures（test/fixtures/Resource），經由 yaml-load 讀取。
 * Test data comes from fixtures (test/fixtures/Resource), read through yaml-load.
 */

import { describe, it, expect } from 'vitest';
import {
	EnumGender,
	EnumItemCategory,
	EnumSkillDamageType,
	EnumTargetMethod,
	EnumTargetType,
	EnumWeaponType,
} from '#/lib/game/types';
import { TEST_FIXTURES_ROOT } from '#/yaml-paths';
import {
	loadGuardYaml,
	loadItemYaml,
	loadJobYaml,
	loadLandYaml,
	loadSkillYaml,
	loadUnionYaml,
	loadAllGuards,
	loadAllUnions,
} from './yaml-load';
import { convertItemYaml, convertJobYaml, convertSkillYaml } from './yaml-convert';
import type { IRawItemYaml, IRawJobYaml, IRawSkillYaml } from './yaml-types';

/** 載入 fixture 的通用 helper（缺檔拋出具體路徑）/ shared fixture loader (throws with the missing path) */
function mustLoad<T>(load: () => T | undefined, file: string): T
{
	const raw = load();
	if (!raw) throw new Error(`測試 fixture 缺失 / missing test fixture: ${file}`);
	return raw;
}

const mustLoadItem = (no: number) => mustLoad(() => loadItemYaml(no, TEST_FIXTURES_ROOT), `Item/item.${no}.yml`);
const mustLoadJob = (no: number) => mustLoad(() => loadJobYaml(no, TEST_FIXTURES_ROOT), `Job/job.${no}.yml`);
const mustLoadSkill = (no: number) => mustLoad(() => loadSkillYaml(no, TEST_FIXTURES_ROOT), `Skill/skill.${no}.yml`);

describe('yaml-load (string-id kinds)', () =>
{
	it('loads Guard/Land/Union by textual id', () =>
	{
		expect(loadGuardYaml('always', TEST_FIXTURES_ROOT)?.no).toBe('always');
		expect(loadLandYaml('ac0', TEST_FIXTURES_ROOT)?.no).toBe('ac0');
		expect(loadUnionYaml('0000', TEST_FIXTURES_ROOT)?.no).toBe('0000');
	});

	it('returns undefined for a missing id', () =>
	{
		expect(loadGuardYaml('never', TEST_FIXTURES_ROOT)).toBeUndefined();
		expect(loadLandYaml('zzz', TEST_FIXTURES_ROOT)).toBeUndefined();
	});

	it('lists textual-id kinds sorted lexicographically', () =>
	{
		expect(loadAllGuards(TEST_FIXTURES_ROOT).map((g) => g.no)).toEqual(['always']);
		expect(loadAllUnions(TEST_FIXTURES_ROOT).map((u) => u.no)).toEqual(['0000']);
	});
});

describe('convertItemYaml (fixtures)', () =>
{
	it('item.1000: full conversion output', () =>
	{
		expect(convertItemYaml(mustLoadItem(1000))).toEqual({
			no: 1000,
			name: 'ShortSword',
			type: EnumWeaponType.Sword,
			type2: EnumItemCategory.Weapon,
			img: 'we_sword026',
			buy: 500,
			atk: [10, 0],
			handle: 1,
			need: { 6001: 4 },
			base_name: 'ShortSword',
		});
	});

	it('item.3000: type2 GUARD → Armor; def slots coerced', () =>
	{
		expect(convertItemYaml(mustLoadItem(3000))).toEqual({
			no: 3000,
			name: 'WoodShield',
			type: EnumWeaponType.Shield,
			type2: EnumItemCategory.Armor,
			img: 'shield_001m',
			buy: 1000,
			def: [5, 5, 0, 0],
			handle: 1,
			need: { 6001: 1, 6020: 4 },
			base_name: 'WoodShield',
		});
	});
});

describe('convertJobYaml (fixtures)', () =>
{
	it('job.100: full conversion output (gender 1/2 → Male/Female)', () =>
	{
		expect(convertJobYaml(mustLoadJob(100))).toEqual({
			no: 100,
			job_name: 'Warrior',
			equip: [
				EnumWeaponType.Sword,
				EnumWeaponType.TwoHandSword,
				EnumWeaponType.Shield,
				EnumWeaponType.Armor,
				EnumWeaponType.Cloth,
				EnumWeaponType.Robe,
				EnumWeaponType.Item,
			],
			coe: { maxhp: 3, maxsp: 0.5 },
			pattern: null,
			img: 'mon_079',
			gender: {
				[EnumGender.Male]: { img: 'mon_079', job_name: 'Warrior' },
				[EnumGender.Female]: { img: 'mon_080r', job_name: 'Warrior' },
			},
			info: { desc: '戦士系基本職。\nそこそこ耐えて、攻撃もそこそこ。' },
		});
	});
});

describe('convertSkillYaml (fixtures)', () =>
{
	it('skill.1000: full conversion output', () =>
	{
		expect(convertSkillYaml(mustLoadSkill(1000))).toEqual({
			no: 1000,
			name: 'Attack',
			img: 'skill_042',
			exp: '通常攻撃',
			sp: 0,
			type: EnumSkillDamageType.Physical,
			learn: 0,
			target: [EnumTargetType.Enemy, EnumTargetMethod.Individual, 1],
			pow: 100,
		});
	});

	it('skill.1101: support true → 1, Plus* coerced, self target', () =>
	{
		expect(convertSkillYaml(mustLoadSkill(1101))).toEqual({
			no: 1101,
			name: 'ObtainSpeed',
			img: 'skill_057',
			exp: '早さ上昇',
			sp: 0,
			type: EnumSkillDamageType.Physical,
			learn: 2,
			target: [EnumTargetType.Self, EnumTargetMethod.Individual, 1],
			support: 1,
			sacrifice: 25,
			PlusSPD: 100,
		});
	});

	it('skill.1220: friend/all target tuple', () =>
	{
		expect(convertSkillYaml(mustLoadSkill(1220))).toEqual({
			no: 1220,
			name: 'AntiPoisoning',
			img: 'item_026b',
			exp: '毒耐性+50%',
			sp: 80,
			type: EnumSkillDamageType.Physical,
			learn: 5,
			target: [EnumTargetType.Friend, EnumTargetMethod.All, 1],
		});
	});
});

describe('createYamlRepository (fixtures, all kinds)', () =>
{
	it('registers skill/item/job/char/mon from the fixture root', async () =>
	{
		const { createYamlRepository } = await import('./yaml-repository');
		const { repo } = createYamlRepository(TEST_FIXTURES_ROOT);

		expect(repo.getSkill(1000)?.name).toBe('Attack');
		expect(repo.getSkill(1220)?.name).toBe('AntiPoisoning');
		expect(repo.getItem(1000)?.name).toBe('ShortSword');
		expect(repo.getItem(3000)?.name).toBe('WoodShield');
		expect(repo.getJob(100)?.job_name).toBe('Warrior');
		expect(repo.getCharBase(100)?.name).toBe('Warrior');
		expect(repo.getMon(2000)?.name).toBe('DragonFleets');
		expect(repo.getSkill(9999)).toBeUndefined();
	});
});