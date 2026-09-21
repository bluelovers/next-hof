/**
 * BattlePage 戰鬥編成頁面
 * BattlePage component
 *
 * 狩獵編成畫面 — 選取出戰角色與確認怪物資訊
 * Battle formation screen — select party members and review monster info
 *
 * 原始網頁對照 / Original page reference:
 * - 對應 BASE_URL 下的 /battle/common?land=gb0（見 #/components/config/AppConfig）
 * - 結構：地區標題 → Teams → 角色列表(checkbox) → 按鈕 → SaveParty → hr → 怪物列表
 */
import React, { useState } from 'react';
import { GameLayout } from './GameLayout';
import { CharacterCard } from '#/components/characters/CharacterCard';
import type { IBattleCharacterData } from '#/components/characters/CharacterTypes';
import { MonsterCard } from '#/components/monsters/MonsterCard';
import type { IMonsterData } from '#/components/monsters/MonsterTypes';
import { buildCharacterImageUrl, buildCharacterUrl } from '#/components/characters/characterUtils';

/** SharedBase.css 提供 clearfix 等工具類 */
/** SharedBase.css provides utility classes like clearfix */
import '#/components/shared/SharedBase.css';
import './BattlePage.css';

/** BattlePage 屬性 / BattlePage props */
export interface IBattlePageProps {
  /** 地區標題 / Area title (e.g. "ゴブリンと遊ぶ(最弱)") */
  areaTitle?: string;
  /** 角色列表 / Character list */
  characters: IBattleCharacterData[];
  /** 怪物列表 / Monster list */
  monsters: IMonsterData[];
  /** 儲存隊伍勾選狀態 / Save party checkbox state */
  savePartyChecked?: boolean;
  /** 角色勾選回調 / Character selection callback */
  onSelectCharacter?: (id: string, checked: boolean) => void;
  /** Battle 按鈕點擊回調 / Battle button click callback */
  onBattle?: () => void;
  /** Reset 按鈕點擊回調 / Reset button click callback */
  onReset?: () => void;
  /** 儲存隊伍勾選回調 / Save party toggle callback */
  onSaveParty?: (checked: boolean) => void;
}

/**
 * 預設角色清單（對應原始站 data）
 * Default character list (matching original site data)
 */
const DEFAULT_CHARACTERS: IBattleCharacterData[] = [
  { id: '1', name: '名探偵',     imageUrl: buildCharacterImageUrl('m_chr30101.png'), level: 1,  className: '探偵' },
  { id: '2', name: '新米錬金術師', imageUrl: buildCharacterImageUrl('f_chr03901.png'), level: 1,  className: '錬金術師' },
  { id: '3', name: '魔導剣士',     imageUrl: buildCharacterImageUrl('m_chr02901.png'), level: 1,  className: '魔導剣士' },
  { id: '4', name: '弓聖',         imageUrl: buildCharacterImageUrl('f_chr04201.png'), level: 137, className: '弓聖' },
];

/**
 * 預設怪物清單（對應原始站 gb0 地區數據）
 * Default monster list (matching original gb0 area data)
 */
const DEFAULT_MONSTERS: IMonsterData[] = [
  { name: 'GoblinAxe',  imageUrl: buildCharacterImageUrl('mon_053.png'), level: 1, landType: 'grass' },
  { name: 'GoblinMage', imageUrl: buildCharacterImageUrl('mon_052.png'), level: 1, landType: 'grass' },
];

/**
 * BattlePage 戰鬥編成頁面
 * BattlePage component
 */
export const BattlePage: React.FC<IBattlePageProps> = ({
  areaTitle = 'ゴブリンと遊ぶ(最弱)',
  characters = DEFAULT_CHARACTERS,
  monsters = DEFAULT_MONSTERS,
  savePartyChecked,
  onSelectCharacter,
  onBattle,
  onReset,
  onSaveParty,
}) => {
  return (
    <div className="battle-page">
      <GameLayout>
        {/** 地區標題 / Area title */}
        <h4>{areaTitle}</h4>

        {/** 隊伍標題與角色列表 / Team title & character list */}
        <h4>Teams</h4>
        <div className="battle-characters">
          {characters.map((character, index) => (
            <CharacterCard
              key={character.id}
              character={character}
              index={index}
              selection="checkbox"
              avatarHref={buildCharacterUrl(character.id)}
              onActiveChange={onSelectCharacter}
            />
          ))}
        </div>
        <div className="clearfix"> </div>

        {/** 動作按鈕 / Action buttons */}
        <input
          type="submit"
          className="btn"
          name="monster_battle"
          value="Battle !"
          onClick={onBattle}
        />
        <input
          type="reset"
          className="btn"
          value="Reset"
          onClick={onReset}
        />
        <br />

        {/** 儲存隊伍 / Save party */}
        <label className="battle-save-label">
          Save this party:
          <input
            type="checkbox"
            name="memory_party"
            value="1"
            checked={savePartyChecked}
            onChange={(e) => onSaveParty?.(e.target.checked)}
          />
        </label>
        <br />

        {/** 分隔線 / Separator */}
        <hr />

        {/** 怪物標題與列表 / Monster title & list */}
        <h4>MonsterAppearance</h4>
        {monsters.map((monster, index) => (
          <MonsterCard
            key={`${monster.name}-${index}`}
            monster={monster}
          />
        ))}
      </GameLayout>
    </div>
  );
};
