/**
 * 百分比公用邏輯 / Shared percentage logic
 *
 * 全專案的百分比計算只存在於本模組：任何 `(a ?? 0) / 100`、`(a ?? 100) / 100`、`a / 100`，
 * 以及它們與基礎值 b 的三種組合 `b * (1 + f)`、`b * (1 - f)`、`b * f`，
 * 一律改以下列函式表達，呼叫處不再重寫算式。
 *
 * - percentOf(value, max)    → value / max × 100   比率 → 百分比（0–100）/ ratio → percent
 * - percentFactor(pct, fb)   → (pct ?? fb) / 100   百分比 → 係數（0–1，原語）/ percent → factor
 * - plusPercent(value, pct)  → value × (1 + pct%)  加 p%（正向放大）/ add pct% (scale up)
 * - minusPercent(value, pct) → value × (1 − pct%)  減 p%（負向縮減）/ subtract pct% (scale down)
 * - takePercent(value, pct)  → value × pct%        取 p%（按百分比取出量）/ take pct% of value
 */

/**
 * 百分比基準：滿額＝100，同時是換算用的分子／分母
 */
export const PERCENT_BASE = 100;

/**
 * 「無百分比效果」＝0%
 *
 * 使用時機：`minusPercent(dmg, target.def[EnumDefSlot.PhysPct], PERCENT_NONE)`
 */
export const PERCENT_NONE = 0;

/**
 * 百分比（100 制）/ percentage (0–100 scale)
 *
 * 依動態上限計算 `value / max × 100`；上限 < = 0 時回 0（防呆，避免 NaN）；
 * 結果取整（對齊原始演算法的 floor 語意）。
 *
 * @param value - 當前量（HP/SP 等）
 * @param max - 上限 / the cap
 * @returns 0–100 的百分比
 */
export function percentOf(value: number, max: number): number
{
	return max > 0 ? Math.floor((value / max) * 100) : 0;
}

/**
 * 百分比 → 係數：`(value ?? fallback) / 100`（原語 primitive）
 *
 * 使用時機：
 * 只在「需要 0–1 係數本身」時直接使用，例如 `1 - f`、`1 + f` 之類尚未能套用
 * plusPercent / minusPercent 的中間式。**一般情況請改用** plusPercent / minusPercent /
 * takePercent —— 它們都以本函式為唯一基礎。
 *
 * @param value - 百分比值（可為 undefined）
 * @param fallback - value 未定義時採用的百分比（預設 100，對應 `a ?? 100`）
 * @returns 0–1 係數（undefined 時回 fallback/100）
 */
export function percentFactor(value: number | undefined, fallback?: number): number
{
	return (value ?? fallback ?? PERCENT_BASE) / 100;
}

/**
 * 加 p%：`value × (1 + percentFactor(pct, fallback))`（＝原 `value * (1 + pct / 100)`）
 *
 * 使用意圖：
 * 「把既有值依百分比**放大**」——結果仍是同一個量綱（力道、數值、上限），
 * 只是按 pct% 變大；pct 為 0 時結果不變，為負數時等同縮減。
 *
 * 使用時機 / when to use：
 * - Up* 增益技能與 buff（UpATK / UpMAXHP… 的 `round(orig*(1+n%))`）
 *   Up* buffs (UpATK / UpMAXHP ... `round(orig*(1+n%))`)
 * - 能力／裝備／被動的 M_* 百分比補正（`maxhp * (1 + M_MAXHP%) + P_MAXHP`）
 *   M_* percentage modifiers on stats / gear / passives
 * - 召喚強度 `strength × (100 + Summon) / 100`（＝ plusPercent(strength, Summon)）
 *   summon strength `strength × (100 + Summon) / 100`
 * 不適用 / not for：「按百分比取出一個量」（回復量、自傷…）請用 takePercent。
 *
 * @param value - 基礎值 / the base value
 * @param pct - 加上的百分比（未定義時採 fallback）
 * @param fallback - pct 未定義時的百分比（預設 100）
 * @returns the scaled-up value
 */
export function plusPercent(value: number, pct: number | undefined, fallback?: number): number
{
	return value * (1 + percentFactor(pct, fallback));
}

/**
 * 減 p%：`value × (1 - percentFactor(pct, fallback))`（＝原 `value * (1 - pct / 100)`）
 *
 * 使用意圖：
 * 「把既有值依百分比**縮減**」——與 plusPercent 呈鏡像：結果同量綱、按 pct% 變小，
 * pct = 100 時歸 0，大於 100 會得到負值（原始公式即如此，不做夾制）。
 *
 * 使用時機：
 * - Down* 減益技能與 debuff（Down* 的 `round(orig*(1-n%))`）
 * - 抗性折減：中毒機率 `bePoison × (1 - PoisonResist%)`
 * - 減傷／扣減：目標 def% 減免 `dmg × (1 - def%)`、延遲扣減 `(delay - min) × (1 - rate%)`
 * 注意：def% 欄位缺省為「無減傷」，須傳 fallback = 0（如 minusPercent(dmg, def, 0)）。
 *
 * @param value - 基礎值
 * @param pct - 減去的百分比（未定義時採 fallback）
 * @param fallback - pct 未定義時的百分比（預設 100；def% 類欄位應傳 0）
 * @returns the scaled-down value
 */
export function minusPercent(value: number, pct: number | undefined, fallback?: number): number
{
	return value * (1 - percentFactor(pct, fallback));
}

/**
 * 取 p%：`value × percentFactor(pct, fallback)`（＝原 `value * pct / 100`）
 *
 * 使用意圖：
 * 「用百分比**取出一個量**」——回傳值就是目標數值本身（不是放大或縮減），
 * pct 直接代表佔 value 的比例。
 *
 * 使用時機：
 * - 回復／再生量：`MAXHP × HpRegen%`、`MAXSP × SpRegen%`
 * - 自傷、犧牲：`MAXHP × rate%`
 * - 技能倍率：`base × pow%`、穿透加算 `pierce × pow%`
 * - 延遲：`DelayValue × rate%`
 * - 比率套回上限（EnergyExchange）：`MAXHP × spRate%`
 * - 填補剩餘空間的 n%：`(100 - 現值) × n%`（upDefPct）
 * 不適用：「加／減 p%」請用 plusPercent / minusPercent。
 *
 * @param value - 基礎值（被取百分比的總量）
 * @param pct - 百分比（未定義時採 fallback）
 * @param fallback - pct 未定義時的百分比（預設 100）
 * @returns pct% of value
 */
export function takePercent(value: number, pct: number | undefined, fallback?: number): number
{
	return value * percentFactor(pct, fallback);
}
