// 狀態屬性單一事實來源 / Single source of truth for status attributes
// 所有系統（技能 effect、被動 passive、裝備 equip、戰鬥變數 battle-variable、
// 工廠 factory、等級調整 level-fix）都從此處取得「屬性清單」與「屬性↔角色欄位對應」，
// 避免在各模組重複列舉屬性名稱與 getter/setter。

import { MAX_STATUS_MAXIMUM } from '../constants';
import type { Character } from './Character';

/**
 * atk 陣列索引（物理/魔法）/ atk array indices (physical/magic)
 * 列舉 / enumeration
 */
export enum EnumAtkSlot {
	Phys = 0,
	Mag = 1,
}

/**
 * def 陣列索引（物理%, 物理-, 魔法%, 魔法-）/ def array indices
 * 列舉 / enumeration
 */
export enum EnumDefSlot {
	PhysPct = 0,
	PhysFlat = 1,
	MagPct = 2,
	MagFlat = 3,
}

/**
 * 屬性函式 / Attribute function
 * 型別別名 / type alias
 */
export type IAttrFn = (c: Character, n: number) => void;


/**
 * 狀態屬性項目 / Status attribute entry
 * 介面 / interface
 */
export interface IStatusAttrEntry {
	/** 讀取角色戰鬥屬性 / Read battle attribute from character */
	get: (c: Character) => number;
	/** 寫入角色戰鬥屬性 / Write battle attribute to character */
	set: (c: Character, v: number) => void;
	/** 自定 up 公式（省略則套用通用 upAttr）/ Custom up formula (falls back to upAttr) */
	up?: IAttrFn;
	/** 自定 down 公式（省略則套用通用 downAttr）/ Custom down formula (falls back to downAttr) */
	down?: IAttrFn;
	/** 是否存在 plus 操作（省略則無 Plus* 欄位）/ Whether plus op exists (omit = no Plus* field) */
	plus?: IAttrFn;
}

/** 通用增益：round(orig*(1+n/100))，上限 orig*(MAX_STATUS_MAXIMUM/100) */
const upAttr = (get: (c: Character) => number, set: (c: Character, v: number) => void): IAttrFn =>
	(c, n) => {
		const orig = get(c);
		const cap = orig * (MAX_STATUS_MAXIMUM / 100);
		set(c, Math.min(Math.round(orig * (1 + n / 100)), cap));
	};

/** 通用減益：round(orig*(1-n/100)) */
const downAttr = (get: (c: Character) => number, set: (c: Character, v: number) => void): IAttrFn =>
	(c, n) => set(c, Math.round(get(c) * (1 - n / 100)));

/** 通用加成：orig + n */
const plusAttr = (get: (c: Character) => number, set: (c: Character, v: number) => void): IAttrFn =>
	(c, n) => set(c, get(c) + n);

/**
 * 狀態屬性鍵（單一事實來源；對照表與型別皆由此衍生）/ Status attribute keys (single source)
 * 型別別名 / type alias
 */
export const STATUS_ATTR_KEYS = [
	'STR', 'INT', 'DEX', 'SPD', 'LUK',
	'ATK', 'MATK', 'DEF', 'MDEF', 'MAXHP', 'MAXSP',
] as const;

/** 狀態屬性鍵型別 / Status attribute key type */
export type IStatusAttr = typeof STATUS_ATTR_KEYS[number];

/**
 * 狀態屬性對照表（單一事實來源）/ Status attribute lookup table (single source of truth)
 * 鍵為 IStatusAttr；每個屬性描述其角色欄位讀寫與 up/down/plus 語意。
 * DEF/MDEF 的 up/down 採百分比累計，與其他屬性不同，故自定。
 */
