/**
 * GDSubNav Storybook 故事
 * GDSubNav Storybook stories
 *
 * 展示 GameDataPage 子導航組件的各種配置
 * Showcases GameDataPage sub-navigation component in various configurations
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GDSubNav } from '../../src/components/navigation/GDSubNav';

/** 背景裝飾器 — 模擬遊戲深色背景 / Dark game background decorator */
const DarkDecorator = (Story: React.FC) => (
  <div
    style={{
      backgroundColor: '#10151b',
      padding: '20px',
      minHeight: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'メイリオ', Meiryo, 'MS PGothic', Verdana, sans-serif",
    }}
  >
    <Story />
  </div>
);

const meta: Meta<typeof GDSubNav> = {
  title: 'Navigation/GDSubNav',
  component: GDSubNav,
  parameters: {
    docs: {
      description: {
        component:
          'GameDataPage 子導航組件，顯示子頁面連結導航。\nGameDataPage sub-navigation component showing sub-page links navigation.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [DarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ==================== 故事 ==================== */

/** 預設導航 / Default navigation */
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          '預設的 GameDataPage 子導航，包含職業、物品、判定、怪物連結。\nDefault GameDataPage sub-navigation with job, item, judge, monster links.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

/** 自訂導航連結 / Custom navigation links */
export const CustomLinks: Story = {
  args: {
    subLinks: [
      { label: '職業(Job)', href: 'http://127.0.0.1:8085/gamedata/job' },
      { label: '技能(Skill)', href: 'http://127.0.0.1:8085/gamedata/skill' },
      { label: '裝備(Equipment)', href: 'http://127.0.0.1:8085/gamedata/equipment' },
      { label: '場景(Scene)', href: 'http://127.0.0.1:8085/gamedata/scene' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '自訂子導航連結，展示不同的導選項。\nCustom sub-navigation links showing different navigation options.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

/** 最少連結 / Minimal links */
export const MinimalLinks: Story = {
  args: {
    subLinks: [
      { label: '職', href: 'http://127.0.0.1:8085/gamedata/job' },
      { label: '物', href: 'http://127.0.0.1:8085/gamedata/item' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '最少連結的導航，適用於簡化界面。\nMinimal navigation links for simplified interface.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

/** 長標籤連結 / Long label links */
export const LongLabels: Story = {
  args: {
    subLinks: [
      { label: '職業情報(Job Info)', href: 'http://127.0.0.1:8085/gamedata/job' },
      { label: 'アイテム詳細(Item Details)', href: 'http://127.0.0.1:8085/gamedata/item' },
      { label: '判定基準(Judgment Criteria)', href: 'http://127.0.0.1:8085/gamedata/judge' },
      { label: 'モンスター図鑑(Monster Encyclopedia)', href: 'http://127.0.0.1:8085/gamedata/monster' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '長標籤的導航連結，展示文本包裝效果。\nLong label navigation links showing text wrapping effects.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};