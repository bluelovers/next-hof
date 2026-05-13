/**
 * 角色精靈顯示組件
 * Character sprite display component
 *
 * 負責顯示角色精靈圖片
 * Handles the display of character sprite images
 */
import React from 'react';
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
  className = "character-sprite-display",
  size = 'normal',
  spriteType = 'neutral',
  hoverable = true,
}) => {
  const spriteClasses = [
    'character-sprite',
    size !== 'normal' ? size : '',
    spriteType !== 'neutral' ? spriteType : '',
    hoverable ? 'hoverable' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      {spriteUrls.map((url, index) => (
        <div
          key={index}
          className={spriteClasses}
          style={{
            backgroundImage: `url(${url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}
    </div>
  );
};