/**
 * PartySelect 選角區塊元件
 * Party select component
 *
 * checkbox 多選名冊：上限 MAX_CHAR（5）人，滿 5 人時未勾選項不可再勾；
 * 0 人時顯示提示（Battle 按鈕由 ShowcasePage 依同一條件禁用）。
 * Checkbox multi-select roster: capped at MAX_CHAR (5); once 5 are picked the
 * remaining unchecked boxes are disabled; shows a hint at 0 members (the Battle
 * button is disabled by ShowcasePage under the same condition).
 */
import React from 'react';
import { MAX_CHAR } from '#/lib/game/constants';
import { SHOWCASE_ROSTER } from '#/lib/showcase/roster';
import type { IRosterEntry } from '#/lib/showcase/roster';
import './PartySelect.css';
import '#/components/shared/SharedBase.css';

/** PartySelect 屬性 / PartySelect props */
export interface IPartySelectProps {
  /** 已選角色 def no / Selected char def nos */
  selected: readonly number[];
  /** 勾選切換回调（傳入 def no）/ Toggle callback (def no) */
  onToggle: (no: number) => void;
  /** 人數上限（預設 MAX_CHAR）/ Party size cap (default MAX_CHAR) */
  max?: number;
}

/**
 * 單一角色選項（checkbox 卡片）
 * One character option (checkbox card)
 */
const RosterCard: React.FC<{
  entry: IRosterEntry;
  checked: boolean;
  disabled: boolean;
  onToggle: (no: number) => void;
}> = ({ entry, checked, disabled, onToggle }) => (
  <label
    className={`party-card${checked ? ' is-checked' : ''}${disabled ? ' is-disabled' : ''}`}
  >
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={() => onToggle(entry.no)}
    />
    <span
      className="party-card-sprite"
      style={{ backgroundImage: `url(${entry.spriteUrl})` }}
      aria-hidden="true"
    />
    <span className="party-card-body">
      <span className="party-card-name">{entry.name}</span>
      <span className="party-card-meta">
        Lv.{entry.level} {entry.jobName}
      </span>
    </span>
  </label>
);

/**
 * PartySelect 選角區塊元件
 * Party select component
 */
export const PartySelect: React.FC<IPartySelectProps> = ({
  selected,
  onToggle,
  max = MAX_CHAR,
}) => {
  const count = selected.length;
  const full = count >= max;

  return (
    <section className="party-select" aria-labelledby="party-select-heading">
      <h2 id="party-select-heading" className="party-select-heading">
        隊伍成員 / Your Party
        <span className={`party-select-count${full ? ' is-full' : ''}`}>
          {count}/{max}
        </span>
      </h2>

      <div className="party-select-list">
        {SHOWCASE_ROSTER.map((entry) => {
          const checked = selected.includes(entry.no);
          // 滿上限後，未勾選項禁用（再選需先取消一名）
          // Once full, unchecked options are disabled (deselect to free a slot)
          const disabled = !checked && full;
          return (
            <RosterCard
              key={entry.no}
              entry={entry}
              checked={checked}
              disabled={disabled}
              onToggle={onToggle}
            />
          );
        })}
      </div>

      {count === 0 && (
        <p className="party-select-hint" role="alert">
          ⚠ 至少選擇 1 名隊員才能開戰 / Select at least one member to battle.
        </p>
      )}
      {full && (
        <p className="party-select-note">
          已達上限 {max} 人，取消一名才能再選 / Party is full ({max}); deselect one to change.
        </p>
      )}
    </section>
  );
};
