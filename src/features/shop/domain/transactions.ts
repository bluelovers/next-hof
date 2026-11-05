/** 購買（結帳）的交易命令：只計算 mutation，不改變任何狀態。 */
import type { IItemCatalog } from '#/src/features/shared/domain/item-catalog';
import type { ICommandResult, IInventorySnapshot, IPriceResolver } from '#/src/features/inventory/domain/types';
import { EnumTradeError } from '#/src/features/inventory/domain/types';
import { canAfford } from '#/src/features/inventory/domain/wallet';
import { commandFail, commandOk } from '#/src/features/inventory/domain/mutation';
import { cartLineTotal } from './cart';
import type { ICartState } from './types';

/**
 * 建立結帳命令：檢查購物車、餘額與道具定義後，產生扣款與入庫異動。
 * @param snapshot - 目前錢包與道具箱
 * @param cart - 暫存購物車
 * @param catalog - 道具目錄
 * @param priceOf - 購入價解析器
 */
export function buildPurchase(
	snapshot: IInventorySnapshot,
	cart: ICartState,
	catalog: IItemCatalog,
	priceOf: IPriceResolver,
): ICommandResult
{
	/** 空車直接失敗，避免產生零金額卻仍清空購物車的副作用 */
	if (cart.lines.length === 0)
	{
		return commandFail(EnumTradeError.EmptyCart);
	}

	let total = 0;
	const itemDeltas: { no: number; delta: number }[] = [];

	for (const line of cart.lines)
	{
		const item = catalog.getItem(line.no);

		/** 任一筆無效即讓整筆交易不成立，避免部分扣款 */
		if (line.quantity <= 0 || !item)
		{
			return commandFail(line.quantity <= 0 ? EnumTradeError.InvalidQuantity : EnumTradeError.UnknownItem);
		}

		total += cartLineTotal(line, item, priceOf);
		itemDeltas.push({ no: line.no, delta: line.quantity });
	}

	if (!canAfford(snapshot.wallet, total))
	{
		return commandFail(EnumTradeError.InsufficientGold);
	}

	return commandOk({ goldDelta: -total, itemDeltas });
}
