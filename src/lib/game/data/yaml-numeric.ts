/**
 * 數值正規化工具
 *
 * 與 yaml-coerce 的分工：yaml-coerce 走訪整份原始文件（依 COERCE_SPECS 逐欄收斂），屬讀取階段；
 * 本檔只在轉換階段收斂個別欄位，語意是「可解析則取值、否則回退」。兩者刻意分開——
 * 前者對未知值原樣保留，後者對無法解析的值回 fallback。
 *
 * `toNumberArray` / `toOptionalNumber` 目前僅測試引用，作為通用工具保留。
 */

/**
 * 數值正規化 / Numeric coercion
 * 字串／數字／布林／null → number；無法解析時回 fallback（預設 0）。
 * Coerce string / number / boolean / null to number; NaN falls back (default 0).
 */
export function toNumber(value: string | number | boolean | undefined, fallback = 0): number
{
	if (value === undefined || value === '') return fallback;
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

/** 陣列數值正規化（字串陣列 → number 陣列）/ coerce a numeric array (strings → numbers) */
export function toNumberArray(value: readonly (string | number)[] | undefined, fallback = 0): number[]
{
	if (!Array.isArray(value)) return [];
	return value.map((v) => toNumber(v, fallback));
}

/** 可選數值正規化：無法解析或省略時回 undefined / optional numeric coercion (NaN/absent → undefined) */
export function toOptionalNumber(value: string | number | undefined): number | undefined
{
	if (value === undefined || value === '') return undefined;
	const n = Number(value);
	return Number.isFinite(n) ? n : undefined;
}

/**
 * 字串鍵紀錄 → number 鍵紀錄 / string-keyed record → number-keyed record
 * 用於 reward.itemtable（{ '6000': '1000' } → { 6000: 1000 }）。
 * Used for reward.itemtable ({ '6000': '1000' } → { 6000: 1000 }).
 */
export function toNumberRecord(
	value: Record<string, string | number> | undefined,
): Record<number, number>
{
	const out: Record<number, number> = {};
	if (!value) return out;
	for (const [k, v] of Object.entries(value))
	{
		const key = Number(k);
		const num = toNumber(v);
		if (Number.isFinite(key)) out[key] = num;
	}
	return out;
}
