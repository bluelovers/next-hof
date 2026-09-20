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
import { sampleSprites, sampleEnemySprites, sampleAllySprites, createSampleConfig } from './sampleData';

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
    sprites: sampleSprites,
    config: createSampleConfig('grass'),
    showLabels: true,
  },
};

/** 僅有敵人 / Enemies only */
export const EnemiesOnly: Story = {
  args: {
    sprites: sampleEnemySprites,
    config: createSampleConfig('cave'),
    showLabels: true,
  },
};

/** 僅有友軍 / Allies only */
export const AlliesOnly: Story = {
  args: {
    sprites: sampleAllySprites,
    config: createSampleConfig('grass01'),
    showLabels: true,
  },
};

/** 雪地戰場 / Snow battlefield */
export const SnowBattlefield: Story = {
  args: {
    sprites: sampleSprites,
    config: createSampleConfig('snow'),
    showLabels: true,
  },
};

/** 沙漠戰場 / Desert battlefield */
export const DesertBattlefield: Story = {
  args: {
    sprites: sampleSprites,
    config: createSampleConfig('sand'),
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
