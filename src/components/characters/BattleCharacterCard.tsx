/**
 * BattleCharacterCard 戰鬥編成角色卡片元件
 * BattleCharacterCard component
 *
 * 和 CharacterCard 類似，但使用 checkbox（可複選）
 * Similar to CharacterCard but uses checkbox (multi-select)
 */
import React from 'react';
import './CharacterCardBase.css';
import './BattleCharacterCard.css';
import type { IBattleCharacterData } from './CharacterTypes';
import { CharacterSprite } from './CharacterSprite';
import { getCarpetClass, buildCharacterUrl } from './characterUtils';

/** BattleCharacterCard 屬性 / BattleCharacterCard props */
export interface IBattleCharacterCardProps {
  /** 角色資料 / Character data */
  character: IBattleCharacterData;
  /** 索引（決定 carpet0/carpet1 交替）/ Index (determines carpet alternation) */
  index?: number;
  /** 勾選變更回調 / Check change callback */
  onChange?: (id: string, checked: boolean) => void;
}

/**
 * BattleCharacterCard 戰鬥編成角色卡片元件
 * BattleCharacterCard component
 */
export const BattleCharacterCard: React.FC<IBattleCharacterCardProps> = ({
  character,
  index = 0,
  onChange,
}) => {
  const textId = `text${index + 1}`;
  const boxId = `box${index + 1}`;

  /** 點擊文字區塊切換勾選 / Click text to toggle checked */
  const handleTextClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('input')) {
      onChange?.(character.id, !character.checked);
    }
  };

  return (
    <div className="carpet_frame">
      {/* 角色頭像底座（交替 carpet0/carpet1）/ Avatar pedestal (alternating) */}
      <div className={getCarpetClass(index)}>
        <a href={buildCharacterUrl(character.id)}>
          <CharacterSprite
            url={character.imageUrl}
            variant="avatar"
            alt={character.name}
          />
        </a>
      </div>

      {/* 角色資訊區（可點擊切換）/ Character info (clickable to toggle) */}
      <div
        id={textId}
        className={character.checked ? '' : 'unselect'}
        onClick={handleTextClick}
      >
        {character.name}
        {character.hasStar && <span className="bold charge">*</span>}
        <br />
        Lv.{character.level}
        &nbsp;&nbsp;
        {character.className}
      </div>

      {/* 選取 checkbox（可複選）/ Selection checkbox (multi-select) */}
      <input
        type="checkbox"
        id={boxId}
        name="input_char_id[]"
        value={character.id}
        checked={character.checked}
        onChange={(e) => onChange?.(character.id, e.target.checked)}
      />
    </div>
  );
};
