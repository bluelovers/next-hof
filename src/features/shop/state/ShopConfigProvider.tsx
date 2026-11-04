/** 把 IShopConfig 注入子樹，讓所有商店元件只依賴設定而非具體環境值。 */
'use client';

import React, { createContext, type ReactNode } from 'react';
import type { IShopConfig } from '#/src/features/shop/domain/types';

export const ShopConfigContext = createContext<IShopConfig | null>(null);

/** Provider props */
export interface IShopConfigProviderProps
{
	/** 商店設定 / Shop configuration */
	config: IShopConfig;
	/** 子樹 / Children */
	children: ReactNode;
}

/** 商店設定容器 / Shop configuration provider */
export const ShopConfigProvider: React.FC<IShopConfigProviderProps> = ({ config, children }) =>
	<ShopConfigContext.Provider value={config}>{children}</ShopConfigContext.Provider>;
