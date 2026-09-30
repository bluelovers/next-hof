/**
 * 技能魔方陣欄位 / Skill magic-circle fields
 * 魔方陣增減欄位（MagicCircleAdd / Delete / DeleteTeam / DeleteEnemy）；
 * raw（IRawSkillYaml）與 target（ISkillDef）兩層經 ISkillSharedFields 繼承同一組宣告。
 * Magic-circle add/remove fields (MagicCircleAdd / Delete / DeleteTeam / DeleteEnemy);
 * the raw (IRawSkillYaml) and target (ISkillDef) layers both inherit this one declaration
 * via ISkillSharedFields.
 */

/**
 * 技能魔方陣欄位 / Skill magic-circle fields
 * 介面 / interface
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
