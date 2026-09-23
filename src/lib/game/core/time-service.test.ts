import { describe, it, expect } from 'vitest';
import { FakeTimeService, RealTimeService } from './time-service';

describe('FakeTimeService', () => {
	it('advances deterministically and reports cooldown state', () => {
		const ts = new FakeTimeService();
		expect(ts.now()).toBe(0);
		ts.advance(1200);
		expect(ts.now()).toBe(1200);
		// 對應規格場景：now()=1200 時
		expect(ts.isReady(0, 1000)).toBe(false); // 0+1000=1000 <= 1200 → 仍在冷卻
		expect(ts.isReady(0, 1500)).toBe(true); // 0+1500=1500 > 1200 → 冷卻結束
		expect(ts.nextReadyAt(0, 1000)).toBe(1000);
	});

	it('RealTimeService reports a non-negative clock', () => {
		const ts = new RealTimeService();
		expect(ts.now()).toBeGreaterThanOrEqual(0);
	});
});
