
/**
 * 時間服務介面 / Time service interface
 * 介面 / interface
 */
export interface ITimeService {
	/** 目前虛擬時間（毫秒） */
	now(): number;
	/** 推進虛擬時鐘 */
	advance(ms: number): void;
	/**
	 * 冷卻狀態判斷。
	 * 對應規格場景：now()=1200 時，isReady(0,1000)=false、isReady(0,1500)=true。
	 * 語意：回傳 true 表示 at+cooldownMs 尚未到達（仍在冷卻中）。
	 */
	isReady(at: number, cooldownMs: number): boolean;
	/** 冷卻結束的絕對時間 */
	nextReadyAt(at: number, cooldownMs: number): number;
}

/** 測試用：以計數器模擬時間 */
export class FakeTimeService implements ITimeService {
	private t = 0;

	now(): number {
		return this.t;
	}

	advance(ms: number): void {
		this.t += ms;
	}

	isReady(at: number, cooldownMs: number): boolean {
		return this.t < at + cooldownMs;
	}

	nextReadyAt(at: number, cooldownMs: number): number {
		return at + cooldownMs;
	}
}

/** 正式環境：以真實 Date.now() 為基礎（無法 advance） */
export class RealTimeService implements ITimeService {
	now(): number {
		return Date.now();
	}

	advance(): void {
		throw new Error('RealTimeService cannot advance virtual clock');
	}

	isReady(at: number, cooldownMs: number): boolean {
		return this.now() < at + cooldownMs;
	}

	nextReadyAt(at: number, cooldownMs: number): number {
		return at + cooldownMs;
	}
}
