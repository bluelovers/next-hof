/**
 * 商店系統的注入設定、查詢條件與購物車型別。
 * 文案、圖片、排序選項與價格係數全由 IShopConfig 提供，元件本身不內建環境常數。
 */
import type { ISpriteSize, ISpriteVariant } from '#/src/components/characters/CharacterSprite';
import type { IBattleFieldConfig } from '#/src/components/battle/types';
import type { EnumWeaponType } from '#/src/lib/types/item-enum';

/** 商店主人設定 / Shop owner configuration */
export interface IShopOwner
{
	/** 顯示名稱 / Display name */
	name: string;
	/** 角色精靈 URL / Character sprite URL */
	spriteUrl: string;
	/** 招呼語 / Greeting line */
	greeting: string;
	/** 精靈顯示模式 / Sprite display variant */
	spriteVariant?: ISpriteVariant;
	/** 精靈尺寸 / Sprite size */
	spriteSize?: ISpriteSize;
}

/** 商店場景圖設定，轉成無角色的 BattleFieldScene / Scene config mapped to an empty BattleFieldScene */
export interface IShopSceneConfig
{
	/** 背景圖 URL / Background image URL */
	backgroundImageUrl: string;
	/** 場景寬度 / Scene width */
	width: number;
	/** 場景高度 / Scene height */
	height: number;
	/** 背景尺寸，沿用戰場元件型別以確保可直接傳入 / Background size, reusing the battlefield type so it passes through directly */
	bgSize?: IBattleFieldConfig['bgSize'];
}

/** 價格與幣值設定 / Pricing and currency configuration */
export interface IShopPricingConfig
{
	/** 售出價係數，道具未定義 sell 時由 buy 乘上此值 / Fallback sell rate when IItemDef.sell is absent */
	sellRate: number;
	/** 幣值標籤 / Currency label */
	currencyLabel: string;
	/** 道具圖示基底路徑 / Item icon base URL */
	itemImageBaseUrl: string;
}

/** 排序鍵 / Sort keys */
export enum EnumShopSortKey
{
	/** 目錄原順序 / Catalog order */
	Default = 'default',
	/** 名稱遞增 / Name ascending */
	NameAsc = 'nameAsc',
	/** 名稱遞減 / Name descending */
	NameDesc = 'nameDesc',
	/** 價格遞增 / Price ascending */
	PriceAsc = 'priceAsc',
	/** 價格遞減 / Price descending */
	PriceDesc = 'priceDesc',
	/** 類型遞增 / Type ascending */
	TypeAsc = 'typeAsc',
}

/** 一個排序選項 / One selectable sort option */
export interface IShopSortOption
{
	/** 排序鍵 / Sort key */
	key: EnumShopSortKey;
	/** 顯示標籤 / Display label */
	label: string;
}

/** 一個分類篩選，以符合的道具類型判定 / One category filter matched against IItemDef.type */
export interface IShopCategoryFilter
{
	/** 識別值 / Identifier */
	id: string;
	/** 顯示標籤 / Display label */
	label: string;
	/** 納入此分類的道具類型 / Item types included in this category */
	types: readonly EnumWeaponType[];
}

/** 全部 UI 文案，替換語系不需改動元件 / All UI copy, replaceable without touching components */
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

/** 商店對外注入設定 / Injected shop configuration */
export interface IShopConfig
{
	/** 商店主人 / Shop owner */
	owner: IShopOwner;
	/** 場景圖 / Scene */
	scene: IShopSceneConfig;
	/** 價格與幣值 / Pricing */
	pricing: IShopPricingConfig;
	/** UI 文案 / UI labels */
	labels: IShopLabels;
	/** 可選排序 / Available sorts */
	sortOptions: readonly IShopSortOption[];
	/** 可選分類 / Available category filters */
	categories: readonly IShopCategoryFilter[];
	/** 起始持有金 / Starting gold */
	initialMoney: number;
}

/** 目錄查詢條件 / Catalog query state */
export interface ICatalogQuery
{
	/** 搜尋字串 / Search text */
	search: string;
	/** 排序鍵 / Sort key */
	sort: EnumShopSortKey;
	/** 分類 id，'all' 表示不篩選 / Category id; 'all' disables filtering */
	categoryId: string;
}

/** 全部商品分類的識別值 / Identifier for the unfiltered category */
export const CATEGORY_ALL = 'all';

/** 購物車單筆 / One cart line */
export interface ICartLine
{
	/** 道具編號 / Item number */
	no: number;
	/** 數量 / Quantity */
	quantity: number;
}

/** 購物車狀態 / Cart state */
export interface ICartState
{
	/** 明細 / Lines */
	lines: readonly ICartLine[];
}
