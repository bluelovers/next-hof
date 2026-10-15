/**
 * 戰場編輯參考線組件
 * Battlefield edit-mode guide lines component
 *
 * 編輯模式的疊加圖層：把 editModeUtils 計算出的參考線畫在座標空間上，
 * 本身不攔截任何指標事件，因此拖曳／點擊都完全不受影響。
 * An edit-mode overlay that draws the guide lines computed by editModeUtils over the
 * coordinate space; it never intercepts pointer events, so dragging and clicking are
 * completely unaffected.
 *
 * 線的分類與配色：
 * - 5 等分線（金色系）：20 / 40 / 60 / 80%
 * - 6 等分線（灰色系）：16.7 / 33.3 / 50 / 66.7 / 83.3%
 * - 十字中心線（亮金色虛線）：正中央的垂直線與水平線
 * Line categories and colours:
 * - 5-division lines (gold): 20 / 40 / 60 / 80%
 * - 6-division lines (grey): 16.7 / 33.3 / 50 / 66.7 / 83.3%
 * - Center cross (bright gold, dashed): the vertical and horizontal middle lines.
 */
import React from 'react';
import type { ISpriteImageSize } from './spriteImageSizes';
import {
	computeCrossGuideLines,
	computeDivisionGuideLines,
	EnumEditModeGuideAxis,
	EnumEditModeGuideKind,
	type IEditModeDivision,
	type IEditModeGuideLine,
} from './editModeUtils';
import './BattleFieldEditGuides.css';

/** 參考線組件屬性 / Guide-lines component props */
export interface IBattleFieldEditGuidesProps
{
	/** 座標空間（戰場）尺寸 / Coordinate-space (scene) size */
	size: ISpriteImageSize;
	/** 顯示的等分數（預設 5 與 6 全部顯示；傳空陣列即只留十字線） / Division counts to show (default: both 5 and 6; pass an empty array for the cross only) */
	divisions?: readonly IEditModeDivision[];
	/** 是否顯示十字中心線（預設 true） / Whether to show the center cross (default true) */
	showCross?: boolean;
}

/** 參考線的 inline 定位（依方向決定固定哪一條軸） / Inline positioning of one guide line (which axis it fixes) */
function lineStyle(line: IEditModeGuideLine): React.CSSProperties
{
	return line.axis === EnumEditModeGuideAxis.Vertical
		? { left: line.pos }
		: { top: line.pos };
}

/** 參考線的 className（含方向與等分數修飾，便於 CSS 依種類上色） / Class name of one guide line (including axis and division modifiers so CSS can colour by kind) */
function lineClassName(line: IEditModeGuideLine): string
{
	const axis = line.axis === EnumEditModeGuideAxis.Vertical ? 'vertical' : 'horizontal';
	if (line.kind === EnumEditModeGuideKind.Cross)
	{
		return `battle-edit-guide battle-edit-guide--${axis} battle-edit-guide--cross`;
	}
	return `battle-edit-guide battle-edit-guide--${axis} battle-edit-guide--division${line.divisions}`;
}

/**
 * 戰場編輯參考線組件
 * Battlefield edit-mode guide lines component
 *
 * 由父層（BattleFieldLayers 或 BattleFieldSpriteLayers）在編輯模式下條件渲染；
 * 組件本身沒有任何互動行為，純視覺輔助。
 * Conditionally rendered by the parent (BattleFieldLayers or BattleFieldSpriteLayers) in
 * edit mode; the component has no interactive behaviour at all — pure visual aid.
 */
export const BattleFieldEditGuides: React.FC<IBattleFieldEditGuidesProps> = ({
	size,
	divisions,
	showCross = true,
}) =>
{
	const lines: IEditModeGuideLine[] = [
		...computeDivisionGuideLines(size, divisions),
		...(showCross ? computeCrossGuideLines(size) : []),
	];

	return (
		<div className="battle-edit-guides" style={{ width: size.width, height: size.height }}>
			{lines.map((line, i) => (
				<span
					key={`${line.axis}-${line.kind}-${line.pos}-${i}`}
					className={lineClassName(line)}
					style={lineStyle(line)}
				/>
			))}
		</div>
	);
};
