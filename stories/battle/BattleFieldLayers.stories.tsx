/**
 * BattleFieldLayers 個別展示
 * BattleFieldLayers individual showcase
 *
 * 三層結構：最外層背景 > 角色精靈排版框 > 巢狀精靈圖層
 * Three-layer structure: outermost background > sprite layout frame > nested sprite layers
 *
 * 重點預覽 bgSize（背景獨立放大）與 valign（垂直對齊）功能
 * Highlights the bgSize (independent enlarged background) and valign (vertical alignment) features.
 *
 * 另附雙框模式（戰場大於排版框）：敵我雙方各佔一個 BattleFieldSpriteFrame，
 * 可分別指定初始位置或開啟 editable 直接在畫面上拖曳。
 * Also covers dual-frame mode (scene larger than the frame): each side owns a BattleFieldSpriteFrame
 * that can be given its own initial position, or dragged on the canvas via `editable`.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/preview-api';
import { BattleFieldLayersDarkDecorator } from '../decorators';
import { BattleFieldLayers } from '../../src/components/battle/BattleFieldLayers';
import { sampleSprites, createSampleConfig, sampleFieldSize } from './sampleData';
import { makeBattleFieldEditModeDecorator } from './editModePanel';
import { makeBackgroundPickerDecorator } from './backgroundPicker';
import { EnumBattleFieldVAlign } from '../../src/components/battle/enums';
import { EnumBattleFieldBgScale } from '../../src/components/battle/enums';
import type {
	IBattleFieldFrameOffset,
	IBattleSidePair,
} from '../../src/components/battle/types';

const meta: Meta<typeof BattleFieldLayers> = {
	title: 'BattleField/BattleFieldLayers',
	component: BattleFieldLayers,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'戰場圖層：最外層背景 + 角色精靈排版框 + 巢狀精靈圖層。\n' +
					'支援 bgSize 讓背景獨立放大而不影響角色排版；valign 控制角色框垂直位置（預設 bottom）。\n' +
					'背景圖預設水平置中 + 垂直置底，可由 config.bgScale 設定縮放模式（natural/cover/contain/stretch/repeat），\n' +
					'因此 bgSize 大於或小於實際圖檔尺寸時都能正確排版。\n' +
					'戰場大於排版框時自動切換雙框模式：敵我雙方各佔一個排版框（依 sprite.side 分組），\n' +
					'frameOffsets 指定各自初始位置，editable 開啟後可直接在畫面上拖曳，框上徽章顯示隊伍與座標。\n' +
					'Battlefield layers: outermost background + sprite layout frame + nested sprite layers.\n' +
					'bgSize enlarges the background independently; valign controls the sprite frame vertical position (default bottom).\n' +
					'Background image is centered + bottom-aligned by default; config.bgScale sets the scale mode\n' +
					'(natural/cover/contain/stretch/repeat) so layout stays correct whether bgSize is larger or smaller than the image.\n' +
					'When the scene is larger than the frame it switches to dual-frame mode: each side owns a frame (grouped by\n' +
					'sprite.side), frameOffsets sets the initial positions, and editable makes them draggable on the canvas with\n' +
					'the team and coordinates shown on each frame\'s badge.',
			},
		},
	},
	tags: ['autodocs'],
	args: {
		sprites: sampleSprites,
		config: createSampleConfig('grass'),
		...sampleFieldSize,
		showSpriteLabels: true,
		valign: EnumBattleFieldVAlign.Bottom,
	},
	/**
	 * 外層舞台，方便觀察背景尺寸與角色框的相對位置
	 * Outer stage to visualize the relationship between background size and sprite frame
	 */
	decorators: [BattleFieldLayersDarkDecorator, makeBackgroundPickerDecorator()],
};

export default meta;
type Story = StoryObj<typeof BattleFieldLayers>;

/**
 * 預設：背景與角色框尺寸統一（未使用 bgSize）
 * Default: unified background and sprite frame size (no bgSize)
 *
 * 單框模式（戰場＝排版框）：接上輔助面板，可切換參考線、吸附，
 * 並直接調整背景縮放模式與水平／垂直對齊（寫回 config.bgScale / bgHAlign / bgVAlign）。
 * Single-frame mode (scene == frame): the helper panel is attached so the guides and snap
 * toggles work and the background scale mode plus horizontal/vertical alignment can be
 * adjusted directly (written back to config.bgScale / bgHAlign / bgVAlign).
 */
