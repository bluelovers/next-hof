/**
 * 商店上架的道具編號，對應 PHP HOF_Model_Data::getShopList() 的回傳值。
 * 原清單中以註解排除的重置系道具不在販售範圍內。
 */
import type { IResourceId } from '#/src/lib/types/seg-types';

/** 商店上架道具編號 / Item numbers offered by the shop */
export const SHOP_ITEM_IDS: readonly IResourceId[] = Object.freeze([
	1002, 1003, 1004, 1100, 1101, 1200,
	1700, 1701, 1702, 1703, 1800, 1801,
	2000, 2001, 3000, 3001, 3002, 3100,
	3101, 5000, 5001, 5002, 5003, 5100,
	5101, 5102, 5103, 5200, 5201, 5202,
	5203, 5500, 5501, 7000, 7001, 7500,
	8000, 8009,
]);
