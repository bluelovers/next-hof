/**
 * GameDataPage Storybook 故事
 * GameDataPage Storybook stories
 *
 * 展示 Hall of Rumor ゲームデータ頁面
 * Showcases the Hall of Rumor game data page
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GameLayout } from '../src/components/GameLayout/GameLayout';
import { GameDataPage } from '../src/components/GameDataPage/GameDataPage';
import type { IGameDataPageData } from '../src/components/GameDataPage/GameDataTypes';

/** 使用 GameLayout 包裝的 GameDataPage / GameDataPage wrapped in GameLayout */
const GameDataPageWithLayout: React.FC<{
  data: IGameDataPageData;
}> = ({ data }) => (
  <GameLayout>
    <GameDataPage data={data} />
  </GameLayout>
);

const meta: Meta<typeof GameDataPageWithLayout> = {
  title: 'Pages/GameDataPage',
  component: GameDataPageWithLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Hall of Rumor 遊戲資料頁面。包含職業樹與職業詳細表格（技能卡片）。\nHall of Rumor game data page. Includes job tree and job detail tables with skill cards.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GameDataPageWithLayout>;

// ==================== Mock 資料 ====================

/** 完整職業資料 / Complete job data */
const fullJobData: IGameDataPageData = {
  jobs: [
    // === Warrior 系 ===
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
      id: 102,
      name: 'Sacrier',
      parentId: 100,
      description: '戦士系上級職。<br />攻撃に特化した戦士。<br />自分の体力を犠牲に強力な技が使える。',
      spriteUrls: ['mon_100r.png', 'mon_012.png'],
      equipment: ['Sword', 'TwoHandSword', 'Shield', 'Cloth', 'Robe', 'Item'],
      skills: [
        { name: 'Bash', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 8, powerPct: 160, hits: 1, hitRate: '20:20' },
        { name: 'Stab', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 15, powerPct: 190, hits: 1, hitRate: '0:40' },
        { name: 'Possession', iconUrl: '', target: 'friend', scope: 'all', spCost: 70, extraAttrs: ['Sacrifice:200%', 'Str+55%', 'Int+55%', 'Spd+55%', 'Atk+55%', 'Matk+55%'], hitRate: '100:0', effect: '?' },
      ],
    },
    {
      id: 103,
      name: 'WitchHunt',
      parentId: 100,
      description: '戦士系上級職。<br />魔術に対抗する力を持つ。',
      spriteUrls: ['mon_219r.png', 'mon_113.png'],
      equipment: ['Sword', 'Spear', 'Shield', 'Armor', 'Cloth', 'Robe'],
      skills: [
        { name: 'Bash', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 8, powerPct: 160, hits: 1, hitRate: '20:20' },
        { name: 'SilenceSword', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 20, powerPct: 100, hits: 1, hitRate: '20:40', effect: '沈黙' },
        { name: 'MagicSeal', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 30, powerPct: 50, hits: 1, effect: '魔方陣消去' },
      ],
    },

    // === Sorcerer 系 ===
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
      id: 202,
      name: 'Summoner',
      parentId: 200,
      description: '魔術系上級職。<br />使い魔を呼び出す事ができる。',
      spriteUrls: ['mon_212.png', 'mon_213.png'],
      equipment: ['Wand', 'Staff', 'Robe', 'Cloth', 'Orb', 'Item'],
      skills: [
        { name: 'Summon', iconUrl: '', target: 'self', scope: 'individual', spCost: 40, effect: '使い魔召喚' },
      ],
    },
    {
      id: 203,
      name: 'Necromancer',
      parentId: 200,
      description: '魔術系上級職。<br />死靈を使役する。',
      spriteUrls: ['mon_215.png', 'mon_215z.png'],
      equipment: ['Wand', 'Staff', 'Robe', 'Cloth', 'Orb', 'Item'],
      skills: [
        { name: 'DarkBall', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 18, powerPct: 180, hits: 1, hitRate: '20:20' },
        { name: 'Revive', iconUrl: '', target: 'friend', scope: 'individual', spCost: 60, effect: '味方一人を復活' },
      ],
    },

    // === Priest 系 ===
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
    {
      id: 302,
      name: 'Druid',
      parentId: 300,
      description: '回復系上級職。<br />自然の力を借りた回復を行う。',
      spriteUrls: ['mon_207.png', 'mon_208.png'],
      equipment: ['Wand', 'Mace', 'Robe', 'Cloth', 'Item'],
      skills: [
        { name: 'Regen', iconUrl: '', target: 'friend', scope: 'individual', spCost: 20, effect: '継続回復' },
        { name: 'NatureHeal', iconUrl: '', target: 'friend', scope: 'individual', spCost: 15, effect: 'HP大回復' },
      ],
    },

    // === Hunter 系 ===
    {
      id: 400,
      name: 'Hunter',
      parentId: 0,
      description: '弓系基本職。<br />遠距離から攻撃できる。',
      spriteUrls: ['mon_216.png', 'mon_217.png'],
      equipment: ['Bow', 'Dagger', 'Cloth', 'Armor', 'Item'],
      skills: [
        { name: 'Shoot', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 0, powerPct: 100, hits: 1, weaponLimit: 'Limit:Bow', extraAttrs: ['BackAttack'] },
        { name: 'QuickShot', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 12, powerPct: 80, hits: 2 },
      ],
    },
    {
      id: 401,
      name: 'Sniper',
      parentId: 400,
      description: '弓系上級職。<br />正確無比な射撃を行う。',
      spriteUrls: ['mon_218.png', 'mon_218y.png'],
      equipment: ['Bow', 'Dagger', 'Cloth', 'Armor', 'Item'],
      skills: [
        { name: 'PreciseShot', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 25, powerPct: 300, hits: 1, hitRate: '90:10', weaponLimit: 'Limit:Bow' },
        { name: 'SpreadShot', iconUrl: '', target: 'enemy', scope: 'multi', spCost: 30, powerPct: 120, hits: 3, weaponLimit: 'Limit:Bow' },
      ],
    },
    {
      id: 402,
      name: 'BeastTamer',
      parentId: 400,
      description: '弓系上級職。<br />獣を使役する事ができる。',
      spriteUrls: ['mon_219.png', 'mon_220.png'],
      equipment: ['Bow', 'Whip', 'Cloth', 'Armor', 'Item'],
      skills: [
        { name: 'Tame', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 30, effect: '獣を従える' },
        { name: 'BeastRoar', iconUrl: '', target: 'enemy', scope: 'multi', spCost: 25, powerPct: 100, hits: 1, effect: '恐怖' },
      ],
    },
    {
      id: 403,
      name: 'Murderer',
      parentId: 400,
      description: '弓系上級職。<br />毒の扱いに長けた職業。',
      spriteUrls: ['mon_216y.png', 'mon_217rz.png'],
      equipment: ['Dagger', 'Bow', 'Armor', 'Cloth', 'Item'],
      skills: [
        { name: 'PoisonBlow', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 10, powerPct: 100, hits: 1, weaponLimit: 'Limit:Dagger', effect: '相手が毒状態なら威力6倍' },
        { name: 'ScatterKnife', iconUrl: '', target: 'enemy', scope: 'multi', spCost: 30, powerPct: 130, hits: 4, weaponLimit: 'Limit:Dagger', extraAttrs: ['invalid'] },
        { name: 'Shoot', iconUrl: '', target: 'enemy', scope: 'individual', spCost: 0, powerPct: 100, hits: 1, weaponLimit: 'Limit:Bow', extraAttrs: ['invalid', 'BackAttack'] },
      ],
    },
  ],
};

