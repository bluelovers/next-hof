/**
 * 戰場編輯模式面板（共用 Storybook 裝飾器）
 * Battlefield edit-mode panel (shared Storybook decorator)
 *
 * 把編輯模式的輔助工具（editModeUtils）包成一排可點擊的按鈕，讓 story 直接在畫面上操作：
 * - 重置：還原初始位置並遞增 resetToken（元件端把框交回初始 offset、精靈清空覆寫）
 * - 強制等分對齊（5 / 6 等分）：無容差，直接把指定對象吸到最近的等分線（水平與垂直同時）
 * - 強制十字對齊：吸到正中央的十字線（5/6 等分都不會涵蓋正中央，故獨立提供）
 * - 邊緣對齊：把框貼齊戰場的邊或中心（水平：靠左 / 置中 / 靠右；垂直：置頂 / 置中 / 置底）
 * - 對齊對象：選擇強制對齊與邊緣對齊要套用到左隊、右隊或兩者（避免兩框被對到同一條線重疊）
 * - 左右隊對齊高度：可選擇以左隊、以右隊或兩者平均為基準
 * - 參考線顯示隱藏：切換 args.showEditGuides（由元件疊加 BattleFieldEditGuides）
 * - 吸附開關：切換 args.snapToGuides（拖曳時是否貼齊參考線）
 * - 背景縮放模式 / 背景對齊：寫回 args.config.bgScale / bgHAlign / bgVAlign
 * - 座標相對 %：以戰場尺寸為基準，即時顯示左右框座標的相對百分比
 *   （讀值走 frameOffsetLiveStore 直接更新 DOM，拖曳期間面板零重繪）
 *
 * All helpers from editModeUtils are exposed as clickable buttons so stories can be operated
 * directly on the canvas: reset (restore initial positions + bump resetToken), forced
 * division alignment (tolerance-free snap of the chosen target(s) to the 5 or 6 division lines
 * on both axes), forced cross alignment (snap to the center cross, which neither division set
 * covers), edge alignment (flush the frame to the scene's edges/center: horizontal
 * left/center/right, vertical top/middle/bottom), an alignment-target selector (left team,
 * right team, or both — so two frames are never forced onto the same line), team height
 * alignment (reference selectable: left, right, or average), the guides and snap toggles
 * (via args.showEditGuides / args.snapToGuides), background scale/alignment controls
 * (writing args.config.bgScale / bgHAlign / bgVAlign), and a live relative-% readout of both
 * frame coordinates (fed by frameOffsetLiveStore straight into the DOM, so the panel never
 * re-renders while a frame is dragged).
 */
import React from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Decorator } from '../decorators';
import { GAME_FONT } from '../decorators';
import type { ISpriteImageSize } from '../../src/components/battle/spriteImageSizes';
import type {
	IBattleFieldFrameOffset,
	IBattleFieldConfig,
	IBattleSidePair,
	IBattleFieldBgHAlign,
	IBattleFieldBgVAlign,
} from '../../src/components/battle/types';
import { SPRITE_LAYOUT_WIDTH, SPRITE_LAYOUT_HEIGHT } from '../../src/components/battle/types';
import { EnumBattleFieldBgScale, EnumTeamSideUI } from '../../src/components/battle/enums';
import { frameOffsetLiveStore } from '../../src/components/battle/frameOffsetLiveStore';
import {
	alignFrameToSceneEdge,
	alignPairHeights,
	clampFrameOffsetToScene,
	computeCrossGuideLines,
	computeDivisionGuideLines,
	computeRelativePercent,
	forceSnapToGuideLines,
	formatFrameCoordinate,
	formatRelativePercent,
	EnumEditModeEdgeAlign,
	EnumEditModePairHeightAlign,
	type IEditModeGuideLine,
} from '../../src/components/battle/editModeUtils';

/** 強制對齊的套用對象（僅套用到單側時，避免兩框被對到同一條線重疊） / Which frames a forced alignment applies to (per-side so two frames are never forced onto one line) */
export type IEditModeAlignTarget = 'left' | 'right' | 'both';

/** 背景縮放模式選項（與 config.bgScale 同值域） / Background scale-mode options (same value domain as config.bgScale) */
const BG_SCALE_OPTIONS: { value: EnumBattleFieldBgScale; label: string }[] = [
	{ value: EnumBattleFieldBgScale.Natural, label: '原始 natural' },
	{ value: EnumBattleFieldBgScale.Cover, label: '覆蓋 cover' },
	{ value: EnumBattleFieldBgScale.Contain, label: '完整 contain' },
	{ value: EnumBattleFieldBgScale.Stretch, label: '拉伸 stretch' },
	{ value: EnumBattleFieldBgScale.Repeat, label: '平鋪 repeat' },
];

