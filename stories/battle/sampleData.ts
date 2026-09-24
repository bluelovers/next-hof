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
  groupBattleChars,
  type IComputeSpritePositionsOptions,
  type IBattlePositionChar,
  type ITeamBattleChars,
} from '../../src/components/battle/computeSpritePositions';
import { EnumTeamSideUI, EnumPosition } from '../../src/components/battle/enums';

/** 共用敵方精靈樣本 / Shared enemy sprite samples */
export const sampleEnemySprites: IBattleSprite[] = [
  { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 164, y: 16, flipped: false, name: 'GoblinWarrior(A)' },
  { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 148, y: 56, flipped: false, name: 'GoblinWarrior(B)' },
  { id: 'mon_053', imageUrl: '/image/char/mon_053.png', x: 124, y: 96, flipped: false, name: 'GoblinAxe' },
];

/**
 * 共用友方精靈樣本 / Shared ally sprite samples
 *
 * 友方為「右隊」，使用 char_rev（已預先鏡像、面向左）圖，
 * flipped:false 直接置於右側，因此全員都在同一側、朝向一致
 * Allies are the "right team": use char_rev (pre-mirrored, facing left) images
 * with flipped:false placed directly on the right side, so all sprites share the
 * same side and the same facing direction.
 *
 * 注意：不可在 char_rev 上再加 flipped:true —— 那會造成「雙重鏡像」，
 * 且因 BattleFieldSpriteLayers 舊版巢狀結構會累積翻轉，導致同隊出現
 * 「左 2 右 1」等位置/朝向錯亂（見 BattleFieldSpriteLayers 修正說明）
 * Note: do NOT add flipped:true on top of char_rev — that double-mirrors and,
 * combined with the old nested layering, split a single team across sides.
 */
export const sampleAllySprites: IBattleSprite[] = [
  { id: 'mon_018', imageUrl: '/image/char_rev/mon_018.png', x: 352, y: 14, flipped: false, name: 'Hero1' },
  { id: 'mon_214', imageUrl: '/image/char_rev/mon_214.png', x: 388, y: 64, flipped: false, name: 'Mage1' },
  { id: 'mon_079', imageUrl: '/image/char_rev/mon_079.png', x: 300, y: 110, flipped: false, name: 'Priest1' },
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
  position: EnumPosition;
  /** 隊伍側：左 / 右 / Team side: left / right */
  side: EnumTeamSideUI;
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
      { id: 'mon_018', name: 'Hero1', imageUrl: '/image/char/mon_018.png', position: EnumPosition.Back, side: EnumTeamSideUI.Left },
    ],
    front: [
      { id: 'mon_014', name: 'Mage1', imageUrl: '/image/char/mon_014.png', position: EnumPosition.Front, side: EnumTeamSideUI.Left },
      { id: 'mon_079', name: 'Priest1', imageUrl: '/image/char/mon_079.png', position: EnumPosition.Front, side: EnumTeamSideUI.Left },
    ],
  },
  right: {
    back: [
      { id: 'mon_052a', name: 'GoblinWarrior(A)', imageUrl: '/image/char/mon_052.png', position: EnumPosition.Back, side: EnumTeamSideUI.Right },
    ],
    front: [
      { id: 'mon_052b', name: 'GoblinWarrior(B)', imageUrl: '/image/char/mon_052.png', position: EnumPosition.Front, side: EnumTeamSideUI.Right },
      { id: 'mon_053', name: 'GoblinAxe', imageUrl: '/image/char/mon_053.png', position: EnumPosition.Front, side: EnumTeamSideUI.Right },
    ],
  },
};

/** 將名冊角色補上真實圖像尺寸，轉為定位計算用的輸入 / Inject real image sizes into roster chars */
function toPositionChars(team: IRosterTeam): ITeamBattleChars {
  const map = (c: IRosterChar): IBattlePositionChar => {
    const size = getSpriteImageSize(c.imageUrl);
    return { ...c, imageSize: size };
  };
  return { back: team.back.map(map), front: team.front.map(map) };
}

