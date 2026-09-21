/**
 * 精靈圖資料夾定義（單一事實來源）
 * Sprite image directory definitions (single source of truth)
 *
 * 精靈圖所在的三個資料夾（char / char_rev / other）原本同時以
 * 字串字面量（spriteImageSizes.ts）與正則解析（spriteFlip.ts）各處維護。
 * 集中定義資料夾列舉與型別，避免兩處不一致。各資料夾的 URL 前綴由
 * 生成腳本 scripts/sprite-size-index.ts 以 `'/' + dir + '/'` 直接產生於
 * spriteImageIndex.generated.ts（資料檔）中。
 * The three sprite folders (char / char_rev / other) were maintained separately as
 * string literals (spriteImageSizes.ts) and via regex parsing (spriteFlip.ts).
 * Centralizing the folder union and type prevents the two from drifting. The URL
 * prefix per folder is produced directly by scripts/sprite-size-index.ts as
 * '/' + dir + '/' inside the generated data file (spriteImageIndex.generated.ts).
 */

/** 精靈圖所在資料夾 / Sprite image directories */
export const SPRITE_DIRS = ['char', 'char_rev', 'other'] as const;

/** 精靈圖目錄型別 / Sprite image directory type */
export type ISpriteImageDir = typeof SPRITE_DIRS[number];
