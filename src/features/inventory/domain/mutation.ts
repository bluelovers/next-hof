/** 交易命令結果的建構與套用，是道具箱系統唯一會改變狀態的地方。 */
import type { ICommandResult, IInventoryMutation, IInventorySnapshot, EnumTradeError } from './types';

/** 空異動，失敗結果與無動作共用 / Shared no-op mutation for failed results */
export const EMPTY_MUTATION: IInventoryMutation = { goldDelta: 0, itemDeltas: [] };

/** 建立成功結果 / Build a successful command result */
export function commandOk(mutation: IInventoryMutation): ICommandResult
{
	return { ok: true, mutation };
}

/** 建立失敗結果，固定攜帶空異動 / Build a failed command result carrying the no-op mutation */
export function commandFail(reason: EnumTradeError): ICommandResult
{
	return { ok: false, reason, mutation: EMPTY_MUTATION };
}

/**
 * 把異動套用到快照並回傳新快照。
 * 數量收斂為正數後才保留，避免 0 或負數持有列殘留；持有金同樣不為負。
 */
export function applyMutation(snapshot: IInventorySnapshot, mutation: IInventoryMutation): IInventorySnapshot
{
	const quantities: Record<number, number> = { ...snapshot.inventory.quantities };

	for (const delta of mutation.itemDeltas)
	{
		const next = (quantities[delta.no] ?? 0) + delta.delta;

		if (next > 0)
		{
			quantities[delta.no] = next;
		}
		else
		{
			delete quantities[delta.no];
		}
	}

	return {
		wallet: { gold: Math.max(0, snapshot.wallet.gold + mutation.goldDelta) },
		inventory: { quantities },
	};
}
