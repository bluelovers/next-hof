// 戰鬥 UI 列舉集中定義 / Battle UI enums centralized
// 取代所有 string literal union types，徹底消除字串聯合設計。
// Replaces all string literal union types, eliminating string union design entirely.

/** 隊伍側別（UI 層）/ Team side (UI layer) */
export enum EnumTeamSideUI {
	Left = 'left',
	Right = 'right',
}

/** 隊伍側 → CSS class（單一事實來源）/ Team side → CSS class (single source of truth) */
export enum EnumTeamSideClass {
	Ttd1 = 'ttd1',
	Ttd2 = 'ttd2',
}

/** 單位狀態 / Unit status */
export enum EnumUnitStatus {
	Alive = 'alive',
	Down = 'down',
	Casting = 'casting',
}

/** 屬性數值類型 / Attribute value type */
export enum EnumAttributeType {
	Dmg = 'dmg',
	Recover = 'recover',
	Support = 'support',
	Charge = 'charge',
	Normal = 'normal',
}

/** 站位 / Position */
export enum EnumPosition {
	Front = 'front',
	Back = 'back',
}

/** 標籤演算法位置 / Label placement */
export enum EnumSpriteLabelPlacement {
	Above = 'above',
	Below = 'below',
}

/** 戰場精靈框垂直對齊方式 / Sprite frame vertical alignment */
export enum EnumBattleFieldVAlign {
	Top = 'top',
	Middle = 'middle',
	Bottom = 'bottom',
}

/** 背景圖縮放模式 / Background image scale mode */
export enum EnumBattleFieldBgScale {
	Natural = 'natural',
	Cover = 'cover',
	Contain = 'contain',
	Stretch = 'stretch',
	Repeat = 'repeat',
}

/** 戰鬥動作類型 / Battle action type */
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

/** 蓄力種類（casting 事件用）/ Charge kind (for casting events) */
export enum EnumChargeKind {
	Charging = 'charging',
	Casting = 'casting',
}

/** 技能目標類型 / Skill target type */
export enum EnumSkillTarget {
	Enemy = 'enemy',
	Friend = 'friend',
	Self = 'self',
}

/** 技能範圍 / Skill scope */
export enum EnumSkillScope {
	Normal = 'normal',
	Multi = 'multi',
	All = 'all',
}

/** 技能類型 / Skill type (damage formula) */
export enum EnumSkillType {
	Physical = 'physical',
	Magic = 'magic',
}

/** 目標優先選擇 / Target priority */
export enum EnumSkillPriority {
	LowHpRate = 'LowHpRate',
	Dead = 'Dead',
	Summon = 'Summon',
	Charge = 'Charge',
	Back = 'Back',
}

/** 移動方向 / Move direction */
export enum EnumSkillMoveDir {
	Front = 'front',
	Back = 'back',
}

/** 精靈圖資料夾 / Sprite image directory */
export enum EnumSpriteImageDir {
	Char = 'char',
	CharRev = 'char_rev',
	Other = 'other',
}

/** 技能狀態類型（IStatName 中的狀態屬性）/ Stat name types (status attributes in IStatName) */
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

/** 能力值名稱（不含 HP/SP）/ Ability stat names (excluding HP/SP) */
export enum EnumAbilityStatName {
	Str = 'STR',
	Int = 'INT',
	Dex = 'DEX',
	Spd = 'SPD',
	Luk = 'LUK',
}

/** 精靈顯示模式 / Sprite display variant */
export enum EnumSpriteVariant {
	Boxed = 'boxed',
	Raw = 'raw',
	Original = 'original',
	Avatar = 'avatar',
}

/** 精靈尺寸 / Sprite size */
export enum EnumSpriteSize {
	Small = 'small',
	Normal = 'normal',
	Large = 'large',
}

/** 展示頁流程階段 / Showcase page flow phase */
export enum EnumShowcasePhase {
	Setup = 'setup',
	Result = 'result',
}
