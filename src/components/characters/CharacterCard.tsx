/**
 * CharacterCard 角色卡片元件
 * CharacterCard component
 *
 * 使用 carpet_frame 底座結構顯示角色：
 * 頭像(carpet0/1) + 名稱/等級/職業(text) + 選取鈕(radio)
 * Uses carpet_frame pedestal structure:
 * avatar(carpet0/1) + name/level/class(text) + selection(radio)
 */
import React, { useId } from 'react';
import './CharacterCardBase.css';

/** 角色資料 / Character data */
export interface ICharacterData {
  /** 角色 ID / Character ID */
  id: string;
  /** 角色名稱 / Character name */
  name: string;
  /** 圖像路徑 / Image path */
  imageUrl: string;
  /** 等級 / Level */
  level: number;
  /** 職業 / Class */
  className: string;
  /** 是否有星標記 / Has star marker */
  hasStar?: boolean;
  /** 是否選取 / Whether selected */
  selected?: boolean;
}

/** CharacterCard 屬性 / CharacterCard props */
export interface ICharacterCardProps {
  /** 角色資料 / Character data */
  character: ICharacterData;
  /** 索引（決定 carpet0/carpet1 交替）/ Index (determines carpet0/carpet1 alternation) */
  index?: number;
  /** 選取變更回調 / Selection change callback */
  onSelect?: (id: string) => void;
}

/** 判斷 carpet 類別（偶數為 carpet0，奇數為 carpet1）/ Determine carpet class */
const getCarpetClass = (index: number = 0): string =>
  index % 2 === 0 ? 'carpet0' : 'carpet1';

/**
 * CharacterCard 角色卡片元件
 * CharacterCard component
 */
export const CharacterCard: React.FC<ICharacterCardProps> = ({
  character,
  index = 0,
  onSelect,
}) => {
  const textId = `text${index + 1}`;
  const boxId = `box${index + 1}`;

  /** 點擊文字區塊切換選取 / Click text to toggle selection */
  const handleTextClick = (e: React.MouseEvent) => {
    // 避免點擊到 input 元素時觸發兩次
    if (!(e.target as HTMLElement).closest('input')) {
      onSelect?.(character.id);
    }
  };

  return (
    <div className="carpet_frame">
      {/** 角色頭像底座（交替 carpet0/carpet1）/ Avatar pedestal (alternating) */}
      <div className={getCarpetClass(index)}>
        <a
          href={`http://127.0.0.1:8085/char/char?char=${character.id}`}
        >
          <img
            src={character.imageUrl}
            title={character.imageUrl}
            alt={character.name}
          />
        </a>
      </div>

      {/** 角色資訊區（可點擊選取）/ Character info (clickable to select) */}
      <div
        id={textId}
        className={character.selected ? '' : 'unselect'}
        onClick={handleTextClick}
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

      {/** 選取 radio / Selection radio */}
      <input
        type="radio"
        id={boxId}
        name="input_char_id[]"
        value={character.id}
        checked={character.selected}
        onChange={() => onSelect?.(character.id)}
      />
    </div>
  );
};
