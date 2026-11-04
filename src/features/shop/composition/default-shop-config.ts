/**
 * 商店預設組態。環境相關值（圖片、文案、係數、排序與分類）集中在此並透過 IShopConfig 注入，
 * 因此替換資料來源、美術或語系時不需改動任何元件。
 */
import { EnumSpriteSize, EnumSpriteVariant } from '#/src/components/battle/enums';
import { EnumWeaponType } from '#/src/lib/types/item-enum';
import { SELLING_PRICE, START_MONEY } from '#/src/lib/game/constants';
import { getCharSpriteUrl } from '#/src/lib/showcase/sprite-map';
import { DEFAULT_ITEM_IMAGE_BASE_URL } from '#/src/features/shared/domain/item-catalog';
import { EnumShopSortKey, type IShopConfig } from '#/src/features/shop/domain/types';

/** 商店場景背景圖，取用專案既有資源 / Shop scene background from an existing project asset */
export const SHOP_SCENE_BACKGROUND_URL = '/image/carpet011.png';

/** 預設商店主人的角色編號，精靈圖由既有對應表解析 / Default owner char number resolved via the existing sprite map */
export const SHOP_OWNER_CHAR_NO = 101;

/** 建立預設組態，可覆寫最上層欄位 / Build the default config with top-level overrides */
export function createShopConfig(overrides: Partial<IShopConfig> = {}): IShopConfig
{
	const base: IShopConfig = {
		owner: {
			name: '店主',
			spriteUrl: getCharSpriteUrl(SHOP_OWNER_CHAR_NO),
			greeting: '歡迎光臨，隨便看看。',
			spriteVariant: EnumSpriteVariant.Boxed,
			spriteSize: EnumSpriteSize.Large,
		},
		scene: {
			backgroundImageUrl: SHOP_SCENE_BACKGROUND_URL,
			width: 480,
			height: 200,
			bgSize: { width: 480, height: 200 },
		},
		pricing: {
			sellRate: SELLING_PRICE,
			currencyLabel: 'G',
			itemImageBaseUrl: DEFAULT_ITEM_IMAGE_BASE_URL,
		},
		labels: {
			title: '商店',
			searchPlaceholder: '搜尋商品名稱或編號',
			sortLabel: '排序',
			categoryLabel: '分類',
			categoryAll: '全部',
			catalogEmpty: '沒有符合條件的商品',
			buyPrice: '買價',
			sellPrice: '賣價',
			addToCart: '加入購物車',
			owned: '持有',
			gold: '持有金',
			cartTitle: '購買清單',
			cartEmpty: '尚未加入任何商品',
			cartTotal: '合計',
			checkout: '結帳',
			clearCart: '清空',
			remove: '移除',
			quantity: '數量',
			inventoryTitle: '道具箱',
			inventoryEmpty: '道具箱是空的',
			sell: '售出',
			discard: '拋棄',
			tradeFailed: '交易失敗',
			insufficientGold: '持有金不足',
			insufficientItem: '持有數不足',
			unknownItem: '找不到道具資料',
			invalidQuantity: '數量無效',
			emptyCart: '購買清單是空的',
		},
		sortOptions: [
			{ key: EnumShopSortKey.Default, label: '預設順序' },
			{ key: EnumShopSortKey.NameAsc, label: '名稱 ↑' },
			{ key: EnumShopSortKey.NameDesc, label: '名稱 ↓' },
			{ key: EnumShopSortKey.PriceAsc, label: '價格 ↑' },
			{ key: EnumShopSortKey.PriceDesc, label: '價格 ↓' },
			{ key: EnumShopSortKey.TypeAsc, label: '類型' },
		],
		categories: [
			{
				id: 'weapon',
				label: '武器',
				types: [
					EnumWeaponType.Sword, EnumWeaponType.Dagger, EnumWeaponType.Pike,
					EnumWeaponType.Hatchet, EnumWeaponType.Wand, EnumWeaponType.Mace,
					EnumWeaponType.TwoHandSword, EnumWeaponType.Spear, EnumWeaponType.Axe,
					EnumWeaponType.Staff, EnumWeaponType.Bow, EnumWeaponType.CrossBow,
					EnumWeaponType.Whip,
				],
			},
			{
				id: 'armor',
				label: '防具',
				types: [
					EnumWeaponType.Shield, EnumWeaponType.MainGauche, EnumWeaponType.Book,
					EnumWeaponType.Armor, EnumWeaponType.Cloth, EnumWeaponType.Robe,
				],
			},
			{
				id: 'goods',
				label: '道具・素材',
				types: [EnumWeaponType.Item, EnumWeaponType.Material, EnumWeaponType.Other],
			},
		],
		initialMoney: START_MONEY,
	};

	return { ...base, ...overrides };
}

/** 預設組態實例 / Default config instance */
export const DEFAULT_SHOP_CONFIG: IShopConfig = createShopConfig();
