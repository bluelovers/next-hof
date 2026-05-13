/**
 * BattleDisplay Storybook 故事
 * BattleDisplay Storybook stories
 *
 * 展示戰鬥畫面的各種狀態
 * Showcases battle scene in various states
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleDisplay } from '../../src/components/battle/BattleDisplay';
import type { IBattleDisplayData, IBattleAction } from '../../src/components/battle/types';

const meta: Meta<typeof BattleDisplay> = {
  title: 'Battle/BattleDisplay',
  component: BattleDisplay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '完整戰鬥畫面展示組件，包含隊伍資訊、戰場畫面、HP/SP 狀態、行動日誌與戰鬥結果。\nComplete battle display component with team info, battlefield scene, HP/SP status, action log, and battle result.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BattleDisplay>;

// ==================== 基礎 Mock 資料 ====================

/** 左側隊伍（ゴブリンと遊ぶ）/ Left team (Goblins) */
const leftTeamUnits = [
  { name: 'GoblinWarrior(A)', level: 4, hp: 263, maxHp: 263, sp: 263, maxSp: 174, side: 'left' as const },
  { name: 'GoblinWarrior(B)', level: 4, hp: 263, maxHp: 263, sp: 263, maxSp: 174, side: 'left' as const },
  { name: 'GoblinWarrior(C)', level: 1, hp: 213, maxHp: 213, sp: 213, maxSp: 154, side: 'left' as const },
  { name: 'GoblinAxe', level: 1, hp: 213, maxHp: 213, sp: 213, maxSp: 154, side: 'left' as const },
];

/** 右側隊伍（TestTeam）/ Right team (TestTeam) */
const rightTeamUnits = [
  { name: 'Hero1', level: 3, hp: 349, maxHp: 349, sp: 349, maxSp: 53, side: 'right' as const },
  { name: 'Mage1', level: 3, hp: 159, maxHp: 159, sp: 159, maxSp: 112, side: 'right' as const },
  { name: 'Healer1', level: 3, hp: 213, maxHp: 213, sp: 213, maxSp: 89, side: 'right' as const },
  { name: 'Priest1', level: 3, hp: 213, maxHp: 213, sp: 213, maxSp: 89, side: 'right' as const },
];

/** 戰場精靈排列 / Battlefield sprite arrangement */
const battleSprites = [
  // 左側隊伍（敵人）- 從左到右排列，Y 軸遞增
  { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 164, y: 16, flipped: false, name: 'GoblinWarrior(A)' },
  { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 148, y: 56, flipped: false, name: 'GoblinWarrior(B)' },
  { id: 'mon_053', imageUrl: '/image/char/mon_053.png', x: 124, y: 96, flipped: false, name: 'GoblinAxe' },
  { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 116, y: 136, flipped: false, name: 'GoblinWarrior(C)' },
  // 右側隊伍（友方）- 從右到左排列，翻轉顯示
  { id: 'mon_018', imageUrl: '/image/char_rev/mon_018.png', x: 352, y: 14, flipped: true, name: 'Hero1' },
  { id: 'mon_214', imageUrl: '/image/char_rev/mon_214.png', x: 388, y: 64, flipped: true, name: 'Mage1' },
  { id: 'mon_214', imageUrl: '/image/char_rev/mon_214.png', x: 408, y: 114, flipped: true, name: 'Healer1' },
  { id: 'mon_079', imageUrl: '/image/char_rev/mon_079.png', x: 288, y: 68, flipped: true, name: 'Priest1' },
];

