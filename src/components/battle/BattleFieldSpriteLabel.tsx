/**
 * 戰場精靈名稱標籤組件
 * Battlefield sprite name label component
 *
 * 由 BattleFieldSpriteLayers 中的 showLabels 邏輯抽離而來
 * Extracted from the showLabels logic in BattleFieldSpriteLayers
 *
 * 標籤位置由 labelPosition.ts 的 computeSpriteLabelPosition() 這個「純邏輯工具」自動計算，
 * 組件本身不呼叫任何 IO（例如 getSpriteImageSize 讀圖檔），所需圖像尺寸
 * 由呼叫端以 imageSize（ISpriteImageSize）傳入（參考 toPositionChars：同樣是把
 * 已知資料轉為定位資訊，而不在此處讀取圖檔）。
 * The label position is auto-computed by the pure logic helper
 * computeSpriteLabelPosition() in labelPosition.ts; the component itself performs no IO
 * (e.g. it never calls getSpriteImageSize). Image sizes are supplied by the caller via
 * imageSize (ISpriteImageSize) — mirroring toPositionChars, which also turns known
 * data into positioning info instead of reading image files here.
 */
import React from 'react';
import type { CSSProperties } from 'react';
import type { ISpriteImageSize } from './spriteImageSizes';
import { SPRITE_LAYOUT_WIDTH, SPRITE_LAYOUT_HEIGHT } from './types';
import {
  computeSpriteLabelPosition,
  clampLabelToBoundary,
  rectsOverlap,
  largestFreeGap,
  DEFAULT_IMAGE_SIZE,
  type ISpriteLabelPlacement,
  type ISpriteLabelPositionResult,
} from './labelPosition';
import './BattleFieldSpriteLabel.css';
import { EnumSpriteLabelPlacement } from '#/components/battle/enums';

// 將純邏輯工具重新匯出，使 BattleFieldSpriteLabel 模組同時提供組件與標籤定位邏輯
// Re-export the pure logic tool so the BattleFieldSpriteLabel module exposes both the
// component and the label-positioning logic.
export {
  computeSpriteLabelPosition,
  computeLabelLeft,
  computeLabelTop,
  labelFitsInFrame,
  clamp,
  clampLabelToBoundary,
  rectsOverlap,
  largestFreeGap,
  DEFAULT_LABEL_HEIGHT,
  DEFAULT_GAP,
  DEFAULT_IMAGE_SIZE,
} from './labelPosition';
export type {
  ISpriteLabelPlacement,
  ISpriteLabelPositionInput,
  ISpriteLabelPositionResult,
  IRect,
} from './labelPosition';

/** 戰場精靈名稱標籤屬性 / Battlefield sprite name label props */
export interface IBattleFieldSpriteLabelProps {
  /** 名稱 / Name */
  name: string;
  /** X 軸位置（角色圖像左上角 x） / X position (character image top-left x) */
  x: number;
  /** Y 軸位置（角色圖像左上角 y） / Y position (character image top-left y) */
  y: number;
  /**
   * 角色圖像尺寸（由呼叫端提供；組件內禁止呼叫 getSpriteImageSize IO）
   * Character image size (caller-supplied; the component must NOT call getSpriteImageSize).
   */
  imageSize?: ISpriteImageSize;
  /**
   * 標籤演算法：角色上方 / 下方（預設 below）
   * Label placement: above / below the character (default below)
   */
  placement?: ISpriteLabelPlacement;
  /** 顯示範圍（戰場精靈框）尺寸 / Display range (sprite frame) size */
  frameSize?: ISpriteImageSize;
  /** 標籤預估尺寸（邊界收斂用） / Estimated label size (for clamping) */
  labelSize?: ISpriteImageSize;
  /** 標籤與角色圖像間距 / Gap between label and character */
  gap?: number;
  /** 自訂樣式（可複寫或追加） / Custom style (override or append) */
  style?: CSSProperties;
  /**
   * 所屬精靈是否翻轉（flip-h）
   * Whether the owning sprite is flipped (flip-h)
   *
   * 標籤本身位於翻轉的精靈 div 內，會被父層 transform 連帶鏡像，
   * 導致文字左右顛倒。傳入 flipped 時對標籤本身再加一次 scaleX(-1)，
   * 與父層鏡像抵銷（淨效果為不鏡像），文字恢復正向、位置仍貼齊角色。
   * The label lives inside the flipped sprite div and is mirrored by the parent's
   * transform, rendering the text backwards. When flipped, we apply another
   * scaleX(-1) to the label itself, cancelling the parent mirror (net identity),
   * so the text reads normally while staying anchored under the character.
   */
  flipped?: boolean;
  /**
   * 由上層（BattleFieldSpriteLayers + useSpriteLabelRegistry）預先算好的最終位置。
   * 提供時直接採用（含防重疊後的 top/left/height），組件不再自行計算；
   * 不提供時（如 Storybook 單體展示）則由組件內部自行計算。
   * Pre-computed final position from the parent (BattleFieldSpriteLayers + useSpriteLabelRegistry).
   * When provided, it is used as-is (including anti-overlap top/left/height) and the
   * component skips its own computation; when omitted (e.g. standalone Storybook), the
   * component computes it internally.
   */
  position?: ISpriteLabelPositionResult;
}

