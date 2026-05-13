/**
 * NavigationBar Storybook 故事
 * NavigationBar Storybook stories
 *
 * 展示登入後的導航列各種狀態
 * Showcases post-login navigation bar states
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NavigationBar } from '../../src/components/navigation/NavigationBar';
import type { INavItem } from '../../src/components/navigation/NavigationBar';

/** 背景裝飾器 — 模擬遊戲導航背景 / Navigation background decorator */
const NavDecorator = (Story: React.FC) => (
  <div
    style={{
      backgroundColor: '#10151b',
      padding: '0',
      fontFamily: "'メイリオ', Meiryo, 'MS PGothic', Verdana, sans-serif",
    }}
  >
    <Story />
  </div>
);

const meta: Meta<typeof NavigationBar> = {
  title: 'Navigation/NavigationBar',
  component: NavigationBar,
  parameters: {
    docs: {
      description: {
        component:
          '登入後顯示的導航列，包含 Top / Hunt / Item / Town / Setting / Log。\nPost-login navigation bar with Top / Hunt / Item / Town / Setting / Log.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [NavDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ==================== 故事 ==================== */

/** 預設導航 — Top 為當前頁 / Default nav - Top active */
export const Default: Story = {
  args: {
    items: [
      { label: 'Top', href: '#', active: true },
      { label: 'Hunt', href: '#' },
      { label: 'Item', href: '#' },
      { label: 'Town', href: '#' },
      { label: 'Setting', href: '#' },
      { label: 'Log', href: '#' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '預設狀態，Top 為當前頁面。\nDefault state with Top as the active page.',
      },
    },
  },
};

/** 在 Hunt 頁面 / On Hunt page */
export const HuntActive: Story = {
  args: {
    items: [
      { label: 'Top', href: '#' },
      { label: 'Hunt', href: '#', active: true },
      { label: 'Item', href: '#' },
      { label: 'Town', href: '#' },
      { label: 'Setting', href: '#' },
      { label: 'Log', href: '#' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '目前在 Hunt（獵場）頁面。\nCurrently on the Hunt page.',
      },
    },
  },
};

/** 在 Item 頁面 / On Item page */
export const ItemActive: Story = {
  args: {
    items: [
      { label: 'Top', href: '#' },
      { label: 'Hunt', href: '#' },
      { label: 'Item', href: '#', active: true },
      { label: 'Town', href: '#' },
      { label: 'Setting', href: '#' },
      { label: 'Log', href: '#' },
    ],
  },
};

/** 在 Town 頁面 / On Town page */
export const TownActive: Story = {
  args: {
    items: [
      { label: 'Top', href: '#' },
      { label: 'Hunt', href: '#' },
      { label: 'Item', href: '#' },
      { label: 'Town', href: '#', active: true },
      { label: 'Setting', href: '#' },
      { label: 'Log', href: '#' },
    ],
  },
};

/** 在 Setting 頁面 / On Setting page */
export const SettingActive: Story = {
  args: {
    items: [
      { label: 'Top', href: '#' },
      { label: 'Hunt', href: '#' },
      { label: 'Item', href: '#' },
      { label: 'Town', href: '#' },
      { label: 'Setting', href: '#', active: true },
      { label: 'Log', href: '#' },
    ],
  },
};

/** 在 Log 頁面 / On Log page */
export const LogActive: Story = {
  args: {
    items: [
      { label: 'Top', href: '#' },
      { label: 'Hunt', href: '#' },
      { label: 'Item', href: '#' },
      { label: 'Town', href: '#' },
      { label: 'Setting', href: '#' },
      { label: 'Log', href: '#', active: true },
    ],
  },
};

/** 自訂導航項目 / Custom nav items */
export const CustomItems: Story = {
  args: {
    items: [
      { label: '🏠 Home', href: '#', active: true },
      { label: '⚔️ Battle', href: '#' },
      { label: '🎒 Inventory', href: '#' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '使用自訂圖示與標籤的導航列。\nNavigation bar with custom icons and labels.',
      },
    },
  },
};