/** 背景水平對齊選項 / Background horizontal alignment options */
const BG_H_ALIGN_OPTIONS: { value: IBattleFieldBgHAlign; label: string }[] = [
	{ value: 'left', label: '靠左' },
	{ value: 'center', label: '置中' },
	{ value: 'right', label: '靠右' },
];

/** 背景垂直對齊選項（repeat 平鋪不受影響） / Background vertical alignment options (repeat mode unaffected) */
const BG_V_ALIGN_OPTIONS: { value: IBattleFieldBgVAlign; label: string }[] = [
	{ value: 'top', label: '置頂' },
	{ value: 'middle', label: '置中' },
	{ value: 'bottom', label: '置底' },
];

/** 面板選項 / Panel options */
export interface IBattleEditModePanelOptions
{
	/**
	 * 參考線與對齊運算的座標空間（＝戰場尺寸）
	 * Coordinate-space size for guides and alignment ops (the scene size)
	 */
	sceneSize: ISpriteImageSize;
	/**
	 * 顯示排版框專用操作（強制等分／十字對齊、邊緣對齊、對象選擇、左右隊對齊高度、座標 % 讀值）
	 * Show frame-specific ops (forced division/cross alignment, edge alignment, target
	 * selector, team height alignment, % readout)
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
	 * 顯示背景控制項（縮放模式 / 水平對齊 / 垂直對齊；元件需支援 config.bgScale / bgHAlign / bgVAlign）
	 * Show the background controls (scale mode / horizontal / vertical alignment; the component
	 * must support config.bgScale / bgHAlign / bgVAlign)
	 */
	showBgControls?: boolean;
	/**
	 * 排版框尺寸（邊緣對齊與收斂用；預設 480×200＝角色排版尺寸）
	 * Sprite-frame size (for edge alignment and clamping; default 480×200 = the sprite layout size)
	 */
	frameSize?: ISpriteImageSize;
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

/** 下拉選單樣式（背景縮放／對齊） / Select style (background scale / alignment) */
const selectStyle: React.CSSProperties = {
	background: '#243044',
	border: '1px solid #3a4a63',
	borderRadius: '3px',
	color: '#e0e0e0',
	fontFamily: GAME_FONT,
	fontSize: '12px',
	padding: '2px 6px',
};

/** 讀值文字樣式（座標相對 %） / Readout text style (relative %) */
const readoutStyle: React.CSSProperties = {
	marginLeft: '4px',
	color: '#e0e0e0',
};

/** 分組標籤樣式（「對象」「背景」等前綴文字） / Group-label style (prefix text such as "target" / "background") */
const groupLabelStyle: React.CSSProperties = {
	color: '#8ea3bf',
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
		showBgControls = false,
		frameSize = { width: SPRITE_LAYOUT_WIDTH, height: SPRITE_LAYOUT_HEIGHT },
		initialFrameOffsets,
	} = options;

