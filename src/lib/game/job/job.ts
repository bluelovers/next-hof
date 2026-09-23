// 職業系統 / Job system
// 對應 docs/data/job.md 與 docs/log/battle/03 §2（hpsp 公式）。

import { MAX_STATUS } from '../constants';
import type { IJobDef, IWeaponType } from '../types';

/** 判斷職業是否可裝備某武器/防具型別 */
export function equipAllowed(job: IJobDef, itemType: IWeaponType): boolean {
	return !!job.equip?.includes(itemType);
}

/**
 * 職業 hpsp 公式中 MAXHP 的計算（對應 coe['maxhp'] 項）。
 * new_maxhp = 100 * coe['maxhp'] * (1 + (level-1)/49) * (1 + STR 係數)
 * STR 係數：MAX_STATUS > RevStr ? (div - RevStr^2)/div : RevStr^2/div
 */
export function coeMaxHp(job: IJobDef, str: number, level: number): number {
	const coe = job.coe?.maxhp ?? 1;
	const div = MAX_STATUS * MAX_STATUS;
	const revStr = MAX_STATUS - str;
	const factor = MAX_STATUS > revStr
		? (div - revStr * revStr) / div
		: (revStr * revStr) / div;
	return 100 * coe * (1 + (level - 1) / 49) * (1 + factor);
}
