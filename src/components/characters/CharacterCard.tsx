/**
 * CharacterCard 角色卡片元件
 * CharacterCard component
 *
 * 由三個可選區塊 + 自訂插槽組成：
 * - Pedestal：地毯底座 + 頭像（純展示，不含連結）
 * - Info：角色資訊區（可選）
 * - Radio：選取控件（可選）
 * - children：自訂子元件插槽
 */
import React from 'react';
import './CharacterCardBase.css';
import type { ICharacterData } from './CharacterTypes';
import { CharacterSprite } from './CharacterSprite';
import { getCarpetClass } from './characterUtils';

// ==================== 子組件 / Sub-components ====================

/** 底座屬性 / Pedestal props */
export interface ICharacterPedestalProps {
  /** 角色資料 / Character data */
  character: ICharacterData;
  /** 索引（決定 carpet0/carpet1 交替）/ Index */
  index?: number;
}

/**
 * 地毯底座 + 頭像（純展示，不含連結）
 * Carpet pedestal + avatar (presentational only, no link)
 */
export const CharacterPedestal: React.FC<ICharacterPedestalProps> = ({
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
export interface ICharacterInfoProps {
  /** 角色資料 / Character data */
  character: ICharacterData;
  /** 文字區塊 ID / Text area ID */
  textId: string;
  /** 點擊回調 / Click callback */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * 角色資訊區 / Character info area
 */
export const CharacterInfo: React.FC<ICharacterInfoProps> = ({
  character,
  textId,
  onClick,
}) => {
  return (
    <div
      id={textId}
      className={character.selected ? '' : 'unselect'}
      onClick={onClick}
    >
      {character.name}
      {character.hasStar && (
        <span className="bold charge">*</span>
      )}
      <br />
      Lv.{character.level}
      &nbsp;&nbsp;
      {character.className}
    </div>
  );
};

/** Radio 屬性 / Radio props */
export interface ICharacterRadioProps {
  /** 角色資料 / Character data */
  character: ICharacterData;
  /** radio ID / Radio ID */
  boxId: string;
  /** 選取變更回調 / Selection change callback */
  onSelect?: (id: string) => void;
}

/**
 * 選取 radio / Selection radio
 */
export const CharacterRadio: React.FC<ICharacterRadioProps> = ({
  character,
  boxId,
  onSelect,
}) => {
  return (
    <input
      type="radio"
      id={boxId}
      name="input_char_id[]"
      value={character.id}
      checked={character.selected}
      onChange={() => onSelect?.(character.id)}
    />
  );
};

// ==================== 主組件 / Main component ====================

/** CharacterCard 屬性 / CharacterCard props */
export interface ICharacterCardProps {
  /** 角色資料 / Character data */
  character: ICharacterData;
  /** 索引（決定 carpet0/carpet1 交替）/ Index */
  index?: number;
  /** 選取變更回調 / Selection change callback */
  onSelect?: (id: string) => void;

  // --- 可選區塊 / Optional sections ---

  /** 底座（傳 false 隱藏）/ Pedestal (pass false to hide) */
  renderPedestal?: ((props: ICharacterPedestalProps) => React.ReactNode) | false;
  /** 資訊區（傳 false 隱藏）/ Info area (pass false to hide) */
  renderInfo?: ((props: ICharacterInfoProps) => React.ReactNode) | false;
  /** 選取控件（傳 false 隱藏）/ Selection control (pass false to hide) */
  renderRadio?: ((props: ICharacterRadioProps) => React.ReactNode) | false;

  /** 自訂子元件 / Custom children */
  children?: React.ReactNode;
}

/**
 * CharacterCard 角色卡片元件
 * CharacterCard component
 *
 * 各區塊皆可透過 render props 替換，或傳 false 完全隱省略。
 * Each section can be overridden via render props, or omitted by passing false.
 */
export const CharacterCard: React.FC<ICharacterCardProps> = ({
  character,
  index = 0,
  onSelect,
  renderPedestal,
  renderInfo,
  renderRadio,
  children,
}) => {
  const textId = `text${index + 1}`;
  const boxId = `box${index + 1}`;

  /** 點擊文字區塊切換選取 / Click text to toggle selection */
  const handleTextClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('input')) {
      onSelect?.(character.id);
    }
  };

  const pedestalProps: ICharacterPedestalProps = { character, index };
  const infoProps: ICharacterInfoProps = { character, textId, onClick: handleTextClick };
  const radioProps: ICharacterRadioProps = { character, boxId, onSelect };

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
      {renderRadio !== false && (
        renderRadio
          ? renderRadio(radioProps)
          : <CharacterRadio {...radioProps} />
      )}

      {/* 自訂子元件 / Custom children */}
      {children}
    </div>
  );
};
