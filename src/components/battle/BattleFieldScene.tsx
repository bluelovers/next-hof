/**
 * 戰場畫面組件
 * Battlefield scene component
 *
 * 顯示雙方角色精靈在戰場上的位置
 * 使用巢狀 div 疊加方式實現，與原始頁面相同
 * Displays character sprites positioned on the battlefield
 * Uses nested div layering matching the original page
 *
 * 注意：此元件已改為 div 響應式區塊（不再輸出 table cell），
 * 分頁導覽改由父層（BattleDisplay 的分段）負責。
 * NOTE: this component now renders a responsive div block (no table cell);
 * paging navigation is owned by the parent (BattleDisplay segments).
 *
 * 編輯模式（editable）：當戰場（config.bgSize）大於角色排版框時，
 * 敵我雙方各佔一個排版框，可分別指定初始位置（frameOffsets）或直接在畫面上拖曳。
 * Edit mode (editable): when the scene (config.bgSize) is larger than the sprite layout
 * frame, each side owns its own frame and can be given an initial position (frameOffsets)
 * or dragged directly on the canvas.
 */
import React from 'react';
import type {
	IBattleSprite,
	IBattleFieldConfig,
	IBattleSpriteLabelOptions,
	IBattleFieldEditModeOptions,
	IBattleFieldSideOffsets,
	IBattleFieldFrameMoveEvent,
} from './types';
import { BattleFieldLayers } from './BattleFieldLayers';
import './BattleFieldScene.css';

/**
 * 戰場畫面屬性
 * Battlefield scene props
 *
 * 標籤開關共用 IBattleSpriteLabelOptions、編輯開關共用 IBattleFieldEditModeOptions
 * Label toggle comes from the shared IBattleSpriteLabelOptions; edit toggle from the
 * shared IBattleFieldEditModeOptions.
 */
export interface IBattleFieldSceneProps extends IBattleSpriteLabelOptions, IBattleFieldEditModeOptions
{
	/** 精靈列表 / Sprite list */
	sprites: IBattleSprite[];
	/** 戰場配置 / Battlefield config */
	config: IBattleFieldConfig;
	/**
	 * 敵我雙方排版框的初始位置（戰場大於排版框的雙框模式下生效）
	 * Initial offsets of the two side frames (dual-frame mode: scene larger than the frame)
	 */
	frameOffsets?: IBattleFieldSideOffsets;
	/**
	 * 排版框被拖曳移動時回報（編輯模式；拖曳過程逐次回報）
	 * Reports when a frame is dragged (edit mode; reported on every move)
	 */
	onFrameOffsetChange?: (event: IBattleFieldFrameMoveEvent) => void;
	/**
	 * 顯示參考線疊加圖層（座標空間＝戰場尺寸）
	 * Show the guide-line overlay (its coordinate space is the scene size)
	 */
	showEditGuides?: boolean;
}

/**
 * 戰場畫面組件
 * Battlefield scene component
 *
 * 原始頁面使用巢狀 div 疊加：
 * 最外層是背景 -> 內層是每個角色的精靈圖層
 * 每個 div 都是 480x200，使用 background-position 定位角色
 * The original page uses nested div layers:
 * Outermost is background -> inner layers are character sprites
 * Each div is 480x200, uses background-position for character placement
 */
export const BattleFieldScene: React.FC<IBattleFieldSceneProps> = ({
	sprites,
	config,
	showSpriteLabels,
	editable,
	frameOffsets,
	onFrameOffsetChange,
	showEditGuides,
	snapToGuides,
	resetToken,
}) =>
{
	return (
		<div className="btl-img">
			{/* 最外層背景 + 巢狀精靈圖層 / Outermost background + nested sprite layers */}
			<div className="btl-img-inner">
				<BattleFieldLayers
					sprites={sprites}
					config={config}
					width={config.width}
					height={config.height}
					showSpriteLabels={showSpriteLabels}
					bgSize={config.bgSize}
					editable={editable}
					frameOffsets={frameOffsets}
					onFrameOffsetChange={onFrameOffsetChange}
					showEditGuides={showEditGuides}
					snapToGuides={snapToGuides}
					resetToken={resetToken}
				/>
			</div>
		</div>
	);
};
