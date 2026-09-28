/**
 * 遊戲虛擬時鐘（基於 fake-timer）/ Game virtual clock (built on fake-timer)
 *
 * 本模組取代已廢棄的 FakeTimeService / ITimeService：不再自刻計數器與冷卻 helper
 * （isReady / nextReadyAt 一併廢棄），也不添加任何與 fake-timer 衝突的自創 API
 * （不覆寫 now()、不改寫回呼簽章）——GameTime 只是 FakeTimer 的遊戲側子類，
 * 排程、推進、執行與取消全部沿用 fake-timer 的公開行為。
 *
 * This module replaces the deprecated FakeTimeService / ITimeService: no hand-rolled counter,
 * no cooldown helpers (isReady / nextReadyAt dropped), and no custom API that would conflict
 * with fake-timer (no now() override, no reshaped callback signature) — GameTime is merely the
 * game-facing subclass of FakeTimer; scheduling, advancing, running and cancelling all keep
 * fake-timer's public behaviour.
 *
 * 用法 / Usage:
 *   const t = new GameTime();
 *   t.setTimeout(cb, 1000);                              // 排程 / schedule
 *   t.start(1000);                                       // 推進 + 執行到期回呼 / advance + run
 *   t.timer.now().diff(t.initTime);                      // 自建立以來的虛擬毫秒 / virtual ms elapsed
 *
 * 完整語意（回呼讀到最終時間、time-jump 防護、start(-1) 逐格前進、回呼簽章 current/self/...params）
 * 見 node_modules/fake-timer/docs；請只用公開 API，勿碰 timer.sort / timer.cache / timer.data。
 * Full semantics (callbacks read the final time, the time-jump guard, start(-1) stepping, the
 * callback signature current/self/...params) live in node_modules/fake-timer/docs; use only the
 * public API and avoid timer.sort / timer.cache / timer.data.
 */

import { FakeTimer } from 'fake-timer';

/**
 * 遊戲虛擬時鐘：fake-timer `FakeTimer` 的遊戲側子類（目前不新增任何成員）。
 * Game virtual clock: the game-facing subclass of fake-timer's `FakeTimer` (adds no members yet).
 *
 * 為什麼是子類而不是型別別名：讓遊戲側有獨立名稱可注入（如 `IBattleConfig.timeService`），
 * 並保留日後集中擴充的位置；擴充時必須以 fake-timer 公開 API 為基礎，不得改寫其語意。
 *
 * Why a subclass instead of a type alias: it gives the game side its own injectable name
 * (e.g. `IBattleConfig.timeService`) and a single place for future extensions; any extension
 * must build on fake-timer's public API without altering its semantics.
 *
 * 讀時間一律走 fake-timer：絕對時鐘 `t.timer.now()`（`dayjs`），經過毫秒
 * `t.timer.now().diff(t.initTime)`（`initTime` 為公開取值）。
 * Read time the fake-timer way: the absolute clock `t.timer.now()` (`dayjs`), elapsed ms via
 * `t.timer.now().diff(t.initTime)` (`initTime` is the public accessor).
 */
export class GameTime extends FakeTimer
{
}
