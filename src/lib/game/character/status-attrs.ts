// 狀態屬性單一事實來源 / Single source of truth for status attributes
// 整合原 status-key.ts（鍵名衍生）與 status-attrs.ts（屬性對照表）：
// 兩者高度耦合（status-attrs 使用 status-key 的鍵名對照表建構 UPMAP/DOWNMAP/PLUSMAP），
// 合併為單一模块後，狀態屬性的「鍵名」與「讀寫語意」不再分散維護。
// Integrates the former status-key.ts (key-name derivation) and status-attrs.ts
// (attribute table): the two were tightly coupled (status-attrs built UPMAP/DOWNMAP/PLUSMAP
// from status-key's key-name lookups), so merging them into one module keeps every status
// attribute's "key name" and "read/write semantics" in a single place.
//
// 所有系統（技能 effect、被動 passive、裝備 equip、戰鬥變數 battle-variable、
// 工廠 factory、等級調整 level-fix）都從此處取得「屬性清單」與「屬性↔角色欄位對應」，
// 與「Up*/Down*/Plus*/P_* 鍵名對照」，避免在各模組重複列舉屬性名稱與 getter/setter。

import { MAX_STATUS_MAXIMUM } from '../constants';
import type { Character } from './Character';
import { EnumStatusAttr, EnumVital } from './status-enum';
import {
	ITSTemplateLiteralAllowedType,
	ITSStringLiteralPrefixed,
	ITSStringLiteralPrefixedRecord,
} from 'ts-type';

// ============================================================================
// 狀態屬性鍵名衍生 / Status attribute key-name derivation
// 由 EnumStatusPrefix + EnumStatusAttr 靜態對照產生 Up*/Down*/Plus* 鍵名，
// 杜絕在各處使用字串聯合（'Up'+key, 'P_'+name）產生鍵名。
// Static lookups from EnumStatusPrefix + EnumStatusAttr produce Up*/Down*/Plus* keys,
// eliminating string concatenation ('Up'+key, 'P_'+name) at call sites.
// ============================================================================

/**
 * 狀態操作前綴（單一事實來源）/ Status operation prefixes (single source of truth)
 * 僅用於由 EnumStatusAttr 衍生 Up* / Down* / Plus* 操作鍵名，與補正欄位前綴無關。
 * Used solely to derive Up* / Down* / Plus* op keys from EnumStatusAttr; unrelated to comp-field prefixes.
 */
export enum EnumStatusPrefix
{
	/** 增益前綴 / Up prefix */
	Up = 'Up',
	/** 減益前綴 / Down prefix */
	Down = 'Down',
	/** 永久加成前綴 / Plus prefix */
	Plus = 'Plus',
}

/**
 * 補正欄位前綴（單一事實來源）/ Compensation field prefixes (single source of truth)
 * P_ 為定值加成、M_ 為百分比加成；用途與狀態操作前綴（EnumStatusPrefix）不同，故獨立成 enum。
 * 取代原先散落在 COMP_FIELDS 的硬編碼 'M_' 字串，使補正前綴亦受 enum 單一來源約束。
 * P_ = flat add, M_ = percent scale; distinct from status-op prefixes (EnumStatusPrefix), hence a
 * separate enum. Replaces the previously hardcoded 'M_' literal in COMP_FIELDS so comp prefixes are
 * also governed by a single enum source.
 */
export enum EnumCompPrefix
{
	/** 定值加成前綴（P_*）/ flat-add prefix (P_*) */
	Flat = 'P_',
	/** 百分比加成前綴（M_*）/ percent-scale prefix (M_*) */
	Percent = 'M_',
}

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
 * 不在別處以 .map() 重複衍生（單一事實來源）。
 * Up* / Down* / Plus* key-name records and key arrays are all produced together by the single
 * _buildStatRecord function — nothing re-derives them via a separate .map() (single source of truth).
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
// 狀態屬性對照表 / Status attribute lookup table
// 鍵為 EnumStatusAttr；每個屬性描述其角色欄位讀寫與 up/down/plus 語意。
// DEF/MDEF 的 up/down 採百分比累計，與其他屬性不同，故自定。
// ============================================================================

