/**
 * 戰鬥顯示主組件
 * Battle display main component
 *
 * 組合所有子組件，呈現完整的戰鬥畫面
 * Combines all sub-components to render a complete battle scene
 *
 * 包含 / Includes:
 * - 隊伍資訊 / Team info
 * - 戰場畫面 / Battlefield scene
 * - HP/SP 狀態 / HP/SP status
 * - 行動日誌 / Action log
 * - 戰鬥結果 / Battle result
 */
import React from 'react';
import type { IBattleDisplayData, IBattleUnit } from './types';
import { BattleTeamInfo } from './BattleTeamInfo';
import { BattleFieldScene } from './BattleFieldScene';
import { BattleUnit } from './BattleUnit';
import { BattleLog } from './BattleLog';
import { BattleResult } from './BattleResult';
import './BattleDisplay.css';

/** 戰鬥顯示屬性 / Battle display props */
export interface IBattleDisplayProps {
  /** 戰鬥資料 / Battle data */
  data: IBattleDisplayData;
  /** 是否顯示名稱標籤 / Whether to show name labels on sprites */
  showSpriteLabels?: boolean;
  /** 是否顯示 HP 條 / Whether to show HP bars */
  showHpBars?: boolean;
  /** 是否顯示 SP 條 / Whether to show SP bars */
  showSpBars?: boolean;
}

/**
 * 戰鬥顯示主組件
 * Battle display main component
 */
export const BattleDisplay: React.FC<IBattleDisplayProps> = ({
  data,
  showSpriteLabels = false,
  showHpBars = true,
  showSpBars = true,
}) => {
  const { leftTeam, rightTeam, battlefield, sprites, actions, result, title, time } = data;

  return (
    <div className="battle-display">
      {/* 戰鬥標題 / Battle title */}
      {title && (
        <div style={{ padding: '15px 0', width: '100%', textAlign: 'center' }} className="break">
          <h2>{title}</h2>
          {time && <div>this battle starts at<br />{time}</div>}
        </div>
      )}

      <table className="battle-frame" cellSpacing="0">
        <tbody>
          {/* Row 1: 隊伍資訊 / Team info */}
          <tr>
            <BattleTeamInfo
              name={leftTeam.name}
              units={leftTeam.units}
              sideClass="ttd2"
            />
            <BattleTeamInfo
              name={rightTeam.name}
              units={rightTeam.units}
              sideClass="ttd1"
            />
          </tr>

          {/* Row 2: 單位入場 / Unit entrance */}
          {leftTeam.units.map((unit, i) => (
            <tr key={`enter-left-${i}`}>
              <td className="ttd2">
                <span className="result">
                  <span className="bold">{unit.name}</span> Lv.{unit.level} enter the Battlefield.
                </span>
              </td>
              <td className="ttd1">&nbsp;</td>
            </tr>
          ))}
          {rightTeam.units.map((unit, i) => (
            <tr key={`enter-right-${i}`}>
              <td className="ttd2">&nbsp;</td>
              <td className="ttd1">
                <span className="result">
                  <span className="bold">{unit.name}</span> Lv.{unit.level} enter the Battlefield.
                </span>
              </td>
            </tr>
          ))}

          {/* Row 3: 戰場畫面 / Battlefield scene */}
          <BattleFieldScene
            sprites={sprites}
            config={battlefield}
            showLabels={showSpriteLabels}
          />

          {/* Row 4: HP/SP 狀態 / HP/SP status */}
          <tr>
            {/* 左側隊伍狀態 / Left team status */}
            <td className="ttd2 break">
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '50%' }}>
                      {/* 左欄隊員 (從原始頁面來看，部分在左半部) */}
                      {renderUnitColumn(leftTeam.units, 'left', showHpBars, showSpBars)}
                    </td>
                    <td style={{ width: '50%' }}>
                      {/* 右半部留空或放更多單位 */}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            {/* 右側隊伍狀態 / Right team status */}
            <td className="ttd1 break">
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '50%' }}>
                      {renderUnitColumnHead(rightTeam.units, showHpBars, showSpBars)}
                    </td>
                    <td style={{ width: '50%' }}>
                      {renderUnitColumnTail(rightTeam.units, showHpBars, showSpBars)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* Row 5: 行動日誌 / Action log */}
          <BattleLog actions={actions} twoColumn />

          {/* Row 6: 戰鬥結果 / Battle result */}
          {result && (
            <BattleResult
              result={result}
              leftTeamName={leftTeam.name}
              rightTeamName={rightTeam.name}
            />
          )}
        </tbody>
      </table>
    </div>
  );
};

/**
 * 渲染左側隊伍的單位欄位
 * Render left team unit columns
 *
 * 原始頁面中，左側隊伍的單位排列在單一欄中
 * In the original page, left team units are arranged in a single column
 */
function renderUnitColumn(
  units: IBattleUnit[],
  side: 'left' | 'right',
  showHpBars: boolean,
  showSpBars: boolean
): React.ReactNode {
  // 左側隊伍：由上到下排列所有單位
  // Left team: list all units top to bottom
  return units.map((unit, i) => (
    <React.Fragment key={`left-unit-${i}`}>
      <div className="bold">{unit.name}</div>
      <div className="hpsp">
        <BattleUnit
          unit={unit}
          showHpBar={showHpBars}
          showSpBar={showSpBars}
        />
      </div>
    </React.Fragment>
  ));
}

/**
 * 渲染右側隊伍的前半部單位
 * Render right team first half units
 *
 * 原始頁面中，右側隊伍的單位分為兩欄
 * In the original page, right team units are split into two columns
 */
function renderUnitColumnHead(
  units: IBattleUnit[],
  showHpBars: boolean,
  showSpBars: boolean
): React.ReactNode {
  // 右側隊伍前半部 (第一個單位單獨一欄)
  // Right team first half (first unit in its own column)
  if (units.length === 0) return null;
  const firstUnit = units[0];
  return (
    <>
      <div className="bold">{firstUnit.name}</div>
      <div className="hpsp">
        <BattleUnit
          unit={firstUnit}
          showHpBar={showHpBars}
          showSpBar={showSpBars}
        />
      </div>
    </>
  );
}

/**
 * 渲染右側隊伍的後半部單位
 * Render right team remaining units
 *
 * 原始頁面中，其餘單位在第二欄
 * In the original page, remaining units are in the second column
 */
function renderUnitColumnTail(
  units: Array<{ name: string; level: number; hp: number; maxHp: number; sp: number; maxSp: number; status?: 'alive' | 'down' | 'casting'; side: 'left' | 'right'; spriteId?: string }>,
  showHpBars: boolean,
  showSpBars: boolean
): React.ReactNode {
  // 右側隊伍後半部 (其餘單位)
  // Right team remaining units
  return units.slice(1).map((unit, i) => (
    <React.Fragment key={`right-tail-unit-${i}`}>
      <div className="bold">{unit.name}</div>
      <div className="hpsp">
        <BattleUnit
          unit={unit}
          showHpBar={showHpBars}
          showSpBar={showSpBars}
        />
      </div>
    </React.Fragment>
  ));
}
