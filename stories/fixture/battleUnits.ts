/**
 * BattleUnit / BattleTeamInfo / BattleSegmentStatus / BattleResult 展示用資料（單一事實來源）
 * BattleUnit / BattleTeamInfo / BattleSegmentStatus / BattleResult fixture data (single source of truth)
 *
 * 各故事展示用的獨立戰鬥單位／隊伍／結果資料，集中管理避免重複定義。
 * Individual battle unit / team / result data for story showcases, centralized to avoid duplication.
 */
import type { IBattleUnit, IBattleResult } from '../../src/components/battle/types';
import { EnumTeamSideUI, EnumUnitStatus } from '#/components/battle/enums';
import { getCharSpriteUrl, getMonSpriteUrl } from '#/lib/showcase/sprite-map';

// ==================== BattleUnit 單位資料 / BattleUnit unit data ====================

/** 滿血滿 SP 的單位 / Full HP and SP */
export const fullHealthUnit: IBattleUnit = {
	name: 'Hero1', level: 3, hp: 349, maxHp: 349, sp: 349, maxSp: 53, side: EnumTeamSideUI.Left,
};

/** 低血量單位 / Low HP */
export const lowHealthUnit: IBattleUnit = {
	name: 'Hero1', level: 3, hp: 42, maxHp: 349, sp: 180, maxSp: 53, side: EnumTeamSideUI.Left,
};

/** 瀕死單位 / Near death */
export const nearDeathUnit: IBattleUnit = {
	name: 'Mage1', level: 3, hp: 1, maxHp: 159, sp: 30, maxSp: 112, side: EnumTeamSideUI.Left, status: EnumUnitStatus.Alive,
};

/** 陣亡單位 / Downed unit */
export const downedUnit: IBattleUnit = {
	name: 'Healer1', level: 3, hp: 0, maxHp: 213, sp: 0, maxSp: 89, side: EnumTeamSideUI.Left, status: EnumUnitStatus.Down,
};

/** 詠唱中 / Casting */
export const castingUnit: IBattleUnit = {
	name: 'Mage1', level: 3, hp: 159, maxHp: 159, sp: 80, maxSp: 112, side: EnumTeamSideUI.Left, status: EnumUnitStatus.Casting,
};

/** SP 不足 / Low SP */
export const lowSpUnit: IBattleUnit = {
	name: 'Priest1', level: 3, hp: 213, maxHp: 213, sp: 5, maxSp: 89, side: EnumTeamSideUI.Left,
};

/** 高等級敵人 / High level enemy */
export const highLevelEnemyUnit: IBattleUnit = {
	name: 'GoblinWarrior(A)', level: 4, hp: 263, maxHp: 263, sp: 200, maxSp: 174, side: EnumTeamSideUI.Right,
};

// ==================== BattleTeamInfo 隊伍資料 / BattleTeamInfo team data ====================

/** ゴブリン隊伍資料（名稱＋單位） / Goblin team data (name + units) */
export const goblinTeamInfo = {
	name: 'ゴブリンと遊ぶ(最弱)',
	units: [
		{ name: 'GoblinWarrior(A)', level: 4, hp: 263, maxHp: 263, sp: 263, maxSp: 174, side: EnumTeamSideUI.Left },
		{ name: 'GoblinWarrior(B)', level: 4, hp: 263, maxHp: 263, sp: 263, maxSp: 174, side: EnumTeamSideUI.Left },
		{ name: 'GoblinWarrior(C)', level: 1, hp: 213, maxHp: 213, sp: 213, maxSp: 154, side: EnumTeamSideUI.Left },
		{ name: 'GoblinAxe', level: 1, hp: 213, maxHp: 213, sp: 213, maxSp: 154, side: EnumTeamSideUI.Left },
	] as IBattleUnit[],
};

/** TestTeam 隊伍資料（名稱＋單位） / TestTeam data (name + units) */
export const testTeamInfo = {
	name: 'TestTeam',
	units: [
		{ name: 'Hero1', level: 3, hp: 349, maxHp: 349, sp: 349, maxSp: 53, side: EnumTeamSideUI.Right },
		{ name: 'Mage1', level: 3, hp: 159, maxHp: 159, sp: 159, maxSp: 112, side: EnumTeamSideUI.Right },
		{ name: 'Healer1', level: 3, hp: 213, maxHp: 213, sp: 213, maxSp: 89, side: EnumTeamSideUI.Right },
		{ name: 'Priest1', level: 3, hp: 213, maxHp: 213, sp: 213, maxSp: 89, side: EnumTeamSideUI.Right },
	] as IBattleUnit[],
};

