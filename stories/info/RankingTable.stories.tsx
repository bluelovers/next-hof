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
import { rankingBasic, rankingLong, rankingLongNames, rankingTwo } from '../fixture/homePageData';

/** RankingTable 元件設定 / RankingTable component settings */
const meta: Meta<typeof RankingTable> = {
	title: 'Info/RankingTable',
	component: RankingTable,
	parameters: {
		/**
		 * Storybook 裝飾器配置 / Storybook decorators configuration
		 */
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
		ranking: rankingBasic,
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
		ranking: rankingLong,
	},
};

/** 長隊伍名稱 / Long team names */
export const LongTeamNames: Story = {
	args: {
		ranking: rankingLongNames,
	},
};

/** 隱藏標題 / Without title */
export const WithoutTitle: Story = {
	args: {
		ranking: rankingTwo,
		showTitle: false,
	},
};

/** 自訂標題 / Custom title */
export const CustomTitle: Story = {
	args: {
		ranking: rankingTwo,
		title: 'TOP 5',
	},
};