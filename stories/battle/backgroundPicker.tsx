/**
 * 戰場背景選擇面板（共用 Storybook 裝飾器）
 * Battlefield background picker panel (shared Storybook decorator)
 *
 * 提供背景工具列：
 * - 下拉選單：從 sampleData 的背景分組（標準 480×200 / 768×320 大圖）挑選
 * - 自訂網址：手動輸入任意圖片 URL 後套用（支援跨域外部圖檔）
 * - 縮放模式：config.bgScale（natural / cover / contain / stretch / repeat）
 * - 水平／垂直對齊：以按鈕對 config.bgHAlign / bgVAlign 賦值（目前值高亮）
 * - 背景尺寸：數值輸入框直接賦值 bgSize（寬／高，空字串＝該維度不設），
 *   並附角色排版（480×200）與大圖（768×320）預設與清除鈕；
 *   同時覆寫 args.bgSize（BattleFieldLayers 直收 prop）與 config.bgSize（BattleFieldScene 傳遞）
 *
 * 【純預覽設計】所有覆寫只存在於裝飾器的本地 state，經 <Story args={...}> 注入當次 render。
 * 刻意不呼叫 updateArgs：該 API 會把變動序列化寫回網址列（?args=...），
 * 導致切換故事或重新整理後仍套用舊值、無法復原。本地 state 則在 remount 時自然清空。
 * [PREVIEW-ONLY DESIGN] Every override lives in the decorator's local state and is injected into
 * the current render via <Story args={...}>. updateArgs is deliberately NOT called: that API
 * serializes changes back into the URL (?args=...), so a story switch or a page refresh would
 * still apply the stale values and there would be no way back. Local state is cleared on remount.
 */
import React from 'react';
/**
 * Hook 一律取自 storybook/preview-api：裝飾器 render 內已使用 useArgs，
 * 框架 hook（useState / useEffect / useRef…）若再從 React 混用，
 * 可能與 Storybook 渲染器的 hook 來源不一致；preview-api 提供同名等價 hook 供同處使用。
 * All hooks come from storybook/preview-api: this decorator's render already calls useArgs, and
 * mixing framework hooks (useState / useEffect / useRef…) from React with it may diverge from the
 * Storybook renderer's hook source; preview-api re-exports equivalent hooks for use in the same place.
 */
import { useArgs, useEffect, useRef, useState } from 'storybook/preview-api';
import type { Decorator } from '../decorators';
import { GAME_FONT } from '../decorators';
import type {
	IBattleFieldConfig,
	IBattleFieldBgSize,
	IBattleFieldBgHAlign,
	IBattleFieldBgVAlign,
} from '../../src/components/battle/types';
import { SPRITE_LAYOUT_WIDTH, SPRITE_LAYOUT_HEIGHT } from '../../src/components/battle/types';
import type { ISpriteImageSize } from '../../src/components/battle/spriteImageSizes';
import { EnumBattleFieldBgScale } from '../../src/components/battle/enums';
import {
	sampleBackgroundChoiceGroups,
	type IBackgroundChoice,
} from './sampleData';
import {
	BG_SCALE_OPTIONS,
	BG_H_ALIGN_OPTIONS,
	BG_V_ALIGN_OPTIONS,
} from './bgControlOptions';

/**
 * 接受 args 覆寫的 Story 型別
 * Story type that accepts an args override
 *
 * Decorator 簽章的 Story 是 React.FC（props 為空），需收窄後才能傳 args。
 * The Decorator signature types Story as React.FC (empty props), so it must be narrowed before args
 * can be passed.
 */
type IStoryWithArgs = React.FC<{ args?: Record<string, unknown> }>;

/** 所有可選背景（兩分組攤平，用於比對目前 URL 是否在清單內） / All choices (both groups flattened, to test whether the current URL is listed) */
const allChoices: IBackgroundChoice[] = sampleBackgroundChoiceGroups.flatMap(
	(group) => group.choices,
);

/** 清單內的背景 URL 集合 / Set of listed background URLs */
const choiceUrlSet = new Set(allChoices.map((choice) => choice.url));

