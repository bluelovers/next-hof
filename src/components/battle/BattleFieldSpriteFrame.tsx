/**
 * 戰場精靈排版框組件
 * Battlefield sprite layout frame component
 *
 * 位於「背景」與「角色精靈圖層」之間的中介圖層，
 * 用固定尺寸（width x height）框住角色精靈，
 * 使背景尺寸（bgSize）可以獨立放大而不影響角色精靈的排版
 * Intermediate layer between the background and the sprite layers.
 * Frames the character sprites at a fixed size (width x height) so the
 * background size (bgSize) can be enlarged independently without affecting
 * the character sprite layout.
 */
import React from 'react';
import type { IBattleSprite, IBattleFieldVAlign, IBattleSpriteLabelOptions } from './types';
import { BattleFieldSpriteLayers } from './BattleFieldSpriteLayers';
import './BattleFieldSpriteFrame.css';
import type { IStyleProps } from '#/components/shared/types';

/** 戰場精靈排版框屬性（標籤開關共用 IBattleSpriteLabelOptions）/ Battlefield sprite layout frame props (label toggle from the shared IBattleSpriteLabelOptions) */
export interface IBattleFieldSpriteFrameProps extends IBattleSpriteLabelOptions, IStyleProps {
  /** 精靈列表 / Sprite list */
  sprites: IBattleSprite[];
  /** 排版框寬度（角色排版尺寸） / Frame width (sprite layout size) */
  width: number;
  /** 排版框高度（角色排版尺寸） / Frame height (sprite layout size) */
  height: number;
  /** 垂直對齊方式（預設 bottom） / Vertical alignment (default bottom) */
  valign?: IBattleFieldVAlign;
}

/**
 * 戰場精靈排版框組件
 * Battlefield sprite layout frame component
 *
 * 以 width x height 的尺寸框住角色精靈圖層，
 * 作為背景與精靈之間的保護層，固定角色排版座標的原點
 * Frames the sprite layers at width x height, acting as a protective
 * layer between background and sprites and fixing the sprite layout origin.
 *
 * 水平永遠置中；垂直位置由 valign 控制（預設 bottom）
 * Always horizontally centered; vertical position controlled by valign (default bottom).
 */
export const BattleFieldSpriteFrame: React.FC<IBattleFieldSpriteFrameProps> = ({
  sprites,
  width,
  height,
  showSpriteLabels,
  valign,
  style,
  className,
}) => {
  return (
    <div
      className={`battle-sprite-frame battle-sprite-frame--${valign ?? 'bottom'}${className ? ` ${className}` : ''}`}
      style={{ width, height, ...style }}
    >
      <BattleFieldSpriteLayers
        sprites={sprites}
        index={0}
        width={width}
        height={height}
        showSpriteLabels={showSpriteLabels}
      />
    </div>
  );
};
