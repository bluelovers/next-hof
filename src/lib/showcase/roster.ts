// 展示頁名冊 / Showcase roster
// 從引擎 seed 角色定義整理出選角 UI 所需的純展示欄位（no/name/level/jobName/
// spriteUrl），職業名取自 SEED 職業定義、圖檔取自 sprite-map（缺圖自動回傳
// placeholder），本身不建 Character、不含戰鬥邏輯。
// Flattens engine seed char definitions into display-only fields for the party
// picker (no/name/level/jobName/spriteUrl). Job names come from SEED job defs and
// images from sprite-map (placeholder on miss); it builds no Character and holds
// no battle logic.

import { SEED } from '#/lib/game/data/seed-data';
import { getCharSpriteUrl } from './sprite-map';

/**
 * 名冊顯示項目 / Roster display entry
 * 介面 / interface（I 前綴命名慣例）
 */
export interface IRosterEntry {
	/** 角色定義編號（def no）/ character definition number */
	no: number;
	/** 角色名稱 / character name */
	name: string;
	/** 等級 / level */
	level: number;
	/** 職業名稱（查無時為 'Unknown'）/ job name ('Unknown' when missing) */
	jobName: string;
	/** 精靈圖路徑（缺圖為 placeholder）/ sprite image path (placeholder when missing) */
	spriteUrl: string;
}

/** 職業編號 → 職業名稱（來源 SEED 職業定義；job_name 省略時 'Unknown'）/ job no → job name (from SEED jobs; 'Unknown' when absent) */
const JOB_NAMES: Readonly<Record<number, string>> = {
	[SEED.job100.no]: SEED.job100.job_name ?? 'Unknown',
	[SEED.job200.no]: SEED.job200.job_name ?? 'Unknown',
	[SEED.job300.no]: SEED.job300.job_name ?? 'Unknown',
};

/**
 * 可選角色名冊（展示頁選角區塊資料來源）
 * Selectable roster (data source for the party picker)
 *
 * 順序即 seed 定義順序；同一份資料供 checkbox 選單與上限判斷使用。
 * Order follows seed definition order; one source feeds both the checkbox list
 * and the party-size cap logic.
 */
export const SHOWCASE_ROSTER: readonly IRosterEntry[] = SEED.chars.map((c) => ({
	no: c.no,
	name: c.name,
	level: c.level,
	jobName: (c.job !== undefined && JOB_NAMES[c.job]) || 'Unknown',
	spriteUrl: getCharSpriteUrl(c.no),
}));

/** 取得單一角色的名冊項目 / Get one roster entry by def no */
export function getRosterEntry(no: number): IRosterEntry | undefined {
	return SHOWCASE_ROSTER.find((e) => e.no === no);
}
