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
 *
 * 當戰場大於排版框時自動切換「雙框模式」：敵我雙方各佔一個 BattleFieldSpriteFrame，
 * 兩個框可分別移動（frameOffsets 指定初始位置，editable 開啟畫面拖曳）；
 * 戰場與排版框等大時維持單一排版框。
 * When the scene is larger than the frame the component switches to "dual-frame mode":
 * each side owns its own BattleFieldSpriteFrame and the two can be moved independently
 * (frameOffsets sets the initial positions, editable turns on on-canvas dragging).
 * When both sizes match, a single frame is used.
 */
import React, { useMemo } from 'react';
import type {
	IBattleSprite,
	IBattleFieldConfig,
	IBattleFieldBgSize,
	IBattleFieldVAlign,
	IBattleFieldBgScale,
	IBattleSpriteLabelOptions,
	IBattleFieldEditModeOptions,
	IBattleFieldSideOffsets,
	IBattleFieldFrameMoveEvent,
	IBattleSidePair,
	IBattleFieldBgHAlign,
	IBattleFieldBgVAlign,
} from './types';
import { SPRITE_LAYOUT_WIDTH, SPRITE_LAYOUT_HEIGHT } from './types';
import type { ISpriteImageSize } from './spriteImageSizes';
import { BattleFieldSpriteFrame } from './BattleFieldSpriteFrame';
import { BattleFieldMagicCircle } from './BattleFieldMagicCircle';
import { BattleFieldEditGuides } from './BattleFieldEditGuides';
import { frameOffsetLiveStore } from './frameOffsetLiveStore';
import { EnumBattleFieldBgScale, EnumBattleFieldVAlign, EnumTeamSideUI } from '#/src/components/battle/enums';
import type { IStyleProps } from '#/src/components/shared/types';

/**
 * 戰場圖層屬性
 * Battlefield layers props
 *
 * 標籤開關共用 IBattleSpriteLabelOptions、編輯開關共用 IBattleFieldEditModeOptions
 * Label toggle comes from the shared IBattleSpriteLabelOptions; edit toggle from the
 * shared IBattleFieldEditModeOptions.
 */
