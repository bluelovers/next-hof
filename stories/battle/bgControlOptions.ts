/**
 * 背景控制項共用選項（背景選擇面板與編輯面板共用，單一事實來源）
 * Shared background-control options (single source of truth for the picker and edit panels)
 *
 * 兩個面板都提供「背景縮放模式 / 水平對齊 / 垂直對齊」控制項，選項值域必須與
 * config.bgScale / bgHAlign / bgVAlign 一致，因此集中定義於此，避免各自維護而脫節。
 * Both panels expose scale-mode / horizontal / vertical alignment controls whose value domains
 * must match config.bgScale / bgHAlign / bgVAlign, so they are centralized here instead of being
 * maintained separately and drifting apart.
 */
import type {
	IBattleFieldBgHAlign,
	IBattleFieldBgVAlign,
} from '../../src/components/battle/types';
import { EnumBattleFieldBgScale } from '../../src/components/battle/enums';

/** 選項形狀（值 + 顯示標籤） / Option shape (value + display label) */
export interface IBgControlOption<TValue>
{
	value: TValue;
	label: string;
}

/** 背景縮放模式選項（與 config.bgScale 同值域） / Background scale-mode options (same value domain as config.bgScale) */
export const BG_SCALE_OPTIONS: IBgControlOption<EnumBattleFieldBgScale>[] = [
	{ value: EnumBattleFieldBgScale.Natural, label: '原始 natural' },
	{ value: EnumBattleFieldBgScale.Cover, label: '覆蓋 cover' },
	{ value: EnumBattleFieldBgScale.Contain, label: '完整 contain' },
	{ value: EnumBattleFieldBgScale.Stretch, label: '拉伸 stretch' },
	{ value: EnumBattleFieldBgScale.Repeat, label: '平鋪 repeat' },
];

/** 背景水平對齊選項（與 config.bgHAlign 同值域） / Background horizontal alignment options (same domain as config.bgHAlign) */
export const BG_H_ALIGN_OPTIONS: IBgControlOption<IBattleFieldBgHAlign>[] = [
	{ value: 'left', label: '靠左' },
	{ value: 'center', label: '置中' },
	{ value: 'right', label: '靠右' },
];

/** 背景垂直對齊選項（與 config.bgVAlign 同值域；repeat 平鋪不受影響） / Background vertical alignment options (same domain as config.bgVAlign; repeat mode unaffected) */
export const BG_V_ALIGN_OPTIONS: IBgControlOption<IBattleFieldBgVAlign>[] = [
	{ value: 'top', label: '置頂' },
	{ value: 'middle', label: '置中' },
	{ value: 'bottom', label: '置底' },
];
