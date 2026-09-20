/**
 * BattleFieldSpriteLayers 個別展示
 * BattleFieldSpriteLayers individual showcase
 *
 * 遞迴疊加每個角色的精靈圖層（巢狀 div）
 * Recursively stacks each character's sprite layer (nested divs)
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleFieldSpriteLayers } from '../../src/components/battle/BattleFieldSpriteLayers';
import { sampleSprites, sampleFieldSize } from './sampleData';

const meta: Meta<typeof BattleFieldSpriteLayers> = {
  title: 'Battle/Atoms/BattleFieldSpriteLayers',
  component: BattleFieldSpriteLayers,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '戰場精靈圖層：以遞迴巢狀 div 疊加每個角色的精靈。\n' +
          'Battlefield sprite layers: recursively nested div layers for each character sprite.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    sprites: sampleSprites,
    index: 0,
    ...sampleFieldSize,
    showLabels: true,
  },
  // 提供與精靈框同尺寸的相對定位舞台，使絕對定位的精靈圖層有正確的原點
  // Provide a relatively-positioned stage matching the sprite frame size so the
  // absolutely-positioned sprite layers have a correct origin
  decorators: [
    (Story, context) => {
      const { width, height } = context.args as { width: number; height: number };
      return (
        <div style={{ background: '#10151b', padding: '12px', borderRadius: '4px' }}>
          <div
            style={{
              position: 'relative',
              width,
              height,
              background: '#1a2230',
              overflow: 'hidden',
            }}
          >
            <Story />
          </div>
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof BattleFieldSpriteLayers>;

/** 預設精靈圖層 / Default sprite layers */
export const Default: Story = {};

/** 不顯示名稱標籤 / No name labels */
export const NoLabels: Story = {
  args: { showLabels: false },
};