export interface IBattleFieldLayersProps extends IBattleSpriteLabelOptions, IBattleFieldEditModeOptions, IStyleProps
{
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
	/**
	 * 敵我雙方排版框的初始位置（戰場大於排版框的雙框模式下生效）
	 * Initial offsets of the two side frames (dual-frame mode: scene larger than the frame)
	 *
	 * 未提供時兩個框依 valign 對齊、疊在同一位置，視覺與單框模式完全一致。
	 * When omitted both frames follow valign and stack on the same spot, so the look is
	 * identical to single-frame mode.
	 */
	frameOffsets?: IBattleFieldSideOffsets;
	/**
	 * 排版框拖曳結束時回報最終座標（編輯模式；拖曳過程不回報，放開時單次寫回）
	 * Reports the final offset when a frame drag ends (edit mode; nothing is reported during
	 * the drag — a single write-back fires on release)
	 */
	onFrameOffsetChange?: (event: IBattleFieldFrameMoveEvent) => void;
	/**
	 * 顯示參考線疊加圖層（座標空間＝戰場尺寸 resolvedBgSize）
	 * Show the guide-line overlay (its coordinate space is the scene size, resolvedBgSize)
	 *
	 * 疊加圖層 pointer-events: none，開啟參考線不會影響拖曳與點擊。
	 * The overlay uses pointer-events: none, so guides never affect dragging or clicking.
	 */
	showEditGuides?: boolean;
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
/** 背景圖縮放模式 → CSS 背景屬性
 * Background scale mode → CSS background properties
 *
 * 預設對齊為「水平置中 + 垂直置底」，確保背景圖在 bgSize 大於或小於
 * 實際圖檔尺寸時都能正確排版而不會偏移或異常裁切；
 * 可由 config.bgHAlign / bgVAlign 覆寫水平與垂直錨點（repeat 平鋪固定由左上角開始）。
 * Default alignment is horizontally centered + bottom-aligned, so the background
 * image stays correctly placed whether bgSize is larger or smaller than the file;
 * config.bgHAlign / bgVAlign override the horizontal and vertical anchors (the repeat
 * mode always tiles from the top-left corner).
 */
/**
 * 垂直對齊值 → CSS background-position 垂直關鍵字
 * Vertical alignment value → CSS background-position vertical keyword
 *
 * 值域的 'middle' 在 CSS 沒有對應關鍵字（CSS 只有 top / center / bottom），
 * 直接拼進 background-position 會產生無效宣告、整條被瀏覽器捨棄（畫面無反應），
 * 故在此統一對映到 'center'；其餘值可直接使用。
 * CSS has no 'middle' keyword for background-position (only top / center / bottom); splicing it
 * straight into the value produces an invalid declaration that the browser discards entirely
 * (the canvas appears not to react), so it is mapped to 'center' here; the other values pass through.
 */
const BG_V_ALIGN_CSS_KEYWORD: Record<IBattleFieldBgVAlign, 'top' | 'center' | 'bottom'> = {
	top: 'top',
	middle: 'center',
	bottom: 'bottom',
};

function resolveBgImageLayout(
	scale: IBattleFieldBgScale,
	bgSize: ISpriteImageSize,
	hAlign: IBattleFieldBgHAlign = 'center',
	vAlign: IBattleFieldBgVAlign = 'bottom',
): React.CSSProperties
{
	/**
	 * CSS background-position 關鍵字組合（如 "left top" / "center bottom"）；
	 * 垂直軸需將值域 'middle' 對映為 CSS 的 'center'，否則宣告無效被捨棄。
	 * CSS background-position keyword pair (e.g. "left top" / "center bottom");
	 * the vertical axis maps the value-domain 'middle' to CSS 'center', otherwise
	 * the declaration is invalid and gets discarded.
	 */
	const position = `${hAlign} ${BG_V_ALIGN_CSS_KEYWORD[vAlign]}`;
	switch (scale)
	{
		case 'cover':
			/**
			 * 縮放至覆蓋整個背景框（可能裁切溢出部分）/ Scale to cover the box (may crop overflow)
			 */
			return { backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: position };
		case 'contain':
			/**
			 * 縮放至完整放入背景框（可能留白）/ Scale to fit entirely (may letterbox)
			 */
			return { backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: position };
		case 'stretch':
			/**
			 * 拉伸至背景框的確切尺寸（會變形）/ Stretch to exact box size (may distort)
			 */
			return {
				backgroundSize: `${bgSize.width}px ${bgSize.height}px`,
				backgroundRepeat: 'no-repeat',
				backgroundPosition: position,
			};
		case 'repeat':
			/**
			 * 平鋪（依原始尺寸重複，固定由左上角開始）/ Repeat (tile at natural size, always from the top-left)
			 */
			return { backgroundSize: 'auto', backgroundRepeat: 'repeat', backgroundPosition: '0 0' };
		case 'natural':
		default:
			/**
			 * 原始尺寸；對齊由 hAlign / vAlign 決定（預設水平置中 + 垂直置底）
			 * Natural size; alignment comes from hAlign / vAlign (default: centered + bottom)
			 */
			return { backgroundSize: 'auto', backgroundRepeat: 'no-repeat', backgroundPosition: position };
	}
}

/**
 * 解析精靈所屬的隊伍側（雙框模式用）
 * Resolve which team side a sprite belongs to (dual-frame mode)
 *
 * 未標示 side 時依視覺位置退回判斷：圖片左上角落在左半場歸左隊，否則右隊。
 * When `side` is absent, fall back to the visual position: a top-left inside the left half
 * belongs to the left team, otherwise the right team.
 */
function resolveSpriteSide(sprite: IBattleSprite, width: number): EnumTeamSideUI
{
	if (sprite.side)
	{
		return sprite.side;
	}
	return sprite.x < width / 2 ? EnumTeamSideUI.Left : EnumTeamSideUI.Right;
}

/**
 * 取出屬於指定隊伍側的精靈（雙框模式用）
 * Pick the sprites of one team side (dual-frame mode)
 *
 * 一併把解析出的 side 寫回（僅寫在副本上），
 * 讓標籤防重疊的分組與排版框的分組完全一致。
 * The resolved side is also written back (on the copy only) so the label anti-overlap
 * grouping matches the frame grouping exactly.
 */
function pickSideSprites(
	sprites: IBattleSprite[],
	target: EnumTeamSideUI,
	width: number,
): IBattleSprite[]
{
	return sprites
		.filter((sprite) => resolveSpriteSide(sprite, width) === target)
		.map((sprite) => (sprite.side === target ? sprite : { ...sprite, side: target }));
}

/** 雙框模式的隊伍側與徽章文字（左隊先渲染，維持原本的疊圖次序） / Team sides in dual-frame order, with their badge text (left first to keep the original stacking order) */
const SIDE_BADGE_LABELS: { side: EnumTeamSideUI; label: string }[] = [
	{ side: EnumTeamSideUI.Left, label: '左隊' },
	{ side: EnumTeamSideUI.Right, label: '右隊' },
];

/**
 * 依隊伍側取出成對結構的值
 * Read one side out of a left/right pair
 *
 * 以明確分支取代以 enum 直接索引物件（字串 enum 無法作為 literal key 的索引型別），
 * 讓 IBattleSidePair 成為唯一且型別安全的雙側結構。
 * An explicit branch instead of indexing an object with an enum (a string enum is not usable
 * as an index type of literal keys), keeping IBattleSidePair the single type-safe pair shape.
 */
function pickSide<T>(pair: IBattleSidePair<T>, side: EnumTeamSideUI): T
{
	return side === EnumTeamSideUI.Left ? pair.left : pair.right;
}

export const BattleFieldLayers: React.FC<IBattleFieldLayersProps> = ({
	sprites,
	config,
	width: rawWidth,
	height: rawHeight,
	showSpriteLabels,
	bgSize,
	valign = EnumBattleFieldVAlign.Bottom,
	editable,
	frameOffsets,
	onFrameOffsetChange,
	showEditGuides,
	snapToGuides,
	resetToken,
	style,
	className,
}) =>
{
	/**
	 * 角色排版尺寸：選填，未提供時使用預設值（保持原有設計）
	 * Sprite layout size: optional, fall back to defaults when omitted
	 */
	const width = rawWidth ?? SPRITE_LAYOUT_WIDTH;
	const height = rawHeight ?? SPRITE_LAYOUT_HEIGHT;

	/**
	 * 背景尺寸防禦：bgSize 任一維度低於角色排版尺寸時，該維度被無視並回退為角色排版尺寸
	 * Background size guard: when any bgSize dimension is smaller than the sprite layout
	 * size, that dimension is ignored and falls back to the sprite layout size.
	 */
	const resolvedBgSize: ISpriteImageSize = {
		width: bgSize?.width! >= width ? bgSize!.width! : width,
		height: bgSize?.height! >= height ? bgSize!.height! : height,
	};

	/**
	 * 戰場是否大於排版框：
	 * - 大於 → 雙框模式，敵我雙方各佔一個排版框、可分別移動（有可調空間）
	 * - 等大（防禦保證不會小於） → 單一排版框，位置沒有可調空間
	 * Whether the scene is larger than the frame:
	 * - larger → dual-frame mode: each side owns a frame that can be moved on its own
	 *   (there is room to adjust)
	 * - equal (the guard above guarantees it is never smaller) → a single frame whose
	 *   position has no room to adjust.
	 */
	const isSceneLarger = resolvedBgSize.width > width || resolvedBgSize.height > height;

	/**
	 * 雙框模式的分組（memo：sprites / width 不變時維持同一組陣列身份，
	 * 讓精靈圖層內部的標籤運算快取持續有效）
	 * Dual-frame grouping (memoized: the same array identities persist while sprites / width
	 * are unchanged, so the label-computation cache inside the sprite layers stays warm)
	 */
	const splitSprites = useMemo<IBattleSidePair<IBattleSprite[]> | null>(
		() =>
		{
			if (!isSceneLarger)
			{
				return null;
			}
			return {
				left: pickSideSprites(sprites, EnumTeamSideUI.Left, width),
				right: pickSideSprites(sprites, EnumTeamSideUI.Right, width),
			};
		},
		[sprites, width, isSceneLarger],
	);

	/**
	 * 背景圖排版：預設自然尺寸 + 水平置中垂直置底，
	 * 縮放模式由 config.bgScale 控制，對齊錨點由 config.bgHAlign / bgVAlign 覆寫
	 * Background image layout: default natural size + centered/bottom; scale mode from
	 * config.bgScale, anchor overrides from config.bgHAlign / config.bgVAlign
	 */
	const bgScaleMode = config.bgScale ?? EnumBattleFieldBgScale.Natural;
	const bgImageLayout = resolveBgImageLayout(
		bgScaleMode,
		resolvedBgSize,
		config.bgHAlign ?? 'center',
		config.bgVAlign ?? 'bottom',
	);

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
		<div className={className} style={bgStyle}>
			{/* 魔方陣圖層（繪製於角色精靈之下，對應 PHP exec_css 的魔方陣渲染） / Magic-circle layers (drawn beneath sprites; mirrors PHP exec_css) */}
			{config.magicCircles?.map((mc, i) => (
				<BattleFieldMagicCircle key={i} magicCircle={mc} width={width} height={height} />
			))}

			{/* 角色精靈排版框（保護角色排版尺寸） / Sprite layout frame (protects sprite layout size) */}
			{isSceneLarger && splitSprites
				? (
					/**
					 * 雙框模式：敵我雙方各一個排版框（左隊先渲染以維持疊圖次序）；
					 * frameOffsets 決定初始位置，editable 開啟時可直接在畫面上拖曳。
					 * Dual-frame mode: one frame per side (left first to keep the stacking order);
					 * frameOffsets sets the initial positions and editable turns on on-canvas dragging.
					 */
					<>
						{SIDE_BADGE_LABELS.map(({ side, label }) => (
							<BattleFieldSpriteFrame
								key={side}
								sprites={pickSide(splitSprites, side)}
								width={width}
								height={height}
								showSpriteLabels={showSpriteLabels}
								valign={valign}
								offset={frameOffsets ? pickSide(frameOffsets, side) : undefined}
								editable={editable}
								label={label}
								snapToGuides={snapToGuides}
								resetToken={resetToken}
								onOffsetChange={(offset) => onFrameOffsetChange?.({ side, offset })}
							onLiveOffsetChange={(live) => frameOffsetLiveStore.publish(side, live)}
							/>
						))}
					</>
				)
				: (
					<BattleFieldSpriteFrame
						sprites={sprites}
						width={width}
						height={height}
						showSpriteLabels={showSpriteLabels}
						valign={valign}
						editable={editable}
						snapToGuides={snapToGuides}
						resetToken={resetToken}
					/>
				)}

			{/**
			 * 參考線疊加圖層：畫在最上層（pointer-events: none，不影響拖曳與點擊），
			 * 座標空間＝戰場尺寸，與拖曳、相對百分比使用同一份 size。
			 * Guide-line overlay: drawn on top (pointer-events: none, so it never affects
			 * dragging or clicking); its coordinate space is the scene size — the same `size`
			 * used for dragging and relative percentages.
			 */}
			{showEditGuides && <BattleFieldEditGuides size={resolvedBgSize} />}
		</div>
	);
};
