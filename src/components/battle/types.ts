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
	EnumMagicCircleKind,
} from './enums';
import { EnumPosition } from '#/lib/game/constants';
import type { ICorpsePolicyField } from '#/lib/game/battle/corpse-policy';
import type { IBattleUnitVitals, IUnitList } from '#/lib/game/types';
import type { ICharacterSpriteProps } from '#/components/characters/CharacterSprite';

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

/**
 * 顯示側單位共用欄位（共用組 3：隊伍側＋顯示狀態）
 * Display-side unit shared fields (group 3: team side + display status)
 *
 * 由展示層 IBattleUnit 與 IBattleSnapshotDisplayUnit 共同繼承，欄位只宣告一次。
 * 引擎層使用 team（EnumTeamSide）與 dead，名稱與列舉皆不同，故不納入本組、
 * 也就不需要任何轉換。
 * Inherited by the display's IBattleUnit and IBattleSnapshotDisplayUnit so each field is
 * declared once. The engine layer uses team (EnumTeamSide) and dead instead — different
 * name and enum — so they stay out of this group and no conversion is required.
 */
export interface IBattleDisplayUnitFields {
	/** 隊伍側（UI 顯示層 left/right）/ team side (UI display layer: left/right) */
	side: EnumTeamSideUI;
	/** 顯示狀態（down＝倒下、casting＝詠唱；缺省＝存活）/ display status (down/casting; absent = alive) */
	status?: EnumUnitStatus;
}

/** 戰鬥單位 / Battle unit */
export interface IBattleUnit extends IBattleUnitVitals, IBattleDisplayUnitFields {
	/** 等級 / Level */
	level: number;
	/** 速度（決定行動順序）/ speed (action order) */
	spd?: number;
	/** 站位：前衛 / 後衛 / position: front / back */
	position?: EnumPosition;
	/**
	 * 單位角色精靈（選填；提供時顯示於該單位名稱與 HP/SP 條的左側）
	 * Unit character sprite (optional; rendered to the left of that unit's name and HP/SP bars when provided)
	 */
	sprite?: ICharacterSpriteProps;
}

/** 隊伍資訊 / Team info */
export interface IBattleTeam extends IUnitList<IBattleUnit> {
	/** 隊伍名稱 / Team name */
	name: string;
	/** 隊伍圖示 / Team icon */
	icon?: string;
	/** 隊伍側 / Team side */
	side: EnumTeamSideUI;
}

