/**
 * 狀態屬性模組 / Status attribute module
 * 整合原 status-key.ts（鍵名衍生）與 status-attrs.ts（屬性對照表）：
 * 兩者高度耦合（status-attrs 使用 status-key 的鍵名對照表建構 UPMAP/DOWNMAP/PLUSMAP），
 * 合併為單一模块後，狀態屬性的「鍵名」與「讀寫語意」不再分散維護。
 * Integrates the former status-key.ts (key-name derivation) and status-attrs.ts
 * (attribute table): the two were tightly coupled (status-attrs built UPMAP/DOWNMAP/PLUSMAP
 * from status-key's key-name lookups), so merging them into one module keeps every status
 * attribute's "key name" and "read/write semantics" in a single place.
 *
 * 本檔是狀態屬性「讀寫語意」的單一事實來源（本檔僅此一次提及）；enum 與型別定義已分類
 * 移至 #/lib/types/status-enum.ts、prefix-enum.ts、status-attr-types.ts，本檔轉出相容路徑。
 * This module is the single source of truth for status read/write semantics (mentioned once
 * in this file); enums and types moved to #/lib/types/status-enum.ts, prefix-enum.ts and
 * status-attr-types.ts, re-exported here to keep the legacy import paths working.
 *
 * 所有系統（技能 effect、被動 passive、裝備 equip、戰鬥變數 battle-variable、
 * 工廠 factory、等級調整 level-fix）都從此處取得「屬性清單」與「屬性↔角色欄位對應」，
 * 與「Up* /Down* /Plus* /P_* 鍵名對照」，避免在各模組重複列舉屬性名稱與 getter/setter。
 */

import { MAX_STATUS_MAXIMUM } from '../constants';
import { minusPercent, plusPercent, takePercent } from '../core/percent';
import { EnumSkillDamageType } from '../types';
import type { Character } from './Character';
import { EnumDefSlot, EnumStatusAttr, EnumVital } from '#/lib/types/status-enum';
import { EnumCompPrefix, EnumStatusPrefix } from '#/lib/types/prefix-enum';
import type {
	IAttrFn,
	IBaseStatComp,
	ICompField,
	IPrimaryStat,
	IStatusAttrEntry,
	IStatusDownKey,
	IStatusPlusKey,
	IStatusUpKey,
} from '#/lib/types/status-attr-types';
import {
	ITSTemplateLiteralAllowedType,
	ITSStringLiteralPrefixed,
	ITSStringLiteralPrefixedRecord,
} from 'ts-type';

// ---- 轉出相容 / Re-exports to keep legacy import paths ----
export { EnumCompPrefix, EnumStatusPrefix } from '#/lib/types/prefix-enum';
export { EnumDefSlot } from '#/lib/types/status-enum';
export type {
	IAttrFn,
	IBaseStatComp,
	ICompField,
	IPrimaryStat,
	IStatusAttrEntry,
	IStatusDownKey,
	IStatusPlusKey,
	IStatusUpKey,
} from '#/lib/types/status-attr-types';

// ============================================================================
/**
 * 狀態屬性鍵名衍生 / Status attribute key-name derivation
 * 由 EnumStatusPrefix + EnumStatusAttr 靜態對照產生 Up* /Down* /Plus* 鍵名，
 * 杜絕在各處使用字串聯合（'Up'+key, 'P_'+name）產生鍵名。
 * Static lookups from EnumStatusPrefix + EnumStatusAttr produce Up* /Down* /Plus* keys,
 * eliminating string concatenation ('Up'+key, 'P_'+name) at call sites.
 */

// ============================================================================

/**
 * 由前綴 + 屬性名稱建立「名稱→鍵名」對照表 / Build a name→key-name record from a prefix
 *
 * 回傳的 record 對 EnumStatusAttr 為全映射（total），因此外部取鍵名只需
 * 直接索引 STATUS_UP_KEY_NAME[key] 等對照表，無需額外的字串聯合或回退分支。
 * The returned record is a total mapping over EnumStatusAttr, so callers index the
 * static tables directly (STATUS_UP_KEY_NAME[key] etc.) without string concatenation
 * or fallback branches.
 */
