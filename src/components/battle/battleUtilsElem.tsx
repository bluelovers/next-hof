import { EnumActionType } from "./enums";

export interface IValueChangeInputCore01 {
	/** 變化前（與 to 同時提供時以符號相連）/ Before (joined to `to` by the symbol) */
	from: React.ReactNode;
	/** 變化後 / After */
	to: React.ReactNode;
	/**
	 * 變化所屬的行動型別（選填）
	 * Action type the change belongs to (optional)
	 *
	 * 用來控制兩端數值之間的符號：`EnumActionType.Delay` 固定印 `⏳↘`；
	 * 未提供型別時改由升降判定，兩端都不是數字則退回預設符號 `⭢`。
	 * Controls the symbol between the two values: `EnumActionType.Delay` always prints `⏳↘`;
	 * without an action type the direction decides instead, and when neither end is a number
	 * the default symbol `⭢` is used.
	 *
	 * 版面（ValueChange）把 action.type 傳進來，資料端也可自行指定以覆寫。
	 * The layout (ValueChange) passes `action.type` in, and producers may also set it to override.
	 */
	type?: EnumActionType;
}

export interface IValueChangeInputCore02 {
	/** 預組好的變化字串（優先採用；與 IBattleAction.valueChangeText 同名同義）/ Pre-assembled change string (wins; same name and meaning as IBattleAction.valueChangeText) */
	valueChangeText: React.ReactNode;
}

/**
 * 數值變化文字的輸入（預組字串或變化前後值）
 * Value-change text input (a pre-assembled string or the before/after values)
 *
 * 兩種來源都以選填提供，由 buildValueChange 決定誰生效；刻意不用 ITSAnyOfUnion，
 * 因為它會把「全員皆選填」的欄位（如 type）壓成 never，反而吃不到 EnumActionType。
 * Both sources are optional and buildValueChange decides which one wins; ITSAnyOfUnion is
 * deliberately avoided here because it collapses a key that is optional in every member
 * (such as `type`) to `never`, which would swallow the EnumActionType.
 */
export type IValueChangeInput = Partial<IValueChangeInputCore01> &
	Partial<IValueChangeInputCore02>;

/**
 * 兩端數值之間的符號（單一事實來源，任何地方都不得自行拼接符號）
 * Symbols between the two values (single source of truth; nobody concatenates a symbol elsewhere)
 */
export const VALUE_CHANGE_SYMBOL = {
	/** 預設（無從判定升降）/ default (the direction cannot be told) */
	default: "⭢",
	/** 數值上升 / value rising */
	rise: "↗",
	/** 數值下降 / value falling */
	fall: "↘",
	/** 延遲（Delay 的硬直率）/ delay (the action-lag rate) */
	delay: "⏳↘",
} as const;

/**
 * 變化端點轉成可比大小的數值（無法轉換時回傳 undefined）
 * Turn a change endpoint into a comparable number (undefined when it does not convert)
 *
 * `from`／`to` 是 ReactNode（延遲的變化後是 `25/100` 之類的比率字串），
 * 只有真正能當數字看的值才參與升降判定。
 * `from` / `to` are ReactNode (a delay's `to` is a rate string such as `25/100`), so only
 * values that really are numbers take part in the direction check.
 *
 * @param value - 變化端點 / change endpoint
 * @returns 數值或 undefined / the number or undefined
 */
function toComparableNumber(value: React.ReactNode): number | undefined {
	if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
	if (typeof value === "string" && value.trim() !== "") {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : undefined;
	}
	return undefined;
}

/**
 * 取得兩端數值之間的符號（單一事實來源）
 * Resolve the symbol between the two values (single source of truth)
 *
 * 判定順序＝型別 → 升降 → 預設：
 * 1. `EnumActionType.Delay` 固定 `⏳↘`（變化後是 `25/100` 比率，比不出升降）；
 * 2. 兩端都是數字時依大小：升 `↗`、降 `↘`、持平 `⭢`；
 * 3. 其餘情況（含非數字端點）用預設 `⭢`。
 * Resolution order is action type → direction → default:
 * 1. `EnumActionType.Delay` is always `⏳↘` (its `to` is a `25/100` rate, so no direction can be told);
 * 2. when both ends are numbers, compare them: `↗` rising, `↘` falling, `⭢` when equal;
 * 3. everything else (non-numeric ends included) falls back to the default `⭢`.
 *
 * @param input - 變化輸入（型別與兩端值）/ change input (the action type and both ends)
 * @returns 符號 / the symbol
 */
export function getValueChangeSymbol(input: Partial<IValueChangeInputCore01>): string {
	if (input.type === EnumActionType.Delay) return VALUE_CHANGE_SYMBOL.delay;
	const from = toComparableNumber(input.from);
	const to = toComparableNumber(input.to);
	if (from !== undefined && to !== undefined) {
		if (to > from) return VALUE_CHANGE_SYMBOL.rise;
		if (to < from) return VALUE_CHANGE_SYMBOL.fall;
	}
	return VALUE_CHANGE_SYMBOL.default;
}

/**
 * 組出數值變化內容（單一事實來源）
 * Assemble the value-change content (single source of truth)
 *
 * 優先採用預組字串 `valueChangeText`；否則在 `from`／`to` 齊備時輸出
 * `from {符號} to`，符號由 getValueChangeSymbol 依型別與升降決定；
 * 兩者皆無時回傳 null，渲染端據此輸出空內容（不會出現空括號）。
 * The pre-assembled `valueChangeText` wins; otherwise `from {symbol} to` is emitted when both
 * ends are present, with the symbol coming from getValueChangeSymbol (action type and
 * direction); when neither exists `null` comes back so the renderer emits nothing (never
 * empty parentheses).
 *
 * BattleAction 的 ValueChange 與 showcase 轉接層共用此函式，符號只書寫一次。
 * BattleAction's ValueChange and the showcase adapter share this helper, so the symbol is
 * written exactly once.
 *
 * @param input - 變化文字輸入 / Value-change input
 * @returns 變化內容（無資料時 null）/ Change content (null when there is none)
 */
export function buildValueChange(input: IValueChangeInput) {
	if (input.valueChangeText != null) return input.valueChangeText;
	if (input.from != null && input.to != null) return (
		<>{input.from} {getValueChangeSymbol(input)} {input.to}</>
	);
	return null;
}
