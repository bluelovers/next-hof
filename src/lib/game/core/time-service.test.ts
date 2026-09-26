import { describe, it, expect } from 'vitest';
import { FakeTimer } from 'fake-timer';
import { GameTime } from './time-service';

/**
 * 自建立以來的虛擬毫秒——fake-timer 的標準讀法（絕對時鐘 `timer.now()` 對 `initTime` 取差）。
 * Virtual ms elapsed since creation — the fake-timer way (diff the absolute clock `timer.now()`
 * against `initTime`).
 */
const elapsed = (t: GameTime): number => t.timer.now().diff(t.initTime);

describe('GameTime (fake-timer)', () => {
	it('is a FakeTimer whose virtual clock starts at 0', () => {
		const t = new GameTime();
		expect(t).toBeInstanceOf(FakeTimer);
		expect(elapsed(t)).toBe(0);
	});

	it('start(ms) advances the clock and runs expired callbacks with the final time', () => {
		const t = new GameTime();
		const seen: number[] = [];
		t.setTimeout(() => seen.push(elapsed(t)), 500);
		t.setTimeout(() => seen.push(elapsed(t)), 1500);

		t.start(1000);
		expect(elapsed(t)).toBe(1000);
		// 回呼讀到本輪最終時間，而非各自排程邊界（對齊原生 setTimeout）
		// Callbacks read the run's final time, not their own scheduled boundaries (native-like)
		expect(seen).toEqual([1000]);

		t.start(500);
		expect(elapsed(t)).toBe(1500);
		expect(seen).toEqual([1000, 1500]);
	});

	it('callback receives the owning GameTime as self', () => {
		const t = new GameTime();
		let self: unknown;
		t.setTimeout((_current, owner) => {
			self = owner;
		}, 100);
		t.start(100);
		expect(self).toBe(t);
	});

	it('setInterval catches up once per interval boundary within a single start()', () => {
		const t = new GameTime();
		let fires = 0;
		t.setInterval(() => {
			fires++;
		}, 100);
		t.start(350);
		// 一次 start 跨 100 / 200 / 300 三個週期邊界 → 補償觸發 3 次、不漂移
		// One start crosses the 100 / 200 / 300 boundaries → 3 catch-up fires, no drift
		expect(fires).toBe(3);
		expect(elapsed(t)).toBe(350);
	});

	it('clearTimeout cancels a pending timer and reset rewinds the clock', () => {
		const t = new GameTime();
		let fired = 0;
		const item = t.setTimeout(() => {
			fired++;
		}, 1000);
		t.clearTimeout(item);
		t.start(2000);
		expect(fired).toBe(0);

		t.setTimeout(() => {
			fired++;
		}, 100);
		t.start(100);
		expect(fired).toBe(1);

		t.reset();
		expect(elapsed(t)).toBe(0);
	});

	it('instances keep independent clocks', () => {
		const a = new GameTime();
		const b = new GameTime();
		a.start(1000);
		expect(elapsed(a)).toBe(1000);
		expect(elapsed(b)).toBe(0);
	});
});