function _buildStatRecord<Name extends string, Prefix extends ITSTemplateLiteralAllowedType>(
	prefix: Prefix,
	names: readonly Name[],
)
{
	const record = {} as ITSStringLiteralPrefixedRecord<Name, Prefix>;
	const attrs: ITSStringLiteralPrefixed<Name, Prefix>[] = [];
	for (const name of names)
	{
		const attr = `${prefix}${name}` as ITSStringLiteralPrefixed<Name, Prefix>;
		record[name] = attr;
		attrs.push(attr);
	}
	return {
		record,
		attrs,
	} as const;
}

/** 狀態屬性鍵陣列（由 EnumStatusAttr 衍生，供執行期迭代向後相容）/ Key array derived from EnumStatusAttr for runtime iteration, backward-compatible */
export const STATUS_ATTR_KEYS: readonly EnumStatusAttr[] = Object.values(EnumStatusAttr);

/**
 * Up* / Down* / Plus* 的「鍵名對照」與「鍵陣列」皆由 _buildStatRecord 單一函式一併產生，
 * 不在別處以 .map() 重複衍生。
 * Up* / Down* / Plus* key-name records and key arrays are all produced together by the single
 * _buildStatRecord function — nothing re-derives them via a separate .map().
 */
export const {
	/**
	 * 狀態屬性的 Up 鍵名對照 / Status attribute Up key-name mapping
	 * 鍵為 EnumStatusAttr；由 STATUS_ATTR_KEYS 靜態對照產生，非動態字串聯合。
	 * Keyed by EnumStatusAttr; derived statically from STATUS_ATTR_KEYS, not via string concatenation.
	 */
	record: STATUS_UP_KEY_NAME,
	/** 由 _buildStatRecord 一併衍生的 Up 鍵陣列（型別 IStatusUpKey[]）/ Up key array produced alongside by _buildStatRecord (typed IStatusUpKey[]) */
	attrs: STATUS_UP_KEYS,
} = _buildStatRecord(EnumStatusPrefix.Up, STATUS_ATTR_KEYS);

export const {
	/**
	 * 狀態屬性的 Down 鍵名對照 / Status attribute Down key-name mapping
	 * 鍵為 EnumStatusAttr。/ Keyed by EnumStatusAttr.
	 */
	record: STATUS_DOWN_KEY_NAME,
	/** 由 _buildStatRecord 一併衍生的 Down 鍵陣列（型別 IStatusDownKey[]）/ Down key array produced alongside by _buildStatRecord (typed IStatusDownKey[]) */
	attrs: STATUS_DOWN_KEYS,
} = _buildStatRecord(EnumStatusPrefix.Down, STATUS_ATTR_KEYS);

export const {
	/**
	 * 狀態屬性的 Plus 鍵名對照 / Status attribute Plus key-name mapping
	 * 鍵為 EnumStatusAttr（共 11 鍵，全映射；buildStatusMaps 用以建立 PLUSMAP）。
	 * Keyed by EnumStatusAttr (all 11 keys, total mapping; buildStatusMaps uses it to build PLUSMAP).
	 */
	record: STATUS_PLUS_KEY_NAME,
} = _buildStatRecord(EnumStatusPrefix.Plus, STATUS_ATTR_KEYS);

// ============================================================================
/**
 * 狀態屬性對照表 / Status attribute lookup table
 * 鍵為 EnumStatusAttr；每個屬性描述其角色欄位讀寫與 up/down/plus 語意。
 * DEF/MDEF 的 up/down 採百分比累計，與其他屬性不同，故自定。
 */

// ============================================================================

