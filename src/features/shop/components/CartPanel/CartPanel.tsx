/** 暫存購物車面板：調整數量、移除、清空與結帳。 */
'use client';

import React from 'react';
import { ItemIcon } from '#/features/shared/components/ItemIcon/ItemIcon';
import { useShop, useShopConfig, usePriceResolvers, useTradeErrorLabel } from '#/features/shop/state/useShop';
import { useInventory } from '#/features/inventory/state/useInventory';
import { cartSubtotal } from '#/features/shop/domain/cart';
import './CartPanel.css';

/** 暫存購物車面板 / Temporary cart panel */
export const CartPanel: React.FC = () =>
{
	const { cart, setQuantity, remove, clear, checkout, lastError } = useShop();
	const { labels, pricing } = useShopConfig();
	const { buyPriceOf } = usePriceResolvers();
	const { catalog, resolveItem } = useInventory();
	const errorLabel = useTradeErrorLabel();

	const total = cartSubtotal(cart, resolveItem, buyPriceOf);
	const message = errorLabel(lastError);

	return (
		<section className="cart-panel">
			<header className="cart-panel__header">
				<h3>{labels.cartTitle}</h3>
				<button type="button" className="cart-panel__clear" onClick={clear} disabled={cart.lines.length === 0}>
					{labels.clearCart}
				</button>
			</header>

			{message && <p className="cart-panel__error" role="status">{message}</p>}

			{cart.lines.length === 0
				? <p className="cart-panel__empty">{labels.cartEmpty}</p>
				: (
					<ul className="cart-panel__list">
						{cart.lines.map((line) =>
						{
							const item = resolveItem(line.no);
							const name = item?.name ?? `#${line.no}`;
							const lineTotal = item ? buyPriceOf(item) * line.quantity : 0;

							return (
								<li key={line.no} className="cart-line">
									<ItemIcon url={catalog.getImageUrl(line.no)} name={name} size={24} />
									<span className="cart-line__name">{name}</span>
									<span className="cart-line__total">{lineTotal}{pricing.currencyLabel}</span>
									<span className="cart-line__controls">
										<button type="button" onClick={() => setQuantity(line.no, line.quantity - 1)} aria-label="−">−</button>
										<span className="cart-line__qty">{line.quantity}</span>
										<button type="button" onClick={() => setQuantity(line.no, line.quantity + 1)} aria-label="+">+</button>
									</span>
									<button type="button" className="cart-line__remove" onClick={() => remove(line.no)}>
										{labels.remove}
									</button>
								</li>
							);
						})}
					</ul>
				)}

			<footer className="cart-panel__footer">
				<span>{labels.cartTotal} {total}{pricing.currencyLabel}</span>
				<button type="button" className="cart-panel__checkout" onClick={() => checkout()} disabled={cart.lines.length === 0}>
					{labels.checkout}
				</button>
			</footer>
		</section>
	);
};
