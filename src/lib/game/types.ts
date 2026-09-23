// 共用型別定義 / Shared type definitions
// 欄位對應 docs/data/{char,job,skill,item,mon}.md 分析的 YAML 結構。

import { EnumState, EnumPosition } from './constants';
import type { ICompField } from './character/status-attrs';

/**
 * 角色類型 / Character type
 * 列舉 / enumeration
 */
export enum EnumCharType {
	Char = 'char',
	Mon = 'mon',
	Summon = 'summon',
	Union = 'union',
}

/**
 * 裝備欄位 / Equipment slot
 * 列舉 / enumeration
 */
export enum EnumEquipSlot {
	MainHand = 'main_hand',
	OffHand = 'off_hand',
	Armor = 'armor',
	Item = 'item',
}

/**
 * 武器類型 / Weapon type
 * 列舉 / enumeration
 */
export enum EnumWeaponType {
	Sword = 'Sword',
	Dagger = 'Dagger',
	Pike = 'Pike',
	Hatchet = 'Hatchet',
	Wand = 'Wand',
	Mace = 'Mace',
	TwoHandSword = 'TwoHandSword',
	Spear = 'Spear',
	Axe = 'Axe',
	Staff = 'Staff',
	Bow = 'Bow',
	CrossBow = 'CrossBow',
	Whip = 'Whip',
	Shield = 'Shield',
	MainGauche = 'MainGauche',
	Book = 'Book',
	Armor = 'Armor',
	Cloth = 'Cloth',
	Robe = 'Robe',
	Item = 'Item',
	Material = 'Material',
	Other = 'Other',
}

/**
 * 防禦種類 / Guard kind
 * 列舉 / enumeration
 */
export enum EnumGuardKind {
	Always = 'always',
	Life25 = 'life25',
	Life50 = 'life50',
	Life75 = 'life75',
	Prob25 = 'prob25',
	Prob50 = 'prob50',
	Prob75 = 'prob75',
	Never = 'never',
}

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
	position?: EnumPosition;
	guard?: EnumGuardKind;
	pattern?: IPatternItem[];
}

/**
 * 技能目標類型 / Skill target type
 * 列舉 / enumeration
 */
export enum EnumTargetType {
	Enemy = 'enemy',
	Friend = 'friend',
	All = 'all',
	Self = 'self',
}

/**
 * 技能目標方式 / Skill target method
 * 列舉 / enumeration
 */
export enum EnumTargetMethod {
	Individual = 'individual',
	Multi = 'multi',
	All = 'all',
}

/**
 * 技能目標規格 / Skill target specification
 * 型別別名 / type alias
 */
export type ITargetSpec = [EnumTargetType, EnumTargetMethod, number];

/**
 * 狀態屬性 / Status attribute
 * 型別別名 / type alias
 */
export type { IStatusAttr } from './character/status-attrs';

/**
 * 補正欄位型別（P_* / M_*，單一事實來源由 COMP_FIELDS 衍生）/ Compensation bonus type
 * 型別別名 / type alias
 */
export type ICompBonuses = Partial<Record<ICompField, number>>;

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
 * 技能影響能力（參照基礎六維）/ Skill influencing stat
 * 列舉 / enumeration
 */
export enum EnumInfluence {
	Dex = 'dex',
	Str = 'str',
}

/**
 * 技能優先條件 / Skill priority condition
 * 列舉 / enumeration
 */
export enum EnumSkillPriority {
	LowHpRate = 'LowHpRate',
	Dead = 'Dead',
	Summon = 'Summon',
	Charge = 'Charge',
	Back = 'Back',
}

/**
 * 技能定義 / Skill definition
 * 介面 / interface
 */
export interface ISkillDef extends ICompBonuses {
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
	priority?: EnumSkillPriority;
	charge?: [number, number]; // [詠唱/蓄力, 硬直]
	stiff?: number;
	inf?: EnumInfluence;
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
	move?: EnumPosition;
	limit?: Partial<Record<EnumWeaponType, boolean>>;
	umove?: EnumPosition;
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
export interface IItemDef extends ICompBonuses {
	no: number;
	name: string;
	type: EnumWeaponType;
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
	equip?: EnumWeaponType[];
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
/**
 * 怪物/召喚/工會獎勵 / Monster / summon / union reward
 * 介面 / interface
 */
export interface IMonReward {
	moneyhold?: number;
	exphold?: number;
	itemtable?: Record<number, number>;
}

/**
 * 戰鬥單位基礎定義（角色/怪物共用）/ Combatant base definition (shared by char & mon)
 * 介面 / interface
 */
export interface ICharCore {
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
}

export interface ICharDef extends ICharCore {
	exp?: number;
	job?: number;
	equip?: Partial<Record<EnumEquipSlot, number>>;
	data_ex?: Record<string, unknown>;
}

/**
 * 怪物定義 / Monster definition
 * 介面 / interface
 */
export interface IMonDef extends ICharCore {
	reward?: IMonReward;
	isUnion?: boolean;
}

/**
 * 戰鬥事件類型 / Battle event type
 * 列舉 / enumeration
 */
export enum EnumBattleEventType {
	Damage = 'damage',
	Heal = 'heal',
	Guard = 'guard',
	Buff = 'buff',
	Debuff = 'debuff',
	Poison = 'poison',
	Death = 'death',
	Cast = 'cast',
	Charge = 'charge',
	MagicCircle = 'magiccircle',
	Summon = 'summon',
	Miss = 'miss',
	Info = 'info',
}


/**
 * 戰鬥事件 / Battle event
 * 介面 / interface
 */
export interface IBattleEvent {
	type: EnumBattleEventType;
	actor?: string;
	target?: string;
	skill?: number;
	value?: number;
	text?: string;
}

export type { EnumState };
