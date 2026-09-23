// 共用型別定義 / Shared type definitions
// 欄位對應 docs/data/{char,job,skill,item,mon}.md 分析的 YAML 結構。

import { EnumState } from './constants';

/**
 * 角色類型 / Character type
 * 型別別名 / type alias
 */
export type ICharType = 'char' | 'mon' | 'summon' | 'union';

/**
 * 裝備欄位 / Equipment slot
 * 型別別名 / type alias
 */
export type IEquipSlot = 'main_hand' | 'off_hand' | 'armor' | 'item';

/**
 * 武器類型 / Weapon type
 * 型別別名 / type alias
 */
export type IWeaponType =
	| 'Sword' | 'Dagger' | 'Pike' | 'Hatchet' | 'Wand' | 'Mace'
	| 'TwoHandSword' | 'Spear' | 'Axe' | 'Staff' | 'Bow' | 'CrossBow' | 'Whip'
	| 'Shield' | 'MainGauche' | 'Book' | 'Armor' | 'Cloth' | 'Robe' | 'Item'
	| 'Material' | 'Other';

/**
 * 防禦種類 / Guard kind
 * 型別別名 / type alias
 */
export type IGuardKind =
	| 'always' | 'life25' | 'life50' | 'life75' | 'prob25' | 'prob50' | 'prob75' | 'never';

/**
 * 模式項目 / Pattern item
 * 介面 / interface
 */
export interface IPatternItem {
	judge: number;
	quantity: number;
	action: number;
}


/**
 * 行為定義 / Behavior definition
 * 介面 / interface
 */
export interface IBehavior {
	position?: 'front' | 'back';
	guard?: IGuardKind;
	pattern?: IPatternItem[];
}

/**
 * 技能目標類型 / Skill target type
 * 型別別名 / type alias
 */
export type ITargetType = 'enemy' | 'friend' | 'all' | 'self';

/**
 * 技能目標方式 / Skill target method
 * 型別別名 / type alias
 */
export type ITargetMethod = 'individual' | 'multi' | 'all';

/**
 * 技能目標規格 / Skill target specification
 * 型別別名 / type alias
 */
export type ITargetSpec = [ITargetType, ITargetMethod, number];

/**
 * 狀態屬性 / Status attribute
 * 型別別名 / type alias
 */
export type IStatusAttr =
	| 'STR' | 'INT' | 'DEX' | 'SPD' | 'LUK'
	| 'ATK' | 'MATK' | 'DEF' | 'MDEF' | 'MAXHP' | 'MAXSP';

/**
 * 特殊能力定義 / Special ability definition
 * 介面 / interface
 */
export interface ISpecial {
	PoisonResist: number;
	HealBonus: number;
	Barrier: number;
	Pierce: [number, number]; // [physical, magic]
	Summon: number;
	Undead: number;
	HpRegen: number;
	SpRegen: number;
}

/**
 * 技能定義 / Skill definition
 * 介面 / interface
 */
export interface ISkillDef {
	no: number;
	name: string;
	img?: string;
	exp?: string;
	sp: number;
	type: 0 | 1; // 0=物理, 1=魔法
	learn?: number;
	target?: ITargetSpec;
	pow?: number;
	hit?: number;
	invalid?: number; // 防禦貫穿（前衛守護無效）
	support?: number; // 支援魔法（pow 視為回復倍率）
	priority?: 'LowHpRate' | 'Dead' | 'Summon' | 'Charge' | 'Back';
	charge?: [number, number]; // [詠唱/蓄力, 硬直]
	stiff?: number;
	inf?: 'dex' | 'str';
	// 被動技能授予的能力補正 / passive-granted compensation
	P_MAXHP?: number; P_MAXSP?: number;
	P_STR?: number; P_INT?: number; P_DEX?: number; P_SPD?: number; P_LUK?: number;
	M_MAXHP?: number; M_MAXSP?: number;
	HealBonus?: number;
	// 能力變化 / status effects
	UpSTR?: number; UpINT?: number; UpDEX?: number; UpSPD?: number; UpLUK?: number;
	UpATK?: number; UpMATK?: number; UpDEF?: number; UpMDEF?: number; UpMAXHP?: number; UpMAXSP?: number;
	DownSTR?: number; DownINT?: number; DownDEX?: number; DownSPD?: number; DownLUK?: number;
	DownATK?: number; DownMATK?: number; DownDEF?: number; DownMDEF?: number; DownMAXHP?: number; DownMAXSP?: number;
	PlusSTR?: number; PlusINT?: number; PlusDEX?: number; PlusSPD?: number; PlusLUK?: number;
	PlusMAXHP?: number; PlusMAXSP?: number;
	pierce?: number;
	delay?: number;
	knockback?: number;
	poison?: number;
	summon?: number | number[];
	move?: 'front' | 'back';
	limit?: Partial<Record<IWeaponType, boolean>>;
	umove?: 'front' | 'back';
	passive?: number;
	quick?: number;
	sacrifice?: number;
	CurePoison?: number;
	HpRegen?: number;
	SpRegen?: number;
	SpRecoveryRate?: number;
	MagicCircleAdd?: number;
	MagicCircleDelete?: number;
	MagicCircleDeleteTeam?: number;
	MagicCircleDeleteEnemy?: number;
	revive?: number;
}

