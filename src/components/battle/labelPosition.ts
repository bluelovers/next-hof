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
 * 所有定位公式（computeLabelLeft / computeLabelTop / labelFitsInFrame / clamp）皆為
 * 單一實作、對外匯出，實作與測試共用同一份，避免「單一事實來源」被複製。
 * All positioning formulas are single, exported implementations shared by both the logic and
 * its tests, so the "single source of truth" is never duplicated.
 *
 * 此模組不匯入任何 CSS，因此可被獨立單元測試（見 scripts/verify-label-position.ts）。
 * This module imports no CSS, so it can be unit-tested in isolation.
 */
import type { ISpriteImageSize } from './spriteImageSizes';

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
}

/** 標籤位置計算結果 / Label position result */
export interface ISpriteLabelPositionResult {
  /** 水平：left 像素（相對 frame 左緣） / Horizontal: left px from frame left */
  left: number;
  /** 垂直：top 像素（相對 frame 上緣） / Vertical: top px from frame top */
  top: number;
  /** 實際落點演算法（可能因邊界不足而與請求相反） / Actual placement (may differ if no room) */
  actualPlacement: ISpriteLabelPlacement;
}

/** 標籤預設高度與間距（寬度預設為「圖像寬度」，由呼叫端以 imageSize 帶入） / Default label height & gap (width defaults to the image width via imageSize) */
export const DEFAULT_LABEL_HEIGHT = 16;
export const DEFAULT_GAP = 4;

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
 */
export function labelFitsInFrame(
  placement: ISpriteLabelPlacement,
  top: number,
  labelSize: ISpriteImageSize,
  frameSize: ISpriteImageSize,
): boolean {
  return placement === 'above'
    ? top >= 0
    : top + labelSize.height <= frameSize.height;
}

/**
 * 自動計算戰場精靈名稱標籤位置（純邏輯，無任何 IO）
 * Pure logic to auto-compute the battlefield sprite name-label position (no IO).
 *
 * 兩種演算法：角色上方 (above) / 角色下方 (below)。
 * Two algorithms: above / below the character.
 *
 * 防止標籤位置超過 BattleFieldSpriteFrame 顯示範圍：
 * - 水平：標籤以角色圖像中心對齊，並收斂在 [0, frameSize.width] 內。
 * - 垂直：優先採請求的 placement；若該側空間不足，自動改放另一側；
 *         兩側皆不足時才收斂到 frame 邊界內（盡可能貼近角色）。
 * Prevents the label from exceeding the BattleFieldSpriteFrame display range:
 * - Horizontal: label centered on the character, clamped within [0, frameSize.width].
 * - Vertical: prefer the requested placement; if that side has no room, auto-flip to the
 *   other side; if neither fits, clamp inside the frame (as close to the character as possible).
 */
export function computeSpriteLabelPosition(input: ISpriteLabelPositionInput): ISpriteLabelPositionResult {
  const { x, y, imageSize, placement, frameSize } = input;
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

  // 單側落點計算：above → 圖像上方；below → 圖像下方
  // Single-side placement: above → over the image top; below → under the image bottom.
  const place = (p: ISpriteLabelPlacement): { top: number; fits: boolean } => {
    const top = computeLabelTop(p, y, imageSize, labelSize, gap);
    return { top, fits: labelFitsInFrame(p, top, labelSize, frameSize) };
  };

  let actual = placement;
  let r = place(placement);
  if (!r.fits) {
    const other: ISpriteLabelPlacement = placement === 'above' ? 'below' : 'above';
    const alt = place(other);
    if (alt.fits) {
      actual = other;
      r = alt;
    } else {
      // 兩側皆超出 → 收斂到不超出 frame 的極限位置
      // Neither side fits → clamp to the in-frame extreme.
      r = { top: clamp(r.top, 0, Math.max(0, frameSize.height - labelSize.height)), fits: true };
    }
  }

  return { left, top: Math.round(r.top), actualPlacement: actual };
}
