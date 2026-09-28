/**
 * YAML 轉換器測試 / YAML converter tests
 * 測試資料來自 fixtures（`test/fixtures/Resource`，為實際 HOF Resource 檔案的原樣副本），
 * 統一經由 yaml-load 的 loader 讀取——不在測試內硬編碼資源內容。
 * Test data lives in fixtures (`test/fixtures/Resource`, verbatim copies of the real HOF
 * Resource files) and is read through the yaml-load loaders — no resource content is
 * hardcoded inside the tests.
 */

import { describe, it, expect } from 'vitest';
import { EnumEquipSlot, EnumGuardKind } from '#/lib/game/types';
import { EnumPosition } from '#/lib/game/constants';
import { TEST_FIXTURES_ROOT } from '#/yaml-paths';
import { loadAllChars, loadAllMons, loadCharYaml, loadMonYaml } from './yaml-load';
import {
	convertCharYaml,
	convertMonYaml,
	toNumber,
	toOptionalNumber,
	toNumberArray,
	toNumberRecord,
	convertEquipYaml,
	convertBehaviorYaml,
} from './yaml-convert';
import type { IRawCharYaml, IRawMonYaml } from './yaml-types';

/**
 * 載入角色 fixture；缺檔時拋出具體路徑的錯誤（避免 non-null assertion 產生無意義訊息）。
 * Load a char fixture; throws with the concrete missing path instead of a bare non-null
 * assertion that would surface as an unrelated "undefined" error later.
 */
function mustLoadChar(no: number): IRawCharYaml
{
	return mustLoad(() => loadCharYaml(no, TEST_FIXTURES_ROOT), 'Char', no);
}

/**
 * 載入怪物 fixture；缺檔時拋出具體路徑的錯誤 / Load a mon fixture; throws with the concrete missing path.
 */
function mustLoadMon(no: number): IRawMonYaml
{
	return mustLoad(() => loadMonYaml(no, TEST_FIXTURES_ROOT), 'Mon', no);
}

/** 缺檔錯誤的共通收斂 / shared failure path for missing fixtures */
function mustLoad<T>(load: () => T | undefined, kind: string, no: number): T
{
	const raw = load();
	if (!raw)
	{
		throw new Error(`測試 fixture 缺失 / missing test fixture: ${kind}/${kind.toLowerCase()}.${no}.yml`);
	}
	return raw;
}

describe('yaml-load (fixtures)', () =>
{
	it('loads a single char by number', () =>
	{
		expect(mustLoadChar(100).name).toBe('Warrior');
	});

	it('loads a single mon by number', () =>
	{
		expect(mustLoadMon(1000).name).toBe('GoblinAxe');
	});

	it('returns undefined for a missing file', () =>
	{
		expect(loadMonYaml(9999, TEST_FIXTURES_ROOT)).toBeUndefined();
		expect(loadCharYaml(9999, TEST_FIXTURES_ROOT)).toBeUndefined();
	});

	it('lists every fixture of a kind sorted by number', () =>
	{
		expect(loadAllChars(TEST_FIXTURES_ROOT).map((c) => c.no)).toEqual([100, 400]);
		expect(loadAllMons(TEST_FIXTURES_ROOT).map((m) => m.no)).toEqual([1000, 1010, 1055, 2000, 5006]);
	});

	it('normalizes numeric strings to numbers on load', () =>
	{
		expect(mustLoadChar(100)).toMatchObject({
			level: 1,
			maxhp: 300,
			job: 100,
			skill: [1000, 1001],
		});
	});
});

