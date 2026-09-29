/**
 * 百分比公用邏輯 / Shared percentage logic
 * 單一事實來源：HP/SP 百分比（hpPercent/spPercent）、UI 條、EnergyExchange 率
 * 皆由此處計算，不各自硬編碼算式。
 * Single source of truth for the (value / cap) × 100 formula — HP/SP percents, UI bars and
 * the EnergyExchange rates all derive from here instead of re-coding the expression.
 */

/**
 * 百分比（100 制）/ percentage (0–100 scale)
 *
 * 依動態上限計算 `value / max × 100`；上限 < = 0 時回 0（防呆，避免 NaN）；
 * 結果取整（對齊原始演算法的 floor 語意）。
 * Computes `value / max × 100`; a non-positive cap yields 0 (no NaN);
 * the result is floored (mirrors the original floor semantics).
 */
export function percentOf(value: number, max: number): number
{
	return max > 0 ? Math.floor((value / max) * 100) : 0;
}