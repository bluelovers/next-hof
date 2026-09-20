/**
 * 戰鬥顯示工具函式（單一事實來源）
 * Battle display utilities (single source of truth)
 *
 * 集中維護百分比計算、條狀顏色與狀態/屬性→CSS class 的對應邏輯，
 * 供 BattleUnit 與 BattleAction 共用，避免各自實作導致行為漂移。
 * Centralizes percentage math, bar colors, and status/attribute → CSS class mappings
 * so BattleUnit and BattleAction share one implementation instead of diverging.
 */
import type { IUnitStatus, IAttributeType } from './types';

/** 條狀顏色高閾值（> 此值為高血量色） / Bar high threshold */
const BAR_HIGH_THRESHOLD = 60;
/** 條狀顏色中閾值（> 此值為中血量色，否則為低血量色） / Bar mid threshold */
const BAR_MID_THRESHOLD = 30;
/** 中/低血量共用色 / Shared mid/low bar color */
const BAR_WARN_COLOR = '#ffcc33';
/** 低血量色 / Low bar color */
const BAR_LOW_COLOR = '#cc3300';

/**
 * 計算百分比並限制在 0–100
 * Calculate a percentage clamped to 0–100
 *
 * @param value - 當前值 / Current value
 * @param max - 最大值 / Maximum value
 * @returns 0–100 的百分比 / Percentage in 0–100
 */
export function clampPercent(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

/**
 * 依百分比取得條狀顏色
 * Get bar color from percentage
 *
 * @param pct - 百分比（0–100） / Percentage (0–100)
 * @param highColor - 高血量時的顏色 / Color when above the high threshold
 * @returns CSS 顏色字串 / CSS color string
 */
export function getBarColor(pct: number, highColor: string): string {
  if (pct > BAR_HIGH_THRESHOLD) return highColor;
  if (pct > BAR_MID_THRESHOLD) return BAR_WARN_COLOR;
  return BAR_LOW_COLOR;
}

/** HP 條顏色（高血量為藍） / HP bar color (blue when high) */
export function getHpBarColor(pct: number): string {
  return getBarColor(pct, '#3366ff');
}

/** SP 條顏色（高血量為綠） / SP bar color (green when high) */
export function getSpBarColor(pct: number): string {
  return getBarColor(pct, '#66cc66');
}

/**
 * 依單位狀態取得 CSS 類別
 * Get CSS class from unit status
 */
export function getStatusClass(status?: IUnitStatus): string {
  switch (status) {
    case 'down':
      return 'dmg';
    case 'casting':
      return 'charge';
    default:
      return '';
  }
}

/**
 * 依屬性類型取得 CSS 類別
 * Get CSS class from attribute type
 */
export function getAttrClass(attr?: IAttributeType): string {
  switch (attr) {
    case 'dmg':
      return 'dmg';
    case 'recover':
      return 'recover';
    case 'support':
      return 'support';
    case 'charge':
      return 'charge';
    default:
      return '';
  }
}
