/**
 * 技能擴充數值鍵（單一事實來源）/ Skill extra numeric keys (single source of truth)
 *
 * Up*／Down*／Plus* 鍵全部由 status-attrs 的 `STATUS_UP_KEYS`／`STATUS_DOWN_KEYS`／
 * `STATUS_PLUS_KEYS` 衍生（引擎狀態屬性的正式拼法；Plus 僅六維＋MAXHP/MAXSP 有登錄）。
 * 供 raw 型別（yaml-types）、讀取正規化（yaml-load）與轉換器（yaml-convert）共用，
 * 避免同一組鍵在多個檔案重覆宣告或手寫。
 *
 * All Up*／Down*／Plus* keys derive from `STATUS_UP_KEYS`／`STATUS_DOWN_KEYS`／`STATUS_PLUS_KEYS`
 * in the engine's status-attrs (canonical spellings; Plus exists only for the six base stats
 * plus MAXHP/MAXSP). Shared by the raw types (yaml-types), the load-time normalization
 * (yaml-load) and the converters (yaml-convert) so the key set is declared once.
 *
 * `as const` 保留字面聯集（29 鍵），type 層級可精確索引（用於 raw 型別的 mapped record）。
 * `as const` keeps the literal union (29 keys) for precise type-level indexing.
 */

import { STATUS_UP_KEYS, STATUS_DOWN_KEYS, STATUS_PLUS_KEYS } from '#/lib/game/character/status-attrs';

/** Up*／Down*／Plus* 全部擴充數值鍵 / all extra numeric keys (Up*, Down*, Plus*) */
export const SKILL_EXTRA_NUMERIC_KEYS = [
	...STATUS_PLUS_KEYS,
	...STATUS_UP_KEYS,
	...STATUS_DOWN_KEYS,
] as const;