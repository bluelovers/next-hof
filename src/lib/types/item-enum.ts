/**
 * 道具／裝備 enum / Item & equipment enums
 * 單一事實來源：武器類型與道具類別細分集中於本檔。
 * Single source of truth: weapon types and item sub-categories are grouped here.
 */

/**
 * 武器類型 / Weapon type
 *
 *
 * 同時是「武器分類」與「道具分類」的共用定義（值採 PascalCase，與 YAML 來源一致）：
 * Shared definition for both weapon classes and item categories (PascalCase values, matching the YAML source):
 * - IItemDef.type 存放此值；IJobDef.equip 以此值做職業裝備白名單比對（equipAllowed）
 *   IItemDef.type stores this value; IJobDef.equip is whitelisted against it (equipAllowed)
 * - ISkillDef.limit 以 Partial<Record<EnumWeaponType, boolean>> 表達武器限制
 *   ISkillDef.limit expresses weapon restrictions as Partial<Record<EnumWeaponType, boolean>>
 * 非武器成員（Armor/Cloth/Robe/Item/Material/Other）供道具分類共用，勿視為可持握武器。
 * Non-weapon members (Armor/Cloth/Robe/Item/Material/Other) exist for item categories; they are not wieldable weapons.
 */
export enum EnumWeaponType
{
	/** 劍（單手）/ Sword (one-handed) */
	Sword = 'Sword',
	/** 匕首 / Dagger */
	Dagger = 'Dagger',
	/** 長矛（Pike 類長柄）/ Pike */
	Pike = 'Pike',
	/** 手斧 / Hatchet */
	Hatchet = 'Hatchet',
	/** 魔杖 / Wand */
	Wand = 'Wand',
	/** 錘 / Mace */
	Mace = 'Mace',
	/** 雙手劍（通常搭配 dh=true）/ Two-handed sword (usually dh=true) */
	TwoHandSword = 'TwoHandSword',
	/** 槍 / Spear */
	Spear = 'Spear',
	/** 戰斧 / Axe */
	Axe = 'Axe',
	/** 法杖 / Staff */
	Staff = 'Staff',
	/** 弓 / Bow */
	Bow = 'Bow',
	/** 弩 / Crossbow */
	CrossBow = 'CrossBow',
	/** 鞭 / Whip */
	Whip = 'Whip',
	/** 盾（副手）/ Shield (off hand) */
	Shield = 'Shield',
	/** 左手劍（副手）/ Main-gauche (off hand) */
	MainGauche = 'MainGauche',
	/** 書（魔法書）/ Book */
	Book = 'Book',
	/** 鎧甲 / Armor */
	Armor = 'Armor',
	/** 布甲 / Cloth */
	Cloth = 'Cloth',
	/** 法袍 / Robe */
	Robe = 'Robe',
	/** 道具 / Item */
	Item = 'Item',
	/** 素材 / Material */
	Material = 'Material',
	/** 其他 / Other */
	Other = 'Other',
}

/**
 * 道具類別細分 / Item sub-category
 *
 *
 * 對應 YAML item.type2 的有限集合（成員值與 YAML 來源一致，全大寫）：
 * Mirrors the closed set of YAML item.type2 values (member values match the YAML source, uppercase):
 * Weapon=WEAPON、Armor=ARMOR、Item=ITEM、Material=MATERIAL、Other=OTHER。
 *
 * 作為 IItemDef.type2 的型別；Item.ts 的 ITEM_TYPE_DEFAULT 指向 Item 成員作為預設值。
 * Type of IItemDef.type2; Item.ts's ITEM_TYPE_DEFAULT points at the Item member as the default.
 */
export enum EnumItemCategory
{
	/** 武器 / Weapon */
	Weapon = 'WEAPON',
	/** 防具 / Armor */
	Armor = 'ARMOR',
	/** 道具 / Item */
	Item = 'ITEM',
	/** 素材 / Material */
	Material = 'MATERIAL',
	/** 其他 / Other */
	Other = 'OTHER',
}