/** 戰場精靈 / Battlefield sprite */
export interface IBattleSprite {
	/**
	 * 戰鬥單位實例唯一識別碼（Character.unitUuid；同時作為 DOM id 用於定位/選取）
	 * Battle-unit instance uid (Character.unitUuid; also used as the DOM id for
	 * targeting/selection).
	 *
	 * 與快照單位的 `unitUuid` 相同，兩者以此精確對應到「同一個單位個體」。
	 * Matches a snapshot unit's `unitUuid`, so sprites and snapshot units map to the exact
	 * same unit individual (never by species `no`).
	 */
	unitUuid?: string;
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

/**
 * 被召喚單位（召喚日誌條目用）
 * Summoned unit (for a summon log entry)
 *
 * 對應原始戰鬥日誌的「圖像 名稱 joined to the team. 名稱 Lv.N enter the Battlefield.」，
 * level 缺省時省略「Lv.N」、imageUrl 缺省時省略圖像。
 * Mirrors the original battle log's "image name joined to the team. name Lv.N enter the
 * Battlefield."; when `level` is absent the "Lv.N" is dropped, and when `imageUrl` is
 * absent the image is dropped.
 */
export interface ISummonedUnit {
	/** 單位名稱 / unit name */
	name: string;
	/** 單位等級（缺省時不顯示 Lv.N）/ unit level (no "Lv.N" when absent) */
	level?: number;
	/** 單位精靈圖 URL（原始日誌在名稱前顯示單位圖）/ unit sprite image URL (the original log shows it before the name) */
	imageUrl?: string;
}

/**
 * 魔方陣紀錄（type＝MagicCircle 時的結構化欄位）
 * Magic-circle record (the structured field used when type = MagicCircle)
 *
 * 種類決定文案與配色（draw／erased enemy／use／failed），數量決定「 xN」尾碼；
 * 種類為 Fail 時不顯示施放者名稱與數量。
 * The kind decides the copy and the colour (draw / erased enemy / use / failed) and the
 * amount decides the " xN" suffix; for the Fail kind neither the caster name nor the
 * amount is shown.
 */
export interface IMagicCircleRecord {
	/** 紀錄種類 / Record kind */
	kind: EnumMagicCircleKind;
	/** 魔方陣數量（Fail 不顯示）/ Magic-circle amount (not shown for Fail) */
	amount?: number;
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
	/** 被召喚單位清單（type＝Summon 時使用）/ Summoned units (used when type = Summon) */
	summoned?: ISummonedUnit[];
	/** 魔方陣紀錄（type＝MagicCircle 時使用）/ Magic-circle record (used when type = MagicCircle) */
	magicCircle?: IMagicCircleRecord;
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

/**
 * 顯示時間字串（展示頁戰鬥時間的語意化字串型別）
 * Display time string (semantic string alias for the showcase battle time field).
 *
 * 語意：僅供展示層呈現的時間文字，引擎與轉接層不解析其內容，故不加格式約束。
 * Semantics: display-only time text; neither the engine nor the adapter parses it,
 * so no format constraint is imposed.
 */
export type IDisplayTimeString = string;

/**
 * 展示中繼資料共用形狀（標題＋顯示時間）
 * Shared display metadata (title + display time)
 *
 * 供 IBattleDisplayData 與 IShowcaseBattleInput 以 extends 共用，
 * 同名同型欄位只定義一次，避免各自定義漂移。
 * Shared by IBattleDisplayData and IShowcaseBattleInput via extends so the same-named,
 * same-typed fields are defined once instead of drifting apart.
 */
export interface IBattleDisplayMeta {
	/** 戰鬥標題 / Battle title */
	title?: string;
	/** 戰鬥時間 / Battle time */
	time?: IDisplayTimeString;
}

/** BattleDisplay 完整資料 / Complete battle display data */
export interface IBattleDisplayData extends IBattleDisplayMeta {
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

/* ==================== 顯示開關共用 props / Shared display-toggle props ==================== */

/**
 * HP／SP 條顯示開關（共用組 A：BattleDisplay 與其子組件只繼承、不重複宣告）
 * HP/SP bar toggles (group A: BattleDisplay and its children extend this instead of
 * redeclaring the fields)
 */
export interface IBattleBarToggleOptions {
	/** 是否顯示 HP 條 / Whether to show HP bars */
	showHpBars?: boolean;
	/** 是否顯示 SP 條 / Whether to show SP bars */
	showSpBars?: boolean;
}

/**
 * 戰場名稱標籤顯示開關（共用組 B：BattleDisplay 與 BattleField* 圖層鏈共用）
 * Sprite name-label toggle (group B: shared by BattleDisplay and the BattleField* layer chain)
 */
export interface IBattleSpriteLabelOptions {
	/** 是否顯示名稱標籤 / Whether to show name labels on sprites */
	showSpriteLabels?: boolean;
}

/**
 * 精靈顯示開關（共用組 C：隊伍精靈＋單位精靈）
 * Sprite display toggles (group C: team sprite + unit sprites)
 *
 * 兩者只控制「是否渲染」，資料各自來自 BattleSegmentStatus 的
 * leftSprite／rightSprite 與 IBattleUnit.sprite；資料缺省時即使開啟也不輸出。
 * Both only gate rendering: the data comes from BattleSegmentStatus's leftSprite /
 * rightSprite and IBattleUnit.sprite respectively, and nothing is rendered when the
 * data is absent even if the toggle is on.
 */
export interface IBattleSpriteToggleOptions {
	/** 是否顯示隊伍（側）精靈 / Whether to show the team (side) sprite */
	showTeamSprite?: boolean;
	/** 是否顯示單位精靈 / Whether to show unit sprites */
	showUnitSprites?: boolean;
}

/**
 * 戰鬥畫面顯示開關總集（＝共用組 A ＋ B ＋ C）
 * Combined battle display toggles (group A + group B + group C)
 */
export interface IBattleDisplayOptions
	extends IBattleBarToggleOptions, IBattleSpriteLabelOptions, IBattleSpriteToggleOptions {}

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
export interface IBattleSnapshotDisplayUnit
	extends ICorpsePolicyField, IBattleUnitVitals, IBattleDisplayUnitFields {
	/**
	 * 外觀覆寫（型態變化等；未提供時沿用精靈自身圖檔）
	 * Appearance override (e.g. form change; when absent the sprite's own image is used)
	 */
	imageUrl?: string;
	/**
	 * 單位等級（上游快照未提供時缺省；顯示層缺省時以 0 呈現）
	 * Unit level (absent when the upstream snapshot omits it; the display layer renders 0 when absent)
	 */
	level?: number;
	/** 是否倒下 / whether down */
	dead: boolean;
	/** 蓄力/詠唱種類（無則 undefined）/ charge/cast kind */
	chargeKind?: EnumChargeKind;
}

/** 戰鬥快照（顯示側）/ Battle snapshot (display side) */
export interface IBattleSnapshotDisplay extends IUnitList<IBattleSnapshotDisplayUnit> {
	/** 對應 actions 的索引位置 / index into actions */
	at: number;
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
