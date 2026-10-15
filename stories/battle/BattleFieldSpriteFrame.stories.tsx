/**
 * BattleFieldSpriteFrame 個別展示
 * BattleFieldSpriteFrame individual showcase
 *
 * 位於背景與角色精靈之間的保護層，固定角色排版座標原點
 * The protective layer between background and sprites, fixing the sprite layout origin.
 *
 * 重點預覽：水平永遠置中，垂直由 valign 控制（預設 bottom）；
 * 另可提供 offset 改為絕對定位，或開啟 editable 直接在舞台上拖曳（編輯模式）。
 * Highlights: always horizontally centered, vertical position controlled by valign (default bottom);
 * an `offset` switches to absolute positioning, and `editable` makes the frame draggable on the
 * stage (edit mode).
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeStageDecorator } from '../decorators';
import { BattleFieldSpriteFrame } from '../../src/components/battle/BattleFieldSpriteFrame';
import { sampleSprites, sampleFieldSize } from './sampleData';
import { makeBattleFieldEditModeDecorator } from './editModePanel';
import { EnumBattleFieldVAlign } from '../../src/components/battle/enums';

/** 舞台尺寸（編輯面板的參考線／吸附基準） / Stage size (guides/snap basis of the edit panel) */
const STAGE_SIZE = { width: 768, height: 320 };

const meta: Meta<typeof BattleFieldSpriteFrame> = {
	title: 'BattleField/BattleFieldSpriteFrame',
	component: BattleFieldSpriteFrame,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'角色精靈排版框：保護角色排版尺寸的中介圖層。\n' +
					'水平永遠置中；垂直位置由 valign 控制（top / middle / bottom，預設 bottom）。\n' +
					'提供 offset 後改為絕對定位（忽略置中與 valign），用於「戰場大於排版框」時指定框位置。\n' +
					'editable 開啟編輯模式：框可直接在舞台上拖曳，座標收斂在舞台範圍內，' +
					'框左上角徽章即時顯示識別文字與座標。\n' +
					'Sprite layout frame: a protective layer fixing the sprite layout size.\n' +
					'Always horizontally centered; vertical position controlled by valign (top / middle / bottom, default bottom).\n' +
					'Providing `offset` switches to absolute positioning (ignoring centering and valign) to place the frame\n' +
					'when the scene is larger than the frame. `editable` turns on edit mode: the frame is draggable on the\n' +
					'stage, coordinates are clamped inside it, and the badge at the frame\'s top-left shows label + coordinates live.',
			},
		},
	},
	tags: ['autodocs'],
	args: {
		sprites: sampleSprites,
		...sampleFieldSize,
		showSpriteLabels: true,
		valign: EnumBattleFieldVAlign.Bottom,
	},
	/**
	 * 模擬放大後的背景舞台（640×360），框（480×200）在其中依 valign 定位
	 * Simulated enlarged background stage (640×360); the frame (480×200) positions within by valign
	 */
	decorators: [
		makeStageDecorator({
			width: 768,
			height: 320,
			border: '1px dashed #3a4658',
			overflowHidden: true,
		}),
	],
};

export default meta;
type Story = StoryObj<typeof BattleFieldSpriteFrame>;

/** 垂直置底（預設）：角色框貼齊背景底部、水平置中 / Vertical bottom (default): frame at background bottom, horizontally centered */
export const AlignBottom: Story = {};

/** 垂直置中 / Vertical middle */
export const AlignMiddle: Story = {
	args: { valign: EnumBattleFieldVAlign.Middle },
};

/** 垂直置頂 / Vertical top */
export const AlignTop: Story = {
	args: { valign: EnumBattleFieldVAlign.Top },
};

/**
 * 固定位置：提供 offset 後改為絕對定位，忽略水平置中與 valign
 * Fixed position: providing offset switches to absolute positioning, ignoring centering and valign
 *
 * 舞台 768×320、框 480×200 → 有效範圍 x∈[0,288]、y∈[0,120]
 * Stage 768×320 with a 480×200 frame → valid range x∈[0,288], y∈[0,120].
 */
export const FixedOffset: Story = {
	args: { offset: { x: 208, y: 48 } },
};

/**
 * 編輯模式：直接拖曳排版框，左上角徽章即時顯示座標與相對百分比
 * Edit mode: drag the frame directly; the badge shows live coordinates and relative percentage
 *
 * 拖曳位移以「起始座標 + 游標位移」計算並收斂在舞台範圍內；
 * onOffsetChange 於每次移動回報座標。
 * 上方編輯面板提供重置與吸附開關（參考線疊加圖層由 BattleFieldLayers / BattleFieldSpriteLayers
 * 在實際場景中提供，獨立的排版框故事不疊加）。
 * The drag computes start offset + cursor delta and clamps inside the stage;
 * onOffsetChange reports on every move. The edit panel above offers reset and the snap toggle
 * (the guides overlay is provided by BattleFieldLayers / BattleFieldSpriteLayers in real
 * scenes; the standalone frame story does not overlay it).
 */
export const EditableDrag: Story = {
	args: {
		editable: true,
		snapToGuides: true,
		offset: { x: 144, y: 60 },
	},
	decorators: [
		makeBattleFieldEditModeDecorator({
			sceneSize: STAGE_SIZE,
			showGuidesToggle: false,
			showSnapToggle: true,
		}),
	],
};
