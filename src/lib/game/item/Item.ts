// 物品定義 / Item definition helpers
// 對應 docs/data/item.md。倉庫回傳的即為 IItemDef（YAML 結構），此處提供正規化與取值。

import type { IItemDef, EnumWeaponType } from '../types';
import type { IDataRepository } from '../data/repository';


/**
 * 原始道具資料 / Raw item data
 * 型別別名 / type alias
 *
 * 必填欄位（no/name/type）+ 其餘 IItemDef 欄位皆可缺省。
 * Required fields (no/name/type) plus optional remaining IItemDef fields.
 */
type IRawItem = Partial<IItemDef> & { no: number; name: string; type: EnumWeaponType };

/**
 * 正規化原始物品資料，補齊陣列預設值
 * Normalize raw item data, filling in array defaults
 */
export function parseItem(raw: IRawItem): IItemDef {
	return {
		...raw,
		atk: raw.atk ?? [0, 0],
		def: raw.def ?? [0, 0, 0, 0],
		dh: raw.dh ?? false,
		handle: raw.handle ?? 0,
		need: raw.need ?? {},
		type2: raw.type2 ?? 'ITEM',
		P_MAXHP: raw.P_MAXHP ?? 0,
		P_MAXSP: raw.P_MAXSP ?? 0,
		M_MAXHP: raw.M_MAXHP ?? 0,
		M_MAXSP: raw.M_MAXSP ?? 0,
		P_STR: raw.P_STR ?? 0,
		P_INT: raw.P_INT ?? 0,
		P_DEX: raw.P_DEX ?? 0,
		P_SPD: raw.P_SPD ?? 0,
		P_LUK: raw.P_LUK ?? 0,
	};
}

/**
 * 依編號取得道具（倉庫無此筆回傳 undefined）/ fetch an item by number (undefined when absent)
 */
export function getItem(no: number, repo: IDataRepository): IItemDef | undefined {
	const d = repo.getItem(no);
	return d ? parseItem(d) : undefined;
}
