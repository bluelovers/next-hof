/**
 * 戰場精靈圖層組件
 * Battlefield sprite layers component
 *
 * 以「同層（兄弟）」方式疊加每個角色的精靈圖層
 * Stacks each character's sprite layer as siblings (same level)
 *
 * 原始頁面使用巢狀 div 疊加：
 * 每個 div 都是 480x200，使用 background-position 定位角色
 * The original page uses nested div layers:
 * Each div is 480x200, uses background-position for character placement
 *
 * 關鍵修正：每個精靈圖層必須是「兄弟節點」而非彼此巢狀，
 * 否則子節點會繼承父節點的 CSS transform（flip-h 的 scaleX(-1)），
 * 導致第 i 個精靈的翻轉被累積（sprite[0..i] 翻轉次數的奇偶性），
 * 造成同一側隊伍出現「左 2 右 1」等位置與朝向錯亂
 * Key fix: each sprite layer must be a SIBLING, not nested inside the previous
 * one. Otherwise a child inherits its parent's CSS transform (flip-h scaleX(-1)),
 * so sprite[i]'s flip compounds with every preceding sprite (parity of flipped
 * among sprite[0..i]). That produced split sides / mixed facing such as "left 2,
 * right 1" within a single team.
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
  /**
   * 當前處理的索引 / Current processing index
   * @deprecated 保留為向後相容參數，同層渲染不再需要遞迴索引
   */
  index?: number;
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
 * 建立「同層（兄弟）」精靈圖層陣列（模組層級輔助函式）
 * Build sibling sprite layers (module-level helper)
 *
 * 回傳一組「彼此為兄弟」的絕對定位 div，各自獨立擁有 flip-h 翻轉，
 * 互不繼承 transform，故不會發生翻轉累積
 * Returns an array of absolutely-positioned sibling divs; each owns its flip-h
 * transform independently and does NOT inherit any ancestor transform, so flips
 * never compound.
 */
function buildSpriteLayers(
  sprites: IBattleSprite[],
  width: number,
  height: number,
  showLabels?: boolean,
  style?: CSSProperties
): React.ReactNode[] {
  return sprites.map((sprite, index) => {
    const flipClass = sprite.flipped ? ' flip-h' : '';

    const layerStyle: CSSProperties = {
      width,
      height,
      backgroundImage: sprite.imageUrl
        ? `url(${sprite.imageUrl})`
        : undefined,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `${sprite.x}px ${sprite.y}px`,
      position: 'absolute',
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
        key={sprite.id ?? index}
        className={`battle-sprite${flipClass}`}
        id={sprite.id}
        style={mergedStyle}
      >
        {showLabels && sprite.name && (
          <BattleFieldSpriteLabel
            name={sprite.name}
            x={sprite.x}
            y={sprite.y}
            width={width}
            flipped={sprite.flipped}
            style={sprite.labelStyle}
          />
        )}
      </div>
    );
  });
}

/**
 * 戰場精靈圖層組件
 * Battlefield sprite layers component
 *
 * 轉發 props 給輔助函式 buildSpriteLayers 產生同層（兄弟）圖層
 * Forwards props to the buildSpriteLayers helper to produce sibling layers
 */
export const BattleFieldSpriteLayers: React.FC<IBattleFieldSpriteLayersProps> = ({
  sprites,
  width,
  height,
  showLabels,
  style,
}) => {
  return <>{buildSpriteLayers(sprites, width, height, showLabels, style)}</>;
};