/**
 * 戰場精靈名稱標籤組件
 * Battlefield sprite name label component
 *
 * 標籤位置由 computeSpriteLabelPosition() 自動計算（角色上方/下方兩種演算法，
 * 並收斂在戰場精靈框顯示範圍內）；組件本身不進行任何 IO。
 * The label position is auto-computed by computeSpriteLabelPosition() (above/below
 * algorithms, clamped inside the sprite-frame display range); the component itself
 * performs no IO.
 */
export const BattleFieldSpriteLabel: React.FC<IBattleFieldSpriteLabelProps> = ({
  name,
  x,
  y,
  imageSize,
  placement = EnumSpriteLabelPlacement.Below,
  frameSize,
  labelSize,
  gap,
  style,
  flipped,
  position,
}) => {
  const resolvedImageSize = imageSize ?? DEFAULT_IMAGE_SIZE;
  // 優先採用上層預算好的位置（含防重疊）；否則組件自行計算
  // Prefer the parent's pre-computed position (incl. anti-overlap); otherwise compute internally.
  const pos =
    position ??
    computeSpriteLabelPosition({
      x,
      y,
      imageSize: resolvedImageSize,
      placement,
      frameSize: frameSize ?? { width: SPRITE_LAYOUT_WIDTH, height: SPRITE_LAYOUT_HEIGHT },
      labelSize,
      gap,
    });

  /** 基礎標籤樣式 / Base label style */
  const baseStyle: CSSProperties = {
    top: pos.top,
    left: pos.left,
    // 標籤最小寬度＝角色圖像寬度，使標籤盒寬度至少涵蓋角色，便於文字置中對齊角色
    // Label min-width = character image width, so the box spans at least the character (text centers over it).
    minWidth: resolvedImageSize.width,
    // 最終高度由 labelPosition 決定：超出邊界或避免重疊時會被縮減，故以 height 鎖定並裁切，
    // 文字在盒內垂直水平置中，縮減時自動裁切溢出部分。
    // Final height from labelPosition: reduced when out of bounds / avoiding overlap, so lock it
    // and clip; text is centered inside, overflow is clipped when the height shrinks.
    height: pos.height,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // 父層 flip-h 已鏡像整個精靈 div；若所屬精靈翻轉，此處再加一次 scaleX(-1)
    // 抵銷鏡像，使文字正向、位置仍貼齊角色
    // Parent flip-h already mirrors the whole sprite div; when the owning sprite is
    // flipped, add one more scaleX(-1) here to cancel it, keeping text upright while
    // the box stays anchored under the character.
    transform: flipped ? 'scaleX(-1)' : undefined,
  };

  return (
    <div
      className="sprite-label"
      style={{ ...baseStyle, ...style }}
    >
      {name}
    </div>
  );
};
