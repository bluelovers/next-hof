/**
 * JobTree 展示用職業資料（單一事實來源）
 * JobTree fixture job data (single source of truth)
 *
 * 各故事展示用的獨立職業樹資料（簡化版，skills 留空），集中管理避免重複定義。
 * Individual job-tree showcase data (simplified, empty skills), centralized to avoid duplication.
 */
import type { IJobData } from '../../src/components/game-data/GameDataTypes';

/** 戰士系職業資料 / Warrior job data */
export const jobTreeWarriorJobs: IJobData[] = [
	{
		id: 100,
		name: 'Warrior',
		parentId: 0,
		description: '戦士系基本職。',
		spriteUrls: ['mon_079.png', 'mon_080r.png'],
		equipment: ['Sword', 'TwoHandSword', 'Shield', 'Armor', 'Cloth', 'Robe', 'Item'],
		skills: [],
	},
	{
		id: 101,
		name: 'RoyalGuard',
		parentId: 100,
		description: '戦士系上級職。<br />防御も攻撃も一回り強くなる。',
		spriteUrls: ['mon_199r.png', 'mon_234r.png'],
		equipment: ['Sword', 'TwoHandSword', 'Shield', 'Armor', 'Cloth', 'Robe', 'Item'],
		skills: [],
	},
	{
		id: 102,
		name: 'Sacrier',
		parentId: 100,
		description: '戦士系上級職。<br />攻撃に特化した戦士。<br />自分の体力を犠牲に強力な技が使える。',
		spriteUrls: ['mon_100r.png', 'mon_012.png'],
		equipment: ['Sword', 'TwoHandSword', 'Shield', 'Cloth', 'Robe', 'Item'],
		skills: [],
	},
];

/** 法師系職業資料 / Sorcerer job data */
export const jobTreeSorcererJobs: IJobData[] = [
	{
		id: 200,
		name: 'Sorcerer',
		parentId: 0,
		description: '魔術系基本職。',
		spriteUrls: ['mon_201.png', 'mon_202.png'],
		equipment: ['Wand', 'Staff', 'Robe', 'Cloth', 'Orb', 'Item'],
		skills: [],
	},
	{
		id: 201,
		name: 'Warlock',
		parentId: 200,
		description: '魔術系上級職。<br />攻撃魔術に特化している。',
		spriteUrls: ['mon_210.png', 'mon_211.png'],
		equipment: ['Wand', 'Staff', 'Robe', 'Cloth', 'Orb', 'Item'],
		skills: [],
	},
	{
		id: 202,
		name: 'Summoner',
		parentId: 200,
		description: '魔術系上級職。<br />使い魔を呼び出す事ができる。',
		spriteUrls: ['mon_212.png', 'mon_213.png'],
		equipment: ['Wand', 'Staff', 'Robe', 'Cloth', 'Orb', 'Item'],
		skills: [],
	},
	{
		id: 203,
		name: 'Necromancer',
		parentId: 200,
		description: '魔術系上級職。<br />死靈を使役する。',
		spriteUrls: ['mon_215.png', 'mon_215z.png'],
		equipment: ['Wand', 'Staff', 'Robe', 'Cloth', 'Orb', 'Item'],
		skills: [],
	},
];

/** 完整職業樹資料 / Complete job tree data */
export const jobTreeCompleteJobs: IJobData[] = [
	...jobTreeWarriorJobs,
	{
		id: 103,
		name: 'WitchHunt',
		parentId: 100,
		description: '戦士系上級職。<br />魔術に対抗する力を持つ。',
		spriteUrls: ['mon_219r.png', 'mon_113.png'],
		equipment: ['Sword', 'Spear', 'Shield', 'Armor', 'Cloth', 'Robe'],
		skills: [],
	},
	...jobTreeSorcererJobs,
	{
		id: 300,
		name: 'Priest',
		parentId: 0,
		description: '回復系基本職。<br />パーティーの回復を担当する。',
		spriteUrls: ['mon_203.png', 'mon_204.png'],
		equipment: ['Wand', 'Mace', 'Robe', 'Cloth', 'Shield', 'Item'],
		skills: [],
	},
	{
		id: 301,
		name: 'Bishop',
		parentId: 300,
		description: '回復系上級職。<br />より強力な回復魔術が使える。',
		spriteUrls: ['mon_205.png', 'mon_206.png'],
		equipment: ['Wand', 'Mace', 'Robe', 'Cloth', 'Shield', 'Item'],
		skills: [],
	},
	{
		id: 302,
		name: 'Druid',
		parentId: 300,
		description: '回復系上級職。<br />自然の力を借りた回復を行う。',
		spriteUrls: ['mon_207.png', 'mon_208.png'],
		equipment: ['Wand', 'Mace', 'Robe', 'Cloth', 'Item'],
		skills: [],
	},
	{
		id: 303,
		name: 'Paladin',
		parentId: 300,
		description: '回復系上級職。<br />聖なる力で攻守両面に秀でる。',
		spriteUrls: ['mon_209.png', 'mon_209z.png'],
		equipment: ['Sword', 'TwoHandSword', 'Shield', 'Robe', 'Cloth', 'Item'],
		skills: [],
	},
	{
		id: 400,
		name: 'Archer',
		parentId: 0,
		description: '弓系基本職。',
		spriteUrls: ['mon_214.png', 'mon_214y.png'],
		equipment: ['Dagger', 'Bow', 'Armor', 'Cloth', 'Item'],
		skills: [],
	},
	{
		id: 401,
		name: 'Ranger',
		parentId: 400,
		description: '弓系上級職。<br />野生の知識に長けた弓使い。',
		spriteUrls: ['mon_216.png', 'mon_216y.png'],
		equipment: ['Dagger', 'Bow', 'Armor', 'Cloth', 'Item'],
		skills: [],
	},
	{
		id: 402,
		name: 'Assassin',
		parentId: 400,
		description: '弓系上級職。<br />闇に潜む暗殺者。',
		spriteUrls: ['mon_217.png', 'mon_217z.png'],
		equipment: ['Dagger', 'Bow', 'Armor', 'Cloth', 'Item'],
		skills: [],
	},
	{
		id: 403,
		name: 'Murderer',
		parentId: 400,
		description: '弓系上級職。<br />毒の扱いに長けた職業。',
		spriteUrls: ['mon_216y.png', 'mon_217rz.png'],
		equipment: ['Dagger', 'Bow', 'Armor', 'Cloth', 'Item'],
		skills: [],
	},
];

/** 深層嵌套職業樹 / Deep-nested job tree */
export const jobTreeDeepNested: IJobData[] = [
	{
		id: 1,
		name: 'Base',
		parentId: 0,
		description: '基礎職業',
		spriteUrls: ['mon_001.png'],
		equipment: ['Sword'],
		skills: [],
	},
	{
		id: 2,
		name: 'Level1',
		parentId: 1,
		description: '第一級上級職業',
		spriteUrls: ['mon_002.png'],
		equipment: ['Sword', 'Shield'],
		skills: [],
	},
	{
		id: 3,
		name: 'Level2',
		parentId: 2,
		description: '第二級上級職業',
		spriteUrls: ['mon_003.png'],
		equipment: ['Sword', 'Shield', 'Armor'],
		skills: [],
	},
	{
		id: 4,
		name: 'Level3',
		parentId: 3,
		description: '第三級上級職業',
		spriteUrls: ['mon_004.png'],
		equipment: ['Sword', 'Shield', 'Armor', 'Robe'],
		skills: [],
	},
];