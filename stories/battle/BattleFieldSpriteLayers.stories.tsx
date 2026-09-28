/**
 * BattleFieldSpriteLayers 個別展示
 * BattleFieldSpriteLayers individual showcase
 *
 * 遞迴疊加每個角色的精靈圖層（巢狀 div）
 * Recursively stacks each character's sprite layer (nested divs)
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeStageDecorator } from '../decorators';
import { BattleFieldSpriteLayers } from '../../src/components/battle/BattleFieldSpriteLayers';
import { sampleSprites, sampleFieldSize, sampleStyleOverrideSprites } from './sampleData';

const meta: Meta<typeof BattleFieldSpriteLayers> = {
	title: 'BattleField/BattleFieldSpriteLayers',
	component: BattleFieldSpriteLayers,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'戰場精靈圖層：以遞迴巢狀 div 疊加每個角色的精靈。\n' +
					'Battlefield sprite layers: recursively nested div layers for each character sprite.',
			},
		},
	},
	tags: ['autodocs'],
	args: {
		sprites: sampleSprites,
		index: 0,
		...sampleFieldSize,
		showSpriteLabels: true,
	},
	/**
	 * 提供與精靈框同尺寸的相對定位舞台，使絕對定位的精靈圖層有正確的原點
	 * Provide a relatively-positioned stage matching the sprite frame size so the
	 * absolutely-positioned sprite layers have a correct origin
	 */
	decorators: [
		makeStageDecorator((args) => ({
			width: args.width as number,
			height: args.height as number,
			overflowHidden: true,
		})),
	],
};

export default meta;
type Story = StoryObj<typeof BattleFieldSpriteLayers>;

/** 預設精靈圖層 / Default sprite layers */
export const Default: Story = {};

/** 不顯示名稱標籤 / No name labels */
export const NoLabels: Story = {
	args: { showSpriteLabels: false },
};

/** 樣式覆寫示範：元件 style 套用至所有圖層，單體精靈 style/labelStyle 各自覆寫 / Style override demo */
export const StyleOverride: Story = {
	args: {
		showSpriteLabels: true,
		/**
		 * 元件層級 style：所有精靈圖層套用藍色邊框 / Component-level style: blue outline on every layer
		 */
		style: { outline: '1px solid rgba(90,160,255,0.6)' },
		sprites: sampleStyleOverrideSprites,
	},
};
