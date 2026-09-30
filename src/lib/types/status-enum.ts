/**
 * 狀態屬性 enum
 *
 * 獨立於實作模組 #/lib/game/character/status-attrs 之外，避免 value 層級的循環依賴：
 * status-attrs 在模組求值時便需要本 enum 作為對照表鍵型別（STATUS_ATTR_KEYS /
 * STATUS_ATTR_TABLE / 鍵名衍生），若 enum 定義在 status-attrs 內側會造成自身 value
 * 層級的循環匯入（列舉在模組求值時處於 TDZ 而崩潰）。
 */

/**
 * 狀態屬性鍵 / Status attribute keys
 *
 * 需要執行期迭代的場景（鍵名衍生、建表迴圈）使用 STATUS_ATTR_KEYS（enum 值的陣列），
 * 型別位置一律使用 EnumStatusAttr。
 * Runtime iteration (key-name derivation, table build loops) uses STATUS_ATTR_KEYS (the
 * array of enum values); type positions use EnumStatusAttr.
 */
export enum EnumStatusAttr
{
	/** 力量 / Strength */
	STR = 'STR',
	/** 智力 / Intelligence */
	INT = 'INT',
	/** 靈巧 / Dexterity */
	DEX = 'DEX',
	/** 速度 / Speed */
	SPD = 'SPD',
	/** 運氣 / Luck */
	LUK = 'LUK',
	/** 物理攻擊 / Physical attack */
	ATK = 'ATK',
	/** 魔法攻擊 / Magic attack */
	MATK = 'MATK',
	/** 物理防禦 / Physical defense */
	DEF = 'DEF',
	/** 魔法防禦 / Magic defense */
	MDEF = 'MDEF',
	/** 最大 HP / Max HP */
	MAXHP = 'MAXHP',
	/** 最大 SP / Max SP */
	MAXSP = 'MAXSP',
}

/**
 * 生命／精神當前值 / Current HP / SP vital
 *
 * 與 EnumStatusAttr 的 MAXHP / MAXSP 上限成對：上限降低時須同步夾制當前值，
 * 讀寫當前值一律以 enum 表示，不使用字串聯合。
 * Pairs with the MAXHP / MAXSP caps in EnumStatusAttr: when a cap drops, the current
 * value must be clamped; the current value is always expressed as an enum, never a
 * string union.
 */
export enum EnumVital
{
	/** 當前 HP / Current HP */
	HP = 'HP',
	/** 當前 SP / Current SP */
	SP = 'SP',
}

/**
 * def 陣列索引（物理%, 物理-, 魔法%, 魔法-）/ def array indices
 * 與 EnumSkillDamageType（atk 槽位）成對：def[0..3] 依序為物理%減、物理定值、魔法%減、魔法定值。
 * Pairs with EnumSkillDamageType (atk slots): def[0..3] are phys %, phys flat, mag %, mag flat.
 */
export enum EnumDefSlot
{
	/** 物理減傷 %（def[0]）/ physical damage reduction % (def[0]) */
	PhysPct = 0,
	/** 物理定值減傷（def[1]）/ physical flat damage reduction (def[1]) */
	PhysFlat = 1,
	/** 魔法減傷 %（def[2]）/ magic damage reduction % (def[2]) */
	MagPct = 2,
	/** 魔法定值減傷（def[3]）/ magic flat damage reduction (def[3]) */
	MagFlat = 3,
}