export const Default: Story = {
	decorators: [
		makeBattleFieldEditModeDecorator({
			sceneSize: sampleFieldSize,
			showBgControls: true,
		}),
	],
};

/** 背景放大（720×320）：角色框水平置中、垂直貼底 / Enlarged background (720×320): frame centered horizontally, bottom-aligned */
export const LargeBackground: Story = {
	args: {
		bgSize: { width: 720, height: 320 },
	},
};

/** 僅放大背景寬度 / Only enlarge background width */
export const LargeWidthOnly: Story = {
	args: {
		bgSize: { width: 720 },
	},
};

/** 僅放大背景高度 / Only enlarge background height */
export const LargeHeightOnly: Story = {
	args: {
		bgSize: { height: 320 },
	},
};

/** 垂直置底（預設） / Vertical bottom (default) */
export const AlignBottom: Story = {
	args: {
		bgSize: { width: 720, height: 320 },
		valign: EnumBattleFieldVAlign.Bottom,
	},
};

/** 垂直置中 / Vertical middle */
export const AlignMiddle: Story = {
	args: {
		bgSize: { width: 720, height: 320 },
		valign: EnumBattleFieldVAlign.Middle,
	},
};

/** 垂直置頂 / Vertical top */
export const AlignTop: Story = {
	args: {
		bgSize: { width: 720, height: 320 },
		valign: EnumBattleFieldVAlign.Top,
	},
};

/** 背景圖：原始尺寸，水平置中 + 垂直置底（預設） / Natural size, centered + bottom (default) */
export const BgScaleNatural: Story = {
	args: {
		bgSize: { width: 720, height: 320 },
	},
};

/** 背景圖：cover 縮放覆蓋整個背景框 / Scale mode cover */
export const BgScaleCover: Story = {
	args: {
		bgSize: { width: 720, height: 320 },
		config: { ...createSampleConfig('grass'), bgScale: EnumBattleFieldBgScale.Cover },
	},
};

/** 背景圖：contain 完整放入背景框（可能留白） / Scale mode contain (may letterbox) */
export const BgScaleContain: Story = {
	args: {
		bgSize: { width: 720, height: 320 },
		config: { ...createSampleConfig('grass'), bgScale: EnumBattleFieldBgScale.Contain },
	},
};

/** 背景圖：stretch 拉伸至背景框確切尺寸 / Scale mode stretch */
export const BgScaleStretch: Story = {
	args: {
		bgSize: { width: 720, height: 320 },
		config: { ...createSampleConfig('grass'), bgScale: EnumBattleFieldBgScale.Stretch },
	},
};

/** 背景圖：repeat 依原始尺寸平鋪 / Scale mode repeat */
export const BgScaleRepeat: Story = {
	args: {
		bgSize: { width: 720, height: 320 },
		config: { ...createSampleConfig('grass'), bgScale: EnumBattleFieldBgScale.Repeat },
	},
};

/** bgSize 小於角色排版尺寸（480×200）時被無視，自動回退為角色排版尺寸 / bgSize smaller than layout (480×200) is ignored, falls back to layout size */
export const BgSizeIgnoredWhenSmaller: Story = {
	args: {
		/**
		 * 300×140 小於 480×200 → 被防禦無視，背景框維持 480×200 / 300×140 < 480×200 → ignored, box stays 480×200
		 */
		bgSize: { width: 300, height: 140 },
		config: createSampleConfig('egypt'),
	},
};

/** 埃及背景（圖檔 768×320，大於角色排版 480×200）：以原生尺寸作為背景框，角色框置底置中 / Egypt bg (768×320 > 480×200): use native size as bg box, sprite frame centered-bottom */
export const BgEgyptNative: Story = {
	args: {
		bgSize: { width: 768, height: 320 },
		config: createSampleConfig('egypt'),
	},
};

/** 埃及背景：背景框維持 480×200，以 cover 縮放覆蓋整個框 / Egypt bg: keep 480×200 box, cover-scaled to fill the box */
export const BgEgyptCover: Story = {
	args: {
		config: { ...createSampleConfig('egypt'), bgScale: EnumBattleFieldBgScale.Cover },
	},
};

/**
 * 雙框模式：戰場（768×320）大於排版框（480×200），敵我雙方各佔一個排版框
 * Dual-frame mode: the scene (768×320) is larger than the frame (480×200), so each side owns a frame
 *
 * 未指定 frameOffsets 時兩個框依 valign 疊在同一位置，視覺與單框模式完全一致；
 * 分組依 sprite.side（左半場敵方＝左隊、右半場我方＝右隊）。
 * Without frameOffsets both frames stack on the same spot via valign, looking exactly like
 * single-frame mode; grouping follows sprite.side (left-half enemies = left team, right-half
 * allies = right team).
 */
