/**
 * 角色類型 / Character type
 *
 *
 * 以 Set<EnumCharType> 存於 Character.types，可同時持有複數類型：
 * Stored as Set<EnumCharType> on Character.types; a unit may hold several types at once:
 * 召喚物 = Mon + Summon、獨特怪物 = Mon + Union（factory 以 add() 疊加）。
 * summon = Mon + Summon, union monster = Mon + Union (factory stacks them via add()).
 * 戰鬥統計（CountAlive 等）據此排除召喚物，勝負判定只計算真實角色。
 * Battle counters (CountAlive etc.) exclude summons based on this; only real chars decide victory.
 */
export enum EnumCharType
{
	/** 玩家角色 / Player character */
	Char = 'char',
	/** 怪物 / Monster */
	Mon = 'mon',
	/** 召喚物（疊加於 Mon 之上）/ Summon (stacked on top of Mon) */
	Summon = 'summon',
	/** 獨特怪物（疊加於 Mon 之上）/ Union monster (stacked on top of Mon) */
	Union = 'union',
}

/**
 * 裝備欄位 / Equipment slot
 *
 *
 * 作為 Character.equip（Partial<Record>）的鍵；欄位可缺省＝該處未裝備。
 * Keys of Character.equip (Partial<Record>); a missing key means the slot is empty.
 * MainHand 與 OffHand 受雙手武器(dh)互斥規則約束（見 equip.ts setEquip）；
 * MainHand 裝備時會同步寫入 Character.WEAPON 供技能武器限制比對。
 * MainHand/OffHand are mutually exclusive under two-handed (dh) weapons (see equip.ts setEquip);
 * equipping MainHand also writes Character.WEAPON for skill weapon-limit checks.
 */
export enum EnumEquipSlot
{
	/** 主手（武器）/ Main hand (weapon) */
	MainHand = 'main_hand',
	/** 副手（盾／左手劍）/ Off hand (shield / main-gauche) */
	OffHand = 'off_hand',
	/** 防具 / Armor */
	Armor = 'armor',
	/** 道具欄（消耗品）/ Item slot (consumables) */
	Item = 'item',
}

/**
 * 性別 / Gender
 *
 *
 * 作為 IJobDef.gender 的鍵（Partial<Record>）：0＝男性、1＝女性。
 * Keys of IJobDef.gender (Partial<Record>): 0 = male, 1 = female.
 */
export enum EnumGender
{
	/** 男性（值 0）/ male (value 0) */
	Male = 0,
	/** 女性（值 1）/ female (value 1) */
	Female = 1,
}
