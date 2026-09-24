/**
 * BattleFieldScene 個別展示
 * BattleFieldScene individual showcase
 *
 * 戰場畫面：雙方角色精靈在戰場上的疊加排列
 * Battlefield scene: layered character sprites on the battlefield
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleStageDarkDecorator } from '../decorators';
import { BattleFieldScene } from '../../src/components/battle/BattleFieldScene';
import { sampleSprites, sampleEnemySprites, sampleAllySprites, sampleSpritesMixed, sampleSpritesFlat, createSampleConfig } from './sampleData';

const meta: Meta<typeof BattleFieldScene> = {
  title: 'BattleField/BattleFieldScene',
  component: BattleFieldScene,
  parameters: {
    layout: 'centered',
    docs: { description: { component: '戰場畫面：使用巢狀 div 疊加方式顯示雙方角色精靈。\nBattlefield scene: nested div layers displaying character sprites.' } },
  },
  tags: ['autodocs'],
  decorators: [
    BattleStageDarkDecorator,
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

/**
 * 同一隊伍混用 char / char_rev：驗證 flip 後仍能全部位於同一側
 * Single team mixing char / char_rev: verify all sprites stay on the same side after flip
 *
 * 右隊同時包含 char（mon_052，需翻轉定位）與 char_rev（mon_018 / mon_079，直接定位）圖，
 * 自動翻轉邏輯應讓三者都落在右側、且朝向一致（面向左）
 * The right team mixes char (mon_052, needs flip positioning) and char_rev (mon_018 / mon_079,
 * direct positioning) images; the auto-flip logic must place all three on the right side with a
 * consistent facing (left).
 */
export const MixedCharRevTeam: Story = {
  args: {
    sprites: sampleSpritesMixed,
    config: createSampleConfig('grass'),
    showLabels: true,
  },
};

/**
 * 扁平名冊 + groupBattleChars 自動分隊：展示 IBattlePositionChar.side / .position 的實際用法
 * Flat roster + groupBattleChars auto-grouping: demonstrates IBattlePositionChar.side / .position in action
 *
 * 與 DefaultBattle 視覺等價，但輸入是一張扁平清單，由 groupBattleChars 依各角色的
 * side / position 自動建立左右隊的前/後衛結構（見 sampleData.flatRosterSample）。
 * Visually equivalent to DefaultBattle, but the input is a single flat list and
 * groupBattleChars builds the left/right teams' front/back structure from each
 * character's side / position (see sampleData.flatRosterSample).
 */
export const FlatRosterGrouped: Story = {
  args: {
    sprites: sampleSpritesFlat,
    config: createSampleConfig('grass'),
    showLabels: true,
  },
};
