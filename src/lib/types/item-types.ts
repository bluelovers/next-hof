import type { IAtkDefFields, IAtkTuple, INamedIconDef, INumberTable } from './base-types';
import type { ICompBonuses } from './skill-types';
import type { EnumItemCategory, EnumWeaponType } from './item-enum';

/**
 * 道具定義 / Item definition
 */
export interface IItemDef extends ICompBonuses, IAtkDefFields, INamedIconDef
{
	/** 武器／裝備型別（同時決定可裝備欄位）/ weapon/equipment type (also decides the equip slot) */
	type: EnumWeaponType;
	/** 類別細分（Weapon/Armor/Item/Material/Other，見 EnumItemCategory）/ sub-category (see EnumItemCategory) */
	type2?: EnumItemCategory;
	/** 購入價格（金幣）/ buy price (gold) */
	buy?: number;
	/** 賣出價格（金幣）/ sell price (gold) */
	sell?: number;
	/** 雙手武器（佔用手部＋副手）/ two-handed weapon (occupies both hand slots) */
	dh?: boolean;
	/** 裝備負荷（參與 Delay 系統運算）/ equipment weight (feeds the delay calculation) */
	handle?: number;
	/** 習得條件 { 職業編號: 等級 } / learn requirement (INumberTable) */
	need?: INumberTable;
	/** 強化／進化後的基礎道具名 / base item name after refinement/evolution */
	base_name?: string;
	/** 附加的召喚效果值（SPECIAL.P_SUMMON）/ attached summon bonus (SPECIAL.P_SUMMON) */
	P_SUMMON?: number;
	/** 附加的貫穿效果值（P_PIERCE = [物理, 魔法]）/ attached pierce bonus (P_PIERCE = [phys, mag]) */
	P_PIERCE?: IAtkTuple;
}
