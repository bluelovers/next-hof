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
import type { IBattleSprite } from './types';

/** 角色輸入（含圖像尺寸與站位） / Character input (with image size and battle position) */
export interface IBattlePositionChar {
  /** 角色 ID / Character ID */
  id: string;
  /** 角色名稱 / Character name */
  name?: string;
  /** 精靈圖片路徑 / Sprite image path */
  imageUrl: string;
  /** 圖像寬度（getimagesize） / Image width */
  imageWidth: number;
  /** 圖像高度（getimagesize） / Image height */
  imageHeight: number;
  /** 站位：前衛 / 後衛 / Position: front / back */
  position: 'front' | 'back';
  /** 隊伍側：左 / 右 / Team side: left / right */
  side: 'left' | 'right';
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
  /** 是否啟用反轉（對應 style==1 的 flip，預設 true） / Enable flip (default true) */
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
  side: 'left' | 'right'
): IBattleSprite[] {
  const { width, height, cellCount = 6, flip = true } = options;
  const number = chars.length;
  if (number === 0) {
    return [];
  }

  const cellWidth = width / cellCount;
  const cellHeight = height;
  const yCenter = height / 2;

  // direction：flip 模式（預設）兩隊皆 0；非 flip 模式右隊為 1
  // direction: flip mode (default) → 0 for both teams; non-flip → 1 for right team
  const direction = flip ? 0 : side === 'right' ? 1 : 0;

  // 列基準 x（column index）：
  // flip 模式：前衛=2、後衛=1（兩隊相同，右隊靠 flipped 鏡像到右側）
  // 非 flip 模式：左隊 前衛=2/後衛=1；右隊 前衛=4/後衛=5（直接置於右側）
  // Column index:
  // flip mode: front=2, back=1 (same for both teams; right team mirrored via flipped)
  // non-flip mode: left front=2/back=1; right front=4/back=5 (placed directly on right)
  let columnIndex: number;
  if (flip) {
    columnIndex = position === 'back' ? 1 : 2;
  } else {
    columnIndex = side === 'left'
      ? position === 'back' ? 1 : 2
      : position === 'back' ? 5 : 4;
  }

  // 對應 PHP：axis_x += (direction ? -cell/2 : +cell/2)；axis_y += -cell/2（兩分支皆同）
  // Mirrors PHP: axis_x += (direction ? -cell/2 : +cell/2); axis_y += -cell/2 (both branches)
  const axisX = columnIndex * cellWidth + (direction ? -cellWidth / 2 : cellWidth / 2);
  const axisY = yCenter + -cellHeight / 2;

  const gapX = (cellWidth / (number + 1)) * (direction ? 1 : -1);
  const gapY = (cellHeight / (number + 1)) * 1;

  // 右隊在 flip 模式下需標記 flipped（CSS 鏡像到右側）；非 flip 模式右隊使用已翻轉圖，flipped=false
  // Right team in flip mode is marked flipped (CSS mirrors to right side);
  // in non-flip mode right team uses pre-flipped images, so flipped=false.
  const flipped = side === 'right' ? flip : false;

  let gap = 0;
  return chars.map((char) => {
    gap++;
    let x = axisX + gapX * gap;
    let y = axisY + gapY * gap;
    x = Math.floor(x);
    y = Math.floor(y);

    // 以圖像中心對齊 (x, y) 後，減去半寬高得到 background-position 左上角
    // Center the image on (x, y), then subtract half size for background-position top-left
    x -= Math.round(char.imageWidth / 2);
    y -= Math.round(char.imageHeight / 2);

    return {
      id: char.id,
      name: char.name,
      imageUrl: char.imageUrl,
      x,
      y,
      flipped,
    };
  });
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
  input: { left: ITeamBattleChars; right: ITeamBattleChars },
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
