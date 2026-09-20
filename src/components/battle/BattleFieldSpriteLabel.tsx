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
  /** X 軸位置（決定標籤靠左或靠右） / X position (decides label aligns left or right) */
  x: number;
  /** 自訂樣式（可複寫或追加） / Custom style (override or append) */
  style?: CSSProperties;
}

/**
 * 戰場精靈名稱標籤組件
 * Battlefield sprite name label component
 *
 * 依據 x 決定標籤靠左或靠右，並允許透過 style 複寫或追加任意樣式
 * Aligns the label left or right based on x, and allows overriding/appending
 * arbitrary styles via the style prop.
 */
export const BattleFieldSpriteLabel: React.FC<IBattleFieldSpriteLabelProps> = ({
  name,
  x,
  style,
}) => {
  /** 基礎標籤樣式 / Base label style */
  const baseStyle: CSSProperties = {
    position: 'absolute',
    bottom: 2,
    [x > 240 ? 'right' : 'left']: 4,
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
