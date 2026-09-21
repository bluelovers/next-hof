/**
 * 戰場標籤防重疊暫存 Hook（以 ref + useMemo 快取跨組件 / 跨渲染結果）
 * Battlefield label anti-overlap registry hook (caches results across components/renders via ref + useMemo)
 *
 * 由 BattleFieldSpriteLayers 持有並呼叫：依序為每個精靈計算標籤位置，計算時把
 * 「已放置標籤矩形」傳入 computeSpriteLabelPosition 以避免重疊；結果以 ref 快取，
 * 供同層（兄弟）標籤組件共用（跨組件快取）。
 * Owned & called by BattleFieldSpriteLayers: it computes each sprite's label position in order,
 * feeds the placed-rect list into computeSpriteLabelPosition to avoid overlap, and caches the
 * results in a ref so the sibling label components share the same computed positions
 * (a cache that spans components).
 */
import { useMemo, useRef } from 'react';
import type { ISpriteImageSize } from './spriteImageSizes';
import {
  computeSpriteLabelPosition,
  DEFAULT_IMAGE_SIZE,
  type ISpriteLabelPlacement,
  type ISpriteLabelPositionResult,
  type IRect,
} from './labelPosition';

/** 單一精靈的標籤運算輸入 / Per-sprite label compute input */
export interface ISpriteLabelComputeInput {
  /** 角色圖像左上角 x / Character image top-left x */
  x: number;
  /** 角色圖像左上角 y / Character image top-left y */
  y: number;
  /** 角色圖像寬度（缺省用 DEFAULT_IMAGE_SIZE） / Character image width (defaults to DEFAULT_IMAGE_SIZE) */
  imageWidth?: number;
  /** 角色圖像高度（缺省用 DEFAULT_IMAGE_SIZE） / Character image height (defaults to DEFAULT_IMAGE_SIZE) */
  imageHeight?: number;
  /** 標籤演算法：角色上方 / 下方（缺省 below） / Placement (default below) */
  placement?: ISpriteLabelPlacement;
  /** 精靈 id（用於對應 entries） / Sprite id (for matching entries) */
  id?: string;
}

/** 暫存結果項目 / Cached result entry */
export interface ISpriteLabelEntry {
  /** 對應精靈 id / Matching sprite id */
  id: string;
  /** 標籤最終矩形（frame 座標） / Final label rect (frame coords) */
  rect: IRect;
  /** 標籤最終位置結果 / Final label position result */
  pos: ISpriteLabelPositionResult;
}

/** Hook 回傳值 / Hook return value */
export interface ISpriteLabelRegistry {
  /** 每個精靈的標籤最終位置（依 sprites 順序） / Final label position per sprite (sprites order) */
  entries: ISpriteLabelEntry[];
  /** 已放置標籤矩形（frame 座標） / Placed label rects (frame coords) */
  occupied: IRect[];
}

/**
 * 計算每個精靈的標籤位置並快取，避免標籤彼此重疊
 * Compute each sprite's label position (cached) while preventing labels from overlapping.
 *
 * 計算為純函式（useMemo 內），不依賴渲染副作用，嚴格模式（StrictMode）下亦安全；
 * 結果另存於 ref，作為跨組件 / 跨渲染的快取。
 * The computation is pure (inside useMemo), with no render side-effects, so it is safe under
 * StrictMode; the result is also stored in a ref as a cross-component / cross-render cache.
 */
export function useSpriteLabelRegistry(
  sprites: ISpriteLabelComputeInput[],
  frameSize: ISpriteImageSize,
): ISpriteLabelRegistry {
  // ref 作為跨組件 / 跨渲染的快取 / ref = cross-component / cross-render cache
  const cache = useRef<ISpriteLabelRegistry | null>(null);

  const entries = useMemo(() => {
    // 依序計算；每個標籤都把「前面已放置的矩形」納入 occupied，從而避免與既有標籤重疊
    // Compute in order; each label feeds the previously placed rects as `occupied`, avoiding overlap.
    const occupied: IRect[] = [];
    return sprites.map((s, i) => {
      const imageSize =
        s.imageWidth != null && s.imageHeight != null
          ? { width: s.imageWidth, height: s.imageHeight }
          : DEFAULT_IMAGE_SIZE;
      const pos = computeSpriteLabelPosition({
        x: s.x,
        y: s.y,
        imageSize,
        placement: s.placement ?? 'below',
        frameSize,
        occupied,
      });
      occupied.push(pos.rect);
      return { id: s.id ?? String(i), rect: pos.rect, pos };
    });
  }, [sprites, frameSize.width, frameSize.height]);

  const registry: ISpriteLabelRegistry = {
    entries,
    occupied: entries.map((e) => e.rect),
  };
  cache.current = registry;
  return registry;
}
