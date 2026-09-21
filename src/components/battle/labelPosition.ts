/**
 * 戰場精靈名稱標籤位置計算（公用純邏輯，無任何 IO）
 * Battlefield sprite name-label position computation (shared pure logic, no IO)
 *
 * 參考 toPositionChars：同樣是把「已知資料」轉為「定位資訊」，組件內不讀取圖檔尺寸。
 * 呼叫端必須提供 imageSize / frameSize（已由上游解析，例如 computeBattleSpritePositions），
 * 以符合「組件內禁止呼叫 getSpriteImageSize IO 行為」的規範。
 * Mirrors toPositionChars: it turns known data into positioning info and never reads image
 * sizes inside the component. Callers must supply imageSize / frameSize (resolved upstream,
 * e.g. by computeBattleSpritePositions), honoring the "no getSpriteImageSize IO in component" rule.
 *
 * 尺寸類參數統一使用 ISpriteImageSize（{ width, height } 物件），避免散落標量。
 * Size parameters are uniformly ISpriteImageSize ({ width, height } objects) to avoid scattered scalars.
 *
 * 所有定位公式（computeLabelLeft / computeLabelTop / clampLabelToBoundary / clamp /
 * rectsOverlap / largestFreeGap）皆為單一實作、對外匯出，實作與測試共用同一份，
 * 避免「單一事實來源」被複製。
 * All positioning formulas are single, exported implementations shared by both the logic and
 * its tests, so the "single source of truth" is never duplicated.
 *
 * 此模組不匯入任何 CSS，因此可被獨立單元測試（見 scripts/verify-label-position.ts）。
 * This module imports no CSS, so it can be unit-tested in isolation.
 */
import type { ISpriteImageSize } from './spriteImageSizes';

/** 精靈圖層（角色）矩形（frame 座標系） / Sprite-layer (character) rectangle (frame coordinate space) */
export interface IRect {
  /** 左緣（相對 frame 左緣） / Left edge (from frame left) */
  left: number;
  /** 上緣（相對 frame 上緣） / Top edge (from frame top) */
  top: number;
  /** 寬度 / Width */
  width: number;
  /** 高度 / Height */
  height: number;
}

/** 標籤演算法：角色上方 / 下方 / Label placement: above / below the character */
export type ISpriteLabelPlacement = 'above' | 'below';

/** 標籤位置計算輸入 / Label position computation input */
export interface ISpriteLabelPositionInput {
  /** 角色圖像左上角 x（background-position x） / Character image top-left x */
  x: number;
  /** 角色圖像左上角 y（background-position y） / Character image top-left y */
  y: number;
  /** 角色圖像尺寸（由呼叫端提供，組件內禁止 IO） / Character image size (caller-supplied, no IO in component) */
  imageSize: ISpriteImageSize;
  /** 標籤演算法：角色上方 / 下方 / Placement algorithm */
  placement: ISpriteLabelPlacement;
  /** 顯示範圍（戰場精靈框）尺寸 / Display range (sprite frame) size */
  frameSize: ISpriteImageSize;
  /** 標籤預估尺寸（邊界收斂用；缺省寬度＝圖像寬度、高度＝DEFAULT_LABEL_HEIGHT） / Estimated label size for clamping (default width = image width, height = DEFAULT_LABEL_HEIGHT) */
  labelSize?: ISpriteImageSize;
  /** 標籤與角色圖像間距 / Gap between label and character */
  gap?: number;
  /** 已放置標籤的最終矩形（frame 座標），用於避免與既有標籤重疊 / Final rects of already-placed labels, used to avoid overlap */
  occupied?: IRect[];
}

