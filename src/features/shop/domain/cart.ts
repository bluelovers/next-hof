/** 暫存購物車的純函式操作；失效時機由 ShopProvider 的掛載生命週期決定。 */
import type { IItemDef } from '#/src/lib/types/item-types';
import type { IPriceResolver } from '#/src/features/inventory/domain/types';
import type { ICartLine, ICartState } from './types';

/** 空購物車 */
export const EMPTY_CART: ICartState = { lines: [] };

/** 加入商品，同編號合併數量；數量非正數時不變 */
export function addToCart(cart: ICartState, no: number, quantity = 1): ICartState
{
	if (quantity <= 0) return cart;

	const existing = cart.lines.some((line) => line.no === no);
	const lines = existing
		? cart.lines.map((line) => line.no === no ? { ...line, quantity: line.quantity + quantity } : line)
		: [...cart.lines, { no, quantity }];

	return { lines };
}

/** 設定數量，非正數視為移除 */
export function setCartQuantity(cart: ICartState, no: number, quantity: number): ICartState
{
	if (quantity <= 0) return removeFromCart(cart, no);
	return { lines: cart.lines.map((line) => line.no === no ? { ...line, quantity } : line) };
}

/** 移除單筆 */
export function removeFromCart(cart: ICartState, no: number): ICartState
{
	return { lines: cart.lines.filter((line) => line.no !== no) };
}

/** 清空購物車 */
export function clearCart(): ICartState
{
	return EMPTY_CART;
}

/**
 * 計算單筆金額，查無道具定義的項目以 0 計。
 *
 * @param line - 購物車單筆
 * @param item - 該列的道具定義，查無時以 0 計
 * @param priceOf - 單價解析器
 */
export function cartLineTotal(line: ICartLine, item: IItemDef | undefined, priceOf: IPriceResolver): number
{
	return item ? priceOf(item) * line.quantity : 0;
}

/** 計算總金額，查無定義的項目以 0 計 */
export function cartSubtotal(
	cart: ICartState,
	resolve: (no: number) => IItemDef | undefined,
	priceOf: IPriceResolver,
): number
{
	return cart.lines.reduce((total, line) => total + cartLineTotal(line, resolve(line.no), priceOf), 0);
}

/** 購物車總件數 */
export function cartItemCount(cart: ICartState): number
{
	return cart.lines.reduce((total, line) => total + line.quantity, 0);
}
