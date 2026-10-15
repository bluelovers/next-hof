/**
 * BattleFieldSpriteLayers 個別展示
 * BattleFieldSpriteLayers individual showcase
 *
 * 遞迴疊加每個角色的精靈圖層（巢狀 div）
 * Recursively stacks each character's sprite layer (nested divs)
 *
 * 另附編輯模式：直接拖曳單一精靈調整背景位置
 * Also covers edit mode: drag a single sprite to adjust its background position.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeStageDecorator } from '../decorators';
import { BattleFieldSpriteLayers } from '../../src/components/battle/BattleFieldSpriteLayers';
import { sampleSprites, sampleFieldSize, sampleStyleOverrideSprites } from './sampleData';
import { makeBattleFieldEditModeDecorator } from './editModePanel';

const meta: Meta<typeof BattleFieldSpriteLayers> = {
	title: 'BattleField/BattleFieldSpriteLayers',
	component: BattleFieldSpriteLayers,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'戰場精靈圖層：以遞迴巢狀 div 疊加每個角色的精靈。\n' +
					'editable 開啟編輯模式：每個精靈的圖片顯示區成為拖曳把手，可直接在畫面上移動單一精靈；\n' +
					'其餘圖層點擊穿透，被壓在下層的精靈也抓得到；圖片上的徽章即時顯示座標。\n' +
					'Battlefield sprite layers: recursively nested div layers for each character sprite.\n' +
					'`editable` turns on edit mode: each sprite\'s displayed image area becomes a drag handle so a single sprite\n' +
					'can be moved on the canvas; the other layers are click-through so sprites buried underneath can still be\n' +
					'grabbed, and the badge on each image shows its coordinates live.',
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

/**
 * 編輯模式：直接拖曳單一精靈調整位置，圖片上的徽章即時顯示座標
 * Edit mode: drag a single sprite to adjust its position; the badge on the image shows live coordinates
 *
 * 圖層本身點擊穿透，只有「圖片顯示區」是拖曳把手，因此抓到哪隻就是哪隻；
 * 拖曳結果收斂在畫布內（保留至少 16px 可見），onSpriteMove 於每次移動回報 { index, sprite, pos }。
 * 上方編輯面板提供重置（清除覆寫）、參考線顯示隱藏與吸附開關。
 * The layers are click-through and only the displayed image area is a drag handle, so what you grab
 * is what you move; the result stays inside the canvas (at least 16px remains visible) and
 * onSpriteMove reports { index, sprite, pos } on every move. The edit panel above offers reset
 * (clears the overrides), the guides show/hide toggle and the snap toggle.
 */
export const EditableSpriteDrag: Story = {
	args: {
		editable: true,
		snapToGuides: true,
	},
	decorators: [
		makeBattleFieldEditModeDecorator({
			sceneSize: sampleFieldSize,
		}),
	],
};