/**
 * 屬性欄位存取器 / Attribute field accessor
 *
 * 每個 EnumStatusAttr 對應「角色身上的哪個欄位／槽位」只在此處定義一次；後續 get/set 與所有
 * 演算法皆由 STATUS_FIELD 查表取得，杜絕槽位在 get/set 與演算法呼叫處重複書寫（先前 ATK 的
 * EnumSkillDamageType.Physical、DEF 的 EnumDefSlot.PhysPct 等同時出現在多處）。
 * Each EnumStatusAttr maps to "which Character field/slot" exactly once here; every get/set and
 * algorithm later resolves it from STATUS_FIELD, so a slot is never written in multiple places
 * (previously e.g. the physical slot for ATK appeared in get/set AND the up-call).
 */
interface IStatusField
{
	get: (c: Character) => number;
	set: (c: Character, v: number) => void;
}

/** 純量屬性（名稱即 Character 欄位名，非 atk/def 槽位）/ Scalar attributes (name == Character field name, not an atk/def slot) */
type IScalarStatusAttr =
	| EnumStatusAttr.STR
	| EnumStatusAttr.INT
	| EnumStatusAttr.DEX
	| EnumStatusAttr.SPD
	| EnumStatusAttr.LUK
	| EnumStatusAttr.MAXHP
	| EnumStatusAttr.MAXSP;

/**
 * 欄位存取器工廠 / Field accessor factory
 * 由 EnumStatusAttr / EnumVital 列舉值（即 Character 欄位名）取得 get/set，取代原先散落的
 * `(c) => c.X` / `(c, v) => { c.X = v; }` lambda，使欄位名只在此處出現一次。
 * Resolves get/set from an EnumStatusAttr / EnumVital value (== Character field name), replacing the
 * scattered `(c) => c.X` / `(c, v) => { c.X = v; }` lambdas so the field name appears only once.
 */
const _field = (key: IScalarStatusAttr | EnumVital): IStatusField =>
{
	const k = key as keyof Character;
	const acc = (c: Character) => c as unknown as Record<keyof Character, number>;
	return {
		get: (c) => acc(c)[k] as number,
		set: (c, v) => { acc(c)[k] = v; },
	};
};

/**
 * atk 槽位存取器 / atk slot accessor
 *
 * atk 槽位與技能傷害類型共用 EnumSkillDamageType（0＝Physical＝atk[0]、1＝Magic＝atk[1]），
 * 故不再另立 EnumAtkSlot（Phys / Mag）重複定義同一組索引。
 * The atk slot shares EnumSkillDamageType with the skill damage type (0 = Physical = atk[0],
 * 1 = Magic = atk[1]), so the duplicate EnumAtkSlot (Phys / Mag) index enum was removed.
 */
const _atkField = (slot: EnumSkillDamageType): IStatusField => ({
	get: (c) => c.atk[slot],
	set: (c, v) => { c.atk[slot] = v; },
});

const _defField = (slot: EnumDefSlot): IStatusField => ({
	get: (c) => c.def[slot],
	set: (c, v) => { c.def[slot] = v; },
});

/**
 * 屬性↔欄位對照 / Attribute→field mapping
 * 鍵為 EnumStatusAttr；atk/def 經由 EnumSkillDamageType / EnumDefSlot 列舉索引，不寫死數字或字串。
 * Keyed by EnumStatusAttr; atk/def indexed via the EnumSkillDamageType / EnumDefSlot enums (no hardcoded numbers/strings).
 */
const STATUS_FIELD: Record<EnumStatusAttr, IStatusField> = {
	[EnumStatusAttr.STR]: _field(EnumStatusAttr.STR),
	[EnumStatusAttr.INT]: _field(EnumStatusAttr.INT),
	[EnumStatusAttr.DEX]: _field(EnumStatusAttr.DEX),
	[EnumStatusAttr.SPD]: _field(EnumStatusAttr.SPD),
	[EnumStatusAttr.LUK]: _field(EnumStatusAttr.LUK),
	[EnumStatusAttr.ATK]: _atkField(EnumSkillDamageType.Physical),
	[EnumStatusAttr.MATK]: _atkField(EnumSkillDamageType.Magic),
	[EnumStatusAttr.DEF]: _defField(EnumDefSlot.PhysPct),
	[EnumStatusAttr.MDEF]: _defField(EnumDefSlot.MagPct),
	[EnumStatusAttr.MAXHP]: _field(EnumStatusAttr.MAXHP),
	[EnumStatusAttr.MAXSP]: _field(EnumStatusAttr.MAXSP),
};

