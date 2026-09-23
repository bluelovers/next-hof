// 範例資料 / Representative seed data
// 欄位對應 docs/data/*.md 分析的 YAML 結構。數值僅作為系統運作範例，
// 非完整遊戲設定/數值平衡（留待 YAML 匯入變更）。

import { EnumWeaponType, EnumTargetType, EnumTargetMethod, EnumEquipSlot, EnumGuardKind, type ISkillDef, type IItemDef, type IJobDef, type ICharDef, type IMonDef } from '../types';
import { EnumPosition } from '../constants';
import { InMemoryRepository, type IDataRepository } from './repository';

// 職業 / Jobs
const job100: IJobDef = {
	no: 100,
	job_name: 'Warrior',
	equip: [EnumWeaponType.Sword, EnumWeaponType.TwoHandSword, EnumWeaponType.Shield, EnumWeaponType.Armor, EnumWeaponType.Cloth, EnumWeaponType.Robe, EnumWeaponType.Item],
	coe: { maxhp: 3, maxsp: 0.5 },
	pattern: null,
	img: 'mon_079',
	gender: {
		1: { img: 'mon_079', job_name: 'Warrior' },
		2: { img: 'mon_080r', job_name: 'Warrior' },
	},
	info: { desc: '職業描述文字' },
};

// 技能 / Skills
const skills: ISkillDef[] = [
	{
		no: 1000, name: 'Attack', exp: '通常攻撃', sp: 0, type: 0,
		target: [EnumTargetType.Enemy, EnumTargetMethod.Individual, 1], pow: 100,
	},
	{
		no: 2000, name: 'FireStorm', exp: '施展火焰风暴', sp: 70, type: 1,
		target: [EnumTargetType.Enemy, EnumTargetMethod.Multi, 6], pow: 100, invalid: 1, charge: [70, 0],
	},
	{
		no: 3000, name: 'Healing', exp: '治療', sp: 5, type: 0,
		target: [EnumTargetType.Friend, EnumTargetMethod.Individual, 1], pow: 200, support: 1,
	},
	{
		no: 3040, name: 'Revive', exp: '蘇生', sp: 0, type: 0,
		target: [EnumTargetType.Friend, EnumTargetMethod.Individual, 1], pow: 100, revive: 1,
	},
];

// 物品 / Items
const items: IItemDef[] = [
	{
		no: 1000, name: 'ShortSword', type: EnumWeaponType.Sword, type2: 'WEAPON', img: 'we_sword026',
		buy: 500, atk: [10, 0], def: [0, 0, 0, 0], handle: 1, need: { 6001: 4 }, base_name: 'ShortSword',
	},
	{
		no: 3000, name: 'WoodShield', type: EnumWeaponType.Shield, type2: 'ARMOR', img: 'we_shield001',
		buy: 200, atk: [0, 0], def: [5, 5, 0, 0], handle: 1, need: { 6001: 1, 6020: 4 }, base_name: 'WoodShield',
	},
	{
		no: 5000, name: 'ClothArmor', type: EnumWeaponType.Armor, type2: 'ARMOR', img: 'ar_cloth001',
		buy: 300, atk: [0, 0], def: [3, 0, 3, 0], handle: 2, need: {}, base_name: 'ClothArmor',
	},
];

// 玩家基礎角色 / Player base chars
const char100: ICharDef = {
	no: 100, name: 'Warrior', level: 1, maxhp: 300, hp: 300, maxsp: 50, sp: 50,
	str: 10, int: 2, dex: 4, spd: 4, luk: 1, job: 100, skill: [1000, 1001],
	equip: { [EnumEquipSlot.MainHand]: 1000, [EnumEquipSlot.OffHand]: 3000, [EnumEquipSlot.Armor]: 5000 },
	behavior: {
		position: EnumPosition.Front, guard: EnumGuardKind.Always,
		pattern: [
			{ judge: 1205, quantity: 8, action: 1001 },
			{ judge: 1000, quantity: 0, action: 1000 },
		],
	},
	data_ex: { recruit_money: 2000 },
};

// 怪物 / Monsters
const mon1000: IMonDef = {
	no: 1000, name: 'GoblinAxe', level: 1, maxhp: 140, hp: 140, maxsp: 10, sp: 10,
	str: 20, int: 2, dex: 10, spd: 8, luk: 2, skill: [1000],
	reward: { moneyhold: 50, exphold: 30, itemtable: {} },
	behavior: { position: EnumPosition.Front, guard: EnumGuardKind.Always, pattern: [{ judge: 1000, quantity: 0, action: 1000 }] },
};

const mon1001: IMonDef = {
	no: 1001, name: 'DarkElfHunter', level: 39, maxhp: 580, hp: 580, maxsp: 80, sp: 80,
	str: 60, int: 50, dex: 40, spd: 35, luk: 10, skill: [2000],
	reward: { moneyhold: 200, exphold: 120, itemtable: {} },
	behavior: { position: EnumPosition.Back, guard: EnumGuardKind.Never, pattern: [{ judge: 1000, quantity: 0, action: 2000 }] },
};

/** 建立並填入範例資料的倉庫 / Build an in-memory repository seeded with sample data */
export function createSeedRepository(): IDataRepository {
	const repo = new InMemoryRepository();
	repo.addJob(job100);
	for (const s of skills) repo.addSkill(s);
	for (const it of items) repo.addItem(it);
	repo.addChar(char100);
	repo.addMon(mon1000);
	repo.addMon(mon1001);
	return repo;
}

/**
 * 範例資料集合（供測試直接引用）/ Seed data exports (for tests to import directly)
 * 包含職業、技能、角色與怪物定義。
 * Includes job, skill, character, and monster definitions.
 */
export const SEED = { job100, skills, items, char100, mon1000, mon1001 };
