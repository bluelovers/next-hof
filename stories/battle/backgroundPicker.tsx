/**
 * 戰場背景選擇面板（共用 Storybook 裝飾器）
 *
 * 提供背景工具列，直接寫回 args（config 與 bgSize）：
 * - 下拉選單：從 sampleData 的背景分組（標準 480×200 / 768×320 大圖）挑選
 * - 自訂網址：手動輸入任意圖片 URL 後套用（支援跨域外部圖檔）
 * - 縮放模式：寫回 config.bgScale（natural / cover / contain / stretch / repeat）
 * - 水平／垂直對齊：以按鈕直接對 config.bgHAlign / bgVAlign 賦值（目前值高亮）
 * - 背景尺寸：數值輸入框直接賦值 bgSize（寬／高，空字串＝該維度不設），
 *   並附角色排版（480×200）與大圖（720×320 / 768×320）預設與清除鈕；
 *   同時寫回 args.bgSize（BattleFieldLayers 直收 prop）與 config.bgSize（BattleFieldScene 傳遞）
 */
import React from 'react';
/**
 * Hook 一律取自 storybook/preview-api：裝飾器 render 內已使用 useArgs，
 * 框架 hook（useState / useEffect / useRef…）若再從 React 混用，
 * 可能與 Storybook 渲染器的 hook 來源不一致；preview-api 提供同名等價 hook 供同處使用。
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

/**
 * 建立背景選擇面板裝飾器（story 用）
 * Build the background picker panel decorator (for stories)
 *
 * 裝飾器在 Storybook 渲染期間被呼叫，可安全使用 useArgs hook 讀寫 story args。
 * Decorators are invoked during the Storybook render, so the useArgs hook is safe here.
 */
export const makeBackgroundPickerDecorator = (): Decorator =>
{
	return (Story) =>
	{
		const [args, updateArgs] = useArgs();
		const config = ((args ?? {}).config ?? {}) as IBattleFieldConfig;
		const current = config.backgroundImageUrl ?? '';
		/**
		 * 目前背景尺寸：優先 config.bgSize（BattleFieldScene 傳遞），
		 * 退回 args.bgSize（BattleFieldLayers 直收的 prop，故事以它為主）。
		 * Current background size: prefer config.bgSize (forwarded by BattleFieldScene), falling
		 * back to args.bgSize (the prop BattleFieldLayers reads directly; stories use it as primary).
		 */
		const currentBgSize: IBattleFieldBgSize | undefined =
			config.bgSize ?? ((args ?? {}).bgSize as IBattleFieldBgSize | undefined);
		/** 目前縮放模式（預設 natural） / Current scale mode (default natural) */
		const currentBgScale = config.bgScale ?? EnumBattleFieldBgScale.Natural;
		/** 目前水平對齊（預設 center） / Current horizontal alignment (default center) */
		const currentHAlign: IBattleFieldBgHAlign = config.bgHAlign ?? 'center';
		/** 目前垂直對齊（預設 bottom） / Current vertical alignment (default bottom) */
		const currentVAlign: IBattleFieldBgVAlign = config.bgVAlign ?? 'bottom';

		/** 套用背景：只改 backgroundImageUrl，其餘 config 欄位（bgScale 等）原樣保留 / Apply background: only backgroundImageUrl changes, other config fields (bgScale etc.) are kept */
		const applyBackground = (url: string) =>
		{
			updateArgs({ config: { ...config, backgroundImageUrl: url } });
		};

		/** 寫回戰場配置（縮放／對齊控制項共用） / Write back the battlefield config (shared by the scale/align controls) */
		const patchConfig = (patch: Partial<IBattleFieldConfig>) =>
		{
			updateArgs({ config: { ...config, ...patch } });
		};

		/**
		 * 直接對背景尺寸賦值：同時寫回 config.bgSize 與 args.bgSize，
		 * 讓 BattleFieldScene（讀 config.bgSize）與 BattleFieldLayers（讀 prop bgSize）都生效。
		 * Assign the background size directly: both config.bgSize and args.bgSize are written so
		 * BattleFieldScene (reads config.bgSize) and BattleFieldLayers (reads the bgSize prop) both pick it up.
		 */
		const applyBgSize = (bgSize: IBattleFieldBgSize | undefined) =>
		{
			updateArgs({ bgSize, config: { ...config, bgSize } });
		};

		/** 自訂網址草稿：null 表示「未編輯」，顯示目前背景；一旦輸入則以草稿為準 / Custom-URL draft: null means "not edited" (show the current background); once typed, the draft wins */
		const [draft, setDraft] = useState<string | null>(null);
		const shownUrl = draft ?? current;

		/**
		 * bgSize 數值草稿（字串，空＝維度不設）：以 ref 追蹤目前值，
		 * 外部（story args 變動）改到 bgSize 時同步草稿，避免輸入框顯示過期值。
		 * bgSize numeric draft (strings; empty = dimension unset): the current value is tracked in
		 * a ref so an external bgSize change (story args) re-syncs the draft instead of leaving a stale input.
		 */
		const currentBgSizeRef = useRef(currentBgSize);
		const [sizeDraft, setSizeDraft] = useState(() => ({
			width: currentBgSize?.width != null ? String(currentBgSize.width) : '',
			height: currentBgSize?.height != null ? String(currentBgSize.height) : '',
		}));
		useEffect(() =>
		{
			if (currentBgSizeRef.current === currentBgSize)
			{
				return;
			}
			currentBgSizeRef.current = currentBgSize;
			setSizeDraft({
				width: currentBgSize?.width != null ? String(currentBgSize.width) : '',
				height: currentBgSize?.height != null ? String(currentBgSize.height) : '',
			});
		}, [currentBgSize]);

		/** 下拉選單變更（同時清空自訂草稿，讓輸入框回到目前背景） / Dropdown change (also clears the custom draft so the input follows the current background) */
		const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) =>
		{
			if (!event.target.value) return;
			setDraft(null);
			applyBackground(event.target.value);
		};

		/** 自訂網址：Enter 或按「套用」時生效 / Custom URL: applied on Enter or the Apply button */
		const handleApply = () =>
		{
			const url = shownUrl.trim();
			if (url) applyBackground(url);
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
			applyBgSize(Object.keys(size).length > 0 ? (size as IBattleFieldBgSize) : undefined);
		};

		/** 尺寸預設：直接對 bgSize 賦值並同步草稿 / Size preset: assign bgSize directly and sync the draft */
		const applySizePreset = (width: number, height: number) =>
		{
			setSizeDraft({ width: String(width), height: String(height) });
			applyBgSize({ width, height });
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
						onChange={(event) => patchConfig({ bgScale: event.target.value as EnumBattleFieldBgScale })}
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
							onClick={() => patchConfig({ bgHAlign: option.value })}
						>
							{option.label}
						</button>
					))}
					<span style={groupLabelStyle}>／</span>
					{BG_V_ALIGN_OPTIONS.map((option) => (
						<button
							key={`v-${option.value}`}
							style={currentVAlign === option.value ? activeButtonStyle : buttonStyle}
							onClick={() => patchConfig({ bgVAlign: option.value })}
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
					<button style={buttonStyle} onClick={() => { setSizeDraft({ width: '', height: '' }); applyBgSize(undefined); }}>清除尺寸</button>
				</div>
				<Story />
			</>
		);
	};
};
