/**
 * 戰場圖層組件
 * Battlefield layers component
 *
 * 三層結構：最外層背景 > 角色精靈排版框 > 巢狀精靈圖層
 * Three-layer structure: outermost background > sprite layout frame > nested sprite layers
 *
 * 背景尺寸（bgSize）可獨立於角色排版尺寸，
 * 未提供時背景與角色使用相同 width/height
 * The background size (bgSize) can differ from the sprite layout size;
 * when omitted, background and sprites share the same width/height.
 */
import React from 'react';
import type { CSSProperties } from 'react';
import type {
  IBattleSprite,
  IBattleFieldConfig,
  IBattleFieldBgSize,
  IBattleFieldVAlign,
  IBattleFieldBgScale,
  IBattleSpriteLabelOptions,
} from './types';
import { SPRITE_LAYOUT_WIDTH, SPRITE_LAYOUT_HEIGHT } from './types';
import type { ISpriteImageSize } from './spriteImageSizes';
import { BattleFieldSpriteFrame } from './BattleFieldSpriteFrame';
import { BattleFieldMagicCircle } from './BattleFieldMagicCircle';
import { EnumBattleFieldBgScale, EnumBattleFieldVAlign } from '#/components/battle/enums';

/** 戰場圖層屬性（標籤開關共用 IBattleSpriteLabelOptions）/ Battlefield layers props (label toggle from the shared IBattleSpriteLabelOptions) */
export interface IBattleFieldLayersProps extends IBattleSpriteLabelOptions {
  /** 精靈列表 / Sprite list */
  sprites: IBattleSprite[];
  /** 戰場配置 / Battlefield config */
  config: IBattleFieldConfig;
  /** 角色排版寬度（選填，預設 480） / Sprite layout width (optional, default 480) */
  width?: number;
  /** 角色排版高度（選填，預設 200） / Sprite layout height (optional, default 200) */
  height?: number;
  /** 背景尺寸（獨立於角色排版，選填寬或高其一或全部） / Background size, optional */
  bgSize?: IBattleFieldBgSize;
  /** 角色精靈框垂直對齊方式（預設 bottom） / Sprite frame vertical alignment (default bottom) */
  valign?: IBattleFieldVAlign;
  /** 自訂樣式（可複寫或追加至背景圖層） / Custom style (override or append to background layer) */
  style?: CSSProperties;
}

/**
 * 戰場圖層組件
 * Battlefield layers component
 *
 * 背景使用 bgSize（未提供則回退 width/height），
 * 角色精靈則固定於 width x height 的排版框中，
 * 因此放大背景不會影響角色精靈的排版座標
 * Background uses bgSize (falls back to width/height when omitted);
 * character sprites are fixed inside a width x height frame, so enlarging
 * the background never affects the sprite layout coordinates.
 */
/**
 * 背景圖縮放模式 → CSS 背景屬性
 * Background scale mode → CSS background properties
 *
 * 預設對齊為「水平置中 + 垂直置底」，確保背景圖在 bgSize 大於或小於
 * 實際圖檔尺寸時都能正確排版而不會偏移或異常裁切
 * Default alignment is horizontally centered + bottom-aligned, so the background
 * image stays correctly placed whether bgSize is larger or smaller than the file.
 */
function resolveBgImageLayout(
  scale: IBattleFieldBgScale,
  bgSize: ISpriteImageSize
): React.CSSProperties {
  const position = 'center bottom';
  switch (scale) {
    case 'cover':
      // 縮放至覆蓋整個背景框（可能裁切溢出部分）/ Scale to cover the box (may crop overflow)
      return { backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: position };
    case 'contain':
      // 縮放至完整放入背景框（可能留白）/ Scale to fit entirely (may letterbox)
      return { backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: position };
    case 'stretch':
      // 拉伸至背景框的確切尺寸（會變形）/ Stretch to exact box size (may distort)
      return {
        backgroundSize: `${bgSize.width}px ${bgSize.height}px`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: position,
      };
    case 'repeat':
      // 平鋪（依原始尺寸重複）/ Repeat (tile at natural size)
      return { backgroundSize: 'auto', backgroundRepeat: 'repeat', backgroundPosition: '0 0' };
    case 'natural':
    default:
      // 原始尺寸，水平置中 + 垂直置底 / Natural size, horizontally centered + bottom-aligned
      return { backgroundSize: 'auto', backgroundRepeat: 'no-repeat', backgroundPosition: position };
  }
}

export const BattleFieldLayers: React.FC<IBattleFieldLayersProps> = ({
  sprites,
  config,
  width: rawWidth,
  height: rawHeight,
  showSpriteLabels,
  bgSize,
  valign = EnumBattleFieldVAlign.Bottom,
  style,
}) => {
  // 角色排版尺寸：選填，未提供時使用預設值（保持原有設計）
  // Sprite layout size: optional, fall back to defaults when omitted
  const width = rawWidth ?? SPRITE_LAYOUT_WIDTH;
  const height = rawHeight ?? SPRITE_LAYOUT_HEIGHT;

  // 背景尺寸防禦：bgSize 任一維度低於角色排版尺寸時，該維度被無視並回退為角色排版尺寸
  // Background size guard: when any bgSize dimension is smaller than the sprite layout
  // size, that dimension is ignored and falls back to the sprite layout size.
  const resolvedBgSize: ISpriteImageSize = {
    width: bgSize?.width! >= width ? bgSize!.width! : width,
    height: bgSize?.height! >= height ? bgSize!.height! : height,
  };

  // 背景圖排版：預設自然尺寸 + 水平置中垂直置底，縮放模式由 config.bgScale 控制
  // Background image layout: default natural size + centered/bottom; scale mode from config.bgScale
  const bgScaleMode = config.bgScale ?? EnumBattleFieldBgScale.Natural;
  const bgImageLayout = resolveBgImageLayout(bgScaleMode, resolvedBgSize);

  /** 背景樣式 / Background style */
  const bgStyle: React.CSSProperties = {
    width: resolvedBgSize.width,
    height: resolvedBgSize.height,
    overflow: 'hidden',
    backgroundImage: config.backgroundImageUrl
      ? `url(${config.backgroundImageUrl})`
      : undefined,
    position: 'relative',
    ...bgImageLayout,
    ...style,
  };

  return (
    <div style={bgStyle}>
      {/* 魔方陣圖層（繪製於角色精靈之下，對應 PHP exec_css 的魔方陣渲染） / Magic-circle layers (drawn beneath sprites; mirrors PHP exec_css) */}
      {config.magicCircles?.map((mc, i) => (
        <BattleFieldMagicCircle key={i} magicCircle={mc} width={width} height={height} />
      ))}

      {/* 角色精靈排版框（保護角色排版尺寸） / Sprite layout frame (protects sprite layout size) */}
      <BattleFieldSpriteFrame
        sprites={sprites}
        width={width}
        height={height}
        showSpriteLabels={showSpriteLabels}
        valign={valign}
      />
    </div>
  );
};
