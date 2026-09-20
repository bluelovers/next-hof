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
import { BattleFieldLayers } from './BattleFieldLayers';
import './BattleFieldScene.css';

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

  return (
    <td colSpan={2} className="btl-img">
      <div style={{ width: '100%', position: 'relative' }}>
        {/* 導航箭頭 / Navigation arrow */}
        <div className="nav-arrow">
          &lt;&lt;<a href="#">&gt;&gt;</a>
        </div>

        {/* 最外層背景 + 巢狀精靈圖層 / Outermost background + nested sprite layers */}
        <BattleFieldLayers
          sprites={sprites}
          config={config}
          width={width}
          height={height}
          showLabels={showLabels}
        />
      </div>
    </td>
  );
};
