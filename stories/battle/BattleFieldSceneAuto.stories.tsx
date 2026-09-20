/**
 * BattleFieldScene 自動定位展示
 * BattleFieldScene auto-positioning showcase
 *
 * 使用 computeBattleSpritePositions + 預緩存圖像尺寸索引（spriteImageSizes）
 * 自動計算角色站位，無需手動填寫 x/y。
 * Uses computeBattleSpritePositions + the pre-cached sprite size index to
 * auto-compute positions — no manual x/y required.
 *
 * 位置演算法移植自 PHP HOF_Class_Battle_Style::CopyRow()
 * Position algorithm ported from PHP HOF_Class_Battle_Style::CopyRow()
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeDarkDecorator } from '../decorators';
import { BattleFieldScene } from '../../src/components/battle/BattleFieldScene';
import { sampleSpritesAuto, sampleSprites, createSampleConfig, sampleMagicCircles } from './sampleData';

const meta: Meta<typeof BattleFieldScene> = {
  title: 'Battle/Atoms/BattleFieldSceneAuto',
  component: BattleFieldScene,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '自動定位展示：角色 x/y 由 computeBattleSpritePositions 依戰場尺寸（480×200）' +
          '與圖像真實尺寸（spriteImageSizes 索引）計算，並對照 PHP CopyRow 的中心對齊邏輯。\n' +
          'Auto-positioned: x/y computed by computeBattleSpritePositions from the battlefield ' +
          'size (480×200) and each image\'s real size (spriteImageSizes index), mirroring ' +
          'PHP CopyRow centering.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    makeDarkDecorator({ table: true, padding: '10px', borderRadius: '4px' }),
  ],
};

export default meta;
type Story = StoryObj<typeof BattleFieldScene>;

/** 自動定位（依名冊 + 圖像尺寸計算） / Auto-positioned (from roster + image sizes) */
export const AutoPositioned: Story = {
  args: {
    sprites: sampleSpritesAuto,
    config: createSampleConfig('grass'),
    showLabels: true,
  },
};

/**
 * 含魔方陣圖層（對應 PHP exec_css 的魔方陣渲染，繪製於角色之下）
 * With a magic-circle layer (mirrors PHP exec_css; drawn beneath the sprites)
 */
export const WithMagicCircle: Story = {
  args: {
    sprites: sampleSpritesAuto,
    config: {
      ...createSampleConfig('grass'),
      magicCircles: sampleMagicCircles,
    },
    showLabels: true,
  },
};

/** 對照：手動定位樣本 / Contrast: hand-tuned sample */
export const HandTuned: Story = {
  args: {
    sprites: sampleSprites,
    config: createSampleConfig('grass'),
    showLabels: true,
  },
};
