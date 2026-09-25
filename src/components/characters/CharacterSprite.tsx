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
import { EnumSpriteVariant, EnumSpriteSize } from '#/components/battle/enums';
import './CharacterSprite.css';
import type { IStyleProps } from '#/components/shared/types';

/** 顯示模式 / Display variant */
export type ISpriteVariant = EnumSpriteVariant;

/** 精靈尺寸 / Sprite size */
export type ISpriteSize = EnumSpriteSize;

/** 單個精靈屬性 / Single sprite props */
export interface ICharacterSpriteProps extends IStyleProps {
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
}

/**
 * 角色精靈組件
 * Character sprite component
 */
export const CharacterSprite: React.FC<ICharacterSpriteProps> = ({
  url,
  variant = EnumSpriteVariant.Boxed,
  size = EnumSpriteSize.Normal,
  background = true,
  border = true,
  alt = '',
  style,
  className = '',
}) => {
  // avatar / original — 直接用 <img>，無 frame
  if (variant === EnumSpriteVariant.Avatar || variant === EnumSpriteVariant.Original) {
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
    size !== EnumSpriteSize.Normal ? `character-sprite--${size}` : '',
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