/** 標籤位置計算結果 / Label position result */
export interface ISpriteLabelPositionResult {
  /** 水平：left 像素（相對 frame 左緣） / Horizontal: left px from frame left */
  left: number;
  /** 垂直：top 像素（相對 frame 上緣） / Vertical: top px from frame top */
  top: number;
  /** 標籤最終寬度（邊界收斂後；目前寬度不縮減，僅高度會縮減） / Final label width (only height is reduced, width is unchanged) */
  width: number;
  /** 標籤最終高度（可能因超出邊界或避免重疊而被縮減） / Final label height (may be reduced to fit boundary / avoid overlap) */
  height: number;
  /** 標籤最終矩形（供呼叫端紀錄以預防重疊） / Final label rect (for the caller to record & prevent overlap) */
  rect: IRect;
  /** 實際落點演算法（移除自動翻轉後，永遠等於請求的 placement） / Actual placement (no auto-flip now, always equals the requested placement) */
  actualPlacement: ISpriteLabelPlacement;
}

/** 標籤預設高度與間距（寬度預設為「圖像寬度」，由呼叫端以 imageSize 帶入） / Default label height & gap (width defaults to the image width via imageSize) */
export const DEFAULT_LABEL_HEIGHT = 16;
export const DEFAULT_GAP = 4;

/** 標籤觸底時與 frame 底邊保留的間距（避免完全貼底） / Bottom inset kept when a label touches the frame bottom */
export const FRAME_BOTTOM_MARGIN = 5;

/** 未提供角色圖像尺寸時的預設值（元件內不讀取圖檔，僅作收斂下限；供 hook 與元件共用） / Fallback image size when missing (no disk read; shared by the hook & component) */
export const DEFAULT_IMAGE_SIZE: ISpriteImageSize = { width: 56, height: 72 };

/**
 * 通用收斂工具（對外匯出，供測試與其他邏輯共用同一份實作，避免複製）
 * Generic clamp (exported so tests & other logic share one implementation, not a copy).
 */
export const clamp = (v: number, min: number, max: number): number =>
  Math.min(Math.max(v, min), max);

/**
 * 標籤水平落點：以角色圖像中心對齊（尚未收斂到 frame 邊界）
 * Label horizontal anchor: centered on the character (pre-clamp).
 */
export function computeLabelLeft(
  x: number,
  imageSize: ISpriteImageSize,
  labelSize: ISpriteImageSize,
): number {
  return Math.round(x + imageSize.width / 2 - labelSize.width / 2);
}

/**
 * 標籤垂直落點：above → 圖像上方；below → 圖像下方（尚未收斂到 frame 邊界）
 * Label vertical anchor: above → over the image; below → under the image (pre-clamp).
 */
export function computeLabelTop(
  placement: ISpriteLabelPlacement,
  y: number,
  imageSize: ISpriteImageSize,
  labelSize: ISpriteImageSize,
  gap: number,
): number {
  return placement === 'above'
    ? y - gap - labelSize.height
    : y + imageSize.height + gap;
}

/**
 * 標籤垂直落點是否落在 frame 顯示範圍內（水平已由 computeLabelLeft + clamp 另行處理）
 * Whether the vertical anchor fits inside the frame (horizontal handled separately).
 *
 * 僅供向後相容與單元測試使用；主流程已改由 clampLabelToBoundary 處理「超出邊界即縮減高度」。
 * Kept for backward-compat & tests; the main path now reduces height via clampLabelToBoundary.
 */
export function labelFitsInFrame(
  placement: ISpriteLabelPlacement,
  top: number,
  labelSize: ISpriteImageSize,
  frameSize: ISpriteImageSize,
): boolean {
  return placement === 'above'
    ? top >= 0
    : top + labelSize.height <= frameSize.height - FRAME_BOTTOM_MARGIN;
}

/**
 * 超出 frame 邊界時的收斂（單一事實來源，供主流程與測試共用）
 * Boundary clamp (single source of truth, shared by the main path and tests).
 *
 * 不再自動翻轉到另一側；而是「縮減高度」把標籤擠進邊界內：
 * - above 且高於 frame 頂（top < 0）→ 貼齊頂緣，高度壓縮成 [0, y-gap] 的可用空間。
 * - below 且低於 frame 底（bottom > height）→ 壓縮高度，並收斂到 frame 內。
 * No auto-flip to the other side; instead the height is SHRUNK to fit inside the boundary:
 * - above & above the frame top (top < 0) → pin to the top edge, shrink height to the
 *   free space in [0, y-gap].
 * - below & below the frame bottom (bottom > height) → shrink height and clamp inside the frame.
 */
