/**
 * HuntPage Storybook 故事
 * HuntPage Storybook stories
 *
 * 展示狩獵列表頁面（獵場一覽）
 * Showcases the hunting grounds list page
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HuntAreaDarkDecorator } from '../../decorators';
import { HuntPage } from '../../../src/components/pages/HuntPage';

/** 背景裝飾器 / Dark game background decorator */
const meta: Meta<typeof HuntPage> = {
  title: 'Pages/HuntPage',
  component: HuntPage,
  parameters: {
    docs: {
      description: {
        component:
          '狩獵列表頁面。顯示所有可狩獵區域的名稱與等級範圍。\n'
          + 'Hunting grounds list page. Shows all available hunting areas with level ranges.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [HuntAreaDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** 預設完整列表 / Default full list */
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: '預設完整獵區列表（16 區域）。\nDefault full hunt area list (16 areas).',
      },
    },
  },
};

/** 自訂標題與分類 / Custom title and section */
export const CustomTitle: Story = {
  args: {
    title: 'My Hunt',
    sectionTitle: 'Elite Areas',
    areas: [
      { name: '龍の巣', land: 'dragon01', levelRange: 'Lv50-70' },
      { name: '深淵の迷宮', land: 'abyss01', levelRange: 'Lv80-99' },
    ],
  },
  parameters: {
    docs: {
      description: { story: '自訂標題與獵區。\nCustom title and area list.' },
    },
  },
};

/** 空列表 / Empty list */
export const Empty: Story = {
  args: { areas: [] },
  parameters: {
    docs: {
      description: { story: '尚無獵區。\nNo areas available.' },
    },
  },
};

/** 少數區域 / Few areas */
export const FewAreas: Story = {
  args: {
    areas: [
      { name: 'ゴブリンと遊ぶ(最弱)', land: 'gb0', levelRange: 'Lv1' },
      { name: 'ちょっと強いゴブリン', land: 'gb1', levelRange: 'Lv1-5' },
    ],
  },
  parameters: {
    docs: {
      description: { story: '僅 2 個區域。\nOnly 2 areas.' },
    },
  },
};
