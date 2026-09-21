/**
 * BattleDisplay 類型定義
 * BattleDisplay type definitions
 */
import type { CSSProperties } from 'react';
import type { ITSRequireAtLeastOne } from 'ts-type';
import type { ISpriteLabelPlacement } from './labelPosition';

/** 隊伍顏色樣式 / Team color style */
export type ITeamSide = 'left' | 'right';

/**
 * 隊伍側對應的 CSS 欄位 class（單一事實來源）
 * CSS column class per team side (single source of truth)
 *
 * 對應關係為 left → ttd2、right → ttd1（與原始頁面欄位配置一致），
 * 由 TEAM_SIDE_CLASS 統一管理，避免各元件各自硬編碼 'ttd1' / 'ttd2'。
 * Mapping: left → ttd2, right → ttd1 (matches the original page's column layout),
 * centralized in TEAM_SIDE_CLASS so components stop hard-coding 'ttd1' / 'ttd2'.
 */
export type ITeamSideClass = 'ttd1' | 'ttd2';

/** 隊伍側 → CSS class 對應表（單一事實來源） / Team side → CSS class map */
export const TEAM_SIDE_CLASS: Record<ITeamSide, ITeamSideClass> = {
  left: 'ttd2',
  right: 'ttd1',
};

/**
 * 以隊伍側（left / right）為 key 的成對結構（通用單一事實來源）
 * Generic left/right pair (single source of truth)
 *
 * 供戰鬥中各「左右成對」資料使用，例如：
 * 精靈定位的 { left: ITeamBattleChars; right: ITeamBattleChars }、
 * 戰鬥日誌的 { left: IBattleAction[]; right: IBattleAction[] } 等。
 * Used by every left/right-paired battle structure, e.g. sprite positioning
 * `{ left: ITeamBattleChars; right: ITeamBattleChars }` and battle-log columns
 * `{ left: IBattleAction[]; right: IBattleAction[] }`.
 */
export interface IBattleSidePair<T> {
  /** 左隊 / Left team */
  left: T;
  /** 右隊 / Right team */
  right: T;
}

/** 單位狀態 / Unit status */
export type IUnitStatus = 'alive' | 'down' | 'casting';

/** 屬性數值類型 / Attribute value type */
export type IAttributeType = 'dmg' | 'recover' | 'support' | 'charge' | 'normal';

/** 戰鬥單位 / Battle unit */
export interface IBattleUnit {
  /** 單位名稱 / Unit name */
  name: string;
  /** 等級 / Level */
  level: number;
  /** 當前 HP / Current HP */
  hp: number;
  /** 最大 HP / Max HP */
  maxHp: number;
  /** 當前 SP / Current SP */
  sp: number;
  /** 最大 SP / Max SP */
  maxSp: number;
  /** 單位狀態 / Unit status */
  status?: IUnitStatus;
  /** 角色 Sprite ID (用於顯示圖示) / Character sprite ID */
  spriteId?: string;
  /** 隊伍側 / Team side */
  side: ITeamSide;
}

/** 隊伍資訊 / Team info */
export interface IBattleTeam {
  /** 隊伍名稱 / Team name */
  name: string;
  /** 單位列表 / Unit list */
  units: IBattleUnit[];
  /** 隊伍圖示 / Team icon */
  icon?: string;
  /** 隊伍側 / Team side */
  side: ITeamSide;
}

/** 戰場精靈 / Battlefield sprite */
export interface IBattleSprite {
  /** 角色 ID（同時作為 DOM id 用於定位/選取） / Character ID (also used as DOM id for targeting) */
  id?: string;
  /** 精靈圖片路徑 / Sprite image path */
  imageUrl: string;
  /** X 軸位置 / X position */
  x: number;
  /** Y 軸位置 / Y position */
  y: number;
  /** 是否翻轉 / Whether flipped horizontally */
  flipped?: boolean;
  /** 角色圖像寬度（中心對齊用；由上游 computeBattleSpritePositions 提供，組件內不讀取圖檔） / Image width (for centering; supplied upstream, never read from disk in components) */
  imageWidth?: number;
  /** 角色圖像高度（中心對齊用；由上游提供，組件內不讀取圖檔） / Image height (supplied upstream, never read from disk in components) */
  imageHeight?: number;
  /** 角色名稱 / Character name */
  name?: string;
  /** 精靈圖層自訂樣式（可複寫或追加） / Custom sprite layer style (override or append) */
  style?: CSSProperties;
  /** 名稱標籤自訂樣式（可複寫或追加） / Custom name label style (override or append) */
  labelStyle?: CSSProperties;
  /** 名稱標籤演算法（角色上方 / 下方；預設 below，由 BattleFieldSpriteLabel 使用） / Name-label placement (above / below; default below, used by BattleFieldSpriteLabel) */
  placement?: ISpriteLabelPlacement;
}

/** 戰場背景尺寸 / Battlefield background size */
export type IBattleFieldBgSize = ITSRequireAtLeastOne<{
  /** 寬度 / Width */
  width?: number;
  /** 高度 / Height */
  height?: number;
}>;

