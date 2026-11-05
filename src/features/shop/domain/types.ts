/**
 * 商店系統的注入設定、查詢條件與購物車型別。
 * 文案、圖片、排序選項與價格係數全由 IShopConfig 提供，元件本身不內建環境常數。
 */
import type { ICharacterSpriteProps } from '#/src/components/characters/CharacterSprite';
import type { IBattleFieldConfig } from '#/src/components/battle/types';
import type { EnumWeaponType } from '#/src/lib/types/item-enum';
import type { ITSPickExtra } from 'ts-type';

/** 商店主人設定 */
export interface IShopOwner
{
	/** 顯示名稱，同時作為精靈的 alt 文字 */
	name: string;
	/** 招呼語 */
	greeting: string;
	/** 角色精靈設定，整份沿用 ICharacterSpriteProps，欄位與來源保持一致 */
	sprite: ICharacterSpriteProps;
}

/** 商店場景圖設定，轉成無角色的 BattleFieldScene */
export interface IShopSceneConfig extends ITSPickExtra<IBattleFieldConfig, 'backgroundImageUrl'>
{

}

/** 價格與幣值設定 */
export interface IShopPricingConfig
{
	/** 售出價係數，道具未定義 sell 時由 buy 乘上此值 */
	sellRate: number;
	/** 幣值標籤 */
	currencyLabel: string;
	/** 道具圖示基底路徑 */
	itemImageBaseUrl: string;
}

/** 排序鍵 */
export enum EnumShopSortKey
{
	/** 目錄原順序 */
	Default = 'default',
	/** 名稱遞增 */
	NameAsc = 'nameAsc',
	/** 名稱遞減 */
	NameDesc = 'nameDesc',
	/** 價格遞增 */
	PriceAsc = 'priceAsc',
	/** 價格遞減 */
	PriceDesc = 'priceDesc',
	/** 類型遞增 */
	TypeAsc = 'typeAsc',
}

/** 一個排序選項 */
export interface IShopSortOption
{
	/** 排序鍵 */
	key: EnumShopSortKey;
	/** 顯示標籤 */
	label: string;
}

/** 一個分類篩選，以 IItemDef.type 判定是否命中 */
export interface IShopCategoryFilter
{
	/** 識別值 */
	id: string;
	/** 顯示標籤 */
	label: string;
	/** 納入此分類的道具類型 */
	types: readonly EnumWeaponType[];
}

/** 全部 UI 文案，替換語系不需改動元件 */
export interface IShopLabels
{
	title: string;
	searchPlaceholder: string;
	sortLabel: string;
	categoryLabel: string;
	categoryAll: string;
	catalogEmpty: string;
	buyPrice: string;
	sellPrice: string;
	addToCart: string;
	owned: string;
	gold: string;
	cartTitle: string;
	cartEmpty: string;
	cartTotal: string;
	checkout: string;
	clearCart: string;
	remove: string;
	quantity: string;
	inventoryTitle: string;
	inventoryEmpty: string;
	sell: string;
	discard: string;
	tradeFailed: string;
	insufficientGold: string;
	insufficientItem: string;
	unknownItem: string;
	invalidQuantity: string;
	emptyCart: string;
}

/** 商店對外注入設定 */
export interface IShopConfig
{
	/** 商店主人 */
	owner: IShopOwner;
	/** 場景圖 */
	scene: IShopSceneConfig;
	/** 價格與幣值 */
	pricing: IShopPricingConfig;
	/** UI 文案 */
	labels: IShopLabels;
	/** 可選排序 */
	sortOptions: readonly IShopSortOption[];
	/** 可選分類 */
	categories: readonly IShopCategoryFilter[];
	/** 起始持有金 */
	initialMoney: number;
}

/** 目錄查詢條件 */
export interface ICatalogQuery
{
	/** 搜尋字串 */
	search: string;
	/** 排序鍵 */
	sort: EnumShopSortKey;
	/** 分類 id，'all' 表示不篩選 */
	categoryId: string;
}

/** 全部商品分類共用的識別值，代表不篩選 */
export const CATEGORY_ALL = 'all';

/** 購物車單筆 */
export interface ICartLine
{
	/** 道具編號 */
	no: number;
	/** 數量 */
	quantity: number;
}

/** 購物車狀態 */
export interface ICartState
{
	/** 明細 */
	lines: readonly ICartLine[];
}