/**
 * 生命／精神當前值對照 / Current HP/SP vital mapping
 * 鍵為 EnumVital 列舉（取代原先 'HP' | 'SP' 字串聯合），與 STATUS_FIELD 同構。
 * Keyed by the EnumVital enum (replacing the previous 'HP' | 'SP' string union); same shape as STATUS_FIELD.
 */
const VITAL_FIELD: Record<EnumVital, IStatusField> = {
	[EnumVital.HP]: _field(EnumVital.HP),
	[EnumVital.SP]: _field(EnumVital.SP),
};

/**
 * 上限屬性↔當前值對照 / Cap attribute ↔ current vital mapping
 * 僅 MAXHP/MAXSP 有對應當前值；列舉對列舉（EnumStatusAttr → EnumVital），無字串聯合。
 * Only MAXHP/MAXSP have a current vital; enum-to-enum (EnumStatusAttr → EnumVital), no string union.
 */
const CAP_VITAL: Partial<Record<EnumStatusAttr, EnumVital>> = {
	[EnumStatusAttr.MAXHP]: EnumVital.HP,
	[EnumStatusAttr.MAXSP]: EnumVital.SP,
};

/** 增益縮放：round(orig*(1+n/100))（upAttr 與 upNoCap 共用）/ Buff scale shared by upAttr & upNoCap */
const _scaleUp = (orig: number, n: number) => Math.round(plusPercent(orig, n));

/**
 * 通用增益：round(orig*(1+n/100))，上限 orig*(MAX_STATUS_MAXIMUM/100)
 * Generic buff: round(orig*(1+n/100)), capped at orig*(MAX_STATUS_MAXIMUM/100)
 * 由 EnumStatusAttr 查 STATUS_FIELD 取得欄位（取代原先 (get,set) 參數）。
 * Field resolved from STATUS_FIELD by EnumStatusAttr (replaces the (get,set) parameters).
 */
const upAttr = (attr: EnumStatusAttr): IAttrFn => (c, n) =>
{
	const f = STATUS_FIELD[attr];
	const orig = f.get(c);
	const cap = takePercent(orig, MAX_STATUS_MAXIMUM);
	f.set(c, Math.min(_scaleUp(orig, n), cap));
};

/**
 * 通用減益：round(orig*(1-n/100))
 * Generic debuff: round(orig*(1-n/100))
 */
const downAttr = (attr: EnumStatusAttr): IAttrFn => (c, n) =>
{
	const f = STATUS_FIELD[attr];
	f.set(c, Math.round(minusPercent(f.get(c), n)));
};

/**
 * 通用加成：orig + n
 * Generic flat bonus: orig + n
 */
const plusAttr = (attr: EnumStatusAttr): IAttrFn => (c, n) =>
{
	const f = STATUS_FIELD[attr];
	f.set(c, f.get(c) + n);
};

/**
 * 以下為「自定演算法」：僅 ATK/MATK、DEF/MDEF、MAXHP/MAXSP 需要的特殊 up/down 公式。
 * 全部以 EnumStatusAttr 為參數，由 STATUS_FIELD 查表取得欄位，
 * 不再以原始字串聯合（'MAXHP' | 'MAXSP'、'HP' | 'SP'）或槽位重複書寫。
 * Custom algorithms below: the special up/down formulas for ATK/MATK, DEF/MDEF, MAXHP/MAXSP.
 * All are parameterized by EnumStatusAttr and resolve the field via STATUS_FIELD; no raw
 * string unions ('MAXHP' | 'MAXSP', 'HP' | 'SP') or duplicated slot literals.
 */

