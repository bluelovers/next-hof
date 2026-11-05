/** 道具箱與錢包的 React 狀態容器；可獨立掛載，不需依附商店頁面。 */
'use client';

import React, { createContext, useCallback, useMemo, useReducer, type ReactNode } from 'react';
import type { IItemDef } from '#/src/lib/types/item-types';
import { EMPTY_ITEM_CATALOG, type IItemCatalog } from '#/src/features/shared/domain/item-catalog';
import { START_MONEY } from '#/src/lib/game/constants';
import { applyMutation } from '#/src/features/inventory/domain/mutation';
import { createWallet } from '#/src/features/inventory/domain/wallet';
import { createInventory } from '#/src/features/inventory/domain/inventory';
import type { ICommandResult, IInventorySnapshot } from '#/src/features/inventory/domain/types';

/** Provider 對外值 */
export interface IInventoryContextValue
{
	/** 目前快照 */
	snapshot: IInventorySnapshot;
	/** 道具目錄 */
	catalog: IItemCatalog;
	/** 依編號解析定義 */
	resolveItem(no: number): IItemDef | undefined;
	/** 套用交易命令，回傳是否成立 */
	apply(result: ICommandResult): boolean;
}

export const InventoryContext = createContext<IInventoryContextValue | null>(null);

/** Provider 的注入 props */
export interface IInventoryProviderProps
{
	/** 道具目錄 */
	catalog?: IItemCatalog;
	/** 起始持有金 */
	initialGold?: number;
	/** 起始持有道具 */
	initialItems?: Readonly<Record<number, number>>;
	/** 子樹 */
	children: ReactNode;
}

/** reducer 動作 */
type IInventoryAction = { type: 'apply'; mutation: ICommandResult['mutation'] };

/** 狀態轉換：唯一的可變點 */
function reducer(state: IInventorySnapshot, action: IInventoryAction): IInventorySnapshot
{
	return applyMutation(state, action.mutation);
}

/** 建立初始快照 */
function createInitialSnapshot(initialGold: number, initialItems: Readonly<Record<number, number>>): IInventorySnapshot
{
	return {
		wallet: createWallet(initialGold),
		inventory: createInventory(initialItems),
	};
}

/** 道具箱狀態容器 */
export const InventoryProvider: React.FC<IInventoryProviderProps> = ({
	catalog = EMPTY_ITEM_CATALOG,
	initialGold = START_MONEY,
	initialItems = {},
	children,
}) =>
{
	const [snapshot, dispatch] = useReducer(reducer, createInitialSnapshot(initialGold, initialItems));

	const apply = useCallback((result: ICommandResult): boolean =>
	{
		/** 只有成立的命令才 dispatch；失敗命令的 mutation 為空，不必進入 reducer */
		if (result.ok)
		{
			dispatch({ type: 'apply', mutation: result.mutation });
		}
		return result.ok;
	}, []);

	const value = useMemo<IInventoryContextValue>(() => ({
		snapshot,
		catalog,
		resolveItem: (no) => catalog.getItem(no),
		apply,
	}), [snapshot, catalog, apply]);

	return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};
