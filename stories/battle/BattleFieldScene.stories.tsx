/**
 * BattleFieldScene 個別展示
 * BattleFieldScene individual showcase
 *
 * 戰場畫面：雙方角色精靈在戰場上的疊加排列
 * Battlefield scene: layered character sprites on the battlefield
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleFieldScene } from '../../src/components/battle/BattleFieldScene';
import type { IBattleSprite } from '../../src/components/battle/types';

const meta: Meta<typeof BattleFieldScene> = {
  title: 'Battle/Atoms/BattleFieldScene',
  component: BattleFieldScene,
  parameters: {
    layout: 'centered',
    docs: { description: { component: '戰場畫面：使用巢狀 div 疊加方式顯示雙方角色精靈。\nBattlefield scene: nested div layers displaying character sprites.' } },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ background: '#10151b', padding: '10px', borderRadius: '4px' }}>
        <table style={{ borderCollapse: 'collapse' }}><tbody><tr><Story /></tr></tbody></table>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BattleFieldScene>;

/** 預設戰場—ゴブリン vs TestTeam / Default battlefield — Goblins vs TestTeam */
export const DefaultBattle: Story = {
  args: {
    sprites: [
      { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 164, y: 16, flipped: false, name: 'GoblinWarrior(A)' },
      { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 148, y: 56, flipped: false, name: 'GoblinWarrior(B)' },
      { id: 'mon_053', imageUrl: '/image/char/mon_053.png', x: 124, y: 96, flipped: false, name: 'GoblinAxe' },
      { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 116, y: 136, flipped: false, name: 'GoblinWarrior(C)' },
      { id: 'mon_018', imageUrl: '/image/char_rev/mon_018.png', x: 352, y: 14, flipped: true, name: 'Hero1' },
      { id: 'mon_214', imageUrl: '/image/char_rev/mon_214.png', x: 388, y: 64, flipped: true, name: 'Mage1' },
      { id: 'mon_214', imageUrl: '/image/char_rev/mon_214.png', x: 408, y: 114, flipped: true, name: 'Healer1' },
      { id: 'mon_079', imageUrl: '/image/char_rev/mon_079.png', x: 288, y: 68, flipped: true, name: 'Priest1' },
    ],
    config: {
      backgroundImageUrl: '/image/land/bg_grass.png',
      width: 480,
      height: 200,
    },
    showLabels: true,
  },
};

/** 僅有敵人 / Enemies only */
export const EnemiesOnly: Story = {
  args: {
    sprites: [
      { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 164, y: 16, flipped: false, name: 'GoblinWarrior(A)' },
      { id: 'mon_053', imageUrl: '/image/char/mon_053.png', x: 124, y: 96, flipped: false, name: 'GoblinAxe' },
    ],
    config: {
      backgroundImageUrl: '/image/land/bg_cave.png',
      width: 480,
      height: 200,
    },
    showLabels: true,
  },
};

/** 僅有友軍 / Allies only */
export const AlliesOnly: Story = {
  args: {
    sprites: [
      { id: 'mon_018', imageUrl: '/image/char_rev/mon_018.png', x: 340, y: 20, flipped: true, name: 'Hero1' },
      { id: 'mon_214', imageUrl: '/image/char_rev/mon_214.png', x: 370, y: 70, flipped: true, name: 'Mage1' },
      { id: 'mon_079', imageUrl: '/image/char_rev/mon_079.png', x: 300, y: 110, flipped: true, name: 'Priest1' },
    ],
    config: {
      backgroundImageUrl: '/image/land/bg_grass01.png',
      width: 480,
      height: 200,
    },
    showLabels: true,
  },
};

/** 雪地戰場 / Snow battlefield */
export const SnowBattlefield: Story = {
  args: {
    sprites: [
      { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 170, y: 30, flipped: false, name: 'Enemy' },
      { id: 'mon_018', imageUrl: '/image/char_rev/mon_018.png', x: 330, y: 30, flipped: true, name: 'Hero' },
    ],
    config: {
      backgroundImageUrl: '/image/land/bg_snow.png',
      width: 480,
      height: 200,
    },
    showLabels: true,
  },
};

/** 沙漠戰場 / Desert battlefield */
export const DesertBattlefield: Story = {
  args: {
    sprites: [
      { id: 'mon_053', imageUrl: '/image/char/mon_053.png', x: 170, y: 30, flipped: false, name: 'Axe' },
      { id: 'mon_079', imageUrl: '/image/char_rev/mon_079.png', x: 330, y: 30, flipped: true, name: 'Warrior' },
    ],
    config: {
      backgroundImageUrl: '/image/land/bg_sand.png',
      width: 480,
      height: 200,
    },
    showLabels: true,
  },
};

/** 不顯示名稱 / No labels */
export const NoLabels: Story = {
  args: {
    ...DefaultBattle.args,
    showLabels: false,
  } as any,
};
