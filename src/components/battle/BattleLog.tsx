/**
 * 戰鬥日誌組件
 * Battle log component
 *
 * 依原始行動順序（時間序）逐列輸出：每列僅有一個行動，並置於其所屬隊伍的欄位
 * （左隊 → 左欄、右隊 → 右欄），另一欄留空以維持欄位對齊。
 * Emits one row per action in the original (chronological) order: each row holds exactly
 * one action placed in its own team's column (left team → left column, right team →
 * right column), with the other column left empty to keep the columns aligned.
 *
 * 布局為響應式 div（非 table）：窄螢幕時自動改為單欄，僅顯示有行動的一側。
 * Layout is responsive divs (not a table): on narrow screens it collapses to a single
 * column and only the populated side is shown.
 */
import React from 'react';
import { EnumTeamSideUI } from './enums';
import type { IBattleAction } from './types';
import { BattleAction } from './BattleAction';
import { getSideClass } from './battleUtils';
import './BattleLog.css';
import '#/components/shared/SharedBase.css';

/** 戰鬥日誌屬性 / Battle log props */
export interface IBattleLogProps {
  /** 行動列表（依時間序）/ Action list (chronological order) */
  actions: IBattleAction[];
  /** 是否使用雙欄布局 / Whether to use two-column layout */
  twoColumn?: boolean;
}

/**
 * 戰鬥日誌組件
 * Battle log component
 */
export const BattleLog: React.FC<IBattleLogProps> = ({
  actions,
  twoColumn = true,
}) => {
  // 單欄模式：每個行動獨立一列（維持時間序）
  // Single-column mode: one row per action (keeps chronological order)
  if (!twoColumn) {
    return (
      <div className="battle-log battle-log--single">
        {actions.map((action, index) => (
          <div className="log-row" key={index}>
            <div className="log-cell log-cell--full">
              <BattleAction action={action} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="battle-log battle-log--two-col">
      {actions.map((action, index) => {
        // 未指定側別時歸左欄（沿用既有行為）
        // Actions without a side fall back to the left column (prior behaviour)
        const isRight = action.side === EnumTeamSideUI.Right;
        return (
          <div className="log-row" key={index}>
            <div className={`log-cell log-cell--left ${getSideClass(EnumTeamSideUI.Left)}`}>
              {!isRight && <BattleAction action={action} />}
            </div>
            <div className={`log-cell log-cell--right ${getSideClass(EnumTeamSideUI.Right)}`}>
              {isRight && <BattleAction action={action} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
