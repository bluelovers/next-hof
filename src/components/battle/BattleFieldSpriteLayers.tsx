/**
 * 戰場精靈圖層組件
 * Battlefield sprite layers component
 *
 * 以「同層（兄弟）」方式疊加每個角色的精靈圖層
 * Stacks each character's sprite layer as siblings (same level)
 *
 * 原始頁面使用巢狀 div 疊加：
 * 每個 div 都是 480x200，使用 background-position 定位角色
 * The original page uses nested div layers:
 * Each div is 480x200, uses background-position for character placement
 *
 * 關鍵修正：每個精靈圖層必須是「兄弟節點」而非彼此巢狀，
 * 否則子節點會繼承父節點的 CSS transform（flip-h 的 scaleX(-1)），
 * 導致第 i 個精靈的翻轉被累積（sprite[0..i] 翻轉次數的奇偶性），
 * 造成同一側隊伍出現「左 2 右 1」等位置與朝向錯亂
 * Key fix: each sprite layer must be a SIBLING, not nested inside the previous
 * one. Otherwise a child inherits its parent's CSS transform (flip-h scaleX(-1)),
 * so sprite[i]'s flip compounds with every preceding sprite (parity of flipped
 * among sprite[0..i]). That produced split sides / mixed facing such as "left 2,
 * right 1" within a single team.
 */
import React, { useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { IBattleSprite, IBattleSpriteLabelOptions } from './types';
import { BattleFieldSpriteLabel } from './BattleFieldSpriteLabel';
import { useSpriteLabelRegistry, type ISpriteLabelRegistry, type ISpriteLabelComputeInput } from './useSpriteLabelRegistry';
import './BattleFieldSpriteLayers.css';
import type { IStyleProps } from '#/components/shared/types';

/** 戰場精靈圖層屬性（標籤開關共用 IBattleSpriteLabelOptions）/ Battlefield sprite layers props (label toggle from the shared IBattleSpriteLabelOptions) */
export interface IBattleFieldSpriteLayersProps extends IBattleSpriteLabelOptions, IStyleProps {
  /** 精靈列表 / Sprite list */
  sprites: IBattleSprite[];
  /**
   * 當前處理的索引 / Current processing index
   * @deprecated 保留為向後相容參數，同層渲染不再需要遞迴索引
   */
  index?: number;
  /** 畫布寬度 / Canvas width */
  width: number;
  /** 畫布高度 / Canvas height */
  height: number;
}

/**
 * 建立「同層（兄弟）」精靈圖層陣列（模組層級輔助函式）
 * Build sibling sprite layers (module-level helper)
 *
 * 回傳一組「彼此為兄弟」的絕對定位 div，各自獨立擁有 flip-h 翻轉，
 * 互不繼承 transform，故不會發生翻轉累積
 * Returns an array of absolutely-positioned sibling divs; each owns its flip-h
 * transform independently and does NOT inherit any ancestor transform, so flips
 * never compound.
 */
function buildSpriteLayers(
  props: IBattleFieldSpriteLayersProps,
  registry: ISpriteLabelRegistry,
): React.ReactNode[] {
  const { sprites, width, height, showSpriteLabels, style, className } = props;

  return sprites.map((sprite, index) => {
    const flipClass = sprite.flipped ? 'flip-h' : '';
    // 精靈自身的 className（例如屍體規格附加的 class）與 battle-sprite 併存，不互相覆蓋
    // The sprite's own className (e.g. from a corpse spec) coexists with battle-sprite
    // instead of replacing it
    const layerClass = ['battle-sprite', flipClass, sprite.className?.trim()]
      .filter(Boolean)
      .join(' ');

    const layerStyle: CSSProperties = {
      width,
      height,
      backgroundImage: sprite.imageUrl
        ? `url(${sprite.imageUrl})`
        : undefined,
      // backgroundRepeat: 'no-repeat',
      backgroundPosition: `${sprite.x}px ${sprite.y}px`,
      // position: 'absolute',
    };

    // 合併順序：基礎樣式 < 元件/輔助函式 style < 單體精靈 style（最優先）
    // Merge order: base < component/helper style < per-sprite style (highest priority)
    const mergedStyle: CSSProperties = {
      ...layerStyle,
      ...style,
      ...sprite.style,
    };

    // 由上層 useSpriteLabelRegistry 預先算好的防重疊位置（依順序對應）
    // Pre-computed anti-overlap position from useSpriteLabelRegistry (matched by order).
    const entry = registry.entries[index];

    return (
      <div
        key={sprite.unitUuid ?? index}
        className={[layerClass, className].filter(Boolean).join(' ')}
        id={sprite.unitUuid}
        style={mergedStyle}
      >
        {showSpriteLabels && sprite.name && (
          <BattleFieldSpriteLabel
            name={sprite.name}
            x={sprite.x}
            y={sprite.y}
            imageSize={sprite.imageSize}
            placement={sprite.placement}
            frameSize={{ width, height }}
            flipped={sprite.flipped}
            style={sprite.labelStyle}
            position={entry?.pos}
          />
        )}
      </div>
    );
  });
}

/**
 * 戰場精靈圖層組件
 * Battlefield sprite layers component
 *
 * 轉發 props 給輔助函式 buildSpriteLayers 產生同層（兄弟）圖層；
 * 並以 useSpriteLabelRegistry（ref 快取）預先計算每個標籤的防重疊位置，
 * 再透過 position prop 傳給各標籤組件，避免標籤彼此重疊。
 * Forwards props to buildSpriteLayers for sibling layers; also uses useSpriteLabelRegistry
 * (a ref-backed cache) to pre-compute each label's anti-overlap position, then passes it down
 * via the position prop so labels don't overlap each other.
 */
export const BattleFieldSpriteLayers: React.FC<IBattleFieldSpriteLayersProps> = (props) => {
  const { sprites, width, height } = props;
  // 依序把精靈轉為標籤運算輸入；memo 化使 inputs 在 sprites 不變時保持穩定，
  // 進而讓 useSpriteLabelRegistry 的 useMemo / ref 快取能跨渲染生效。
  // Map sprites to label-compute inputs in order; memoized so inputs stay stable when
  // sprites is unchanged, letting useSpriteLabelRegistry's useMemo/ref cache persist across renders.
  const inputs = useMemo<ISpriteLabelComputeInput[]>(
    () =>
      sprites.map((s, i) => ({
        x: s.x,
        y: s.y,
        imageSize: s.imageSize,
        placement: s.placement,
        unitUuid: s.unitUuid ?? String(i),
      })),
    [sprites],
  );
  const registry = useSpriteLabelRegistry(inputs, { width, height });
  return <>{buildSpriteLayers(props, registry)}</>;
};
