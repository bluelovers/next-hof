/** 商店 context 的讀取 hook 與衍生工具，讓元件不必直接碰 createContext。 */
'use client';

import { useContext, useMemo } from 'react';
import type { IItemDef } from '#/src/lib/types/item-types';
import { EnumTradeError } from '#/src/features/inventory/domain/types';
import { ShopConfigContext } from './ShopConfigProvider';
import { ShopContext, type IShopContextValue } from './ShopProvider';
import type { IShopConfig } from '#/src/features/shop/domain/types';
import { getBuyPrice, getSellPrice } from '#/src/features/shop/domain/pricing';

/** 取得商店設定 / Access the injected shop configuration */
export function useShopConfig(): IShopConfig
{
	const config = useContext(ShopConfigContext);

	if (!config)
	{
		throw new Error('useShopConfig requires a ShopConfigProvider');
	}

	return config;
}

/** 取得商店作用域狀態與動作 / Access shop-scoped state and actions */
export function useShop(): IShopContextValue
{
	const value = useContext(ShopContext);

	if (!value)
	{
		throw new Error('useShop requires a ShopProvider');
	}

	return value;
}

/** 買價與賣價解析器，賣出係數來自設定 / Buy and sell price resolvers; the sell rate comes from config */
export function usePriceResolvers(): {
	buyPriceOf: (item: IItemDef) => number;
	sellPriceOf: (item: IItemDef) => number;
}
{
	const config = useShopConfig();

	return useMemo(() => ({
		buyPriceOf: (item: IItemDef) => getBuyPrice(item),
		sellPriceOf: (item: IItemDef) => getSellPrice(item, config.pricing.sellRate),
	}), [config.pricing.sellRate]);
}

/** 把交易錯誤轉成設定中的文案 / Map a trade error to the configured label */
export function useTradeErrorLabel(): (error?: EnumTradeError) => string | undefined
{
	const config = useShopConfig();

	return (error) =>
	{
		if (!error) return undefined;

		switch (error)
		{
			case EnumTradeError.InsufficientGold:
				return config.labels.insufficientGold;
			case EnumTradeError.InsufficientItem:
				return config.labels.insufficientItem;
			case EnumTradeError.UnknownItem:
				return config.labels.unknownItem;
			case EnumTradeError.InvalidQuantity:
				return config.labels.invalidQuantity;
			case EnumTradeError.EmptyCart:
				return config.labels.emptyCart;
			default:
				return config.labels.tradeFailed;
		}
	};
}