/** 戰場精靈框垂直對齊方式 / Sprite frame vertical alignment */
export type IBattleFieldVAlign = 'top' | 'middle' | 'bottom';

/** 背景圖縮放模式 / Background image scale mode */
export type IBattleFieldBgScale = 'natural' | 'cover' | 'contain' | 'stretch' | 'repeat';

/** 魔方陣（魔法陣）圖層 / Magic circle layer */
export interface IBattleMagicCircle {
  /** 魔方陣圖片路徑 / Magic-circle image path */
  imageUrl: string;
  /** X 軸位置（預設 280，對應 PHP 魔方陣定位） / X position (default 280, PHP magic-circle placement) */
  x?: number;
  /** Y 軸位置（預設 0） / Y position (default 0) */
  y?: number;
}

/** 戰場精靈框預設寬度（與 BattleFieldSpriteLabel 對齊） / Default sprite-frame width */
export const SPRITE_LAYOUT_WIDTH = 480;

/** 戰場精靈框預設高度 / Default sprite-frame height */
export const SPRITE_LAYOUT_HEIGHT = 200;

/** 魔方陣預設 X 位置（對應 PHP 魔方陣定位） / Default magic-circle X position */
export const MAGIC_CIRCLE_DEFAULT_X = 280;

/** 魔方陣預設 Y 位置 / Default magic-circle Y position */
export const MAGIC_CIRCLE_DEFAULT_Y = 0;

/** 戰場背景 / Battlefield background */
export interface IBattleFieldConfig {
  /** 背景類型 / Background type */
  backgroundType?: string;
  /** 背景圖片 URL / Background image URL */
  backgroundImageUrl?: string;
  /** 寬度（角色排版尺寸） / Width (sprite layout size) */
  width?: number;
  /** 高度（角色排版尺寸） / Height (sprite layout size) */
  height?: number;
  /** 背景尺寸（獨立於角色排版，選填寬或高其一或全部） / Background size, independent of sprite layout; width/height individually optional */
  bgSize?: IBattleFieldBgSize;
  /** 背景圖縮放模式（預設 natural） / Background image scale mode (default natural) */
  bgScale?: IBattleFieldBgScale;
  /** 魔方陣圖層（選填，繪製於角色精靈之下） / Magic-circle layers (optional, drawn beneath sprites) */
  magicCircles?: IBattleMagicCircle[];
}

/** 戰鬥動作類型 / Battle action type */
export type IActionType = 'skill' | 'attack' | 'damage' | 'heal' | 'protect' | 'enter' | 'casting' | 'down' | 'result';

/** 技能圖示 / Skill icon */
export interface ISkillIcon {
  /** 技能名稱 / Skill name */
  name: string;
  /** 圖示 URL / Icon URL */
  iconUrl?: string;
}

/** 戰鬥動作 / Battle action */
export interface IBattleAction {
  /** 動作類型 / Action type */
  type: IActionType;
  /** 動作來源 / Source unit */
  source?: string;
  /** 目標單位 / Target unit */
  target?: string;
  /** 技能 / Skill used */
  skill?: ISkillIcon;
  /** 數值 / Value */
  value?: number;
  /** 數值變化的前後描述 / Value change description */
  valueChange?: string;
  /** 訊息文字 / Message text */
  message: string;
  /** 隊伍側 (用於顯示在哪一欄) / Team side */
  side?: ITeamSide;
  /** 訊息類型 / Message attribute type */
  attribute?: IAttributeType;
}

/** 戰鬥結果 / Battle result */
export interface IBattleResult {
  /** 勝利隊伍名稱 / Winner team name */
  winner: string;
  /** 是否平手 / Whether draw */
  isDraw?: boolean;
  /** 左側隊伍最終統計 / Left team final stats */
  leftTeam: ITeamFinalStats;
  /** 右側隊伍最終統計 / Right team final stats */
  rightTeam: ITeamFinalStats;
}

/** 隊伍最終統計 / Team final stats */
export interface ITeamFinalStats {
  /** 剩餘 HP / HP remain */
  hpRemain: number;
  /** 存活單位數 / Alive count */
  alive: number;
  /** 總單位數 / Total units */
  totalUnits: number;
  /** 總輸出傷害 / Total damage dealt */
  totalDamage?: number;
  /** 獲得的經驗 / Total exp */
  totalExp?: number;
  /** 獲得的資金 / Funds */
  funds?: string;
}

/** BattleDisplay 完整資料 / Complete battle display data */
export interface IBattleDisplayData {
  /** 戰鬥標題 / Battle title */
  title?: string;
  /** 戰鬥時間 / Battle time */
  time?: string;
  /** 左側隊伍 / Left team */
  leftTeam: IBattleTeam;
  /** 右側隊伍 / Right team */
  rightTeam: IBattleTeam;
  /** 戰場配置 / Battlefield config */
  battlefield: IBattleFieldConfig;
  /** 戰場精靈 / Battlefield sprites */
  sprites: IBattleSprite[];
  /** 戰鬥動作列表 / Battle action list */
  actions: IBattleAction[];
  /** 戰鬥結果 / Battle result */
  result?: IBattleResult;
}
