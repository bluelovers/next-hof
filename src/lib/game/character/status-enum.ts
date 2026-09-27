// 狀態屬性鍵 enum（單一事實來源）/ Status attribute key enum (single source of truth)
//
// 獨立於 status-attrs.ts 與 status-key.ts，避免與兩者的互相引用形成循環依賴：
// status-attrs 匯入 status-key 的對照表，status-key 又需要本 enum 作為對照表鍵型別，
// 若 enum 定義在任一側都會造成 value 層級的循環匯入（列舉在模組求值時處於 TDZ 而崩潰）。
// Kept separate from status-attrs.ts and status-key.ts to avoid a value-level circular
// import: status-attrs imports maps from status-key, while status-key needs this enum as
// the map-key type. Defining the enum on either side would create a cycle that crashes at
// module-eval time (the enum would sit in its TDZ).

/**
 * 狀態屬性鍵（單一事實來源）/ Status attribute keys (single source of truth)
 *
 * 以 enum 取代舊有的 const 陣列＋union 衍生：STATUS_ATTR_KEYS 仍保留為 enum 值的陣列，
 * 供需要執行期迭代的場景（status-key 衍生、建表迴圈）向後相容；型別位置全面改用 EnumStatusAttr。
 * Replaces the old const-array + union derivation: STATUS_ATTR_KEYS stays as the array of enum
 * values for runtime iteration (status-key derivation, table build loop) backward-compat; all
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
