/**
 * 技能魔方陣欄位 / Skill magic-circle fields
 */
export interface ISkillMagicCircleFields
{
	/** 增加己方魔方陣數（目前僅資料層保留）/ add to own team's magic circles (data-layer only) */
	MagicCircleAdd?: number;
	/** 消除己方魔方陣數（目前僅資料層保留）/ remove own team's magic circles (data-layer only) */
	MagicCircleDelete?: number;
	/** 消耗己方魔方陣數（目前僅資料層保留）/ consume own team's magic circles (data-layer only) */
	MagicCircleDeleteTeam?: number;
	/** 消除敵方魔方陣數（目前僅資料層保留）/ remove enemy team's magic circles (data-layer only) */
	MagicCircleDeleteEnemy?: number;
}
