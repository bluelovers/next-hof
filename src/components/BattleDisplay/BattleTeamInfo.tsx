/**
 * 隊伍資訊組件
 * Team info component
 *
 * 顯示隊伍名稱、等級總和、平均等級、總 HP
 * Displays team name, total level, average level, total HP
 */
import React from 'react';
import type { IBattleUnit } from './types';

/** 隊伍資訊屬性 / Team info props */
export interface IBattleTeamInfoProps {
  /** 隊伍名稱 / Team name */
  name: string;
  /** 單位列表 / Unit list */
  units: IBattleUnit[];
  /** 隊伍側邊類別 / Team side CSS class */
  sideClass: 'ttd1' | 'ttd2';
}

/** 計算總等級 / Calculate total level */
function calcTotalLevel(units: IBattleUnit[]): number {
  return units.reduce((sum, u) => sum + u.level, 0);
}

/** 計算總 HP（當前）/ Calculate total current HP */
function calcTotalHp(units: IBattleUnit[]): { current: number; max: number } {
  return units.reduce(
    (acc, u) => ({
      current: acc.current + u.hp,
      max: acc.max + u.maxHp,
    }),
    { current: 0, max: 0 }
  );
}

/**
 * 隊伍資訊組件
 * Team info component
 */
export const BattleTeamInfo: React.FC<IBattleTeamInfoProps> = ({
  name,
  units,
  sideClass,
}) => {
  const totalLevel = calcTotalLevel(units);
  const avgLevel = units.length > 0 ? (totalLevel / units.length).toFixed(1) : '0';
  const totalHp = calcTotalHp(units);

  return (
    <td className={`teams ${sideClass}`}>
      <div className="bold">{name}</div>
      Total Lv : {totalLevel}
      <br />
      Average Lv : {avgLevel}
      <br />
      Total HP : {totalHp.current} / {totalHp.max}
    </td>
  );
};
