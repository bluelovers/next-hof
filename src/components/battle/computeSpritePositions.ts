/**
 * 戰場精靈位置計算（公用邏輯）
 * Battlefield sprite position computation (shared logic)
 *
 * 移植自 PHP HOF_Class_Battle_Style::exec_css() + CopyRow()
 * Ported from PHP HOF_Class_Battle_Style::exec_css() + CopyRow()
 *
 * 依據戰場尺寸（size_x/size_y）與隊伍前/後衛分佈，
 * 計算每個角色精靈的 background-position (x, y) 與是否翻轉（flipped）
 * Computes each character sprite's background-position (x, y) and flip flag
 * from the battlefield size and the front/back row distribution of each team.
 */
import type { IBattleSprite, ITeamSide, IBattleSidePair } from './types';
import type { ISpriteImageSize } from './spriteImageSizes';
import { getSpriteImageDir, computeSpriteFlipped, useFlipPositioning } from './spriteFlip';

/** 角色輸入（含圖像尺寸與站位） / Character input (with image size and battle position) */
export interface IBattlePositionChar {
  /** 角色 ID / Character ID */
  id: string;
  /** 角色名稱 / Character name */
  name?: string;
  /** 精靈圖片路徑 / Sprite image path */
  imageUrl: string;
  /** 圖像尺寸（getimagesize） / Image size */
  imageSize: ISpriteImageSize;
  /**
   * 站位：前衛 / 後衛
   * Position: front / back
   *
   * 由 groupBattleChars() 依此欄位將扁平名冊自動分類至 front / back 列
   * Used by groupBattleChars() to auto-classify a flat roster into the front / back rows.
   */
  position: 'front' | 'back';
  /**
   * 隊伍側：左 / 右
   * Team side: left / right
   *
   * 由 groupBattleChars() 依此欄位將扁平名冊自動分類至 left / right 隊
   * Used by groupBattleChars() to auto-classify a flat roster into the left / right teams.
   */
  side: ITeamSide;
}

/** 單一隊伍的前/後衛角色 / One team's front/back characters */
export interface ITeamBattleChars {
  /** 前衛 / Front row */
  front: IBattlePositionChar[];
  /** 後衛 / Back row */
  back: IBattlePositionChar[];
}

/** 計算選項 / Compute options */
export interface IComputeSpritePositionsOptions {
  /** 戰場寬度（對應 size_x） / Battlefield width (size_x) */
  width: number;
  /** 戰場高度（對應 size_y） / Battlefield height (size_y) */
  height: number;
  /** 橫向分割數（對應 size_x/6 的 6，預設 6） / Column split count (default 6) */
  cellCount?: number;
  /**
   * 是否啟用反轉（翻轉定位模式）的手動覆寫
   * Manual override for flip (flip positioning mode)
   *
   * 未提供時，翻轉與定位模式會依各精靈圖檔目錄（char / char_rev）與隊伍側
   * 自動推導（見 spriteFlip.ts 的 useFlipPositioning / computeSpriteFlipped）。
   * 明確傳入時則沿用舊行為（右隊強制翻轉定位）。
   * When omitted, both flip and positioning are auto-derived from each sprite's image
   * directory (char / char_rev) and team side (see useFlipPositioning /
   * computeSpriteFlipped in spriteFlip.ts). When explicitly passed, the legacy
   * behavior is used (right team forced into flip positioning).
   */
  flip?: boolean;
}

/**
 * 計算單一列（某隊的前衛或後衛）的角色位置
 * Compute positions for a single row (one team's front or back characters)
 *
 * 直接對應 PHP CopyRow()：以列基準 x 為中心，將角色在 cell 寬/高範圍內均勻分佈，
 * 再以圖像中心對齊 (x, y)，最後減去圖像半寬高得到 background-position 的左上角
 * Directly mirrors PHP CopyRow(): spreads characters within the column cell,
 * centers each image on (x, y), then offsets by half image size for the
 * background-position top-left.
 */
