/**
 * 排版框位置即時 store
 * Live sprite-frame offset store
 *
 * 拖曳期間的「即時座標」原本走 Storybook args 回寫管線：
 * 每次回寫都會重繪整棵 story 樹（面板＋雙框＋參考線＋精靈子樹），
 * 且管線本身有延遲與合併（Storybook 每次 rerender 至少等待 100ms 的動畫檢查），
 * 導致拖曳卡頓與放開後舊座標回送的「回彈／繼續移動」。
 *
 * 本 store 是繞過 args 管線的輕量訂閱通道：元件在座標「實際變動」時 publish，
 * 面板等讀值端 subscribe 後以 DOM 直接更新（或自行節流），
 * 全程零 story 重繪、零 args 寫入；args 只在拖曳結束時單次寫回最終座標。
 *
 * This store is the lightweight subscription channel that bypasses the args pipeline:
 * the component publishes whenever its offset actually changes, and readout consumers
 * (the edit panel) subscribe and update the DOM directly (or throttle on their own).
 * Nothing here re-renders the story or writes args; args receive one final write on release.
 *
 * 通知以 side 為單位節流（預設約 10Hz）：值立即可讀（getSnapshot），
 * 但 listener 通知間隔受 throttleMs 節制，並以尾端計時器保證最後一個值一定會送達。
 * Notifications are throttled per side (default ~10Hz): values are immediately readable
 * via getSnapshot, while listener calls are limited to every throttleMs with a trailing
 * timer that guarantees the final value is always delivered.
 */
import type { IBattleFieldFrameOffset } from './types';
import { EnumTeamSideUI } from '#/components/battle/enums';

/**
 * 通知節流間隔（ms）
 * Notification throttle interval (ms)
 *
 * 約 10Hz：面板 % 讀值的「即時感」足夠，又不會讓讀值端的更新成本干擾拖曳。
 * About 10Hz: keeps the panel % readout feeling live without letting readout update
 * cost interfere with dragging.
 */
export const FRAME_OFFSET_LIVE_THROTTLE_MS = 100;

/**
 * 排版框位置即時 store 介面
 * Live frame-offset store interface
 */
export interface IFrameOffsetLiveStore
{
	/**
	 * 訂閱單側的位置變動通知；回傳取消訂閱函式
	 * Subscribe to one side's position-change notifications; returns an unsubscribe function
	 */
	subscribe(side: EnumTeamSideUI, listener: () => void): () => void;
	/**
	 * 讀取單側的最新位置（無發布過則為 null；值變動前引用保持穩定，符合 useSyncExternalStore 約定）
	 * Read the latest offset of one side (null when never published; the reference stays stable
	 * between changes, satisfying the useSyncExternalStore contract)
	 */
	getSnapshot(side: EnumTeamSideUI): IBattleFieldFrameOffset | null;
	/**
	 * 發布單側的最新位置（同值略過；通知依 throttleMs 節流並保證尾端送達）
	 * Publish the latest offset of one side (identical values are skipped; notifications are
	 * throttled by throttleMs with a guaranteed trailing delivery)
	 */
	publish(side: EnumTeamSideUI, offset: IBattleFieldFrameOffset | null): void;
}

/**
 * 建立一個獨立的即時 store 實例（測試與多實例需求用）
 * Create an independent live-store instance (for tests and multiple instances)
 */
export function createFrameOffsetLiveStore(
	throttleMs: number = FRAME_OFFSET_LIVE_THROTTLE_MS,
): IFrameOffsetLiveStore
{
	/** 各側最新值 / Latest value per side */
	const values = new Map<EnumTeamSideUI, IBattleFieldFrameOffset | null>();
	/** 各側訂閱者 / Subscribers per side */
	const listeners = new Map<EnumTeamSideUI, Set<() => void>>();
	/** 各側最後一次通知時刻（ms） / Timestamp of the last notification per side (ms) */
	const lastNotifyAt = new Map<EnumTeamSideUI, number>();
	/** 各側尾端通知計時器 / Trailing notification timer per side */
	const timers = new Map<EnumTeamSideUI, ReturnType<typeof setTimeout>>();

	/** 通知單側所有訂閱者 / Notify every subscriber of one side */
	const notify = (side: EnumTeamSideUI) =>
	{
		listeners.get(side)?.forEach((listener) =>
		{
			listener();
		});
	};

	/** 清除單側的尾端計時器 / Clear the trailing timer of one side */
	const clearTimer = (side: EnumTeamSideUI) =>
	{
		const timer = timers.get(side);
		if (timer !== undefined)
		{
			clearTimeout(timer);
			timers.delete(side);
		}
	};

	return {
		subscribe(side, listener)
		{
			let set = listeners.get(side);
			if (!set)
			{
				set = new Set();
				listeners.set(side, set);
			}
			set.add(listener);
			return () =>
			{
				set?.delete(listener);
				if (set && set.size === 0)
				{
					listeners.delete(side);
					/**
					 * 沒有訂閱者就一併取消尾端計時器，
					 * 避免故事切換後殘留計時器對已卸載的面板發通知。
					 * Cancel the trailing timer together so a story switch leaves no timer
					 * notifying an unmounted panel.
					 */
					clearTimer(side);
				}
			};
		},
		getSnapshot(side)
		{
			return values.get(side) ?? null;
		},
		publish(side, offset)
		{
			const current = values.get(side) ?? null;
			const same = current === offset
				|| (!!current && !!offset && current.x === offset.x && current.y === offset.y);
			if (same)
			{
				return;
			}
			values.set(side, offset);
			const now = Date.now();
			const elapsed = now - (lastNotifyAt.get(side) ?? 0);
			if (elapsed >= throttleMs)
			{
				lastNotifyAt.set(side, now);
				notify(side);
				return;
			}
			if (timers.has(side))
			{
				return;
			}
			const timer = setTimeout(() =>
			{
				timers.delete(side);
				lastNotifyAt.set(side, Date.now());
				notify(side);
			}, throttleMs - elapsed);
			timers.set(side, timer);
		},
	};
}

/**
 * 全域共用的即時 store 單例
 * Global shared live-store singleton
 *
 * 同一個 iframe 內同時只有一個故事在渲染，
 * 排版框（publish）與編輯面板（subscribe）透過此單例對接。
 * Only one story renders inside an iframe at a time, so the sprite frame (publish) and the
 * edit panel (subscribe) meet on this singleton.
 */
export const frameOffsetLiveStore = createFrameOffsetLiveStore();
