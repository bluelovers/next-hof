/**
 * 戰場精靈名稱標籤組件
 * Battlefield sprite name label component
 *
 * 由 BattleFieldSpriteLayers 中的 showLabels 邏輯抽離而來
 * Extracted from the showLabels logic in BattleFieldSpriteLayers
 */
import React from 'react';
import type { CSSProperties } from 'react';
import './BattleFieldSpriteLabel.css';

/** 戰場精靈名稱標籤屬性 / Battlefield sprite name label props */
export interface IBattleFieldSpriteLabelProps {
  /** 名稱 / Name */
  name: string;
  /** X 軸位置（角色錨點與左右對齊依據） / X position (character anchor & side alignment) */
  x: number;
  /** Y 軸位置（角色錨點，標籤置於其正下方） / Y position (character anchor; label placed just below) */
  y: number;
  /** 畫布寬度（判斷左右半側與水平對齊） / Canvas width (side detection & horizontal alignment) */
  width?: number;
  /** 自訂樣式（可複寫或追加） / Custom style (override or append) */
  style?: CSSProperties;
}

/**
 * 戰場精靈名稱標籤組件
 * Battlefield sprite name label component
 *
 * 標籤直接錨定在角色 (x, y) 正下方，水平依 x 決定靠左或靠右並對齊角色，
 * 因此不論角色在場景何處都緊貼角色、且不會因排版框置底而跑出可視範圍
 * The label is anchored just below the character (x, y); horizontal side is
 * decided by x and aligned to the character, so it stays close to the character
 * and never falls outside the visible area when the frame is bottom-aligned.
 */
export const BattleFieldSpriteLabel: React.FC<IBattleFieldSpriteLabelProps> = ({
  name,
  x,
  y,
  width = 480,
  style,
}) => {
  // 右半側：標籤右緣對齊角色 x 並向左生長，避免超出右邊界
  // Right half: label right edge aligns to character x, grows left to avoid right overflow
  // 左半側：標籤左緣對齊角色 x / Left half: label left edge aligns to character x
  const horizontal = x > width / 2 ? { right: width - x } : { left: x };

  /** 基礎標籤樣式 / Base label style */
  const baseStyle: CSSProperties = {
    position: 'absolute',
    // 緊貼角色下方，拉近與角色的距離 / just below the character, close to it
    top: y + 4,
    ...horizontal,
    fontSize: 10,
    color: '#bdc8d7',
    whiteSpace: 'nowrap',
    textShadow: '0 0 4px #000',
    pointerEvents: 'none',
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
