/**
 * InfoSection 資訊區域元件故事
 * InfoSection component stories
 *
 * 個別展示系統資訊區域
 * Show system info section
 */

import type { Meta, StoryObj } from '@storybook/react';
import { InfoSectionDarkDecorator } from '../decorators';
import { InfoSection } from '../../src/components/info/InfoSection';
import {
	basicInfo,
	highUsageInfo,
	lowUsageInfo,
	longRetentionInfo,
	shortRetentionInfo,
} from '../fixture/homePageData';

/** InfoSection 元件設定 / InfoSection component settings */
const meta: Meta<typeof InfoSection> = {
	title: 'Info/InfoSection',
	component: InfoSection,
	parameters: {
		/**
		 * Storybook 裝飾器配置 / Storybook decorators configuration
		 */
		decorators: [InfoSectionDarkDecorator],
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本資訊區域 / Basic info section */
export const Basic: Story = {
	args: basicInfo,
};

/** 高使用率狀態 / High usage state */
export const HighUsage: Story = {
	args: highUsageInfo,
};

/** 低使用率狀態 / Low usage state */
export const LowUsage: Story = {
	args: lowUsageInfo,
};

/** 資料保留時間長期 / Long retention period */
export const LongRetention: Story = {
	args: longRetentionInfo,
};

/** 資料保留時間短期 / Short retention period */
export const ShortRetention: Story = {
	args: shortRetentionInfo,
};