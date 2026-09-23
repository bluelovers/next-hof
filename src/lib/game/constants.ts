// 遊戲常數集中定義 / Centralized game tuning constants
// 數值來源：docs/log/battle/05-battle-details.md §1 與 docs/data/README.md
// 所有數值與原始 PHP setting.dist.php 一致，便於後續 YAML 匯入對照。

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

// 戰鬥相關 / Battle
export const NORMAL_BATTLE_TIME = 1;
export const ENEMY_INCREASE = 1;
export const BATTLE_MAX_TURNS = 100;
export const TURN_EXTENDS = 20;
export const BATTLE_MAX_EXTENDS = 100;
export const BATTLE_STAT_TURNS = 10;
export const MAX_BATTLE_LOG = 100;
export const MAX_STATUS_MAXIMUM = MAX_STATUS * 10; // 絕對上限 = 基礎上限的 10 倍 / absolute cap = 10x base cap

// Delay 系統 / Delay system
export const DELAY_TYPE = 1; // 1 = 新版（依 SPD 距離）
export const DELAY = 2.5; // 舊版係數（DELAY_TYPE=0 使用）
export const DELAY_BASE = 5; // 新版基底值

// Union / 排名戰 / Union & Ranking
export const UNION_BATTLE_TIME = 10;
export const UNION_BATTLE_NEXT = 1200;
export const RANK_TEAM_SET_TIME = 172800;
export const RANK_BATTLE_NEXT_LOSE = 86400;
export const RANK_BATTLE_NEXT_WIN = 60;

// 裝備負荷基礎 / Handle base（DELAY 相關運算用）
export const REFINE_LIMIT = 10;
export const SELLING_PRICE = 1 / 5;

// 陣營 / Team indices
export const TEAM_0 = '0';
export const TEAM_1 = '1';

// 魔方陣上限 / Magic circle cap
export const MAGIC_CIRCLE_MAX = 5;

/**
 * 角色狀態列舉 / Character state enumeration
 * 列舉 / enumeration
 */
export enum EnumState {
	/** 存活 / alive */
	Alive = 0,
	/** 死亡 / dead */
	Dead = 1,
	/** 中毒（CurePoison 判定所用狀態）/ poisoned (state checked by CurePoison) */
	Poison = 2,
	/** 二階中毒（目前無任何使用點）/ secondary poison (currently unused anywhere) */
	Poison2 = 3,
	/** 一般狀態（未中毒也未死亡）/ normal (neither poisoned nor dead) */
	Normal = 4,
}

/**
 * 隊伍位置列舉 / Formation position enumeration
 * 列舉 / enumeration
 */
export enum EnumPosition {
	/** 前衛（可守護後衛）/ front row (can guard the back row) */
	Front = 'front',
	/** 後衛（受前衛守護）/ back row (protected by front-row guard) */
	Back = 'back',
}

/**
 * 預期行為列舉 / Expected behavior enumeration
 * 列舉 / enumeration
 */
export enum EnumExpect {
	/** 蓄力預期（EnumExpect.Charge 目前無使用點）/ expected charge action (EnumExpect.Charge is currently unused) */
	Charge = 'charge',
	/** 詠唱預期（Battle.UseSkill 比對，不符則中斷）/ expected cast (compared in Battle.UseSkill; mismatch aborts) */
	Cast = 'cast',
}

