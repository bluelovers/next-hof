// 狀態屬性鍵名單一事實來源 / Single source of truth for status attribute key names
// 所有狀態屬性相關的字串鍵名（Up*/Down*/Plus*/P_*）皆由此靜態對照產生，
// 杜绝在各處使用字串聯合('Up'+key, 'P_'+name)產生鍵名。
// All status attribute string keys (Up*/Down*/Plus*/P_*) are derived from static lookups,
// eliminating string concatenation ('Up'+key, 'P_'+name) for key generation.

/** 增益前綴 / Up prefix */
export const STATUS_UP_PREFIX = 'Up' as const;
/** 減益前綴 / Down prefix */
export const STATUS_DOWN_PREFIX = 'Down' as const;
/** 永久加成前綴 / Plus prefix */
export const STATUS_PLUS_PREFIX = 'Plus' as const;
/** 補正欄位前綴 / Compensation field prefix */
export const COMP_PREFIX = 'P_' as const;

/**
 * 狀態屬性的 Up 鍵名對照 / Status attribute Up key name mapping
 * 由 STATUS_ATTR_KEYS 與 STATUS_UP_PREFIX 靜態對照產生，非動態字串聯合。
 */
export const STATUS_UP_KEY_NAME: Record<string, string> = {
	STR: 'UpSTR',
	INT: 'UpINT',
	DEX: 'UpDEX',
	SPD: 'UpSPD',
	LUK: 'UpLUK',
	ATK: 'UpATK',
	MATK: 'UpMATK',
	DEF: 'UpDEF',
	MDEF: 'UpMDEF',
	MAXHP: 'UpMAXHP',
	MAXSP: 'UpMAXSP',
} as const;

/**
 * 狀態屬性的 Down 鍵名對照 / Status attribute Down key name mapping
 */
export const STATUS_DOWN_KEY_NAME: Record<string, string> = {
	STR: 'DownSTR',
	INT: 'DownINT',
	DEX: 'DownDEX',
	SPD: 'DownSPD',
	LUK: 'DownLUK',
	ATK: 'DownATK',
	MATK: 'DownMATK',
	DEF: 'DownDEF',
	MDEF: 'DownMDEF',
	MAXHP: 'DownMAXHP',
	MAXSP: 'DownMAXSP',
} as const;

/**
 * 狀態屬性的 Plus 鍵名對照 / Status attribute Plus key name mapping
 */
export const STATUS_PLUS_KEY_NAME: Record<string, string> = {
	STR: 'PlusSTR',
	INT: 'PlusINT',
	DEX: 'PlusDEX',
	SPD: 'PlusSPD',
	LUK: 'PlusLUK',
	ATK: 'PlusATK',
	MATK: 'PlusMATK',
	DEF: 'PlusDEF',
	MDEF: 'PlusMDEF',
	MAXHP: 'PlusMAXHP',
	MAXSP: 'PlusMAXSP',
} as const;

/**
 * 基礎屬性 → 補正欄位名稱對照 / Base stat to compensation field name mapping
 * 由 PRIMARY_STATS 靜態對照產生，非動態 'P_' + name 字串聯合。
 */
export const BASE_STAT_COMP_NAMES: Record<string, { battle: string; comp: string }> = {
	str: { battle: 'STR', comp: 'P_STR' },
	int: { battle: 'INT', comp: 'P_INT' },
	dex: { battle: 'DEX', comp: 'P_DEX' },
	spd: { battle: 'SPD', comp: 'P_SPD' },
	luk: { battle: 'LUK', comp: 'P_LUK' },
} as const;

/**
 * 從 STATUS_ATTR_KEYS 衍生 Up 鍵名陣列 / Up key names array derived from STATUS_ATTR_KEYS
 */
export const STATUS_UP_KEYS = Object.values(STATUS_UP_KEY_NAME) as string[];

/**
 * 從 STATUS_ATTR_KEYS 衍生 Down 鍵名陣列 / Down key names array derived from STATUS_ATTR_KEYS
 */
export const STATUS_DOWN_KEYS = Object.values(STATUS_DOWN_KEY_NAME) as string[];

/**
 * 從 STATUS_ATTR_KEYS 衍生 Plus 鍵名陣列 / Plus key names array derived from STATUS_ATTR_KEYS
 */
export const STATUS_PLUS_KEYS = Object.values(STATUS_PLUS_KEY_NAME) as string[];

/**
 * 取得 Up 鍵名 / Get Up key name
 * @param key 狀態屬性鍵 / status attribute key
 * @returns 對應的 Up 鍵名 / corresponding Up key name
 */
export function getUpKey(key: string): string {
	return STATUS_UP_KEY_NAME[key as keyof typeof STATUS_UP_KEY_NAME] ?? `${STATUS_UP_PREFIX}${key}`;
}

/**
 * 取得 Down 鍵名 / Get Down key name
 */
export function getDownKey(key: string): string {
	return STATUS_DOWN_KEY_NAME[key as keyof typeof STATUS_DOWN_KEY_NAME] ?? `${STATUS_DOWN_PREFIX}${key}`;
}

/**
 * 取得 Plus 鍵名 / Get Plus key name
 */
export function getPlusKey(key: string): string {
	return STATUS_PLUS_KEY_NAME[key as keyof typeof STATUS_PLUS_KEY_NAME] ?? `${STATUS_PLUS_PREFIX}${key}`;
}

/**
 * 取得補正欄位名稱 / Get compensation field name
 * @param key 基礎屬性鍵 / base stat key
 * @returns 補正欄位名稱（如 'P_STR'）/ compensation field name (e.g., 'P_STR')
 */
export function getCompFieldName(key: string): string {
	return BASE_STAT_COMP_NAMES[key as keyof typeof BASE_STAT_COMP_NAMES]?.comp ?? `${COMP_PREFIX}${key.toUpperCase()}`;
}