/** 背景尺寸預設（寬×高；點擊直接賦值 bgSize） / Background size presets (width×height; click assigns bgSize directly) */
const BG_SIZE_PRESETS: { label: string; width: number; height: number }[] = [
	{ label: `角色排版 ${SPRITE_LAYOUT_WIDTH}×${SPRITE_LAYOUT_HEIGHT}`, width: SPRITE_LAYOUT_WIDTH, height: SPRITE_LAYOUT_HEIGHT },
	{ label: '大圖 768×320', width: 768, height: 320 },
];

/** 面板容器樣式（暗色工具列，與 editModePanel 同色系） / Panel container style (dark toolbar, same palette as editModePanel) */
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

/** 下拉選單與輸入框樣式 / Select and input style */
const controlStyle: React.CSSProperties = {
	background: '#243044',
	border: '1px solid #3a4a63',
	borderRadius: '3px',
	color: '#e0e0e0',
	fontFamily: GAME_FONT,
	fontSize: '12px',
	padding: '2px 6px',
};

/** 套用鈕樣式（與 editModePanel 按鈕同色系） / Apply button style (same palette as editModePanel buttons) */
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

/** 開啟中的切換鈕樣式（亮藍底，與 editModePanel 同色系） / Active toggle style (bright blue, same palette as editModePanel) */
const activeButtonStyle: React.CSSProperties = {
	...buttonStyle,
	background: '#3a5a80',
	borderColor: '#6d94c4',
};

/** 分組標籤樣式（「縮放」「對齊」等前綴文字） / Group-label style (prefix text such as "scale" / "align") */
const groupLabelStyle: React.CSSProperties = {
	color: '#8ea3bf',
};

/** 數值輸入框樣式（bgSize 寬／高） / Numeric input style (bgSize width / height) */
const numberInputStyle: React.CSSProperties = {
	...controlStyle,
	width: '48px',
};

/** bgSize → 輸入框草稿字串（空＝該維度不設） / bgSize → input draft strings (empty = dimension unset) */
function bgSizeToDraft(bgSize: IBattleFieldBgSize | undefined): { width: string; height: string }
{
	return {
		width: bgSize?.width != null ? String(bgSize.width) : '',
		height: bgSize?.height != null ? String(bgSize.height) : '',
	};
}

/**
 * 建立背景選擇面板裝飾器（story 用）
 * Build the background picker panel decorator (for stories)
 *
 * 裝飾器在 Storybook 渲染期間被呼叫，可安全使用 useArgs hook 讀取 story args（唯讀）。
 * 覆寫則走本地 state + <Story args>，不寫回 args store。
 * Decorators are invoked during the Storybook render, so the useArgs hook is safe here for READING
 * story args. Overrides go through local state + <Story args> and are never written back to the store.
 */
