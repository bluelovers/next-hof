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
  const { winner, leftTeam, rightTeam } = result;

  /**
   * 判斷左側是否勝利
   * Determine if left side wins
   */
  const leftWins = winner === leftTeamName;

  return (
    <>
      <tr>
        <td
          colSpan={2}
          className="break break-top"
          style={{ textAlign: 'center', padding: '10px 0px' }}
        >
          <div className={`result-title ${leftWins ? 'win' : 'lose'}`}>
            {winner} Wins!
          </div>
        </td>
      </tr>
      <tr>
        <TeamStats stats={leftTeam} />
        <TeamStats stats={rightTeam} />
      </tr>
    </>
  );
};
