/**
 * 戰場畫面組件
 * Battlefield scene component
 *
 * 顯示雙方角色精靈在戰場上的位置
 * 使用巢狀 div 疊加方式實現，與原始頁面相同
 * Displays character sprites positioned on the battlefield
 * Uses nested div layering matching the original page
 *
 * 注意：此元件已改為 div 響應式區塊（不再輸出 table cell），
 * 分頁導覽改由父層（BattleDisplay 的分段）負責。
 * NOTE: this component now renders a responsive div block (no table cell);
 * paging navigation is owned by the parent (BattleDisplay segments).
 */
import React from 'react';
import type { IBattleSprite, IBattleFieldConfig, IBattleSpriteLabelOptions } from './types';
import { BattleFieldLayers } from './BattleFieldLayers';
import './BattleFieldScene.css';

/** 戰場畫面屬性（標籤開關共用 IBattleSpriteLabelOptions）/ Battlefield scene props (label toggle from the shared IBattleSpriteLabelOptions) */
export interface IBattleFieldSceneProps extends IBattleSpriteLabelOptions {
  /** 精靈列表 / Sprite list */
  sprites: IBattleSprite[];
  /** 戰場配置 / Battlefield config */
  config: IBattleFieldConfig;
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
  showSpriteLabels,
}) => {
  return (
    <div className="btl-img">
      {/* 最外層背景 + 巢狀精靈圖層 / Outermost background + nested sprite layers */}
      <div className="btl-img-inner">
        <BattleFieldLayers
          sprites={sprites}
          config={config}
          width={config.width}
          height={config.height}
          showSpriteLabels={showSpriteLabels}
          bgSize={config.bgSize}
        />
      </div>
    </div>
  );
};
