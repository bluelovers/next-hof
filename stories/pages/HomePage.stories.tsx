/**
 * HomePage Storybook 故事
 * HomePage Storybook stories
 *
 * 展示 Hall of Rumor 首頁的各種狀態
 * Showcases various states of the Hall of Rumor home page
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GameLayout } from '../../src/components/pages/GameLayout';
import { HomePage } from '../../src/components/pages/HomePage';

/** 使用 GameLayout 包裝的 HomePage / HomePage wrapped in GameLayout */
const HomePageWithLayout: React.FC<{
  ranking?: Array<{ rank: number; teamName: string }>;
  onlineUsers?: number;
}> = ({ ranking, onlineUsers }) => (
  <GameLayout>
    <HomePage
      ranking={ranking}
      onlineUsers={onlineUsers}
    />
  </GameLayout>
);

const meta: Meta<typeof HomePageWithLayout> = {
  title: 'Pages/HomePage',
  component: HomePageWithLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Hall of Rumor 首頁。包含登入表單、遊戲簡介、Ranking 排行榜與系統資訊。\nHall of Rumor home page. Includes login form, game description, ranking table, and system info.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HomePageWithLayout>;

// ==================== 故事 ====================

/** 預設首頁 / Default home page */
export const Default: Story = {
  args: {
    ranking: [],
    onlineUsers: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          '空資料的首頁狀態，Ranking 無資料。\nHome page with no ranking data.',
      },
    },
  },
};

/** 有 Ranking 資料 / With ranking data */
export const WithRanking: Story = {
  args: {
    ranking: [
      { rank: 1, teamName: 'TestTeam' },
      { rank: 2, teamName: 'ゴブリンと遊ぶ' },
      { rank: 3, teamName: '勇者パーティー' },
    ],
    onlineUsers: 3,
  },
  parameters: {
    docs: {
      description: {
        story:
          '展示 Ranking 排行榜的首頁。\nHome page displaying the ranking leaderboard.',
      },
    },
  },
};

/** 多人上線 / Many users online */
export const ManyUsers: Story = {
  args: {
    ranking: [
      { rank: 1, teamName: 'ChampionTeam' },
      { rank: 2, teamName: 'DarkKnights' },
      { rank: 3, teamName: 'MageGuild' },
      { rank: 4, teamName: 'BeastTamer' },
      { rank: 5, teamName: 'HolyCrusade' },
    ],
    onlineUsers: 128,
  },
  parameters: {
    docs: {
      description: {
        story:
          '多人上線與完整 Ranking 的首頁。\nHome page with many online users and full ranking data.',
      },
    },
  },
};
