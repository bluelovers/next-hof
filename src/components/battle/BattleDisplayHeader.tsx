/**
 * 戰鬥標題列組件
 * Battle display header component
 *
 * 顯示戰鬥標題與開戰時間（皆為選填；無標題時不輸出任何內容）
 * Shows the battle title and the start time (both optional; renders nothing without a title)
 *
 * 原始來源：src/components/pages/BattleDisplay.tsx 的 header 區塊
 * Source: the header block of src/components/pages/BattleDisplay.tsx
 */
import React from 'react';
import type { IDisplayTimeString } from './types';
import './BattleDisplayHeader.css';
import '#/components/shared/SharedBase.css';

/** 戰鬥標題列屬性 / Battle display header props */
export interface IBattleDisplayHeaderProps {
  /** 戰鬥標題（選填；未提供時不渲染）/ Battle title (optional; omitted when absent) */
  title?: string;
  /** 戰鬥時間（顯示於標題下方）/ Battle time (shown below the title) */
  time?: IDisplayTimeString;
}

/**
 * 戰鬥標題列組件
 * Battle display header component
 */
export const BattleDisplayHeader: React.FC<IBattleDisplayHeaderProps> = ({ title, time }) => {
  if (!title) return null;

  return (
    <header className="battle-header divider-bottom">
      <h2 className="battle-title">{title}</h2>
      {time && (
        <div className="battle-time">
          this battle starts at
          <br />
          {time}
        </div>
      )}
    </header>
  );
};
