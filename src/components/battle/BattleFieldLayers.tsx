/**
 * 戰場圖層組件
 * Battlefield layers component
 *
 * 三層結構：最外層背景 > 角色精靈排版框 > 巢狀精靈圖層
 * Three-layer structure: outermost background > sprite layout frame > nested sprite layers
 *
 * 背景尺寸（bgSize）可獨立於角色排版尺寸，
 * 未提供時背景與角色使用相同 width/height
 * The background size (bgSize) can differ from the sprite layout size;
 * when omitted, background and sprites share the same width/height.
 */
import React from 'react';
import type { IBattleSprite, IBattleFieldConfig, IBattleFieldBgSize, IBattleFieldVAlign } from './types';
import { BattleFieldSpriteFrame } from './BattleFieldSpriteFrame';

/** 戰場圖層屬性 / Battlefield layers props */
export interface IBattleFieldLayersProps {
  /** 精靈列表 / Sprite list */
  sprites: IBattleSprite[];
  /** 戰場配置 / Battlefield config */
  config: IBattleFieldConfig;
  /** 角色排版寬度（選填，預設 480） / Sprite layout width (optional, default 480) */
  width?: number;
  /** 角色排版高度（選填，預設 200） / Sprite layout height (optional, default 200) */
  height?: number;
  /** 是否顯示名稱標籤 / Whether to show name labels */
  showLabels?: boolean;
  /** 背景尺寸（獨立於角色排版，選填寬或高其一或全部） / Background size, optional */
  bgSize?: IBattleFieldBgSize;
  /** 角色精靈框垂直對齊方式（預設 bottom） / Sprite frame vertical alignment (default bottom) */
  valign?: IBattleFieldVAlign;
}

/**
 * 戰場圖層組件
 * Battlefield layers component
 *
 * 背景使用 bgSize（未提供則回退 width/height），
 * 角色精靈則固定於 width x height 的排版框中，
 * 因此放大背景不會影響角色精靈的排版座標
 * Background uses bgSize (falls back to width/height when omitted);
 * character sprites are fixed inside a width x height frame, so enlarging
 * the background never affects the sprite layout coordinates.
 */
export const BattleFieldLayers: React.FC<IBattleFieldLayersProps> = ({
  sprites,
  config,
  width: rawWidth,
  height: rawHeight,
  showLabels,
  bgSize,
  valign = 'bottom',
}) => {
  // 角色排版尺寸：選填，未提供時使用預設值（保持原有設計）
  // Sprite layout size: optional, fall back to defaults when omitted
  const width = rawWidth ?? 480;
  const height = rawHeight ?? 200;

  // 背景尺寸：優先使用 bgSize，未提供則回退為角色排版尺寸
  // Background size: prefer bgSize; fall back to sprite layout size when omitted
  const bgWidth = bgSize?.width ?? width;
  const bgHeight = bgSize?.height ?? height;

  /** 背景樣式 / Background style */
  const bgStyle: React.CSSProperties = {
    width: bgWidth,
    height: bgHeight,
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
      {/* 角色精靈排版框（保護角色排版尺寸） / Sprite layout frame (protects sprite layout size) */}
      <BattleFieldSpriteFrame
        sprites={sprites}
        width={width}
        height={height}
        showLabels={showLabels}
        valign={valign}
      />
    </div>
  );
};