/**
 * 無上限增益：round(orig*(1+n/100))（ATK/MATK/MAXHP/MAXSP 共用，對齊原始 UpATK/UpMATK/UpMAXHP/UpMAXSP）。
 * Uncapped buff: round(orig*(1+n/100)) (shared by ATK/MATK/MAXHP/MAXSP; mirrors original UpATK/UpMATK/UpMAXHP/UpMAXSP).
 * 與通用 upAttr 的差異僅在「不套用 MAX_STATUS_MAXIMUM 上限」，故共用同一套 _scaleUp 計算。
 * Differs from upAttr only by omitting the MAX_STATUS_MAXIMUM cap, hence reuses the same _scaleUp.
 */
const upNoCap = (attr: EnumStatusAttr): IAttrFn => (c, n) =>
{
	const f = STATUS_FIELD[attr];
	f.set(c, _scaleUp(f.get(c), n));
};

/**
 * 減傷率增益：填補剩餘空間的 n%（(100 - 現值) * n/100，不超過 100）。DEF/MDEF 共用。
 * Reduction-% up: fills n% of the remaining room toward 100% (never exceeds 100%). Shared by DEF/MDEF.
 */
const upDefPct = (attr: EnumStatusAttr): IAttrFn => (c, n) =>
{
	const f = STATUS_FIELD[attr];
	const cur = f.get(c);
	f.set(c, cur + Math.floor(takePercent(100 - cur, n)));
};

/**
 * 上限減益 + 夾制當前值：round(cap*(1-n/100))，並將當前 HP/SP 壓低至新上限（MAXHP/MAXSP 共用）。
 * Cap debuff + current clamp: round(cap*(1-n/100)), then lowers current HP/SP to the new cap (shared by MAXHP/MAXSP).
 * 減益本體直接重用通用 downAttr（不再與 downAttr 重複定義）。
 * The debuff body reuses the generic downAttr (no longer a separate duplicate of downAttr).
 */
const downCapClamp = (attr: EnumStatusAttr): IAttrFn => (c, n) =>
{
	downAttr(attr)(c, n);
	const vital = CAP_VITAL[attr];
	if (vital === undefined) return;
	const cap = STATUS_FIELD[attr].get(c);
	const cur = VITAL_FIELD[vital].get(c);
	if (cur > cap) VITAL_FIELD[vital].set(c, cap);
};

/**
 * 狀態屬性項目工廠 / Status attribute entry factory
 *
 * 欄位讀寫由 STATUS_FIELD[attr] 單一取得（get/set 只在 STATUS_FIELD 定義一次）；當 opts.plus
 * 為 true 時，內部以同一 attr 產生 plusAttr，杜絕 get/set lambda 重覆。up/down 缺省時由
 * buildStatusMaps 回退至通用 upAttr/downAttr(attr)。
 * Field read/write is drawn from STATUS_FIELD[attr] (get/set defined exactly once there); when
 * opts.plus is true the same attr builds plusAttr, so no get/set lambda is duplicated. Missing
 * up/down fall back to upAttr/downAttr(attr) in buildStatusMaps.
 */
function _makeAttr(
	attr: EnumStatusAttr,
	opts?: { up?: IAttrFn; down?: IAttrFn; plus?: boolean },
): IStatusAttrEntry
{
	const f = STATUS_FIELD[attr];
	return {
		get: f.get,
		set: f.set,
		up: opts?.up,
		down: opts?.down,
		plus: opts?.plus ? plusAttr(attr) : undefined,
	};
}