/**
 * 建立「自動產生位置」的展示用精靈陣列
 * Create auto-positioned demo sprites
 *
 * 依據 demoRoster 與戰場尺寸，自動計算每個角色的 background-position (x, y)
 * 與 flipped；翻轉改由圖檔目錄（char / char_rev）搭配隊伍側自動推導
 * （見 src/components/battle/spriteFlip.ts），不再寫死 flip。
 * 可透過 options.flip 明確覆寫、或 options.cellCount 等調整。
 * Computes each sprite's background-position (x, y) and flipped from the roster
 * and battlefield size; flipping is now auto-derived from the image directory
 * (char / char_rev) combined with the team side (see spriteFlip.ts) instead of
 * being hardcoded. Pass options.flip to override, or options.cellCount to adjust.
 */
export function createAutoSampleSprites(
  options?: Partial<IComputeSpritePositionsOptions>
): IBattleSprite[] {
  const input = {
    left: toPositionChars(demoRoster.left),
    right: toPositionChars(demoRoster.right),
  };
  // 不傳 flip：交由 computeBattleSpritePositions 依圖檔目錄自動推導翻轉
  // Omit flip so computeBattleSpritePositions auto-derives flipping from the directory.
  return computeBattleSpritePositions(input, { ...sampleFieldSize, ...options });
}

/**
 * 建立「同一隊伍混用 char / char_rev」的展示用精靈陣列（結構化名冊）
 * Create sprites for a single team mixing char / char_rev (structured roster)
 *
 * 用來驗證：同一隊伍內同時存在 char（需翻轉定位）與 char_rev（直接定位）圖時，
 * 自動翻轉邏輯仍能讓所有人落在同一側、朝向一致
 * Used to verify that when a single team mixes char (needs flip positioning) and
 * char_rev (direct positioning) images, the auto-flip logic still places everyone
 * on the same side with a consistent facing.
 */
const mixedRoster: { left: IRosterTeam; right: IRosterTeam } = {
  left: { front: [], back: [] },
  right: {
    back: [
      { id: 'mon_190', name: 'mon_190(char_rev)', imageUrl: '/image/char_rev/mon_190.png', position: EnumPosition.Back, side: EnumTeamSideUI.Right },
      { id: 'mon_170', name: 'mon_170(char_rev)', imageUrl: '/image/char/mon_170.png', position: EnumPosition.Back, side: EnumTeamSideUI.Right },
    ],
    front: [
      { id: 'mon_052', name: 'Goblin(char)', imageUrl: '/image/char/mon_052.png', position: EnumPosition.Front, side: EnumTeamSideUI.Right },
      { id: 'mon_018', name: 'Hero(char_rev)', imageUrl: '/image/char_rev/mon_018.png', position: EnumPosition.Front, side: EnumTeamSideUI.Right },
      { id: 'mon_079', name: 'Priest(char_rev)', imageUrl: '/image/char_rev/mon_079.png', position: EnumPosition.Front, side: EnumTeamSideUI.Right },
    ],
  },
};

export function createMixedSampleSprites(
  options?: Partial<IComputeSpritePositionsOptions>
): IBattleSprite[] {
  const input = {
    left: toPositionChars(mixedRoster.left),
    right: toPositionChars(mixedRoster.right),
  };
  // 不傳 flip：交由 computeBattleSpritePositions 依各圖檔目錄個別推導翻轉
  // Omit flip so computeBattleSpritePositions auto-derives flip per sprite's directory.
  return computeBattleSpritePositions(input, { ...sampleFieldSize, ...options });
}

// ============================================================================
// 新增展示：扁平名冊 + groupBattleChars 自動分隊
// NEW demo: flat roster + groupBattleChars auto-grouping
// （這正是 IBattlePositionChar.side / .position 的實際用法）
// (this is exactly what IBattlePositionChar.side / .position are for)
// ============================================================================

