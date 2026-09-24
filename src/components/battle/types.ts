/**
 * BattleDisplay 類型定義
 * BattleDisplay type definitions
 */
import type { CSSProperties } from 'react';
import type { ITSRequireAtLeastOne } from 'ts-type';
import type { EnumSpriteLabelPlacement } from './enums';
import type { ISpriteImageSize } from './spriteImageSizes';
import {
	EnumTeamSideUI,
	EnumTeamSideClass,
	EnumUnitStatus,
	EnumAttributeType,
	EnumBattleFieldVAlign,
	EnumBattleFieldBgScale,
	EnumActionType,
	EnumChargeKind,
} from './enums';
import { EnumPosition } from '#/lib/game/constants';
import type { ICorpsePolicy } from '#/lib/game/battle/corpse-policy';

/** 隊伍側別（UI 層）/ Team side (UI layer) */
export type ITeamSide = EnumTeamSideUI;

/** 隊伍側 → CSS class 對應表（單一事實來源）/ Team side → CSS class map */
export const TEAM_SIDE_CLASS: Record<EnumTeamSideUI, EnumTeamSideClass> = {
	[EnumTeamSideUI.Left]: EnumTeamSideClass.Ttd2,
	[EnumTeamSideUI.Right]: EnumTeamSideClass.Ttd1,
};

/** 以隊伍側為 key 的成對結構（通用單一事實來源）/ Generic left/right pair */
export interface IBattleSidePair<T> {
	/** 左隊 / Left team */
	left: T;
	/** 右隊 / Right team */
	right: T;
}

/** 單位狀態 / Unit status */
export type IUnitStatus = EnumUnitStatus;

/** 屬性數值類型 / Attribute value type */
export type IAttributeType = EnumAttributeType;

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
	status?: EnumUnitStatus;
	/**
	 * 戰鬥單位實例唯一識別碼（Character.unitUid；用於關聯戰場精靈）
	 * Battle-unit instance uid (Character.unitUid; links to the battlefield sprite)
	 */
	unitUid?: string;
	/** 隊伍側 / Team side */
	side: EnumTeamSideUI;
	/** 速度（決定行動順序）/ speed (action order) */
	spd?: number;
	/** 站位：前衛 / 後衛 / position: front / back */
	position?: EnumPosition;
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
	side: EnumTeamSideUI;
}

/** 戰場精靈 / Battlefield sprite */
export interface IBattleSprite {
	/**
	 * 戰鬥單位實例唯一識別碼（Character.unitUid；同時作為 DOM id 用於定位/選取）
	 * Battle-unit instance uid (Character.unitUid; also used as the DOM id for
	 * targeting/selection).
	 *
	 * 與快照單位的 `unitUid` 相同，兩者以此精確對應到「同一個單位個體」。
	 * Matches a snapshot unit's `unitUid`, so sprites and snapshot units map to the exact
	 * same unit individual (never by species `no`).
	 */
	unitUid?: string;
	/** 精靈圖片路徑 / Sprite image path */
	imageUrl: string;
	/** X 軸位置 / X position */
	x: number;
	/** Y 軸位置 / Y position */
	y: number;
	/** 是否翻轉 / Whether flipped horizontally */
	flipped?: boolean;
	/** 角色圖像尺寸（中心對齊用；由上游 computeBattleSpritePositions 提供，組件內不讀取圖檔） / Image size */
	imageSize?: ISpriteImageSize;
	/** 角色名稱 / Character name */
	name?: string;
	/**
	 * 附加到精靈圖層的 CSS class（與元件本身的基礎 class 併存，兩者不會互相取代）
	 * Extra CSS class on the sprite layer (kept alongside the component's base class;
	 * neither replaces the other)
	 */
	className?: string;
	/** 精靈圖層自訂樣式（可複寫或追加） / Custom sprite layer style */
	style?: CSSProperties;
	/** 名稱標籤自訂樣式（可複寫或追加） / Custom name label style */
	labelStyle?: CSSProperties;
	/** 名稱標籤演算法（角色上方 / 下方；預設 below） / Name-label placement */
	placement?: EnumSpriteLabelPlacement;
}

/** 戰場背景尺寸 / Battlefield background size */
export type IBattleFieldBgSize = ITSRequireAtLeastOne<Partial<ISpriteImageSize>>;

/** 戰場精靈框垂直對齊方式 / Sprite frame vertical alignment */
export type IBattleFieldVAlign = EnumBattleFieldVAlign;

/** 背景圖縮放模式 / Background image scale mode */
export type IBattleFieldBgScale = EnumBattleFieldBgScale;

/** 魔方陣（魔法陣）圖層 / Magic circle layer */
export interface IBattleMagicCircle {
	/** 魔方陣圖片路徑 / Magic-circle image path */
	imageUrl: string;
	/** X 軸位置（預設 280，對應 PHP 魔方陣定位） / X position (default 280) */
	x?: number;
	/** Y 軸位置（預設 0） / Y position (default 0) */
	y?: number;
}

/** 戰場精靈框預設寬度（與 BattleFieldSpriteLabel 對齊）/ Default sprite-frame width */
export const SPRITE_LAYOUT_WIDTH = 480;

/** 戰場精靈框預設高度 / Default sprite-frame height */
export const SPRITE_LAYOUT_HEIGHT = 200;

/** 魔方陣預設 X 位置（對應 PHP 魔方陣定位）/ Default magic-circle X position */
export const MAGIC_CIRCLE_DEFAULT_X = 280;