/**
 * 狀態屬性對照表 / Status attribute lookup table
 *
 * 鍵為 EnumStatusAttr；各屬性僅以 EnumStatusAttr 與演算法名稱描述，欄位槽位全部收斂至
 * STATUS_FIELD 單一定義（不再於 get/set 與演算法呼叫處重複書寫槽位）。DEF/MDEF 的 up/down
 * 採百分比累計，與其他屬性不同，故自定演算法。
 * Keyed by EnumStatusAttr; each attribute is described only by its EnumStatusAttr and algorithm name,
 * with every field/slot collapsed into the single STATUS_FIELD definition (slots are no longer written
 * again at the get/set and algorithm-call sites). DEF/MDEF use custom %-based up/down, hence their own algorithms.
 */
export const STATUS_ATTR_TABLE: Record<EnumStatusAttr, IStatusAttrEntry> = {
	/**
	 * 六維：僅有 plus（無自定 up/down，回退通用 upAttr/downAttr）/ base six: plus only (fall back to generic up/down)
	 */
	[EnumStatusAttr.STR]: _makeAttr(EnumStatusAttr.STR, { plus: true }),
	[EnumStatusAttr.INT]: _makeAttr(EnumStatusAttr.INT, { plus: true }),
	[EnumStatusAttr.DEX]: _makeAttr(EnumStatusAttr.DEX, { plus: true }),
	[EnumStatusAttr.SPD]: _makeAttr(EnumStatusAttr.SPD, { plus: true }),
	[EnumStatusAttr.LUK]: _makeAttr(EnumStatusAttr.LUK, { plus: true }),
	/**
	 * ATK/MATK 增益無 MAX_STATUS_MAXIMUM 上限（對齊原始 UpATK/UpMATK）/ uncapped buff (mirrors UpATK/UpMATK)
	 */
	[EnumStatusAttr.ATK]: _makeAttr(EnumStatusAttr.ATK, { up: upNoCap(EnumStatusAttr.ATK) }),
	[EnumStatusAttr.MATK]: _makeAttr(EnumStatusAttr.MATK, { up: upNoCap(EnumStatusAttr.MATK) }),
	/**
	 * DEF/MDEF 採百分比累計 up/down（對齊原始 UpDEF/DownDEF）/ %-based up/down (mirrors UpDEF/DownDEF)
	 */
	[EnumStatusAttr.DEF]: _makeAttr(EnumStatusAttr.DEF, {
		up: upDefPct(EnumStatusAttr.DEF),
		down: downAttr(EnumStatusAttr.DEF),
	}),
	[EnumStatusAttr.MDEF]: _makeAttr(EnumStatusAttr.MDEF, {
		up: upDefPct(EnumStatusAttr.MDEF),
		down: downAttr(EnumStatusAttr.MDEF),
	}),
	/**
	 * MAXHP/MAXSP：無上限增益；減益夾制當前 HP/SP（對齊原始 UpMAXHP/DownMAXHP）/ uncapped buff; debuff clamps current HP/SP
	 */
	[EnumStatusAttr.MAXHP]: _makeAttr(EnumStatusAttr.MAXHP, {
		up: upNoCap(EnumStatusAttr.MAXHP),
		down: downCapClamp(EnumStatusAttr.MAXHP),
		plus: true,
	}),
	[EnumStatusAttr.MAXSP]: _makeAttr(EnumStatusAttr.MAXSP, {
		up: upNoCap(EnumStatusAttr.MAXSP),
		down: downCapClamp(EnumStatusAttr.MAXSP),
		plus: true,
	}),
};

/**
 * Plus* 鍵陣列：只有「有登錄 plus 語意」的屬性（六維＋MAXHP/MAXSP）才存在，
 * 故先過濾屬性清單，再同樣由 _buildStatRecord 一併產生（型別 IStatusPlusKey[]）。
 * Plus* key array: only attributes with a registered plus semantics (six base + MAXHP/MAXSP) have it,
 * so filter the attribute list first, then let _buildStatRecord produce it (typed IStatusPlusKey[]).
 */
export const {
	attrs: STATUS_PLUS_KEYS,
} = _buildStatRecord(EnumStatusPrefix.Plus, STATUS_ATTR_KEYS.filter((k) => STATUS_ATTR_TABLE[k].plus !== undefined));