export function clampLabelToBoundary(
  placement: ISpriteLabelPlacement,
  y: number,
  imageSize: ISpriteImageSize,
  labelSize: ISpriteImageSize,
  gap: number,
  frameSize: ISpriteImageSize,
): { top: number; height: number } {
  const top0 = computeLabelTop(placement, y, imageSize, labelSize, gap);
  if (placement === 'above') {
    const bandBottom = Math.max(0, y - gap);
    if (top0 < 0) {
      // 高於邊界 → 貼齊頂緣並縮減高度 / Above boundary → pin to top, shrink height.
      return { top: 0, height: Math.max(0, bandBottom) };
    }
    return { top: top0, height: labelSize.height };
  }
  // below
  // 觸底時與 frame 底邊保留 FRAME_BOTTOM_MARGIN，避免完全貼底
  // Keep FRAME_BOTTOM_MARGIN from the frame bottom so the label never fully sticks to it.
  const bandBottom = Math.max(0, frameSize.height - FRAME_BOTTOM_MARGIN);
  if (top0 + labelSize.height > bandBottom) {
    // 低於邊界 → 縮減高度並收斂到 frame 內 / Below boundary → shrink height, clamp inside.
    const height = Math.max(0, bandBottom - top0);
    return { top: Math.min(top0, Math.max(0, bandBottom - height)), height };
  }
  return { top: top0, height: labelSize.height };
}

/**
 * 兩矩形是否重疊（frame 座標系，邊界不計；對外匯出供測試與防重疊邏輯共用）
 * Whether two rects overlap (frame coords, edges excluded; exported for tests & overlap logic).
 */
export function rectsOverlap(a: IRect, b: IRect): boolean {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  );
}

/**
 * 在 [bandTop, bandBottom] 垂直帶內，尋找避開「與本標籤同 x 範圍」已放置標籤的最大空隙
 * （單一事實來源，供防重疊收斂與測試共用）
 * Largest free vertical gap within [bandTop, bandBottom] that avoids the occupied rects whose
 * x-range intersects this label (single source of truth, shared by overlap resolution & tests).
 *
 * @returns 最大空隙的頂點與高度；若帶內完全被佔滿則回傳 size = 0 / top = bandTop
 *          the top & size of the largest gap; { top: bandTop, size: 0 } if fully occupied
 */
export function largestFreeGap(
  occupied: IRect[],
  bandTop: number,
  bandBottom: number,
  left: number,
  width: number,
): { top: number; size: number } {
  const blockers = occupied
    .filter((o) => left < o.left + o.width && left + width > o.left)
    .map(
      (o) =>
        [Math.max(bandTop, o.top), Math.min(bandBottom, o.top + o.height)] as [
          number,
          number,
        ],
    )
    .sort((p, q) => p[0] - q[0]);

  let cursor = bandTop;
  let best: { top: number; size: number } | null = null;
  for (const [s, e] of blockers) {
    if (s > cursor) {
      const size = s - cursor;
      if (!best || size > best.size) best = { top: cursor, size };
    }
    cursor = Math.max(cursor, e);
  }
  if (cursor < bandBottom) {
    const size = bandBottom - cursor;
    if (!best || size > best.size) best = { top: cursor, size };
  }
  return best ?? { top: bandTop, size: 0 };
}

