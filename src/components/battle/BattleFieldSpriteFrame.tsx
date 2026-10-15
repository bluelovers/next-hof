/**
 * 戰場精靈排版框組件
 * Battlefield sprite layout frame component
 *
 * 位於「背景」與「角色精靈圖層」之間的中介圖層，
 * 用固定尺寸（width x height）框住角色精靈，
 * 使背景尺寸（bgSize）可以獨立放大而不影響角色精靈的排版
 * Intermediate layer between the background and the sprite layers.
 * Frames the character sprites at a fixed size (width x height) so the
 * background size (bgSize) can be enlarged independently without affecting
 * the character sprite layout.
 *
 * 編輯模式（editable）：當戰場大於排版框時，框可直接用指標拖曳移動，
 * 座標會收斂在戰場範圍內並透過 onOffsetChange 即時回報，
 * 框上另顯示「框識別文字 + 座標 + 相對百分比」徽章，方便在 story 預覽時讀值對位。
 * 另可開啟 snapToGuides 吸附參考線（等分線 + 十字中心線），
 * 並以 resetToken 明確重置位置；關閉編輯模式不會重置（成果保留）。
 * Edit mode (editable): when the scene is larger than the frame, the frame can be dragged
 * with a pointer; coordinates are clamped inside the scene and reported live via
 * onOffsetChange, and a "label + coordinates + relative percentage" badge is shown so
 * positions can be read while previewing in Storybook.
 * snapToGuides additionally snaps to the guide lines (division lines + center cross),
 * resetToken requests an explicit reset, and turning edit mode OFF never resets (the result
 * is kept).
 */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type {
	IBattleSprite,
	IBattleFieldVAlign,
	IBattleSpriteLabelOptions,
	IBattleFieldEditModeOptions,
	IBattleFieldFrameOffset,
} from './types';
import type { ISpriteImageSize } from './spriteImageSizes';
import { BattleFieldSpriteLayers } from './BattleFieldSpriteLayers';
import {
	computeRelativePercent,
	formatRelativePercent,
	resetFrameOffset,
	snapToGuideLines,
} from './editModeUtils';
import './BattleFieldSpriteFrame.css';
import type { IStyleProps } from '#/components/shared/types';
import { EnumBattleFieldVAlign } from '#/components/battle/enums';

/**
 * 戰場精靈排版框屬性
 * Battlefield sprite layout frame props
 *
 * 標籤開關共用 IBattleSpriteLabelOptions、編輯開關共用 IBattleFieldEditModeOptions
 * Label toggle comes from the shared IBattleSpriteLabelOptions; edit toggle from the
 * shared IBattleFieldEditModeOptions.
 */
export interface IBattleFieldSpriteFrameProps extends IBattleSpriteLabelOptions, IBattleFieldEditModeOptions, IStyleProps
{
	/** 精靈列表 / Sprite list */
	sprites: IBattleSprite[];
	/** 排版框寬度（角色排版尺寸） / Frame width (sprite layout size) */
	width: number;
	/** 排版框高度（角色排版尺寸） / Frame height (sprite layout size) */
	height: number;
	/** 垂直對齊方式（預設 bottom） / Vertical alignment (default bottom) */
	valign?: IBattleFieldVAlign;
	/**
	 * 框位置（戰場大於排版框時使用）
	 * Frame offset (used when the scene is larger than the frame)
	 *
	 * 提供後框改為絕對定位，忽略水平置中與 valign；未提供時沿用 CSS 對齊。
	 * Once provided the frame is absolutely positioned, ignoring horizontal centering and
	 * valign; when omitted the CSS alignment is kept.
	 */
	offset?: IBattleFieldFrameOffset;
	/**
	 * 框被拖曳移動時回報新座標（編輯模式；拖曳過程逐次回報）
	 * Reports the new offset while the frame is dragged (edit mode; reported on every move)
	 */
	onOffsetChange?: (offset: IBattleFieldFrameOffset) => void;
	/** 編輯模式徽章的框識別文字（如 左隊 / 右隊） / Identifying text on the edit-mode badge (e.g. left/right team) */
	label?: string;
}