describe('number coercion helpers', () =>
{
	it('toNumber coerces quoted strings and tolerates null', () =>
	{
		expect(toNumber('1')).toBe(1);
		expect(toNumber('140')).toBe(140);
		expect(toNumber(30400)).toBe(30400);
		expect(toNumber(null)).toBe(0);
		expect(toNumber(undefined)).toBe(0);
		expect(toNumber('abc')).toBe(0);
		expect(toNumber('abc', 7)).toBe(7);
	});

	it('toOptionalNumber returns undefined for absent/garbage', () =>
	{
		expect(toOptionalNumber('0')).toBe(0);
		expect(toOptionalNumber(null)).toBeUndefined();
		expect(toOptionalNumber(undefined)).toBeUndefined();
		expect(toOptionalNumber('')).toBeUndefined();
	});

	it('toNumberArray coerces arrays of strings', () =>
	{
		expect(toNumberArray(['20', 10, '0'])).toEqual([20, 10, 0]);
		expect(toNumberArray(null)).toEqual([]);
	});

	it('toNumberRecord maps string-keyed records to number keys', () =>
	{
		expect(toNumberRecord({ '6000': '1000', '7100': '100' })).toEqual({ 6000: 1000, 7100: 100 });
	});
});

describe('convertCharYaml (fixtures)', () =>
{
	it('char.100: 完整轉換結果 / full conversion output', () =>
	{
		expect(convertCharYaml(mustLoadChar(100))).toEqual({
			no: 100,
			name: 'Warrior',
			level: 1,
			exp: 0,
			maxhp: 300,
			hp: 300,
			maxsp: 50,
			sp: 50,
			str: 10,
			int: 2,
			dex: 4,
			spd: 4,
			luk: 1,
			job: 100,
			skill: [1000, 1001],
			data_ex: { recruit_money: 2000 },
			equip: {
				[EnumEquipSlot.MainHand]: 1000,
				[EnumEquipSlot.OffHand]: 3000,
				[EnumEquipSlot.Armor]: 5000,
			},
			behavior: {
				position: EnumPosition.Front,
				guard: EnumGuardKind.Always,
				pattern: [
					{ judge: 1205, quantity: 8, action: 1001 },
					{ judge: 1000, quantity: 0, action: 1000 },
				],
			},
		});
	});

	it('char.400: 缺戰鬥數值保持 undefined（不補 0）/ missing battle stats stay undefined', () =>
	{
		expect(convertCharYaml(mustLoadChar(400))).toEqual({
			no: 400,
			name: 'Hunter',
			level: 1,
			exp: 0,
			str: 2,
			int: 2,
			dex: 10,
			spd: 6,
			luk: 1,
			job: 400,
			skill: [2300, 2310],
			data_ex: { recruit_money: 4000 },
			equip: {
				[EnumEquipSlot.MainHand]: 2000,
				[EnumEquipSlot.Armor]: 5100,
			},
			behavior: {
				position: EnumPosition.Back,
				guard: EnumGuardKind.Never,
				pattern: [
					{ judge: 1205, quantity: 28, action: 2310 },
					{ judge: 1000, quantity: 0, action: 2300 },
				],
			},
		});
	});
});

