/** 商店頁首：以 CharacterSprite 呈現店主，並用無角色的 BattleFieldScene 作為場景圖。 */
'use client';

import React from 'react';
import { CharacterSprite } from '#/src/components/characters/CharacterSprite';
import { EnumSpriteSize, EnumSpriteVariant } from '#/src/components/battle/enums';
import { BattleFieldScene } from '#/src/components/battle/BattleFieldScene';
import type { IBattleFieldConfig, IBattleSprite } from '#/src/components/battle/types';
import { useShopConfig } from '#/src/features/shop/state/useShop';
import { useInventory } from '#/src/features/inventory/state/useInventory';
import './ShopHeader.css';

/** 無角色場景的精靈列表，模組層級常數避免每次 render 產生新陣列 / Shared empty sprite list */
const EMPTY_SPRITES: IBattleSprite[] = [];

/** 商店頁首 / Shop header */
export const ShopHeader: React.FC = () =>
{
	const config = useShopConfig();
	const { snapshot } = useInventory();
	const { owner, scene, labels, pricing } = config;

	/** BattleFieldScene 的必要 config；sprites 固定為空陣列以呈現純背景 */
	const fieldConfig: IBattleFieldConfig = {
		backgroundImageUrl: scene.backgroundImageUrl,
		width: scene.width,
		height: scene.height,
		bgSize: scene.bgSize,
	};

	return (
		<header className="shop-header">
			<div className="shop-header__owner">
				<CharacterSprite
					url={owner.spriteUrl}
					variant={owner.spriteVariant ?? EnumSpriteVariant.Boxed}
					size={owner.spriteSize ?? EnumSpriteSize.Normal}
					alt={owner.name}
				/>
				<div className="shop-header__greeting">
					<h2>{owner.name}</h2>
					<p>{owner.greeting}</p>
				</div>
			</div>

			<div className="shop-header__scene">
				<BattleFieldScene sprites={EMPTY_SPRITES} config={fieldConfig} />
			</div>

			<div className="shop-header__wallet">
				{labels.gold} {snapshot.wallet.gold}{pricing.currencyLabel}
			</div>
		</header>
	);
};
