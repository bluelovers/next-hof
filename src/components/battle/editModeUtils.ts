/**
 * 戰場編輯模式輔助工具（單一事實來源）
 * Battlefield edit-mode utilities (single source of truth)
 *
 * 全部是「不依賴 DOM / 不呼叫 IO」的純函式，供編輯模式的元件與 story 面板共用：
 * - 參考線：等分線（5 / 6 等分）與十字中心線的座標計算，以及顯示／隱藏的資料來源
 * - 吸附：拖曳時把座標吸到容差內最近的參考線
 * - 強制對齊：按鈕觸發時「無容差」直接吸到最近的參考線（等分／十字）
 * - 邊緣對齊：把排版框貼齊戰場的四邊與中心（水平左/中/右、垂直上/中/下）
 * - 相對座標：把像素座標換算為相對戰場的百分比
 * - 對齊：左右隊對齊高度（可選擇以左隊、右隊或兩者平均為基準）
 * - 收斂：把框座標收斂在戰場可動範圍內（與元件端 clamp 同一套規則）
 * - 重置：定義「重置」代表回到什麼狀態（框＝初始值或 CSS 對齊、精靈＝清除覆寫）
 *
 * All helpers are pure (no DOM access, no IO) and shared by the edit-mode components and the
 * Storybook edit panel:
 * - Guides: coordinate math for division lines (5 / 6 divisions) and the center cross, which
 *   also backs the show/hide toggle.
 * - Snapping: pull a position to the nearest guide line within a tolerance while dragging.
 * - Force alignment: button-triggered, tolerance-free snap to the nearest guide line
 *   (division / cross).
 * - Edge alignment: flush the frame against the scene's edges and center (horizontal
 *   left/center/right, vertical top/middle/bottom).
 * - Relative position: convert pixel coordinates into percentages of the scene.
 * - Alignment: align the two sides' heights (pick the left, the right, or the average as the
 *   reference).
 * - Clamping: clamp a frame offset inside the scene's movable range (same rules as the
 *   component-side clamp).
 * - Reset: defines what "reset" means (frame = initial value or CSS alignment; sprites =
 *   clear the overrides).
 */
import type { ISpriteImageSize } from './spriteImageSizes';
import type {
	IBattleSidePair,
	IBattleFieldFrameOffset,
	IBattleFieldPoint,
} from './types';

/**
 * 編輯模式支援的等分數（水平／垂直共用）
 * Division counts supported by edit mode (shared by both axes)
 *
 * 5 與 6 等分都「不會」涵蓋正中央，故十字對齊另行提供（見 computeCrossGuideLines）。
 * Neither 5- nor 6-division covers the exact middle, so center-cross alignment is provided
 * separately (see computeCrossGuideLines).
 */
export const EDIT_MODE_DIVISIONS = [5, 6] as const;

/** 等分數型別（限 5 / 6） / Division count type (limited to 5 / 6) */
export type IEditModeDivision = (typeof EDIT_MODE_DIVISIONS)[number];

/** 參考線方向 / Guide-line axis */
export enum EnumEditModeGuideAxis
{
	/** 垂直線（固定 x 座標，貫穿整個高度） / Vertical line (fixed x, spans the full height) */
	Vertical = 'vertical',
	/** 水平線（固定 y 座標，貫穿整個寬度） / Horizontal line (fixed y, spans the full width) */
	Horizontal = 'horizontal',
}

/** 參考線種類 / Guide-line kind */
export enum EnumEditModeGuideKind
{
	/** 等分線（5 或 6 等分） / Division line (5 or 6 divisions) */
	Division = 'division',
	/** 十字中心線（正中央，等分線涵蓋不到） / Center cross (the exact middle, which the division lines never cover) */
	Cross = 'cross',
}

/** 一條參考線 / A single guide line */
export interface IEditModeGuideLine
{
	/** 方向 / Axis */
	axis: EnumEditModeGuideAxis;
	/** 種類 / Kind */
	kind: EnumEditModeGuideKind;
	/**
	 * 戰場座標（px）：垂直線用 x、水平線用 y
	 * Scene coordinate (px): vertical lines carry x, horizontal lines carry y
	 */
	pos: number;
	/** 等分線所屬的等分數（十字線不帶此欄位） / Division count of this line (absent on center-cross lines) */
	divisions?: IEditModeDivision;
}

/** 取得單軸的等分點座標（含兩端 0 與全長，整數化避免小數座標） / Coordinates along one axis at every division step, including both ends (rounded to integers) */
function computeDivisionStops(total: number, divisions: number): number[]
{
	return Array.from({ length: divisions + 1 }, (_, i) => Math.round((total * i) / divisions));
}

