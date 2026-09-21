/**
 * JobDetailTable 展示用職業資料
 * JobDetailTable fixture job data
 *
 * 表格專用的測試職業資料（混合、高技能數量等場景）。
 * Test job data for table-specific scenarios (mixed, high skill count, etc.)
 */
import type { IJobData } from '../../src/components/game-data/GameDataTypes';
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
    spriteUrls: ['/image/char/mon_216.png', '/image/char/mon_216y.png'],
    equipment: ['Dagger', 'Bow', 'Armor', 'Cloth', 'Item'],
    skills: [
      { name: 'ArrowRain', iconUrl: '', target: 'enemy', scope: 'multi', sp: 35, powerPct: 120, hits: 3, hitRate: '30:50' },
      { name: 'EagleEye', iconUrl: '', target: 'self', scope: 'normal', sp: 20, effect: '命中率大幅上昇' },
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
    spriteUrls: ['/image/char/mon_999.png', '/image/char/mon_999r.png'],
    equipment: ['All'],
    skills: [
      { name: 'Fire', iconUrl: '', target: 'enemy', scope: 'normal', sp: 8, powerPct: 150, hits: 1, hitRate: '20:20', skillType: 'magic' },
      { name: 'Ice', iconUrl: '', target: 'enemy', scope: 'normal', sp: 8, powerPct: 140, hits: 1, hitRate: '25:25', skillType: 'magic' },
      { name: 'Lightning', iconUrl: '', target: 'enemy', scope: 'normal', sp: 8, powerPct: 160, hits: 1, hitRate: '15:30', skillType: 'magic' },
      { name: 'Heal', iconUrl: '', target: 'friend', scope: 'normal', sp: 10, effect: 'HP回復', skillType: 'magic', isSupport: true },
      { name: 'Cure', iconUrl: '', target: 'friend', scope: 'normal', sp: 6, effect: '状態異常回復', curePoison: true },
      { name: 'Revive', iconUrl: '', target: 'friend', scope: 'normal', sp: 60, effect: '味方一人を復活', skillType: 'magic' },
      { name: 'Buff', iconUrl: '', target: 'friend', scope: 'all', sp: 40, effect: '全能力上昇', skillType: 'magic' },
      { name: 'Debuff', iconUrl: '', target: 'enemy', scope: 'all', sp: 40, effect: '全能力低下', skillType: 'magic' },
    ],
  },
];
