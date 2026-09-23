// 數學與機率工具 / Math & probability helpers

/** 屬性平方根基底：sqrt(STR)*10 等傷害公式使用 */
export function sqrtStat(stat: number): number {
	return Math.sqrt(stat);
}

/** 取兩數中較大者的 ceil（用於 max(...) 類計算的整數化） */
export function ceilMax(a: number, b: number): number {
	return Math.ceil(Math.max(a, b));
}

/** 數值夾取 / clamp */
export function clamp(v: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, v));
}

/** 四捨五入取整（對應 PHP round，預設捨入到整數） */
export function round(v: number): number {
	return Math.round(v);
}

/** 無條件進位（對應 PHP ceil） */
export function ceil(v: number): number {
	return Math.ceil(v);
}
