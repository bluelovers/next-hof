/**
 * RankingTable 排行榜表格元件故事
 * RankingTable component stories
 *
 * 個別展示排行榜的各種狀態
 * Show ranking table in various states
 */

import type { Meta, StoryObj } from '@storybook/react';
import { HomePageDarkDecorator } from '../decorators';
import { RankingTable } from '../../src/components/info/RankingTable';

/** RankingTable 元件設定 / RankingTable component settings */
const meta: Meta<typeof RankingTable> = {
  title: 'Info/RankingTable',
  component: RankingTable,
  parameters: {
    // Storybook 裝飾器配置 / Storybook decorators configuration
    decorators: [
      HomePageDarkDecorator,
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本排行榜 / Basic ranking */
export const Basic: Story = {
  args: {
    ranking: [
      { rank: 1, teamName: '勇者隊' },
      { rank: 2, teamName: '魔法部隊' },
      { rank: 3, teamName: '戰士隊' },
    ],
  },
};

/** 空排行榜 / Empty ranking */
export const Empty: Story = {
  args: {
    ranking: [],
  },
};

/** 長排行榜 / Long ranking */
export const Long: Story = {
  args: {
    ranking: [
      { rank: 1, teamName: '超強勇者隊' },
      { rank: 2, teamName: '魔法精英隊' },
      { rank: 3, teamName: '戰士王者隊' },
      { rank: 4, teamName: '牧師團隊' },
      { rank: 5, teamName: '盜賊聯盟' },
      { rank: 6, teamName: '弓箭手團' },
      { rank: 7, teamName: '騎士團' },
      { rank: 8, teamName: '法師塔' },
      { rank: 9, teamName: '暗殺者組織' },
      { rank: 10, teamName: '治癫者協會' },
    ],
  },
};

/** 長隊伍名稱 / Long team names */
export const LongTeamNames: Story = {
  args: {
    ranking: [
      { rank: 1, teamName: '傳說中的勇者小隊' },
      { rank: 2, teamName: '黃金魔法師殿堂' },
      { rank: 3, teamName: '聖騎士守護聯盟' },
      { rank: 4, teamName: '暗影刺客兄弟會' },
      { rank: 5, teamName: '精靈之森守衛隊' },
    ],
  },
};

/** 隱藏標題 / Without title */
export const WithoutTitle: Story = {
  args: {
    ranking: [
      { rank: 1, teamName: '勇者隊' },
      { rank: 2, teamName: '魔法部隊' },
    ],
    showTitle: false,
  },
};

/** 自訂標題 / Custom title */
export const CustomTitle: Story = {
  args: {
    ranking: [
      { rank: 1, teamName: '勇者隊' },
      { rank: 2, teamName: '魔法部隊' },
    ],
    title: 'TOP 5',
  },
};