/**
 * 建立等分參考線（水平與垂直）
 * Build division guide lines (both axes)
 *
 * 預設同時建立 5 與 6 等分兩組，呼叫端可只取其中一組。
 * By default both the 5- and 6-division sets are built; callers may ask for just one.
 */
export function computeDivisionGuideLines(
	size: ISpriteImageSize,
	divisions: readonly IEditModeDivision[] = EDIT_MODE_DIVISIONS,
): IEditModeGuideLine[]
{
	const lines: IEditModeGuideLine[] = [];
	for (const count of divisions)
	{
		for (const x of computeDivisionStops(size.width, count))
		{
			lines.push({ axis: EnumEditModeGuideAxis.Vertical, kind: EnumEditModeGuideKind.Division, pos: x, divisions: count });
		}
		for (const y of computeDivisionStops(size.height, count))
		{
			lines.push({ axis: EnumEditModeGuideAxis.Horizontal, kind: EnumEditModeGuideKind.Division, pos: y, divisions: count });
		}
	}
	return lines;
}

/**
 * 建立十字中心參考線（正中央的垂直線與水平線）
 * Build the center-cross guide lines (the vertical and horizontal middle lines)
 *
 * 5 等分切在 20/40/60/80%、6 等分切在 16.7/33.3/50/66.7/83.3% —— 後者雖有 50%，
 * 但為了兩種對齊法可獨立使用，十字線一律單獨建立。
 * 5-division cuts at 20/40/60/80% and 6-division at 16.7/33.3/50/66.7/83.3% — although the
 * latter contains 50%, the cross is always built separately so both alignment methods stay
 * independently usable.
 */
export function computeCrossGuideLines(size: ISpriteImageSize): IEditModeGuideLine[]
{
	return [
		{ axis: EnumEditModeGuideAxis.Vertical, kind: EnumEditModeGuideKind.Cross, pos: Math.round(size.width / 2) },
		{ axis: EnumEditModeGuideAxis.Horizontal, kind: EnumEditModeGuideKind.Cross, pos: Math.round(size.height / 2) },
	];
}

/**
 * 建立編輯模式的全部參考線（等分線 + 十字線）
 * Build every edit-mode guide line (division lines + center cross)
 */
export function computeEditModeGuideLines(
	size: ISpriteImageSize,
	divisions: readonly IEditModeDivision[] = EDIT_MODE_DIVISIONS,
): IEditModeGuideLine[]
{
	return [...computeDivisionGuideLines(size, divisions), ...computeCrossGuideLines(size)];
}

/** 預設吸附容差（px） / Default snap tolerance (px) */
export const EDIT_MODE_SNAP_TOLERANCE = 8;

/** 吸附選項 / Snap options */
export interface ISnapToGuideLinesOptions
{
	/** 吸附容差（px，預設 EDIT_MODE_SNAP_TOLERANCE） / Snap tolerance in px (default EDIT_MODE_SNAP_TOLERANCE) */
	tolerance?: number;
	/** 參考線集合（預設全部：等分線 + 十字線） / Guide lines to snap against (default: all) */
	lines?: IEditModeGuideLine[];
}

/** 吸附結果（含命中的參考線，便於 UI 提示） / Snap result (including the matched lines, handy for UI hints) */
export interface ISnapToGuideLinesResult
{
	/** 吸附後的位置（整數座標） / Position after snapping (integer coordinates) */
	pos: IBattleFieldPoint;
	/** 命中的垂直參考線（未命中則缺省） / Matched vertical guide (absent when not snapped) */
	snappedX?: IEditModeGuideLine;
	/** 命中的水平參考線（未命中則缺省） / Matched horizontal guide (absent when not snapped) */
	snappedY?: IEditModeGuideLine;
}

/**
 * 把位置吸附到容差內最近的參考線（水平對 x、垂直對 y，各自獨立）
 * Snap a position to the nearest guide line within tolerance (horizontal lines match x, vertical match y, independently)
 */
