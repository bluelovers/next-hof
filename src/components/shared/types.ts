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
import type { ITSPickExtra } from 'ts-type';

export type ITSRequiredWith2<T, K extends keyof T = never> = [K] extends [never]
  ? T
  : Omit<T, K> & Required<Pick<T, K>>;

/**
 * 共用樣式屬性基底（className ＋ style）
 * Shared style-props base (className + style)
 *
 * 兩欄位皆為選填；僅需其中一項的元件亦可繼承此基底，
 * 並可順勢同時支援 className 與 style（多數元件皆如此）。
 * Both fields are optional; a component needing only one of them may still extend this base
 * and thereby also support the other (most components do).
 *
 * 需要「呼叫方一定要給」時，請改用 {@link IStylePropsRequired}（見下方），不要自行重抄
 * `className: string`，以免欄位宣告與基底脫節。
 * When a field must be supplied by the caller, use {@link IStylePropsRequired} (below)
 * instead of restating `className: string` by hand, so the declaration never drifts from
 * this base.
 */
export interface IStyleProps {
	/** 附加 CSS class（與元件基礎 class 併存，兩者不互相取代） / Extra CSS class (kept alongside base class) */
	className?: string;
	/** 自訂樣式（可複寫或追加） / Custom style */
	style?: CSSProperties;
}

/**
 * 必填版樣式屬性（以 ITSPickExtra 指定需必填的鍵，其餘鍵維持選填）
 * Required style props (ITSPickExtra promotes the chosen keys to required; the rest stay optional)
 *
 * {@link IStyleProps} 的兩欄位預設皆選填；本型別沿用同一份欄位定義（不重新宣告），
 * 只把 `K` 指定的鍵升級為必填，因此介面仍以 `extends` 繼承即可取得欄位與其 JSDoc。
 * `IStyleProps` ships both fields as optional; this type reuses the very same declarations
 * (nothing is restated) and only promotes the keys in `K` to required, so an interface can
 * still pick the fields — and their JSDoc — up through `extends`.
 *
 * @typeParam K 需必填的樣式鍵（預設全部） / style keys that must be required (all by default)
 *
 * @example
 * interface ICorpseSpecControls extends IStylePropsRequired<'className' | 'style'> {
 *   imageUrl: string; // 與樣式無關的欄位照常補在本介面 / unrelated fields stay in this interface
 * }
 */
export type IStylePropsRequired<K extends keyof IStyleProps = keyof IStyleProps> = ITSPickExtra<
	IStyleProps,
	K
>;
