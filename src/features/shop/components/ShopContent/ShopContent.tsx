/** 商店內容組裝層：讀取設定後把資料與文案注入道具箱面板，並排布各區塊。 */
'use client';

import React from 'react';
import { useShopConfig, usePriceResolvers, useTradeErrorLabel } from '#/src/features/shop/state/useShop';
import { useInventory } from '#/src/features/inventory/state/useInventory';
import { InventoryPanel } from '#/src/features/inventory/components/InventoryPanel/InventoryPanel';
import { ShopHeader } from '#/src/features/shop/components/ShopHeader/ShopHeader';
import { CatalogToolbar } from '#/src/features/shop/components/CatalogToolbar/CatalogToolbar';
import { CatalogGrid } from '#/src/features/shop/components/CatalogGrid/CatalogGrid';
import { CartPanel } from '#/src/features/shop/components/CartPanel/CartPanel';
import './ShopContent.scss';

/** 商店內容 */
export const ShopContent: React.FC = () =>
{
	const config = useShopConfig();
	const { sellPriceOf } = usePriceResolvers();
	const { catalog } = useInventory();
	const errorLabel = useTradeErrorLabel();

	/** 道具箱面板只接收純資料與解析器，不認識商店設定，因此可獨立複用 */
	const inventoryProps = {
		sellPriceOf: (no: number) =>
		{
			const item = catalog.getItem(no);
			return item ? sellPriceOf(item) : 0;
		},
		currencyLabel: config.pricing.currencyLabel,
		iconUrlOf: (no: number) => catalog.getImageUrl(no),
		errorLabelOf: errorLabel,
		labels: {
			title: config.labels.inventoryTitle,
			empty: config.labels.inventoryEmpty,
			owned: config.labels.owned,
			sellPrice: config.labels.sellPrice,
			sell: config.labels.sell,
			discard: config.labels.discard,
			gold: config.labels.gold,
			tradeFailed: config.labels.tradeFailed,
		},
	};

	return (
		<div className="shop-content">
			<ShopHeader />

			<div className="shop-content__columns">
				<main className="shop-content__catalog">
					<CatalogToolbar />
					<CatalogGrid />
				</main>

				<aside className="shop-content__side">
					<CartPanel />
					<InventoryPanel {...inventoryProps} />
				</aside>
			</div>
		</div>
	);
};
