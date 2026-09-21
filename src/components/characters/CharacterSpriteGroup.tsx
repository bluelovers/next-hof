/**
 * 角色精靈群組組件
 * Character sprite group component
 *
 * 顯示一或多個角色精靈，支援各種顯示模式。
 * Shows one or more character sprites with various display modes.
 */
import React from 'react';
import { CharacterSprite } from './CharacterSprite';
import type { ISpriteVariant, ISpriteSize } from './CharacterSprite';
import './CharacterSpriteGroup.css';

/** 精靈群組屬性 / Sprite group props */
export interface ICharacterSpriteGroupProps {
  /** 精靈圖片 URL 列表 / Sprite image URLs list */
  urls: string[];
  /** 顯示模式 / Display variant */
  variant?: ISpriteVariant;
  /** 尺寸 / Size */
  size?: ISpriteSize;
  /** 顯示背景 / Show background */
  background?: boolean;
  /** 顯示邊框 / Show border */
  border?: boolean;
  /** 額外 CSS 類名 / Additional CSS class */
  className?: string;
}

/**
 * 角色精靈群組組件
 * Character sprite group component
 */
export const CharacterSpriteGroup: React.FC<ICharacterSpriteGroupProps> = ({
  urls,
  variant = 'boxed',
  size = 'normal',
  background = true,
  border = true,
  className = '',
}) => {
  return (
    <span className={`character-sprite-group ${className}`}>
      {urls.map((url, i) => (
        <CharacterSprite
          key={i}
          url={url}
          variant={variant}
          size={size}
          background={background}
          border={border}
        />
      ))}
    </span>
  );
};
