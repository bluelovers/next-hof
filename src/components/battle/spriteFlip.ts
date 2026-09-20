/**
 * 戰場精靈翻轉（flip）推導邏輯（可獨立使用）
 * Battlefield sprite flip derivation logic (standalone, reusable)
 *
 * flip 的用途：當某張精靈圖只存在 char 或 char_rev 其中一方時，
 * 透過翻轉補出正確朝向，避免「方向錯誤」或「缺圖導致不完整」
 * Purpose of flip: when a sprite image exists in only one of char / char_rev,
 * mirror it to produce the correct facing — avoiding wrong direction or an
 * incomplete look caused by a missing counterpart.
 *
 * 本檔案刻意不依賴 computeBattleSpritePositions，僅依賴 types，
 * 使其可獨立匯入與單元測試
 * This file deliberately depends only on ./types (not on computeBattleSpritePositions)
 * so it can be imported and unit-tested in isolation.
 */
import type { ITeamSide } from './types';

/** 精靈圖所在目錄 / Sprite image directory */
export type ISpriteImageDir = 'char' | 'char_rev' | 'other';

/**
 * 嚴格判斷圖檔目錄
 * Strictly detect the sprite image directory
 *
 * 僅當路徑位於 /image/char/ 或 /image/char_rev/ 之下（可含任意子目錄）才分類；
 * 第一層資料夾必須「恰好」是 char 或 char_rev，其餘（如 /image/char_special/、
 * /image/other/、/image/land/）一律視為 'other'，避免被錯誤判定。
 * Classifies as 'char' / 'char_rev' only when the path is under /image/char/ or
 * /image/char_rev/ (sub-directories allowed); the first path segment must be exactly
 * char or char_rev. Anything else (char_special, other, land, ...) is 'other'.
 *
 * 嚴格比對的是「第一層資料夾名稱」，允許其下再有子目錄：
 * The strict match is on the FIRST folder name; sub-directories beneath it are allowed:
 *   - /image/char/mon.png            → 'char'
 *   - /image/char/sub/mon.png       → 'char'（允許子目錄 / sub-directory allowed）
 *   - /image/char_rev/abc/mon.png   → 'char_rev'（允許子目錄）
 *   - /image/other/mc0_1.png        → 'other'（魔法陣等額外圖，不應翻轉）
 *   - /image/land/bg_grass.png      → 'other'（背景圖，不應翻轉）
 *   - /image/char_special/mon.png   → 'other'（名稱相似但非 char）
 */
export function getSpriteImageDir(imageUrl: string): ISpriteImageDir {
  // 先去掉 query / hash，再取第一層資料夾名稱（/image/<資料夾>/...）
  // Strip query/hash, then take the first folder name (/image/<folder>/...).
  const clean = imageUrl.split('?')[0].split('#')[0];
  const m = clean.match(/^\/image\/([^/]+)\//);
  const dir = m ? m[1] : null;
  if (dir === 'char_rev') return 'char_rev';
  if (dir === 'char') return 'char';
  return 'other';
}

/** 計算翻轉時的選項 / Options for flip computation */
export interface IComputeSpriteFlippedOptions {
  /**
   * 明確指定的翻轉值（優先於自動推導）
   * Explicit flipped value (takes priority over auto-derivation)
   *
   * 當目錄為 'other'（自定義 / 額外圖檔）而無法判斷朝向時使用；
   * 未提供則回退為不翻轉（安全預設，不臆測朝向）
   * Used when the directory is 'other' (custom / extra image) and facing cannot be
   * inferred; falls back to no flip (safe default, never guesses facing).
   */
  flipped?: boolean;
}

/**
 * 依圖檔目錄與隊伍側，計算是否翻轉
 * Compute whether to flip, from the image directory and team side
 *
 * 約定（char 圖預設朝右、char_rev 圖預設朝左；兩隊皆應面向場地中心）：
 * Convention (char faces right by default, char_rev faces left; both teams face the
 * battlefield center):
 *   - char     + 右隊(right) → 翻轉（朝左）   / flip (face left)
 *   - char     + 左隊(left)  → 不翻轉（朝右） / no flip (face right)
 *   - char_rev + 右隊(right) → 不翻轉（已朝左） / no flip (already faces left)
 *   - char_rev + 左隊(left)  → 翻轉（朝右）   / flip (face right)
 *   - other               → 回退 flipped 明確值或 false（嚴格：不臆測）
 *   - other               → explicit flipped or false (strict: never guess)
 */
export function computeSpriteFlipped(
  imageUrl: string,
  side: ITeamSide,
  options?: IComputeSpriteFlippedOptions
): boolean {
  const dir = getSpriteImageDir(imageUrl);
  switch (dir) {
    case 'char':
      return side === 'right';
    case 'char_rev':
      return side === 'left';
    case 'other':
    default:
      return options?.flipped ?? false;
  }
}

/**
 * 依圖檔目錄與隊伍側，判斷是否採用「翻轉定位模式」
 * Decide whether to use the "flip positioning" mode from directory + side
 *
 * 翻轉定位模式 = 將該隊置於左側欄位、再以 CSS 鏡像到右側（位置與朝向同時翻轉）；
 * 非翻轉定位模式 = 直接置於該隊所屬側。兩者的選擇與 computeSpriteFlipped 一致：
 * Flip positioning = place the team on the left columns, then mirror to the right via
 * CSS (position and facing flipped together); non-flip = place directly on its side.
 * The choice matches computeSpriteFlipped:
 *   - char (預設朝右) 配右隊 → 需鏡像 → 翻轉定位
 *   - char_rev (預設朝左) 配左隊 → 需鏡像 → 翻轉定位
 *   - 其餘 → 直接定位（不翻轉）
 */
export function useFlipPositioning(
  imageUrl: string,
  side: ITeamSide
): boolean {
  const dir = getSpriteImageDir(imageUrl);
  if (dir === 'char') return side === 'right';
  if (dir === 'char_rev') return side === 'left';
  return false;
}
