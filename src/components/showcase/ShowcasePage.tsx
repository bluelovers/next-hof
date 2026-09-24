/**
 * ShowcasePage 組隊與戰鬥展示頁（單頁主元件）
 * Showcase page: team-building and battle showcase (single-page main component)
 *
 * 狀態流程 setup → result：
 * 1. setup：PartySelect 選隊員（1–MAX_CHAR 人）、EncounterSelect 選敵方編選，
 *    0 人時 Battle 按鈕禁用並提示；
 * 2. 按 Battle 同步執行轉接層 runShowcaseBattle（瀏覽器內即時結算一整場，見 design D2）；
 * 3. result：渲染既有 BattleDisplay（隊伍／戰場／日誌／結果），「再戰一場」重置回
 *    setup（每次開戰皆新建 repo／角色，無上一場殘留 HP／日誌）。
 * State flow setup → result:
 * 1. setup: pick members with PartySelect (1–MAX_CHAR), pick an encounter with
 *    EncounterSelect; the Battle button is disabled with a hint at 0 members;
 * 2. pressing Battle runs runShowcaseBattle synchronously (one-shot settlement in
 *    the browser, see design D2);
 * 3. result: renders the existing BattleDisplay (teams/field/log/result);
 *    "再戰一場" resets back to setup (every battle builds a fresh repo/characters,
 *    so no HP/log survives from the previous run).
 */
'use client';

import React, { useState } from 'react';
import { MAX_CHAR } from '#/lib/game/constants';
import { BattleDisplay } from '#/components/pages/BattleDisplay';
import { PartySelect } from '#/components/showcase/PartySelect';
import { EncounterSelect } from '#/components/showcase/EncounterSelect';
import {
  runShowcaseBattle,
  DEFAULT_SHOWCASE_SEED,
} from '#/lib/showcase/battle-adapter';
import type { IShowcaseBattleOutcome } from '#/lib/showcase/battle-adapter';
import { DEFAULT_ENCOUNTER, getEncounter } from '#/lib/showcase/encounters';
import { EnumShowcasePhase } from '#/components/battle/enums';
import './ShowcasePage.css';
import '#/components/shared/SharedBase.css';

/** 頁面流程階段 / Page flow phase */
export type IShowcasePhase = EnumShowcasePhase;

/**
 * ShowcasePage 組隊與戰鬥展示頁主元件
 * Showcase page main component
 */
export const ShowcasePage: React.FC = () => {
  /** 已選隊員 def no / selected member def nos */
  const [selected, setSelected] = useState<number[]>([100]);
  /** 已選編選 id / selected encounter id */
  const [encounterId, setEncounterId] = useState<string>(DEFAULT_ENCOUNTER.id);
  /** 流程階段 / flow phase */
  const [phase, setPhase] = useState<EnumShowcasePhase>(EnumShowcasePhase.Setup);
  /** 已完成的戰鬥資料 / completed battle data */
  const [battle, setBattle] = useState<IShowcaseBattleOutcome | null>(null);
  /** 錯誤提示（開戰失敗時顯示）/ error message (shown when a battle fails) */
  const [error, setError] = useState<string | null>(null);

  /**
   * 隊員勾選切換：滿 MAX_CHAR 時拒絕新增（PartySelect 同步禁用未勾選項）
   * Toggle a member: refuse additions at MAX_CHAR (PartySelect also disables unchecked boxes)
   */
  const handleToggle = (no: number): void => {
    setSelected((prev) => {
      if (prev.includes(no)) return prev.filter((n) => n !== no);
      if (prev.length >= MAX_CHAR) return prev;
      return [...prev, no];
    });
  };

  /**
   * 開戰：0 人不執行並提示；成功即進入 result
   * Start battle: 0 members never runs and shows a hint; success moves to result
   */
  const handleBattle = (): void => {
    if (selected.length < 1) {
      setError('請至少選擇 1 名隊員 / Select at least one member first.');
      return;
    }
    if (selected.length > MAX_CHAR) {
      setError(`隊伍最多 ${MAX_CHAR} 人 / Party is limited to ${MAX_CHAR} members.`);
      return;
    }
    const encounter = getEncounter(encounterId) ?? DEFAULT_ENCOUNTER;
    try {
      const outcome = runShowcaseBattle({
        charNos: selected,
        monNos: encounter.monNos,
        seed: DEFAULT_SHOWCASE_SEED,
        enemyTeamName: encounter.teamName,
      });
      setBattle(outcome);
      setError(null);
      setPhase(EnumShowcasePhase.Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  /**
   * 再戰一場：清空戰鬥資料並回到 setup（狀態全新）
   * Fight again: clear battle data and return to setup (fresh state)
   */
  const handleReset = (): void => {
    setBattle(null);
    setError(null);
    setPhase(EnumShowcasePhase.Setup);
  };

  const emptyParty = selected.length === 0;

  return (
    <div className="showcase">
      <header className="showcase-header">
        <h1 className="showcase-title">組隊與戰鬥展示頁 / Team Battle Showcase</h1>
        <p className="showcase-desc">
          選隊員、選敵方編選，即時結算一整場戰鬥 / Pick your party and an encounter,
          then settle a full battle instantly.
        </p>
      </header>

      {phase === EnumShowcasePhase.Setup || !battle ? (
        <section className="showcase-setup" aria-label="battle setup">
          <PartySelect selected={selected} onToggle={handleToggle} />
          <EncounterSelect selectedId={encounterId} onChange={setEncounterId} />

          <div className="showcase-actions">
            <button
              type="button"
              className="showcase-battle-button"
              disabled={emptyParty}
              onClick={handleBattle}
            >
              Battle！開戰
            </button>
            {emptyParty && (
              <span className="showcase-hint" role="alert">
                ⚠ 至少選擇 1 名隊員才能開戰 / Select at least one member to battle.
              </span>
            )}
          </div>

          {error && (
            <p className="showcase-error" role="alert">
              {error}
            </p>
          )}
        </section>
      ) : (
        <section className="showcase-result" aria-label="battle result">
          <BattleDisplay data={battle.data} showSpriteLabels />
          <div className="showcase-actions">
            <button
              type="button"
              className="showcase-battle-button"
              onClick={handleReset}
            >
              再戰一場 / Fight Again
            </button>
            <span className="showcase-hint">
              回到組隊畫面可更換隊員與編選 / Back to setup to change party or encounter.
            </span>
          </div>
        </section>
      )}
    </div>
  );
};
