/**
 * 魔方陣（魔法陣）圖層組件
 * Magic-circle (魔法陣) layer component
 *
 * 對應 PHP HOF_Class_Battle_Style::exec_css() 中的魔方陣渲染：
 * 以「固定位置背景圖層」繪製於角色精靈之下，位置預設 (280, 0)。
 * Mirrors the magic-circle rendering in PHP exec_css(): a fixed-position
 * background layer drawn beneath the sprites; default position (280, 0).
 */
import React from 'react';
import type { CSSProperties } from 'react';
import type { IBattleMagicCircle } from './types';
import { MAGIC_CIRCLE_DEFAULT_X, MAGIC_CIRCLE_DEFAULT_Y } from './types';
import './BattleFieldMagicCircle.css';

/** 魔方陣圖層屬性 / Magic-circle layer props */
export interface IBattleMagicCircleProps {
  /** 魔方陣資料（圖片路徑與定位） / Magic-circle data (image path & placement) */
  magicCircle: IBattleMagicCircle;
  /** 排版框寬度（角色精靈層尺寸） / Layout frame width (sprite layer size) */
  width: number;
  /** 排版框高度 / Layout frame height */
  height: number;
  /** 元素 id（選填，供測試或錨點定位） / Element id (optional; for tests or anchor targeting) */
  id?: string;
  /** 額外樣式（選填，合併並可覆寫計算樣式） / Extra style (optional; merged over computed style) */
  style?: CSSProperties;
}

/**
 * 魔方陣圖層組件
 * Magic-circle layer component
 *
 * 以與角色精靈相同的排版框尺寸（width × height）為容器，將魔方陣圖片以
 * background-position (x, y) 繪製於其上；該 div 絕對定位於排版框左上角，
 * 由父層決定是否置於角色之下。
 * Uses the same layout-frame size (width × height) as the sprite layer and draws
 * the magic-circle image at background-position (x, y); the div is absolutely
 * positioned at the frame's top-left, and the parent places it beneath sprites.
 */
export const BattleFieldMagicCircle: React.FC<IBattleMagicCircleProps> = ({
  magicCircle,
  width,
  height,
  id,
  style,
}) => {
  /** 動態樣式（依 props 計算，並合併外部傳入樣式） / Dynamic style (computed, merged with passed style) */
  const mergedStyle: CSSProperties = {
    width,
    height,
    backgroundImage: `url(${magicCircle.imageUrl})`,
    backgroundPosition: `${magicCircle.x ?? MAGIC_CIRCLE_DEFAULT_X}px ${magicCircle.y ?? MAGIC_CIRCLE_DEFAULT_Y}px`,
    ...style,
  };

  return <div id={id} className="battle-magic-circle" style={mergedStyle} />;
};
