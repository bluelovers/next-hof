/**
 * GameData 展示用職業資料（單一事實來源）
 * GameData fixture job data (single source of truth)
 *
 * 所有 GameData 相關故事共用此資料，避免重複定義。
 * All GameData-related stories share this data to avoid duplication.
 *
 * 資料來源：PHP 頁面 http://localhost:8085/gamedata 實際輸出
 * Source: Actual output from PHP page http://localhost:8085/gamedata
 */
import type { IJobData, IGameDataPageData } from '../../src/components/game-data/GameDataTypes';
import { spriteUrlByFile, characterSprites } from './spriteCast';
import { skills } from './skills';

// ==================== 完整職業資料 / Complete job data ====================

/** 所有職業（PHP 頁面の實際データと一致） / All jobs (matches actual PHP page) */
export const allJobs: IJobData[] = [
	// === Warrior 系 ===
	{
		id: 100,
		name: 'Warrior',
		parentId: 0,
		description: '戦士系基本職。<br />そこそこ耐えて、攻撃もそこそこ。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobWarrior.file), spriteUrlByFile(characterSprites.jobWarrior.femaleFile)],
		equipment: ['Sword', 'TwoHandSword', 'Shield', 'Armor', 'Cloth', 'Robe', 'Item'],
		skills: [
		skills.doubleAttack,
		skills.stab,
		skills.fatalStab,
	],
	},
	{
		id: 101,
		name: 'RoyalGuard',
		parentId: 100,
		description: '戦士系上級職。<br />防御も攻撃も一回り強くなる。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobRoyalGuard.file), spriteUrlByFile(characterSprites.jobRoyalGuard.femaleFile)],
		equipment: ['Sword', 'TwoHandSword', 'Shield', 'Armor', 'Cloth', 'Robe', 'Item'],
		skills: [
		skills.fatalStab,
		skills.ragingBlow,
		skills.chargeAttack,
	],
	},
	{
		id: 102,
		name: 'Sacrier',
		parentId: 100,
		description: '戦士系上級職。<br />攻撃に特化した戦士。<br />自分の体力を犠牲に強力な技が使える。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobSacrier.file), spriteUrlByFile(characterSprites.jobSacrier.femaleFile)],
		equipment: ['Sword', 'TwoHandSword', 'Shield', 'Cloth', 'Robe', 'Item'],
		skills: [
		skills.obtainMind,
		skills.rush,
		skills.illness,
	],
	},
	{
		id: 103,
		name: 'WitchHunt',
		parentId: 100,
		description: '戦士系上級職。<br />相手の魔力を奪ったりする、やや変則的な戦士。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobWitchHunt.file), spriteUrlByFile(characterSprites.jobWitchHunt.femaleFile)],
		equipment: ['Sword', 'Dagger', 'Shield', 'Armor', 'Cloth', 'Robe', 'Item'],
		skills: [
		skills.weaponBreak,
		skills.manaBreak,
		skills.mindBreak,
	],
	},

	// === Sorcerer 系 ===
	{
		id: 200,
		name: 'Sorcerer',
		parentId: 0,
		description: '魔法系基本職。<br />撃たれ弱いが強い魔法が使える。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobSorcerer.file), spriteUrlByFile(characterSprites.jobSorcerer.femaleFile)],
		equipment: ['Wand', 'Staff', 'Book', 'Cloth', 'Robe', 'Item'],
		skills: [
		skills.fireBall,
		skills.firePillar,
		skills.hiManaRecharge,
	],
	},
	{
		id: 201,
		name: 'Warlock',
		parentId: 200,
		description: '魔法系上級職。<br />さらに強力な魔法が使えるようになる。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobWarlock.file), spriteUrlByFile(characterSprites.jobWarlock.femaleFile)],
		equipment: ['Wand', 'Staff', 'Book', 'Cloth', 'Robe', 'Item'],
		skills: [
		skills.blizzard,
		skills.icePrison,
		skills.paralysis,
	],
	},
	{
		id: 202,
		name: 'Summoner',
		parentId: 200,
		description: '魔法系上級職。<br />時間はかかるが強力な召喚獣を呼べる。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobSummoner.file), spriteUrlByFile(characterSprites.jobSummoner.femaleFile)],
		equipment: ['Wand', 'Staff', 'Book', 'Robe', 'Item'],
		skills: [
		skills.fireStorm,
		skills.paralysis,
		skills.summonLeviathan,
	],
	},
	{
		id: 203,
		name: 'Necromancer',
		parentId: 200,
		description: '魔法系上級職。<br />相手の能力を下げたり、ゾンビを作ったり出来る。<br />毒も扱える。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobNecromancer.file), spriteUrlByFile(characterSprites.jobNecromancer.femaleFile)],
		equipment: ['Wand', 'Staff', 'Book', 'Cloth', 'Robe', 'Item'],
		skills: [
		skills.icePrison,
		skills.thunderBolt,
		skills.raiseMummy,
	],
	},

	// === Priest 系 ===
	{
		id: 300,
		name: 'Priest',
		parentId: 0,
		description: '聖職基本職。<br />味方のHP,SPの回復ができる。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobPriest.file), spriteUrlByFile(characterSprites.jobPriest.femaleFile)],
		equipment: ['Wand', 'Book', 'Cloth', 'Robe', 'Item'],
		skills: [
		skills.partyHeal,
		skills.manaRecharge,
		skills.stanceRestore,
	],
	},
	{
		id: 301,
		name: 'Bishop',
		parentId: 300,
		description: '聖職上級職。<br />味方の能力値も上げれるようになる。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobBishop.file), spriteUrlByFile(characterSprites.jobBishop.femaleFile)],
		equipment: ['Wand', 'Book', 'Cloth', 'Robe', 'Item'],
		skills: [
		skills.quickHeal,
		skills.sanctuary,
		skills.charm,
	],
	},
	{
		id: 302,
		name: 'Druid',
		parentId: 300,
		description: '聖職上級職。<br />特殊な支援能力を持っている。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobDruid.file), spriteUrlByFile(characterSprites.jobDruid.femaleFile)],
		equipment: ['Wand', 'Book', 'Cloth', 'Robe', 'Item'],
		skills: [
		skills.healRabbit,
		skills.holyShield,
		skills.magicAsist,
	],
	},

	// === Hunter 系 ===
	{
		id: 400,
		name: 'Hunter',
		parentId: 0,
		description: '弓系基本職。<br />相手の前衛に影響されずに攻撃できる。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobHunter.file), spriteUrlByFile(characterSprites.jobHunter.femaleFile)],
		equipment: ['Bow', 'Cloth', 'Robe', 'Item'],
		skills: [
		skills.shoot,
		skills.powerShoot,
		skills.arrowShower,
	],
	},
	{
		id: 401,
		name: 'Sniper',
		parentId: 400,
		description: '弓系上級職。<br />さらに強力な攻撃が可能。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobSniper.file), spriteUrlByFile(characterSprites.jobSniper.femaleFile)],
		equipment: ['Bow', 'Cloth', 'Robe', 'Item'],
		skills: [
		skills.hurricaneShot,
		skills.aiming,
		skills.doubleShot,
	],
	},
	{
		id: 402,
		name: 'BeastTamer',
		parentId: 400,
		description: '弓系上級職。<br />素早い召喚と召喚獣の強化が得意。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobBeastTamer.file), spriteUrlByFile(characterSprites.jobBeastTamer.femaleFile)],
		equipment: ['Bow', 'Whip', 'Cloth', 'Robe', 'Item'],
		skills: [
		skills.powerShoot,
		skills.callFlyHippo,
		skills.fullSupport,
	],
	},
	{
		id: 403,
		name: 'Murderer',
		parentId: 400,
		description: '弓系上級職。<br />毒の扱いに長けた職業。',
		spriteUrls: [spriteUrlByFile(characterSprites.jobMurderer.file), spriteUrlByFile(characterSprites.jobMurderer.femaleFile)],
		equipment: ['Dagger', 'Bow', 'Armor', 'Cloth', 'Item'],
		skills: [
		skills.scatterKnife,
		skills.poisonBreath,
		skills.arrowShower,
	],
	},
];

// ==================== 衍生資料 / Derived data ====================

/** 完整職業頁面資料 / Complete job page data */
export const fullJobData: IGameDataPageData = { jobs: allJobs };

/** 基礎職業（parentId === 0） / Base jobs (parentId === 0) */
export const baseJobs: IJobData[] = allJobs.filter(j => j.parentId === 0);

/** 上級職業（parentId !== 0） / Advanced jobs (parentId !== 0) */
export const advancedJobs: IJobData[] = allJobs.filter(j => j.parentId !== 0);

/** Warrior 系職業 / Warrior job tree */
export const warriorJobs: IJobData[] = allJobs.filter(j => j.id >= 100 && j.id < 200);

/** Sorcerer 系職業 / Sorcerer job tree */
export const sorcererJobs: IJobData[] = allJobs.filter(j => j.id >= 200 && j.id < 300);

/** Priest 系職業 / Priest job tree */
export const priestJobs: IJobData[] = allJobs.filter(j => j.id >= 300 && j.id < 400);

/** Hunter 系職業 / Hunter job tree */
export const hunterJobs: IJobData[] = allJobs.filter(j => j.id >= 400 && j.id < 500);
