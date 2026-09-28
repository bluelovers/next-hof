/**
 * JobDetailTable 展示用職業資料
 * JobDetailTable fixture job data
 *
 * 表格專用的測試職業資料（混合、高技能數量等場景）。
 * Test job data for table-specific scenarios (mixed, high skill count, etc.)
 */
import type { IJobData } from '../../src/components/game-data/GameDataTypes';
import { spriteUrlByFile } from './spriteCast';
import { skills } from './skills';
import { baseJobs, advancedJobs } from './gameDataJobs';

/** 混合職業資料 / Mixed job data */
export const mixedJobs: IJobData[] = [
	...baseJobs,
	...advancedJobs,
	{
		id: 401,
		name: 'Ranger',
		parentId: 400,
		description: '弓系上級職。<br />野生の知識に長けた弓使い。',
		spriteUrls: [spriteUrlByFile('mon_216.png'), spriteUrlByFile('mon_216y.png')],
		equipment: ['Dagger', 'Bow', 'Armor', 'Cloth', 'Item'],
		skills: [
			skills.arrowRain,
			skills.eagleEye,
		],
	},
];

/** 高技能數量職業 / High skill count job */
export const highSkillJob: IJobData[] = [
	{
		id: 999,
		name: 'MasterOfAll',
		parentId: 0,
		description: '萬能職業。<br />すべてのスキルを習得可能。',
		spriteUrls: [spriteUrlByFile('mon_999.png'), spriteUrlByFile('mon_999r.png')],
		equipment: ['All'],
		skills: [
			skills.fire,
			skills.ice,
			skills.lightning,
			skills.heal,
			skills.cure,
			skills.revive,
			skills.buff,
			skills.debuff,
		],
	},
];
