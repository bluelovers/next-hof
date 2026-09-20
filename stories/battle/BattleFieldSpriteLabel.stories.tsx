/**
 * BattleFieldSpriteLabel 個別展示
 * BattleFieldSpriteLabel individual showcase
 *
 * 由 showLabels 邏輯抽離出的名稱標籤子組件，支援 style 複寫/追加
 * Name label child component extracted from showLabels logic; supports style override/append.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleFieldSpriteLabel } from '../../src/components/battle/BattleFieldSpriteLabel';

const meta: Meta<typeof BattleFieldSpriteLabel> = {
  title: 'Battle/Atoms/BattleFieldSpriteLabel',
  component: BattleFieldSpriteLabel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '戰場精靈名稱標籤：依 x 決定靠左/靠右，允許透過 style 複寫或追加任意樣式。\n' +
          'Battlefield sprite name label: aligns left/right by x; allows overriding/appending styles via the style prop.',
      },
    },
  },
  tags: ['autodocs'],
  // 提供相對定位舞台，使絕對定位的標籤有正確原點
  // Provide a relatively-positioned stage so the absolutely-positioned label has a correct origin
  decorators: [
    (Story) => (
      <div style={{ background: '#10151b', padding: '12px', borderRadius: '4px' }}>
        <div style={{ position: 'relative', width: 480, height: 120, background: '#1a2230' }}>
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    name: 'Hero1',
    x: 352,
    y: 40,
    width: 480,
  },
};

export default meta;
type Story = StoryObj<typeof BattleFieldSpriteLabel>;

/** 預設標籤 / Default label */
export const Default: Story = {};

/** 複寫樣式（紅色、加大字體） / Overridden style (red, larger font) */
export const OverrideStyle: Story = {
  args: {
    style: { color: '#ff6b6b', fontSize: 16, textShadow: '0 0 6px #000' },
  },
};
