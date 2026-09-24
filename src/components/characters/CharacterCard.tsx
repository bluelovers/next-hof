/**
 * CharacterCard 角色卡片元件（統一版）
 * CharacterCard component (unified)
 *
 * 整合單選（radio）與多選（checkbox），透過 selection 切換。
 * 對外接受 ICharacterBase + active，向後相容 ICharacterData / IBattleCharacterData。
 * Unifies single-select (radio) and multi-select (checkbox) via selection prop.
 * Accepts ICharacterBase + active externally; backward-compatible with legacy types.
 *
 * 由三個可選區塊 + 自訂插槽組成：
 * - Pedestal：地毯底座 + 頭像（純展示，不含連結）
 * - Info：角色資訊區（可選）
 * - Selection control：radio 或 checkbox（可選）
 * - children：自訂子元件插槽
 */
import React from 'react';
import './CharacterCardBase.css';
import type { ICharacterBase, ICharacterData, IBattleCharacterData } from './CharacterTypes';
import { CharacterSprite } from './CharacterSprite';
import { getCarpetClass } from './characterUtils';
import { EnumSpriteVariant } from '#/components/battle/enums';

// ==================== 共用型別 / Shared types ====================

/** 選取模式 / Selection mode */
export type ISelectionMode = 'radio' | 'checkbox';

// ==================== 子組件 / Sub-components ====================

/** 底座屬性 / Pedestal props */
export interface ICharacterPedestalProps {
  /** 角色資料 / Character data */
  character: ICharacterBase;
  /** 索引 / Index */
  index?: number;
  /** 頭像連結 URL（有值時自動包 <a>）/ Avatar link URL (auto-wraps <a> if provided) */
  avatarHref?: string;
}

/**
 * 地毯底座 + 頭像
 * Carpet pedestal + avatar
 *
 * 傳入 avatarHref 時自動用 <a> 包裝頭像。
 * Auto-wraps avatar in <a> when avatarHref is provided.
 */
export const CharacterPedestal: React.FC<ICharacterPedestalProps> = ({
  character,
  index = 0,
  avatarHref,
}) => {
  const sprite = (
    <CharacterSprite
      url={character.imageUrl}
      variant={EnumSpriteVariant.Avatar}
      alt={character.name}
    />
  );

  return (
    <div className={getCarpetClass(index)}>
      {avatarHref
        ? <a href={avatarHref}>{sprite}</a>
        : sprite
      }
    </div>
  );
};

/** 資訊區屬性 / Info props */
export interface ICharacterInfoProps {
  /** 角色資料 / Character data */
  character: ICharacterBase;
  /** 文字區塊 ID / Text area ID */
  textId: string;
  /** 是否高亮 / Whether highlighted */
  highlighted: boolean;
  /** 點擊回調 / Click callback */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * 角色資訊區 / Character info area
 */
export const CharacterInfo: React.FC<ICharacterInfoProps> = ({
  character,
  textId,
  highlighted,
  onClick,
}) => {
  return (
    <div
      id={textId}
      className={highlighted ? '' : 'unselect'}
      onClick={onClick}
    >
      {character.name}
      {character.hasStar && <span className="bold charge">*</span>}
      <br />
      Lv.{character.level}
      &nbsp;&nbsp;
      {character.className}
    </div>
  );
};

/** 選取控件屬性 / Selection control props */
export interface ICharacterSelectionProps {
  /** 角色資料 / Character data */
  character: ICharacterBase;
  /** 控件 ID / Control ID */
  controlId: string;
  /** 選取模式 / Selection mode */
  mode: ISelectionMode;
  /** 是否高亮 / Whether highlighted */
  highlighted: boolean;
  /** 變更回調 / Change callback */
  onToggle?: (id: string, nextActive: boolean) => void;
}

/**
 * 選取控件（radio / checkbox）
 * Selection control (radio / checkbox)
 */
export const CharacterSelection: React.FC<ICharacterSelectionProps> = ({
  character,
  controlId,
  mode,
  highlighted,
  onToggle,
}) => {
  if (mode === 'radio') {
    return (
      <input
        type="radio"
        id={controlId}
        name="input_char_id[]"
        value={character.id}
        checked={highlighted}
        onChange={() => onToggle?.(character.id, true)}
      />
    );
  }

  return (
    <input
      type="checkbox"
      id={controlId}
      name="input_char_id[]"
      value={character.id}
      checked={highlighted}
      onChange={(e) => onToggle?.(character.id, e.target.checked)}
    />
  );
};

// ==================== 主組件 / Main component ====================

/** CharacterCard 屬性 / CharacterCard props */
export interface ICharacterCardProps {
  /** 角色資料 / Character data */
  character: ICharacterBase;
  /** 索引（決定 carpet0/carpet1 交替）/ Index */
  index?: number;
  /** 選取模式 / Selection mode */
  selection?: ISelectionMode;
  /** 頭像連結 URL（傳入時底座自動包 <a>）/ Avatar link URL (auto-wraps <a> in pedestal) */
  avatarHref?: string;
  /** 選取變更回調 / Selection change callback */
  onActiveChange?: (id: string, active: boolean) => void;

