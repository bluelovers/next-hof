/**
 * 戰鬥日誌組件
 * Battle log component
 *
 * 顯示所有戰鬥行動的日誌列表
 * 支援分欄顯示（左側隊伍 vs 右側隊伍）
 * Displays a list of all battle actions
 * Supports two-column layout (left team vs right team)
 */
import React from 'react';
import type { IBattleAction, ITeamSide } from './types';
import { BattleAction } from './BattleAction';
import { getSideClass } from './battleUtils';
import '../pages/Shared.css';

/** 戰鬥日誌屬性 / Battle log props */
export interface IBattleLogProps {
  /** 行動列表 / Action list */
  actions: IBattleAction[];
  /** 是否使用雙欄布局 / Whether to use two-column layout */
  twoColumn?: boolean;
}

/** 分欄日誌條目 / Column log entry */
interface IColumnEntry {
  left: IBattleAction[];
  right: IBattleAction[];
}

/**
 * 將行動分為左右兩欄
 * Split actions into left and right columns
 */
function splitBySide(actions: IBattleAction[]): IColumnEntry[] {
  const entries: IColumnEntry[] = [];
  let current: IColumnEntry = { left: [], right: [] };

  for (const action of actions) {
    if (action.side === 'left') {
      current.left.push(action);
    } else if (action.side === 'right') {
      current.right.push(action);
    } else {
      // 無指定隊伍側，放入左欄
      current.left.push(action);
    }
  }

  entries.push(current);
  return entries;
}

/**
 * 戰鬥日誌組件
 * Battle log component
 */
export const BattleLog: React.FC<IBattleLogProps> = ({
  actions,
  twoColumn = true,
}) => {
  if (!twoColumn) {
    return (
      <tr>
        <td colSpan={2}>
          {actions.map((action, index) => (
            <BattleAction key={index} action={action} />
          ))}
        </td>
      </tr>
    );
  }

  const entries = splitBySide(actions);

  return (
    <>
      {entries.map((entry, rowIndex) => {
        const maxLen = Math.max(entry.left.length, entry.right.length);
        if (maxLen === 0) return null;

        const rows: Array<{ left?: IBattleAction; right?: IBattleAction }> = [];
        for (let i = 0; i < maxLen; i++) {
          rows.push({
            left: entry.left[i],
            right: entry.right[i],
          });
        }

        return rows.map((row, colIndex) => (
          <tr key={`${rowIndex}-${colIndex}`}>
            <td className={`${getSideClass('left')} break`}>
              {row.left && <BattleAction action={row.left} />}
            </td>
            <td className={`${getSideClass('right')} break`}>
              {row.right && <BattleAction action={row.right} />}
            </td>
          </tr>
        ));
      })}
    </>
  );
};
