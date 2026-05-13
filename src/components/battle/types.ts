/**
 * BattleDisplay 類型定義
 * BattleDisplay type definitions
 */

/** 隊伍顏色樣式 / Team color style */
export type ITeamSide = 'left' | 'right';

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
  /** 角色 ID / Character ID */
  id: string;
  /** 精靈圖片路徑 / Sprite image path */
  imageUrl: string;
  /** X 軸位置 / X position */
  x: number;
  /** Y 軸位置 / Y position */
  y: number;
  /** 是否翻轉 / Whether flipped horizontally */
  flipped: boolean;
  /** 角色名稱 / Character name */
  name?: string;
}

/** 戰場背景 / Battlefield background */
export interface IBattleFieldConfig {
  /** 背景類型 / Background type */
  backgroundType?: string;
  /** 背景圖片 URL / Background image URL */
  backgroundImageUrl?: string;
  /** 寬度 / Width */
  width?: number;
  /** 高度 / Height */
  height?: number;
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
