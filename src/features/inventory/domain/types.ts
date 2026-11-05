/**
 * 道具箱系統的狀態與交易命令 (Command) 型別。
 * 狀態以純資料表示，異動以 mutation 描述，讓計算與套用可以分開測試。
 */
import type { IItemDef } from '#/src/lib/types/item-types';

/** 持有金狀態 */
export interface IWalletState
{
	/** 目前持有金 */
	gold: number;
}

/** 道具箱狀態：道具編號 → 持有數 */
export interface IInventoryState
{
	/** 持有數表，非正數的項目不會保留 */
	quantities: Readonly<Record<number, number>>;
}

/** 錢包與道具箱的彙總快照 */
export interface IInventorySnapshot
{
	/** 持有金 */
	wallet: IWalletState;
	/** 道具箱 */
	inventory: IInventoryState;
}

/** 單筆道具數量異動 */
export interface IItemDelta
{
	/** 道具編號 */
	no: number;
	/** 增減量，正數為入庫、負數為取出 */
	delta: number;
}

/** 交易造成的狀態異動 */
export interface IInventoryMutation
{
	/** 持有金異動 */
	goldDelta: number;
	/** 道具異動清單 */
	itemDeltas: readonly IItemDelta[];
}

/** 交易失敗原因 */
export enum EnumTradeError
{
	/** 持有金不足 */
	InsufficientGold = 'insufficientGold',
	/** 持有數不足 */
	InsufficientItem = 'insufficientItem',
	/** 購物車為空 */
	EmptyCart = 'emptyCart',
	/** 數量無效 */
	InvalidQuantity = 'invalidQuantity',
	/** 目錄查無此道具 */
	UnknownItem = 'unknownItem',
}

/** 交易命令結果；失敗時 mutation 固定為空，呼叫端可無條件套用 */
export interface ICommandResult
{
	/** 是否成立 */
	ok: boolean;
	/** 失敗原因，成功時省略 */
	reason?: EnumTradeError;
	/** 待套用的狀態異動 */
	mutation: IInventoryMutation;
}

/** 道具箱列，供 UI 呈現 */
export interface IInventoryEntry
{
	/** 道具編號 */
	no: number;
	/** 持有數 */
	quantity: number;
	/** 道具定義，可能查無 */
	item?: IItemDef;
}

/** 價格解析器，由呼叫端注入以支援買價、賣價等不同策略 */
export type IPriceResolver = (item: IItemDef) => number;
