/**
 * 隊伍資訊列組件
 * Team info row component
 *
 * 併排顯示左右兩隊的隊伍資訊（隊伍名稱、等級總和、平均等級、總 HP），
 * 單位狀態取自「起始分段」的快照（無快照時回退到最終單位）。
 * Shows the left and right team info panels side by side (name, total level,
 * average level, total HP); unit state comes from the initial segment's snapshot
 * (falling back to the final units when there is no snapshot).
 *
 * 原始來源：src/components/pages/BattleDisplay.tsx 的 Row 1
 * Source: Row 1 of src/components/pages/BattleDisplay.tsx
 */
import React from 'react';
import type { IBattleSegment, IBattleTeam } from './types';
import { BattleTeamInfo } from './BattleTeamInfo';
import { EnumTeamSideUI } from './enums';
import { getSideClass, segmentUnitsForSide } from './battleUtils';
import './BattleTeamRow.css';

/** 隊伍資訊列屬性 / Team info row props */
export interface IBattleTeamRowProps {
  /** 左側隊伍 / Left team */
  leftTeam: IBattleTeam;
  /** 右側隊伍 / Right team */
  rightTeam: IBattleTeam;
  /** 起始分段（提供快照時的起始狀態）/ Initial segment (starting state when a snapshot exists) */
  segment: IBattleSegment;
}

/**
 * 隊伍資訊列組件
 * Team info row component
 */
export const BattleTeamRow: React.FC<IBattleTeamRowProps> = ({ leftTeam, rightTeam, segment }) => (
  <div className="battle-team-row">
    <BattleTeamInfo
      name={leftTeam.name}
      units={segmentUnitsForSide(segment, EnumTeamSideUI.Left, leftTeam.units)}
      sideClass={getSideClass(EnumTeamSideUI.Left)}
    />
    <BattleTeamInfo
      name={rightTeam.name}
      units={segmentUnitsForSide(segment, EnumTeamSideUI.Right, rightTeam.units)}
      sideClass={getSideClass(EnumTeamSideUI.Right)}
    />
  </div>
);
