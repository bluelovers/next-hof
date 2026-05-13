/**
 * InfoSection 資訊區域元件故事
 * InfoSection component stories
 *
 * 個別展示系統資訊區域
 * Show system info section
 */

import type { Meta, StoryObj } from '@storybook/react';
import { InfoSection } from '../src/components/HomePage/atoms/InfoSection';

/** InfoSection 元件設定 / InfoSection component settings */
const meta: Meta<typeof InfoSection> = {
  title: 'HomePage/Atoms/InfoSection',
  component: InfoSection,
  parameters: {
    // Storybook 裝飾器配置 / Storybook decorators configuration
    decorators: [
      (Story) => (
        <div className="home-page" style={{ 
          backgroundColor: '#10151b', 
          padding: '20px',
          color: '#e0e0e0',
          fontFamily: 'Arial, sans-serif'
        }}>
          <Story />
        </div>
      ),
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本資訊區域 / Basic info section */
export const Basic: Story = {
  args: {
    onlineUsers: 25,
    maxUsers: 500,
    retentionDays: 14,
  },
};

/** 高使用率狀態 / High usage state */
export const HighUsage: Story = {
  args: {
    onlineUsers: 450,
    maxUsers: 500,
    retentionDays: 7,
  },
};

/** 低使用率狀態 / Low usage state */
export const LowUsage: Story = {
  args: {
    onlineUsers: 5,
    maxUsers: 500,
    retentionDays: 30,
  },
};

/** 資料保留時間長期 / Long retention period */
export const LongRetention: Story = {
  args: {
    onlineUsers: 100,
    maxUsers: 500,
    retentionDays: 90,
  },
};

/** 資料保留時間短期 / Short retention period */
export const ShortRetention: Story = {
  args: {
    onlineUsers: 200,
    maxUsers: 500,
    retentionDays: 3,
  },
};