	return (Story) =>
	{
		const [args, updateArgs] = useArgs();
		const current = (args ?? {}) as Record<string, unknown>;
		const offsets = current.frameOffsets as IBattleSidePair<IBattleFieldFrameOffset> | undefined;
		const guidesOn = current.showEditGuides === true;
		const snapOn = current.snapToGuides === true;
		/** 強制對齊的套用對象 / Which frames a forced alignment applies to */
		const [alignTarget, setAlignTarget] = React.useState<IEditModeAlignTarget>('both');
		/** 左右隊對齊高度的基準 / Reference used by team height alignment */
		const [heightAlign, setHeightAlign] = React.useState<EnumEditModePairHeightAlign>(
			EnumEditModePairHeightAlign.Left,
		);
		/** 目前戰場配置（背景控制項讀寫來源） / Current battlefield config (read/write source for the background controls) */
		const config = (current.config ?? {}) as IBattleFieldConfig;

		/**
		 * 對齊運算與讀值的基準位置：優先取 live store 的「目前實際位置」
		 * （拖曳中座標不經過 args 管線，args 可能滯後），
		 * 沒有才退回 args.frameOffsets，最後退回初始值。
		 * Alignment/readout base: prefer the live store's "actual current position" (drag
		 * coordinates bypass the args pipeline, so args may lag), then args.frameOffsets,
		 * then the initial values.
		 */
		const resolveOffsets = (): IBattleSidePair<IBattleFieldFrameOffset> =>
		{
			const fallback = offsets ?? initialFrameOffsets ?? { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };
			return {
				left: frameOffsetLiveStore.getSnapshot(EnumTeamSideUI.Left) ?? fallback.left,
				right: frameOffsetLiveStore.getSnapshot(EnumTeamSideUI.Right) ?? fallback.right,
			};
		};

		/** 重置：還原初始位置（若有）並遞增 resetToken 讓元件清掉內部拖曳狀態 / Reset: restore the initial positions (if any) and bump resetToken so the component clears its internal drag state */
		const handleReset = () =>
		{
			updateArgs({
				resetToken: Number(current.resetToken ?? 0) + 1,
				...(initialFrameOffsets ? { frameOffsets: initialFrameOffsets } : {}),
			});
		};

		/**
		 * 強制對齊：把「對象」套用無容差的最近線吸附，再收斂在戰場可動範圍內。
		 * 對象選左隊／右隊時只動單側，避免兩框被對到同一條線重疊。
		 * Forced alignment: apply the tolerance-free nearest-line snap to the chosen target(s),
		 * then clamp inside the scene's movable range. Selecting one side moves only that frame
		 * so the two are never forced onto the same line.
		 */
		const applyForceSnap = (lines: IEditModeGuideLine[]) =>
		{
			const base = resolveOffsets();
			const snapSide = (side: 'left' | 'right'): IBattleFieldFrameOffset =>
				clampFrameOffsetToScene(
					forceSnapToGuideLines(base[side], sceneSize, { lines }).pos,
					frameSize,
					sceneSize,
				);
			updateArgs({
				frameOffsets: {
					left: alignTarget === 'right' ? base.left : snapSide('left'),
					right: alignTarget === 'left' ? base.right : snapSide('right'),
				},
			});
		};

		/**
		 * 邊緣對齊：把「對象」貼齊戰場的指定邊或中心。
		 * Edge alignment: flush the chosen target(s) against the scene's given edge or center.
		 */
		const applyEdgeAlign = (edge: EnumEditModeEdgeAlign) =>
		{
			const base = resolveOffsets();
			const alignSide = (side: 'left' | 'right'): IBattleFieldFrameOffset =>
				alignFrameToSceneEdge(base[side], frameSize, sceneSize, edge);
			updateArgs({
				frameOffsets: {
					left: alignTarget === 'right' ? base.left : alignSide('left'),
					right: alignTarget === 'left' ? base.right : alignSide('right'),
				},
			});
		};

		/** 寫回戰場配置（背景控制項共用） / Write back the battlefield config (shared by the background controls) */
		const patchConfig = (patch: Partial<IBattleFieldConfig>) =>
		{
			updateArgs({ config: { ...config, ...patch } });
		};

		/**
		 * 座標 % 讀值：以 ref 直接更新 DOM 文字（不走 React 狀態），
		 * 訂閱 live store（元件每幀發布座標、store 約 10Hz 通知一次）。
		 * 拖曳期間面板零重繪——舊版透過 args 逐次重繪整棵 story 樹，
		 * 既是拖曳卡頓的主因，其滯後回聲又會讓框在放開後繼續移動。
		 * Relative-% readout: the span text is written straight into the DOM (no React state),
		 * subscribing to the live store (the component publishes per frame; the store notifies
		 * about every 100ms). Zero panel re-renders during the drag — the old args-driven
		 * re-render of the whole story tree was the main cause of drag stutter, and its lagging
		 * echoes kept the frame moving after release.
		 */
		const readoutRef = React.useRef<HTMLSpanElement>(null);
		React.useEffect(() =>
		{
			if (!frameOps)
			{
				return;
			}
			const renderReadout = () =>
			{
				const el = readoutRef.current;
				if (!el)
				{
					return;
				}
				const pair = resolveOffsets();
				el.textContent =
					`左隊 ${formatFrameCoordinate(pair.left.x)},${formatFrameCoordinate(pair.left.y)}（${formatRelativePercent(computeRelativePercent(pair.left, sceneSize))}）｜`
					+ ` 右隊 ${formatFrameCoordinate(pair.right.x)},${formatFrameCoordinate(pair.right.y)}（${formatRelativePercent(computeRelativePercent(pair.right, sceneSize))}）`;
			};
			renderReadout();
			const unsubscribes = [
				frameOffsetLiveStore.subscribe(EnumTeamSideUI.Left, renderReadout),
				frameOffsetLiveStore.subscribe(EnumTeamSideUI.Right, renderReadout),
			];
			return () =>
			{
				unsubscribes.forEach((unsubscribe) =>
				{
					unsubscribe();
				});
			};
		}, [frameOps]);

		return (
			<>
				<div style={panelStyle}>
					<button style={buttonStyle} onClick={handleReset}>重置</button>
					{frameOps && (
						<>
							<span style={groupLabelStyle}>對象</span>
							<button
								style={alignTarget === 'left' ? activeButtonStyle : buttonStyle}
								onClick={() => setAlignTarget('left')}
							>
								左隊
							</button>
							<button
								style={alignTarget === 'right' ? activeButtonStyle : buttonStyle}
								onClick={() => setAlignTarget('right')}
							>
								右隊
							</button>
							<button
								style={alignTarget === 'both' ? activeButtonStyle : buttonStyle}
								onClick={() => setAlignTarget('both')}
							>
								兩者
							</button>
							<button style={buttonStyle} onClick={() => applyForceSnap(computeDivisionGuideLines(sceneSize, [5]))}>5 等分對齊</button>
							<button style={buttonStyle} onClick={() => applyForceSnap(computeDivisionGuideLines(sceneSize, [6]))}>6 等分對齊</button>
							<button style={buttonStyle} onClick={() => applyForceSnap(computeCrossGuideLines(sceneSize))}>十字對齊</button>
							<button style={buttonStyle} onClick={() => applyEdgeAlign(EnumEditModeEdgeAlign.Top)}>置頂</button>
							<button style={buttonStyle} onClick={() => applyEdgeAlign(EnumEditModeEdgeAlign.Middle)}>垂直置中</button>
							<button style={buttonStyle} onClick={() => applyEdgeAlign(EnumEditModeEdgeAlign.Bottom)}>置底</button>
							<button style={buttonStyle} onClick={() => applyEdgeAlign(EnumEditModeEdgeAlign.Left)}>靠左</button>
							<button style={buttonStyle} onClick={() => applyEdgeAlign(EnumEditModeEdgeAlign.Center)}>水平置中</button>
							<button style={buttonStyle} onClick={() => applyEdgeAlign(EnumEditModeEdgeAlign.Right)}>靠右</button>
							<button
								style={heightAlign === EnumEditModePairHeightAlign.Left ? activeButtonStyle : buttonStyle}
								onClick={() => { setHeightAlign(EnumEditModePairHeightAlign.Left); updateArgs({ frameOffsets: alignPairHeights(resolveOffsets(), EnumEditModePairHeightAlign.Left) }); }}
							>
								隊高以左
							</button>
							<button
								style={heightAlign === EnumEditModePairHeightAlign.Right ? activeButtonStyle : buttonStyle}
								onClick={() => { setHeightAlign(EnumEditModePairHeightAlign.Right); updateArgs({ frameOffsets: alignPairHeights(resolveOffsets(), EnumEditModePairHeightAlign.Right) }); }}
							>
								隊高以右
							</button>
							<button
								style={heightAlign === EnumEditModePairHeightAlign.Average ? activeButtonStyle : buttonStyle}
								onClick={() => { setHeightAlign(EnumEditModePairHeightAlign.Average); updateArgs({ frameOffsets: alignPairHeights(resolveOffsets(), EnumEditModePairHeightAlign.Average) }); }}
							>
								隊高平均
							</button>
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
					{showBgControls && (
						<>
							<span style={groupLabelStyle}>背景</span>
							<select
								style={selectStyle}
								value={config.bgScale ?? EnumBattleFieldBgScale.Natural}
								onChange={(event) => patchConfig({ bgScale: event.target.value as EnumBattleFieldBgScale })}
							>
								{BG_SCALE_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>{option.label}</option>
								))}
							</select>
							<select
								style={selectStyle}
								value={config.bgHAlign ?? 'center'}
								onChange={(event) => patchConfig({ bgHAlign: event.target.value as IBattleFieldBgHAlign })}
							>
								{BG_H_ALIGN_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>{option.label}</option>
								))}
							</select>
							<select
								style={selectStyle}
								value={config.bgVAlign ?? 'bottom'}
								onChange={(event) => patchConfig({ bgVAlign: event.target.value as IBattleFieldBgVAlign })}
							>
								{BG_V_ALIGN_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>{option.label}</option>
								))}
							</select>
						</>
					)}
					{frameOps && (
						<span ref={readoutRef} style={readoutStyle} />
					)}
				</div>
				<Story />
			</>
		);
	};
};
