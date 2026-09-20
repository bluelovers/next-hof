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
import '../characters/CharacterCardBase.css';
/** MonsterCard 專用樣式（地形背景） */
/** MonsterCard specific styles (land backgrounds) */
import './MonsterCard.css';
import type { ILandType } from '#/components/areas/landTypes';
import { buildLandClass } from '#/components/areas/landTypes';

/** 怪物資料 / Monster data */
export interface IMonsterData {
  /** 怪物名稱 / Monster name */
  name: string;
  /** 怪物圖片 URL / Monster image URL */
  imageUrl: string;
  /** 等級 / Level */
  level: number;
  /** 地形類型（影響背景圖）/ Land type (affects background image) */
  landType?: ILandType;
}

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
        <img
          src={monster.imageUrl}
          alt={monster.name}
        />
      </div>
      {monster.name}
      <br />
      Lv.{monster.level}
    </div>
  );
};