/**
 * 由對照表衍生 Up* / Down* / Plus* 操作對照 / Derived op maps
 *
 * 使用 STATUS_UP_KEY_NAME / STATUS_DOWN_KEY_NAME / STATUS_PLUS_KEY_NAME 靜態對照表
 * 取得鍵名，杜絕 'Up'+key 字串聯合；up/down 缺省時回退至通用 upAttr/downAttr；
 * plus 僅在有登錄時才建立 Plus* 鍵（Plus 只對六維與 MAXHP/MAXSP 存在）。
 * 對照表鍵型為精確樣板字面（IStatusUpKey 等），不再以 string 寬化。
 * Uses static lookup tables instead of 'Up'+key concatenation;
 * missing up/down fall back to generic upAttr/downAttr;
 * Plus* keys created only where plus is registered. The map keys are precise template literals
 * (IStatusUpKey, ...) instead of being widened to string.
 */
function buildStatusMaps(): {
	UPMAP: Record<IStatusUpKey, IAttrFn>;
	DOWNMAP: Record<IStatusDownKey, IAttrFn>;
	/** Plus* 僅部分屬性有登錄，故為 Partial / Plus* exists for a subset, hence Partial */
	PLUSMAP: Partial<Record<IStatusPlusKey, IAttrFn>>;
}
{
	const UPMAP = {} as Record<IStatusUpKey, IAttrFn>;
	const DOWNMAP = {} as Record<IStatusDownKey, IAttrFn>;
	const PLUSMAP = {} as Partial<Record<IStatusPlusKey, IAttrFn>>;
	for (const key of Object.keys(STATUS_ATTR_TABLE) as EnumStatusAttr[])
	{
		const e = STATUS_ATTR_TABLE[key];
		/**
		 * 使用 STATUS_UP_KEY_NAME 靜態對照表取代 'Up' + key 字串聯合
		 */
		UPMAP[STATUS_UP_KEY_NAME[key]] = e.up ?? upAttr(key);
		/**
		 * 使用 STATUS_DOWN_KEY_NAME 靜態對照表取代 'Down' + key 字串聯合
		 */
		DOWNMAP[STATUS_DOWN_KEY_NAME[key]] = e.down ?? downAttr(key);
		if (e.plus) PLUSMAP[STATUS_PLUS_KEY_NAME[key]] = e.plus;
	}
	return { UPMAP, DOWNMAP, PLUSMAP };
}

/**
 * 增益操作對照 / Up operation map (UpSTR, UpINT, ...)
 * 型別別名 / type alias
 */
export const { UPMAP, DOWNMAP, PLUSMAP } = buildStatusMaps();

// ============================================================================
/**
 * 基礎六維與補正欄位 / Primary base stats & compensation fields
 * 以下所有匯出皆由 EnumStatusAttr 與 EnumCompPrefix 衍生，杜絕散落的原始字串。
 * Every export below is derived from EnumStatusAttr and EnumCompPrefix, eliminating
 * scattered raw strings (no second copy of the P_* /M_* names anywhere).
 */
// ============================================================================

/**
 * 基礎六維對照 / Primary stat mapping
 * 小寫基礎欄位名 ↔ EnumStatusAttr 戰鬥欄位。PRIMARY_STATS 與 BASE_STAT_COMP_MAP 皆自此衍生，
 * 與 EnumStatusAttr 保持型別追溯，不再以獨立字串陣列重複列舉六維。
 * Lowercase base field name ↔ EnumStatusAttr battle field. PRIMARY_STATS and BASE_STAT_COMP_MAP
 * both derive from this, staying type-traceable to EnumStatusAttr (no duplicated string array).
 */
export const PRIMARY_STAT_MAP = {
	str: EnumStatusAttr.STR,
	int: EnumStatusAttr.INT,
	dex: EnumStatusAttr.DEX,
	spd: EnumStatusAttr.SPD,
	luk: EnumStatusAttr.LUK,
} as const;

