/**
 * 角色精靈組件
 * Character sprite component
 *
 * 統一角色圖片顯示，支援四種模式：
 * - boxed：帶背景框（預設，與 PHP 頁面一致）
 * - raw：無背景無邊框，保留尺寸限制
 * - original：原始大小，無任何限制
 * - avatar：純圖片（無 frame），供外層自行包裝連結/底座
 */
import React from 'react';
import './CharacterSprite.css';

/** 顯示模式 / Display variant */
export type ISpriteVariant = 'boxed' | 'raw' | 'original' | 'avatar';

/** 精靈尺寸 / Sprite size */
export type ISpriteSize = 'small' | 'normal' | 'large';

/** 單個精靈屬性 / Single sprite props */
export interface ICharacterSpriteProps {
  /** 精靈圖片 URL / Sprite image URL */
  url: string;
  /** 顯示模式 / Display variant */
  variant?: ISpriteVariant;
  /** 尺寸（boxed/raw 模式）/ Size (boxed/raw only) */
  size?: ISpriteSize;
  /** 顯示背景（boxed 模式）/ Show background (boxed only) */
  background?: boolean;
  /** 顯示邊框（boxed 模式）/ Show border (boxed only) */
  border?: boolean;
  /** alt 文字 / Alt text */
  alt?: string;
  /** 自訂行內樣式 / Custom inline style */
  style?: React.CSSProperties;
  /** 額外 CSS 類名 / Additional CSS class */
  className?: string;
}

/**
 * 角色精靈組件
 * Character sprite component
 */
export const CharacterSprite: React.FC<ICharacterSpriteProps> = ({
  url,
  variant = 'boxed',
  size = 'normal',
  background = true,
  border = true,
  alt = '',
  style,
  className = '',
}) => {
  // avatar / original — 直接用 <img>，無 frame
  if (variant === 'avatar' || variant === 'original') {
    return (
      <img
        src={url}
        className={`character-sprite character-sprite--${variant} ${className}`}
        alt={alt}
        style={style}
      />
    );
  }

  // boxed / raw — 用 background-image
  const classes = [
    'character-sprite',
    `character-sprite--${variant}`,
    size !== 'normal' ? `character-sprite--${size}` : '',
    !background ? 'character-sprite--no-bg' : '',
    !border ? 'character-sprite--no-border' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span
      className={classes}
      style={{ backgroundImage: `url(${url})`, ...style }}
    />
  );
};
