/**
 * CharacterList 角色列表元件
 * CharacterList component
 *
 * 顯示隊伍中的所有角色卡片（含底座 carpet_frame 交替）
 * Displays all characters with alternating carpet_frame pedestals
 */
import React from 'react';
import { CharacterCard } from './CharacterCard';
import type { ICharacterData } from './CharacterCard';
import './CharacterCardBase.css';
import './CharacterList.css';
import './CharacterList.css';

/** CharacterList 屬性 / CharacterList props */
export interface ICharacterListProps {
  /** 角色資料陣列 / Character data array */
  characters?: ICharacterData[];
  /** 選取變更回調 / Selection change callback */
  onSelect?: (id: string) => void;
}

/**
 * CharacterList 角色列表元件
 * CharacterList component
 */
export const CharacterList: React.FC<ICharacterListProps> = ({
  characters = [],
  onSelect,
}) => {
  return (
    <div className="dashboard-characters margin15">
      {characters.map((char, index) => (
        <CharacterCard
          key={char.id}
          character={char}
          index={index}
          onSelect={onSelect}
        />
      ))}
      <div className="clearfix" />
    </div>
  );
};
