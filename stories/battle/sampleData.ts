/**
 * 戰場展示用共用樣本資料（單一事實來源）
 * Shared battlefield sample data for stories (single source of truth)
 *
 * 所有 battle 相關 story 皆由此處引用，避免各檔案各自維護與定義重複資料
 * All battle-related stories import from here to avoid duplicated,
 * independently-maintained sample data across files.
 */
import type { IBattleSprite, IBattleFieldConfig } from '../../src/components/battle/types';

/** 共用敵方精靈樣本 / Shared enemy sprite samples */
export const sampleEnemySprites: IBattleSprite[] = [
  { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 164, y: 16, flipped: false, name: 'GoblinWarrior(A)' },
  { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 148, y: 56, flipped: false, name: 'GoblinWarrior(B)' },
  { id: 'mon_053', imageUrl: '/image/char/mon_053.png', x: 124, y: 96, flipped: false, name: 'GoblinAxe' },
];

/** 共用友方精靈樣本 / Shared ally sprite samples */
export const sampleAllySprites: IBattleSprite[] = [
  { id: 'mon_018', imageUrl: '/image/char_rev/mon_018.png', x: 352, y: 14, flipped: true, name: 'Hero1' },
  { id: 'mon_214', imageUrl: '/image/char_rev/mon_214.png', x: 388, y: 64, flipped: true, name: 'Mage1' },
  { id: 'mon_079', imageUrl: '/image/char_rev/mon_079.png', x: 300, y: 110, flipped: true, name: 'Priest1' },
];

/** 共用完整戰場精靈樣本（敵方 + 友方） / Shared full battlefield sprite samples (enemies + allies) */
export const sampleSprites: IBattleSprite[] = [
  ...sampleEnemySprites,
  ...sampleAllySprites,
];

/** 共用戰場尺寸（角色排版尺寸，預設 480×200） / Shared battlefield size (default 480×200) */
export const sampleFieldSize = { width: 480, height: 200 };

/** 共用背景圖片 URL（單一事實來源，避免各處硬編碼路徑） / Shared background image URLs (single source of truth) */
export const sampleBackgroundUrls = {
  grass: '/image/land/bg_grass.png',
  grass01: '/image/land/bg_grass01.png',
  cave: '/image/land/bg_cave.png',
  snow: '/image/land/bg_snow.png',
  sand: '/image/land/bg_sand.png',
  egypt: '/image/land/bg_egypt_001.png', // 實際圖檔尺寸 768×320 / actual file size 768×320
} as const;

/**
 * 建立共用戰場配置
 * Create a shared battlefield config
 *
 * 統一使用 sampleFieldSize 作為角色排版尺寸，並套用指定的背景圖片
 * Uses sampleFieldSize for the sprite layout size and applies the given background.
 */
export function createSampleConfig(
  bg: keyof typeof sampleBackgroundUrls
): IBattleFieldConfig {
  return {
    backgroundImageUrl: sampleBackgroundUrls[bg],
    ...sampleFieldSize,
  };
}
