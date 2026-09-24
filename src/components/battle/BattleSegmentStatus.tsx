/**
 * 分段 HP/SP 狀態組件
 * Per-segment HP/SP status component
 *
 * 併排顯示左右兩隊在「該分段起始時間點」的單位狀態（名稱＋HP/SP 條）。
 * 左右兩欄的隊伍精靈（leftSprite／rightSprite，未給時取該側首個帶精靈的單位）
 * 與每個單位的精靈（IBattleUnit.sprite）皆由開關控制：
 * showTeamSprite／showUnitSprites（資料缺省時不輸出）。
 * 單位列渲染為此檔內的 SideStatus → SideUnit（單一事實來源），避免左右兩側各自實作而漂移；
 * 單位名稱只由 BattleUnit 輸出一次，不在此重複渲染。
 * Shows the left/right units' status (name + HP/SP bars) at the segment's starting
 * point, side by side. Both the per-side team sprite (leftSprite / rightSprite; falls
 * back to the first sprite-carrying unit of that side when omitted) and each unit's own
 * sprite (IBattleUnit.sprite) are gated by the showTeamSprite / showUnitSprites toggles
 * (nothing renders when the data is absent). The unit list is rendered by the local
 * SideStatus -> SideUnit components (single source of truth) so the two sides cannot
 * drift apart, and the unit name is emitted exactly once by BattleUnit.
 *
 * 原始來源：src/components/pages/BattleDisplay.tsx 的 Row「狀態」＋ renderUnits()
 * Source: the status row + renderUnits() of src/components/pages/BattleDisplay.tsx
 */
import React from 'react';
import type { IBattleUnit, IBattleBarToggleOptions, IBattleSpriteToggleOptions } from './types';
import type { ICharacterSpriteProps } from '#/components/characters/CharacterSprite';
import { CharacterSprite } from '#/components/characters/CharacterSprite';
import { BattleUnit } from './BattleUnit';
import { EnumTeamSideUI, EnumSpriteSize } from './enums';
import { getSideClass } from './battleUtils';
import './BattleSegmentStatus.css';
import '#/components/shared/SharedBase.css';

/** 分段 HP/SP 狀態屬性（開關共用 IBattleBarToggleOptions ＋ IBattleSpriteToggleOptions）/ Per-segment HP/SP status props (toggles come from the shared IBattleBarToggleOptions + IBattleSpriteToggleOptions) */
export interface IBattleSegmentStatusProps
  extends IBattleBarToggleOptions, IBattleSpriteToggleOptions {
  /** 左隊單位（該段起始狀態）/ Left-team units (segment start state) */
  leftUnits: IBattleUnit[];
  /** 右隊單位（該段起始狀態）/ Right-team units (segment start state) */
  rightUnits: IBattleUnit[];
  /**
   * 左側隊伍精靈（選填；優先於由單位推導的隊伍精靈，需 showTeamSprite 才顯示）
   * Left team sprite (optional; takes precedence over the derived one, shown when showTeamSprite is on)
   */
  leftSprite?: ICharacterSpriteProps;
  /**
   * 右側隊伍精靈（選填；優先於由單位推導的隊伍精靈，需 showTeamSprite 才顯示）
   * Right team sprite (optional; takes precedence over the derived one, shown when showTeamSprite is on)
   */
  rightSprite?: ICharacterSpriteProps;
}

/**
 * 單一單位列（SideStatus 的子元件，宣告於同一檔案，不另開檔）
 * One unit row (a child component of SideStatus, declared in this same file)
 *
 * 單位的「名稱＋HP/SP」一律交給 BattleUnit 輸出，此處不再重複渲染 unit.name，
 * 避免名稱顯示兩次（單一事實來源）。
 * The unit's "name + HP/SP" is rendered solely by BattleUnit; unit.name is never
 * emitted again here, so the name cannot show up twice (single source of truth).
 */