// ==================== 故事 ====================

/** 完整職業資料 / Complete job data */
export const Complete: Story = {
  args: {
    data: fullJobData,
  },
  parameters: {
    docs: {
      description: {
        story:
          '完整的 GameData 頁面，包含所有職業的職業樹與技能卡片。\nComplete GameData page with all jobs in the job tree and skill cards.',
      },
    },
  },
};

/** 僅基礎職業 / Base jobs only */
const baseJobData: IGameDataPageData = {
  jobs: fullJobData.jobs.filter(j => j.parentId === 0),
};

export const BaseJobsOnly: Story = {
  args: {
    data: baseJobData,
  },
  parameters: {
    docs: {
      description: {
        story:
          '僅顯示基礎職業（無上級職）。\nDisplay base jobs only (no advanced jobs).',
      },
    },
  },
};

/** Warrior 系職業 / Warrior job tree */
const warriorJobData: IGameDataPageData = {
  jobs: fullJobData.jobs.filter(j => j.id >= 100 && j.id < 200),
};

export const WarriorTree: Story = {
  args: {
    data: warriorJobData,
  },
  parameters: {
    docs: {
      description: {
        story:
          '僅顯示 Warrior 系職業樹。\nDisplay only the Warrior job tree.',
      },
    },
  },
};
