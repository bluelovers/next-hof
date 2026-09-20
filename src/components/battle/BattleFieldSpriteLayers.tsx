/**
 * 戰場精靈圖層組件
 * Battlefield sprite layers component
 *
 * 遞迴疊加每個角色的精靈圖層
 * Recursively stacks each character's sprite layer
 *
 * 原始頁面使用巢狀 div 疊加：
 * 每個 div 都是 480x200，使用 background-position 定位角色
 * The original page uses nested div layers:
 * Each div is 480x200, uses background-position for character placement
 *
 * 遞迴邏輯已抽離至模組層級輔助函式 buildSpriteLayers，
 * 元件本體不再自我呼叫，僅負責轉發 props 給輔助函式
 * The recursion logic is extracted to the module-level helper
 * buildSpriteLayers; the component itself no longer calls itself.
 */
import React from 'react';
import type { CSSProperties } from 'react';
import type { IBattleSprite } from './types';
import { BattleFieldSpriteLabel } from './BattleFieldSpriteLabel';
import './BattleFieldSpriteLayers.css';

/** 戰場精靈圖層屬性 / Battlefield sprite layers props */
export interface IBattleFieldSpriteLayersProps {
  /** 精靈列表 / Sprite list */
  sprites: IBattleSprite[];
  /** 當前處理的索引 / Current processing index */
  index: number;
  /** 畫布寬度 / Canvas width */
  width: number;
  /** 畫布高度 / Canvas height */
  height: number;
  /** 是否顯示名稱標籤 / Whether to show name labels */
  showLabels?: boolean;
  /** 自訂樣式（可複寫或追加至每個精靈圖層） / Custom style (override or append to every sprite layer) */
  style?: CSSProperties;
}

/**
 * 遞迴建立巢狀 div 精靈圖層（模組層級輔助函式）
 * Recursively build nested div sprite layers (module-level helper)
 *
 * 渲染索引對應的精靈圖層，並在內部遞迴渲染下一層；
 * 當 index 超出清單長度時回傳 null 結束遞迴
 * Renders the sprite layer at the given index and recursively renders
 * the next layer; returns null when index is out of bounds to stop.
 */
function buildSpriteLayers(
  spriteList: IBattleSprite[],
  index: number,
  width: number,
  height: number,
  showLabels: boolean,
  style?: CSSProperties
): React.ReactNode {
  if (index >= spriteList.length) {
    // 最內層為空 div（結束遞迴）
    // Innermost is empty div (end recursion)
    return null;
  }

  const sprite = spriteList[index];
  const flipClass = sprite.flipped ? ' flip-h' : '';

  const layerStyle: CSSProperties = {
    width,
    height: height + (showLabels ? 20 : 0),
    backgroundImage: sprite.imageUrl
      ? `url(${sprite.imageUrl})`
      : undefined,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `${sprite.x}px ${sprite.y}px`,
    position: 'relative',
  };

  // 合併順序：基礎樣式 < 元件/輔助函式 style < 單體精靈 style（最優先）
  // Merge order: base < component/helper style < per-sprite style (highest priority)
  const mergedStyle: CSSProperties = {
    ...layerStyle,
    ...style,
    ...sprite.style,
  };

  return (
    <div
      className={`battle-sprite${flipClass}`}
      id={sprite.id}
      style={mergedStyle}
    >
      {showLabels && sprite.name && (
        <BattleFieldSpriteLabel
          name={sprite.name}
          x={sprite.x}
          style={sprite.labelStyle}
        />
      )}
      {buildSpriteLayers(spriteList, index + 1, width, height, showLabels, style)}
    </div>
  );
}

/**
 * 戰場精靈圖層組件
 * Battlefield sprite layers component
 *
 * 轉發 props 給輔助函式 buildSpriteLayers 產生巢狀圖層
 * Forwards props to the buildSpriteLayers helper to produce nested layers
 */
export const BattleFieldSpriteLayers: React.FC<IBattleFieldSpriteLayersProps> = ({
  sprites,
  index,
  width,
  height,
  showLabels = false,
  style,
}) => {
  return buildSpriteLayers(sprites, index, width, height, showLabels, style);
};
