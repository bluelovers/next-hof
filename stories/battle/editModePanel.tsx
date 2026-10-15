/**
 * 戰場編輯模式面板（共用 Storybook 裝飾器）
 * Battlefield edit-mode panel (shared Storybook decorator)
 *
 * 把編輯模式的輔助工具（editModeUtils）包成一排可點擊的按鈕，讓 story 直接在畫面上操作：
 * - 重置：還原初始位置並遞增 resetToken（元件端把框交回初始 offset、精靈清空覆寫）
 * - 等分對齊法：把左右兩個排版框各自吸到 5 或 6 等分線（水平與垂直同時對齊）
 * - 十字對齊法：吸到正中央的十字線（5/6 等分都不會涵蓋正中央，故獨立提供）
 * - 參考線顯示隱藏：切換 args.showEditGuides（由元件疊加 BattleFieldEditGuides）
 * - 吸附開關：切換 args.snapToGuides（拖曳時是否貼齊參考線）
 * - 座標相對 %：以戰場尺寸為基準，即時顯示左右框座標的相對百分比
 * - 左右隊對齊高度：把兩個框的 y 收斂到同一值（取最上方）
 *
 * All helpers from editModeUtils are exposed as clickable buttons so stories can be operated
 * directly on the canvas: reset (restore initial positions + bump resetToken), division
 * alignment (snap both frames to the 5 or 6 division lines on both axes), cross alignment
 * (snap to the center cross, which neither division set covers), the guides and snap
 * toggles (via args.showEditGuides / args.snapToGuides), a live relative-% readout of both
 * frame coordinates, and team height alignment (bring both y values to the same value).
 */
import React from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Decorator } from '../decorators';
import { GAME_FONT } from '../decorators';
import type { ISpriteImageSize } from '../../src/components/battle/spriteImageSizes';
import type {
	IBattleFieldFrameOffset,
	IBattleSidePair,
} from '../../src/components/battle/types';
import {
	alignPairHeights,
	computeCrossGuideLines,
	computeDivisionGuideLines,
	computeRelativePercent,
	formatRelativePercent,
	snapToGuideLines,
	type IEditModeGuideLine,
} from '../../src/components/battle/editModeUtils';

/** 面板選項 / Panel options */
export interface IBattleEditModePanelOptions
{
	/**
	 * 參考線與對齊運算的座標空間（＝戰場尺寸）
	 * Coordinate-space size for guides and alignment ops (the scene size)
	 */
	sceneSize: ISpriteImageSize;
	/**
	 * 顯示排版框專用操作（等分／十字對齊、左右隊對齊高度、座標 % 讀值）
	 * Show frame-specific ops (division/cross alignment, team height alignment, % readout)
	 */
	frameOps?: boolean;
	/**
	 * 顯示「參考線」開關（元件需支援 showEditGuides；不支援的故事請關閉）
	 * Show the guides toggle (the component must support showEditGuides; turn off otherwise)
	 */
	showGuidesToggle?: boolean;
	/** 顯示「吸附」開關（元件需支援 snapToGuides） / Show the snap toggle (component must support snapToGuides) */
	showSnapToggle?: boolean;
	/**
	 * 重置的還原目標：提供時「重置」會把 frameOffsets 一起還原成此值
	 * Reset target: when given, "reset" also restores frameOffsets to this value
	 */
	initialFrameOffsets?: IBattleSidePair<IBattleFieldFrameOffset>;
}

/** 面板容器樣式（暗色工具列，與戰場舞台同一色系） / Panel container style (dark toolbar matching the stage palette) */
const panelStyle: React.CSSProperties = {
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: '6px',
	padding: '6px 8px',
	marginBottom: '8px',
	borderRadius: '4px',
	background: '#1a2230',
	fontFamily: GAME_FONT,
	fontSize: '12px',
	color: '#bdc8d7',
};

/** 面板按鈕樣式（暗色小按鈕） / Panel button style (small dark button) */
const buttonStyle: React.CSSProperties = {
	background: '#243044',
	border: '1px solid #3a4a63',
	borderRadius: '3px',
	color: '#e0e0e0',
	fontFamily: GAME_FONT,
	fontSize: '12px',
	padding: '2px 8px',
	cursor: 'pointer',
};

/** 開啟中的切換鈕樣式（亮藍底，與關閉狀態明顯區分） / Active toggle style (bright blue, clearly distinct from the off state) */
const activeButtonStyle: React.CSSProperties = {
	...buttonStyle,
	background: '#3a5a80',
	borderColor: '#6d94c4',
};

