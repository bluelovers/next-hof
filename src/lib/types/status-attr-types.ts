/**
 * 狀態屬性型別 / Status attribute types
 *
 * 鍵名由 prefix-enum + status-enum 以樣板字面靜態衍生，呼叫處不再以字串聯合重寫。
 * Keys are derived as template literals from prefix-enum + status-enum, so call sites never
 * rebuild them via string concatenation.
 */

import type { Character } from '#/lib/game/character/Character';
import { COMP_FLAT_ATTRS, COMP_PERCENT_ATTRS, PRIMARY_STAT_MAP } from '#/lib/game/character/status-attrs';
import { EnumCompPrefix, EnumStatusPrefix } from './prefix-enum';
import type { EnumStatusAttr } from './status-enum';

/**
 * 屬性函式 / Attribute function
 *
 * 接收角色與數值 n（% 或點數，依公式而定），直接對角色套用變化。
 * Receives the character and a number n (% or flat, depending on the formula)
 * and mutates the character in place.
 */
export type IAttrFn = (c: Character, n: number) => void;

/**
 * 狀態屬性項目 / Status attribute entry
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
 * 狀態操作鍵 / Status operation keys
 * 由 EnumStatusPrefix + EnumStatusAttr 衍生，UPMAP / DOWNMAP / PLUSMAP 與技能 Up* / Down*
 * 欄位共用同一組鍵型，`Up${EnumStatusAttr}` 樣板字面只在本檔書寫一次。
 * Derived from EnumStatusPrefix + EnumStatusAttr; shared by UPMAP / DOWNMAP / PLUSMAP and the
 * skill Up* / Down* fields, so the `Up${EnumStatusAttr}` template literal appears once.
 */
export type IStatusUpKey = `${EnumStatusPrefix.Up}${EnumStatusAttr}`;
export type IStatusDownKey = `${EnumStatusPrefix.Down}${EnumStatusAttr}`;
export type IStatusPlusKey = `${EnumStatusPrefix.Plus}${EnumStatusAttr}`;

/**
 * 補正欄位型別 / Compensation field type（精確子集，非全 EnumStatusAttr / exact subset, not the full EnumStatusAttr）
 * 由 COMP_FLAT_ATTRS / COMP_PERCENT_ATTRS 的實際成員衍生，故 ICompField 只包含實際出現的欄位
 * （不含 P_ATK / P_DEF 等不存在的組合）；前綴值來自 EnumCompPrefix。
 * Derived from the actual members of COMP_FLAT_ATTRS / COMP_PERCENT_ATTRS, so ICompField holds only
 * the real fields (no impossible combos like P_ATK / P_DEF); prefix values come from EnumCompPrefix.
 */
export type ICompField =
	| `${EnumCompPrefix.Flat}${typeof COMP_FLAT_ATTRS[number]}`
	| `${EnumCompPrefix.Percent}${typeof COMP_PERCENT_ATTRS[number]}`;

/**
 * 基礎六維型別 / Primary base stat type
 * 型別別名 / type alias（由 status-attrs 的 PRIMARY_STAT_MAP 衍生 / derived from PRIMARY_STAT_MAP）
 */
export type IPrimaryStat = keyof typeof PRIMARY_STAT_MAP;

/**
 * 基礎屬性 → 戰鬥屬性 + 補正欄位 對照 / Base stat to battle/compensation mapping
 */
export interface IBaseStatComp
{
	/** 對應的戰鬥屬性（EnumStatusAttr）/ corresponding battle attribute (EnumStatusAttr) */
	battle: EnumStatusAttr;
	/** 補正欄位名（如 'P_STR'）/ compensation field name (e.g., 'P_STR') */
	comp: `${EnumCompPrefix.Flat}${EnumStatusAttr}`;
}
