/**
 * 道具箱系統的狀態與交易命令 (Command) 型別。
 * 狀態以純資料表示，異動以 mutation 描述，讓計算與套用可以分開測試。
 */
import type { IItemDef } from '#/src/lib/types/item-types';

/** 持有金狀態 / Wallet state */
export interface IWalletState
{
	/** 目前持有金 / Current gold */
	gold: number;
}

/** 道具箱狀態：道具編號 → 持有數 / Inventory state: item no → quantity */
export interface IInventoryState
{
	/** 持有數表，非正數的項目不會保留 / Quantity table; non-positive entries are not kept */
	quantities: Readonly<Record<number, number>>;
}

/** 錢包與道具箱的彙總快照 / Combined wallet + inventory snapshot */
export interface IInventorySnapshot
{
	/** 持有金 / Wallet */
	wallet: IWalletState;
	/** 道具箱 / Inventory */
	inventory: IInventoryState;
}

/** 單筆道具數量異動 / A single item quantity delta */
export interface IItemDelta
{
	/** 道具編號 / Item number */
	no: number;
	/** 增減量，正數為入庫、負數為取出 / Delta: positive for gain, negative for loss */
	delta: number;
}

/** 交易造成的狀態異動 / State delta produced by a trade command */
export interface IInventoryMutation
{
	/** 持有金異動 / Gold delta */
	goldDelta: number;
	/** 道具異動清單 / Item deltas */
	itemDeltas: readonly IItemDelta[];
}

/** 交易失敗原因 / Trade failure reasons */
export enum EnumTradeError
{
	/** 持有金不足 / Not enough gold */
	InsufficientGold = 'insufficientGold',
	/** 持有數不足 / Not enough items */
	InsufficientItem = 'insufficientItem',
	/** 購物車為空 / Cart is empty */
	EmptyCart = 'emptyCart',
	/** 數量無效 / Invalid quantity */
	InvalidQuantity = 'invalidQuantity',
	/** 目錄查無此道具 / Item not found in the catalog */
	UnknownItem = 'unknownItem',
}

/** 交易命令結果；失敗時 mutation 固定為空，呼叫端可無條件套用 / Command result; a failed result always carries a no-op mutation */
export interface ICommandResult
{
	/** 是否成立 / Whether the trade is valid */
	ok: boolean;
	/** 失敗原因，成功時省略 / Failure reason (absent on success) */
	reason?: EnumTradeError;
	/** 待套用的狀態異動 / Mutation to apply */
	mutation: IInventoryMutation;
}

/** 道具箱列，供 UI 呈現 / Inventory row for display */
export interface IInventoryEntry
{
	/** 道具編號 / Item number */
	no: number;
	/** 持有數 / Quantity owned */
	quantity: number;
	/** 道具定義，可能查無 / Item definition (may be unresolved) */
	item?: IItemDef;
}

/** 價格解析器，由呼叫端注入以支援買價、賣價等不同策略 / Injected price resolver for buy/sell strategies */
export type IPriceResolver = (item: IItemDef) => number;
