/**
 * 戰鬥顯示主組件
 * Battle display main component
 *
 * 組合所有子組件，呈現完整的戰鬥畫面（本檔僅負責編排，不包含版面細節）
 * Combines all sub-components to render a complete battle scene (this file only
 * orchestrates; it holds no layout details)
 *
 * 包含 / Includes:
 * - 戰鬥標題 / Battle header → BattleDisplayHeader
 * - 隊伍資訊 / Team info → BattleTeamRow
 * - 單位入場 / Unit entrance → BattleUnitEntrance
 * - 分段戰場（快照驅動）/ Segmented battlefield (snapshot-driven) → BattleSegment
 *   - 每段 HP/SP 狀態 / Per-segment HP/SP status → BattleSegmentStatus
 *   - 每段行動日誌 / Per-segment action log → BattleLog
 *   - 分段導覽 / Segment navigation → BattleSegmentNav
 * - 戰鬥結果 / Battle result → BattleResult
 *
 * 有 snapshots 時依快照切成多段（多段顯示），否則退化為單段。
 * When snapshots exist the log is split into multiple segments, otherwise it
 * degrades to a single segment.
 */
import React from 'react';
import type { IBattleDisplayData, IBattleDisplayOptions } from '#/components/battle/types';
import { BattleDisplayHeader } from '#/components/battle/BattleDisplayHeader';
import { BattleTeamRow } from '#/components/battle/BattleTeamRow';
import { BattleUnitEntrance } from '#/components/battle/BattleUnitEntrance';
import { BattleSegment } from '#/components/battle/BattleSegment';
import { BattleResult } from '#/components/battle/BattleResult';
import { splitActionsBySnapshots, segmentUnitsForSide } from '#/components/battle/battleUtils';
import { EnumTeamSideUI } from '#/components/battle/enums';
import './BattleDisplay.css';
import '#/components/shared/SharedBase.css';

/** 戰鬥顯示屬性（顯示開關共用 IBattleDisplayOptions，單一事實來源）/ Battle display props (toggles come from the shared IBattleDisplayOptions) */
export interface IBattleDisplayProps extends IBattleDisplayOptions {
  /** 戰鬥資料 / Battle data */
  data: IBattleDisplayData;
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
  showTeamSprite,
  showUnitSprites,
}) => {
  const { leftTeam, rightTeam, battlefield, sprites, actions, result, title, time, snapshots } = data;

  // 依快照把行動切成多段；無快照時為單段
  // Split actions into segments by snapshot; a single segment when absent
  const segments = splitActionsBySnapshots(actions, snapshots);

  // 開場入場列以「首段快照」為準：中途召喚／加入的單位不會出現在開場入場列；
  // 首段無快照（或完全無快照）時仍沿用隊伍單位，行為不變。
  // Opening entrance rows follow the first segment's snapshot so mid-battle joins
  // (summons) never appear in the opening list; when the first segment carries no
  // snapshot (or there are no snapshots at all) the team units are used as before.
  const openingSegment = segments[0];
  const hasOpeningSnapshot = Boolean(openingSegment?.snapshot);
  const entranceLeft = hasOpeningSnapshot
    ? segmentUnitsForSide(openingSegment, EnumTeamSideUI.Left, leftTeam.units)
    : leftTeam.units;
  const entranceRight = hasOpeningSnapshot
    ? segmentUnitsForSide(openingSegment, EnumTeamSideUI.Right, rightTeam.units)
    : rightTeam.units;

  return (
    <div className="battle-display">
      {/* 戰鬥標題 / Battle title */}
      <BattleDisplayHeader title={title} time={time} />

      <div className="battle-content">
        {/* Row 1: 隊伍資訊（起始快照狀態）/ Team info (initial snapshot state) */}
        <BattleTeamRow leftTeam={leftTeam} rightTeam={rightTeam} segment={segments[0]} />

        {/* Row 2: 單位入場（首段快照；中途召喚者不在開場入場列）/ Unit entrance (first snapshot; mid-battle summons excluded) */}
        <BattleUnitEntrance leftUnits={entranceLeft} rightUnits={entranceRight} />

        {/* Row 3+: 分段（快照）/ Segments (snapshot-driven) */}
        {segments.map((segment) => (
          <BattleSegment
            key={segment.index}
            segment={segment}
            totalSegments={segments.length}
            leftTeam={leftTeam}
            rightTeam={rightTeam}
            battlefield={battlefield}
            sprites={sprites}
            showSpriteLabels={showSpriteLabels}
            showHpBars={showHpBars}
            showSpBars={showSpBars}
            showTeamSprite={showTeamSprite}
            showUnitSprites={showUnitSprites}
          />
        ))}

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