/**
 * 道具定義 / Item definition
 * 介面 / interface
 */
export interface IItemDef {
	no: number;
	name: string;
	type: IWeaponType;
	type2?: string; // WEAPON / ARMOR / ITEM / MATERIAL / OTHER
	img?: string;
	buy?: number;
	sell?: number;
	atk?: [number, number]; // [物理攻, 魔法攻]
	def?: [number, number, number, number]; // [物理%, 物理-, 魔法%, 魔法-]
	dh?: boolean; // 雙手武器
	handle?: number; // 負荷
	need?: Record<number, number>; // { job_no: level }
	base_name?: string;
	P_MAXHP?: number; P_MAXSP?: number;
	P_STR?: number; P_INT?: number; P_DEX?: number; P_SPD?: number; P_LUK?: number;
	M_MAXHP?: number; M_MAXSP?: number;
	P_SUMMON?: number;
	P_PIERCE?: number;
}

/**
 * 職業定義 / Job definition
 * 介面 / interface
 */
export interface IJobDef {
	no: number | string;
	job_name?: string;
	equip?: IWeaponType[];
	coe?: { maxhp?: number; maxsp?: number; [k: string]: number | undefined };
	pattern?: IBehavior | null;
	img?: string;
	gender?: Record<number, { img?: string; job_name?: string }>;
	info?: { desc?: string };
	rank?: number;
}

/**
 * 角色定義 / Character definition
 * 介面 / interface
 */
export interface ICharDef {
	no: number;
	name: string;
	level: number;
	exp?: number;
	maxhp: number;
	hp?: number;
	maxsp: number;
	sp?: number;
	str: number;
	int: number;
	dex: number;
	spd: number;
	luk: number;
	job?: number;
	skill?: number[];
	equip?: Partial<Record<IEquipSlot, number>>;
	behavior?: IBehavior;
	data_ex?: Record<string, unknown>;
}

/**
 * 怪物定義 / Monster definition
 * 介面 / interface
 */
export interface IMonDef {
	no: number;
	name: string;
	level: number;
	maxhp: number;
	hp?: number;
	maxsp: number;
	sp?: number;
	str: number;
	int: number;
	dex: number;
	spd: number;
	luk: number;
	skill?: number[];
	behavior?: IBehavior;
	reward?: {
		moneyhold?: number;
		exphold?: number;
		itemtable?: Record<number, number>;
	};
	isUnion?: boolean;
}

/**
 * 戰鬥事件類型 / Battle event type
 * 型別別名 / type alias
 */
export type IBattleEventType =
	| 'damage' | 'heal' | 'guard' | 'buff' | 'debuff' | 'poison'
	| 'death' | 'cast' | 'charge' | 'magiccircle' | 'summon' | 'miss' | 'info';


/**
 * 戰鬥事件 / Battle event
 * 介面 / interface
 */
export interface IBattleEvent {
	type: IBattleEventType;
	actor?: string;
	target?: string;
	skill?: number;
	value?: number;
	text?: string;
}

export type { EnumState };
