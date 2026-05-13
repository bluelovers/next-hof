/**
 * JobDetailTable Storybook 故事
 * JobDetailTable Storybook stories
 *
 * 展示職業詳細表格組件的各種狀態與配置
 * Showcases job detail table component in various states and configurations
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { JobDetailTable } from '../../src/components/GameDataPage/JobDetailTable';
import type { IJobData } from '../../src/components/GameDataPage/GameDataTypes';

/** 背景裝飾器 — 模擬遊戲深色背景 / Dark game background decorator */
const DarkDecorator = (Story: React.FC) => (
  <div
    style={{
      backgroundColor: '#10151b',
      padding: '30px',
      minHeight: '500px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      fontFamily: "'メイリオ', Meiryo, 'MS PGothic', Verdana, sans-serif",
    }}
  >
    <Story />
  </div>
);

const meta: Meta<typeof JobDetailTable> = {
  title: 'GameDataPage/JobDetailTable',
  component: JobDetailTable,
  parameters: {
    docs: {
      description: {
        component:
          '職業詳細表格組件，顯示職業詳細資料的表格容器。\nJob detail table component that handles the container for displaying job detail data.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [DarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ==================== Mock 資料 ==================== */

/** 基礎職業資料 / Base job data */
const baseJobs: IJobData[] = [
  {
    id: 100,
    name: 'Warrior',
    parentId: 0,
    description: '戦士系基本職。',
    spriteUrls: ['mon_079.png', 'mon_080r.png'],
    equipment: ['Sword', 'TwoHandSword', 'Shield', 'Armor', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'Bash', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 8, powerPct: 160, hits: 1, hitRate: '20:20' },
      { name: 'DoubleAttack', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 15, powerPct: 90, hits: 2 },
      { name: 'FirstAid', iconUrl: '', target: 'self', scope: 'individual', spCost: 0, effect: '自己HP回復' },
    ],
  },
  {
    id: 200,
    name: 'Sorcerer',
    parentId: 0,
    description: '魔術系基本職。',
    spriteUrls: ['mon_201.png', 'mon_202.png'],
    equipment: ['Wand', 'Staff', 'Robe', 'Cloth', 'Orb', 'Item'],
    skills: [
      { name: 'Fire', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 8, powerPct: 150, hits: 1, hitRate: '20:20' },
      { name: 'Heal', iconUrl: '', target: 'friend', scope: 'individual', spCost: 10, effect: 'HP回復' },
    ],
  },
  {
    id: 300,
    name: 'Priest',
    parentId: 0,
    description: '回復系基本職。<br />パーティーの回復を担当する。',
    spriteUrls: ['mon_203.png', 'mon_204.png'],
    equipment: ['Wand', 'Mace', 'Robe', 'Cloth', 'Shield', 'Item'],
    skills: [
      { name: 'Heal', iconUrl: '', target: 'friend', scope: 'individual', spCost: 8, effect: 'HP回復' },
      { name: 'Cure', iconUrl: '', target: 'friend', scope: 'individual', spCost: 6, effect: '状態異常回復' },
      { name: 'HolyLight', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 15, powerPct: 120, hits: 1, effect: '不死系特攻' },
    ],
  },
];

/** 上級職業資料 / Advanced job data */
const advancedJobs: IJobData[] = [
  {
    id: 101,
    name: 'RoyalGuard',
    parentId: 100,
    description: '戦士系上級職。<br />防御も攻撃も一回り強くなる。',
    spriteUrls: ['mon_199r.png', 'mon_234r.png'],
    equipment: ['Sword', 'TwoHandSword', 'Shield', 'Armor', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'KnockBack', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 60, powerPct: 150, hits: 1, hitRate: '40:20', effect: '後衛化' },
      { name: 'RagingBlow', iconUrl: '', target: 'enemy', scope: 'multi', spCost: 40, powerPct: 100, hits: 5, hitRate: '40:60' },
      { name: 'SelfRecovery', iconUrl: '', target: 'self', scope: 'individual', spCost: 15 },
    ],
  },
  {
    id: 201,
    name: 'Warlock',
    parentId: 200,
    description: '魔術系上級職。<br />攻撃魔術に特化している。',
    spriteUrls: ['mon_210.png', 'mon_211.png'],
    equipment: ['Wand', 'Staff', 'Robe', 'Cloth', 'Orb', 'Item'],
    skills: [
      { name: 'FireBall', iconUrl: '', target: 'enemy', scope: 'multi', spCost: 25, powerPct: 200, hits: 1, hitRate: '30:30' },
      { name: 'Meteor', iconUrl: '', target: 'enemy', scope: 'all', spCost: 60, powerPct: 120, hits: 5, hitRate: '20:60' },
    ],
  },
  {
    id: 301,
    name: 'Bishop',
    parentId: 300,
    description: '回復系上級職。<br />より強力な回復魔術が使える。',
    spriteUrls: ['mon_205.png', 'mon_206.png'],
    equipment: ['Wand', 'Mace', 'Robe', 'Cloth', 'Shield', 'Item'],
    skills: [
      { name: 'FullHeal', iconUrl: '', target: 'friend', scope: 'individual', spCost: 30, effect: '完全回復' },
      { name: 'HolyWave', iconUrl: '', target: 'friend', scope: 'all', spCost: 50, effect: '全体回復' },
    ],
  },
];

/** 混合職業資料 / Mixed job data */
const mixedJobs: IJobData[] = [
  ...baseJobs,
  ...advancedJobs,
  {
    id: 401,
    name: 'Ranger',
    parentId: 400,
    description: '弓系上級職。<br />野生の知識に長けた弓使い。',
    spriteUrls: ['mon_216.png', 'mon_216y.png'],
    equipment: ['Dagger', 'Bow', 'Armor', 'Cloth', 'Item'],
    skills: [
      { name: 'ArrowRain', iconUrl: '', target: 'enemy', scope: 'multi', spCost: 35, powerPct: 120, hits: 3, hitRate: '30:50' },
      { name: 'EagleEye', iconUrl: '', target: 'self', scope: 'individual', spCost: 20, effect: '命中率大幅上昇' },
    ],
  },
];

/** 高技能數量職業 / High skill count job */
const highSkillJob: IJobData[] = [
  {
    id: 999,
    name: 'MasterOfAll',
    parentId: 0,
    description: '萬能職業。<br />すべてのスキルを習得可能。',
    spriteUrls: ['mon_999.png', 'mon_999r.png'],
    equipment: ['All'],
    skills: [
      { name: 'Fire', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 8, powerPct: 150, hits: 1, hitRate: '20:20' },
      { name: 'Ice', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 8, powerPct: 140, hits: 1, hitRate: '25:25' },
      { name: 'Lightning', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 8, powerPct: 160, hits: 1, hitRate: '15:30' },
      { name: 'Heal', iconUrl: '', target: 'friend', scope: 'individual', spCost: 10, effect: 'HP回復' },
      { name: 'Cure', iconUrl: '', target: 'friend', scope: 'individual', spCost: 6, effect: '状態異常回復' },
      { name: 'Revive', iconUrl: '', target: 'friend', scope: 'individual', spCost: 60, effect: '味方一人を復活' },
      { name: 'Buff', iconUrl: '', target: 'friend', scope: 'all', spCost: 40, effect: '全能力上昇' },
      { name: 'Debuff', iconUrl: '', target: 'enemy', scope: 'all', spCost: 40, effect: '全能力低下' },
    ],
  },
];

/** ==================== 故事 ==================== */

/** 基礎職業表格 / Base jobs table */
export const BaseJobs: Story = {
  args: {
    jobs: baseJobs,
  },
  parameters: {
    docs: {
      description: {
        story:
          '僅顯示基礎職業的詳細表格。\nDetail table showing only base jobs.',
      },
    },
  },
};

/** 上級職業表格 / Advanced jobs table */
export const AdvancedJobs: Story = {
  args: {
    jobs: advancedJobs,
  },
  parameters: {
    docs: {
      description: {
        story:
          '僅顯示上級職業的詳細表格。\nDetail table showing only advanced jobs.',
      },
    },
  },
};

/** 混合職業表格 / Mixed jobs table */
export const MixedJobs: Story = {
  args: {
    jobs: mixedJobs,
  },
  parameters: {
    docs: {
      description: {
        story:
          '混合基礎職業和上級職業的詳細表格。\nDetail table mixing base and advanced jobs.',
      },
    },
  },
};

/** 單一職業表格 / Single job table */
export const SingleJob: Story = {
  args: {
    jobs: [baseJobs[0]],
  },
  parameters: {
    docs: {
      description: {
        story:
          '單一職業的詳細表格。\nDetail table for single job.',
      },
    },
  },
};

/** 高技能數量表格 / High skill count table */
export const HighSkillCount: Story = {
  args: {
    jobs: highSkillJob,
  },
  parameters: {
    docs: {
      description: {
        story:
          '包含大量技能的職業詳細表格。\nDetail table for job with many skills.',
      },
    },
  },
};

/** 空表格 / Empty table */
export const EmptyTable: Story = {
  args: {
    jobs: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          '空的職業表格。\nEmpty job table.',
      },
    },
  },
};