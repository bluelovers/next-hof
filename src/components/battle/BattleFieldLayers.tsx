/**
 * 戰場圖層組件
 * Battlefield layers component
 *
 * 最外層背景 + 巢狀精靈圖層
 * Outermost background + nested sprite layers
 *
 * 原始頁面使用巢狀 div 疊加：
 * 最外層是背景 -> 內層是每個角色的精靈圖層
 * 每個 div 都是 480x200，使用 background-position 定位角色
 * The original page uses nested div layers:
 * Outermost is background -> inner layers are character sprites
 * Each div is 480x200, uses background-position for character placement
 */
import React from 'react';
import type { IBattleSprite, IBattleFieldConfig } from './types';
import { BattleFieldSpriteLayers } from './BattleFieldSpriteLayers';

/** 戰場圖層屬性 / Battlefield layers props */
export interface IBattleFieldLayersProps {
  /** 精靈列表 / Sprite list */
  sprites: IBattleSprite[];
  /** 戰場配置 / Battlefield config */
  config: IBattleFieldConfig;
  /** 畫布寬度 / Canvas width */
  width: number;
  /** 畫布高度 / Canvas height */
  height: number;
  /** 是否顯示名稱標籤 / Whether to show name labels */
  showLabels?: boolean;
}

/**
 * 戰場圖層組件
 * Battlefield layers component
 *
 * 負責渲染最外層背景，並遞迴疊加每個角色的精靈圖層
 * Renders the outermost background and recursively stacks each character's sprite layer
 */
export const BattleFieldLayers: React.FC<IBattleFieldLayersProps> = ({
  sprites,
  config,
  width,
  height,
  showLabels = false,
}) => {
  /** 背景樣式 / Background style */
  const bgStyle: React.CSSProperties = {
    width,
    height,
    overflow: 'hidden',
    backgroundImage: config.backgroundImageUrl
      ? `url(${config.backgroundImageUrl})`
      : undefined,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '0px 0px',
    position: 'relative',
  };

  return (
    <div style={bgStyle}>
      <BattleFieldSpriteLayers
        sprites={sprites}
        index={0}
        width={width}
        height={height}
        showLabels={showLabels}
      />
    </div>
  );
};