/**
 * atk 陣列索引（物理/魔法）/ atk array indices (physical/magic)
 * 列舉 / enumeration
 */
export enum EnumAtkSlot
{
	/** 物理攻擊（atk[0]）/ physical attack (atk[0]) */
	Phys = 0,
	/** 魔法攻擊（atk[1]）/ magic attack (atk[1]) */
	Mag = 1,
}

/**
 * def 陣列索引（物理%, 物理-, 魔法%, 魔法-）/ def array indices
 * 列舉 / enumeration
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

/**
 * 屬性函式 / Attribute function
 * 型別別名 / type alias
 *
 * 接收角色與數值 n（% 或點數，依公式而定），直接對角色套用變化。
 * Receives the character and a number n (% or flat, depending on the formula)
 * and mutates the character in place.
 */
export type IAttrFn = (c: Character, n: number) => void;

/**
 * 狀態屬性項目 / Status attribute entry
 * 介面 / interface
 */
export interface IStatusAttrEntry
{
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

/**
 * 屬性欄位存取器（單一事實來源）/ Attribute field accessor (single source of truth)
 *
 * 每個 EnumStatusAttr 對應「角色身上的哪個欄位／槽位」只在此處定義一次；後續 get/set 與所有
 * 演算法皆由 STATUS_FIELD 查表取得，杜絕槽位在 get/set 與演算法呼叫處重複書寫（先前 ATK 的
 * EnumAtkSlot.Phys、DEF 的 EnumDefSlot.PhysPct 等同時出現在多處，違反單一事實來源）。
 * Each EnumStatusAttr maps to "which Character field/slot" exactly once here; every get/set and
 * algorithm later resolves it from STATUS_FIELD, so a slot is never written in multiple places
 * (previously e.g. EnumAtkSlot.Phys for ATK appeared in get/set AND the up-call, violating SSoT).
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
 * 欄位存取器工廠（單一事實來源）/ Field accessor factory (SSoT)
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

const _atkField = (slot: EnumAtkSlot): IStatusField => ({
	get: (c) => c.atk[slot],
	set: (c, v) => { c.atk[slot] = v; },
});

const _defField = (slot: EnumDefSlot): IStatusField => ({
	get: (c) => c.def[slot],
	set: (c, v) => { c.def[slot] = v; },
});

/**
 * 屬性↔欄位對照（單一事實來源）/ Attribute→field mapping (SSoT)
 * 鍵為 EnumStatusAttr；atk/def 經由 EnumAtkSlot / EnumDefSlot 列舉索引，不寫死數字或字串。
 * Keyed by EnumStatusAttr; atk/def indexed via the EnumAtkSlot / EnumDefSlot enums (no hardcoded numbers/strings).
 */
const STATUS_FIELD: Record<EnumStatusAttr, IStatusField> = {
	[EnumStatusAttr.STR]: _field(EnumStatusAttr.STR),
	[EnumStatusAttr.INT]: _field(EnumStatusAttr.INT),
	[EnumStatusAttr.DEX]: _field(EnumStatusAttr.DEX),
	[EnumStatusAttr.SPD]: _field(EnumStatusAttr.SPD),
	[EnumStatusAttr.LUK]: _field(EnumStatusAttr.LUK),
	[EnumStatusAttr.ATK]: _atkField(EnumAtkSlot.Phys),
	[EnumStatusAttr.MATK]: _atkField(EnumAtkSlot.Mag),
	[EnumStatusAttr.DEF]: _defField(EnumDefSlot.PhysPct),
	[EnumStatusAttr.MDEF]: _defField(EnumDefSlot.MagPct),
	[EnumStatusAttr.MAXHP]: _field(EnumStatusAttr.MAXHP),
	[EnumStatusAttr.MAXSP]: _field(EnumStatusAttr.MAXSP),
};

/**
 * 生命／精神當前值對照（單一事實來源）/ Current HP/SP vital mapping (SSoT)
 * 鍵為 EnumVital 列舉（取代原先 'HP' | 'SP' 字串聯合），與 STATUS_FIELD 同構。
 * Keyed by the EnumVital enum (replacing the previous 'HP' | 'SP' string union); same shape as STATUS_FIELD.
 */
const VITAL_FIELD: Record<EnumVital, IStatusField> = {
	[EnumVital.HP]: _field(EnumVital.HP),
	[EnumVital.SP]: _field(EnumVital.SP),
};

/**
 * 上限屬性↔當前值對照（單一事實來源）/ Cap attribute ↔ current vital mapping (SSoT)
 * 僅 MAXHP/MAXSP 有對應當前值；列舉對列舉（EnumStatusAttr → EnumVital），無字串聯合。
 * Only MAXHP/MAXSP have a current vital; enum-to-enum (EnumStatusAttr → EnumVital), no string union.
 */
const CAP_VITAL: Partial<Record<EnumStatusAttr, EnumVital>> = {
	[EnumStatusAttr.MAXHP]: EnumVital.HP,
	[EnumStatusAttr.MAXSP]: EnumVital.SP,
};

/** 增益縮放：round(orig*(1+n/100))（upAttr 與 upNoCap 共用，單一事實來源）/ Buff scale shared by upAttr & upNoCap (SSoT) */
const _scaleUp = (orig: number, n: number) => Math.round(orig * (1 + n / 100));

/**
 * 通用增益：round(orig*(1+n/100))，上限 orig*(MAX_STATUS_MAXIMUM/100)
 * Generic buff: round(orig*(1+n/100)), capped at orig*(MAX_STATUS_MAXIMUM/100)
 * 由 EnumStatusAttr 查 STATUS_FIELD 取得欄位（單一事實來源，取代原先 (get,set) 參數）。
 * Field resolved from STATUS_FIELD by EnumStatusAttr (SSoT; replaces the (get,set) parameters).
 */
const upAttr = (attr: EnumStatusAttr): IAttrFn => (c, n) =>
	{
		const f = STATUS_FIELD[attr];
		const orig = f.get(c);
		const cap = orig * (MAX_STATUS_MAXIMUM / 100);
		f.set(c, Math.min(_scaleUp(orig, n), cap));
	};

/**
 * 通用減益：round(orig*(1-n/100))
 * Generic debuff: round(orig*(1-n/100))
 */
const downAttr = (attr: EnumStatusAttr): IAttrFn => (c, n) =>
	{
		const f = STATUS_FIELD[attr];
		f.set(c, Math.round(f.get(c) * (1 - n / 100)));
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
 * 全部以 EnumStatusAttr 為參數，由 STATUS_FIELD 查表取得欄位（單一事實來源），
 * 不再以原始字串聯合（'MAXHP' | 'MAXSP'、'HP' | 'SP'）或槽位重複書寫。
 * Custom algorithms below: the special up/down formulas for ATK/MATK, DEF/MDEF, MAXHP/MAXSP.
 * All are parameterized by EnumStatusAttr and resolve the field via STATUS_FIELD (SSoT); no raw
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
		f.set(c, cur + Math.floor((100 - cur) * (n / 100)));
	};

/**
 * 上限減益 + 夾制當前值：round(cap*(1-n/100))，並將當前 HP/SP 壓低至新上限（MAXHP/MAXSP 共用）。
 * Cap debuff + current clamp: round(cap*(1-n/100)), then lowers current HP/SP to the new cap (shared by MAXHP/MAXSP).
 * 減益本體直接重用通用 downAttr（單一事實來源，不再與 downAttr 重複定義）。
 * The debuff body reuses the generic downAttr (SSoT; no longer a separate duplicate of downAttr).
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
 * 狀態屬性項目工廠（單一事實來源）/ Status attribute entry factory (single source of truth)
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
 * 狀態屬性對照表（單一事實來源）/ Status attribute lookup table (single source of truth)
 *
 * 鍵為 EnumStatusAttr；各屬性僅以 EnumStatusAttr 與演算法名稱描述，欄位槽位全部收斂至
 * STATUS_FIELD 單一定義（不再於 get/set 與演算法呼叫處重複書寫槽位）。DEF/MDEF 的 up/down
 * 採百分比累計，與其他屬性不同，故自定演算法。
 * Keyed by EnumStatusAttr; each attribute is described only by its EnumStatusAttr and algorithm name,
 * with every field/slot collapsed into the single STATUS_FIELD definition (slots are no longer written
 * again at the get/set and algorithm-call sites). DEF/MDEF use custom %-based up/down, hence their own algorithms.
 */
export const STATUS_ATTR_TABLE: Record<EnumStatusAttr, IStatusAttrEntry> = {
	// 六維：僅有 plus（無自定 up/down，回退通用 upAttr/downAttr）/ base six: plus only (fall back to generic up/down)
	[EnumStatusAttr.STR]: _makeAttr(EnumStatusAttr.STR, { plus: true }),
	[EnumStatusAttr.INT]: _makeAttr(EnumStatusAttr.INT, { plus: true }),
	[EnumStatusAttr.DEX]: _makeAttr(EnumStatusAttr.DEX, { plus: true }),
	[EnumStatusAttr.SPD]: _makeAttr(EnumStatusAttr.SPD, { plus: true }),
	[EnumStatusAttr.LUK]: _makeAttr(EnumStatusAttr.LUK, { plus: true }),
	// ATK/MATK 增益無 MAX_STATUS_MAXIMUM 上限（對齊原始 UpATK/UpMATK）/ uncapped buff (mirrors UpATK/UpMATK)
	[EnumStatusAttr.ATK]: _makeAttr(EnumStatusAttr.ATK, { up: upNoCap(EnumStatusAttr.ATK) }),
	[EnumStatusAttr.MATK]: _makeAttr(EnumStatusAttr.MATK, { up: upNoCap(EnumStatusAttr.MATK) }),
	// DEF/MDEF 採百分比累計 up/down（對齊原始 UpDEF/DownDEF）/ %-based up/down (mirrors UpDEF/DownDEF)
	[EnumStatusAttr.DEF]: _makeAttr(EnumStatusAttr.DEF, { up: upDefPct(EnumStatusAttr.DEF), down: downAttr(EnumStatusAttr.DEF) }),
	[EnumStatusAttr.MDEF]: _makeAttr(EnumStatusAttr.MDEF, { up: upDefPct(EnumStatusAttr.MDEF), down: downAttr(EnumStatusAttr.MDEF) }),
	// MAXHP/MAXSP：無上限增益；減益夾制當前 HP/SP（對齊原始 UpMAXHP/DownMAXHP）/ uncapped buff; debuff clamps current HP/SP
	[EnumStatusAttr.MAXHP]: _makeAttr(EnumStatusAttr.MAXHP, { up: upNoCap(EnumStatusAttr.MAXHP), down: downCapClamp(EnumStatusAttr.MAXHP), plus: true }),
	[EnumStatusAttr.MAXSP]: _makeAttr(EnumStatusAttr.MAXSP, { up: upNoCap(EnumStatusAttr.MAXSP), down: downCapClamp(EnumStatusAttr.MAXSP), plus: true }),
};

/**
 * 狀態操作鍵（單一事實來源）/ Status operation keys (single source of truth)
 * 由 EnumStatusPrefix + EnumStatusAttr 衍生；UPMAP / DOWNMAP / PLUSMAP 與 types.ts 的
 * ISkillUpFields / ISkillDownFields 共用，避免四處重寫 `Up${EnumStatusAttr}` 樣板字面。
 * Derived from EnumStatusPrefix + EnumStatusAttr; shared by UPMAP / DOWNMAP / PLUSMAP and types.ts's
 * ISkillUpFields / ISkillDownFields, so the `Up${EnumStatusAttr}` template literal is written once.
 */
export type IStatusUpKey = `${EnumStatusPrefix.Up}${EnumStatusAttr}`;
export type IStatusDownKey = `${EnumStatusPrefix.Down}${EnumStatusAttr}`;
export type IStatusPlusKey = `${EnumStatusPrefix.Plus}${EnumStatusAttr}`;

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
 * 由對照表衍生 Up* / Down* / Plus* 操作對照（單一事實來源衍生）/ Derived op maps
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
		// 使用 STATUS_UP_KEY_NAME 靜態對照表取代 'Up' + key 字串聯合
		UPMAP[STATUS_UP_KEY_NAME[key]] = e.up ?? upAttr(key);
		// 使用 STATUS_DOWN_KEY_NAME 靜態對照表取代 'Down' + key 字串聯合
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
// 基礎六維與補正欄位 / Primary base stats & compensation fields
// 以下所有匯出皆由 EnumStatusAttr 與 EnumCompPrefix 衍生，杜絕散落的原始字串。
// Every export below is derived from EnumStatusAttr and EnumCompPrefix, eliminating
// scattered raw strings (no second copy of the P_*/M_* names anywhere).
// ============================================================================

/**
 * 基礎六維對照（單一事實來源）/ Primary stat mapping (single source of truth)
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
 * 基礎六維型別 / Primary base stat type
 * 型別別名 / type alias（由 PRIMARY_STAT_MAP 衍生 / derived from PRIMARY_STAT_MAP）
 */
export type IPrimaryStat = keyof typeof PRIMARY_STAT_MAP;

/**
 * 基礎六維（建立/等級/戰鬥變數共用）/ Primary base stats (shared by factory, level-fix, battle-variable)
 * 由 PRIMARY_STAT_MAP 鍵衍生，與 EnumStatusAttr 保持型別追溯。
 * Derived from PRIMARY_STAT_MAP keys, type-traceable to EnumStatusAttr.
 */
export const PRIMARY_STATS = Object.keys(PRIMARY_STAT_MAP) as IPrimaryStat[];

/**
 * 補正欄位設定（單一事實來源）/ Compensation attribute config (single source of truth)
 * 每個補正前綴對應其套用的 EnumStatusAttr 清單；COMP_FIELDS 自此衍生。
 * Each comp prefix maps to the EnumStatusAttr list it applies to; COMP_FIELDS derives from this.
 * MAXHP/MAXSP 同時擁有 P_（定值）與 M_（百分比）兩種補正，故分別列入兩個清單。
 * MAXHP/MAXSP carry both P_ (flat) and M_ (percent) comps, hence appear in both lists.
 */
const COMP_FLAT_ATTRS = [
	EnumStatusAttr.STR, EnumStatusAttr.INT, EnumStatusAttr.DEX,
	EnumStatusAttr.SPD, EnumStatusAttr.LUK, EnumStatusAttr.MAXHP, EnumStatusAttr.MAXSP,
] as const;
const COMP_PERCENT_ATTRS = [EnumStatusAttr.MAXHP, EnumStatusAttr.MAXSP] as const;

/**
 * 補正欄位型別（精確子集，非全 EnumStatusAttr）/ Compensation field type (exact subset, not the full EnumStatusAttr)
 * 由 COMP_FLAT_ATTRS / COMP_PERCENT_ATTRS 的實際成員衍生，故 ICompField 只包含實際出現的欄位
 * （不含 P_ATK / P_DEF 等不存在的組合）；前綴值來自 EnumCompPrefix。
 * Derived from the actual members of COMP_FLAT_ATTRS / COMP_PERCENT_ATTRS, so ICompField holds only
 * the real fields (no impossible combos like P_ATK / P_DEF); prefix values come from EnumCompPrefix.
 */
export type ICompField =
	| `${EnumCompPrefix.Flat}${typeof COMP_FLAT_ATTRS[number]}`
	| `${EnumCompPrefix.Percent}${typeof COMP_PERCENT_ATTRS[number]}`;

/**
 * 補正欄位（技能/道具共用，單一事實來源）/ Compensation fields (shared by passive & equip)
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
export interface IBaseStatComp
{
	/** 對應的戰鬥屬性（EnumStatusAttr）/ corresponding battle attribute (EnumStatusAttr) */
	battle: EnumStatusAttr;
	/** 補正欄位名（如 'P_STR'）/ compensation field name (e.g., 'P_STR') */
	comp: `${EnumCompPrefix.Flat}${EnumStatusAttr}`;
}

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
