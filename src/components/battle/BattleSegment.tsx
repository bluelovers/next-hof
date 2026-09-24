/**
 * 戰鬥分段組件
 * Battle segment component
 *
 * 一個「分段」＝該段起始快照的戰場畫面 ＋ 起始 HP/SP 狀態 ＋ 該段行動日誌
 * ＋（多段時的）分段導覽。分段由 BattleDisplay 依快照切分後逐段渲染。
 * One segment = the battlefield scene from its starting snapshot + the starting
 * HP/SP status + the segment's action log + (when paged) the segment navigation.
 * BattleDisplay splits by snapshot and renders one segment per slice.
 *
 * 原始來源：src/components/pages/BattleDisplay.tsx 的 segments.map(...) 區塊
 * Source: the segments.map(...) block of src/components/pages/BattleDisplay.tsx
 */
import React from 'react';
import type {
  IBattleFieldConfig,
  IBattleSegment,
  IBattleSprite,
  IBattleTeam,
} from './types';
import { BattleFieldScene } from './BattleFieldScene';
import { BattleLog } from './BattleLog';
import { BattleSegmentStatus } from './BattleSegmentStatus';
import { BattleSegmentNav } from './BattleSegmentNav';
import { EnumTeamSideUI } from './enums';
import { segmentUnitsForSide, resolveSegmentSprites } from './battleUtils';
import './BattleSegment.css';

/** 戰鬥分段屬性 / Battle segment props */
export interface IBattleSegmentProps {
  /** 分段資料（快照＋該段行動）/ Segment data (snapshot + its actions) */
  segment: IBattleSegment;
  /** 分段總數（用於導覽與 aria 標籤）/ Total segments (for navigation and the aria label) */
  totalSegments: number;
  /** 左側隊伍 / Left team */
  leftTeam: IBattleTeam;
  /** 右側隊伍 / Right team */
  rightTeam: IBattleTeam;
  /** 戰場配置 / Battlefield config */
  battlefield: IBattleFieldConfig;
  /** 全部戰場精靈（由分段依快照過濾）/ All battlefield sprites (filtered per snapshot) */
  sprites: IBattleSprite[];
  /** 是否顯示名稱標籤 / Whether to show name labels on sprites */
  showSpriteLabels?: boolean;
  /** 是否顯示 HP 條 / Whether to show HP bars */
  showHpBars: boolean;
  /** 是否顯示 SP 條 / Whether to show SP bars */
  showSpBars: boolean;
}

/**
 * 戰鬥分段組件
 * Battle segment component
 */
export const BattleSegment: React.FC<IBattleSegmentProps> = ({
  segment,
  totalSegments,
  leftTeam,
  rightTeam,
  battlefield,
  sprites,
  showSpriteLabels,
  showHpBars,
  showSpBars,
}) => {
  const leftUnits = segmentUnitsForSide(segment, EnumTeamSideUI.Left, leftTeam.units);
  const rightUnits = segmentUnitsForSide(segment, EnumTeamSideUI.Right, rightTeam.units);
  const segmentSprites = resolveSegmentSprites(sprites, segment.snapshot);

  return (
    <section
      className="battle-segment"
      id={`battle-seg-${segment.index}`}
      aria-label={`battle segment ${segment.index + 1} / ${totalSegments}`}
    >
      {/* 戰場畫面 / Battlefield scene */}
      <div className="battle-segment-scene">
        <BattleFieldScene
          sprites={segmentSprites}
          config={battlefield}
          showLabels={showSpriteLabels}
        />
      </div>

      {/* HP/SP 狀態（該段起始）/ HP/SP status (segment start) */}
      <BattleSegmentStatus
        leftUnits={leftUnits}
        rightUnits={rightUnits}
        showHpBars={showHpBars}
        showSpBars={showSpBars}
      />

      {/* 該段行動日誌 / Segment action log */}
      {segment.actions.length > 0 && (
        <div className="battle-segment-log">
          <BattleLog actions={segment.actions} />
        </div>
      )}

      {/* 分段導覽（僅多段時輸出）/ Segment navigation (only emitted when paged) */}
      <BattleSegmentNav index={segment.index} total={totalSegments} />
    </section>
  );
};
