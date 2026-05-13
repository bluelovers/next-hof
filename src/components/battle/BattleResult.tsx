/**
 * 戰鬥結果組件
 * Battle result component
 *
 * 顯示勝利方宣告與雙方最終統計數據
 * Displays winner announcement and final stats for both teams
 */
import React from 'react';
import type { IBattleResult } from './types';
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
        <td className="result-stats">
          <div className="stat-row">
            HP remain : {leftTeam.hpRemain}/{leftTeam.totalUnits > 0 ? leftTeam.hpRemain : 0}
          </div>
          <div className="stat-row">
            Alive : {leftTeam.alive}/{leftTeam.totalUnits}
          </div>
          <div className="stat-row">
            TotalDamage : {leftTeam.totalDamage ?? 0}
          </div>
          {leftTeam.totalExp !== undefined && (
            <div className="stat-row">
              TotalExp : {leftTeam.totalExp}
            </div>
          )}
          {leftTeam.funds !== undefined && (
            <div className="stat-row">
              Funds : $&nbsp;{leftTeam.funds}
            </div>
          )}
        </td>
        <td className="result-stats">
          <div className="stat-row">
            HP remain : {rightTeam.hpRemain}/{rightTeam.totalUnits > 0 ? rightTeam.hpRemain : 0}
          </div>
          <div className="stat-row">
            Alive : {rightTeam.alive}/{rightTeam.totalUnits}
          </div>
          <div className="stat-row">
            TotalDamage : {rightTeam.totalDamage ?? 0}
          </div>
          {rightTeam.totalExp !== undefined && (
            <div className="stat-row">
              TotalExp : {rightTeam.totalExp}
            </div>
          )}
          {rightTeam.funds !== undefined && (
            <div className="stat-row">
              Funds : $&nbsp;{rightTeam.funds}
            </div>
          )}
        </td>
      </tr>
    </>
  );
};
