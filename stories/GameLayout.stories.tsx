/**
 * GameLayout Storybook 故事
 * GameLayout Storybook stories
 *
 * 展示 GameLayout 組件的各種狀態
 * Showcases various states of the GameLayout component
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GameLayout } from '../src/components/GameLayout/GameLayout';

/** GameLayout 元件設定 / GameLayout component settings */
const meta: Meta<typeof GameLayout> = {
  title: 'Layout/GameLayout',
  component: GameLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '遊戲主佈局，包含標題、導航連結與頁面內容。\nGame main layout includes title, navigation links, and page content.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GameLayout>;

// ==================== 故事 ====================

/** 預設佈局 / Default layout */
export const Default: Story = {
  args: {
    children: (
      <div>
        <h2>主要內容區</h2>
        <p>這是 GameLayout 包裹的內容。</p>
        <p>Content wrapped by GameLayout.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '預設的 GameLayout 佈局。\nDefault GameLayout layout.',
      },
    },
  },
};

/** 自訂導航 / Custom navigation */
export const CustomNav: Story = {
  args: {
    children: (
      <div>
        <h2>自訂導航頁面</h2>
        <p>這個頁面使用自訂導航連結。</p>
        <p>Page with custom navigation links.</p>
      </div>
    ),
    customNavItems: [
      { href: '/home', label: '首頁 / Home' },
      { href: '/game', label: '戰鬥 / Battle' },
      { href: '/data', label: '數據 / Data' },
      { href: '/help', label: '幫助 / Help' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '使用自訂導航連結的 GameLayout。\nGameLayout with custom navigation links.',
      },
    },
  },
};

/** 長內容 / Long content */
export const LongContent: Story = {
  args: {
    children: (
      <div>
        <h2>長內容頁面</h2>
        <p>這是一個包含大量內容的頁面，用於測試滾動效果。</p>
        <p>This is a page with long content to test scrolling effects.</p>
        <br />
        <h3>章節 1 / Section 1</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <br />
        <h3>章節 2 / Section 2</h3>
        <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <br />
        <h3>章節 3 / Section 3</h3>
        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>
        <br />
        <h3>章節 4 / Section 4</h3>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse.</p>
        <br />
        <h3>章節 5 / Section 5</h3>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '包含長內容的 GameLayout，測試滾動行為。\nGameLayout with long content to test scrolling behavior.',
      },
    },
  },
};