/** 戰鬥行動日誌 / Battle action log */
const battleActions: IBattleAction[] = [
  // ---- 回合開始 ----
  {
    type: 'enter',
    source: 'GoblinWarrior(A)',
    message: 'GoblinWarrior(A) Lv.4 enter the Battlefield.',
    side: 'left',
    attribute: 'normal',
  },
  {
    type: 'enter',
    source: 'GoblinWarrior(B)',
    message: 'GoblinWarrior(B) Lv.4 enter the Battlefield.',
    side: 'left',
    attribute: 'normal',
  },
  {
    type: 'enter',
    source: 'GoblinWarrior(C)',
    message: 'GoblinWarrior(C) Lv.1 enter the Battlefield.',
    side: 'left',
    attribute: 'normal',
  },
  {
    type: 'enter',
    source: 'GoblinAxe',
    message: 'GoblinAxe Lv.1 enter the Battlefield.',
    side: 'left',
    attribute: 'normal',
  },
  {
    type: 'enter',
    source: 'Priest1',
    message: 'Priest1 Lv.3 enter the Battlefield.',
    side: 'right',
    attribute: 'normal',
  },
  {
    type: 'enter',
    source: 'Healer1',
    message: 'Healer1 Lv.3 enter the Battlefield.',
    side: 'right',
    attribute: 'normal',
  },
  {
    type: 'enter',
    source: 'Hero1',
    message: 'Hero1 Lv.3 enter the Battlefield.',
    side: 'right',
    attribute: 'normal',
  },
  {
    type: 'enter',
    source: 'Mage1',
    message: 'Mage1 Lv.3 enter the Battlefield.',
    side: 'right',
    attribute: 'normal',
  },

  // ---- 行動：GoblinWarrior(B) FatalStab -> Hero1(保護Priest1) ----
  {
    type: 'skill',
    source: 'GoblinWarrior(B)',
    skill: { name: 'FatalStab', iconUrl: '/image/icon/skill/skill_074z.png' },
    message: 'GoblinWarrior(B) FatalStab',
    side: 'left',
    attribute: 'dmg',
  },
  {
    type: 'protect',
    source: 'Hero1',
    target: 'Priest1',
    message: 'Hero1 protected Priest1!',
    side: 'left',
    attribute: 'support',
  },
  {
    type: 'damage',
    source: 'GoblinWarrior(B)',
    target: 'Hero1',
    value: 182,
    valueChange: '349 > 167',
    message: '182 Damage to Hero1',
    side: 'left',
    attribute: 'dmg',
  },

  // ---- 行動：GoblinWarrior(A) FatalStab -> Hero1(保護Healer1) ----
  {
    type: 'skill',
    source: 'GoblinWarrior(A)',
    skill: { name: 'FatalStab', iconUrl: '/image/icon/skill/skill_074z.png' },
    message: 'GoblinWarrior(A) FatalStab',
    side: 'left',
    attribute: 'dmg',
  },
  {
    type: 'protect',
    source: 'Hero1',
    target: 'Healer1',
    message: 'Hero1 protected Healer1!',
    side: 'left',
    attribute: 'support',
  },
  {
    type: 'damage',
    source: 'GoblinWarrior(A)',
    target: 'Hero1',
    value: 166,
    valueChange: '167 > 1',
    message: '166 Damage to Hero1',
    side: 'left',
    attribute: 'dmg',
  },

  // ---- 行動：GoblinAxe Attack -> Healer1 ----
  {
    type: 'attack',
    source: 'GoblinAxe',
    skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' },
    message: 'GoblinAxe Attack',
    side: 'left',
    attribute: 'dmg',
  },
  {
    type: 'damage',
    source: 'GoblinAxe',
    target: 'Healer1',
    value: 44,
    valueChange: '213 > 169',
    message: '44 Damage to Healer1',
    side: 'left',
    attribute: 'dmg',
  },

  // ---- 行動：Mage1 casting ----
  {
    type: 'casting',
    source: 'Mage1',
    message: 'Mage1 start casting.',
    side: 'right',
    attribute: 'charge',
  },

  // ---- 行動：GoblinWarrior(B) Attack -> Mage1 ----
  {
    type: 'attack',
    source: 'GoblinWarrior(B)',
    skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' },
    message: 'GoblinWarrior(B) Attack',
    side: 'left',
    attribute: 'dmg',
  },
  {
    type: 'damage',
    source: 'GoblinWarrior(B)',
    target: 'Mage1',
    value: 48,
    valueChange: '49 > 1',
    message: '48 Damage to Mage1',
    side: 'left',
    attribute: 'dmg',
  },

  // ---- 行動：GoblinWarrior(A) Attack -> Mage1 (down) ----
  {
    type: 'attack',
    source: 'GoblinWarrior(A)',
    skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' },
    message: 'GoblinWarrior(A) Attack',
    side: 'left',
    attribute: 'dmg',
  },
  {
    type: 'damage',
    source: 'GoblinWarrior(A)',
    target: 'Mage1',
    value: 40,
    valueChange: '1 > -39',
    message: '40 Damage to Mage1',
    side: 'left',
    attribute: 'dmg',
  },
  {
    type: 'down',
    source: 'Mage1',
    message: 'Mage1 down.',
    side: 'left',
    attribute: 'dmg',
  },
];

/**
 * 建立完整戰鬥資料
 * Build complete battle display data
 */
