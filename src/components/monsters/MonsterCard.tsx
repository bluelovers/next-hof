/**
 * MonsterCard 怪物卡片元件
 * MonsterCard component
 *
 * 在戰鬥編成頁面顯示怪物資訊（含地形背景）
 * Displays monster info with landscape background on battle formation page
 */
import React from 'react';

/** 共享 carpet_frame 底座樣式 */
/** Shared carpet_frame pedestal styles */
import '#/components/characters/CharacterCardBase.css';
/** MonsterCard 專用樣式（地形背景） */
/** MonsterCard specific styles (land backgrounds) */
import './MonsterCard.css';
import type { ILandType } from '#/components/areas/landTypes';
import { buildLandClass } from '#/components/areas/landTypes';
import type { IMonsterData } from './MonsterTypes';
import { CharacterSprite } from '#/components/characters/CharacterSprite';

/** MonsterCard 屬性 / MonsterCard props */
export interface IMonsterCardProps {
  /** 怪物資料 / Monster data */
  monster: IMonsterData;
}

/**
 * MonsterCard 怪物卡片元件
 * MonsterCard component
 */
export const MonsterCard: React.FC<IMonsterCardProps> = ({ monster }) => {
  const landClass = buildLandClass(monster.landType);

  return (
    <div className="carpet_frame">
      <div className={landClass}>
        <CharacterSprite
          url={monster.imageUrl}
          variant="avatar"
          alt={monster.name}
        />
      </div>
      {monster.name}
      <br />
      Lv.{monster.level}
    </div>
  );
};
