/**
 * 排版框位置即時 store 測試
 * Live frame-offset store tests
 *
 * 驗證：值立即可讀、通知節流與尾端送達、取消訂閱、雙側隔離、
 * 重複發布去重、以及 getSnapshot 引用穩定（useSyncExternalStore 約定）。
 * Verifies: immediate read, throttled notification with guaranteed trailing delivery,
 * unsubscribe, per-side isolation, duplicate-publish de-duplication, and stable
 * snapshot references (the useSyncExternalStore contract).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	createFrameOffsetLiveStore,
	FRAME_OFFSET_LIVE_THROTTLE_MS,
} from './frameOffsetLiveStore';
import { EnumTeamSideUI } from './enums';
import type { IBattleFieldFrameOffset } from './types';

/** 建立座標 / Build an offset */
function offset(x: number, y: number): IBattleFieldFrameOffset
{
	return { x, y };
}

describe('frameOffsetLiveStore', () =>
{
	beforeEach(() =>
	{
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
	});

	afterEach(() =>
	{
		vi.useRealTimers();
	});

	it('發布後立即可讀，通知在間隔到期時同步送達', () =>
	{
		const store = createFrameOffsetLiveStore(100);
		const listener = vi.fn();
		store.subscribe(EnumTeamSideUI.Left, listener);

		/**
		 * 首次發布：lastNotifyAt 起始為 0，Date.now()（fake 起點 0）相減等於 0 < 100，
		 * 會排入尾端計時器而非同步通知——先把時鐘推進以跨過節流窗。
		 * First publish: lastNotifyAt starts at 0 and fake Date.now() is also 0, so
		 * elapsed = 0 < 100 and a trailing timer is scheduled instead of a sync notify —
		 * advance the clock past the throttle window first.
		 */
		vi.advanceTimersByTime(150);
		store.publish(EnumTeamSideUI.Left, offset(10, 20));

		expect(store.getSnapshot(EnumTeamSideUI.Left)).toEqual({ x: 10, y: 20 });
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('節流窗內的連續發布只通知一次，尾端計時器補送最後一個值', () =>
	{
		const store = createFrameOffsetLiveStore(100);
		const listener = vi.fn();
		store.subscribe(EnumTeamSideUI.Left, listener);
		vi.advanceTimersByTime(150);

		store.publish(EnumTeamSideUI.Left, offset(1, 1));
		expect(listener).toHaveBeenCalledTimes(1);

		/** 節流窗內再發布 → 不同步通知，僅安排尾端計時器 / Further publishes inside the window only schedule the trailing timer */
		store.publish(EnumTeamSideUI.Left, offset(2, 2));
		store.publish(EnumTeamSideUI.Left, offset(3, 3));
		expect(listener).toHaveBeenCalledTimes(1);
		/** 值本身立即可讀 / Values are readable immediately */
		expect(store.getSnapshot(EnumTeamSideUI.Left)).toEqual({ x: 3, y: 3 });

		vi.advanceTimersByTime(100);
		/** 尾端通知送達時帶出最後一個值 / The trailing notify carries the final value */
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it('同值發布不重複通知', () =>
	{
		const store = createFrameOffsetLiveStore(100);
		const listener = vi.fn();
		store.subscribe(EnumTeamSideUI.Left, listener);
		vi.advanceTimersByTime(150);

		store.publish(EnumTeamSideUI.Left, offset(5, 6));
		store.publish(EnumTeamSideUI.Left, offset(5, 6));
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('取消訂閱後不再收到通知', () =>
	{
		const store = createFrameOffsetLiveStore(100);
		const listener = vi.fn();
		const unsubscribe = store.subscribe(EnumTeamSideUI.Left, listener);
		vi.advanceTimersByTime(150);

		store.publish(EnumTeamSideUI.Left, offset(1, 0));
		expect(listener).toHaveBeenCalledTimes(1);

		unsubscribe();
		store.publish(EnumTeamSideUI.Left, offset(2, 0));
		expect(listener).toHaveBeenCalledTimes(1);
		/** 值仍會更新（只是沒有通知者） / The value still updates (there is just no listener) */
		expect(store.getSnapshot(EnumTeamSideUI.Left)).toEqual({ x: 2, y: 0 });
	});

	it('左右兩側互不干擾：各側獨立快照與通知', () =>
	{
		const store = createFrameOffsetLiveStore(100);
		const leftListener = vi.fn();
		const rightListener = vi.fn();
		store.subscribe(EnumTeamSideUI.Left, leftListener);
		store.subscribe(EnumTeamSideUI.Right, rightListener);
		vi.advanceTimersByTime(150);

		store.publish(EnumTeamSideUI.Left, offset(7, 8));
		expect(leftListener).toHaveBeenCalledTimes(1);
		expect(rightListener).not.toHaveBeenCalled();
		expect(store.getSnapshot(EnumTeamSideUI.Right)).toBeNull();

		store.publish(EnumTeamSideUI.Right, offset(9, 10));
		expect(rightListener).toHaveBeenCalledTimes(1);
		expect(store.getSnapshot(EnumTeamSideUI.Left)).toEqual({ x: 7, y: 8 });
		expect(store.getSnapshot(EnumTeamSideUI.Right)).toEqual({ x: 9, y: 10 });
	});

	it('getSnapshot 引用在未變動期間保持穩定（useSyncExternalStore 約定）', () =>
	{
		const store = createFrameOffsetLiveStore(100);
		vi.advanceTimersByTime(150);
		store.publish(EnumTeamSideUI.Left, offset(3, 4));

		const first = store.getSnapshot(EnumTeamSideUI.Left);
		const second = store.getSnapshot(EnumTeamSideUI.Left);
		expect(second).toBe(first);
		expect(store.getSnapshot(EnumTeamSideUI.Right)).toBeNull();
	});

	it('解除訂閱會取消尚未送達的尾端計時器', () =>
	{
		const store = createFrameOffsetLiveStore(100);
		const listener = vi.fn();
		vi.advanceTimersByTime(150);
		store.publish(EnumTeamSideUI.Left, offset(1, 1));
		expect(listener).not.toHaveBeenCalled();

		const unsubscribe = store.subscribe(EnumTeamSideUI.Left, listener);
		store.publish(EnumTeamSideUI.Left, offset(2, 2));
		unsubscribe();

		vi.advanceTimersByTime(500);
		expect(listener).not.toHaveBeenCalled();
	});

	it('publish null 表示交回 CSS 對齊，讀值端收到通知後可退回預設值', () =>
	{
		const store = createFrameOffsetLiveStore(100);
		const listener = vi.fn();
		store.subscribe(EnumTeamSideUI.Left, listener);
		vi.advanceTimersByTime(150);

		store.publish(EnumTeamSideUI.Left, offset(1, 1));
		store.publish(EnumTeamSideUI.Left, null);
		/** 節流窗內的第二次發布由尾端計時器補送 / The second publish (inside the throttle window) is delivered by the trailing timer */
		vi.advanceTimersByTime(100);
		expect(listener).toHaveBeenCalledTimes(2);
		expect(store.getSnapshot(EnumTeamSideUI.Left)).toBeNull();
	});
});
