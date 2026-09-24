/**
 * 戰鬥顯示工具函式（單一事實來源）
 * Battle display utilities (single source of truth)
 *
 * 集中維護百分比計算、條狀顏色與狀與狀態/屬性→CSS class 的對應邏輯，
 * 供 BattleUnit 與 BattleAction 共用，避免各自實作導致行為漂移。
 * Centralizes percentage math, bar colors, and status/attribute → CSS class mappings
 * so BattleUnit and BattleAction share one implementation instead of diverging.
 */
import { EnumUnitStatus, EnumAttributeType, EnumTeamSideUI, EnumTeamSideClass, EnumActionType } from './enums';
import { TEAM_SIDE_CLASS } from './types';

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
export function getStatusClass(status?: EnumUnitStatus): string {
  switch (status) {
    case EnumUnitStatus.Down:
      return 'dmg';
    case EnumUnitStatus.Casting:
      return 'charge';
    default:
      return '';
  }
}

/**
 * 依屬性類型取得 CSS 類別
 * Get CSS class from attribute type
 */
export function getAttrClass(attr?: EnumAttributeType): string {
  switch (attr) {
    case EnumAttributeType.Dmg:
      return 'dmg';
    case EnumAttributeType.Recover:
      return 'recover';
    case EnumAttributeType.Support:
      return 'support';
    case EnumAttributeType.Charge:
      return 'charge';
    default:
      return '';
  }
}

/**
 * 依隊伍側取得 CSS 欄位 class（left → ttd2, right → ttd1）
 * Get the CSS column class for a team side (left → ttd2, right → ttd1)
 *
 * @param side - 隊伍側 / Team side
 * @returns CSS class 字串 / CSS class string
 */
export function getSideClass(side: EnumTeamSideUI): EnumTeamSideClass {
  return TEAM_SIDE_CLASS[side];
}

/**
 * 依單位狀態取得 HP/SP 文字 CSS 類別
 * Get the CSS class for HP/SP text from unit status
 *
 * 倒下時統一為 'dmg'；否則依欄位採用 fallback（HP 用 'recover'、SP 用 'support'）。
 * Down → 'dmg'; otherwise the field-specific fallback (HP: 'recover', SP: 'support').
 *
 * @param status - 單位狀態 / Unit status
 * @param fallback - 非倒下時的類別 / Class when not down
 * @returns CSS class 字串 / CSS class string
 */
export function getStateTextClass(
  status?: EnumUnitStatus,
  fallback: EnumAttributeType = EnumAttributeType.Recover
): string {
  return status === EnumUnitStatus.Down ? 'dmg' : fallback;
}

/**
 * 依戰鬥行動類型取得數值變化 CSS 類別
 * Get the CSS class for a value-change from an action type
 *
 * 傷害/倒下 → 'dmg'，治療 → 'recover'，其餘 → ''。
 * Damage/down → 'dmg', heal → 'recover', others → ''.
 *
 * @param type - 行動類型 / Action type
 * @returns CSS class 字串 / CSS class string
 */
export function getValueChangeClass(type?: EnumActionType): string {
  if (type === EnumActionType.Damage || type === EnumActionType.Down) return 'dmg';
  if (type === EnumActionType.Heal) return 'recover';
  return '';
}

/**
 * 入場訊息的後綴文字（單一事實來源）
 * Trailing text for the "enter the Battlefield" message (single source of truth)
 *
 * @param level - 單位等級（提供時顯示 "Lv.x"） / Unit level (shows "Lv.x" when given)
 * @returns 訊息後綴 / Message suffix
 */
export function getEnterBattlefieldText(level?: number): string {
  return level != null ? `Lv.${level} enter the Battlefield.` : 'enter the Battlefield.';
}

/**
 * 計算隊伍總等級（單一事實來源）
 * Calculate total team level (single source of truth)
 *
 * 從 BattleTeamInfo.tsx 提取，供多處共用。
 * Extracted from BattleTeamInfo.tsx for shared use.
 *
 * @param units - 單位列表 / Unit list
 * @returns 總等級 / Total level
 */
export function calcTotalLevel(units: { level: number }[]): number {
  return units.reduce((sum, u) => sum + u.level, 0);
}

/**
 * 計算隊伍總 HP（單一事實來源）
 * Calculate total team HP (single source of truth)
 *
 * 從 BattleTeamInfo.tsx 提取，供多處共用。
 * Extracted from BattleTeamInfo.tsx for shared use.
 *
 * @param units - 單位列表 / Unit list
 * @returns 當前 HP 總和與最大 HP 總和 / Current and max HP totals
 */
export function calcTotalHp(units: { hp: number; maxHp: number }[]): { current: number; max: number } {
  return units.reduce(
    (acc, u) => ({
      current: acc.current + u.hp,
      max: acc.max + u.maxHp,
    }),
    { current: 0, max: 0 }
  );
}
