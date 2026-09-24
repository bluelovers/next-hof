/**
 * 分段 HP/SP 狀態組件
 * Per-segment HP/SP status component
 *
 * 併排顯示左右兩隊在「該分段起始時間點」的單位狀態（名稱＋HP/SP 條）。
 * 單位列渲染為此檔內的 SideStatus（單一事實來源），避免左右兩側各自實作而漂移。
 * Shows the left/right units' status (name + HP/SP bars) at the segment's starting
 * point, side by side. The unit list is rendered by the local SideStatus component
 * (single source of truth) so the two sides cannot drift apart.
 *
 * 原始來源：src/components/pages/BattleDisplay.tsx 的 Row「狀態」＋ renderUnits()
 * Source: the status row + renderUnits() of src/components/pages/BattleDisplay.tsx
 */
import React from 'react';
import type { IBattleUnit } from './types';
import { BattleUnit } from './BattleUnit';
import { EnumTeamSideUI } from './enums';
import { getSideClass } from './battleUtils';
import './BattleSegmentStatus.css';
import '#/components/shared/SharedBase.css';

/** 分段 HP/SP 狀態屬性 / Per-segment HP/SP status props */
export interface IBattleSegmentStatusProps {
  /** 左隊單位（該段起始狀態）/ Left-team units (segment start state) */
  leftUnits: IBattleUnit[];
  /** 右隊單位（該段起始狀態）/ Right-team units (segment start state) */
  rightUnits: IBattleUnit[];
  /** 是否顯示 HP 條 / Whether to show HP bars */
  showHpBars: boolean;
  /** 是否顯示 SP 條 / Whether to show SP bars */
  showSpBars: boolean;
}

/** 單一側別的單位狀態欄（單一事實來源）/ One side's unit-status column (single source of truth) */
const SideStatus: React.FC<{
  side: EnumTeamSideUI;
  units: IBattleUnit[];
  showHpBars: boolean;
  showSpBars: boolean;
}> = ({ side, units, showHpBars, showSpBars }) => (
  <div className={`battle-side ${getSideClass(side)} break`}>
    {units.map((unit, i) => (
      <div className="battle-side-unit" key={`${unit.name}-${i}`}>
        <div className="bold">{unit.name}</div>
        <div className="hpsp">
          <BattleUnit unit={unit} showHpBar={showHpBars} showSpBar={showSpBars} />
        </div>
      </div>
    ))}
  </div>
);

/**
 * 分段 HP/SP 狀態組件
 * Per-segment HP/SP status component
 */
export const BattleSegmentStatus: React.FC<IBattleSegmentStatusProps> = ({
  leftUnits,
  rightUnits,
  showHpBars,
  showSpBars,
}) => (
  <div className="battle-segment-status">
    <SideStatus side={EnumTeamSideUI.Left} units={leftUnits} showHpBars={showHpBars} showSpBars={showSpBars} />
    <SideStatus side={EnumTeamSideUI.Right} units={rightUnits} showHpBars={showHpBars} showSpBars={showSpBars} />
  </div>
);
