/**
 * GameDataPage Storybook 故事
 * GameDataPage Storybook stories
 *
 * 展示 Hall of Rumor ゲーム數據頁面
 * Showcases the Hall of Rumor game data page
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GameLayout } from '../../src/components/pages/GameLayout';
import { GameDataPage } from '../../src/components/pages/GameDataPage';
import { fullJobData, baseJobs, warriorJobs } from '../fixture/gameDataJobs';

/** 使用 GameLayout 包裝的 GameDataPage / GameDataPage wrapped in GameLayout */
const GameDataPageWithLayout: React.FC<{
  data: { jobs: typeof fullJobData.jobs };
}> = ({ data }) => (
  <GameLayout>
    <GameDataPage data={data} />
  </GameLayout>
);

const meta: Meta<typeof GameDataPageWithLayout> = {
  title: 'Pages/GameDataPage',
  component: GameDataPageWithLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Hall of Rumor 遊戲資料頁面。包含職業樹與職業詳細表格（技能卡片）。\nHall of Rumor game data page. Includes job tree and job detail tables with skill cards.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GameDataPageWithLayout>;

// ==================== 故事 ====================

/** 完整職業資料 / Complete job data */
export const Complete: Story = {
  args: {
    data: fullJobData,
  },
  parameters: {
    docs: {
      description: {
        story:
          '完整的 GameData 頁面，包含所有職業的職業樹與技能卡片。\nComplete GameData page with all jobs in the job tree and skill cards.',
      },
    },
  },
};

/** 僅基礎職業 / Base jobs only */
export const BaseJobsOnly: Story = {
  args: {
    data: { jobs: baseJobs },
  },
  parameters: {
    docs: {
      description: {
        story:
          '僅顯示基礎職業（無上級職）。\nDisplay base jobs only (no advanced jobs).',
      },
    },
  },
};

/** Warrior 系職業 / Warrior job tree */
export const WarriorTree: Story = {
  args: {
    data: { jobs: warriorJobs },
  },
  parameters: {
    docs: {
      description: {
        story:
          '僅顯示 Warrior 系職業樹。\nDisplay only the Warrior job tree.',
      },
    },
  },
};
