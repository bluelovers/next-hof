/**
 * 隊伍側邊面板容器組件
 * Team side panel container component
 *
 * 抽離 BattleTeamInfo 與 BattleResult（TeamStats）重複的
 * `<div className={`teams ${sideClass}`}>` 包裝層，統一由單一處組出
 * 「面板基礎 class（teams）＋ 側邊 class（ttd2/ttd1）＋ 附加 class」的 className。
 * Extracts the duplicated `<div className={`teams ${sideClass}`}>` wrapper shared by
 * BattleTeamInfo and BattleResult (TeamStats), so a single place composes the
 * "base panel class (teams) + side class (ttd2/ttd1) + extra class" className.
 */
import React from 'react';
import type { EnumTeamSideClass } from './enums';
import './BattleSidePanel.css';
import '#/components/shared/SharedBase.css';

/** 隊伍側邊面板屬性 / Team side panel props */
export interface IBattleSidePanelProps {
  /** 隊伍側邊類別 / Team side CSS class */
  sideClass: EnumTeamSideClass;
  /** 附加 class（沿用標準 React 命名；例如 BattleResult 的 result-stats）
   * Extra class (standard React naming; e.g. BattleResult's result-stats) */
  className?: string;
  /** 面板內容 / Panel content */
  children: React.ReactNode;
}

/**
 * 隊伍側邊面板容器組件
 * Team side panel container component
 *
 * 純版面容器，不持有任何業務資料；內容由 children 提供。
 * A pure layout container with no business data; content comes via children.
 */
export const BattleSidePanel: React.FC<IBattleSidePanelProps> = ({
  sideClass,
  className,
  children,
}) => (
  <div className={`teams ${sideClass}${className ? ` ${className}` : ''}`}>
    {children}
  </div>
);