function computeRowPositions(
  chars: IBattlePositionChar[],
  options: IComputeSpritePositionsOptions,
  position: 'front' | 'back',
  side: ITeamSide
): IBattleSprite[] {
  const { width, height, cellCount = 6 } = options;
  // 手動覆寫：呼叫端明確傳入 flip 時沿用舊定位模式；否則依圖檔目錄自動推導
  // Manual override: explicit flip keeps the legacy mode; otherwise auto-derive.
  const explicitFlip = options.flip;
  const number = chars.length;
  if (number === 0) {
    return [];
  }

  const cellWidth = width / cellCount;
  const cellHeight = height;
  const yCenter = height / 2;
  const gapY = (cellHeight / (number + 1)) * 1;

  let gap = 0;
  return chars.map((char) => {
    gap++;
    // 逐個精靈依「自身圖檔目錄 + 隊伍側」決定翻轉定位模式，
    // 使同一隊伍混用 char / char_rev 時仍能全部落於同一側
    // Per-sprite flip positioning from this sprite's own image directory + side, so a
    // single team mixing char / char_rev still lands entirely on the same side.
    const spriteFlipMode = explicitFlip ?? useFlipPositioning(char.imageUrl, side);

    // direction：翻轉定位模式下兩隊皆 0；非翻轉定位模式右隊為 1
    // direction: flip positioning → 0 for both; non-flip → 1 for right team
    const direction = spriteFlipMode ? 0 : side === 'right' ? 1 : 0;

    // 列基準 x（column index）：
    // 翻轉定位模式：前衛=2、後衛=1（右隊靠 flipped 鏡像到右側）
    // 非翻轉定位模式：左隊 前衛=2/後衛=1；右隊 前衛=4/後衛=5（直接置於右側）
    // Column index:
    // flip positioning: front=2, back=1 (right team mirrored via flipped)
    // non-flip positioning: left front=2/back=1; right front=4/back=5 (directly on right)
    const columnIndex = spriteFlipMode
      ? position === 'back' ? 1 : 2
      : side === 'left'
        ? position === 'back' ? 1 : 2
        : position === 'back' ? 5 : 4;

    // 對應 PHP：axis_x += (direction ? -cell/2 : +cell/2)；axis_y += -cell/2（兩分支皆同）
    // Mirrors PHP: axis_x += (direction ? -cell/2 : +cell/2); axis_y += -cell/2 (both branches)
    const axisX = columnIndex * cellWidth + (direction ? -cellWidth / 2 : cellWidth / 2);
    const axisY = yCenter + -cellHeight / 2;

    const gapX = (cellWidth / (number + 1)) * (direction ? 1 : -1);

    let x = axisX + gapX * gap;
    let y = axisY + gapY * gap;
    x = Math.floor(x);
    y = Math.floor(y);

    // 以圖像中心對齊 (x, y) 後，減去半寬高得到 background-position 左上角
    // Center the image on (x, y), then subtract half size for background-position top-left
    x -= Math.round(char.imageSize.width / 2);
    y -= Math.round(char.imageSize.height / 2);

    // 翻轉標記：明確傳入 flip 時沿用舊公式；否則依圖檔目錄 + 隊伍自動計算
    // Flipped flag: explicit flip keeps the legacy formula; otherwise auto-compute
    // from the image directory + team side.
    const flipped = (
      explicitFlip !== undefined
        ? side === 'right' ? explicitFlip : false
        : computeSpriteFlipped(char.imageUrl, side)
    );

    return {
      id: char.id,
      name: char.name,
      imageUrl: char.imageUrl,
      x,
      y,
      flipped,
      imageSize: char.imageSize,
    };
  });
}

/**
 * 將扁平名冊依各角色的 side / position 自動分類為左右隊的前/後衛結構
 * Group a flat roster into left/right teams' front/back rows using each character's
 * own side / position fields.
 *
 * 這讓 IBattlePositionChar.side / .position 具有明確意義：呼叫端只需提供一張扁平
 * 清單（每個角色自帶 side 與 position），即可自動建立 computeBattleSpritePositions
 * 所需的 { left, right } 隊伍結構，不必手動嵌套 front/back 陣列。
 * This gives IBattlePositionChar.side / .position a concrete purpose: callers supply a
 * single flat list (each char carrying side + position) and get the { left, right }
 * structure that computeBattleSpritePositions expects, without manually nesting
 * front/back arrays.
 *
 * 傳入 teams 時，會以該既有隊伍為基底「追加」本次 chars（先複製再 push，不會變動
 * 傳入的 teams 本身），適用於分批累積同一場戰鬥的隊伍定義；
 * 未傳入則從空的 left / right 開始。
 * When `teams` is given, the new `chars` are appended onto that existing team
 * definition (cloned first, so the passed `teams` is not mutated) — useful for
 * accumulating a battle's roster across multiple batches. Omit it to start from
 * empty left / right teams.
 *
 * @param chars 扁平名冊（含 side / position） / Flat roster (with side / position)
 * @param teams 既有的左右隊結構（選填，作為追加基底） / Existing left/right teams (optional, append base)
 * @returns 可直接傳入 computeBattleSpritePositions 的隊伍結構
 *          Team structure ready for computeBattleSpritePositions
 */
export function groupBattleChars(
  chars: IBattlePositionChar[],
  teams?: IBattleSidePair<ITeamBattleChars>
): IBattleSidePair<ITeamBattleChars> {
  const left: ITeamBattleChars = { front: [...(teams?.left?.front ?? [])], back: [...(teams?.left?.back ?? [])] };
  const right: ITeamBattleChars = { front: [...(teams?.right?.front ?? [])], back: [...(teams?.right?.back ?? [])] };
  for (const c of chars) {
    const team = c.side === 'right' ? right : left;
    (c.position === 'back' ? team.back : team.front).push(c);
  }
  return { left, right };
}

/**
 * 計算整場戰鬥的精靈位置
 * Compute sprite positions for the whole battlefield
 *
 * @param input 左/右隊各自的前衛與後衛角色 / Left/right teams' front and back characters
 * @param options 戰場尺寸與分割/翻轉選項 / Battlefield size, split and flip options
 * @returns 可直接作為 BattleFieldScene sprites 的 IBattleSprite[] / IBattleSprite[] ready for BattleFieldScene
 */
export function computeBattleSpritePositions(
  input: IBattleSidePair<ITeamBattleChars>,
  options: IComputeSpritePositionsOptions
): IBattleSprite[] {
  const result: IBattleSprite[] = [
    ...computeRowPositions(input.left.back, options, 'back', 'left'),
    ...computeRowPositions(input.left.front, options, 'front', 'left'),
    ...computeRowPositions(input.right.back, options, 'back', 'right'),
    ...computeRowPositions(input.right.front, options, 'front', 'right'),
  ];

  return result;
}
