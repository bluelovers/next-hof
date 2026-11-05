/** 持有金的純函式操作，不含任何狀態容器。 */
import type { IWalletState } from './types';

/** 建立錢包，金額收斂為非負整數 */
export function createWallet(gold = 0): IWalletState
{
	return { gold: Math.max(0, Math.floor(gold)) };
}

/** 判斷是否足以支付指定金額 */
export function canAfford(wallet: IWalletState, amount: number): boolean
{
	return amount >= 0 && wallet.gold >= amount;
}
