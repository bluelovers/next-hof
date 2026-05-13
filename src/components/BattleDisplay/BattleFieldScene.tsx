/**
 * 戰場畫面組件
 * Battlefield scene component
 *
 * 顯示雙方角色精靈在戰場上的位置
 * 使用巢狀 div 疊加方式實現，與原始頁面相同
 * Displays character sprites positioned on the battlefield
 * Uses nested div layering matching the original page
 */
import React from 'react';
import type { IBattleSprite, IBattleFieldConfig } from './types';

/** 戰場畫面屬性 / Battlefield scene props */
export interface IBattleFieldSceneProps {
  /** 精靈列表 / Sprite list */
  sprites: IBattleSprite[];
  /** 戰場配置 / Battlefield config */
  config: IBattleFieldConfig;
  /** 是否顯示名稱標籤 / Whether to show name labels */
  showLabels?: boolean;
}

/**
 * 戰場畫面組件
 * Battlefield scene component
 *
 * 原始頁面使用巢狀 div 疊加：
 * 最外層是背景 -> 內層是每個角色的精靈圖層
 * 每個 div 都是 480x200，使用 background-position 定位角色
 * The original page uses nested div layers:
 * Outermost is background -> inner layers are character sprites
 * Each div is 480x200, uses background-position for character placement
 */
export const BattleFieldScene: React.FC<IBattleFieldSceneProps> = ({
  sprites,
  config,
  showLabels = false,
}) => {
  const width = config.width ?? 480;
  const height = config.height ?? 200;

  /** 遞迴建立巢狀 div 精靈圖層 / Recursively build nested div sprite layers */
  function buildSpriteLayers(
    spriteList: IBattleSprite[],
    index: number
  ): React.ReactNode {
    if (index >= spriteList.length) {
      // 最內層為空 div（結束遞迴）
      // Innermost is empty div (end recursion)
      return null;
    }

    const sprite = spriteList[index];
    const flipClass = sprite.flipped ? ' flip-h' : '';

    const layerStyle: React.CSSProperties = {
      width,
      height: height + (showLabels ? 20 : 0),
      backgroundImage: sprite.imageUrl
        ? `url(${sprite.imageUrl})`
        : undefined,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `${sprite.x}px ${sprite.y}px`,
      position: 'relative',
    };

    return (
      <div
        className={`battle-sprite${flipClass}`}
        style={layerStyle}
      >
        {showLabels && sprite.name && (
          <div
            className="sprite-label"
            style={{
              position: 'absolute',
              bottom: 2,
              [sprite.x > 240 ? 'right' : 'left']: 4,
              fontSize: 10,
              color: '#bdc8d7',
              whiteSpace: 'nowrap',
              textShadow: '0 0 4px #000',
              pointerEvents: 'none',
            }}
          >
            {sprite.name}
          </div>
        )}
        {buildSpriteLayers(spriteList, index + 1)}
      </div>
    );
  }

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
    <td colSpan={2} className="btl-img">
      <div style={{ width: '100%', position: 'relative' }}>
        {/* 導航箭頭 / Navigation arrow */}
        <div className="nav-arrow">
          &lt;&lt;<a href="#">&gt;&gt;</a>
        </div>

        {/* 最外層背景 + 巢狀精靈圖層 / Outermost background + nested sprite layers */}
        <div style={bgStyle}>
          {buildSpriteLayers(sprites, 0)}
        </div>
      </div>
    </td>
  );
};