/**
 * 量測框目前（CSS 對齊後）的視覺左上角，轉為絕對座標
 * Measure the frame's current (CSS-aligned) visual top-left and convert it to absolute coords
 *
 * offsetLeft / offsetTop 不含 transform，因此依對齊方式補回水平置中的 translateX(-50%)
 * 與置中的 translateY(-50%)；此算法同時免疫外層 transform: scale() 的縮放影響。
 * offsetLeft / offsetTop exclude transforms, so the horizontal translateX(-50%) (and the
 * middle-aligned translateY(-50%)) is added back per alignment; the math is therefore also
 * immune to any ancestor transform: scale().
 */
function measureFrameOffset(el: HTMLElement, valign: IBattleFieldVAlign): IBattleFieldFrameOffset
{
	return {
		x: el.offsetLeft - el.offsetWidth / 2,
		y: valign === EnumBattleFieldVAlign.Middle
			? el.offsetTop - el.offsetHeight / 2
			: el.offsetTop,
	};
}

/**
 * 把框位置收斂在戰場（offsetParent）範圍內
 * Clamp the frame offset inside the scene (the offsetParent)
 *
 * 戰場與排版框同尺寸時可動範圍為 0（無處可移）；戰場較大時框可完整貼齊四邊而不被拖出畫面。
 * When the scene and the frame share a size the range is 0 (nowhere to move); with a larger
 * scene the frame can sit flush against any edge without being dragged out of view.
 */
function clampFrameOffset(
	parent: HTMLElement,
	pos: IBattleFieldFrameOffset,
	width: number,
	height: number,
): IBattleFieldFrameOffset
{
	const minX = Math.min(0, parent.clientWidth - width);
	const maxX = Math.max(0, parent.clientWidth - width);
	const minY = Math.min(0, parent.clientHeight - height);
	const maxY = Math.max(0, parent.clientHeight - height);
	return {
		x: Math.min(maxX, Math.max(minX, Math.round(pos.x))),
		y: Math.min(maxY, Math.max(minY, Math.round(pos.y))),
	};
}

/** 拖曳狀態（起始游標座標 + 起始框座標） / Drag state (start cursor + start frame offset) */
interface IFrameDragState
{
	/** 起始游標 X / Start cursor X */
	startX: number;
	/** 起始游標 Y / Start cursor Y */
	startY: number;
	/** 起始框座標 X / Start frame offset X */
	baseX: number;
	/** 起始框座標 Y / Start frame offset Y */
	baseY: number;
}

/**
 * 戰場精靈排版框組件
 * Battlefield sprite layout frame component
 *
 * 以 width x height 的尺寸框住角色精靈圖層，
 * 作為背景與精靈之間的保護層，固定角色排版座標的原點
 * Frames the sprite layers at width x height, acting as a protective
 * layer between background and sprites and fixing the sprite layout origin.
 *
 * 水平永遠置中；垂直位置由 valign 控制（預設 bottom）；
 * 一旦進入編輯（offset 或拖曳）則改為由框座標直接定位。
 * Always horizontally centered; vertical position controlled by valign (default bottom);
 * once editing (offset or a drag) starts, the frame is positioned directly by its coordinates.
 */
