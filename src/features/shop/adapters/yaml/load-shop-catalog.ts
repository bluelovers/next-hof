/**
 * 由 YAML loader 產生商店目錄的轉接層。
 * loader 與資源根目錄皆由呼叫端注入，本檔不依賴 Node fs，也不綁定任何路徑常數。
 */
import type { IItemDef } from '#/src/lib/types/item-types';
import type { IResourceId } from '#/src/lib/types/seg-types';

/** 單筆道具讀取器合約，與 loadItemYaml 簽章一致 / Single-item loader contract matching loadItemYaml */
export type IShopItemLoader = (id: IResourceId, root: string) => IItemDef | undefined;

/** 轉接層輸入 / Adapter input */
export interface ILoadShopCatalogInput
{
	/** 道具讀取器 / Item loader */
	loadItem: IShopItemLoader;
	/** 資源根目錄 / Resource root */
	root: string;
	/** 上架道具編號 / Item numbers to load */
	ids: readonly IResourceId[];
}

/**
 * 依編號逐一讀取道具，過濾讀取失敗的項目並保留清單順序。
 * 缺檔不視為錯誤，讓資料來源不完整時仍能渲染其餘商品。
 */
export function loadShopCatalog({ loadItem, root, ids }: ILoadShopCatalogInput): readonly IItemDef[]
{
	return ids
		.map((id) => loadItem(id, root))
		.filter((item): item is IItemDef => item !== undefined);
}
