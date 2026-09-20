/**
 * GameData 元件工具函式（單一事實來源）
 * GameData component utilities (single source of truth)
 *
 * 集中維護精靈背景樣式組合，供 CharacterSpriteDisplay 與 JobDetailCard 共用，
 * 避免相同三項 inline 樣式散落多處。
 * Centralizes sprite-background style composition so CharacterSpriteDisplay and
 * JobDetailCard share one implementation instead of duplicating the same three
 * inline style properties.
 */
import type { CSSProperties } from 'react';

/**
 * 組合精靈背景樣式
 * Build sprite background style
 *
 * @param url - 精靈圖片 URL / Sprite image URL
 * @returns 背景樣式物件 / Background style object
 */
export function buildSpriteStyle(url: string): CSSProperties {
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
}
