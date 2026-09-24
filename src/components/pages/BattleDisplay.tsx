/**
 * 戰鬥顯示主組件
 * Battle display main component
 *
 * 組合所有子組件，呈現完整的戰鬥畫面
 * Combines all sub-components to render a complete battle scene
 *
 * 包含 / Includes:
 * - 隊伍資訊 / Team info
 * - 單位入場 / Unit entrance
 * - 分段戰場（快照驅動）/ Segmented battlefield (snapshot-driven)
 * - 每段 HP/SP 狀態 / Per-segment HP/SP status
 * - 每段行動日誌 / Per-segment action log
 * - 戰鬥結果 / Battle result
 *
 * 布局已由 table 改為響應式 div（支援現代瀏覽器與手機）；
 * 有 snapshots 時依快照切成多段（多段顯示），否則退化為單段。
 * Layout moved from table to responsive divs (modern browsers + mobile);
 * when snapshots exist the log is split into multiple segments, otherwise it
 * degrades to a single segment.
 */
import React from 'react';
import type { IBattleDisplayData, IBattleUnit } from '#/components/battle/types';
import { BattleTeamInfo } from '#/components/battle/BattleTeamInfo';
import { BattleFieldScene } from '#/components/battle/BattleFieldScene';
import { BattleUnit } from '#/components/battle/BattleUnit';
import { BattleLog } from '#/components/battle/BattleLog';
import { BattleResult } from '#/components/battle/BattleResult';
import { EnumTeamSideUI } from '#/components/battle/enums';
import {
  getSideClass,
  getEnterBattlefieldText,
  splitActionsBySnapshots,
  segmentUnitsForSide,
  resolveSegmentSprites,
} from '#/components/battle/battleUtils';
import './BattleDisplay.css';
import '#/components/shared/SharedBase.css';

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
  showSpriteLabels,
  showHpBars = true,
  showSpBars = true,
}) => {
  const { leftTeam, rightTeam, battlefield, sprites, actions, result, title, time, snapshots } = data;

  // 依快照把行動切成多段；無快照時為單段
  // Split actions into segments by snapshot; a single segment when absent
  const segments = splitActionsBySnapshots(actions, snapshots);
  const initialSegment = segments[0];

  return (
    <div className="battle-display">
      {/* 戰鬥標題 / Battle title */}
      {title && (
        <header className="battle-header break">
          <h2 className="battle-title">{title}</h2>
          {time && (
            <div className="battle-time">
              this battle starts at
              <br />
              {time}
            </div>
          )}
        </header>
      )}

      <div className="battle-content">
        {/* Row 1: 隊伍資訊（起始快照狀態）/ Team info (initial snapshot state) */}
        <div className="battle-row battle-row--teams">
          <BattleTeamInfo
            name={leftTeam.name}
            units={segmentUnitsForSide(initialSegment, EnumTeamSideUI.Left, leftTeam.units)}
            sideClass={getSideClass(EnumTeamSideUI.Left)}
          />
          <BattleTeamInfo
            name={rightTeam.name}
            units={segmentUnitsForSide(initialSegment, EnumTeamSideUI.Right, rightTeam.units)}
            sideClass={getSideClass(EnumTeamSideUI.Right)}
          />
        </div>

        {/* Row 2: 單位入場 / Unit entrance */}
        <div className="battle-enter">
          {leftTeam.units.map((unit, i) => (
            <div className="enter-row" key={`enter-left-${i}`}>
              <div className={`enter-cell ${getSideClass(EnumTeamSideUI.Left)}`}>
                <span className="result">
                  <span className="bold">{unit.name}</span>{' '}
                  {getEnterBattlefieldText(unit.level)}
                </span>
              </div>
              <div className={`enter-cell ${getSideClass(EnumTeamSideUI.Right)}`} aria-hidden="true" />
            </div>
          ))}
          {rightTeam.units.map((unit, i) => (
            <div className="enter-row" key={`enter-right-${i}`}>
              <div className={`enter-cell ${getSideClass(EnumTeamSideUI.Left)}`} aria-hidden="true" />
              <div className={`enter-cell ${getSideClass(EnumTeamSideUI.Right)}`}>
                <span className="result">
                  <span className="bold">{unit.name}</span>{' '}
                  {getEnterBattlefieldText(unit.level)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Row 3+: 分段（快照）/ Segments (snapshot-driven) */}
        {segments.map((segment) => {
          const leftUnits = segmentUnitsForSide(segment, EnumTeamSideUI.Left, leftTeam.units);
          const rightUnits = segmentUnitsForSide(segment, EnumTeamSideUI.Right, rightTeam.units);
          const segmentSprites = resolveSegmentSprites(sprites, segment.snapshot);
          const hasPrev = segment.index > 0;
          const hasNext = segment.index < segments.length - 1;

          return (
            <section
              className="battle-segment"
              id={`battle-seg-${segment.index}`}
              key={segment.index}
              aria-label={`battle segment ${segment.index + 1} / ${segments.length}`}
            >
              {/* 戰場畫面 / Battlefield scene */}
              <div className="battle-row battle-row--scene">
                <BattleFieldScene
                  sprites={segmentSprites}
                  config={battlefield}
                  showLabels={showSpriteLabels}
                />
              </div>

              {/* HP/SP 狀態（該段起始）/ HP/SP status (segment start) */}
              <div className="battle-row battle-row--status">
                <div className={`battle-side ${getSideClass(EnumTeamSideUI.Left)} break`}>
                  {renderUnits(leftUnits, showHpBars, showSpBars)}
                </div>
                <div className={`battle-side ${getSideClass(EnumTeamSideUI.Right)} break`}>
                  {renderUnits(rightUnits, showHpBars, showSpBars)}
                </div>
              </div>

              {/* 該段行動日誌 / Segment action log */}
              {segment.actions.length > 0 && (
                <div className="battle-row battle-row--log">
                  <BattleLog actions={segment.actions} />
                </div>
              )}

              {/* 分段導覽（僅多段時顯示）/ Segment navigation (only when paged) */}
              {segments.length > 1 && (
                <nav className="battle-segment-nav" aria-label="segment navigation">
                  {hasPrev ? (
                    <a
                      className="battle-segment-link"
                      href={`#battle-seg-${segment.index - 1}`}
                    >
                      &lt;&lt;
                    </a>
                  ) : (
                    <span className="battle-segment-link battle-segment-link--disabled" aria-hidden="true">
                      &lt;&lt;
                    </span>
                  )}
                  <span className="battle-segment-counter">
                    {segment.index + 1} / {segments.length}
                  </span>
                  {hasNext ? (
                    <a
                      className="battle-segment-link"
                      href={`#battle-seg-${segment.index + 1}`}
                    >
                      &gt;&gt;
                    </a>
                  ) : (
                    <span className="battle-segment-link battle-segment-link--disabled" aria-hidden="true">
                      &gt;&gt;
                    </span>
                  )}
                </nav>
              )}
            </section>
          );
        })}

        {/* 戰鬥結果 / Battle result */}
        {result && (
          <BattleResult
            result={result}
            leftTeamName={leftTeam.name}
            rightTeamName={rightTeam.name}
          />
        )}
      </div>
    </div>
  );
};

/**
 * 渲染某一側隊伍的單位狀態（單一事實來源）
 * Render one side's unit statuses (single source of truth)
 */
function renderUnits(
  units: IBattleUnit[],
  showHpBars: boolean,
  showSpBars: boolean
): React.ReactNode {
  return units.map((unit, i) => (
    <div className="battle-side-unit" key={`${unit.name}-${i}`}>
      <div className="bold">{unit.name}</div>
      <div className="hpsp">
        <BattleUnit unit={unit} showHpBar={showHpBars} showSpBar={showSpBars} />
      </div>
    </div>
  ));
}
