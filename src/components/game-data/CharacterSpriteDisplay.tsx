/**
 * 角色精靈顯示組件（向後兼容包裝）
 * Character sprite display component (backward-compatible wrapper)
 *
 * 建議直接使用 CharacterSprite / CharacterSpriteGroup 取代此組件。
 * Prefer using CharacterSprite / CharacterSpriteGroup directly.
 */
import React from 'react';
import { CharacterSpriteGroup } from '#/components/characters/CharacterSpriteGroup';
import type { ISpriteSize } from '#/components/characters/CharacterSprite';
import './CharacterSpriteDisplay.css';

/**
 * 角色精靈顯示組件屬性
 * Character sprite display component properties
 */
export interface ICharacterSpriteDisplayProps {
  /** 精靈圖片網址列表 / Sprite image URLs list */
  spriteUrls: string[];
  /** 額外的 CSS 類名 / Additional CSS class names */
  className?: string;
  /** 精靈尺寸 / Sprite size */
  size?: 'small' | 'normal' | 'large';
  /** 精靈類型（用於樣式） / Sprite type (for styling) */
  spriteType?: 'male' | 'female' | 'neutral';
  /** 是否懸停效果 / Whether to include hover effects */
  hoverable?: boolean;
}

/**
 * 角色精靈顯示組件
 * Character sprite display component
 */
export const CharacterSpriteDisplay: React.FC<ICharacterSpriteDisplayProps> = ({
  spriteUrls,
  className = 'character-sprite-display',
  size = 'normal',
  spriteType = 'neutral',
  hoverable = true,
}) => {
  const extraClasses = [
    spriteType !== 'neutral' ? spriteType : '',
    hoverable ? 'hoverable' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`${className} ${extraClasses}`}>
      <CharacterSpriteGroup
        urls={spriteUrls}
        size={size as ISpriteSize}
      />
    </div>
  );
};