export function snapToGuideLines(
	pos: IBattleFieldPoint,
	size: ISpriteImageSize,
	options?: ISnapToGuideLinesOptions,
): ISnapToGuideLinesResult
{
	const tolerance = options?.tolerance ?? EDIT_MODE_SNAP_TOLERANCE;
	const lines = options?.lines ?? computeEditModeGuideLines(size);
	const next: IBattleFieldPoint = { x: Math.round(pos.x), y: Math.round(pos.y) };
	let snappedX: IEditModeGuideLine | undefined;
	let snappedY: IEditModeGuideLine | undefined;

	for (const line of lines)
	{
		if (line.axis === EnumEditModeGuideAxis.Vertical)
		{
			const distance = Math.abs(line.pos - next.x);
			if (distance <= tolerance && (!snappedX || distance < Math.abs(snappedX.pos - next.x)))
			{
				snappedX = line;
				next.x = line.pos;
			}
		}
		else
		{
			const distance = Math.abs(line.pos - next.y);
			if (distance <= tolerance && (!snappedY || distance < Math.abs(snappedY.pos - next.y)))
			{
				snappedY = line;
				next.y = line.pos;
			}
		}
	}

	return { pos: next, snappedX, snappedY };
}

/**
 * 強制對齊：無容差，直接把座標吸到「最近」的參考線（按鈕觸發用）
 * Force alignment: tolerance-free, snap straight to the NEAREST guide line (button-triggered)
 *
 * 拖曳時用 snapToGuideLines（容差內才吸），按鈕對齊則用本函式：
 * 框即使遠離所有參考線，也會被拉到最近的一條，不會「完全不動」。
 * Dragging uses snapToGuideLines (only within tolerance); button alignment uses this helper:
 * even when the frame is far from every guide it is pulled to the nearest one, instead of
 * staying put.
 */
export function forceSnapToGuideLines(
	pos: IBattleFieldPoint,
	size: ISpriteImageSize,
	options?: ISnapToGuideLinesOptions,
): ISnapToGuideLinesResult
{
	return snapToGuideLines(pos, size, { ...options, tolerance: Number.POSITIVE_INFINITY });
}

/**
 * 把框座標收斂在戰場可動範圍內（與元件端 clampFrameOffset 同一套規則）
 * Clamp a frame offset inside the scene's movable range (same rules as the component-side clamp)
 *
 * 戰場與排版框等大時可動範圍為 0；戰場較大時框可貼齊四邊而不超出畫面。
 * When the scene and frame share a size the movable range is 0; with a larger scene the frame
 * can sit flush against any edge without overflowing.
 */
export function clampFrameOffsetToScene(
	pos: IBattleFieldFrameOffset,
	frameSize: ISpriteImageSize,
	sceneSize: ISpriteImageSize,
): IBattleFieldFrameOffset
{
	const minX = Math.min(0, sceneSize.width - frameSize.width);
	const maxX = Math.max(0, sceneSize.width - frameSize.width);
	const minY = Math.min(0, sceneSize.height - frameSize.height);
	const maxY = Math.max(0, sceneSize.height - frameSize.height);
	return {
		x: Math.min(maxX, Math.max(minX, Math.round(pos.x))),
		y: Math.min(maxY, Math.max(minY, Math.round(pos.y))),
	};
}

/** 邊緣對齊目標（戰場的邊與中心；水平用 Left/Center/Right、垂直用 Top/Middle/Bottom） / Edge-alignment targets (the scene's edges and center; horizontal uses Left/Center/Right, vertical Top/Middle/Bottom) */
export enum EnumEditModeEdgeAlign
{
	/** 水平靠左 / Horizontal left */
	Left = 'left',
	/** 水平置中 / Horizontal center */
	Center = 'center',
	/** 水平靠右 / Horizontal right */
	Right = 'right',
	/** 垂直置頂（向上） / Vertical top */
	Top = 'top',
	/** 垂直置中 / Vertical middle */
	Middle = 'middle',
	/** 垂直置底（向下） / Vertical bottom */
	Bottom = 'bottom',
}

/**
 * 邊緣對齊：把框貼齊戰場的指定邊或中心，另一軸維持不變
 * Edge alignment: flush the frame against the scene's given edge or center, keeping the other axis
 *
 * 目標軸直接以「戰場尺寸 - 框尺寸」計算（置中則取半），再收斂在可動範圍內。
 * The target axis is computed directly from (scene size - frame size), centered when asked,
 * and then clamped inside the movable range.
 */
