/**
 * 守護種類常數 / Guard kind constants
 * 守護機率與 HP% 閾值集中定義於此，供 guard 判定引用。
 * Guard probability percentages and HP% thresholds, referenced by guard checks.
 */

import { EnumGuardKind } from '#/lib/types/battle-enum';

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
