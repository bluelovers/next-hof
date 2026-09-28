/**
 * JobDetailCard 展示用職業資料
 * JobDetailCard fixture job data
 *
 * 各故事展示用的獨立職業資料。
 * Individual job data for each story showcase.
 */
import type { IJobData } from '../../src/components/game-data/GameDataTypes';
import { spriteUrlByFile } from './spriteCast';
import { skills } from './skills';

/** 基本職業卡片 / Basic job card */
export const basicJob: IJobData = {
	id: 1,
	parentId: 0,
	name: '戦士',
	spriteUrls: [spriteUrlByFile('warrior.png')],
	description: 'HPが高く、攻撃力も高い。重装備で防御力も高い。',
	equipment: ['剣', '盾', '鎧'],
	skills: [
		skills.slash,
	],
};

/** 多精靈職業 / Job with multiple sprites */
export const multipleSpritesJob: IJobData = {
	id: 2,
	parentId: 0,
	name: '魔法使い',
	spriteUrls: [spriteUrlByFile('mon_106.png'), spriteUrlByFile('mon_018.png')],
	description: 'MPが高く、魔法攻撃が得意。防御力は低い。',
	equipment: ['杖', 'ローブ'],
	skills: [
		skills.flame,
		skills.healJp,
	],
};

/** 多技能職業 / Job with multiple skills */
export const multipleSkillsJob: IJobData = {
	id: 3,
	parentId: 0,
	name: '弓使い',
	spriteUrls: [spriteUrlByFile('mon_216.png')],
	description: '遠距離攻撃が得意。敏捷性が高い。',
	equipment: ['弓', '皮鎧'],
	skills: [
		skills.multiShot,
		skills.snipe,
		skills.bind,
	],
};

/** 交替背景色用職業 / Job for alternating background */
export const alternatingBgJob: IJobData = {
	id: 4,
	parentId: 0,
	name: '僧侶',
	spriteUrls: [spriteUrlByFile('mon_213.png')],
	description: '回復とサポートが得意。HPとMPが高い。',
	equipment: ['杖', '祭服'],
	skills: [
		skills.healJp,
	],
};

/** 長描述職業 / Job with long description */
export const longDescJob: IJobData = {
	id: 5,
	parentId: 0,
	name: '聖騎士',
	spriteUrls: [spriteUrlByFile('mon_199r.png')],
	description: '攻撃と防御の両方に長けている。信仰心が強く、魔法も少しだけ使える。味方を守ることに長けている。',
	equipment: ['聖剣', '盾', '聖鎧', '聖盾'],
	skills: [
		skills.holy,
		skills.protection,
	],
};
