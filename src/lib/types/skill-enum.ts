/**
 * 技能相關 enum / Skill-related enums
 * 單一事實來源：目標選取、傷害影響能力、優先條件與傷害類型（atk 槽位索引）集中於本檔。
 * Single source of truth: target selection, influencing stat, priority condition and damage
 * type (the atk slot index) are grouped here.
 */

/**
 * 技能目標類型 / Skill target type
 *
 *
 * 決定「以誰為中心」選取目標（ITargetSpec 第 1 元，Battle.selectTargets 據此分支）：
 * Determines the camp used as the selection center (ITargetSpec element 1; branches in Battle.selectTargets):
 * - Enemy／Friend：敵隊／己隊（含召喚物在內的隊伍成員）
 *   Enemy / Friend: members of the enemy / friendly team (summons included)
 * - All：不分敵我的全體存活者；Self：僅施法者自己（忽略選取方式）
 * - All: all living units on both sides; Self: the caster only (method ignored)
 */
export enum EnumTargetType
{
	/** 敵隊 / Enemy team */
	Enemy = 'enemy',
	/** 己隊 / Friendly team */
	Friend = 'friend',
	/** 全場（敵我不分）/ Entire field (both teams) */
	All = 'all',
	/** 自身 / Self only */
	Self = 'self',
}

/**
 * 技能目標方式 / Skill target method
 *
 *
 * 決定「在該陣營內取幾個」（ITargetSpec 第 2 元）：
 * Determines how many targets are taken within the chosen camp (ITargetSpec element 2):
 * - Individual：隨機 1 名；Multi：隨機抽 count 名（有放回，可能重複）
 *   Individual: 1 random pick; Multi: count random picks (with replacement, duplicates possible)
 * - All：全體存活者（第 3 元 count 被忽略）
 *   All: every living member (the 3rd element count is ignored)
 */
export enum EnumTargetMethod
{
	/** 單體（隨機 1 名）/ Single target (1 random pick) */
	Individual = 'individual',
	/** 多體（隨機抽 count 名，有放回）/ Multiple targets (count random picks, with replacement) */
	Multi = 'multi',
	/** 全體存活者（忽略 count）/ All living members (count ignored) */
	All = 'all',
}

/**
 * 技能影響能力（參照基礎六維）/ Skill influencing stat
 *
 *
 * 決定傷害公式採用的主要能力（effect.ts calcBasicDamage）：
 * Selects the primary stat used by the damage formula (effect.ts calcBasicDamage):
 * - 省略（undefined）或 Str：物理用 STR、魔法用 INT（預設路徑）
 *   omitted (undefined) or Str: physical uses STR, magic uses INT (default path)
 * - Dex：無論物理／魔法一律改用 DEX
 *   Dex: always uses DEX regardless of physical/magic
 */
export enum EnumInfluence
{
	/** 以 DEX 計算傷害 / compute damage from DEX */
	Dex = 'dex',
	/** 預設路徑：物理 STR／魔法 INT / default path: physical STR / magic INT */
	Str = 'str',
}

/**
 * 技能優先條件 / Skill priority condition
 *
 *
 * AI 目標選擇的優先判斷（供 judge/pattern 層參考）：
 * Priority hints for AI target selection (consumed by the judge/pattern layer):
 * - LowHpRate：優先低 HP 比率目標；Dead：目標已死亡（蘇生類技能）
 *   LowHpRate: prefer low-HP targets; Dead: target is dead (revive-type skills)
 * - Summon：優先召喚物；Charge：目標正在詠唱；Back：背擊（優先後排）
 *   Summon: prefer summons; Charge: target is casting; Back: back attack (prefer the back row)
 */
export enum EnumSkillPriority
{
	/** 低 HP 比率優先 / prefer low HP rate */
	LowHpRate = 'LowHpRate',
	/** 已死亡目標優先（蘇生）/ prefer dead targets (revive) */
	Dead = 'Dead',
	/** 召喚物優先 / prefer summons */
	Summon = 'Summon',
	/** 詠唱中目標優先 / prefer casting targets */
	Charge = 'Charge',
	/** 背擊（後排優先）/ back attack (prefer back row) */
	Back = 'Back',
}

/**
 * 技能傷害類型（同時為 atk 陣列槽位索引）
 * Skill damage type (also the atk array slot index)
 *
 * Physical＝0（物理：STR／atk[0]）、Magic＝1（魔法：INT／atk[1]）；
 * 成員值與 YAML 來源一致，並採完整鍵名（Physical / Magic）。
 *
 * 本列舉即 atk 槽位索引的唯一來源：atk 讀寫、pierce、equip 等索引一律引用
 * EnumSkillDamageType，不另立槽位 enum。
 * This enum is the sole source of the atk slot index: atk read/write, pierce and equip
 * indices all reference EnumSkillDamageType; no separate slot enum exists.
 *
 * calcBasicDamage 據此選擇能力與 atk/def 的物理／魔法索引；
 * showcase battle-adapter 據此決定蓄力文案（Physical→charging、Magic→casting）。
 *
 * @see {@link IAtkTuple}
 * @see {@link calcBasicDamage}
 */
export enum EnumSkillDamageType
{
	/** 物理：YAML 值 0、atk[0] / physical: YAML value 0, atk[0] */
	Physical = 0,
	/** 魔法：YAML 值 1、atk[1] / magic: YAML value 1, atk[1] */
	Magic = 1,
}
