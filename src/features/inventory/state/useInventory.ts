/** 讀取道具箱 context 的 hook。 */
'use client';

import { useContext } from 'react';
import { InventoryContext, type IInventoryContextValue } from './InventoryProvider';

/** 取得道具箱狀態與操作，未掛 Provider 時丟出明確錯誤 */
export function useInventory(): IInventoryContextValue
{
	const value = useContext(InventoryContext);

	if (!value)
	{
		throw new Error('useInventory requires an InventoryProvider');
	}

	return value;
}
