/**
 * 戰鬥單位組件
 * Battle unit component
 *
 * 顯示單位的名稱、HP、SP 狀態
 * Displays unit name, HP, and SP status
 */
import React from 'react';
import type { IBattleUnit, IUnitStatus } from './types';
import './BattleUnit.css';
import '../pages/Shared.css';

/** 根據狀態取得 CSS 類別 / Get CSS class based on status */
function getStatusClass(status?: IUnitStatus): string {
  switch (status) {
    case 'down':
      return 'dmg';
    case 'casting':
      return 'charge';
    default:
      return '';
  }
}

/** 計算 HP 百分比 / Calculate HP percentage */
function hpPercent(hp: number, maxHp: number): number {
  if (maxHp <= 0) return 0;
  return Math.max(0, Math.min(100, (hp / maxHp) * 100));
}

/** 根據 HP 百分比取得 HP 條顏色 / Get HP bar color based on percentage */
function getHpBarColor(pct: number): string {
  if (pct > 60) return '#3366ff';
  if (pct > 30) return '#ffcc33';
  return '#cc3300';
}

/** 根據 SP 百分比取得 SP 條顏色 / Get SP bar color based on percentage */
function getSpBarColor(pct: number): string {
  if (pct > 60) return '#66cc66';
  if (pct > 30) return '#ffcc33';
  return '#cc3300';
}

/** 計算 SP 百分比 / Calculate SP percentage */
function spPercent(sp: number, maxSp: number): number {
  if (maxSp <= 0) return 0;
  return Math.max(0, Math.min(100, (sp / maxSp) * 100));
}

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
  const hpPct = hpPercent(hp, maxHp);
  const spPct = spPercent(sp, maxSp);

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
          <span className={`hp-text ${status === 'down' ? 'dmg' : 'recover'}`}>
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
          <span className={`sp-text ${status === 'down' ? 'dmg' : 'support'}`}>
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
