/**
 * GDSubNav Storybook 故事
 * GDSubNav Storybook stories
 *
 * 展示 GameDataPage 子導航組件的各種配置（展示資料集中於 fixture）
 * Showcases GameDataPage sub-navigation component in various configurations
 * (showcase data lives in the fixture)
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeCenteredDecorator, CENTERED_MAX_WIDTH, GDSubNavDarkDecorator } from '../decorators';
import { GDSubNav } from '../../src/components/navigation/GDSubNav';
import { customSubLinks, minimalSubLinks, longSubLinks } from '../fixture/navData';

/** 背景裝飾器 — 模擬遊戲深色背景 / Dark game background decorator */
const meta: Meta<typeof GDSubNav> = {
	title: 'Navigation/GDSubNav',
	component: GDSubNav,
	parameters: {
		docs: {
			description: {
				component:
					'GameDataPage 子導航組件，顯示子頁面連結導航。\nGameDataPage sub-navigation component showing sub-page links navigation.',
			},
		},
	},
	tags: ['autodocs'],
	decorators: [GDSubNavDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ==================== 故事 ==================== */

/** 預設導航 / Default navigation */
export const Default: Story = {
	args: {},
	parameters: {
		docs: {
			description: {
				story:
					'預設的 GameDataPage 子導航，包含職業、物品、判定、怪物連結。\nDefault GameDataPage sub-navigation with job, item, judge, monster links.',
			},
		},
	},
	decorators: [makeCenteredDecorator({ maxWidth: CENTERED_MAX_WIDTH })],
};

/** 自訂導航連結 / Custom navigation links */
export const CustomLinks: Story = {
	args: {
		subLinks: customSubLinks,
	},
	parameters: {
		docs: {
			description: {
				story:
					'自訂子導航連結，展示不同的導選項。\nCustom sub-navigation links showing different navigation options.',
			},
		},
	},
	decorators: [makeCenteredDecorator({ maxWidth: CENTERED_MAX_WIDTH })],
};

/** 最少連結 / Minimal links */
export const MinimalLinks: Story = {
	args: {
		subLinks: minimalSubLinks,
	},
	parameters: {
		docs: {
			description: {
				story:
					'最少連結的導航，適用於簡化界面。\nMinimal navigation links for simplified interface.',
			},
		},
	},
	decorators: [makeCenteredDecorator({ maxWidth: 600 })],
};

/** 長標籤連結 / Long label links */
export const LongLabels: Story = {
	args: {
		subLinks: longSubLinks,
	},
	parameters: {
		docs: {
			description: {
				story:
					'長標籤的導航連結，展示文本包裝效果。\nLong label navigation links showing text wrapping effects.',
			},
		},
	},
	decorators: [makeCenteredDecorator({ maxWidth: 900 })],
};