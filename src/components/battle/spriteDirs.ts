/**
 * 精靈圖資料夾定義（單一事實來源）
 * Sprite image directory definitions (single source of truth)
 *
 * 精靈圖所在的三個資料夾（char / char_rev / other）原本同時以
 * 字串字面量（spriteImageSizes.ts）與正則解析（spriteFlip.ts）各處維護。
 * 集中定義資料夾列舉、型別與 URL 前綴，避免兩處不一致。
 * The three sprite folders (char / char_rev / other) were maintained separately as
 * string literals (spriteImageSizes.ts) and via regex parsing (spriteFlip.ts).
 * Centralizing the folder union, type, and URL prefixes prevents the two from drifting.
 */

/** 精靈圖所在資料夾 / Sprite image directories */
export const SPRITE_DIRS = ['char', 'char_rev', 'other'] as const;

/** 精靈圖目錄型別 / Sprite image directory type */
export type ISpriteImageDir = typeof SPRITE_DIRS[number];

/** 各資料夾的 URL 前綴 / URL prefix per directory */
export const SPRITE_DIR_PREFIX: Record<ISpriteImageDir, string> = {
  char: '/image/char/',
  char_rev: '/image/char_rev/',
  other: '/image/other/',
};
