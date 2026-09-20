/**
 * 戰場展示用共用樣本資料（單一事實來源）
 * Shared battlefield sample data for stories (single source of truth)
 *
 * 所有 battle 相關 story 皆由此處引用，避免各檔案各自維護與定義重複資料
 * All battle-related stories import from here to avoid duplicated,
 * independently-maintained sample data across files.
 */
import type { IBattleSprite, IBattleFieldConfig, IBattleMagicCircle } from '../../src/components/battle/types';
import {
  computeBattleSpritePositions,
  type IComputeSpritePositionsOptions,
  type IBattlePositionChar,
  type ITeamBattleChars,
} from '../../src/components/battle/computeSpritePositions';
import { getSpriteImageSize } from '../../src/components/battle/spriteImageSizes';

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
 * 共用魔方陣（魔法陣）展示資料（單一事實來源）
 * Shared magic-circle (魔法陣) showcase data (single source of truth)
 *
 * 對應 PHP exec_css 中的魔方陣渲染（固定位置背景圖層，繪製於角色精靈之下）
 * Mirrors the magic-circle rendering in PHP exec_css (fixed-position background
 * layer drawn beneath the sprites); position defaults to (280, 0) per PHP.
 */
export const sampleMagicCircles: IBattleMagicCircle[] = [
  { imageUrl: '/image/other/mc0_1.png', x: 280, y: 0 },
];

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

// ============================================================================
// 自動產生位置（展示版本）/ Auto-positioned (demo version)
// ============================================================================

/** 名冊角色（不含尺寸，位置由 computeBattleSpritePositions 計算） / Roster char (no size; position computed) */
interface IRosterChar {
  /** 角色 ID（同時作為 DOM id） / Character ID (also DOM id) */
  id: string;
  /** 角色名稱 / Name */
  name?: string;
  /** 精靈圖片路徑 / Sprite image path */
  imageUrl: string;
  /** 站位：前衛 / 後衛 / Position: front / back */
  position: 'front' | 'back';
  /** 隊伍側：左 / 右 / Team side: left / right */
  side: 'left' | 'right';
}

/** 名冊隊伍 / Roster team */
interface IRosterTeam {
  /** 前衛 / Front row */
  front: IRosterChar[];
  /** 後衛 / Back row */
  back: IRosterChar[];
}

/**
 * 展示用名冊：左隊（我方，面向右）與右隊（敵方，面向左）
 * Demo roster: left team (allies, facing right) and right team (enemies, facing left)
 *
 * 不含 x/y 與圖像尺寸，位置與中心對齊完全由 computeBattleSpritePositions 依
 * 戰場尺寸與各圖真實尺寸自動計算（對照 PHP CopyRow 的 getimagesize）
 * No x/y or size: positions and centering are computed automatically from the
 * battlefield size and each image's real size (mirrors PHP CopyRow getimagesize).
 *
 * 注意：flip 模式下右隊使用 char（非 char_rev）圖，由 flipped 標記鏡像為面向左
 * Note: in flip mode the right team uses char (not char_rev) images; the flipped
 * flag mirrors them to face left.
 */
const demoRoster: { left: IRosterTeam; right: IRosterTeam } = {
  left: {
    back: [
      { id: 'mon_018', name: 'Hero1', imageUrl: '/image/char/mon_018.png', position: 'back', side: 'left' },
    ],
    front: [
      { id: 'mon_014', name: 'Mage1', imageUrl: '/image/char/mon_014.png', position: 'front', side: 'left' },
      { id: 'mon_079', name: 'Priest1', imageUrl: '/image/char/mon_079.png', position: 'front', side: 'left' },
    ],
  },
  right: {
    back: [
      { id: 'mon_052a', name: 'GoblinWarrior(A)', imageUrl: '/image/char/mon_052.png', position: 'back', side: 'right' },
    ],
    front: [
      { id: 'mon_052b', name: 'GoblinWarrior(B)', imageUrl: '/image/char/mon_052.png', position: 'front', side: 'right' },
      { id: 'mon_053', name: 'GoblinAxe', imageUrl: '/image/char/mon_053.png', position: 'front', side: 'right' },
    ],
  },
};

/** 將名冊角色補上真實圖像尺寸，轉為定位計算用的輸入 / Inject real image sizes into roster chars */
function toPositionChars(team: IRosterTeam): ITeamBattleChars {
  const map = (c: IRosterChar): IBattlePositionChar => {
    const size = getSpriteImageSize(c.imageUrl);
    return { ...c, imageWidth: size.width, imageHeight: size.height };
  };
  return { back: team.back.map(map), front: team.front.map(map) };
}

/**
 * 建立「自動產生位置」的展示用精靈陣列
 * Create auto-positioned demo sprites
 *
 * 依據 demoRoster 與戰場尺寸，自動計算每個角色的 background-position (x, y)
 * 與 flipped；可透過 options 覆寫 cellCount / flip 等
 * Computes each sprite's background-position (x, y) and flipped from the roster
 * and battlefield size; options can override cellCount / flip etc.
 */
export function createAutoSampleSprites(
  options?: Partial<IComputeSpritePositionsOptions>
): IBattleSprite[] {
  const input = {
    left: toPositionChars(demoRoster.left),
    right: toPositionChars(demoRoster.right),
  };
  return computeBattleSpritePositions(input, { ...sampleFieldSize, flip: true, ...options });
}

/** 共用自動定位精靈樣本（展示用） / Shared auto-positioned sprite sample (demo) */
export const sampleSpritesAuto: IBattleSprite[] = createAutoSampleSprites();
