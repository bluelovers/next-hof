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
 *
 * 編輯模式（editable）：每個精靈的「圖片顯示區」成為可拖曳把手，
 * 直接在畫面上移動單一精靈；其餘圖層點擊穿透，確保被壓在下層的精靈仍抓得到。
 * Edit mode (editable): each sprite's displayed image area becomes a draggable handle so a
 * single sprite can be moved on the canvas; the rest of the layers are click-through so a
 * sprite buried underneath can still be grabbed.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type {
	IBattleSprite,
	IBattleSpriteLabelOptions,
	IBattleFieldEditModeOptions,
	IBattleSpriteMoveEvent,
	IBattleSpritePosition,
} from './types';
import { BattleFieldSpriteLabel } from './BattleFieldSpriteLabel';
import { BattleFieldEditGuides } from './BattleFieldEditGuides';
import { DEFAULT_IMAGE_SIZE } from './labelPosition';
import { resetSpriteOverrides, snapToGuideLines } from './editModeUtils';
import {
	useSpriteLabelRegistry,
	type ISpriteLabelRegistry,
	type ISpriteLabelComputeInput,
} from './useSpriteLabelRegistry';
import './BattleFieldSpriteLayers.css';
import type { IStyleProps } from '#/src/components/shared/types';

/** 戰場精靈圖層屬性（標籤開關共用 IBattleSpriteLabelOptions、編輯開關共用 IBattleFieldEditModeOptions）/ Battlefield sprite layers props (label toggle from the shared IBattleSpriteLabelOptions, edit toggle from the shared IBattleFieldEditModeOptions) */
export interface IBattleFieldSpriteLayersProps extends IBattleSpriteLabelOptions, IBattleFieldEditModeOptions, IStyleProps
{
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
	/**
	 * 精靈被拖曳移動時回報（編輯模式；拖曳過程逐次回報）
	 * Reports when a sprite is dragged (edit mode; reported on every move)
	 */
	onSpriteMove?: (event: IBattleSpriteMoveEvent) => void;
	/**
	 * 顯示參考線疊加圖層（座標空間＝本圖層的 width x height）
	 * Show the guide-line overlay (its coordinate space is this layer's width x height)
	 */
	showEditGuides?: boolean;
}

/** 拖曳時至少保留的可視邊距（px），避免精靈被拖出畫面後抓不回來 / Minimum visible margin kept while dragging (px), so a sprite can never be dragged fully out of reach */
const SPRITE_MIN_VISIBLE = 16;

/** 精靈拖曳狀態（僅拖曳期間非 null） / Sprite drag state (non-null only while dragging) */
interface ISpriteDragState
{
	/** 被拖曳的 sprites 索引 / Index of the dragged sprite */
	index: number;
	/** 起始游標 X / Start cursor X */
	startX: number;
	/** 起始游標 Y / Start cursor Y */
	startY: number;
	/** 起始精靈座標 X / Start sprite X */
	baseX: number;
	/** 起始精靈座標 Y / Start sprite Y */
	baseY: number;
}

/** 編輯模式的精靈拖曳處理器（由元件本體實作，各圖層以自己的 index 呼叫） / Edit-mode drag handlers (implemented by the component; each layer calls them with its own index) */
interface ISpriteLayerDragHandlers
{
	/** 指標按下：起始拖曳 / Pointer down: start the drag */
	onPointerDown: (e: React.PointerEvent<HTMLElement>, index: number) => void;
	/** 指標移動：拖曳中 / Pointer move: while dragging */
	onPointerMove: (e: React.PointerEvent<HTMLElement>, index: number) => void;
	/** 指標放開／取消：結束拖曳 / Pointer up / cancel: end the drag */
	onPointerUp: (e: React.PointerEvent<HTMLElement>, index: number) => void;
}

