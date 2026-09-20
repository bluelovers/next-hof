/**
 * 應用程式全域設定（單一事實來源）
 * App-wide configuration (single source of truth)
 *
 * 集中管理跨功能共用的環境常數，避免各元件各自硬編碼相同的 URL。
 * Centralizes cross-feature environment constants so components stop hard-coding
 * the same URLs in isolation.
 */

/** 應用程式基底 URL / Application base URL */
export const BASE_URL = 'http://127.0.0.1:8085';

/**
 * 組合應用程式內部路徑為完整 URL
 * Build a full URL from an in-app path
 *
 * 以 BASE_URL 為前綴；傳入空字串時僅回傳 BASE_URL。
 * Prefixes BASE_URL; passing an empty string returns BASE_URL alone.
 * 注意：錨點（如 '#top'）不經此函式處理，應直接以字面量撰寫。
 * Note: anchors (e.g. '#top') are NOT handled here and should stay literal.
 *
 * @param path - 路徑（可含或不含開頭 '/'） / Path (with or without leading '/')
 * @returns 完整 URL / Full URL
 */
export function buildAppUrl(path = ''): string {
  if (!path) return BASE_URL;
  const sep = path.startsWith('/') ? '' : '/';
  return `${BASE_URL}${sep}${path}`;
}