export const makeBackgroundPickerDecorator = (): Decorator =>
{
	return (Story) =>
	{
		const StoryWithArgs = Story as unknown as IStoryWithArgs;
		/** args 僅供讀取基準值；覆寫一律走本地 state（不呼叫 updateArgs） / args are read-only baseline; overrides live in local state (no updateArgs) */
		const [args] = useArgs();
		const baseArgs = (args ?? {}) as Record<string, unknown>;
		const baseConfig = (baseArgs.config ?? {}) as IBattleFieldConfig;

		/**
		 * 本地覆寫（undefined＝未覆寫，沿用 args 基準）。
		 * bgSize 額外以 null 表示「明確清除」，與 undefined（未覆寫）區分。
		 * Local overrides (undefined = not overridden, the args baseline is used).
		 * bgSize additionally uses null for "explicitly cleared" to tell it apart from undefined.
		 */
		const [urlOverride, setUrlOverride] = useState<string | undefined>(undefined);
		const [scaleOverride, setScaleOverride] = useState<EnumBattleFieldBgScale | undefined>(undefined);
		const [hAlignOverride, setHAlignOverride] = useState<IBattleFieldBgHAlign | undefined>(undefined);
		const [vAlignOverride, setVAlignOverride] = useState<IBattleFieldBgVAlign | undefined>(undefined);
		const [bgSizeOverride, setBgSizeOverride] = useState<IBattleFieldBgSize | null | undefined>(undefined);

		/**
		 * 目前生效的背景尺寸：優先本地覆寫，否則退回 args 基準
		 * （config.bgSize 供 BattleFieldScene 傳遞；args.bgSize 是 BattleFieldLayers 直收的 prop）。
		 * Effective background size: the local override first, else the args baseline
		 * (config.bgSize is forwarded by BattleFieldScene; args.bgSize is the prop BattleFieldLayers reads directly).
		 */
		const storeBgSize: IBattleFieldBgSize | undefined =
			baseConfig.bgSize ?? (baseArgs.bgSize as IBattleFieldBgSize | undefined);
		const currentBgSize: IBattleFieldBgSize | undefined =
			bgSizeOverride === undefined ? storeBgSize : (bgSizeOverride ?? undefined);

		/** 目前生效值（覆寫優先） / Effective values (override wins) */
		const current = urlOverride ?? baseConfig.backgroundImageUrl ?? '';
		const currentBgScale = scaleOverride ?? baseConfig.bgScale ?? EnumBattleFieldBgScale.Natural;
		const currentHAlign: IBattleFieldBgHAlign = hAlignOverride ?? baseConfig.bgHAlign ?? 'center';
		const currentVAlign: IBattleFieldBgVAlign = vAlignOverride ?? baseConfig.bgVAlign ?? 'bottom';

		/** bgSize 數值草稿（字串，空＝維度不設）：外部生效值改變時同步，避免輸入框顯示過期值 / bgSize draft (strings; empty = dimension unset): re-synced when the effective value changes so the input never shows a stale value) */
		const effectiveBgSizeRef = useRef(currentBgSize);
		const [sizeDraft, setSizeDraft] = useState(() => bgSizeToDraft(currentBgSize));
		useEffect(() =>
		{
			if (effectiveBgSizeRef.current === currentBgSize)
			{
				return;
			}
			effectiveBgSizeRef.current = currentBgSize;
			setSizeDraft(bgSizeToDraft(currentBgSize));
		}, [currentBgSize]);

		/** 下拉選單變更（同時清空自訂草稿，讓輸入框回到目前背景） / Dropdown change (also clears the custom draft so the input follows the current background) */
		const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) =>
		{
			if (!event.target.value) return;
			setDraft(null);
			setUrlOverride(event.target.value);
		};

		/** 自訂網址草稿：null 表示「未編輯」，顯示目前背景；一旦輸入則以草稿為準 / Custom-URL draft: null means "not edited" (show the current background); once typed, the draft wins */
		const [draft, setDraft] = useState<string | null>(null);
		const shownUrl = draft ?? current;

		/** 自訂網址：Enter 或按「套用」時生效 / Custom URL: applied on Enter or the Apply button */
		const handleApply = () =>
		{
			const url = shownUrl.trim();
			if (url) setUrlOverride(url);
		};

		/** 依草稿組出 bgSize（兩個維度都空＝清除 bgSize） / Build bgSize from the draft (both fields empty = clear bgSize) */
		const handleApplySize = () =>
		{
			const width = Number.parseInt(sizeDraft.width, 10);
			const height = Number.parseInt(sizeDraft.height, 10);
			/**
			 * 先以 Partial 組裝（允許兩維度皆空），
			 * 確認至少一個維度有值後，才收窄為 IBattleFieldBgSize（要求至少一個維度）。
			 * Assemble as Partial first (both dimensions may be empty), then narrow to
			 * IBattleFieldBgSize (which requires at least one dimension) only when a value exists.
			 */
			const size: Partial<ISpriteImageSize> = {};
			if (Number.isFinite(width) && width > 0) size.width = width;
			if (Number.isFinite(height) && height > 0) size.height = height;
			setBgSizeOverride(Object.keys(size).length > 0 ? (size as IBattleFieldBgSize) : null);
		};

		/** 尺寸預設：直接對 bgSize 賦值並同步草稿 / Size preset: assign bgSize directly and sync the draft */
		const applySizePreset = (width: number, height: number) =>
		{
			setBgSizeOverride({ width, height });
		};

		/**
		 * 合成注入 Story 的 args：args 基準 + 本地覆寫。
		 * bgSize 同時寫進頂層 prop 與 config，讓 BattleFieldLayers（讀 prop）與
		 * BattleFieldScene（讀 config.bgSize）都生效；清除時以 undefined 取代（等同未提供）。
		 * Compose the args injected into the Story: the args baseline + the local overrides.
		 * bgSize goes into both the top-level prop and config so BattleFieldLayers (reads the prop) and
		 * BattleFieldScene (reads config.bgSize) both pick it up; clearing writes undefined (= omitted).
		 */
		const mergedArgs: Record<string, unknown> = {
			...baseArgs,
			bgSize: currentBgSize,
			config: {
				...baseConfig,
				backgroundImageUrl: current,
				bgScale: currentBgScale,
				bgHAlign: currentHAlign,
				bgVAlign: currentVAlign,
				bgSize: currentBgSize,
			},
		};

		return (
			<>
				<div style={panelStyle}>
					<span>背景：</span>
					<select style={controlStyle} value={choiceUrlSet.has(current) ? current : ''} onChange={handleSelect}>
						<option value="" disabled>
							{choiceUrlSet.has(current) ? '選擇背景…' : '（自訂網址）'}
						</option>
						{sampleBackgroundChoiceGroups.map((group) => (
							<optgroup key={group.label} label={group.label}>
								{group.choices.map((choice) => (
									<option key={choice.url} value={choice.url}>{choice.label}</option>
								))}
							</optgroup>
						))}
					</select>
					<input
						style={{ ...controlStyle, width: '280px' }}
						value={shownUrl}
						placeholder="自訂背景網址（Enter 套用）"
						onChange={(event) => setDraft(event.target.value)}
						onKeyDown={(event) =>
						{
							if (event.key === 'Enter') handleApply();
						}}
					/>
					<button style={buttonStyle} onClick={handleApply}>套用</button>
					<span style={groupLabelStyle}>縮放</span>
					<select
						style={controlStyle}
						value={currentBgScale}
						onChange={(event) => setScaleOverride(event.target.value as EnumBattleFieldBgScale)}
					>
						{BG_SCALE_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>{option.label}</option>
						))}
					</select>
					<span style={groupLabelStyle}>對齊</span>
					{BG_H_ALIGN_OPTIONS.map((option) => (
						<button
							key={`h-${option.value}`}
							style={currentHAlign === option.value ? activeButtonStyle : buttonStyle}
							onClick={() => setHAlignOverride(option.value)}
						>
							{option.label}
						</button>
					))}
					<span style={groupLabelStyle}>／</span>
					{BG_V_ALIGN_OPTIONS.map((option) => (
						<button
							key={`v-${option.value}`}
							style={currentVAlign === option.value ? activeButtonStyle : buttonStyle}
							onClick={() => setVAlignOverride(option.value)}
						>
							{option.label}
						</button>
					))}
					<span style={groupLabelStyle}>尺寸</span>
					<input
						style={numberInputStyle}
						type="number"
						min={1}
						placeholder="寬"
						value={sizeDraft.width}
						onChange={(event) => setSizeDraft((prev) => ({ ...prev, width: event.target.value }))}
						onKeyDown={(event) =>
						{
							if (event.key === 'Enter') handleApplySize();
						}}
					/>
					<span>×</span>
					<input
						style={numberInputStyle}
						type="number"
						min={1}
						placeholder="高"
						value={sizeDraft.height}
						onChange={(event) => setSizeDraft((prev) => ({ ...prev, height: event.target.value }))}
						onKeyDown={(event) =>
						{
							if (event.key === 'Enter') handleApplySize();
						}}
					/>
					<button style={buttonStyle} onClick={handleApplySize}>套用尺寸</button>
					{BG_SIZE_PRESETS.map((preset) => (
						<button
							key={preset.label}
							style={buttonStyle}
							onClick={() => applySizePreset(preset.width, preset.height)}
						>
							{preset.label}
						</button>
					))}
					<button style={buttonStyle} onClick={() => { setSizeDraft({ width: '', height: '' }); setBgSizeOverride(null); }}>清除尺寸</button>
				</div>
				<StoryWithArgs args={mergedArgs} />
			</>
		);
	};
};