/**
 * 基礎六維（建立/等級/戰鬥變數共用）/ Primary base stats (shared by factory, level-fix, battle-variable)
 * 由 PRIMARY_STAT_MAP 鍵衍生，與 EnumStatusAttr 保持型別追溯。
 * Derived from PRIMARY_STAT_MAP keys, type-traceable to EnumStatusAttr.
 */
export const PRIMARY_STATS = Object.keys(PRIMARY_STAT_MAP) as IPrimaryStat[];

/**
 * 補正欄位設定 / Compensation attribute config
 * 每個補正前綴對應其套用的 EnumStatusAttr 清單；COMP_FIELDS 自此衍生。
 * Each comp prefix maps to the EnumStatusAttr list it applies to; COMP_FIELDS derives from this.
 * MAXHP/MAXSP 同時擁有 P_（定值）與 M_（百分比）兩種補正，故分別列入兩個清單。
 * MAXHP/MAXSP carry both P_ (flat) and M_ (percent) comps, hence appear in both lists.
 */
export const COMP_FLAT_ATTRS = [
	EnumStatusAttr.STR, EnumStatusAttr.INT, EnumStatusAttr.DEX,
	EnumStatusAttr.SPD, EnumStatusAttr.LUK, EnumStatusAttr.MAXHP, EnumStatusAttr.MAXSP,
] as const;
export const COMP_PERCENT_ATTRS = [EnumStatusAttr.MAXHP, EnumStatusAttr.MAXSP] as const;

/**
 * 補正欄位（技能/道具共用）/ Compensation fields (shared by passive & equip)
 * 由 COMP_FLAT_ATTRS / COMP_PERCENT_ATTRS 與 EnumCompPrefix 衍生；P_* / M_* 屬性名稱直接引用 EnumStatusAttr，
 * 且 ICompField 精確對應實際出現的欄位。執行期值經 `as readonly ICompField[]` 收斂為精確子集型別
 * （字串 enum 在樣板字面中會加寬為 string，故於型別層級以精確聯集收斂）。
 * Derived from COMP_FLAT_ATTRS / COMP_PERCENT_ATTRS and EnumCompPrefix; P_* / M_* attribute names reference
 * EnumStatusAttr directly and ICompField precisely mirrors the real fields. The runtime values are narrowed
 * to the precise subset via `as readonly ICompField[]` (string enums widen to string in templates, so we
 * converge at the type level with the exact union).
 */
export const COMP_FIELDS = Object.freeze([
	...COMP_FLAT_ATTRS.map((a) => `${EnumCompPrefix.Flat}${a}`),
	...COMP_PERCENT_ATTRS.map((a) => `${EnumCompPrefix.Percent}${a}`),
]) as readonly ICompField[];

/**
 * 基礎屬性 → 戰鬥屬性 + 補正欄位 對照 / Base stat to battle/compensation mapping
 * 由 PRIMARY_STAT_MAP 與 EnumCompPrefix.Flat 衍生；comp 採精確樣板字面型別（非 string 寬化），
 * 保留型別安全（battle 為 EnumStatusAttr、comp 為 `P_${EnumStatusAttr}`）。
 * Derived from PRIMARY_STAT_MAP and EnumCompPrefix.Flat; comp uses a precise template-literal type
 * (not a widened string) to preserve type safety (battle: EnumStatusAttr; comp: `P_${EnumStatusAttr}`).
 */
export const BASE_STAT_COMP_MAP = Object.freeze(
	Object.fromEntries(
		(Object.keys(PRIMARY_STAT_MAP) as IPrimaryStat[]).map((s) => [
			s,
			{
				battle: PRIMARY_STAT_MAP[s],
				comp: `${EnumCompPrefix.Flat}${PRIMARY_STAT_MAP[s]}` as `${EnumCompPrefix.Flat}${EnumStatusAttr}`,
			},
		]),
	) as Record<IPrimaryStat, IBaseStatComp>,
);