export const DualFrameSplit: Story = {
	args: {
		bgSize: { width: 768, height: 320 },
	},
};

/**
 * 雙框編輯模式的初始位置（同時是編輯面板「重置」的還原目標）
 * Initial dual-frame offsets (also the edit panel's reset target)
 */
const dualFrameInitialOffsets: IBattleSidePair<IBattleFieldFrameOffset> = {
	left: { x: 24, y: 40 },
	right: { x: 264, y: 40 },
};

/**
 * 雙框編輯模式：分別指定初始位置，並可直接在畫面上拖曳敵我雙方的排版框
 * Dual-frame edit mode: initial positions per side, and both frames are draggable on the canvas
 *
 * 拖曳時框收斂在戰場範圍內（x∈[0,288]、y∈[0,120]），徽章顯示所屬隊伍、座標與相對百分比。
 * 拖曳過程「不」寫回 args.frameOffsets（逐次回寫會重繪整棵 story 樹造成卡頓，
 * 且滯後的中間值會在放開後回送成回聲、讓框繼續移動）；
 * 即時座標改由 frameOffsetLiveStore 直通編輯面板的座標 % 讀值（零 story 重繪），
 * onFrameOffsetChange 僅在放開時單次寫回最終座標，讓對齊按鈕以「目前實際位置」為準。
 * 編輯面板提供：重置、5/6 等分對齊、十字對齊、左右隊對齊高度、參考線與吸附開關、座標相對 % 讀值。
 * While dragging, a frame clamps inside the scene (x∈[0,288], y∈[0,120]) and the badge shows
 * the team, coordinates and relative percentage. Nothing is written back to args.frameOffsets
 * during the drag (per-drag write-backs re-rendered the whole story tree and caused stutter,
 * and their lagging mid-drag echoes arrived after release and kept the frame moving); the live
 * position goes straight to the edit panel's % readout via frameOffsetLiveStore (zero story
 * re-renders), while onFrameOffsetChange writes the final coordinate back once on release so
 * the alignment buttons always operate on the actual current positions.
 * The panel offers reset, 5/6-division alignment, cross alignment, team height alignment, the
 * guides and snap toggles, and the relative-% readout.
 */
export const DualFrameEditable: Story = {
	args: {
		bgSize: { width: 768, height: 320 },
		editable: true,
		showEditGuides: true,
		snapToGuides: true,
		frameOffsets: dualFrameInitialOffsets,
	},
	/**
	 * 放開時單次寫回 args.frameOffsets（useArgs 在故事 render 內可安全使用）
	 * Write the final position back into args.frameOffsets once on release (useArgs is safe
	 * inside a story render)
	 */
	render: (args) =>
	{
		const [, updateArgs] = useArgs();
		/**
		 * 以 ref 保存「最新」args：updateArgs 是物件合併且故事 rerender 有延遲，
		 * 若直接閉包 args.frameOffsets，快速連續拖兩框時後一次回寫會把
		 * 另一側的座標覆寫成舊值（跨框回歸）；ref 讓每次寫入都以最新值為底。
		 * Keep the "latest" args in a ref: updateArgs merges plain objects and story rerenders
		 * lag, so closing over args.frameOffsets would let a second quick drag write back a
		 * stale value for the OTHER side (cross-side regression); the ref makes every write
		 * spread the freshest pair.
		 */
		const latestArgsRef = React.useRef(args);
		latestArgsRef.current = args;
		return (
			<BattleFieldLayers
				{...args}
				onFrameOffsetChange={({ side, offset }) =>
				{
					const current = (latestArgsRef.current.frameOffsets ?? dualFrameInitialOffsets) as IBattleSidePair<IBattleFieldFrameOffset>;
					updateArgs({
						frameOffsets: {
							...current,
							[side]: offset,
						} as IBattleSidePair<IBattleFieldFrameOffset>,
					});
				}}
			/>
		);
	},
	decorators: [
		makeBattleFieldEditModeDecorator({
			sceneSize: { width: 768, height: 320 },
			frameOps: true,
			showBgControls: true,
			initialFrameOffsets: dualFrameInitialOffsets,
		}),
	],
};
