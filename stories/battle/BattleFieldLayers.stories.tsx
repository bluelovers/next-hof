/**
 * BattleFieldLayers 個別展示
 * BattleFieldLayers individual showcase
 *
 * 三層結構：最外層背景 > 角色精靈排版框 > 巢狀精靈圖層
 * Three-layer structure: outermost background > sprite layout frame > nested sprite layers
 *
 * 重點預覽 bgSize（背景獨立放大）與 valign（垂直對齊）功能
 * Highlights the bgSize (independent enlarged background) and valign (vertical alignment) features.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleFieldLayers } from '../../src/components/battle/BattleFieldLayers';
import { sampleSprites, createSampleConfig, sampleFieldSize } from './sampleData';

const meta: Meta<typeof BattleFieldLayers> = {
  title: 'Battle/Atoms/BattleFieldLayers',
  component: BattleFieldLayers,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '戰場圖層：最外層背景 + 角色精靈排版框 + 巢狀精靈圖層。\n' +
          '支援 bgSize 讓背景獨立放大而不影響角色排版；valign 控制角色框垂直位置（預設 bottom）。\n' +
          'Battlefield layers: outermost background + sprite layout frame + nested sprite layers.\n' +
          'bgSize enlarges the background independently; valign controls the sprite frame vertical position (default bottom).',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    sprites: sampleSprites,
    config: createSampleConfig('grass'),
    ...sampleFieldSize,
    showLabels: true,
    valign: 'bottom',
  },
  // 外層舞台，方便觀察背景尺寸與角色框的相對位置
  // Outer stage to visualize the relationship between background size and sprite frame
  decorators: [
    (Story) => (
      <div style={{ background: '#10151b', padding: '12px', borderRadius: '4px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BattleFieldLayers>;

/** 預設：背景與角色框尺寸統一（未使用 bgSize） / Default: unified background and sprite frame size (no bgSize) */
export const Default: Story = {};

/** 背景放大（720×320）：角色框水平置中、垂直貼底 / Enlarged background (720×320): frame centered horizontally, bottom-aligned */
export const LargeBackground: Story = {
  args: {
    bgSize: { width: 720, height: 320 },
  },
};

/** 僅放大背景寬度 / Only enlarge background width */
export const LargeWidthOnly: Story = {
  args: {
    bgSize: { width: 720 },
  },
};

/** 僅放大背景高度 / Only enlarge background height */
export const LargeHeightOnly: Story = {
  args: {
    bgSize: { height: 320 },
  },
};

/** 垂直置底（預設） / Vertical bottom (default) */
export const AlignBottom: Story = {
  args: {
    bgSize: { width: 720, height: 320 },
    valign: 'bottom',
  },
};

/** 垂直置中 / Vertical middle */
export const AlignMiddle: Story = {
  args: {
    bgSize: { width: 720, height: 320 },
    valign: 'middle',
  },
};

/** 垂直置頂 / Vertical top */
export const AlignTop: Story = {
  args: {
    bgSize: { width: 720, height: 320 },
    valign: 'top',
  },
};
