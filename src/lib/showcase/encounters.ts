// 展示頁敵方編選 / Showcase enemy encounters
// 定義至少兩組可選 encounter（純 def no 清單，資料來自 seed 怪物）；開戰時由
// runShowcaseBattle 依所選項目建立敵方隊伍，切換選項即切換敵方構成。
// Defines at least two selectable encounters (plain def-no lists built from seed
// monsters). At battle start runShowcaseBattle builds the enemy side from the
// chosen option, so switching options switches the enemy composition.

import { SEED } from '#/lib/game/data/seed-data';

/**
 * 敵方編選項目 / Enemy encounter option
 * 介面 / interface（I 前綴命名慣例）
 */
export interface IEncounter {
	/** 編選識別碼（唯一）/ unique encounter id */
	id: string;
	/** 編選顯示名稱 / display name */
	name: string;
	/** 敵方隊伍名稱（顯示於戰鬥結果）/ enemy team name (shown in battle result) */
	teamName: string;
	/** 敵方怪物 def no 清單（可重複，同 no 同名）/ enemy monster def nos (duplicates allowed) */
	monNos: readonly number[];
}

/**
 * 可選敵方編選（至少兩組，全部取自 seed 怪物定義）
 * Selectable encounters (at least two; all from seed monster definitions)
 */
export const SHOWCASE_ENCOUNTERS: readonly IEncounter[] = [
	{
		id: 'goblin-patrol',
		name: '哥布林巡邏隊 / Goblin Patrol',
		teamName: 'Goblin Patrol',
		monNos: [1000, 1002],
	},
	{
		id: 'dark-elf-ambush',
		name: '黑暗精靈伏擊 / Dark Elf Ambush',
		teamName: 'Dark Elf Ambush',
		monNos: [1001, 1002],
	},
	{
		id: 'slime-swarm',
		name: '史萊姆群 / Slime Swarm',
		teamName: 'Slime Swarm',
		monNos: [1002, 1002, 1002],
	},
];

/** 預設編選（第一組）/ default encounter (the first one) */
export const DEFAULT_ENCOUNTER: IEncounter = SHOWCASE_ENCOUNTERS[0];

/** 取得單一編選 / Get one encounter by id */
export function getEncounter(id: string): IEncounter | undefined {
	return SHOWCASE_ENCOUNTERS.find((e) => e.id === id);
}

/** 驗證編選的怪號皆存在於 seed（供測試／防呆）/ verify all mon nos exist in seed (for tests) */
export function isEncounterValid(encounter: IEncounter): boolean {
	return (
		encounter.monNos.length > 0 &&
		encounter.monNos.every((no) => SEED.mons.some((m) => m.no === no))
	);
}