/** 高階玩家隊伍資料（名稱＋單位） / High-level player team data (name + units) */
export const championTeamInfo = {
	name: 'ChampionGuild',
	units: [
		{ name: 'Paladin', level: 99, hp: 9999, maxHp: 9999, sp: 5000, maxSp: 5000, side: EnumTeamSideUI.Right },
		{ name: 'ArchMage', level: 95, hp: 3200, maxHp: 3200, sp: 8000, maxSp: 8000, side: EnumTeamSideUI.Right },
		{ name: 'HighPriest', level: 90, hp: 4500, maxHp: 4500, sp: 6000, maxSp: 6000, side: EnumTeamSideUI.Right },
		{ name: 'Ranger', level: 88, hp: 3800, maxHp: 3800, sp: 4000, maxSp: 4000, side: EnumTeamSideUI.Right },
	] as IBattleUnit[],
};

// ==================== BattleSegmentStatus 分段狀態欄資料 / BattleSegmentStatus column data ====================

/** 左隊（敵方）單位 / Left (enemy) units */
export const segmentLeftUnits: IBattleUnit[] = [
	{
		name: 'GoblinAxe',
		level: 1,
		hp: 180,
		maxHp: 213,
		sp: 90,
		maxSp: 154,
		side: EnumTeamSideUI.Left,
		sprite: { url: getMonSpriteUrl(1000) },
	},
	{
		name: 'Slime',
		level: 2,
		hp: 213,
		maxHp: 213,
		sp: 154,
		maxSp: 154,
		side: EnumTeamSideUI.Left,
		sprite: { url: getMonSpriteUrl(1002) },
	},
];

/** 右隊（我方）單位 / Right (ally) units */
export const segmentRightUnits: IBattleUnit[] = [
	{
		name: 'Hero1',
		level: 3,
		hp: 349,
		maxHp: 349,
		sp: 53,
		maxSp: 53,
		side: EnumTeamSideUI.Right,
		sprite: { url: getCharSpriteUrl(100) },
	},
	{
		name: 'Mage1',
		level: 3,
		hp: 120,
		maxHp: 159,
		sp: 112,
		maxSp: 112,
		side: EnumTeamSideUI.Right,
		sprite: { url: getCharSpriteUrl(102) },
	},
];

// ==================== BattleResult 戰鬥結果資料 / BattleResult data ====================

/** ゴブリン勝利（左隊） / Goblins win (left team) */
export const goblinsWinResult: { leftTeamName: string; rightTeamName: string; result: IBattleResult } = {
	leftTeamName: 'ゴブリンと遊ぶ(最弱)',
	rightTeamName: 'TestTeam',
	result: {
		winner: 'ゴブリンと遊ぶ(最弱)',
		leftTeam: { hpRemain: 573, alive: 4, totalUnits: 4, totalDamage: 1384, totalExp: 4, funds: '4' },
		rightTeam: { hpRemain: 0, alive: 0, totalUnits: 4, totalDamage: 379 },
	},
};

/** 玩家隊伍勝利（右隊） / Player team wins (right team) */
export const playerWinsResult: { leftTeamName: string; rightTeamName: string; result: IBattleResult } = {
	leftTeamName: 'DarkGoblins',
	rightTeamName: 'TestTeam',
	result: {
		winner: 'TestTeam',
		leftTeam: { hpRemain: 0, alive: 0, totalUnits: 4, totalDamage: 952 },
		rightTeam: { hpRemain: 489, alive: 3, totalUnits: 4, totalDamage: 2100, totalExp: 12, funds: '500' },
	},
};

/** 壓倒性勝利 / Overwhelming victory */
export const overwhelmingResult: { leftTeamName: string; rightTeamName: string; result: IBattleResult } = {
	leftTeamName: 'ChampionGuild',
	rightTeamName: 'SlimeSwarm',
	result: {
		winner: 'ChampionGuild',
		leftTeam: { hpRemain: 25000, alive: 5, totalUnits: 5, totalDamage: 99999, totalExp: 999, funds: '99999' },
		rightTeam: { hpRemain: 0, alive: 0, totalUnits: 8, totalDamage: 0 },
	},
};

/** 慘勝 / Pyrrhic victory */
export const pyrrhicResult: { leftTeamName: string; rightTeamName: string; result: IBattleResult } = {
	leftTeamName: 'TestTeam',
	rightTeamName: 'DragonLord',
	result: {
		winner: 'TestTeam',
		leftTeam: { hpRemain: 12, alive: 1, totalUnits: 5, totalDamage: 15000, totalExp: 5000, funds: '100000' },
		rightTeam: { hpRemain: 0, alive: 0, totalUnits: 1, totalDamage: 14900 },
	},
};