/** 道具箱持有數的純函式操作。 */
import type { IInventoryEntry, IInventoryState } from './types';

/** 建立道具箱，過濾非正數的初始持有 */
export function createInventory(seed: Readonly<Record<number, number>> = {}): IInventoryState
{
	const quantities: Record<number, number> = {};

	for (const [key, value] of Object.entries(seed))
	{
		/** 非正數視為未持有，避免產生無效列進入狀態 */
		if (value > 0)
		{
			quantities[Number(key)] = Math.floor(value);
		}
	}

	return { quantities };
}

/** 取得單一道具持有數 */
export function countOf(inventory: IInventoryState, no: number): number
{
	return inventory.quantities[no] ?? 0;
}

/** 列出持有中的道具編號與數量，依編號排序 */
export function listOwned(inventory: IInventoryState): readonly Pick<IInventoryEntry, 'no' | 'quantity'>[]
{
	return Object.entries(inventory.quantities)
		.map(([key, quantity]) => ({ no: Number(key), quantity }))
		.filter((entry) => entry.quantity > 0)
		.sort((a, b) => a.no - b.no);
}
