/**
 * HomePage / RankingTable / TeamStatus / InfoSection 展示用資料（單一事實來源）
 * HomePage / RankingTable / TeamStatus / InfoSection fixture data (single source of truth)
 *
 * 各故事展示用的獨立首頁／排行／隊伍狀態／系統資訊資料，集中管理避免重複定義。
 * Individual home page / ranking / team status / system info showcase data,
 * centralized to avoid duplication.
 */

// ==================== 排行資料 / Ranking data ====================

/** 排行資料列型別 / Ranking row type */
export type IRankingRow = { rank: number; teamName: string };

/** 基本排行（首頁） / Basic ranking (home page) */
export const homeRanking: IRankingRow[] = [
	{ rank: 1, teamName: 'TestTeam' },
	{ rank: 2, teamName: 'ゴブリンと遊ぶ' },
	{ rank: 3, teamName: '勇者パーティー' },
];

/** 多人上線排行（首頁） / Many-users ranking (home page) */
export const manyUsersRanking: IRankingRow[] = [
	{ rank: 1, teamName: 'ChampionTeam' },
	{ rank: 2, teamName: 'DarkKnights' },
	{ rank: 3, teamName: 'MageGuild' },
	{ rank: 4, teamName: 'BeastTamer' },
	{ rank: 5, teamName: 'HolyCrusade' },
];

/** 基本排行（RankingTable） / Basic ranking (RankingTable) */
export const rankingBasic: IRankingRow[] = [
	{ rank: 1, teamName: '勇者隊' },
	{ rank: 2, teamName: '魔法部隊' },
	{ rank: 3, teamName: '戰士隊' },
];

/** 長排行（10 列） / Long ranking (10 rows) */
export const rankingLong: IRankingRow[] = [
	{ rank: 1, teamName: '超強勇者隊' },
	{ rank: 2, teamName: '魔法精英隊' },
	{ rank: 3, teamName: '戰士王者隊' },
	{ rank: 4, teamName: '牧師團隊' },
	{ rank: 5, teamName: '盜賊聯盟' },
	{ rank: 6, teamName: '弓箭手團' },
	{ rank: 7, teamName: '騎士團' },
	{ rank: 8, teamName: '法師塔' },
	{ rank: 9, teamName: '暗殺者組織' },
	{ rank: 10, teamName: '治癫者協會' },
];

/** 長隊名排行 / Long-team-name ranking */
export const rankingLongNames: IRankingRow[] = [
	{ rank: 1, teamName: '傳說中的勇者小隊' },
	{ rank: 2, teamName: '黃金魔法師殿堂' },
	{ rank: 3, teamName: '聖騎士守護聯盟' },
	{ rank: 4, teamName: '暗影刺客兄弟會' },
	{ rank: 5, teamName: '精靈之森守衛隊' },
];

/** 兩列排行（無標題／自訂標題） / Two-row ranking (without title / custom title) */
export const rankingTwo: IRankingRow[] = [
	{ rank: 1, teamName: '勇者隊' },
	{ rank: 2, teamName: '魔法部隊' },
];

// ==================== TeamStatus 隊伍狀態資料 / TeamStatus data ====================

/** 預設隊伍狀態 / Default team status */
export const defaultTeamStatus = { teamName: 'TestTeam', funds: 43080, timeCurrent: 1000, timeMax: 1000 };

/** 資金充足 / Rich team */
export const richTeamStatus = { teamName: 'GoldMasters', funds: 99999999, timeCurrent: 980, timeMax: 1000 };

/** 資金不足 / Poor team */
export const poorTeamStatus = { teamName: 'Beggars', funds: 50, timeCurrent: 100, timeMax: 1000 };

/** 時間耗盡 / Time depleted */
export const timeDepletedStatus = { teamName: 'LateComers', funds: 5000, timeCurrent: 0, timeMax: 1000 };

/** 長隊名 / Long team name */
export const longNameStatus = { teamName: 'VeryLongTeamNameForTesting', funds: 1234567, timeCurrent: 500, timeMax: 1000 };

/** 初始隊伍 / Starting team */
export const startingTeamStatus = { teamName: 'NewTeam', funds: 10000, timeCurrent: 1000, timeMax: 1000 };

// ==================== InfoSection 系統資訊資料 / InfoSection data ====================

/** 基本資訊 / Basic info */
export const basicInfo = { onlineUsers: 25, maxUsers: 500, retentionDays: 14 };

/** 高使用率 / High usage */
export const highUsageInfo = { onlineUsers: 450, maxUsers: 500, retentionDays: 7 };

/** 低使用率 / Low usage */
export const lowUsageInfo = { onlineUsers: 5, maxUsers: 500, retentionDays: 30 };

/** 資料保留長期 / Long retention */
export const longRetentionInfo = { onlineUsers: 100, maxUsers: 500, retentionDays: 90 };

/** 資料保留短期 / Short retention */
export const shortRetentionInfo = { onlineUsers: 200, maxUsers: 500, retentionDays: 3 };