describe('convertMonYaml (fixtures)', () =>
{
	it('mon.1000: 完整轉換結果 / full conversion output', () =>
	{
		expect(convertMonYaml(mustLoadMon(1000))).toEqual({
			no: 1000,
			name: 'GoblinAxe',
			img: 'mon_053',
			level: 1,
			maxhp: 140,
			hp: 140,
			maxsp: 80,
			sp: 80,
			str: 8,
			int: 3,
			dex: 5,
			spd: 5,
			luk: 1,
			atk: [20, 10],
			def: [10, 3, 5, 0],
			info: { desc: 'SPがあるときは、強い攻撃をたまにしてくる程度。' },
			reward: {
				moneyhold: 40,
				exphold: 20,
				itemtable: { 6000: 1000, 6001: 1000, 6002: 600, 6003: 200, 7100: 100 },
			},
			behavior: {
				guard: EnumGuardKind.Life75,
				pattern: [
					{ judge: 1940, quantity: 50, action: 9000 },
					{ judge: 1205, quantity: 40, action: 1017 },
					{ judge: 1000, quantity: 0, action: 1000 },
				],
			},
		});
	});

	it('mon.1010 (Bat): 缺數值保持 undefined（不補 0）、空 pattern 無行為規則 / missing stats stay undefined, empty pattern → no rules', () =>
	{
		expect(convertMonYaml(mustLoadMon(1010))).toEqual({
			no: 1010,
			name: 'Bat',
			img: 'mon_121',
			level: 10,
		});
	});

	it('mon.2000 (union): 獨特怪物欄位完整轉換 / union fields fully converted', () =>
	{
		expect(convertMonYaml(mustLoadMon(2000))).toEqual({
			no: 2000,
			name: 'DragonFleets',
			img: 'mon_013r',
			level: 250,
			maxhp: 30400,
			hp: 30400,
			maxsp: 3000,
			sp: 3000,
			str: 200,
			int: 180,
			dex: 100,
			spd: 150,
			luk: 50,
			special: { PoisonResist: 50 },
			atk: [100, 70],
			def: [60, 30, 50, 30],
			cycle: 259200,
			land: 'swamp2',
			lv_limit: 250,
			servant: {
				1028: [100, 0],
				1030: [100, 0],
				1031: [100, 0],
				1032: [100, 0],
				1033: [100, 0],
			},
			reward: {
				moneyhold: 10133,
				exphold: 15200,
				itemtable: { 6800: 5000, 6801: 5000 },
			},
			behavior: {
				position: EnumPosition.Back,
				guard: EnumGuardKind.Never,
				pattern: [
					{ judge: 1201, quantity: 30, action: 9000 },
					{ judge: 1940, quantity: 50, action: 3011 },
					{ judge: 1000, quantity: 0, action: 5038 },
				],
			},
		});
	});

	it('mon.5006 (undead): SPECIAL.Undead true → 1 / undead flag coerced to 1', () =>
	{
		expect(convertMonYaml(mustLoadMon(5006))).toEqual({
			no: 5006,
			name: 'Mummy',
			img: 'mon_146',
			level: 10,
			maxhp: 450,
			hp: 450,
			maxsp: 0,
			sp: 0,
			str: 450,
			int: 1,
			dex: 1,
			spd: 10,
			luk: 1,
			special: { Undead: 1 },
			atk: [20, 10],
			def: [10, 10, 0, 0],
			reward: { moneyhold: 0, exphold: 0 },
			behavior: {
				position: EnumPosition.Front,
				guard: EnumGuardKind.Prob50,
				pattern: [{ judge: 1000, quantity: 0, action: 1000 }],
			},
		});
	});

	it('mon.1055: guard 筆誤 pro50 → prob50、quantity null → 0 / typo guard normalized, null quantity → 0', () =>
	{
		expect(convertMonYaml(mustLoadMon(1055))).toEqual({
			no: 1055,
			name: 'EvilPlant',
			img: 'mon_127',
			level: 29,
			maxhp: 450,
			hp: 450,
			maxsp: 120,
			sp: 120,
			str: 60,
			int: 60,
			dex: 40,
			spd: 10,
			luk: 10,
			atk: [20, 20],
			def: [20, 20, 30, 20],
			reward: { moneyhold: 90, exphold: 390 },
			behavior: {
				guard: EnumGuardKind.Prob50,
				pattern: [{ judge: 1000, quantity: 0, action: 1000 }],
			},
		});
	});
});

describe('convertEquipYaml / convertBehaviorYaml', () =>
{
	it('ignores unknown equip slots (values already normalized by the loader)', () =>
	{
		const equip = convertEquipYaml({ main_hand: 1000, not_a_slot: 999 } as Partial<Record<string, number>>);
		expect(equip).toEqual({ [EnumEquipSlot.MainHand]: 1000 });
	});

	it('empty object behavior → undefined（空 pattern 已於載入視為 undefined）', () =>
	{
		expect(convertBehaviorYaml({ pattern: undefined })).toBeUndefined();
		expect(convertBehaviorYaml({})).toBeUndefined();
		expect(convertBehaviorYaml(null)).toBeUndefined();
		expect(convertBehaviorYaml(undefined)).toBeUndefined();
	});

	it('position-only behavior keeps position without guard/pattern', () =>
	{
		const b = convertBehaviorYaml({ position: EnumPosition.Front });
		expect(b).toEqual({ position: EnumPosition.Front });
	});
});