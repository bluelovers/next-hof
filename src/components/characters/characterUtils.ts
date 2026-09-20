/**
 * 角色相關工具函式（單一事實來源）
 * Character-related utilities (single source of truth)
 *
 * 集中維護 carpet 底座交替邏輯與角色頁面連結組合，
 * 供 CharacterCard 與 BattleCharacterCard 共用。
 * Centralizes the alternating carpet-pedestal logic and character-page URL builder
 * so CharacterCard and BattleCharacterCard share one implementation.
 */
import { BASE_URL } from '#/components/config/AppConfig';

/** carpet 底座交替類別（偶數 carpet0 / 奇數 carpet1） / Alternating carpet class */
export function getCarpetClass(index = 0): string {
  return index % 2 === 0 ? 'carpet0' : 'carpet1';
}

/**
 * 組合角色頁面連結 / Build character page URL
 *
 * @param id - 角色 ID / Character ID
 * @returns 完整角色頁 URL / Full character page URL
 */
export function buildCharacterUrl(id: string): string {
  return `${BASE_URL}/char/char?char=${id}`;
}

/** 角色精靈圖片路徑前綴（靜態資源） / Character sprite image path prefix (static asset) */
export const CHAR_IMAGE_PREFIX = '/static/image/char/';

/**
 * 組合角色精靈圖片 URL（單一事實來源）
 * Build a character sprite image URL (single source of truth)
 *
 * 統一靜態圖片前綴，避免各處硬編碼 '/static/image/char/...' 且格式不一致。
 * Centralizes the static-image prefix so callers don't hardcode
 * '/static/image/char/...' with divergent leading-slash conventions.
 *
 * @param file - 檔名（可含或不含開頭斜線） / Filename (with or without leading slash)
 * @returns 完整圖片 URL / Full image URL
 */
export function buildCharacterImageUrl(file: string): string {
  return `${CHAR_IMAGE_PREFIX}${file.replace(/^\//, '')}`;
}
