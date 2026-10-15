/**
 * 戰場背景選擇面板（共用 Storybook 裝飾器）
 * Battlefield background picker panel (shared Storybook decorator)
 *
 * 提供兩個操作，直接寫回 args.config.backgroundImageUrl：
 * - 下拉選單：從 sampleData 的背景分組（標準 480×200 / 768×320 大圖）挑選
 * - 自訂網址：手動輸入任意圖片 URL 後套用（支援跨域外部圖檔）
 * Provides two controls, both writing straight back to args.config.backgroundImageUrl:
 * - a dropdown of the background groups from sampleData (standard 480×200 / 768×320 large)
 * - a custom URL field to apply any image URL (cross-origin images included)
 */
import React from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Decorator } from '../decorators';
import { GAME_FONT } from '../decorators';
import type { IBattleFieldConfig } from '../../src/components/battle/types';
import {
	sampleBackgroundChoiceGroups,
	type IBackgroundChoice,
} from './sampleData';

/** 所有可選背景（兩分組攤平，用於比對目前 URL 是否在清單內） / All choices (both groups flattened, to test whether the current URL is listed) */
const allChoices: IBackgroundChoice[] = sampleBackgroundChoiceGroups.flatMap(
	(group) => group.choices,
);

/** 清單內的背景 URL 集合 / Set of listed background URLs */
const choiceUrlSet = new Set(allChoices.map((choice) => choice.url));

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

		/** 套用背景：只改 backgroundImageUrl，其餘 config 欄位（bgScale 等）原樣保留 / Apply background: only backgroundImageUrl changes, other config fields (bgScale etc.) are kept */
		const applyBackground = (url: string) =>
		{
			updateArgs({ config: { ...config, backgroundImageUrl: url } });
		};

		/** 自訂網址草稿：null 表示「未編輯」，顯示目前背景；一旦輸入則以草稿為準 / Custom-URL draft: null means "not edited" (show the current background); once typed, the draft wins */
		const [draft, setDraft] = React.useState<string | null>(null);
		const shownUrl = draft ?? current;

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
				</div>
				<Story />
			</>
		);
	};
};