export function alignFrameToSceneEdge(
	pos: IBattleFieldFrameOffset,
	frameSize: ISpriteImageSize,
	sceneSize: ISpriteImageSize,
	edge: EnumEditModeEdgeAlign,
): IBattleFieldFrameOffset
{
	const next: IBattleFieldFrameOffset = { ...pos };
	switch (edge)
	{
		case EnumEditModeEdgeAlign.Left:
			next.x = 0;
			break;
		case EnumEditModeEdgeAlign.Center:
			next.x = Math.round((sceneSize.width - frameSize.width) / 2);
			break;
		case EnumEditModeEdgeAlign.Right:
			next.x = sceneSize.width - frameSize.width;
			break;
		case EnumEditModeEdgeAlign.Top:
			next.y = 0;
			break;
		case EnumEditModeEdgeAlign.Middle:
			next.y = Math.round((sceneSize.height - frameSize.height) / 2);
			break;
		case EnumEditModeEdgeAlign.Bottom:
			next.y = sceneSize.height - frameSize.height;
			break;
	}
	return clampFrameOffsetToScene(next, frameSize, sceneSize);
}

/** 相對座標（百分比，相對戰場左上角） / Relative coordinates (percentage measured from the scene's top-left) */
export interface IEditModeRelativePercent
{
	/** 相對寬度百分比 / Percentage of the width */
	x: number;
	/** 相對高度百分比 / Percentage of the height */
	y: number;
}

/** 四捨五入到小數 1 位 / Round to one decimal place */
function round1(value: number): number
{
	return Math.round(value * 10) / 10;
}

/**
 * 計算座標的相對百分比（相對戰場尺寸，四捨五入到小數 1 位）
 * Convert a coordinate into percentages of the scene (rounded to one decimal)
 *
 * 尺寸為 0 時回 0，避免除以 0；百分比基準與參考線、吸附同一份 size，確保三者一致。
 * A zero size yields 0 to avoid dividing by zero; the same `size` backs guides, snapping and
 * percentages so all three stay consistent.
 */
export function computeRelativePercent(
	pos: IBattleFieldPoint,
	size: ISpriteImageSize,
): IEditModeRelativePercent
{
	return {
		x: size.width > 0 ? round1((pos.x / size.width) * 100) : 0,
		y: size.height > 0 ? round1((pos.y / size.height) * 100) : 0,
	};
}

/** 格式化百分比字串（如 `12.5%, 40%`；整數不帶小數點） / Format a percentage pair as a string (e.g. `12.5%, 40%`; integers print without decimals) */
export function formatRelativePercent(percent: IEditModeRelativePercent): string
{
	return `${percent.x}%, ${percent.y}%`;
}

/** 左右隊高度對齊的基準 / Reference used when aligning the two sides' heights */
export enum EnumEditModePairHeightAlign
{
	/** 以左隊高度為基準（右隊跟隨） / Use the left team as the reference (right follows) */
	Left = 'left',
	/** 以右隊高度為基準（左隊跟隨） / Use the right team as the reference (left follows) */
	Right = 'right',
	/** 兩者平均（四捨五入） / Average of both (rounded) */
	Average = 'average',
}

/**
 * 左右隊對齊高度：兩個排版框同尺寸，故「對齊高度」＝把兩者的 y 收斂到同一值
 * Align the two sides' heights: the frames share a size, so aligning heights means bringing
 * both y values to one value
 *
 * 基準可選：以左隊、以右隊，或兩者平均（預設以左隊）；只回傳新值，不修改輸入。
 * The reference is selectable: the left team, the right team, or the average of both
 * (default: left); a new pair is returned and the input is never mutated.
 */
export function alignPairHeights(
	pair: IBattleSidePair<IBattleFieldFrameOffset>,
	align: EnumEditModePairHeightAlign = EnumEditModePairHeightAlign.Left,
): IBattleSidePair<IBattleFieldFrameOffset>
{
	const y = align === EnumEditModePairHeightAlign.Right
		? pair.right.y
		: align === EnumEditModePairHeightAlign.Average
			? Math.round((pair.left.y + pair.right.y) / 2)
			: pair.left.y;
	return {
		left: { ...pair.left, y },
		right: { ...pair.right, y },
	};
}

/**
 * 重置排版框位置：回到呼叫端提供的初始值；未提供時回傳 null ＝ 交回 CSS 對齊
 * Reset a frame offset: back to the caller's initial value, or null (= hand it back to CSS alignment)
 */
export function resetFrameOffset(
	initial?: IBattleFieldFrameOffset,
): IBattleFieldFrameOffset | null
{
	return initial ? { ...initial } : null;
}

/**
 * 重置精靈位置覆寫：回傳空表 ＝ 精靈回到 sprites 原始座標
 * Reset sprite position overrides: returns an empty table so sprites fall back to their own coordinates
 */
export function resetSpriteOverrides(): Record<number, IBattleFieldPoint>
{
	return {};
}
