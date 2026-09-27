// 狀態屬性鍵名單一事實來源 / Single source of truth for status attribute key names
// 所有狀態屬性相關的字串鍵名（Up*/Down*/Plus*/P_*）皆由此靜態對照產生，
// 杜绝在各處使用字串聯合('Up'+key, 'P_'+name)產生鍵名。
// All status attribute string keys (Up*/Down*/Plus*/P_*) are derived from static lookups,
// eliminating string concatenation ('Up'+key, 'P_'+name) for key generation.

import { EnumStatusAttr } from './status-enum';
import { ITSTemplateLiteralAllowedType, ITSStringLiteralPrefixed, ITSStringLiteralPrefixedRecord } from 'ts-type';

export enum EnumStatusPrefix
{
	/** 增益前綴 / Up prefix */
	Up = 'Up',
	/** 減益前綴 / Down prefix */
	Down = 'Down',
	/** 永久加成前綴 / Plus prefix */
	Plus = 'Plus',
	/** 補正欄位前綴 / Compensation field prefix */
	Comp = 'P_',
}

function _buildStatRecord<Name extends string, Prefix extends ITSTemplateLiteralAllowedType>(prefix: Prefix, names: Name[])
{
	const attrs: ITSStringLiteralPrefixed<K, Prefix>[] = [];
	const record: ITSStringLiteralPrefixedRecord<Name, Prefix> = {} as any;
	for (const name of names) {
		const attr = `${prefix}${name}` as const;
		attrs.push(attr);
		record[name] = attr;
	}
	return {
		record,
		attrs,
	};
}

const STATUS_LIST = Object.values(EnumStatusAttr);

export const {
	/**
	 * 狀態屬性的 Up 鍵名對照 / Status attribute Up key name mapping
	 * 鍵為 EnumStatusAttr；由 STATUS_UP_PREFIX 靜態對照產生，非動態字串聯合。
	 * Keyed by EnumStatusAttr; derived statically from STATUS_UP_PREFIX, not via string concatenation.
	 */
	record: STATUS_UP_KEY_NAME,
	/**
	* 從 STATUS_ATTR_KEYS 衍生 Up 鍵名陣列 / Up key names array derived from STATUS_ATTR_KEYS
	 */
	attrs: STATUS_UP_KEYS,
} = _buildStatRecord(EnumStatusPrefix.Up, STATUS_LIST);


export const {
	/**
	 * 狀態屬性的 Down 鍵名對照 / Status attribute Down key name mapping
	 * 鍵為 EnumStatusAttr。/ Keyed by EnumStatusAttr.
	 */
	record: STATUS_DOWN_KEY_NAME,
	/**
	 * 從 STATUS_ATTR_KEYS 衍生 Down 鍵名陣列 / Down key names array derived from STATUS_ATTR_KEYS
	 */
	attrs: STATUS_DOWN_KEYS,
} = _buildStatRecord(EnumStatusPrefix.Down, STATUS_LIST);

export const {
	/**
	 * 狀態屬性的 Plus 鍵名對照 / Status attribute Plus key name mapping
	 * 鍵為 EnumStatusAttr。/ Keyed by EnumStatusAttr.
	 */
	record: STATUS_PLUS_KEY_NAME,
	/**
	 * 從 STATUS_ATTR_KEYS 衍生 Plus 鍵名陣列 / Plus key names array derived from STATUS_ATTR_KEYS
	 */
	attrs: STATUS_PLUS_KEYS,
} = _buildStatRecord(EnumStatusPrefix.Plus, STATUS_LIST);

/**
 * 基礎屬性 → 補正欄位名稱對照 / Base stat to compensation field name mapping
 * 由 PRIMARY_STATS 靜態對照產生，非動態 'P_' + name 字串聯合。
 */
export const BASE_STAT_COMP_NAMES = {
	str: { battle: EnumStatusAttr.STR, comp: `${EnumStatusPrefix.Comp}${EnumStatusAttr.STR}` },
	int: { battle: EnumStatusAttr.INT, comp: `${EnumStatusPrefix.Comp}${EnumStatusAttr.INT}` },
	dex: { battle: EnumStatusAttr.DEX, comp: `${EnumStatusPrefix.Comp}${EnumStatusAttr.DEX}` },
	spd: { battle: EnumStatusAttr.SPD, comp: `${EnumStatusPrefix.Comp}${EnumStatusAttr.SPD}` },
	luk: { battle: EnumStatusAttr.LUK, comp: `${EnumStatusPrefix.Comp}${EnumStatusAttr.LUK}` },
} as const;

/**
 * 取得 Up 鍵名 / Get Up key name
 * @param key 狀態屬性鍵 / status attribute key
 * @returns 對應的 Up 鍵名 / corresponding Up key name
 */
export function getUpKey(key: EnumStatusAttr)
{
	return STATUS_UP_KEY_NAME[key] ?? `${EnumStatusPrefix.Up}${key}`;
}

/**
 * 取得 Down 鍵名 / Get Down key name
 */
export function getDownKey(key: EnumStatusAttr)
{
	return STATUS_DOWN_KEY_NAME[key] ?? `${EnumStatusPrefix.Down}${key}`;
}

/**
 * 取得 Plus 鍵名 / Get Plus key name
 */
export function getPlusKey(key: EnumStatusAttr)
{
	return STATUS_PLUS_KEY_NAME[key] ?? `${EnumStatusPrefix.Plus}${key}`;
}

/**
 * 取得補正欄位名稱 / Get compensation field name
 * @param key 基礎屬性鍵 / base stat key
 * @returns 補正欄位名稱（如 'P_STR'）/ compensation field name (e.g., 'P_STR')
 */
export function getCompFieldName(key: keyof typeof BASE_STAT_COMP_NAMES)
{
	return BASE_STAT_COMP_NAMES[key]?.comp ?? `${EnumStatusPrefix.Comp}${key.toUpperCase()}`;
}
