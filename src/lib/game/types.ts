/**
 * 共用型別定義轉送層 / Shared type definitions (facade)
 *
 * 型別定義已依域分類移至 #/lib/types/*：
 * - enum → *-enum.ts（如 prefix-enum.ts）
 * - 基底用型別 → base-types.ts；上級定義 → *-types.ts
 * - 原始 YAML 讀取型別 → #/lib/types/raw/
 * - 魔方陣欄位 → skill-magic-circle-fields.ts；Plus* 欄位 → skill-plus-fields.ts
 * Definitions are grouped under #/lib/types/*: enums live in *-enum.ts, base types in
 * base-types.ts, upper definitions in *-types.ts, raw YAML reading types in raw/, and the
 * magic-circle / Plus* field groups have their own files.
 *
 * 本檔僅保留既有匯入路徑（#/lib/game/types）的相容性，待使用端改為直接載入後即可移除。
 * This file only keeps the legacy import path (#/lib/game/types) working; it can be removed
 * once consumers import the source paths directly.
 */

import { EnumGuardKind } from '#/lib/types/battle-enum';

export * from '#/lib/types/base-types';
export * from '#/lib/types/battle-enum';
export * from '#/lib/types/battle-types';
export * from '#/lib/types/char-enum';
export * from '#/lib/types/char-types';
export * from '#/lib/types/data-ex-types';
export * from '#/lib/types/item-enum';
export * from '#/lib/types/item-types';
export * from '#/lib/types/job-types';
export * from '#/lib/types/mon-types';
export * from '#/lib/types/skill-enum';
export * from '#/lib/types/skill-magic-circle-fields';
export * from '#/lib/types/skill-plus-fields';
export * from '#/lib/types/skill-types';
export { EnumState } from './constants';

/**
 * 守護種類對應的機率值 / Guard kind probability values
 * Guard 機率百分比集中定義於此，杜絕 guard.ts 中的硬編碼數字。
 * Guard probability percentages centralized here, eliminating hardcoded numbers in guard.ts.
 * 僅 Prob25/Prob50/Prob75 有數值含義，Life 系列為 HP% 閾值，Always/Never 為恆真/恆假。
 */
export const GUARD_KIND_PROBABILITY: Record<EnumGuardKind, number | null> = {
	[EnumGuardKind.Always]: null,
	[EnumGuardKind.Never]: 0,
	[EnumGuardKind.Life25]: null,
	[EnumGuardKind.Life50]: null,
	[EnumGuardKind.Life75]: null,
	[EnumGuardKind.Prob25]: 25,
	[EnumGuardKind.Prob50]: 50,
	[EnumGuardKind.Prob75]: 75,
} as const;

/**
 * 守護種類對應的 HP% 閾值 / Guard kind HP% thresholds
 * Life 系列守護的 HP% 門檻集中定義於此，杜絕 guard.ts 中的硬編碼數字。
 * Life-series guard HP% thresholds centralized here, eliminating hardcoded numbers in guard.ts.
 */
export const GUARD_KIND_HP_THRESHOLD: Record<EnumGuardKind, number | null> = {
	[EnumGuardKind.Always]: null,
	[EnumGuardKind.Never]: null,
	[EnumGuardKind.Life25]: 25,
	[EnumGuardKind.Life50]: 50,
	[EnumGuardKind.Life75]: 75,
	[EnumGuardKind.Prob25]: null,
	[EnumGuardKind.Prob50]: null,
	[EnumGuardKind.Prob75]: null,
} as const;
