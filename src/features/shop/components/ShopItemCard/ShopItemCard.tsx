/** 單一商品卡：顯示買價與持有數，並把商品加入暫存購物車。 */
'use client';

import React from 'react';
import type { IItemDef } from '#/lib/types/item-types';
import { ItemIcon } from '#/features/shared/components/ItemIcon/ItemIcon';
import { useShop, useShopConfig, usePriceResolvers } from '#/features/shop/state/useShop';
import { useInventory } from '#/features/inventory/state/useInventory';
import { countOf } from '#/features/inventory/domain/inventory';
import './ShopItemCard.css';

/** 商品卡 props / Item card props */
export interface IShopItemCardProps
{
	/** 商品定義 / Item definition */
	item: IItemDef;
	/** 圖示 URL / Icon URL */
	iconUrl?: string;
}

/** 商品卡 / Item card */
export const ShopItemCard: React.FC<IShopItemCardProps> = ({ item, iconUrl }) =>
{
	const { add } = useShop();
	const { labels, pricing } = useShopConfig();
	const { buyPriceOf } = usePriceResolvers();
	const { snapshot } = useInventory();

	return (
		<li className="shop-item-card">
			<ItemIcon url={iconUrl} name={item.name} size={40} />

			<div className="shop-item-card__body">
				<span className="shop-item-card__name">{item.name}</span>
				<span className="shop-item-card__type">{item.type}</span>
				<span className="shop-item-card__price">{labels.buyPrice} {buyPriceOf(item)}{pricing.currencyLabel}</span>
				<span className="shop-item-card__owned">{labels.owned} {countOf(snapshot.inventory, item.no)}</span>
			</div>

			<button type="button" className="shop-item-card__add" onClick={() => add(item.no)}>
				{labels.addToCart}
			</button>
		</li>
	);
};