/**
 * 把精靈位置收斂在「至少保留 SPRITE_MIN_VISIBLE px 可見」的範圍內
 * Clamp the sprite position so at least SPRITE_MIN_VISIBLE px stays visible
 *
 * 只約束圖片左上角：左／上界讓圖片仍露出一個可抓的角，右／下界保證把手與座標
 * 徽章留在畫布內，因此任何情況都不會出現「拖出去後抓不回來」的死角。
 * Only the image's top-left corner is constrained: the left/top bounds keep a grabbable
 * corner visible, the right/bottom bounds keep the handle and coordinate badge on-canvas,
 * so there is never a spot that can be dragged out but not back.
 */
function clampSpritePosition(
	pos: IBattleSpritePosition,
	sprite: IBattleSprite,
	width: number,
	height: number,
): IBattleSpritePosition
{
	const image = sprite.imageSize ?? DEFAULT_IMAGE_SIZE;
	const minX = SPRITE_MIN_VISIBLE - image.width;
	const maxX = width - SPRITE_MIN_VISIBLE;
	const minY = SPRITE_MIN_VISIBLE - image.height;
	const maxY = height - SPRITE_MIN_VISIBLE;
	return {
		x: Math.min(Math.max(minX, Math.round(pos.x)), maxX),
		y: Math.min(Math.max(minY, Math.round(pos.y)), maxY),
	};
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
	dragHandlers?: ISpriteLayerDragHandlers,
): React.ReactNode[]
{
	const { sprites, width, height, showSpriteLabels, style, className, editable } = props;

	return sprites.map((sprite, index) =>
	{
		const flipClass = sprite.flipped ? 'flip-h' : '';
		/**
		 * 精靈自身的 className（例如屍體規格附加的 class）與 battle-sprite 併存，不互相覆蓋
		 * The sprite's own className (e.g. from a corpse spec) coexists with battle-sprite
		 * instead of replacing it
		 */
		const layerClass = [
			'battle-sprite',
			flipClass,
			editable ? 'battle-sprite--editable' : '',
			sprite.className?.trim(),
		]
			.filter(Boolean)
			.join(' ');

		const layerStyle: CSSProperties = {
			width,
			height,
			backgroundImage: sprite.imageUrl
				? `url(${sprite.imageUrl})`
				: undefined,
			/**
			 * backgroundRepeat: 'no-repeat',
			 */
			backgroundPosition: `${sprite.x}px ${sprite.y}px`,
			/**
			 * position: 'absolute',
			 */
		};

		/**
		 * 合併順序：基礎樣式 < 元件/輔助函式 style < 單體精靈 style（最優先）
		 * Merge order: base < component/helper style < per-sprite style (highest priority)
		 */
		const mergedStyle: CSSProperties = {
			...layerStyle,
			...style,
			...sprite.style,
		};

		/**
		 * 由上層 useSpriteLabelRegistry 預先算好的防重疊位置（依順序對應）
		 * Pre-computed anti-overlap position from useSpriteLabelRegistry (matched by order).
		 */
		const entry = registry.entries[index];

		/** 圖片顯示區尺寸（拖曳把手與座標徽章的錨定範圍） / Displayed image size (anchor box for the drag handle and coordinate badge) */
		const imageSize = sprite.imageSize ?? DEFAULT_IMAGE_SIZE;

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
				{editable && dragHandlers && (
					/**
					 * 拖曳把手：與圖片顯示區同大小，因此「抓到哪裡就是哪一隻精靈」；
					 * flip-h 下把手隨圖層鏡像，仍精準貼合被鏡像後的圖片位置。
					 * Drag handle: exactly the displayed image box, so grabbing it always grabs
					 * that sprite; under flip-h the handle mirrors with its layer and still sits
					 * precisely on the mirrored image.
					 */
					<span
						className="battle-sprite__drag-handle"
						style={{
							left: sprite.x,
							top: sprite.y,
							width: imageSize.width,
							height: imageSize.height,
						}}
						onPointerDown={(e) => dragHandlers.onPointerDown(e, index)}
						onPointerMove={(e) => dragHandlers.onPointerMove(e, index)}
						onPointerUp={(e) => dragHandlers.onPointerUp(e, index)}
						onPointerCancel={(e) => dragHandlers.onPointerUp(e, index)}
					>
						{/**
						 * 座標徽章：與把手同寬，鏡像後仍佔同一位置；flipped 時再鏡像一次抵銷文字翻轉
						 * Coordinate badge: same width as the handle so it lands on the same box after
						 * mirroring; flipped sprites get one more mirror to keep the text readable.
						 */}
						<span
							className="battle-sprite__edit-badge"
							style={sprite.flipped ? { transform: 'scaleX(-1)' } : undefined}
						>
							{sprite.x}, {sprite.y}
						</span>
					</span>
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
 *
 * 編輯模式以「索引覆寫表」保存拖曳結果：座標只在覆寫時改變，
 * 其餘欄位（樣式／標籤設定）完全沿用原資料，標籤防重疊也改用覆寫後的座標重算。
 * In edit mode a keyed override table stores drag results: only coordinates change on
 * override while every other field (styles / label options) keeps the original data, and
 * the label anti-overlap pass recomputes from the overridden coordinates.
 *
 * 以 React.memo 包裹：外層排版框在拖曳時每幀重繪，但本組件的 props
 * （sprites 陣列、尺寸、標籤開關）在拖曳期間完全不變，
 * memo 可略過整棵精靈子樹（圖層 div＋標籤）的重建，顯著降低拖曳成本。
 * Wrapped in React.memo: the parent layout frame re-renders every frame while dragging, but
 * this component's props (sprites array, size, label toggle) never change during the drag, so
 * the memo skips rebuilding the whole sprite subtree (layer divs + labels) and makes dragging
 * much cheaper.
 */
export const BattleFieldSpriteLayers: React.FC<IBattleFieldSpriteLayersProps> = React.memo<IBattleFieldSpriteLayersProps>((props) =>
{
	const { sprites, width, height, editable, onSpriteMove, snapToGuides, showEditGuides, resetToken } = props;

	/**
	 * 編輯模式的位置覆寫（key＝sprites 陣列索引）
	 * Edit-mode position overrides (key = index into sprites)
	 *
	 * 以索引而非 unitUuid 為 key：樣本資料可能存在重複 uuid，索引才是穩定的對應鍵。
	 * Keyed by index instead of unitUuid: sample data can repeat a uuid, so the index is
	 * the stable matching key.
	 */
	const [overrides, setOverrides] = useState<Record<number, IBattleSpritePosition>>({});
	/** 拖曳狀態（僅拖曳期間非 null） / Drag state (non-null only while dragging) */
	const dragRef = useRef<ISpriteDragState | null>(null);

	/**
	 * 重置：明確觸發（resetToken 改變）時清除覆寫。
	 * 注意「關閉編輯模式」不會清空覆寫——編輯成果一律保留（見 resetToken）。
	 * Reset: on an explicit trigger (resetToken changed) the overrides are cleared.
	 * Note that turning edit mode OFF does NOT clear them — the edit result is always kept
	 * (see resetToken).
	 */
	useEffect(() =>
	{
		if (resetToken === undefined)
		{
			return;
		}
		dragRef.current = null;
		setOverrides(resetSpriteOverrides());
	}, [resetToken]);

	/**
	 * 套用覆寫後的精靈：拖曳只改 x/y，其餘欄位原樣保留；
	 * 無覆寫時回傳原陣列身份，讓標籤運算的 memo 快取繼續有效。
	 * 覆寫一經建立就會一直生效（即使關閉編輯模式），除非 resetToken 觸發重置。
	 * Sprites with overrides applied: dragging only changes x/y and keeps every other field;
	 * with no overrides the original array identity is returned so the label memo stays cached.
	 * Once created the overrides stay applied (even with edit mode off) until a resetToken
	 * reset clears them.
	 */
	const effectiveSprites = useMemo<IBattleSprite[]>(
		() =>
		{
			if (Object.keys(overrides).length === 0)
			{
				return sprites;
			}
			return sprites.map((sprite, i) =>
			{
				const override = overrides[i];
				return override ? { ...sprite, x: override.x, y: override.y } : sprite;
			});
		},
		[sprites, overrides],
	);

	/**
	 * 依序把精靈轉為標籤運算輸入；memo 化使 inputs 在 sprites 不變時保持穩定，
	 * 進而讓 useSpriteLabelRegistry 的 useMemo / ref 快取能跨渲染生效。
	 * Map sprites to label-compute inputs in order; memoized so inputs stay stable when
	 * sprites is unchanged, letting useSpriteLabelRegistry's useMemo/ref cache persist across renders.
	 */
	const inputs = useMemo<ISpriteLabelComputeInput[]>(
		() =>
			effectiveSprites.map((s, i) => ({
				x: s.x,
				y: s.y,
				imageSize: s.imageSize,
				placement: s.placement,
				unitUuid: s.unitUuid ?? String(i),
				side: s.side,
			})),
		[effectiveSprites],
	);
	const registry = useSpriteLabelRegistry(inputs, { width, height });

	/** 以覆寫後的座標（而非原始 props）當作拖曳基準 / Drag from the overridden coordinates instead of the raw props */
	const dragHandlers: ISpriteLayerDragHandlers | undefined = editable
		? {
			onPointerDown: (e, index) =>
			{
				if (e.button !== 0)
				{
					return;
				}
				const sprite = effectiveSprites[index];
				if (!sprite)
				{
					return;
				}
				dragRef.current = {
					index,
					startX: e.clientX,
					startY: e.clientY,
					baseX: sprite.x,
					baseY: sprite.y,
				};
				/**
				 * 阻止冒泡：上層若同為編輯中的排版框，不應被一併拖走
				 * Stop bubbling: an editable parent frame must not be dragged along.
				 */
				e.stopPropagation();
				e.preventDefault();
				try
				{
					e.currentTarget.setPointerCapture(e.pointerId);
				}
				catch
				{
					/**
					 * 指標擷取失敗不致命：move/up 仍會送達，只是目標可能轉移
					 * Pointer-capture failure is not fatal: move/up still arrive, only the target may differ.
					 */
				}
			},
			onPointerMove: (e, index) =>
			{
				const drag = dragRef.current;
				if (!drag || drag.index !== index)
				{
					return;
				}
				const sprite = sprites[index];
				if (!sprite)
				{
					return;
				}
				const raw = {
					x: drag.baseX + (e.clientX - drag.startX),
					y: drag.baseY + (e.clientY - drag.startY),
				};
				/**
				 * 吸附基準＝本圖層的座標空間（與參考線疊加圖層同一份尺寸）
				 * The snap basis is this layer's coordinate space (the same size as the
				 * guide-line overlay).
				 */
				const pos = clampSpritePosition(
					(snapToGuides ? snapToGuideLines(raw, { width, height }).pos : raw),
					sprite,
					width,
					height,
				);
				setOverrides((prev) => ({ ...prev, [index]: pos }));
				onSpriteMove?.({ index, sprite, pos });
			},
			onPointerUp: (e, index) =>
			{
				if (!dragRef.current || dragRef.current.index !== index)
				{
					return;
				}
				dragRef.current = null;
				try
				{
					e.currentTarget.releasePointerCapture(e.pointerId);
				}
				catch
				{
					/**
					 * 釋放失敗可忽略（指標本來就未被擷取）
					 * Ignore a failed release (the pointer may not have been captured).
					 */
				}
			},
		}
		: undefined;

	return (
		<>
			{buildSpriteLayers({ ...props, sprites: effectiveSprites }, registry, dragHandlers)}
			{/**
			 * 參考線疊加圖層（pointer-events: none，不影響拖曳），
			 * 座標空間＝本圖層的 width x height。
			 * Guide-line overlay (pointer-events: none, never affects dragging);
			 * its coordinate space is this layer's width x height.
			 */}
			{showEditGuides && <BattleFieldEditGuides size={{ width, height }} />}
		</>
	);
});
