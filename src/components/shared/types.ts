/**
 * 共用展示層型別（跨元件基底）
 * Shared presentation-layer types (cross-component bases)
 *
 * IStyleProps 抽出「附加 class ＋ 自訂樣式」這組反覆出現的選填欄位，
 * 任何需要 className / style 的元件或資料介面都應沿用此基底，避免各處重複宣告。
 * IStyleProps factors out the recurring "extra class + custom style" optional fields so any
 * component/data interface needing className/style reuses this base instead of redeclaring.
 */
import type { CSSProperties } from 'react';

/**
 * 共用樣式屬性基底（className ＋ style）
 * Shared style-props base (className + style)
 *
 * 兩欄位皆為選填；僅需其中一項的元件亦可繼承此基底，
 * 並可順勢同時支援 className 與 style（多數元件皆如此）。
 * Both fields are optional; a component needing only one of them may still extend this base
 * and thereby also support the other (most components do).
 */
export interface IStyleProps {
	/** 附加 CSS class（與元件基礎 class 併存，兩者不互相取代） / Extra CSS class (kept alongside base class) */
	className?: string;
	/** 自訂樣式（可複寫或追加） / Custom style */
	style?: CSSProperties;
}
