/**
 * 單位入場列組件
 * Unit entrance component
 *
 * 逐列宣告每個單位「進入戰場」：左隊單位顯示在左欄、右隊單位顯示在右欄，
 * 另一欄留空（aria-hidden）以維持欄位對齊；窄螢幕時僅顯示有內容的一側。
 * Announces each unit "entering the battlefield" row by row: left-team units sit in the
 * left column and right-team units in the right column, with the other cell left empty
 * (aria-hidden) to keep the columns aligned; on narrow screens only the populated side shows.
 *
 * 原始來源：src/components/pages/BattleDisplay.tsx 的 Row 2
 * Source: Row 2 of src/components/pages/BattleDisplay.tsx
 */
import React from 'react';
import type { IBattleUnit } from './types';
import { EnumTeamSideUI } from './enums';
import { getSideClass, getEnterBattlefieldText } from './battleUtils';
import './BattleUnitEntrance.css';
import '#/components/shared/SharedBase.css';

/** 單位入場列屬性 / Unit entrance props */
export interface IBattleUnitEntranceProps {
  /** 左隊單位（依原始順序）/ Left-team units (original order) */
  leftUnits: IBattleUnit[];
  /** 右隊單位（依原始順序）/ Right-team units (original order) */
  rightUnits: IBattleUnit[];
}

/** 單一入場列（內容置於所屬隊伍的欄位，另一欄留空）/ One entrance row (populated on its own side) */
const EntranceRow: React.FC<{ unit: IBattleUnit; side: EnumTeamSideUI }> = ({ unit, side }) => {
  const isLeft = side === EnumTeamSideUI.Left;
  const message = (
    <span className="result">
      <span className="bold">{unit.name}</span> {getEnterBattlefieldText(unit.level)}
    </span>
  );

  return (
    <div className="enter-row">
      <div
        className={`enter-cell ${getSideClass(EnumTeamSideUI.Left)}`}
        aria-hidden={isLeft ? undefined : 'true'}
      >
        {isLeft && message}
      </div>
      <div
        className={`enter-cell ${getSideClass(EnumTeamSideUI.Right)}`}
        aria-hidden={isLeft ? 'true' : undefined}
      >
        {!isLeft && message}
      </div>
    </div>
  );
};

/**
 * 單位入場列組件
 * Unit entrance component
 */
export const BattleUnitEntrance: React.FC<IBattleUnitEntranceProps> = ({
  leftUnits,
  rightUnits,
}) => (
  <div className="battle-enter">
    {leftUnits.map((unit, i) => (
      <EntranceRow key={`enter-left-${i}`} unit={unit} side={EnumTeamSideUI.Left} />
    ))}
    {rightUnits.map((unit, i) => (
      <EntranceRow key={`enter-right-${i}`} unit={unit} side={EnumTeamSideUI.Right} />
    ))}
  </div>
);
