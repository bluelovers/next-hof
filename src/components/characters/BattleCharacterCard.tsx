/**
 * BattleCharacterCard 戰鬥編成角色卡片元件
 * BattleCharacterCard component
 *
 * 由三個可選區塊 + 自訂插槽組成：
 * - Pedestal：地毯底座 + 頭像（純展示，不含連結）
 * - Info：角色資訊區（可選）
 * - Checkbox：選取控件（可選）
 * - children：自訂子元件插槽
 */
import React from 'react';
import './CharacterCardBase.css';
import './BattleCharacterCard.css';
import type { IBattleCharacterData } from './CharacterTypes';
import { CharacterSprite } from './CharacterSprite';
import { getCarpetClass } from './characterUtils';

// ==================== 子組件 / Sub-components ====================

/** 底座屬性 / Pedestal props */
export interface IBattleCharacterPedestalProps {
  /** 角色資料 / Character data */
  character: IBattleCharacterData;
  /** 索引（決定 carpet0/carpet1 交替）/ Index */
  index?: number;
}

/**
 * 地毯底座 + 頭像（純展示，不含連結）
 * Carpet pedestal + avatar (presentational only, no link)
 */
export const BattleCharacterPedestal: React.FC<IBattleCharacterPedestalProps> = ({
  character,
  index = 0,
}) => {
  return (
    <div className={getCarpetClass(index)}>
      <CharacterSprite
        url={character.imageUrl}
        variant="avatar"
        alt={character.name}
      />
    </div>
  );
};

/** 資訊區屬性 / Info props */
export interface IBattleCharacterInfoProps {
  /** 角色資料 / Character data */
  character: IBattleCharacterData;
  /** 文字區塊 ID / Text area ID */
  textId: string;
  /** 點擊回調 / Click callback */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * 角色資訊區 / Character info area
 */
export const BattleCharacterInfo: React.FC<IBattleCharacterInfoProps> = ({
  character,
  textId,
  onClick,
}) => {
  return (
    <div
      id={textId}
      className={character.checked ? '' : 'unselect'}
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

/** Checkbox 屬性 / Checkbox props */
export interface IBattleCharacterCheckboxProps {
  /** 角色資料 / Character data */
  character: IBattleCharacterData;
  /** checkbox ID / Checkbox ID */
  boxId: string;
  /** 勾選變更回調 / Check change callback */
  onChange?: (id: string, checked: boolean) => void;
}

/**
 * 選取 checkbox / Selection checkbox
 */
export const BattleCharacterCheckbox: React.FC<IBattleCharacterCheckboxProps> = ({
  character,
  boxId,
  onChange,
}) => {
  return (
    <input
      type="checkbox"
      id={boxId}
      name="input_char_id[]"
      value={character.id}
      checked={character.checked}
      onChange={(e) => onChange?.(character.id, e.target.checked)}
    />
  );
};

// ==================== 主組件 / Main component ====================

/** BattleCharacterCard 屬性 / BattleCharacterCard props */
export interface IBattleCharacterCardProps {
  /** 角色資料 / Character data */
  character: IBattleCharacterData;
  /** 索引（決定 carpet0/carpet1 交替）/ Index */
  index?: number;
  /** 勾選變更回調 / Check change callback */
  onChange?: (id: string, checked: boolean) => void;

  // --- 可選區塊 / Optional sections ---

  /** 底座（傳 false 隱藏）/ Pedestal (pass false to hide) */
  renderPedestal?: ((props: IBattleCharacterPedestalProps) => React.ReactNode) | false;
  /** 資訊區（傳 false 隱藏）/ Info area (pass false to hide) */
  renderInfo?: ((props: IBattleCharacterInfoProps) => React.ReactNode) | false;
  /** 選取控件（傳 false 隱藏）/ Selection control (pass false to hide) */
  renderCheckbox?: ((props: IBattleCharacterCheckboxProps) => React.ReactNode) | false;

  /** 自訂子元件 / Custom children */
  children?: React.ReactNode;
}

/**
 * BattleCharacterCard 戰鬥編成角色卡片元件
 * BattleCharacterCard component
 *
 * 各區塊皆可透過 render props 替換，或傳 false 完全隱省略。
 * Each section can be overridden via render props, or omitted by passing false.
 */
export const BattleCharacterCard: React.FC<IBattleCharacterCardProps> = ({
  character,
  index = 0,
  onChange,
  renderPedestal,
  renderInfo,
  renderCheckbox,
  children,
}) => {
  const textId = `text${index + 1}`;
  const boxId = `box${index + 1}`;

  /** 點擊文字區塊切換勾選 / Click text to toggle checked */
  const handleTextClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('input')) {
      onChange?.(character.id, !character.checked);
    }
  };

  const pedestalProps: IBattleCharacterPedestalProps = { character, index };
  const infoProps: IBattleCharacterInfoProps = { character, textId, onClick: handleTextClick };
  const checkboxProps: IBattleCharacterCheckboxProps = { character, boxId, onChange };

  return (
    <div className="carpet_frame">
      {/* 底座 / Pedestal */}
      {renderPedestal !== false && (
        renderPedestal
          ? renderPedestal(pedestalProps)
          : <BattleCharacterPedestal {...pedestalProps} />
      )}

      {/* 資訊區 / Info */}
      {renderInfo !== false && (
        renderInfo
          ? renderInfo(infoProps)
          : <BattleCharacterInfo {...infoProps} />
      )}

      {/* 選取控件 / Selection control */}
      {renderCheckbox !== false && (
        renderCheckbox
          ? renderCheckbox(checkboxProps)
          : <BattleCharacterCheckbox {...checkboxProps} />
      )}

      {/* 自訂子元件 / Custom children */}
      {children}
    </div>
  );
};