/**
 * 扁平名冊：所有角色放在同一陣列，各自帶 side / position
 * Flat roster: every character in a single array, each carrying its own side / position.
 *
 * 這正是 IBattlePositionChar.side / .position 的用意——呼叫端只需給出一張扁平清單，
 * 由 groupBattleChars() 依 side / position 自動分類為 left/right 隊的 front/back 列，
 * 不必手動嵌套 front/back 陣列。
 * This is exactly what IBattlePositionChar.side / .position are for: callers supply one
 * flat list and groupBattleChars() classifies it into left/right teams' front/back rows
 * by side / position, with no manual front/back nesting.
 */
const flatRosterSample: IRosterChar[] = [
  { id: 'mon_018', name: 'Hero1', imageUrl: '/image/char/mon_018.png', position: EnumPosition.Back, side: EnumTeamSideUI.Left },
  { id: 'mon_014', name: 'Mage1', imageUrl: '/image/char/mon_014.png', position: EnumPosition.Front, side: EnumTeamSideUI.Left },
  { id: 'mon_079', name: 'Priest1', imageUrl: '/image/char/mon_079.png', position: EnumPosition.Front, side: EnumTeamSideUI.Left },
  { id: 'mon_052a', name: 'GoblinWarrior(A)', imageUrl: '/image/char/mon_052.png', position: EnumPosition.Back, side: EnumTeamSideUI.Right },
  { id: 'mon_052b', name: 'GoblinWarrior(B)', imageUrl: '/image/char/mon_052.png', position: EnumPosition.Front, side: EnumTeamSideUI.Right },
  { id: 'mon_053', name: 'GoblinAxe', imageUrl: '/image/char/mon_053.png', position: EnumPosition.Front, side: EnumTeamSideUI.Right },
];

/** 將扁平名冊補上真實圖像尺寸，轉為 groupBattleChars 所需的 IBattlePositionChar[] */
function toBattlePositionChars(roster: IRosterChar[]): IBattlePositionChar[] {
  return roster.map((c): IBattlePositionChar => {
    const size = getSpriteImageSize(c.imageUrl);
    return { ...c, imageSize: size };
  });
}

/**
 * 建立「扁平名冊 + groupBattleChars 自動分隊」的展示用精靈陣列
 * Create sprites from a flat roster auto-grouped by groupBattleChars()
 *
 * 效果等同 createAutoSampleSprites，但輸入形式為扁平名冊，由 groupBattleChars 依
 * 各角色的 side / position 自動建立隊伍結構。
 * Equivalent to createAutoSampleSprites, but the input is a flat roster and
 * groupBattleChars builds the team structure from each char's side / position.
 */
export function createFlatSampleSprites(
  options?: Partial<IComputeSpritePositionsOptions>
): IBattleSprite[] {
  // 扁平名冊 → groupBattleChars 依 side/position 自動分隊 → 傳入計算
  // Flat roster → groupBattleChars auto-groups by side/position → passed to compute.
  const input = groupBattleChars(toBattlePositionChars(flatRosterSample));
  // 不傳 flip：交由 computeBattleSpritePositions 依圖檔目錄自動推導翻轉
  // Omit flip so computeBattleSpritePositions auto-derives flipping from the directory.
  return computeBattleSpritePositions(input, { ...sampleFieldSize, ...options });
}

/** 共用「扁平名冊自動分隊」精靈樣本（展示用） / Shared flat-roster auto-grouped sprite sample (demo) */
export const sampleSpritesFlat: IBattleSprite[] = createFlatSampleSprites();

/** 共用「混用 char / char_rev」精靈樣本（展示用） / Shared mixed char/char_rev sprite sample (demo) */
export const sampleSpritesMixed: IBattleSprite[] = createMixedSampleSprites();

/** 共用自動定位精靈樣本（展示用） / Shared auto-positioned sprite sample (demo) */
export const sampleSpritesAuto: IBattleSprite[] = createAutoSampleSprites();
