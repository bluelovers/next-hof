// Battle UI enums — UI/rendering-layer enums only.
// 領域列舉（position / target / scope / priority / move dir）自 #/lib/game 單一來源 re-export，
// 以避免重覆定義並確保可追蹤性（traceability）。其餘為 battle scene 渲染層專用
// （sprite / layout / CSS class / 顯示分類），無對應 domain 概念，保留於此。
//
// Battle UI enums — UI/rendering-layer enums only. Domain enums are re-exported
// from #/lib/game (single source of truth) for traceability; the rest are scene
// rendering concerns (sprite/layout/CSS class/display categories) with no domain
// equivalent and therefore legitimately live in the UI layer.

/** 隊伍側別（UI 顯示層：left/right）/ Team side (UI display layer) */
export enum EnumTeamSideUI {
	Left = 'left',
	Right = 'right',
}

/** 隊伍側 → CSS class（單一事實來源）/ Team side → CSS class */
export enum EnumTeamSideClass {
	Ttd1 = 'ttd1',
	Ttd2 = 'ttd2',
}

/**
 * 單位顯示狀態（對應 lib EnumState）
 * Display unit status (maps to lib EnumState: Alive/Dead/Poison/...).
 */
export enum EnumUnitStatus {
	Alive = 'alive',
	Down = 'down',
	Casting = 'casting',
}

/** 屬性數值顯示分類（UI 專用，無 domain 對應）/ Attribute display category (UI-only) */
export enum EnumAttributeType {
	Dmg = 'dmg',
	Recover = 'recover',
	Support = 'support',
	Charge = 'charge',
	Normal = 'normal',
}

/** 標籤演算法位置（UI-only）/ Label placement (UI-only) */
export enum EnumSpriteLabelPlacement {
	Above = 'above',
	Below = 'below',
}

/** 戰場精靈框垂直對齊方式（UI-only）/ Sprite frame vertical alignment (UI-only) */
export enum EnumBattleFieldVAlign {
	Top = 'top',
	Middle = 'middle',
	Bottom = 'bottom',
}

/** 背景圖縮放模式（UI-only）/ Background image scale mode (UI-only) */
export enum EnumBattleFieldBgScale {
	Natural = 'natural',
	Cover = 'cover',
	Contain = 'contain',
	Stretch = 'stretch',
	Repeat = 'repeat',
}

/**
 * 戰鬥動作顯示分類（對應 lib EnumBattleEventType 顯示子集）
 * Action display category (maps to lib EnumBattleEventType).
 */
export enum EnumActionType {
	Skill = 'skill',
	Attack = 'attack',
	Damage = 'damage',
	Heal = 'heal',
	Protect = 'protect',
	Enter = 'enter',
	Casting = 'casting',
	Down = 'down',
	Result = 'result',
}

/**
 * 蓄力種類（對應 lib EnumExpect Charge/Cast）
 * Charge kind (maps to lib EnumExpect: Charge/Cast).
 */
export enum EnumChargeKind {
	Charging = 'charging',
	Casting = 'casting',
}

/**
 * 技能類型（UI 顯示層；lib 以 ISkillDef.type 0|1 表示）
 * Skill type (UI layer; lib represents it as ISkillDef.type 0|1, not an enum).
 */
export enum EnumSkillType {
	Physical = 'physical',
	Magic = 'magic',
}

/** 精靈圖資料夾（UI-only）/ Sprite image directory (UI-only) */
export enum EnumSpriteImageDir {
	Char = 'char',
	CharRev = 'char_rev',
	Other = 'other',
}

/**
 * 技能狀態類型（顯示用；領域單一來源為 lib STATUS_ATTR_KEYS / IStatusAttr）
 * Stat name (display; SSoT = lib STATUS_ATTR_KEYS / IStatusAttr).
 */
export enum EnumStatName {
	Maxhp = 'MAXHP',
	Maxsp = 'MAXSP',
	Str = 'STR',
	Int = 'INT',
	Dex = 'DEX',
	Spd = 'SPD',
	Luk = 'LUK',
	Atk = 'ATK',
	Matk = 'MATK',
	Def = 'DEF',
	Mdef = 'MDEF',
}

/**
 * 能力值名稱（顯示用；領域單一來源為 lib PRIMARY_STATS / IPrimaryStat）
 * Ability stat names (display; SSoT = lib PRIMARY_STATS / IPrimaryStat).
 */
export enum EnumAbilityStatName {
	Str = 'STR',
	Int = 'INT',
	Dex = 'DEX',
	Spd = 'SPD',
	Luk = 'LUK',
}

/** 精靈顯示模式（UI-only）/ Sprite display variant (UI-only) */
export enum EnumSpriteVariant {
	Boxed = 'boxed',
	Raw = 'raw',
	Original = 'original',
	Avatar = 'avatar',
}

/** 精靈尺寸（UI-only）/ Sprite size (UI-only) */
export enum EnumSpriteSize {
	Small = 'small',
	Normal = 'normal',
	Large = 'large',
}

/** 展示頁流程階段（UI-only）/ Showcase flow phase (UI-only) */
export enum EnumShowcasePhase {
	Setup = 'setup',
	Result = 'result',
}

// ==================== 領域列舉：自 lib/game 單一來源 re-export ====================
// Domain enums: re-exported from lib/game (single source of truth) for traceability.
// 元件仍可由 './enums' 匯入這些名稱，但定義已集中於 lib/game，避免重覆定義。
// Components may still import these names from './enums', but the definitions now
// live solely in lib/game, eliminating duplicate definitions.

/** 站位 / Position — SSoT: #/lib/game/constants EnumPosition */
export { EnumPosition } from '#/lib/game/constants';

/** 技能優先條件 / Skill priority — SSoT: #/lib/game/types EnumSkillPriority */
export { EnumSkillPriority } from '#/lib/game/types';

/** 技能目標類型 / Skill target type — SSoT: #/lib/game/types EnumTargetType */
export { EnumTargetType as EnumSkillTarget } from '#/lib/game/types';

/** 技能範圍 / Skill scope — SSoT: #/lib/game/types EnumTargetMethod */
export { EnumTargetMethod as EnumSkillScope } from '#/lib/game/types';

/** 移動方向 / Move direction — SSoT: #/lib/game/constants EnumPosition */
export { EnumPosition as EnumSkillMoveDir } from '#/lib/game/constants';
