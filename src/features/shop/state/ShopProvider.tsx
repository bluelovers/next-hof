/**
 * 商店作用域狀態：購物車、目錄查詢與結帳。
 * 購物車只存在於此 Provider，離開商店（卸載）即失效；持有的道具與金錢由 InventoryProvider 管理。
 */
'use client';

import React, { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { useInventory } from '#/features/inventory/state/useInventory';
import type { ICommandResult } from '#/features/inventory/domain/types';
import { EnumTradeError } from '#/features/inventory/domain/types';
import { CATEGORY_ALL, EnumShopSortKey, type ICartState, type ICatalogQuery } from '#/features/shop/domain/types';
import {
	EMPTY_CART,
	addToCart as addLine,
	clearCart as emptyCart,
	removeFromCart as dropLine,
	setCartQuantity as changeQuantity,
} from '#/features/shop/domain/cart';
import { buildPurchase } from '#/features/shop/domain/transactions';
import { getBuyPrice } from '#/features/shop/domain/pricing';

/** Provider 對外值 / Public context value */
export interface IShopContextValue
{
	/** 暫存購物車 / Temporary cart */
	cart: ICartState;
	/** 目錄查詢條件 / Catalog query */
	query: ICatalogQuery;
	/** 最近一次失敗原因 / Latest trade failure */
	lastError?: EnumTradeError;
	/** 更新查詢 / Update the query */
	setQuery(next: ICatalogQuery): void;
	/** 加入購物車 / Add to cart */
	add(no: number, quantity?: number): void;
	/** 設定數量 / Set a line quantity */
	setQuantity(no: number, quantity: number): void;
	/** 移除單筆 / Remove a line */
	remove(no: number): void;
	/** 清空購物車 / Clear the cart */
	clear(): void;
	/** 結帳並回傳命令結果 / Checkout; returns the command result */
	checkout(): ICommandResult;
}

export const ShopContext = createContext<IShopContextValue | null>(null);

/** 商店作用域狀態容器 / Shop-scoped state provider */
export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) =>
{
	/** 購物車與查詢條件隨此 Provider 卸載而消失，不需額外清理邏輯 */
	const [cart, setCart] = useState<ICartState>(EMPTY_CART);
	const [query, setQuery] = useState<ICatalogQuery>({
		search: '',
		sort: EnumShopSortKey.Default,
		categoryId: CATEGORY_ALL,
	});
	const [lastError, setLastError] = useState<EnumTradeError | undefined>(undefined);

	const { snapshot, catalog, apply } = useInventory();

	const add = useCallback((no: number, quantity = 1) =>
	{
		setCart((current) => addLine(current, no, quantity));
		setLastError(undefined);
	}, []);

	const setQuantity = useCallback((no: number, quantity: number) =>
	{
		setCart((current) => changeQuantity(current, no, quantity));
	}, []);

	const remove = useCallback((no: number) =>
	{
		setCart((current) => dropLine(current, no));
	}, []);

	const clear = useCallback(() =>
	{
		setCart(emptyCart());
		setLastError(undefined);
	}, []);

	const checkout = useCallback((): ICommandResult =>
	{
		const result = buildPurchase(snapshot, cart, catalog, getBuyPrice);
		const succeeded = apply(result);

		/** 結帳成功才清空購物車，失敗時保留清單讓使用者調整數量或移除商品 */
		if (succeeded)
		{
			setCart(emptyCart());
			setLastError(undefined);
		}
		else
		{
			setLastError(result.reason);
		}

		return result;
	}, [snapshot, cart, catalog, apply]);

	const value = useMemo<IShopContextValue>(() => ({
		cart,
		query,
		lastError,
		setQuery,
		add,
		setQuantity,
		remove,
		clear,
		checkout,
	}), [cart, query, lastError, add, setQuantity, remove, clear, checkout]);

	return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
