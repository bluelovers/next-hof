/**
 * 道具目錄 (Item Catalog) 的讀取合約與工廠。
 * 商店與道具箱共用同一份解析結果，讓編號查詢與圖示 URL 組裝只有一個實作。
 */
import type { IItemDef } from '#/src/lib/types/item-types';

/** 圖示基底路徑預設值，可由組裝端覆寫 */
export const DEFAULT_ITEM_IMAGE_BASE_URL = '/image/icon/item/';

/** 道具目錄對外合約 */
export interface IItemCatalog
{
	/** 全部道具定義 */
	readonly items: readonly IItemDef[];
	/** 依編號取得定義 */
	getItem(no: number): IItemDef | undefined;
	/** 依編號取得可顯示的圖示 URL，缺圖回 undefined */
	getImageUrl(no: number): string | undefined;
}

/** 建立目錄時的環境設定 */
export interface IItemCatalogOptions
{
	/** 圖示基底路徑，接在 IItemDef.img 之前 */
	imageBaseUrl?: string;
}

/** 圖示副檔名：YAML 的 img 欄位不含副檔名，實體檔案皆為 /png */
const IMAGE_EXTENSION = '.png';

/** 檔名是否已帶副檔名（含 . 的最後一段視為副檔名） */
function hasExtension(file: string): boolean
{
	const lastSegment = file.split('/').pop() ?? file;
	return lastSegment.includes('.');
}

/**
 * 拼接基底路徑與檔名，避免重複或缺少斜線；
 * YAML 的 img 欄位（如 we_sword026）不含副檔名，缺時補上 .png。
 */
function joinImageUrl(base: string, file: string): string
{
	const name = file.replace(/^\/+/, '');
	const withExtension = hasExtension(name) ? name : `${name}${IMAGE_EXTENSION}`;
	return `${base.replace(/\/+$/, '')}/${withExtension}`;
}

/**
 * 由一組道具定義建立不可變目錄。
 * @param items - 來源資料，可來自 YAML adapter、seed repository 或測試假資料
 * @param options - 圖示基底路徑等環境設定
 * @returns 可供商店與道具箱共用的 IItemCatalog
 */
export function createItemCatalog(items: readonly IItemDef[], options: IItemCatalogOptions = {}): IItemCatalog
{
	const base = options.imageBaseUrl ?? DEFAULT_ITEM_IMAGE_BASE_URL;
	const byNo = new Map<number, IItemDef>(items.map((item) => [item.no, item]));

	return {
		items,
		getItem: (no) => byNo.get(no),
		getImageUrl: (no) =>
		{
			const img = byNo.get(no)?.img;
			return img ? joinImageUrl(base, img) : undefined;
		},
	};
}

/** 空目錄，供資料尚未載入時安全渲染 */
export const EMPTY_ITEM_CATALOG: IItemCatalog = createItemCatalog([]);