/** 讀值文字樣式（座標相對 %） / Readout text style (relative %) */
const readoutStyle: React.CSSProperties = {
	marginLeft: '4px',
	color: '#e0e0e0',
};

/**
 * 建立編輯模式面板裝飾器（story 用）
 * Build the edit-mode panel decorator (for stories)
 *
 * 裝飾器在 Storybook 渲染期間被呼叫，可安全使用 useArgs hook 讀寫 story args。
 * Decorators are invoked during the Storybook render, so the useArgs hook is safe here.
 */
export const makeBattleFieldEditModeDecorator = (
	options: IBattleEditModePanelOptions,
): Decorator =>
{
	const {
		sceneSize,
		frameOps = false,
		showGuidesToggle = true,
		showSnapToggle = true,
		initialFrameOffsets,
	} = options;

	return (Story) =>
	{
		const [args, updateArgs] = useArgs();
		const current = (args ?? {}) as Record<string, unknown>;
		const offsets = current.frameOffsets as IBattleSidePair<IBattleFieldFrameOffset> | undefined;
		const guidesOn = current.showEditGuides === true;
		const snapOn = current.snapToGuides === true;

		/** 對齊運算的基準位置：優先用目前的 frameOffsets，沒有才退回初始值 / Alignment base: current frameOffsets first, initial values as fallback */
		const resolveOffsets = (): IBattleSidePair<IBattleFieldFrameOffset> =>
			offsets ?? initialFrameOffsets ?? { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };

		/** 重置：還原初始位置（若有）並遞增 resetToken 讓元件清掉內部拖曳狀態 / Reset: restore the initial positions (if any) and bump resetToken so the component clears its internal drag state */
		const handleReset = () =>
		{
			updateArgs({
				resetToken: Number(current.resetToken ?? 0) + 1,
				...(initialFrameOffsets ? { frameOffsets: initialFrameOffsets } : {}),
			});
		};

		/** 把左右兩框各自吸到指定參考線集合（水平與垂直同時） / Snap both frames to the given guide-line set (both axes at once) */
		const applySnap = (lines: IEditModeGuideLine[]) =>
		{
			const base = resolveOffsets();
			updateArgs({
				frameOffsets: {
					left: snapToGuideLines(base.left, sceneSize, { lines }).pos,
					right: snapToGuideLines(base.right, sceneSize, { lines }).pos,
				},
			});
		};

		/** 左右隊對齊高度：兩個框的 y 收斂到同一值（取最上方） / Team height alignment: bring both frames' y to the same value (the topmost) */
		const handleAlignHeights = () =>
		{
			updateArgs({ frameOffsets: alignPairHeights(resolveOffsets()) });
		};

		const base = resolveOffsets();
		const leftPercent = computeRelativePercent(base.left, sceneSize);
		const rightPercent = computeRelativePercent(base.right, sceneSize);

		return (
			<>
				<div style={panelStyle}>
					<button style={buttonStyle} onClick={handleReset}>重置</button>
					{frameOps && (
						<>
							<button style={buttonStyle} onClick={() => applySnap(computeDivisionGuideLines(sceneSize, [5]))}>5 等分對齊</button>
							<button style={buttonStyle} onClick={() => applySnap(computeDivisionGuideLines(sceneSize, [6]))}>6 等分對齊</button>
							<button style={buttonStyle} onClick={() => applySnap(computeCrossGuideLines(sceneSize))}>十字對齊</button>
							<button style={buttonStyle} onClick={handleAlignHeights}>左右隊對齊高度</button>
						</>
					)}
					{showGuidesToggle && (
						<button
							style={guidesOn ? activeButtonStyle : buttonStyle}
							onClick={() => updateArgs({ showEditGuides: !guidesOn })}
						>
							參考線 {guidesOn ? '開' : '關'}
						</button>
					)}
					{showSnapToggle && (
						<button
							style={snapOn ? activeButtonStyle : buttonStyle}
							onClick={() => updateArgs({ snapToGuides: !snapOn })}
						>
							吸附 {snapOn ? '開' : '關'}
						</button>
					)}
					{frameOps && (
						<span style={readoutStyle}>
							左隊 {base.left.x},{base.left.y}（{formatRelativePercent(leftPercent)}）｜
							右隊 {base.right.x},{base.right.y}（{formatRelativePercent(rightPercent)}）
						</span>
					)}
				</div>
				<Story />
			</>
		);
	};
};
