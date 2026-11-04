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
 * 座標會收斂在戰場範圍內。視覺定位以 rAF 每幀更新；「拖曳過程不回報父層」——
 * args 只在放開時單次寫回最終座標（onOffsetChange）。
 * 舊版在拖曳中以 10Hz 節流回寫 args，但 Storybook 的 args 管線本身延遲且合併
 * （每次 rerender 至少等待 100ms 的動畫檢查），逐次回寫仍會：
 * (1) 每秒重繪整棵 story 樹數次造成拖曳卡頓；(2) 放開後把滯後的中間座標回送成回聲，
 * 讓框停手後又往回移動。因此中間座標完全不經過 args——
 * 即時座標改由 onLiveOffsetChange 發布（讀值端直接更新 DOM，零 story 重繪）。
 * 拖曳期間不套用外部 offset 同步（避免滯後值拉回框）。
 * 框上另顯示「框識別文字 + 座標 + 相對百分比」徽章，方便在 story 預覽時讀值對位。
 * 另可開啟 snapToGuides 吸附參考線（等分線 + 十字中心線），
 * 並以 resetToken 明確重置位置；關閉編輯模式不會重置（成果保留）。
 * Edit mode (editable): when the scene is larger than the frame, the frame can be dragged
 * with a pointer and coordinates are clamped inside the scene. The visual position updates
 * every frame via requestAnimationFrame; NOTHING is reported while dragging — args receive a
 * single write of the final coordinate on release (onOffsetChange). The previous version
 * throttled args write-backs to 10Hz during the drag, but Storybook's args pipeline lags and
 * coalesces (every rerender waits at least 100ms for an animation check), so per-drag
 * write-backs still (1) re-rendered the whole story tree several times a second and caused
 * stutter, and (2) fed late mid-drag echoes back after release, moving the frame again once
 * the user let go. Mid-drag coordinates therefore never touch args: the live position is
 * published via onLiveOffsetChange instead (readout consumers update the DOM directly, with
 * zero story re-renders). The external offset sync is skipped while dragging so a lagging
 * value cannot pull the frame back.
 * A "label + coordinates + relative percentage" badge is shown so positions can be read while
 * previewing in Storybook.
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
	formatFrameCoordinate,
	formatRelativePercent,
	resetFrameOffset,
	snapToGuideLines,
} from './editModeUtils';
import './BattleFieldSpriteFrame.css';
import type { IStyleProps } from '#/src/components/shared/types';
import { EnumBattleFieldVAlign } from '#/src/components/battle/enums';

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
	 * 框被拖曳移動到最終位置時回報（編輯模式；拖曳過程不回報，pointerup／pointercancel 時
	 * 僅在「最終座標與外部 offset 不同」時單次回報，避免無謂的 args 重繪）
	 * Reports the final offset after a drag (edit mode; nothing is reported while dragging —
	 * on pointerup/pointercancel a single report fires only when the final coordinate differs
	 * from the external offset, avoiding pointless args re-renders)
	 */
	onOffsetChange?: (offset: IBattleFieldFrameOffset) => void;
	/**
	 * 框位置每次實際變動時通知（即時讀值通道）
	 * Notified whenever the frame offset actually changes (live readout channel)
	 *
	 * 與 onOffsetChange（放開才回報、通常接 Storybook args）分開：
	 * 本回呼在拖曳中每幀的座標變動也會觸發，讀值端（編輯面板）應以
	 * 輕量 store 或直接 DOM 更新消化，不可觸發重型重繪。
	 * Separate from onOffsetChange (release-only, typically wired to Storybook args):
	 * this one also fires for per-frame changes during the drag, so readout consumers
	 * (the edit panel) must absorb it via a lightweight store or direct DOM update,
	 * never a heavy re-render.
	 */
	onLiveOffsetChange?: (offset: IBattleFieldFrameOffset | null) => void;
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
	onLiveOffsetChange,
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
	/**
	 * 框位置的真相鏡像：ref 與狀態同步（僅 commitOffset 寫入），
	 * 供「放開時單次回報最終座標」取用最新內部位置，
	 * 不受 React 狀態非同步提交（事件閉包可能抓到舊值）影響。
	 * Truth mirror of the frame offset: the ref and the state stay in sync (only commitOffset
	 * writes it); used to read the latest internal position for the single release-time
	 * report, unaffected by React's asynchronous state commits (event closures may hold
	 * stale values).
	 */
	const frameOffsetRef = useRef<IBattleFieldFrameOffset | null>(offset ?? null);
	/** 是否已量測過（編輯模式只量一次） / Whether the measurement already ran (edit mode measures once) */
	const measuredRef = useRef(false);
	/** 拖曳狀態（僅拖曳期間非 null） / Drag state (non-null only while dragging) */
	const dragRef = useRef<IFrameDragState | null>(null);
	/**
	 * 最新一次 move 計算出的框位置（待 rAF 合併套用）
	 * Latest frame offset computed by pointermove (pending merge via requestAnimationFrame)
	 */
	const pendingMoveRef = useRef<IBattleFieldFrameOffset | null>(null);
	/** rAF id（null＝沒有排程中的幀） / requestAnimationFrame id (null when no frame is scheduled) */
	const moveRafRef = useRef<number | null>(null);
	/** 最新回呼（供 rAF 回呼取用，避免閉包抓到舊函式） / Latest callback (read by the rAF callback so it never captures a stale function) */
	const onOffsetChangeRef = useRef(onOffsetChange);
	onOffsetChangeRef.current = onOffsetChange;
	/** 最新即時讀值回呼（發布到 live store；與 args 回報分開的通道） / Latest live-readout callback (published to the live store; a channel separate from the args report) */
	const onLiveOffsetChangeRef = useRef(onLiveOffsetChange);
	onLiveOffsetChangeRef.current = onLiveOffsetChange;
	/** 最新的外部 offset 值（放開時比對，決定是否需要單次回報） / Latest external offset values (compared on release to decide whether a single report is needed) */
	const offsetXRef = useRef<number | undefined>(undefined);
	const offsetYRef = useRef<number | undefined>(undefined);

	/**
	 * 框位置的唯一寫入點：ref 與狀態一起更新，值相同則略過 setState（避免無謂重繪）；
	 * 真的變動時同步發布給即時讀值通道（onLiveOffsetChange → live store）。
	 * Single write path for the frame offset: the ref and the state are updated together, and
	 * identical values skip setState (avoids pointless re-renders); real changes are also
	 * published to the live readout channel (onLiveOffsetChange → the live store).
	 */
	const commitOffset = (next: IBattleFieldFrameOffset | null) =>
	{
		const cur = frameOffsetRef.current;
		const same = cur === next
			|| (!!cur && !!next && cur.x === next.x && cur.y === next.y);
		frameOffsetRef.current = next;
		if (same)
		{
			return;
		}
		onLiveOffsetChangeRef.current?.(next);
		setFrameOffset(next);
	};

	/**
	 * 套用合併後的 move：把 pending 座標寫入內部位置。
	 * pointermove 可能高於螢幕更新率，逐次 setState 會造成抖動，
	 * 故以 requestAnimationFrame 合併，每幀最多套用一次。
	 * 注意：此路徑「不」回報父層（args）——拖曳中的座標完全不經過 args 管線，
	 * 僅在 pointerup 收尾時單次回報最終座標。
	 * Apply the merged move: write the pending offset into the internal position. pointermove
	 * can fire faster than the screen refresh rate and per-event setState jitters, so
	 * requestAnimationFrame merges them into at most one apply per frame. Note this path does
	 * NOT report to the parent (args): mid-drag coordinates never touch the args pipeline;
	 * the final coordinate is reported once on pointerup.
	 */
	const applyPendingMove = () =>
	{
		moveRafRef.current = null;
		const next = pendingMoveRef.current;
		if (!next)
		{
			return;
		}
		pendingMoveRef.current = null;
		commitOffset(next);
	};

	/** 外部 offset 值（以值而非物件身份進 deps，避免行內物件每次重建都觸發同步） / External offset values (value-based deps so inline objects don't re-sync every render) */
	const offsetX = offset?.x;
	const offsetY = offset?.y;
	offsetXRef.current = offsetX;
	offsetYRef.current = offsetY;
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
	 * 拖曳期間一律略過（args 可能滯後，若在此覆寫會把框拉回舊座標，形成抖動）。
	 * 放開後 args 只會收到「單次最終座標」回報，回聲只有一筆且等於內部值（commitOffset
	 * 值相同略過），因此不再需要舊版的「回聲防護／安全網計時器」——
	 * 那套機制在管線慢於 500ms 時反而會把舊座標補寫進來，造成停手後框繼續移動。
	 * 注意「關閉編輯模式」不會回到初始值——編輯成果一律保留（見 resetToken）。
	 * External offset sync: the internal position is overwritten only when the external value
	 * really changed. It is always skipped while dragging (args may lag; overwriting here would
	 * pull the frame back and jitter). After release args receive only a SINGLE final-coordinate
	 * report, so there is exactly one echo and it equals the internal value (commitOffset skips
	 * identical values) — the previous "echo guard + safety-net timer" is therefore no longer
	 * needed; worse, whenever the pipeline lagged beyond 500ms that guard backdoored a stale
	 * coordinate into the frame, which is exactly what made the frame keep moving after release.
	 * Note that turning edit mode OFF does NOT restore the initial value — the edit result is
	 * always kept (see resetToken).
	 */
	useEffect(() =>
	{
		if (dragRef.current)
		{
			return;
		}
		if (offsetX === undefined || offsetY === undefined)
		{
			return;
		}
		commitOffset({ x: offsetX, y: offsetY });
	}, [offsetX, offsetY]);

	/**
	 * 重置：明確觸發（resetToken 改變）時，框回到初始 offset；
	 * 未提供 offset 則交回 CSS 對齊，並允許編輯模式重新量測。
	 * 注意 deps 僅含 resetToken——外部 offset 變化不屬於「重置」，
	 * 早期實作把 offsetX/offsetY 也放進 deps，導致每次 args 回寫都重跑本效應
	 * （清除 dragRef＝拖曳中斷、清 sceneSize＝徽章百分比消失）。
	 * Reset: on an explicit trigger (resetToken changed) the frame returns to its initial
	 * offset; without an offset it goes back to CSS alignment and edit mode may re-measure.
	 * Note the deps contain ONLY resetToken — an external offset change is not a "reset"; an
	 * earlier version also listed offsetX/offsetY, which made every args write-back re-run this
	 * effect (clearing dragRef broke the drag and clearing sceneSize hid the badge percentage).
	 */
	useEffect(() =>
	{
		if (resetToken === undefined)
		{
			return;
		}
		/**
		 * 取消排程中的幀與未套用的 pending，避免重置後舊座標又被寫回
		 * Cancel any scheduled frame and un-applied pending move so an old coordinate is not
		 * written back after the reset.
		 */
		if (moveRafRef.current !== null)
		{
			cancelAnimationFrame(moveRafRef.current);
			moveRafRef.current = null;
		}
		pendingMoveRef.current = null;
		dragRef.current = null;
		measuredRef.current = false;
		setSceneSize(null);
		/**
		 * 以 ref 讀取最新外部值（deps 已不含 offset，故不能直接用閉包值）
		 * Read the latest external values from the refs (the deps no longer include offset, so
		 * the closure values cannot be used directly).
		 */
		const x = offsetXRef.current;
		const y = offsetYRef.current;
		commitOffset(resetFrameOffset(x !== undefined && y !== undefined ? { x: x, y: y } : undefined));
	}, [resetToken]);

	/**
	 * 卸載時取消排程中的動畫幀，避免對已卸載元件 setState
	 * Cancel the scheduled animation frame on unmount so no setState hits an unmounted component
	 */
	useEffect(() => () =>
	{
		if (moveRafRef.current !== null)
		{
			cancelAnimationFrame(moveRafRef.current);
			moveRafRef.current = null;
		}
	}, []);

	/**
	 * 掛載時把初始位置發布給即時讀值通道：
	 * 面板等讀值端在故事剛掛載（尚無任何座標變動）時也能拿到正確初值。
	 * Publish the initial position to the live readout channel on mount so readout consumers
	 * (the edit panel) hold the correct initial value before any coordinate ever changes.
	 */
	useEffect(() =>
	{
		onLiveOffsetChangeRef.current?.(frameOffsetRef.current);
	}, []);

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
		commitOffset(measureFrameOffset(el, align));
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
			commitOffset(base);
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

	/** 指標移動：以「起始框座標 + 游標位移」計算新位置，可選吸附參考線後再收斂（僅更新視覺，不回報 args） / Pointer move: new position = drag base + cursor delta, optionally snapped to the guide lines, then clamped (visual update only; nothing is reported to args) */
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
		/**
		 * 以 rAF 合併高頻 move：每幀最多套用一次，避免逐次 setState 造成的抖動
		 * （真正的套用見 applyPendingMove；此路徑不回報 args）。
		 * Merge high-frequency moves via rAF: at most one apply per frame, avoiding the jitter
		 * caused by per-event setState (see applyPendingMove; this path never reports to args).
		 */
		pendingMoveRef.current = next;
		if (moveRafRef.current === null)
		{
			moveRafRef.current = requestAnimationFrame(applyPendingMove);
		}
	};

	/** 指標放開／取消：結束拖曳、單次回報最終座標並釋放指標擷取 / Pointer up / cancel: end the drag, report the final coordinate once, and release pointer capture */
	const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) =>
	{
		if (!dragRef.current)
		{
			return;
		}
		/**
		 * 收尾：取消排程中的幀並立即套用最後位置（拖曳途中沒有任何 args 回報，
		 * 所以此處的最終座標是父層會收到的第一、也是唯一一筆拖曳結果）。
		 * Finish: cancel any scheduled frame and apply the last position immediately (nothing
		 * was reported to args during the drag, so this final coordinate is the first and only
		 * drag result the parent receives).
		 */
		if (moveRafRef.current !== null)
		{
			cancelAnimationFrame(moveRafRef.current);
			moveRafRef.current = null;
		}
		const pending = pendingMoveRef.current;
		if (pending)
		{
			applyPendingMove();
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
			 * Ignore a failed release (pointer may not have been captured).
			 */
		}
		/**
		 * 單次回報最終座標（僅在與外部 offset 不同時）：
		 * 「拖到別處又拖回原位」或「按一下沒移動」不會觸發 args 重繪。
		 * 舊版拖曳中以 10Hz 節流回寫、放開再補報，args 管線會把中間值排隊滯後回送，
		 * 這正是停手後框又移動的根源；現在 args 只有這一筆寫入，回聲即最終值本身。
		 * Report the final coordinate once (only when it differs from the external offset):
		 * "drag away and back" or a plain click never triggers an args re-render. The old
		 * version throttled write-backs to 10Hz during the drag and flushed on release, which
		 * queued mid-drag values in the lagging args pipeline — the root cause of the frame
		 * moving again after release; now args receive exactly this one write, so the only
		 * echo equals the final value itself.
		 */
		const final = frameOffsetRef.current;
		if (!final)
		{
			return;
		}
		const externalX = offsetXRef.current;
		const externalY = offsetYRef.current;
		const sameAsExternal = externalX !== undefined
			&& externalY !== undefined
			&& final.x === externalX
			&& final.y === externalY;
		if (!sameAsExternal)
		{
			onOffsetChangeRef.current?.(final);
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
					{frameOffset ? `${formatFrameCoordinate(frameOffset.x)}, ${formatFrameCoordinate(frameOffset.y)}` : ''}
					{frameOffset && sceneSize
						? ` (${formatRelativePercent(computeRelativePercent(frameOffset, sceneSize))})`
						: ''}
				</span>
			)}
		</div>
	);
};