/** 魔方陣預設 Y 位置 / Default magic-circle Y position */
export const MAGIC_CIRCLE_DEFAULT_Y = 0;

/** 戰場背景 / Battlefield background */
export interface IBattleFieldConfig {
	/** 背景類型 / Background type */
	backgroundType?: string;
	/** 背景圖片 URL / Background image URL */
	backgroundImageUrl?: string;
	/** 寬度（角色排版尺寸）/ Width (sprite layout size) */
	width?: number;
	/** 高度（角色排版尺寸）/ Height (sprite layout size) */
	height?: number;
	/** 背景尺寸（獨立於角色排版，選填寬或高其一或全部）/ Background size */
	bgSize?: IBattleFieldBgSize;
	/** 背景圖縮放模式（預設 natural）/ Background image scale mode (default natural) */
	bgScale?: EnumBattleFieldBgScale;
	/** 魔方陣圖層（選填，繪製於角色精靈之下）/ Magic-circle layers */
	magicCircles?: IBattleMagicCircle[];
}

/** 戰鬥動作類型 / Battle action type */
export type IActionType = EnumActionType;

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
	type: EnumActionType;
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
	side?: EnumTeamSideUI;
	/** 訊息類型 / Message attribute type */
	attribute?: EnumAttributeType;
	/** 蓄力種類（casting 事件用）/ charge kind */
	castType?: EnumChargeKind;
	/** 傷害前 HP（Damage/Heal 時）/ HP before */
	hpBefore?: number;
	/** 傷害後 HP（Damage/Heal 時）/ HP after */
	hpAfter?: number;
}

/** 戰鬥結果 / Battle result */
export interface IBattleResult {
	/** 勝利隊伍名稱 / Winner team name */
	winner: string;
	/** 勝利側別（用於配色）/ winning side (for colouring) */
	winnerSide?: EnumTeamSideUI;
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
	/** 隊伍最大 HP 總和（用於 HP remain 比率計算）/ total max HP */
	totalMaxHp?: number;
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
	/** 快照列表（每 10 actions 一張戰場圖＋HP/SP）/ snapshots */
	snapshots?: IBattleSnapshotDisplay[];
}

/**
 * 快照單位（顯示側）
 * Snapshot unit (display side).
 *
 * 注意：此為「展示側」DTO，與引擎領域型別 #/lib/game/types 的 IBattleSnapshotUnit
 * 形狀不同（此處使用 EnumTeamSideUI / EnumUnitStatus 等 UI 列舉）。命名加 Display
 * 後綴以避免與領域型別撞名，確保單一事實來源與可追蹤性。
 * NOTE: this is a display-side DTO whose shape differs from the engine domain type
 * IBattleSnapshotUnit in #/lib/game/types (it uses UI enums like EnumTeamSideUI /
 * EnumUnitStatus). The Display suffix avoids colliding with the domain type.
 */
export interface IBattleSnapshotDisplayUnit {
	/**
	 * 戰鬥單位實例唯一識別碼（對應精靈的 `unitUid`，即 Character.unitUid）
	 * Battle-unit instance uid (matches a sprite's `unitUid`, i.e. Character.unitUid)
	 */
	unitUid?: string;
	/** 單位名稱 / name */
	name: string;
	/** 顯示側別 / display side */
	side: EnumTeamSideUI;
	/**
	 * 外觀覆寫（型態變化等；未提供時沿用精靈自身圖檔）
	 * Appearance override (e.g. form change; when absent the sprite's own image is used)
	 */
	imageUrl?: string;
	/**
	 * 已解析的屍體政策（`true`／物件＝留下屍體；falsy＝死亡即消失）。
	 * 物件形式還可指定屍體圖路徑、CSS class 與 inline style（見 ICorpseSpec）。
	 * 由引擎逐級繼承（角色 > 隊伍 > 戰鬥級）後帶出，顯示層一律以 `!corpse` 判定。
	 * Resolved corpse policy (`true`/object = leave a corpse; falsy = vanish on death). The object
	 * form additionally chooses the corpse image path, CSS class and inline style (see ICorpseSpec).
	 * Produced by the engine after character > team > battle inheritance; the display layer always
	 * checks `!corpse`.
	 */
	corpse?: ICorpsePolicy;
	hp: number;
	maxHp: number;
	sp: number;
	maxSp: number;
	/** 是否倒下 / whether down */
	dead: boolean;
	/** 狀態（倒下為 down）/ status */
	status?: EnumUnitStatus;
	/** 蓄力/詠唱種類（無則 undefined）/ charge/cast kind */
	chargeKind?: EnumChargeKind;
}

/** 戰鬥快照（顯示側）/ Battle snapshot (display side) */
export interface IBattleSnapshotDisplay {
	/** 對應 actions 的索引位置 / index into actions */
	at: number;
	units: IBattleSnapshotDisplayUnit[];
}

/**
 * 戰鬥日誌分段（快照驅動）
 * Battle log segment (snapshot-driven)
 *
 * 每個分段對應一個快照起始狀態與其後發生的行動；
 * 無快照資料時退化為單一分段（snapshot 為 undefined）。
 * Each segment pairs a snapshot's starting state with the actions that follow it;
 * without snapshot data it degrades to a single segment (snapshot undefined).
 */
export interface IBattleSegment {
	/** 分段索引（由 0 起）/ segment index (0-based) */
	index: number;
	/** 分段起始快照（無則 undefined）/ snapshot at segment start (undefined when absent) */
	snapshot?: IBattleSnapshotDisplay;
	/** 此分段的行動 / actions in this segment */
	actions: IBattleAction[];
}