/**
 * 自動計算戰場精靈名稱標籤位置（純邏輯，無任何 IO）
 * Pure logic to auto-compute the battlefield sprite name-label position (no IO).
 *
 * 兩種演算法：角色上方 (above) / 角色下方 (below)。
 * Two algorithms: above / below the character.
 *
 * 防止標籤位置超過 BattleFieldSpriteFrame 顯示範圍，且避免與其他標籤重疊：
 * - 水平：標籤以角色圖像中心對齊，並收斂在 [0, frameSize.width] 內。
 * - 垂直：優先採請求的 placement；若該側空間不足（超過邊界），**縮減高度**擠進邊界內
 *         （不翻轉到另一側）。
 * - 防重疊：若 occupied 中有與本標籤重疊的矩形，沿 placement 方向在 frame 內找空位；
 *         若仍重疊，則縮減高度塞進帶內最大空隙。最後回傳最終矩形供呼叫端紀錄。
 * Prevents the label from exceeding the BattleFieldSpriteFrame display range and from
 * overlapping other labels:
 * - Horizontal: label centered on the character, clamped within [0, frameSize.width].
 * - Vertical: prefer the requested placement; if that side has no room (past the boundary),
 *   SHRINK the height to fit inside (no auto-flip to the other side).
 * - Anti-overlap: if any occupied rect overlaps, scan along the placement direction inside the
 *   frame for a free slot; if still overlapping, shrink the height into the largest free gap.
 *   The final rect is returned so the caller can record it.
 */
export function computeSpriteLabelPosition(input: ISpriteLabelPositionInput): ISpriteLabelPositionResult {
  const { x, y, imageSize, placement, frameSize, occupied } = input;
  // 標籤預設寬度＝圖像寬度（對應組件 min-width: imageSize.width），高度用預設值
  // Default label width = image width (matches the component's min-width: imageSize.width); height uses the default.
  const labelSize = input.labelSize ?? { width: imageSize.width, height: DEFAULT_LABEL_HEIGHT };
  const gap = input.gap ?? DEFAULT_GAP;

  // 水平：以角色圖像中心對齊，再收斂在 frame 左右邊界內
  // Horizontal: center on the character, then clamp within the frame's left/right edges.
  const left = clamp(
    computeLabelLeft(x, imageSize, labelSize),
    0,
    Math.max(0, frameSize.width - labelSize.width),
  );

  // 垂直：先以邊界收斂（超界則縮減高度，不翻轉）
  // Vertical: boundary clamp first (shrink height on overflow, no flip).
  const boundary = clampLabelToBoundary(placement, y, imageSize, labelSize, gap, frameSize);
  let top = boundary.top;
  let height = boundary.height;
  const width = labelSize.width;

  // 防重疊：沿 placement 方向在 frame 內找空位；仍重疊則縮減高度塞進帶內最大空隙
  // Anti-overlap: scan along the placement direction inside the frame; if still overlapping,
  // shrink the height into the largest free gap.
  if (occupied && occupied.length > 0) {
    const rect0: IRect = { left, top, width, height };
    if (occupied.some((o) => rectsOverlap(rect0, o))) {
      const end =
        placement === 'above'
          ? 0
          : Math.max(0, frameSize.height - FRAME_BOTTOM_MARGIN - height);
      const step = placement === 'above' ? -1 : 1;
      let found = false;
      for (let t = top; placement === 'above' ? t >= end : t <= end; t += step) {
        const cand: IRect = { left, top: Math.round(t), width, height };
        if (!occupied.some((o) => rectsOverlap(cand, o))) {
          top = Math.round(t);
          found = true;
          break;
        }
      }
      if (!found) {
        const bandTop = placement === 'above' ? 0 : y + imageSize.height + gap;
        const bandBottom =
          placement === 'above'
            ? Math.max(0, y - gap)
            : Math.max(0, frameSize.height - FRAME_BOTTOM_MARGIN);
        const gapInfo = largestFreeGap(occupied, bandTop, bandBottom, left, width);
        if (gapInfo.size > 0) {
          height = Math.max(0, Math.min(height, Math.floor(gapInfo.size)));
          top = gapInfo.top;
        }
      }
    }
  }

  return {
    left,
    top,
    width,
    height,
    rect: { left, top, width, height },
    actualPlacement: placement,
  };
}
