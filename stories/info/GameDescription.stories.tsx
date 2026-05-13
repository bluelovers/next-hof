/**
 * GameDescription 遊戲簡介元件故事
 * GameDescription component stories
 *
 * 個別展示遊戲簡介區域
 * Show game description section
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GameDescription } from '../../src/components/info/GameDescription';

/** GameDescription 元件設定 / GameDescription component settings */
const meta: Meta<typeof GameDescription> = {
  title: 'Info/GameDescription',
  component: GameDescription,
  parameters: {
    // Storybook 裝飾器配置 / Storybook decorators configuration
    decorators: [
      (Story) => (
        <div className="home-page" style={{ 
          backgroundColor: '#10151b', 
          padding: '20px',
          color: '#e0e0e0',
          fontFamily: 'Arial, sans-serif',
          width: '400px'
        }}>
          <Story />
        </div>
      ),
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本遊戲簡介 / Basic game description */
export const Basic: Story = {};

/** 長遊戲簡介 / Long game description (simulated) */
export const LongDescription: Story = {
  parameters: {
    // 這裡可以添加額外的描述內容
    // Additional description content can be added here
  },
};