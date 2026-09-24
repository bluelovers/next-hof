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
 * 如此既保留「哪一隊行動」的資訊，也讓由上而下的閱讀順序反映戰鬥時間先後
 * （不再把左右行動並列而失去時序）。
 * This keeps side attribution while the top-to-bottom order reflects battle time
 * (no more side-by-side pairing that loses chronological order).
 */
import React from 'react';
import { EnumTeamSideUI } from './enums';
import type { IBattleAction } from './types';
import { BattleAction } from './BattleAction';
import { getSideClass } from './battleUtils';
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
      <>
        {actions.map((action, index) => (
          <tr key={index}>
            <td colSpan={2} className="break">
              <BattleAction action={action} />
            </td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <>
      {actions.map((action, index) => {
        // 未指定側別時歸左欄（沿用既有行為）
        // Actions without a side fall back to the left column (prior behaviour)
        const isRight = action.side === EnumTeamSideUI.Right;
        return (
          <tr key={index}>
            <td className={`${getSideClass(EnumTeamSideUI.Left)} break`}>
              {isRight ? '\u00a0' : <BattleAction action={action} />}
            </td>
            <td className={`${getSideClass(EnumTeamSideUI.Right)} break`}>
              {isRight ? <BattleAction action={action} /> : '\u00a0'}
            </td>
          </tr>
        );
      })}
    </>
  );
};
