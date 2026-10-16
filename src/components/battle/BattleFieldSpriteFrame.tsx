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
 * 座標會收斂在戰場範圍內並透過 onOffsetChange 回報（視覺定位以 rAF 每幀更新保持順暢，
 * 回報父層則另行節流約每 100ms 一次、放開時強制回報最終座標，
 * 避免 Storybook args 逐幀回寫造成整棵 story 樹重繪的卡頓；
 * 拖曳期間不套用外部 offset 同步，放開後另開「回聲防護」忽略滯後送達的舊回報值，
 * 防止停手後框被舊座標拉回去彈一下）。
 * 框上另顯示「框識別文字 + 座標 + 相對百分比」徽章，方便在 story 預覽時讀值對位。
 * 另可開啟 snapToGuides 吸附參考線（等分線 + 十字中心線），
 * 並以 resetToken 明確重置位置；關閉編輯模式不會重置（成果保留）。
 * Edit mode (editable): when the scene is larger than the frame, the frame can be dragged
 * with a pointer; coordinates are clamped inside the scene and reported via onOffsetChange
 * (the visual position is updated every frame via requestAnimationFrame for smoothness, while
 * the parent report is throttled to roughly every 100ms with a forced final report on release,
 * because per-frame Storybook args write-back re-rendered the whole story tree and caused
 * stutter; the external offset sync is skipped while dragging, and after release an "echo
 * guard" ignores late-arriving stale echoes of our own reports so the frame never snaps back
 * to an old position after stopping).
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
	 * 框被拖曳移動時回報新座標（編輯模式；拖曳過程以 rAF 合併視覺更新，回報另行節流約每 100ms 一次，pointerup 時強制回報最終座標）
	 * Reports the new offset while the frame is dragged (edit mode; the visual position is merged
	 * per frame via requestAnimationFrame while reporting is throttled to roughly every 100ms,
	 * with the final coordinate force-reported on pointerup)
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
 * 拖曳期間回報父層的節流間隔（ms）
 * Throttle interval for reporting to the parent while dragging (ms)
 *
 * 視覺定位每幀都更新，但回報父層（Storybook args 回寫）降為約 10Hz：
 * 每次回寫都會重繪整棵 story 樹（面板＋雙框＋參考線），60Hz 回寫正是拖曳卡頓的主因。
 * The visual position still updates every frame, but the parent report (Storybook args
 * write-back) drops to about 10Hz: every write-back re-renders the whole story tree (panel +
 * both frames + guides), and a 60Hz write-back was the main cause of drag stutter.
 */
const FRAME_REPORT_INTERVAL_MS = 100;

/**
 * 放開後的「回聲防護」時間（ms）
 * Post-release "echo guard" window (ms)
 *
 * Storybook 的 args 回寫管線是滯後且可能合併的：拖曳中的中間座標可能在放開（dragRef 清除）
 * 之後才送到。防護期間忽略「非最後回報值」的外部值，直到最後回報值排乾（正常路徑）
 * 或本計時器到期（安全網，保證最終一致）。
 * Storybook's args write-back pipeline is lagging and may coalesce, so mid-drag coordinates
 * can arrive after release (dragRef cleared). While the guard is armed any prop that is NOT
 * the final reported value is ignored, until the final value drains through (normal path) or
 * this timer fires (fallback that guarantees eventual consistency).
 */
