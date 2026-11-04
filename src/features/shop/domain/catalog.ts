/** 商品目錄的搜尋、排序與分類，皆為不改變輸入的純函式。 */
import type { IItemDef } from '#/src/lib/types/item-types';
import { CATEGORY_ALL, EnumShopSortKey, type ICatalogQuery, type IShopConfig } from './types';
import { getBuyPrice } from './pricing';

/** 判斷道具是否命中搜尋字串，比對名稱、編號與類型 / Match search text against name, number and type */
function matchesSearch(item: IItemDef, needle: string): boolean
{
	if (!needle) return true;
	return `${item.name} ${item.no} ${item.type}`.toLowerCase().includes(needle);
}

/** 找出目前分類允許的類型，'all' 回 undefined 表示不篩選 / Resolve allowed types; undefined means no filtering */
function allowedTypes(config: IShopConfig, categoryId: string): readonly string[] | undefined
{
	if (categoryId === CATEGORY_ALL) return undefined;
	return config.categories.find((category) => category.id === categoryId)?.types;
}

/** 依排序鍵比較兩筆道具 / Compare two items under a sort key */
function compareItems(a: IItemDef, b: IItemDef, sort: EnumShopSortKey): number
{
	switch (sort)
	{
		case EnumShopSortKey.NameAsc:
			return a.name.localeCompare(b.name);
		case EnumShopSortKey.NameDesc:
			return b.name.localeCompare(a.name);
		case EnumShopSortKey.PriceAsc:
			return getBuyPrice(a) - getBuyPrice(b);
		case EnumShopSortKey.PriceDesc:
			return getBuyPrice(b) - getBuyPrice(a);
		case EnumShopSortKey.TypeAsc:
			return String(a.type).localeCompare(String(b.type)) || a.no - b.no;
		default:
			return 0;
	}
}

/**
 * 依查詢條件過濾並排序商品目錄。
 * 排序以原目錄順序作為最終穩定條件，避免價格或名稱相同時順序跳動。
 */
export function queryCatalog(
	items: readonly IItemDef[],
	query: ICatalogQuery,
	config: IShopConfig,
): readonly IItemDef[]
{
	const needle = query.search.trim().toLowerCase();
	const types = allowedTypes(config, query.categoryId);
	const indexed = items.map((item, index) => ({ item, index }));

	const filtered = indexed.filter(({ item }) =>
		matchesSearch(item, needle) && (!types || types.includes(item.type)));

	filtered.sort((a, b) =>
	{
		const diff = compareItems(a.item, b.item, query.sort);
		return diff !== 0 ? diff : a.index - b.index;
	});

	return filtered.map(({ item }) => item);
}
