/** 商品列表：套用查詢條件後逐一渲染商品卡。 */
'use client';

import React, { useMemo } from 'react';
import { useShop, useShopConfig } from '#/src/features/shop/state/useShop';
import { useInventory } from '#/src/features/inventory/state/useInventory';
import { queryCatalog } from '#/src/features/shop/domain/catalog';
import { ShopItemCard } from '#/src/features/shop/components/ShopItemCard/ShopItemCard';
import './CatalogGrid.css';

/** 商品列表 / Catalog grid */
export const CatalogGrid: React.FC = () =>
{
	const { query } = useShop();
	const config = useShopConfig();
	const { catalog } = useInventory();

	const items = useMemo(
		() => queryCatalog(catalog.items, query, config),
		[catalog.items, query, config],
	);

	/** 目錄為空或條件無命中時顯示提示，避免渲染空白清單 */
	if (items.length === 0)
	{
		return <p className="catalog-grid__empty">{config.labels.catalogEmpty}</p>;
	}

	return (
		<ul className="catalog-grid">
			{items.map((item) => (
				<ShopItemCard key={item.no} item={item} iconUrl={catalog.getImageUrl(item.no)} />
			))}
		</ul>
	);
};
