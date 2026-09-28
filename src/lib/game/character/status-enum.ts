/**
 * 狀態屬性鍵 enum（單一事實來源）/ Status attribute key enum (single source of truth)
 *
 * 獨立於 status-attrs.ts，避免 value 層級的循環依賴：status-attrs 在模組求值時
 * 便需要本 enum 作為對照表鍵型別（STATUS_ATTR_KEYS / STATUS_ATTR_TABLE / 鍵名衍生），
 * 若 enum 定義在 status-attrs 內側會造成自身 value 層級的循環匯入（列舉在模組求值時
 * 處於 TDZ 而崩潰）。
 * Kept separate from status-attrs.ts to avoid a value-level circular import: status-attrs
 * needs this enum at module-eval time as the map-key type (STATUS_ATTR_KEYS / STATUS_ATTR_TABLE
 */
/**
 * / key-name derivation). Defining the enum inside status-attrs would create a self-referential
 */
/**
 * value cycle that crashes at module-eval time (the enum would sit in its TDZ).
 */

/**
 * 狀態屬性鍵（單一事實來源）/ Status attribute keys (single source of truth)
 *
 * 以 enum 取代舊有的 const 陣列＋union 衍生：STATUS_ATTR_KEYS 仍保留為 enum 值的陣列，
 * 供需要執行期迭代的場景（鍵名衍生、建表迴圈）向後相容；型別位置全面改用 EnumStatusAttr。
 * Replaces the old const-array + union derivation: STATUS_ATTR_KEYS stays as the array of enum
 * values for runtime iteration (key-name derivation, table build loop) backward-compat; all
 * type positions now use EnumStatusAttr.
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
 * 生命／精神當前值（單一事實來源）/ Current HP / SP vital (single source of truth)
 *
 * 與 EnumStatusAttr 的 MAXHP / MAXSP 上限成對：上限降低時須同步夾制當前值。
 * 用以取代原先 downCap 演算法中的 'HP' | 'SP' 字串聯合，使「當前值」亦受 enum 約束。
 * Pairs with the MAXHP / MAXSP caps in EnumStatusAttr: when a cap drops, the current
 * value must be clamped. Replaces the previous 'HP' | 'SP' string union in the cap-debuff
 * algorithm so the current value is also governed by an enum.
 */
export enum EnumVital
{
	/** 當前 HP / Current HP */
	HP = 'HP',
	/** 當前 SP / Current SP */
	SP = 'SP',
}