export const STATUS_ATTR_TABLE: Record<IStatusAttr, IStatusAttrEntry> = {
	STR: { get: (c) => c.STR, set: (c, v) => { c.STR = v; }, plus: plusAttr((c) => c.STR, (c, v) => { c.STR = v; }) },
	INT: { get: (c) => c.INT, set: (c, v) => { c.INT = v; }, plus: plusAttr((c) => c.INT, (c, v) => { c.INT = v; }) },
	DEX: { get: (c) => c.DEX, set: (c, v) => { c.DEX = v; }, plus: plusAttr((c) => c.DEX, (c, v) => { c.DEX = v; }) },
	SPD: { get: (c) => c.SPD, set: (c, v) => { c.SPD = v; }, plus: plusAttr((c) => c.SPD, (c, v) => { c.SPD = v; }) },
	LUK: { get: (c) => c.LUK, set: (c, v) => { c.LUK = v; }, plus: plusAttr((c) => c.LUK, (c, v) => { c.LUK = v; }) },
	ATK: { get: (c) => c.atk[EnumAtkSlot.Phys], set: (c, v) => { c.atk[EnumAtkSlot.Phys] = v; } },
	MATK: { get: (c) => c.atk[EnumAtkSlot.Mag], set: (c, v) => { c.atk[EnumAtkSlot.Mag] = v; } },
	DEF: {
		get: (c) => c.def[EnumDefSlot.PhysPct],
		set: (c, v) => { c.def[EnumDefSlot.PhysPct] = v; },
		up: (c, n) => { c.def[EnumDefSlot.PhysPct] += Math.floor((100 - c.def[EnumDefSlot.PhysPct]) * (n / 100)); },
		down: (c, n) => { c.def[EnumDefSlot.PhysPct] = Math.round(c.def[EnumDefSlot.PhysPct] * (1 - n / 100)); },
	},
	MDEF: {
		get: (c) => c.def[EnumDefSlot.MagPct],
		set: (c, v) => { c.def[EnumDefSlot.MagPct] = v; },
		up: (c, n) => { c.def[EnumDefSlot.MagPct] += Math.floor((100 - c.def[EnumDefSlot.MagPct]) * (n / 100)); },
		down: (c, n) => { c.def[EnumDefSlot.MagPct] = Math.round(c.def[EnumDefSlot.MagPct] * (1 - n / 100)); },
	},
	MAXHP: { get: (c) => c.MAXHP, set: (c, v) => { c.MAXHP = v; }, plus: plusAttr((c) => c.MAXHP, (c, v) => { c.MAXHP = v; }) },
	MAXSP: { get: (c) => c.MAXSP, set: (c, v) => { c.MAXSP = v; }, plus: plusAttr((c) => c.MAXSP, (c, v) => { c.MAXSP = v; }) },
};

/** 由對照表衍生 Up* / Down* / Plus* 操作對照（單一事實來源衍生）/ Derived op maps */
function buildStatusMaps(): { UPMAP: Record<string, IAttrFn>; DOWNMAP: Record<string, IAttrFn>; PLUSMAP: Record<string, IAttrFn> } {
	const UPMAP: Record<string, IAttrFn> = {};
	const DOWNMAP: Record<string, IAttrFn> = {};
	const PLUSMAP: Record<string, IAttrFn> = {};
	for (const key of Object.keys(STATUS_ATTR_TABLE) as IStatusAttr[]) {
		const e = STATUS_ATTR_TABLE[key];
		UPMAP['Up' + key] = e.up ?? upAttr(e.get, e.set);
		DOWNMAP['Down' + key] = e.down ?? downAttr(e.get, e.set);
		if (e.plus) PLUSMAP['Plus' + key] = e.plus;
	}
	return { UPMAP, DOWNMAP, PLUSMAP };
}

/**
 * 增益操作對照 / Up operation map (UpSTR, UpINT, ...)
 * 型別別名 / type alias
 */
export const { UPMAP, DOWNMAP, PLUSMAP } = buildStatusMaps();


/**
 * 基礎六維（建立/等級/戰鬥變數共用）/ Primary base stats (shared by factory, level-fix, battle-variable)
 * 型別別名 / type alias
 */
export const PRIMARY_STATS = ['str', 'int', 'dex', 'spd', 'luk'] as const;
export type IPrimaryStat = typeof PRIMARY_STATS[number];

/**
 * 基礎屬性 → 戰鬥屬性 + 補正屬性 對照 / Base stat to battle/compensation mapping
 * 型別別名 / type alias
 */
export const BASE_STAT_COMP_MAP: Record<IPrimaryStat, { battle: 'STR' | 'INT' | 'DEX' | 'SPD' | 'LUK'; comp: 'P_STR' | 'P_INT' | 'P_DEX' | 'P_SPD' | 'P_LUK' }> = {
	str: { battle: 'STR', comp: 'P_STR' },
	int: { battle: 'INT', comp: 'P_INT' },
	dex: { battle: 'DEX', comp: 'P_DEX' },
	spd: { battle: 'SPD', comp: 'P_SPD' },
	luk: { battle: 'LUK', comp: 'P_LUK' },
};


/**
 * 補正欄位（技能/道具共用，單一事實來源）/ Compensation fields (shared by passive & equip)
 * 型別別名 / type alias
 */
export const COMP_FIELDS = [
	'P_STR', 'P_INT', 'P_DEX', 'P_SPD', 'P_LUK',
	'P_MAXHP', 'P_MAXSP', 'M_MAXHP', 'M_MAXSP',
] as const;
export type ICompField = typeof COMP_FIELDS[number];
