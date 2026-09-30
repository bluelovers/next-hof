/**
 * 遊戲常數集中定義 / Centralized game tuning constants
 * 數值來源：docs/log/battle/05-battle-details.md §1 與 docs/data/README.md
 * 所有數值與原始 PHP setting.dist.php 一致，便於後續 YAML 匯入對照。
 *
 * 列舉定義已移至 #/lib/types/battle-enum.ts；此處轉出以保留既有匯入路徑。
 * The enums moved to #/lib/types/battle-enum.ts; re-exported here to keep legacy imports.
 */

export const MAX_TIME = 1000;
export const START_TIME = 900;
export const TIME_GAIN_DAY = 6000;
export const MAX_CHAR = 5;
export const MAX_LEVEL = 50;
export const MAX_STATUS = 250;
export const GET_STATUS_POINT = 5;
export const GET_SKILL_POINT = 2;
export const START_MONEY = 50000;
export const EXP_RATE = 1;
export const MONEY_RATE = 1;

/**
 * 戰鬥相關 / Battle
 */
export const NORMAL_BATTLE_TIME = 1;
export const ENEMY_INCREASE = 1;
export const BATTLE_MAX_TURNS = 100;
export const TURN_EXTENDS = 20;
export const BATTLE_MAX_EXTENDS = 100;
export const BATTLE_STAT_TURNS = 10;
export const MAX_BATTLE_LOG = 100;
/** 絕對上限 = 基礎上限的 10 倍 / absolute cap = 10x base cap */
export const MAX_STATUS_MAXIMUM = MAX_STATUS * 10;

/** Delay 系統 / Delay system */
export const DELAY_TYPE = 1;
/** 舊版係數（DELAY_TYPE=0 使用） */
export const DELAY = 2.5;
/** 新版基底值 */
export const DELAY_BASE = 5;

/**
 * Union / 排名戰 / Union & Ranking
 */
export const UNION_BATTLE_TIME = 10;
export const UNION_BATTLE_NEXT = 1200;
export const RANK_TEAM_SET_TIME = 172800;
export const RANK_BATTLE_NEXT_LOSE = 86400;
export const RANK_BATTLE_NEXT_WIN = 60;

/**
 * 裝備負荷基礎 / Handle base（DELAY 相關運算用）
 */
export const REFINE_LIMIT = 10;
export const SELLING_PRICE = 1 / 5;

/**
 * 魔方陣上限 / Magic circle cap
 */
export const MAGIC_CIRCLE_MAX = 5;

export { EnumTeamSide, EnumState, EnumPosition, EnumExpect } from '#/lib/types/battle-enum';