export const BattleFieldSpriteFrame: React.FC<IBattleFieldSpriteFrameProps> = ({
	sprites,
	width,
	height,
	showSpriteLabels,
	valign,
	style,
	className,
	editable,
	offset,
	onOffsetChange,
	label,
	snapToGuides,
	resetToken,
}) =>
{
	/** 框 DOM（量測與指標擷取用） / Frame DOM (measurement and pointer capture) */
	const frameRef = useRef<HTMLDivElement>(null);
	/**
	 * 框位置：null＝尚未絕對定位（沿用 CSS 的置中／valign 對齊）；
	 * 量測或拖曳後改為絕對座標，切換瞬間不會跳動。
	 * Frame offset: null = not yet absolutely positioned (CSS centering/valign applies);
	 * after measuring or dragging it becomes absolute, so nothing jumps at the switch.
	 */
	const [frameOffset, setFrameOffset] = useState<IBattleFieldFrameOffset | null>(offset ?? null);
	/** 是否已量測過（編輯模式只量一次） / Whether the measurement already ran (edit mode measures once) */
	const measuredRef = useRef(false);
	/** 拖曳狀態（僅拖曳期間非 null） / Drag state (non-null only while dragging) */
	const dragRef = useRef<IFrameDragState | null>(null);

	/** 外部 offset 值（以值而非物件身份進 deps，避免行內物件每次重建都觸發同步） / External offset values (value-based deps so inline objects don't re-sync every render) */
	const offsetX = offset?.x;
	const offsetY = offset?.y;
	/** 對齊方式（量測需與 CSS 一致，故納入 deps） / Alignment (measurement must match the CSS, so it is a dep) */
	const align = valign ?? EnumBattleFieldVAlign.Bottom;
	/**
	 * 座標空間（戰場）尺寸：由 offsetParent 量得，供徽章的相對百分比顯示使用
	 * Coordinate-space (scene) size, measured from the offsetParent; used by the badge's
	 * relative-percentage readout.
	 */
	const [sceneSize, setSceneSize] = useState<ISpriteImageSize | null>(null);

	/**
	 * 外部 offset 同步：只有 offset 值真的改變時才覆寫內部位置。
	 * 注意「關閉編輯模式」不會回到初始值——編輯成果一律保留（見 resetToken）。
	 * External offset sync: the internal position is overwritten only when the external value
	 * really changed. Note that turning edit mode OFF does NOT restore the initial value —
	 * the edit result is always kept (see resetToken).
	 */
	useEffect(() =>
	{
		if (offsetX !== undefined && offsetY !== undefined)
		{
			setFrameOffset({ x: offsetX, y: offsetY });
		}
	}, [offsetX, offsetY]);

	/**
	 * 重置：明確觸發（resetToken 改變）時，框回到初始 offset；
	 * 未提供 offset 則交回 CSS 對齊，並允許編輯模式重新量測。
	 * Reset: on an explicit trigger (resetToken changed) the frame returns to its initial
	 * offset; without an offset it goes back to CSS alignment and edit mode may re-measure.
	 */
	useEffect(() =>
	{
		if (resetToken === undefined)
		{
			return;
		}
		dragRef.current = null;
		measuredRef.current = false;
		setSceneSize(null);
		setFrameOffset(resetFrameOffset(offsetX !== undefined && offsetY !== undefined ? { x: offsetX, y: offsetY } : undefined));
	}, [resetToken, offsetX, offsetY]);

	/**
	 * 編輯模式啟用時，先把目前對齊後的位置量成絕對座標：
	 * 既是拖曳的基準點，也讓徽章在第一次拖曳前就能顯示座標，且視覺上完全不動。
	 * When edit mode turns on, measure the current aligned position into absolute coords:
	 * it becomes the drag base point, lets the badge show coordinates before the first drag,
	 * and causes no visual change at all.
	 */
	useLayoutEffect(() =>
	{
		if (!editable || frameOffset || measuredRef.current)
		{
			return;
		}
		const el = frameRef.current;
		const parent = el?.offsetParent as HTMLElement | null;
		if (!el || !parent)
		{
			return;
		}
		measuredRef.current = true;
		setSceneSize({ width: parent.clientWidth, height: parent.clientHeight });
		setFrameOffset(measureFrameOffset(el, align));
	}, [editable, frameOffset, align]);

	/** 指標按下：記錄拖曳基準，並立即改用絕對定位避免切換瞬間位移 / Pointer down: record the drag base and switch to absolute positioning right away to avoid a jump */
	const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) =>
	{
		if (e.button !== 0)
		{
			return;
		}
		const el = frameRef.current;
		const parent = el?.offsetParent as HTMLElement | null;
		if (!el || !parent)
		{
			return;
		}
		/**
		 * 拖曳開始前刷新戰場尺寸：視窗可能在編輯期間被縮放，
		 * 讓相對百分比與吸附基準永遠是最新的。
		 * Refresh the scene size before dragging: the window may have been resized during
		 * editing, so percentages and snapping always use fresh numbers.
		 */
		setSceneSize({ width: parent.clientWidth, height: parent.clientHeight });
		const base = frameOffset ?? measureFrameOffset(el, align);
		dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: base.x, baseY: base.y };
		if (!frameOffset)
		{
			setFrameOffset(base);
		}
		e.preventDefault();
		try
		{
			el.setPointerCapture(e.pointerId);
		}
		catch
		{
			/**
			 * 指標擷取失敗不致命：游標離開框仍會收到 move/up，只是目標可能轉移
			 * Pointer-capture failure is not fatal: move/up still arrive outside the frame,
			 * only the target may differ.
			 */
		}
	};

	/** 指標移動：以「起始框座標 + 游標位移」計算新位置，可選吸附參考線後再收斂並回報 / Pointer move: new position = drag base + cursor delta, optionally snapped to the guide lines, then clamped and reported */
	const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) =>
	{
		const drag = dragRef.current;
		const parent = frameRef.current?.offsetParent as HTMLElement | null;
		if (!drag || !parent)
		{
			return;
		}
		const raw = {
			x: drag.baseX + (e.clientX - drag.startX),
			y: drag.baseY + (e.clientY - drag.startY),
		};
		/**
		 * 吸附基準＝戰場尺寸（與參考線、相對百分比同一份 size），
		 * 容差內貼齊最近的等分線或十字中心線。
		 * The snap basis is the scene size (the same `size` used by the guides and the
		 * relative percentages); within tolerance the frame sticks to the nearest division
		 * or center-cross line.
		 */
		const snapped = snapToGuides
			? snapToGuideLines(raw, { width: parent.clientWidth, height: parent.clientHeight }).pos
			: raw;
		const next = clampFrameOffset(parent, snapped, width, height);
		setFrameOffset(next);
		onOffsetChange?.(next);
	};

	/** 指標放開／取消：結束拖曳並釋放指標擷取 / Pointer up / cancel: end the drag and release pointer capture */
	const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) =>
	{
		if (!dragRef.current)
		{
			return;
		}
		dragRef.current = null;
		try
		{
			frameRef.current?.releasePointerCapture(e.pointerId);
		}
		catch
		{
			/**
			 * 釋放失敗可忽略（指標本來就未被擷取）
			 * Ignore a failed release (the pointer may not have been captured).
			 */
		}
	};

	/** 基底樣式；進入絕對定位時以內聯樣式覆寫對齊相關的 class / Base style; when absolutely positioned, inline styles override the alignment classes */
	const frameStyle: React.CSSProperties = { width, height, ...style };
	if (frameOffset)
	{
		/**
		 * 內聯 left/top/transform 優先於 .battle-sprite-frame* 的置中與 valign 規則；
		 * transform 設為 none 才不會殘留 translateX(-50%) 造成半個框的偏移。
		 * Inline left/top/transform win over the centering/valign rules of
		 * .battle-sprite-frame*; transform must be none so no leftover translateX(-50%)
		 * shifts the frame by half its width.
		 */
		frameStyle.left = frameOffset.x;
		frameStyle.top = frameOffset.y;
		frameStyle.transform = 'none';
	}

	return (
		<div
			ref={frameRef}
			className={[
				`battle-sprite-frame battle-sprite-frame--${align}`,
				editable ? 'battle-sprite-frame--editable' : '',
				className,
			].filter(Boolean).join(' ')}
			style={frameStyle}
			onPointerDown={editable ? handlePointerDown : undefined}
			onPointerMove={editable ? handlePointerMove : undefined}
			onPointerUp={editable ? handlePointerUp : undefined}
			onPointerCancel={editable ? handlePointerUp : undefined}
		>
			<BattleFieldSpriteLayers
				sprites={sprites}
				index={0}
				width={width}
				height={height}
				showSpriteLabels={showSpriteLabels}
			/>
			{editable && (
				<span className="battle-sprite-frame__edit-badge">
					{label ? `${label} ` : ''}
					{frameOffset ? `${frameOffset.x}, ${frameOffset.y}` : ''}
					{frameOffset && sceneSize
						? ` (${formatRelativePercent(computeRelativePercent(frameOffset, sceneSize))})`
						: ''}
				</span>
			)}
		</div>
	);
};
