/**
 * MonsterCard Storybook 故事
 * MonsterCard Storybook stories
 *
 * 展示戰鬥編成用的怪物卡片（含地形背景）
 * Showcases monster card with landscape background for battle formation
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CardDarkDecorator } from '../decorators';
import { MonsterCard } from '../../src/components/monsters/MonsterCard';
import {
	goblinAxeMonster,
	caveBatMonster,
	hellHoundMonster,
	dragonLordMonster,
	goblinMageMonster,
	wolfMonster,
	slimeMonster,
} from '../fixture/monsterCards';

/** 背景裝飾器 — 模擬遊戲深色背景 / Dark game background decorator */
const meta: Meta<typeof MonsterCard> = {
	title: 'Characters/Monsters/MonsterCard',
	component: MonsterCard,
	parameters: {
		docs: {
			description: {
				component:
					'怪物卡片（含地形背景）。顯示怪物名稱、圖像、等級與地形背景。\n'
					+ 'Monster card (with landscape background). Shows name, image, level, and terrain backdrop.',
			},
		},
	},
	tags: ['autodocs'],
	decorators: [CardDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ==================== 故事 ==================== */

/** 草地哥布林斧兵 / Grassland GoblinAxe */
export const GoblinAxe: Story = {
	args: {
		monster: goblinAxeMonster,
	},
	parameters: {
		docs: {
			description: {
				story: '草地地形上的哥布林斧兵（Lv.1）。\nGoblinAxe on grassland (Lv.1).',
			},
		},
	},
};

/** 洞穴蝙蝠 / Cave Bat */
export const CaveBat: Story = {
	args: {
		monster: caveBatMonster,
	},
	parameters: {
		docs: {
			description: {
				story: '洞穴地形上的蝙蝠（Lv.3）。\nBat in cave terrain (Lv.3).',
			},
		},
	},
};

/** 地獄犬 / Hell Hound on Lava */
export const HellHound: Story = {
	args: {
		monster: hellHoundMonster,
	},
	parameters: {
		docs: {
			description: {
				story: '熔岩地形上的地獄犬（Lv.15）。\nHell Hound on lava terrain (Lv.15).',
			},
		},
	},
};

/** 高等級 / High level monster */
export const HighLevel: Story = {
	args: {
		monster: dragonLordMonster,
	},
	parameters: {
		docs: {
			description: {
				story: '高山地形上的龍王（Lv.99）。\nDragonLord on mountain terrain (Lv.99).',
			},
		},
	},
};

/** 多怪物排列 / Multiple monsters row */
export const MonsterRow: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
			<MonsterCard monster={goblinAxeMonster} />
			<MonsterCard monster={goblinMageMonster} />
			<MonsterCard monster={wolfMonster} />
			<MonsterCard monster={slimeMonster} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: '多個怪物並排展示（測試 inline-block 排列）。\nMultiple monsters in a row (testing inline-block layout).',
			},
		},
	},
};