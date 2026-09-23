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

// 展示頁追加職業：法師 / Showcase job: Mage
const job200: IJobDef = {
	no: 200,
	job_name: 'Mage',
	equip: [EnumWeaponType.Staff, EnumWeaponType.Robe, EnumWeaponType.Book, EnumWeaponType.Cloth, EnumWeaponType.Item],
	coe: { maxhp: 2, maxsp: 1.5 },
	pattern: null,
	img: 'mon_018',
	info: { desc: '以魔法攻擊見長的遠程職業 / Ranged job specialised in magic attacks' },
};

// 展示頁追加職業：遊俠 / Showcase job: Ranger
const job300: IJobDef = {
	no: 300,
	job_name: 'Ranger',
	equip: [EnumWeaponType.Bow, EnumWeaponType.Sword, EnumWeaponType.Dagger, EnumWeaponType.Armor, EnumWeaponType.Cloth, EnumWeaponType.Item],
	coe: { maxhp: 2.5, maxsp: 0.8 },
	pattern: null,
	img: 'mon_019',
	info: { desc: '高敏捷的遠程物理職業 / High-agility physical ranged job' },
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

// 展示頁追加角色：劍士（近戰輸出）/ Showcase char: Swordman (melee DPS)
const char101: ICharDef = {
	no: 101, name: 'Swordman', level: 2, maxhp: 340, hp: 340, maxsp: 40, sp: 40,
	str: 14, int: 2, dex: 6, spd: 4, luk: 2, job: 100, skill: [1000],
	equip: { [EnumEquipSlot.MainHand]: 1000, [EnumEquipSlot.Armor]: 5000 },
	behavior: {
		position: EnumPosition.Front, guard: EnumGuardKind.Always,
		pattern: [{ judge: 1000, quantity: 0, action: 1000 }],
	},
	data_ex: { recruit_money: 2000 },
};

// 展示頁追加角色：法師（火焰範圍技）/ Showcase char: Mage (AoE fire spell)
const char102: ICharDef = {
	no: 102, name: 'Mage', level: 2, maxhp: 200, hp: 200, maxsp: 150, sp: 150,
	str: 4, int: 16, dex: 4, spd: 5, luk: 3, job: 200, skill: [1000, 2000],
	behavior: {
		position: EnumPosition.Back, guard: EnumGuardKind.Never,
		// 1940 約 10% 機率施放 FireStorm，其餘回退普攻（避免 SP 耗盡後空轉）
		// 1940 ~10% chance of FireStorm, otherwise basic attack (avoids stalling when SP runs out)
		pattern: [
			{ judge: 1940, quantity: 0, action: 2000 },
			{ judge: 1000, quantity: 0, action: 1000 },
		],
	},
	data_ex: { recruit_money: 3000 },
};

// 展示頁追加角色：遊俠（高速遠程）/ Showcase char: Ranger (fast ranged attacker)
const char103: ICharDef = {
	no: 103, name: 'Ranger', level: 3, maxhp: 260, hp: 260, maxsp: 60, sp: 60,
	str: 10, int: 4, dex: 14, spd: 8, luk: 4, job: 300, skill: [1000],
	equip: { [EnumEquipSlot.MainHand]: 1000, [EnumEquipSlot.Armor]: 5000 },
	behavior: {
		position: EnumPosition.Back, guard: EnumGuardKind.Never,
		pattern: [{ judge: 1000, quantity: 0, action: 1000 }],
	},
	data_ex: { recruit_money: 2500 },
};

// 展示頁追加角色：祭司（低血量時治療）/ Showcase char: Priest (heals at low HP)
const char104: ICharDef = {
	no: 104, name: 'Priest', level: 2, maxhp: 240, hp: 240, maxsp: 80, sp: 80,
	str: 5, int: 12, dex: 6, spd: 5, luk: 5, job: 100, skill: [1000, 3000],
	equip: { [EnumEquipSlot.Armor]: 5000 },
	behavior: {
		position: EnumPosition.Back, guard: EnumGuardKind.Never,
		// 1101：自身 HP ≤ 40% 時治療，否則普攻
		// 1101: heal while own HP <= 40%, otherwise basic attack
		pattern: [
			{ judge: 1101, quantity: 40, action: 3000 },
			{ judge: 1000, quantity: 0, action: 1000 },
		],
	},
	data_ex: { recruit_money: 2500 },
};

// 展示頁追加角色：狂戰士（高力量前衛）/ Showcase char: Berserker (high-STR front liner)
const char105: ICharDef = {
	no: 105, name: 'Berserker', level: 3, maxhp: 380, hp: 380, maxsp: 30, sp: 30,
	str: 16, int: 1, dex: 3, spd: 3, luk: 1, job: 100, skill: [1000],
	equip: { [EnumEquipSlot.MainHand]: 1000, [EnumEquipSlot.Armor]: 5000 },
	behavior: {
		position: EnumPosition.Front, guard: EnumGuardKind.Always,
		pattern: [{ judge: 1000, quantity: 0, action: 1000 }],
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

// 展示頁入門怪物：史萊姆（低威脅，供入門 encounter 使用）/ Showcase entry monster: Slime
const mon1002: IMonDef = {
	no: 1002, name: 'Slime', level: 1, maxhp: 60, hp: 60, maxsp: 5, sp: 5,
	str: 8, int: 1, dex: 5, spd: 4, luk: 1, skill: [1000],
	reward: { moneyhold: 10, exphold: 5, itemtable: {} },
	behavior: { position: EnumPosition.Front, guard: EnumGuardKind.Never, pattern: [{ judge: 1000, quantity: 0, action: 1000 }] },
};

/** 建立並填入範例資料的倉庫 / Build an in-memory repository seeded with sample data */
export function createSeedRepository(): IDataRepository {
	const repo = new InMemoryRepository();
	repo.addJob(job100);
	repo.addJob(job200);
	repo.addJob(job300);
	for (const s of skills) repo.addSkill(s);
	for (const it of items) repo.addItem(it);
	repo.addChar(char100);
	repo.addChar(char101);
	repo.addChar(char102);
	repo.addChar(char103);
	repo.addChar(char104);
	repo.addChar(char105);
	repo.addMon(mon1000);
	repo.addMon(mon1001);
	repo.addMon(mon1002);
	return repo;
}

/**
 * 範例資料集合（供測試直接引用）/ Seed data exports (for tests to import directly)
 * 包含職業、技能、角色與怪物定義。
 * Includes job, skill, character, and monster definitions.
 */
export const SEED = {
	job100, job200, job300,
	skills, items,
	char100, char101, char102, char103, char104, char105,
	mon1000, mon1001, mon1002,
	/** 可選角色集合（展示頁名冊）/ selectable chars (showcase roster) */
	chars: [char100, char101, char102, char103, char104, char105] satisfies ICharDef[],
	/** 怪物集合 / monster collection */
	mons: [mon1000, mon1001, mon1002] satisfies IMonDef[],
};