  // --- 可選區塊 / Optional sections ---

  /** 底座（傳 false 隱藏）/ Pedestal (pass false to hide) */
  renderPedestal?: ((props: ICharacterPedestalProps) => React.ReactNode) | false;
  /** 資訊區（傳 false 隱藏）/ Info area (pass false to hide) */
  renderInfo?: ((props: ICharacterInfoProps) => React.ReactNode) | false;
  /** 選取控件（傳 false 隱藏）/ Selection control (pass false to hide) */
  renderSelection?: ((props: ICharacterSelectionProps) => React.ReactNode) | false;

  /** 自訂子元件 / Custom children */
  children?: React.ReactNode;
}

/**
 * CharacterCard 角色卡片元件（統一版）
 * CharacterCard component (unified)
 *
 * 透過 selection="radio"|"checkbox" 切換選取控件。
 * 各區塊可透過 render props 替換，或傳 false 隱藏。
 */
export const CharacterCard: React.FC<ICharacterCardProps> = ({
  character,
  index = 0,
  selection = 'radio',
  avatarHref,
  onActiveChange,
  renderPedestal,
  renderInfo,
  renderSelection,
  children,
}) => {
  const controlId = `${selection === 'radio' ? 'radio' : 'box'}${index + 1}`;
  const textId = `text${index + 1}`;

  // 統一讀取 active（向後相容 selected / checked）
  const highlighted = character.active
    ?? (character as ICharacterData).selected
    ?? (character as IBattleCharacterData).checked
    ?? false;

  /** 點擊文字區塊切換選取 / Click text to toggle */
  const handleTextClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('input')) {
      onActiveChange?.(character.id, !highlighted);
    }
  };

  const pedestalProps: ICharacterPedestalProps = { character, index, avatarHref };
  const infoProps: ICharacterInfoProps = { character, textId, highlighted, onClick: handleTextClick };
  const selectionProps: ICharacterSelectionProps = { character, controlId, mode: selection, highlighted, onToggle: onActiveChange };

  return (
    <div className="carpet_frame">
      {/* 底座 / Pedestal */}
      {renderPedestal !== false && (
        renderPedestal
          ? renderPedestal(pedestalProps)
          : <CharacterPedestal {...pedestalProps} />
      )}

      {/* 資訊區 / Info */}
      {renderInfo !== false && (
        renderInfo
          ? renderInfo(infoProps)
          : <CharacterInfo {...infoProps} />
      )}

      {/* 選取控件 / Selection control */}
      {renderSelection !== false && (
        renderSelection
          ? renderSelection(selectionProps)
          : <CharacterSelection {...selectionProps} />
      )}

      {/* 自訂子元件 / Custom children */}
      {children}
    </div>
  );
};
