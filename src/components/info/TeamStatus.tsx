/**
 * TeamStatus 隊伍狀態元件
 * TeamStatus component
 *
 * 顯示隊伍名稱、資金、時間
 * Displays team name, funds, and time
 */
import React from 'react';
import './TeamStatus.css';

/** TeamStatus 屬性 / TeamStatus props */
export interface ITeamStatusProps {
  /** 隊伍名稱 / Team name */
  teamName?: string;
  /** 資金 / Funds */
  funds?: number;
  /** 目前時間 / Current time */
  timeCurrent?: number;
  /** 最大時間 / Max time */
  timeMax?: number;
}

/**
 * TeamStatus 隊伍狀態元件
 * TeamStatus component
 */
export const TeamStatus: React.FC<ITeamStatusProps> = ({
  teamName = 'TestTeam',
  funds = 43080,
  timeCurrent = 1000,
  timeMax = 1000,
}) => {
  return (
    <div className="dashboard-team-status">
      <span className="team-name">{teamName}</span>
      <span className="team-funds">
        Funds: $ {funds.toLocaleString()}
      </span>
      <span className="team-time">
        Time: {timeCurrent} / {timeMax}
      </span>
    </div>
  );
};