const SideUnit: React.FC<{
  /** 單位資料 / Unit data */
  unit: IBattleUnit;
} & IBattleBarToggleOptions &
  IBattleSpriteToggleOptions> = ({ unit, showHpBars, showSpBars, showUnitSprites }) => {
  // 單位精靈僅在 showUnitSprites 開啟時輸出 / Unit sprites render only when showUnitSprites is on
  const unitSprite = showUnitSprites ? unit.sprite : undefined;

  return (
    <div className={`battle-side-unit${unitSprite ? ' battle-side-unit--sprite' : ''}`}>
      {unitSprite && (
        <div className="battle-side-unit-sprite">
          {/* 預設 Small；呼叫端可用 unit.sprite.size 覆寫 / Default Small; callers can override via unit.sprite.size */}
          <CharacterSprite size={EnumSpriteSize.Small} {...unitSprite} />
        </div>
      )}
      <div className="battle-side-unit-body">
        <div className="hpsp">
          <BattleUnit unit={unit} showHpBar={showHpBars} showSpBar={showSpBars} />
        </div>
      </div>
    </div>
  );
};

/** 單一側別的單位狀態欄（單一事實來源）/ One side's unit-status column (single source of truth) */
const SideStatus: React.FC<{
  side: EnumTeamSideUI;
  units: IBattleUnit[];
  /** 顯式隊伍精靈（優先於推導值）/ Explicit team sprite (takes precedence over the derived one) */
  teamSprite?: ICharacterSpriteProps;
} & IBattleBarToggleOptions &
  IBattleSpriteToggleOptions> = ({
  side,
  units,
  teamSprite,
  showTeamSprite,
  showUnitSprites,
  showHpBars,
  showSpBars,
}) => {
  // 隊伍精靈：showTeamSprite 開啟時才輸出；資料取顯式 prop，否則取該側第一個帶精靈的單位
  // Team sprite: rendered only when showTeamSprite is on; data comes from the explicit prop, or else the first unit of this side carrying a sprite
  const sideSprite = showTeamSprite ? (teamSprite ?? units.find((u) => u.sprite)?.sprite) : undefined;

  return (
    // 刻意不套用共用的 .divider-bottom：HP/SP 狀態欄底部不畫水平框線（見 SharedBase.css）
    // Deliberately skips the shared .divider-bottom utility: no horizontal rule under the HP/SP status column (see SharedBase.css)
    <div className={`battle-side ${getSideClass(side)}`}>
      {sideSprite && (
        <div className="battle-side-sprite">
          <CharacterSprite {...sideSprite} />
        </div>
      )}
      {units.map((unit, i) => (
        <SideUnit
          key={`${unit.name}-${i}`}
          unit={unit}
          showHpBars={showHpBars}
          showSpBars={showSpBars}
          showUnitSprites={showUnitSprites}
        />
      ))}
    </div>
  );
};

/**
 * 分段 HP/SP 狀態組件
 * Per-segment HP/SP status component
 */
export const BattleSegmentStatus: React.FC<IBattleSegmentStatusProps> = ({
  leftUnits,
  rightUnits,
  leftSprite,
  rightSprite,
  showTeamSprite,
  showUnitSprites,
  showHpBars,
  showSpBars,
}) => (
  <div className="battle-segment-status">
    <SideStatus
      side={EnumTeamSideUI.Left}
      units={leftUnits}
      teamSprite={leftSprite}
      showTeamSprite={showTeamSprite}
      showUnitSprites={showUnitSprites}
      showHpBars={showHpBars}
      showSpBars={showSpBars}
    />
    <SideStatus
      side={EnumTeamSideUI.Right}
      units={rightUnits}
      teamSprite={rightSprite}
      showTeamSprite={showTeamSprite}
      showUnitSprites={showUnitSprites}
      showHpBars={showHpBars}
      showSpBars={showSpBars}
    />
  </div>
);
