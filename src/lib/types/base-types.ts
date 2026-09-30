import type { EnumEquipSlot } from './char-enum';
import type { IResourceId } from './seg-types';

// ============================================================================
// 數值基底 / Stat bases
// ============================================================================

export interface IStatsHpSp
{
	/** 目前 HP（省略時視為滿血）/ current HP (full HP when omitted) */
	hp?: number;
	/** 目前 SP（省略時視為滿 SP）/ current SP (full SP when omitted) */
	sp?: number;
}

export interface IStatsHpSpMax
{
	/** HP 上限 / max HP */
	maxhp?: number;
	/** SP 上限 / max SP */
	maxsp?: number;
}

export interface IStatsHpSpAll extends IStatsHpSp, IStatsHpSpMax {}

export interface IStatsBase
{
	/** 力量（物理攻擊主因）/ strength (main physical-attack stat) */
	str?: number;
	/** 智力（魔法攻擊主因）/ intelligence (main magic-attack stat) */
	int?: number;
	/** 敏捷（命中／迴避相關）/ dexterity (hit/evasion related) */
	dex?: number;
	/** 速度（行動順序與 Delay 距離）/ speed (action order and delay distance) */
	spd?: number;
	/** 幸運 / luck */
	luk?: number;
}

/**
 * 戰鬥數值（角色/怪物共用）/ Combat stats (shared by char & mon)
 *
 * 所有欄位皆**可缺省**：原始資料可能缺漏（如 mon.1010 Bat 完全無六維、char.400 缺 HP/SP），
 * 缺漏表示「未定」，由實例化（Character 建構）或後續推導（職業係數）解析；
 * ICharCore／raw 型別皆引用本介面，避免重覆宣告。
 * Every field is optional: the source data may omit stats (e.g. mon.1010 Bat has none,
 * char.400 lacks HP/SP). An omitted stat is "unresolved" and is resolved at instantiation
 * (Character construction) or later derivation (job coefficients). Both ICharCore and the
 * raw YAML types reference this interface instead of re-declaring the fields.
 */
export interface ICombatStats extends IStatsHpSp, IStatsHpSpMax, IStatsBase
{
	/** 等級 / level */
	level?: number;
}

// ============================================================================
// 元組與數值表 / Tuples & number tables
// ============================================================================

/**
 * 攻擊力二元組 / attack 2-tuple
 * 索引同 EnumSkillDamageType：0=物理、1=魔法。raw 與 target 共用。
 * Index semantics follow EnumSkillDamageType: 0 = physical, 1 = magic. Shared by raw & target.
 */
export type IAtkTuple = [phys: number, mag: number];

/**
 * 減傷四元組 / reduction 4-tuple
 * 索引同 EnumDefSlot：物理%減、物理定值減、魔法%減、魔法定值減。
 * Index semantics follow EnumDefSlot: phys %, phys flat, mag %, mag flat.
 */
export type IDefTuple = [physPct: number, physFlat: number, magPct: number, magFlat: number];

/**
 * 權重二元組 [權重, 旗標] / weight pair [weight, flag]
 * 獨特怪物隨行雜魚（servant）與土地遭遇表（monster）共用。
 * Shared by union escorts (servant) and land encounter tables (monster).
 */
export type IWeightPair = [weight: number, flag: number];

/**
 * 數值鍵對數值表（itemtable／need 等掉落與需求表）/ number-keyed number table (drop/requirement tables)
 * IMonReward.itemtable、IItemDef.need 與 raw 對應欄位共用。
 * Referenced by IMonReward.itemtable, IItemDef.need and their raw counterparts.
 */
export type INumberTable<K extends string | number = string | number> = Record<K, number>;

/**
 * 裝備表：欄位 → 道具編號 / equip table: slot → item number
 * 鍵為 EnumEquipSlot；ICharDef.equip 與 raw equip 皆引用。
 * Keyed by EnumEquipSlot; referenced by ICharDef.equip and the raw equip shape.
 */
export type IEquipTable = Partial<INumberTable<EnumEquipSlot>>;

/**
 * 怪物遭遇／隨行表：怪物編號 → [權重, 旗標] / monster encounter/escort table
 * IMonDef.servant、land.monster、union 隨行表與 raw 對應欄位皆引用。
 * Referenced by IMonDef.servant, land.monster, union escorts and their raw counterparts.
 */
export type IEncounterTable = Record<IResourceId, IWeightPair>;

// ============================================================================
// 共用欄位塊 / Shared field blocks
// ============================================================================

/**
 * 攻擊／減傷欄位的共用形狀（`atk`／`def`）
 * Shared shape of the attack/reduction fields (`atk` / `def`)
 *
 * 所有同時帶 `atk` 與 `def` 的介面一律以 `extends` 繼承本型別，不再各自宣告；
 * 完整欄位語意寫在下方「欄位自身」的 JSDoc，使繼承方在 IDE 悬停時仍取得有效說明。
 * Every interface carrying both `atk` and `def` extends this type instead of re-declaring it;
 * the full field semantics live in the field's own JSDoc below, so inheriting sites still
 * surface an effective description on IDE hover.
 *
 * 使用方 / Consumers:
 * - `ICharCore`（角色／怪物共通基屬；`ICharDef`／`IMonDef` 繼承）/ shared char & mon base
 *   (`ICharDef` / `IMonDef` inherit it)
 * - `IItemDef`（武器／裝備自身的攻防）/ item's own attack & reduction
 * - raw 的 `IRawMonYaml`／`IItemDef`（YAML 原始欄位）/ raw `IRawMonYaml` / `IItemDef`
 */
export interface IAtkDefFields
{
	/**
	 * 基礎攻擊力（有語意的二元組）[物理, 魔法] / base attack 2-tuple [physical, magic]
	 * 索引語意同 EnumSkillDamageType。 / index semantics follow EnumSkillDamageType.
	 *
	 * 數值來源依介面而異：怪物由資料層給定、道具為其自身攻擊、角色由裝備累加。
	 * The value's origin varies by interface: mons take it from the data layer, items carry
	 * their own attack, chars accumulate it from equipment.
	 */
	atk?: IAtkTuple;
	/**
	 * 基礎減傷四槽（有語意的四元組）[物理%減, 物理定值減, 魔法%減, 魔法定值減]
	 * base reduction 4-tuple; index semantics follow EnumDefSlot.
	 *
	 * 來源同 `atk`（怪物資料層／道具自身／角色由裝備累加）。
	 * Origin follows `atk` (monster data layer / item itself / accumulated from equipment).
	 */
	def?: IDefTuple;
}

/**
 * 具名目錄項目的身分與展示成員（no + name + img）
 * Identity & icon members of a named catalog item.
 * IItemDef、ISkillDef、IMonDef 與 raw 對應項皆引用（不再各檔重寫）。
 * Referenced by IItemDef, ISkillDef, IMonDef and their raw counterparts.
 */
export interface INamedIconDef
{
	/** 編號（repository 索引鍵）/ number (repository index key) */
	no: number;
	/** 名稱 / name */
	name: string;
	/** 圖示資源路徑 / icon asset path */
	img?: string;
}

/**
 * 說明區塊（`info` 欄位共用）/ description block (shared by `info` fields)
 * job／monster／guard／judge 的 info 皆引用。
 * Referenced by job/monster/guard/judge info fields.
 */
export interface IDescInfo
{
	/** 說明文字 / description text */
	desc?: string;
}
