/** 售出與拋棄的交易命令：只計算 mutation，不改變任何狀態。 */
import type { IItemCatalog } from '#/src/features/shared/domain/item-catalog';
import type { ICommandResult, IInventorySnapshot, IPriceResolver } from './types';
import { EnumTradeError } from './types';
import { countOf } from './inventory';
import { commandFail, commandOk } from './mutation';

/**
 * 建立售出命令：確認持有數足夠後，產生取出與入帳異動。
 * @param snapshot - 目前錢包與道具箱
 * @param no - 道具編號
 * @param quantity - 售出數量
 * @param catalog - 道具目錄
 * @param priceOf - 售出價解析器
 */
export function buildSell(
	snapshot: IInventorySnapshot,
	no: number,
	quantity: number,
	catalog: IItemCatalog,
	priceOf: IPriceResolver,
): ICommandResult
{
	if (quantity <= 0)
	{
		return commandFail(EnumTradeError.InvalidQuantity);
	}

	const item = catalog.getItem(no);
	if (!item)
	{
		return commandFail(EnumTradeError.UnknownItem);
	}

	if (countOf(snapshot.inventory, no) < quantity)
	{
		return commandFail(EnumTradeError.InsufficientItem);
	}

	return commandOk({
		goldDelta: priceOf(item) * quantity,
		itemDeltas: [{ no, delta: -quantity }],
	});
}

/**
 * 建立拋棄命令：確認持有數足夠後只產生取出異動，不入帳。
 * @param snapshot - 目前錢包與道具箱
 * @param no - 道具編號
 * @param quantity - 拋棄數量
 * @param catalog - 道具目錄，用來驗證道具存在
 */
export function buildDiscard(
	snapshot: IInventorySnapshot,
	no: number,
	quantity: number,
	catalog: IItemCatalog,
): ICommandResult
{
	if (quantity <= 0)
	{
		return commandFail(EnumTradeError.InvalidQuantity);
	}

	if (!catalog.getItem(no))
	{
		return commandFail(EnumTradeError.UnknownItem);
	}

	if (countOf(snapshot.inventory, no) < quantity)
	{
		return commandFail(EnumTradeError.InsufficientItem);
	}

	return commandOk({ goldDelta: 0, itemDeltas: [{ no, delta: -quantity }] });
}