function createBattleData(overrides?: Partial<IBattleDisplayData>): IBattleDisplayData {
  return {
    title: 'battle log*',
    time: '05/13(Wed) 04:39:24',
    leftTeam: {
      name: 'ゴブリンと遊ぶ(最弱)',
      units: leftTeamUnits,
      side: 'left',
    },
    rightTeam: {
      name: 'TestTeam',
      units: rightTeamUnits,
      side: 'right',
    },
    battlefield: {
      backgroundImageUrl: '/image/land/bg_grass.png',
      backgroundType: 'grass',
      width: 480,
      height: 200,
    },
    sprites: battleSprites,
    actions: battleActions,
    result: {
      winner: 'ゴブリンと遊ぶ(最弱)',
      leftTeam: {
        hpRemain: 573,
        alive: 4,
        totalUnits: 4,
        totalDamage: 1384,
        totalExp: 4,
        funds: '4',
      },
      rightTeam: {
        hpRemain: 0,
        alive: 0,
        totalUnits: 4,
        totalDamage: 379,
      },
    },
    ...overrides,
  };
}

// ==================== 故事 ====================

/** 預設戰鬥畫面 / Default battle scene */
export const Default: Story = {
  args: {
    data: createBattleData(),
    showSpriteLabels: false,
    showHpBars: true,
    showSpBars: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '完整的戰鬥記錄，展示兩支隊伍交戰的完整過程。\nComplete battle record showing the full engagement between two teams.',
      },
    },
  },
};

/** 顯示角色名稱 / With sprite labels */
export const WithSpriteLabels: Story = {
  args: {
    data: createBattleData(),
    showSpriteLabels: true,
    showHpBars: true,
    showSpBars: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '在戰場畫面中顯示角色名稱標籤，方便識別每個單位。\nShow character name labels on the battlefield for easy unit identification.',
      },
    },
  },
};

/** 戰鬥中 / Mid-battle state */
const midBattleUnits = leftTeamUnits.map((u, i) => ({
  ...u,
  hp: i === 0 ? 180 : i === 1 ? 200 : u.hp,
}));

export const MidBattle: Story = {
  args: {
    data: createBattleData({
      leftTeam: {
        name: 'ゴブリンと遊ぶ(最弱)',
        units: midBattleUnits,
        side: 'left',
      },
      actions: battleActions.slice(0, 6),
    }),
    showHpBars: true,
    showSpBars: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '戰鬥進行中的狀態，部分單位已受損。\nMid-battle state showing some units with reduced HP.',
      },
    },
  },
};

/** 單位陣亡 / With casualties */
const casualtiesUnits = rightTeamUnits.map((u) => {
  if (u.name === 'Mage1') return { ...u, hp: 0, status: 'down' as const };
  if (u.name === 'Priest1') return { ...u, hp: 0, status: 'down' as const };
  if (u.name === 'Healer1') return { ...u, hp: 0, status: 'down' as const };
  if (u.name === 'Hero1') return { ...u, hp: 1, status: 'alive' as const };
  return u;
});

export const WithCasualties: Story = {
  args: {
    data: createBattleData({
      rightTeam: {
        name: 'TestTeam',
        units: casualtiesUnits,
        side: 'right',
      },
      actions: battleActions.slice(9, 18),
    }),
    showHpBars: true,
    showSpBars: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '單位陣亡狀態，部分角色 HP 歸零。\nCasualty state showing some characters with 0 HP.',
      },
    },
  },
};

/** 戰鬥結果 / Battle result */
const resultUnits = leftTeamUnits.map((u) => ({
  ...u,
  hp: u.name === 'GoblinWarrior(A)' ? 140 : u.name === 'GoblinWarrior(B)' ? 130 : u.hp,
}));

const defeatedUnits = rightTeamUnits.map((u) => ({
  ...u,
  hp: 0,
  status: 'down' as const,
}));

export const BattleOver: Story = {
  args: {
    data: createBattleData({
      leftTeam: {
        name: 'ゴブリンと遊ぶ(最弱)',
        units: resultUnits,
        side: 'left',
      },
      rightTeam: {
        name: 'TestTeam',
        units: defeatedUnits,
        side: 'right',
      },
      actions: battleActions.slice(15),
      result: {
        winner: 'ゴブリンと遊ぶ(最弱)',
        isDraw: false,
        leftTeam: {
          hpRemain: 573,
          alive: 4,
          totalUnits: 4,
          totalDamage: 1384,
          totalExp: 4,
          funds: '4',
        },
        rightTeam: {
          hpRemain: 0,
          alive: 0,
          totalUnits: 4,
          totalDamage: 379,
        },
      },
    }),
    showHpBars: true,
    showSpBars: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '戰鬥結束後的結果畫面，包含最終統計數據。\nPost-battle result screen with final statistics.',
      },
    },
  },
};
