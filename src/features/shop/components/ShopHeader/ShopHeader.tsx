/** 商店頁首：以 CharacterSprite 呈現店主，並用無角色的 BattleFieldScene 作為場景圖。 */
'use client';

import React from 'react';
import { CharacterSprite } from '#/src/components/characters/CharacterSprite';
import { BattleFieldScene } from '#/src/components/battle/BattleFieldScene';
import type { IBattleSprite } from '#/src/components/battle/types';
import { useShopConfig } from '#/src/features/shop/state/useShop';
import { useInventory } from '#/src/features/inventory/state/useInventory';
import './ShopHeader.scss';

/** 無角色場景的精靈列表，模組層級常數避免每次 render 產生新陣列 */
const EMPTY_SPRITES: IBattleSprite[] = [];

/** 商店頁首 */
export const ShopHeader: React.FC = () =>
{
	const config = useShopConfig();
	const { snapshot } = useInventory();
	const { owner, scene, labels, pricing } = config;

	return (
		<header className="shop-header">
			<div className="shop-header__owner">
				<CharacterSprite alt={owner.name} {...owner.sprite} />
				<div className="shop-header__greeting">
					<h2>{owner.name}</h2>
					<p>{owner.greeting}</p>
				</div>
			</div>

			<div className="shop-header__scene">
				<BattleFieldScene sprites={EMPTY_SPRITES} config={scene} />
			</div>

			<div className="shop-header__wallet">
				{labels.gold} {snapshot.wallet.gold}{pricing.currencyLabel}
			</div>
		</header>
	);
};
