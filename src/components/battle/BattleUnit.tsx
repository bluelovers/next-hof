/**
 * 戰鬥單位組件
 * Battle unit component
 *
 * 顯示單位的名稱、HP、SP 狀態
 * Displays unit name, HP, and SP status
 */
import React from 'react';
import type { IBattleUnit } from './types';
import './BattleUnit.css';
import '#/components/shared/SharedBase.css';
import {
  getStatusClass,
  clampPercent,
  getHpBarColor,
  getSpBarColor,
  getStateTextClass,
} from './battleUtils';

/** 戰鬥單位屬性 / Battle unit props */
export interface IBattleUnitProps {
  /** 單位資料 / Unit data */
  unit: IBattleUnit;
  /** 是否顯示 HP 條 / Whether to show HP bar */
  showHpBar?: boolean;
  /** 是否顯示 SP 條 / Whether to show SP bar */
  showSpBar?: boolean;
}

/**
 * 戰鬥單位組件
 * Battle unit component
 */
export const BattleUnit: React.FC<IBattleUnitProps> = ({
  unit,
  showHpBar = true,
  showSpBar = true,
}) => {
  const { name, hp, maxHp, sp, maxSp, status } = unit;
  const statusClass = getStatusClass(status);
  const hpPct = clampPercent(hp, maxHp);
  const spPct = clampPercent(sp, maxSp);

  return (
    <div className={`unit-summary ${statusClass}`}>
      <div className={`unit-name ${statusClass}`}>{name}</div>
      {showHpBar && (
        <div className="hp-bar-container">
          <div className="hp-bar-bg">
            <div
              className="hp-bar-fill"
              style={{
                width: `${hpPct}%`,
                background: getHpBarColor(hpPct),
              }}
            />
          </div>
          <span className={`hp-text ${getStateTextClass(status, 'recover')}`}>
            HP: {hp}/{maxHp}
          </span>
        </div>
      )}
      {showSpBar && (
        <div className="sp-bar-container">
          <div className="sp-bar-bg">
            <div
              className="sp-bar-fill"
              style={{
                width: `${spPct}%`,
                background: getSpBarColor(spPct),
              }}
            />
          </div>
          <span className={`sp-text ${getStateTextClass(status, 'support')}`}>
            SP: {sp}/{maxSp}
          </span>
        </div>
      )}
      {status === 'casting' && (
        <div className="charge">casting...</div>
      )}
    </div>
  );
};
