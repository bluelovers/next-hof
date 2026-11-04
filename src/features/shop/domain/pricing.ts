/** 商店價格計算，集中處理 buy／sell 缺值與金幣倍率。 */
import type { IItemDef } from '#/src/lib/types/item-types';
import { MONEY_RATE, SELLING_PRICE } from '#/src/lib/game/constants';

/**
 * 取得購入價格：IItemDef.buy 乘上金幣倍率，缺值視為 0。
 * @param item - 道具定義
 * @param moneyRate - 金幣倍率，預設取專案常數 MONEY_RATE
 */
export function getBuyPrice(item: IItemDef, moneyRate = MONEY_RATE): number
{
	return Math.max(0, Math.floor((item.buy ?? 0) * moneyRate));
}

/**
 * 取得售出價格：優先使用 IItemDef.sell，缺值時由 buy 乘 sellRate 推得。
 * @param item - 道具定義
 * @param sellRate - 售出價係數，預設取專案常數 SELLING_PRICE
 * @param moneyRate - 金幣倍率
 */
export function getSellPrice(item: IItemDef, sellRate = SELLING_PRICE, moneyRate = MONEY_RATE): number
{
	const base = item.sell ?? (item.buy ?? 0) * sellRate;
	return Math.max(0, Math.floor(base * moneyRate));
}
