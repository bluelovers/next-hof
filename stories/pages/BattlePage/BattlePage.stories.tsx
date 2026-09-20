/**
 * BattlePage Storybook 故事
 * BattlePage Storybook stories
 *
 * 展示戰鬥編成頁面（狩獵準備畫面）
 * Showcases the battle formation page (hunt preparation screen)
 */
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeDarkDecorator } from '../../decorators';
import { BattlePage } from '../../../src/components/pages/BattlePage';
import type { IBattleCharacterData } from '../../../src/components/characters/CharacterTypes';
import type { IMonsterData } from '../../../src/components/monsters/MonsterTypes';

const IMG = '/image/char';

/** 背景裝飾器 / Dark game background decorator */
const meta: Meta<typeof BattlePage> = {
  title: 'Pages/BattlePage',
  component: BattlePage,
  parameters: {
    docs: {
      description: {
        component:
          '戰鬥編成頁面。選取出戰角色、確認怪物資訊後按下 Battle 開始戰鬥。\n'
          + 'Battle formation page. Select party members, review monster info, then press Battle to start.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    makeDarkDecorator({
      padding: '20px',
      minHeight: '400px',
      fontSize: '12px',
      color: '#bdc8d7',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** 預設角色清單 / Default character list */
const DEFAULT_CHARACTERS: IBattleCharacterData[] = [
  { id: '1', name: '名探偵',     imageUrl: `${IMG}/m_chr30101.png`, level: 1,  className: '探偵' },
  { id: '2', name: '新米錬金術師', imageUrl: `${IMG}/f_chr03901.png`, level: 1,  className: '錬金術師' },
  { id: '3', name: '魔導剣士',     imageUrl: `${IMG}/m_chr02901.png`, level: 1,  className: '魔導剣士' },
  { id: '4', name: '弓聖',         imageUrl: `${IMG}/f_chr04201.png`, level: 137, className: '弓聖' },
];

/** 預設怪物清單 / Default monster list */
const DEFAULT_MONSTERS: IMonsterData[] = [
  { name: 'GoblinAxe',  imageUrl: `${IMG}/mon_053.png`, level: 1, landType: 'grass' },
  { name: 'GoblinMage', imageUrl: `${IMG}/mon_052.png`, level: 1, landType: 'grass' },
];

/** ==================== 故事 ==================== */

/** 預設頁面 / Default page */
export const Default: Story = {
  render: () => {
    const [characters, setCharacters] = useState(DEFAULT_CHARACTERS);
    const [saveChecked, setSaveChecked] = useState(false);

    const handleSelectCharacter = (id: string, checked: boolean) => {
      setCharacters((prev) =>
        prev.map((c) => (c.id === id ? { ...c, checked } : c))
      );
    };

    return (
      <BattlePage
        characters={characters}
        monsters={DEFAULT_MONSTERS}
        savePartyChecked={saveChecked}
        onSelectCharacter={handleSelectCharacter}
        onSaveParty={setSaveChecked}
        onBattle={() => alert('Battle 開始！（此為 Storybook 示意）')}
        onReset={() => {
          setCharacters(DEFAULT_CHARACTERS.map((c) => ({ ...c, checked: false })));
          setSaveChecked(false);
        }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '預設戰鬥編成頁面（ゴブリンと遊ぶ(最弱)）。角色可多選、支援儲存隊伍勾選。\n'
          + 'Default battle formation page. Multi-select characters, supports save party checkbox.',
      },
    },
  },
};

/** 部分選取 / Partially selected */
export const PartiallySelected: Story = {
  render: () => {
    const [characters, setCharacters] = useState<IBattleCharacterData[]>(
      DEFAULT_CHARACTERS.map((c) =>
        c.id === '1' || c.id === '3' ? { ...c, checked: true } : c
      )
    );
    const [saveChecked, setSaveChecked] = useState(true);

    return (
      <BattlePage
        characters={characters}
        monsters={DEFAULT_MONSTERS}
        savePartyChecked={saveChecked}
        onSelectCharacter={(id, checked) => {
          setCharacters((prev) =>
            prev.map((c) => (c.id === id ? { ...c, checked } : c))
          );
        }}
        onSaveParty={setSaveChecked}
        onBattle={() => alert('Battle 開始！')}
        onReset={() => {
          setCharacters(DEFAULT_CHARACTERS.map((c) => ({ ...c, checked: false })));
          setSaveChecked(false);
        }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '部分角色已勾選（名探偵 + 魔導剣士），Save party 已勾選。\n'
          + 'Partially selected (名探偵 + 魔導剣士), Save party checked.',
      },
    },
  },
};

/** 冰山地圖 / Snow mountain map */
export const SnowMountain: Story = {
  render: () => {
    const monsters: IMonsterData[] = [
      { name: 'IceWolf',  imageUrl: `${IMG}/mon_053.png`, level: 10, landType: 'snow' },
      { name: 'SnowBear', imageUrl: `${IMG}/mon_052.png`, level: 12, landType: 'snow' },
      { name: 'Penguin',  imageUrl: `${IMG}/mon_079.png`, level: 8,  landType: 'snow' },
    ];

    return (
      <BattlePage
        areaTitle="雪山の狩猟（寒冷地帯）"
        characters={DEFAULT_CHARACTERS}
        monsters={monsters}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: '冰山雪地地圖的編成頁面。\nSnow mountain map formation page.',
      },
    },
  },
};

/** 洞穴地圖 / Cave map */
export const CaveMap: Story = {
  render: () => {
    const monsters: IMonsterData[] = [
      { name: 'CaveBat',   imageUrl: `${IMG}/mon_053.png`, level: 5,  landType: 'cave' },
      { name: 'DarkSlime', imageUrl: `${IMG}/mon_052.png`, level: 7,  landType: 'cave' },
    ];

    return (
      <BattlePage
        areaTitle="暗黒の洞窟（深淵）"
        characters={DEFAULT_CHARACTERS}
        monsters={monsters}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: '洞穴地圖的編成頁面（多種地形背景展示）。\nCave map formation page.',
      },
    },
  },
};
