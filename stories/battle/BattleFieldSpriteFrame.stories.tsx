/**
 * BattleFieldSpriteFrame 個別展示
 * BattleFieldSpriteFrame individual showcase
 *
 * 位於背景與角色精靈之間的保護層，固定角色排版座標原點
 * The protective layer between background and sprites, fixing the sprite layout origin.
 *
 * 重點預覽：水平永遠置中，垂直由 valign 控制（預設 bottom）
 * Highlights: always horizontally centered, vertical position controlled by valign (default bottom).
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeStageDecorator } from '../decorators';
import { BattleFieldSpriteFrame } from '../../src/components/battle/BattleFieldSpriteFrame';
import { sampleSprites, sampleFieldSize } from './sampleData';
import { EnumBattleFieldVAlign } from '../../src/components/battle/enums';

const meta: Meta<typeof BattleFieldSpriteFrame> = {
  title: 'BattleField/BattleFieldSpriteFrame',
  component: BattleFieldSpriteFrame,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '角色精靈排版框：保護角色排版尺寸的中介圖層。\n' +
          '水平永遠置中；垂直位置由 valign 控制（top / middle / bottom，預設 bottom）。\n' +
          'Sprite layout frame: a protective layer fixing the sprite layout size.\n' +
          'Always horizontally centered; vertical position controlled by valign (top / middle / bottom, default bottom).',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    sprites: sampleSprites,
    ...sampleFieldSize,
    showSpriteLabels: true,
    valign: EnumBattleFieldVAlign.Bottom,
  },
  // 模擬放大後的背景舞台（640×360），框（480×200）在其中依 valign 定位
  // Simulated enlarged background stage (640×360); the frame (480×200) positions within by valign
  decorators: [
    makeStageDecorator({
      width: 768,
      height: 320,
      border: '1px dashed #3a4658',
      overflowHidden: true,
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof BattleFieldSpriteFrame>;

/** 垂直置底（預設）：角色框貼齊背景底部、水平置中 / Vertical bottom (default): frame at background bottom, horizontally centered */
export const AlignBottom: Story = {};

/** 垂直置中 / Vertical middle */
export const AlignMiddle: Story = {
  args: { valign: EnumBattleFieldVAlign.Middle },
};

/** 垂直置頂 / Vertical top */
export const AlignTop: Story = {
  args: { valign: EnumBattleFieldVAlign.Top },
};
