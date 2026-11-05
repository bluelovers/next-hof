/** 商店頁面 client 入口：建立目錄與設定，疊合三層 Provider 後交給內容層。 */
'use client';

import React, { useMemo } from 'react';
import type { IItemDef } from '#/src/lib/types/item-types';
import { createItemCatalog } from '#/src/features/shared/domain/item-catalog';
import { DEFAULT_SHOP_CONFIG } from '#/src/features/shop/composition/default-shop-config';
import { ShopConfigProvider } from '#/src/features/shop/state/ShopConfigProvider';
import { ShopProvider } from '#/src/features/shop/state/ShopProvider';
import { InventoryProvider } from '#/src/features/inventory/state/InventoryProvider';
import { ShopContent } from '#/src/features/shop/components/ShopContent/ShopContent';
import type { IShopConfig } from '#/src/features/shop/domain/types';
import './ShopPageView.scss';

/** 頁面 props */
export interface IShopPageViewProps
{
	/** 由 Server Component 載入的商品定義 */
	items: readonly IItemDef[];
	/** 可替換的商店設定 */
	config?: IShopConfig;
}

/** 商店頁面 */
export const ShopPageView: React.FC<IShopPageViewProps> = ({ items, config = DEFAULT_SHOP_CONFIG }) =>
{
	/** 目錄只建立一次，圖示基底路徑來自設定而非寫死在元件 */
	const catalog = useMemo(
		() => createItemCatalog(items, { imageBaseUrl: config.pricing.itemImageBaseUrl }),
		[items, config.pricing.itemImageBaseUrl],
	);

	return (
		<ShopConfigProvider config={config}>
			<InventoryProvider catalog={catalog} initialGold={config.initialMoney}>
				<ShopProvider>
					<div className="shop-page">
						<h1 className="shop-page__title">{config.labels.title}</h1>
						<ShopContent />
					</div>
				</ShopProvider>
			</InventoryProvider>
		</ShopConfigProvider>
	);
};