const FRAME_ECHO_GUARD_MS = 500;

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
	/**
	 * 框位置的真相鏡像：ref 與狀態同步（僅 commitOffset 寫入），
	 * 供「補報最終座標」與「計時器補同步」取用最新內部位置，
	 * 不受 React 狀態非同步提交（事件閉包可能抓到舊值）影響。
	 * Truth mirror of the frame offset: the ref and the state stay in sync (only commitOffset
	 * writes it); used by the final-report flush and the fallback timer to read the latest
	 * internal position, unaffected by React's asynchronous state commits (event closures may
	 * hold stale values).
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
	/** 最後一次實際回報父層的時刻（ms；回報節流基準） / Timestamp of the last actual report to the parent (ms; throttle basis) */
	const lastReportAtRef = useRef(0);
	/** 最後一次回報的座標鍵（"x,y"；供回聲防護辨識「最後回報值」） / Coordinate key of the last report ("x,y"; lets the echo guard recognise the final reported value) */
	const lastWrittenKeyRef = useRef<string | null>(null);
	/** 本次拖曳是否回報過父層（沒回報就沒回聲，無需防護） / Whether this drag reported to the parent at all (no report means no echoes to guard against) */
	const reportedThisDragRef = useRef(false);
	/** 回聲防護是否啟用（放開後至回聲排乾或計時器到期） / Whether the echo guard is armed (from release until the echoes drain or the timer fires) */
	const echoGuardRef = useRef(false);
	/** 回聲防護安全網計時器 id（null＝未啟動） / Echo-guard fallback timer id (null when inactive) */
	const echoGuardTimerRef = useRef<number | null>(null);
	/** 最新的外部 offset 值（供安全網計時器補同步時讀取） / Latest external offset values (read by the fallback timer when re-syncing) */
	const offsetXRef = useRef<number | undefined>(undefined);
	const offsetYRef = useRef<number | undefined>(undefined);

	/**
	 * 框位置的唯一寫入點：ref 與狀態一起更新，值相同則略過 setState（避免無謂重繪）。
	 * Single write path for the frame offset: the ref and the state are updated together, and
	 * identical values skip setState (avoids pointless re-renders).
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
		setFrameOffset(next);
	};

	/**
	 * 解除回聲防護並取消其安全網計時器（新拖曳開始、重置、或回聲排乾時呼叫）。
	 * Disarm the echo guard and cancel its fallback timer (called when a new drag starts, on
	 * reset, or once the echoes have drained).
	 */
	const disarmEchoGuard = () =>
	{
		echoGuardRef.current = false;
		if (echoGuardTimerRef.current !== null)
		{
			window.clearTimeout(echoGuardTimerRef.current);
			echoGuardTimerRef.current = null;
		}
	};

	/**
	 * 回報座標給父層（相同座標不重複回報），並記錄最後回報值供回聲防護辨識。
	 * Report a coordinate to the parent (identical coordinates are not re-reported) and record
	 * the last reported value for the echo guard to recognise.
	 */
	const reportOffset = (next: IBattleFieldFrameOffset) =>
	{
		reportedThisDragRef.current = true;
		const key = `${next.x},${next.y}`;
		if (key === lastWrittenKeyRef.current)
		{
			return;
		}
		lastWrittenKeyRef.current = key;
		lastReportAtRef.current = Date.now();
		onOffsetChangeRef.current?.(next);
	};

	/**
	 * 套用合併後的 move：把 pending 座標寫入內部位置並（視節流）回報父層。
	 * pointermove 可能高於螢幕更新率，逐次 setState/回報會造成抖動，
	 * 故以 requestAnimationFrame 合併，每幀最多套用一次；
	 * 「視覺」每幀都寫入，「回報」則另行節流（見 FRAME_REPORT_INTERVAL_MS），
	 * force = true（pointerup 收尾）時略過節流直接回報。
	 * Apply the merged move: write the pending offset into the internal position and (subject to
	 * the throttle) report it to the parent. pointermove can fire faster than the screen refresh
	 * rate; applying/reporting every event jitters, so requestAnimationFrame merges them into at
	 * most one apply per frame. The "visual" write happens every frame while the "report" is
	 * throttled separately (see FRAME_REPORT_INTERVAL_MS); force = true (pointerup finish)
	 * bypasses the throttle and reports immediately.
	 */
	const applyPendingMove = (force = false) =>
	{
		moveRafRef.current = null;
		const next = pendingMoveRef.current;
		if (!next)
		{
			return;
		}
		pendingMoveRef.current = null;
		commitOffset(next);
		if (force || Date.now() - lastReportAtRef.current >= FRAME_REPORT_INTERVAL_MS)
		{
			reportOffset(next);
		}
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
	 * 拖曳期間一律略過（args 回寫是滯後的，若在此覆寫會把框拉回舊座標，形成抖動）。
	 * 放開後啟用「回聲防護」：滯後送達的「自己回報過的舊座標」一律忽略，
	 * 直到最後回報值排乾（正常路徑）或安全網計時器到期，避免停手後框回彈（短暫轉圈）。
	 * 值與內部相同則略過 setState，避免無謂重繪。
	 * 注意「關閉編輯模式」不會回到初始值——編輯成果一律保留（見 resetToken）。
	 * External offset sync: the internal position is overwritten only when the external value
	 * really changed. It is always skipped while dragging (the args write-back lags behind; it
	 * would overwrite with a stale coordinate and make the frame jitter). After release the
	 * "echo guard" is armed: stale coordinates we reported ourselves are ignored until the final
	 * reported value drains through (normal path) or the fallback timer fires, so the frame
	 * never snaps back after stopping (the brief "spin"). Identical values skip setState to
	 * avoid pointless re-renders.
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
		const key = `${offsetX},${offsetY}`;
		if (echoGuardRef.current)
		{
			if (key === lastWrittenKeyRef.current)
			{
				/**
				 * 滯後回聲已排乾（之後的 args 只會更新） → 解除防護後正常採用
				 * The stale echoes have drained (later args only move forward) → disarm the
				 * guard and adopt normally.
				 */
				disarmEchoGuard();
			}
			else
			{
				/**
				 * 尚未排乾的滯後回聲（或尚未追平的中間值） → 忽略，內部已是最終位置
				 * A not-yet-drained echo (or an intermediate value) → ignore it; the internal
				 * position already holds the final value.
				 */
				return;
			}
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
		disarmEchoGuard();
		reportedThisDragRef.current = false;
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
	 * 卸載時取消排程中的動畫幀與回聲防護計時器，避免對已卸載元件 setState
	 * Cancel the scheduled animation frame and the echo-guard timer on unmount so no setState
	 * hits an unmounted component.
	 */
	useEffect(() => () =>
	{
		if (moveRafRef.current !== null)
		{
			cancelAnimationFrame(moveRafRef.current);
			moveRafRef.current = null;
		}
		if (echoGuardTimerRef.current !== null)
		{
			window.clearTimeout(echoGuardTimerRef.current);
			echoGuardTimerRef.current = null;
		}
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
		/**
		 * 新互動開始：解除上一次拖曳的回聲防護（拖曳期間同步本來就跳過），
		 * 並重置「本次拖曳是否有回報」旗標。
		 * A new interaction starts: disarm the previous drag's echo guard (the sync is skipped
		 * during a drag anyway) and reset the "reported during this drag" flag.
		 */
		disarmEchoGuard();
		reportedThisDragRef.current = false;
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
		/**
		 * 以 rAF 合併高頻 move：每幀最多套用一次，避免逐次 setState 與
		 * args 回寫造成的抖動（真正的套用見 applyPendingMove）。
		 * 注意必須用箭頭函式包一層：rAF 會傳入時間戳參數，若直接傳 applyPendingMove
		 * 該時間戳會被當成 force=true，導致節流失效。
		 * Merge high-frequency moves via rAF: at most one apply per frame, avoiding the jitter
		 * caused by per-event setState and args write-back (see applyPendingMove). The arrow
		 * wrapper is required: rAF passes a timestamp argument that would otherwise be taken as
		 * force = true and defeat the throttle.
		 */
		pendingMoveRef.current = next;
		if (moveRafRef.current === null)
		{
			moveRafRef.current = requestAnimationFrame(() =>
			{
				applyPendingMove();
			});
		}
	};

	/** 指標放開／取消：結束拖曳並釋放指標擷取 / Pointer up / cancel: end the drag and release pointer capture */
	const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) =>
	{
		if (!dragRef.current)
		{
			return;
		}
		/**
		 * 收尾：取消排程中的幀、立即套用最後位置並「強制回報」最終座標，
		 * 確保父層（args 回寫）拿到的是放開瞬間的最終位置。
		 * Finish: cancel any scheduled frame, apply the last position immediately and
		 * FORCE-report the final coordinate so the parent (args write-back) receives the
		 * position at the moment of release.
		 */
		if (moveRafRef.current !== null)
		{
			cancelAnimationFrame(moveRafRef.current);
			moveRafRef.current = null;
		}
		const pending = pendingMoveRef.current;
		if (pending)
		{
			applyPendingMove(true);
		}
		else if (reportedThisDragRef.current && frameOffsetRef.current)
		{
			/**
			 * 末次 move 已被節流略過時，補報內部最終位置（reportOffset 內會以座標去重）
			 * When the last move was skipped by the throttle, flush-report the current internal
			 * position (reportOffset de-duplicates by coordinate).
			 */
			reportOffset(frameOffsetRef.current);
		}
		if (reportedThisDragRef.current)
		{
			/**
			 * 開啟回聲防護：Storybook 的 args 回寫滯後且可能合併，拖曳中的中間座標
			 * 可能在 dragRef 清除之後才送達；此期間忽略「非最後回報值」的外部值，
			 * 直到最後回報值排乾（正常路徑）或安全網計時器到期，
			 * 避免框在停手後又被舊座標拉回去彈一下（短暫轉圈）。
			 * Arm the echo guard: Storybook's args write-back lags and may coalesce, so mid-drag
			 * coordinates can arrive after dragRef is cleared; until the final reported value
			 * drains through (normal path) or the fallback timer fires, any prop that is NOT
			 * the final value is ignored, so the frame never snaps back to an old position
			 * after stopping (the brief "spin").
			 */
			echoGuardRef.current = true;
			if (echoGuardTimerRef.current !== null)
			{
				window.clearTimeout(echoGuardTimerRef.current);
			}
			echoGuardTimerRef.current = window.setTimeout(() =>
			{
				echoGuardTimerRef.current = null;
				echoGuardRef.current = false;
				/**
				 * 安全網：防護期間被略過的「外部異動」，到期後補同步一次，
				 * 保證最終與 args 一致（正常路徑早已由最後回報值排乾防護，此處多為 no-op）。
				 * Safety net: re-sync once after the guard expires in case an external change
				 * was skipped, guaranteeing eventual consistency with args (the normal path
				 * already drained the guard via the final report, so this is usually a no-op).
				 */
				const x = offsetXRef.current;
				const y = offsetYRef.current;
				if (!dragRef.current && x !== undefined && y !== undefined)
				{
					commitOffset({ x: x, y: y });
				}
			}, FRAME_ECHO_GUARD_MS);
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
