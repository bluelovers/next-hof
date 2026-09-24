/**
 * 戰鬥結果組件
 * Battle result component
 *
 * 顯示勝利方宣告與雙方最終統計數據（各欄標題顯示對應隊伍名稱）
 * Displays winner announcement and final stats for both teams (each column heading
 * shows that team's name)
 */
import React from 'react';
import type { IBattleResult, ITeamFinalStats } from './types';
import type { EnumTeamSideClass } from './enums';
import { EnumTeamSideUI } from './enums';
import { getSideClass } from './battleUtils';
import { BattleSidePanel } from './BattleSidePanel';
import './BattleResult.css';
import '#/components/shared/SharedBase.css';

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
 * 渲染單一隊伍的名稱與最終統計（單一事實來源）
 * Render one team's name and final stats (single source of truth)
 *
 * 左右兩欄共用此組件，欄位標題顯示該隊隊伍名稱（name）；
 * 面板容器沿用共用的 BattleSidePanel（teams + 側邊 class），
 * 並維持追加 result-stats（統計列間距等本元件專屬樣式）。
 * Both columns share this component; the column heading shows that team's name.
 * The panel container reuses the shared BattleSidePanel (teams + side class) while
 * still appending result-stats (this component's own stat-row spacing styles).
 */
const TeamStats: React.FC<{
  name: string;
  stats: ITeamFinalStats;
  sideClass: EnumTeamSideClass;
}> = ({ name, stats, sideClass }) => (
  <BattleSidePanel sideClass={sideClass} className="result-stats">
    {/* 隊伍名稱（統計欄標題）/ Team name (stats-column heading) */}
    <div className="result-team-name bold">{name}</div>
    {/* HP remain ＝ 剩餘 HP／隊伍最大 HP 總和（totalMaxHp 缺省時退回剩餘 HP，避免誤報）
        HP remain = remaining HP / total max HP (falls back to the remaining HP when totalMaxHp is absent, to avoid a wrong denominator) */}
    <div className="stat-row">
      HP remain : {stats.hpRemain}/{stats.totalMaxHp ?? stats.hpRemain}
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
  </BattleSidePanel>
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
    <div className="battle-result">
      <div className="result-title-row divider-bottom divider-top">
        <div className={titleClass}>{titleText}</div>
      </div>
      <div className="result-stats-row">
        <TeamStats name={leftTeamName} stats={leftTeam} sideClass={getSideClass(EnumTeamSideUI.Left)} />
        <TeamStats name={rightTeamName} stats={rightTeam} sideClass={getSideClass(EnumTeamSideUI.Right)} />
      </div>
    </div>
  );
};
