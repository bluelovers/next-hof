/**
 * 技能擴充數值鍵 / Skill extra numeric keys
 *
 * Up*／Down*／Plus* 鍵全部由 status-attrs 的 `STATUS_UP_KEYS`／`STATUS_DOWN_KEYS`／
 * `STATUS_PLUS_KEYS` 衍生（引擎狀態屬性的正式拼法；Plus 僅六維＋MAXHP/MAXSP 有登錄），
 * 避免同一組鍵在 raw 型別、讀取正規化與轉換器三處重複宣告。
 * All Up*／Down*／Plus* keys derive from `STATUS_UP_KEYS`／`STATUS_DOWN_KEYS`／`STATUS_PLUS_KEYS`
 * in the engine's status-attrs (canonical spellings; Plus exists only for the six base stats
 * plus MAXHP/MAXSP), so the raw types, the load-time normalization and the converters never
 * declare the key set three times.
 */

import { STATUS_UP_KEYS, STATUS_DOWN_KEYS, STATUS_PLUS_KEYS } from '#/lib/game/character/status-attrs';

/** Up*／Down*／Plus* 全部擴充數值鍵 / all extra numeric keys (Up*, Down*, Plus*) */
export const SKILL_EXTRA_NUMERIC_KEYS = [
	...STATUS_PLUS_KEYS,
	...STATUS_UP_KEYS,
	...STATUS_DOWN_KEYS,
] as const;