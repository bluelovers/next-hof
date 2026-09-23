/**
 * 戰鬥結果組件
 * Battle result component
 *
 * 顯示勝利方宣告與雙方最終統計數據
 * Displays winner announcement and final stats for both teams
 */
import React from 'react';
import type { IBattleResult, ITeamFinalStats } from './types';
import './BattleResult.css';

/** 戰鬥結果屬性 / Battle result props */
export interface IBattleResultProps {
  /** 結果資料 / Result data */
  result: IBattleResult;
  /** 左側隊伍名稱 / Left team name */
  leftTeamName: string;
  /** 右側隊伍名稱 / Right team name */
  rightTeamName: string;
}

/**
 * 渲染隊伍統計數據（單一事實來源）
 * Render team final stats (single source of truth)
 *
 * 提取自 leftTeam / rightTeam 重複渲染邏輯
 * Extracted from duplicated leftTeam / rightTeam rendering logic
 */
const TeamStats: React.FC<{ stats: ITeamFinalStats }> = ({ stats }) => (
  <td className="result-stats">
    <div className="stat-row">
      HP remain : {stats.hpRemain}/{stats.totalUnits > 0 ? stats.hpRemain : 0}
    </div>
    <div className="stat-row">
      Alive : {stats.alive}/{stats.totalUnits}
    </div>
    <div className="stat-row">
      TotalDamage : {stats.totalDamage ?? 0}
    </div>
    {stats.totalExp !== undefined && (
      <div className="stat-row">
        TotalExp : {stats.totalExp}
      </div>
    )}
    {stats.funds !== undefined && (
      <div className="stat-row">
        Funds : $&nbsp;{stats.funds}
      </div>
    )}
  </td>
);

/**
 * 戰鬥結果組件
 * Battle result component
 */
export const BattleResult: React.FC<IBattleResultProps> = ({
  result,
  leftTeamName,
  rightTeamName,
}) => {
  const { winner, leftTeam, rightTeam, isDraw } = result;

  /**
   * 判斷左側是否勝利
   * Determine if left side wins
   */
  const leftWins = winner === leftTeamName;

  /**
   * 標題樣式與文字：平手時不帶 win/lose 配色，改顯示「Draw!」
   * Title style/text: a draw gets no win/lose colouring and shows "Draw!"
   */
  const titleClass = isDraw ? 'result-title' : leftWins ? 'result-title win' : 'result-title lose';
  const titleText = isDraw ? 'Draw!' : `${winner} Wins!`;

  return (
    <>
      <tr>
        <td
          colSpan={2}
          className="break break-top"
          style={{ textAlign: 'center', padding: '10px 0px' }}
        >
          <div className={titleClass}>{titleText}</div>
        </td>
      </tr>
      <tr>
        <TeamStats stats={leftTeam} />
        <TeamStats stats={rightTeam} />
      </tr>
    </>
  );
};
