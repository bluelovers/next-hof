/**
 * JobTree Storybook 故事
 * JobTree Storybook stories
 *
 * 展示職業樹組件的各種狀態與結構（展示資料集中於 fixture）
 * Showcases job tree component in various states and structures
 * (showcase data lives in the fixture)
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { JobTreeDarkDecorator } from '../decorators';
import { JobTree } from '../../src/components/game-data/JobTree';
import {
	jobTreeWarriorJobs,
	jobTreeSorcererJobs,
	jobTreeCompleteJobs,
	jobTreeDeepNested,
} from '../fixture/jobTreeData';

/** 背景裝飾器 — 模擬遊戲深色背景 / Dark game background decorator */
const meta: Meta<typeof JobTree> = {
	title: 'GameData/JobTree',
	component: JobTree,
	parameters: {
		docs: {
			description: {
				component:
					'職業樹組件，將扁平的職業列表轉換為樹狀結構並渲染。\nJob tree component that converts flat job list to tree structure and renders it.',
			},
		},
	},
	tags: ['autodocs'],
	decorators: [JobTreeDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ==================== 故事 ====================

/** 單一職業 / Single job */
export const SingleJob: Story = {
	args: {
		jobs: [jobTreeWarriorJobs[0]],
	},
	parameters: {
		docs: {
			description: {
				story:
					'單一職業的樹狀顯示（無子職業）。\nSingle job tree display (no child jobs).',
			},
		},
	},
};

/** 簡單職業樹 / Simple job tree */
export const SimpleTree: Story = {
	args: {
		jobs: jobTreeWarriorJobs,
	},
	parameters: {
		docs: {
			description: {
				story:
					'簡單的職業樹，包含基礎職業和一個上級職業。\nSimple job tree with base job and one advanced job.',
			},
		},
	},
};

/** 多層職業樹 / Multi-level job tree */
export const MultiLevelTree: Story = {
	args: {
		jobs: jobTreeSorcererJobs,
	},
	parameters: {
		docs: {
			description: {
				story:
					'多層級職業樹，包含基礎職業和多個上級職業。\nMulti-level job tree with base job and multiple advanced jobs.',
			},
		},
	},
};

/** 完整職業樹 / Complete job tree */
export const CompleteTree: Story = {
	args: {
		jobs: jobTreeCompleteJobs,
	},
	parameters: {
		docs: {
			description: {
				story:
					'完整的職業樹，包含所有職業系統。\nComplete job tree with all job classes.',
			},
		},
	},
};

/** 深層嵌套樹 / Deep nested tree */
export const DeepNestedTree: Story = {
	args: {
		jobs: jobTreeDeepNested,
	},
	parameters: {
		docs: {
			description: {
				story:
					'深度嵌套的職業樹，展示多層級職業進化路徑。\nDeep nested job tree showing multi-level job evolution paths.',
			},
		},
	},
};