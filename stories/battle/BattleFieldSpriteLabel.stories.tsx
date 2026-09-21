/**
 * BattleFieldSpriteLabel 個別展示
 * BattleFieldSpriteLabel individual showcase
 *
 * 由 showLabels 邏輯抽離出的名稱標籤子組件，支援 above/below 兩種垂直定位模式
 * Name label child component extracted from showLabels logic; supports above/below vertical placement.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeStageDecorator } from '../decorators';
import { SPRITE_LAYOUT_WIDTH } from '#/components/battle/types';
import { BattleFieldSpriteLabel } from '../../src/components/battle/BattleFieldSpriteLabel';

const meta: Meta<typeof BattleFieldSpriteLabel> = {
  title: 'Battle/Atoms/BattleFieldSpriteLabel',
  component: BattleFieldSpriteLabel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '戰場精靈名稱標籤：依角色中心自動靠左/靠右，防止溢出容器。可選接收 placement、imageWidth/imageHeight 等進階定位參數。\n' +
          'Battlefield sprite name label: auto-aligns left/right by character center, prevents overflow. Optionally accepts placement, imageWidth/imageHeight for advanced positioning.',
      },
    },
  },
  tags: ['autodocs'],
  // 提供相對定位舞台，使絕對定位的標籤有正確原點
  // Provide a relatively-positioned stage so the absolutely-positioned label has a correct origin
  decorators: [
    makeStageDecorator({ width: SPRITE_LAYOUT_WIDTH, height: 120 }),
  ],
  args: {
    name: 'Hero1',
    x: 352,
    y: 40,
    containerWidth: SPRITE_LAYOUT_WIDTH,
  },
};

export default meta;
type Story = StoryObj<typeof BattleFieldSpriteLabel>;

/** 預設標籤 / Default label */
export const Default: Story = {};

/** 左側角色（標籤靠左對齊） / Left-side character (label left-aligned) */
export const LeftSideCharacter: Story = {
  args: {
    name: 'GoblinAxe',
    x: 80,
    y: 60,
  },
};

/** 右側角色（標籤靠右對齊） / Right-side character (label right-aligned) */
export const RightSideCharacter: Story = {
  args: {
    name: 'Mage1',
    x: 400,
    y: 30,
  },
};

/** 複寫樣式（紅色、加大字體） / Overridden style (red, larger font) */
export const OverrideStyle: Story = {
  args: {
    style: { color: '#ff6b6b', fontSize: 16, textShadow: '0 0 6px #000' },
  },
};
