/**
 * CharacterList Storybook 故事
 * CharacterList Storybook stories
 *
 * 展示角色列表容器（自動 carpet0/carpet1 交替）
 * Showcases character list (auto carpet0/carpet1 alternation)
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CharacterList } from '../../src/components/characters/CharacterList';
import type { ICharacterData } from '../../src/components/characters/CharacterTypes';

const IMAGE_BASE = '/image/char';

/** 背景裝飾器 / Background decorator */
const DarkDecorator = (Story: React.FC) => (
  <div
    style={{
      backgroundColor: '#10151b',
      padding: '20px',
      minHeight: '300px',
      fontFamily: "'メイリオ', Meiryo, 'MS PGothic', Verdana, sans-serif",
    }}
  >
    <Story />
  </div>
);

const meta: Meta<typeof CharacterList> = {
  title: 'Characters/CharacterList',
  component: CharacterList,
  parameters: {
    docs: {
      description: {
        component:
          '角色列表容器。自動傳遞 index 給每個 CharacterCard 實現 carpet0/carpet1 交替。\nCharacter list container. Auto-passes index to each CharacterCard for carpet0/carpet1 alternation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSelect: { action: 'selected' },
  },
  decorators: [DarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ==================== 角色資料定義 / Character data definitions ==================== */

const MAGE: ICharacterData = {
  id: 'char-1',
  name: 'Mage1',
  imageUrl: `${IMAGE_BASE}/mon_018.png`,
  level: 3,
  className: 'Sorceress',
  hasStar: true,
  selected: false,
};

const HEALER: ICharacterData = {
  id: 'char-2',
  name: 'Healer1',
  imageUrl: `${IMAGE_BASE}/mon_214.png`,
  level: 3,
  className: 'Priestess',
  hasStar: true,
  selected: false,
};

const HERO: ICharacterData = {
  id: 'char-3',
  name: 'Hero1',
  imageUrl: `${IMAGE_BASE}/mon_079.png`,
  level: 3,
  className: 'Warrior',
  hasStar: true,
  selected: false,
};

const PRIEST: ICharacterData = {
  id: 'char-4',
  name: 'Priest1',
  imageUrl: `${IMAGE_BASE}/mon_214.png`,
  level: 3,
  className: 'Priestess',
  hasStar: true,
  selected: false,
};

const BERSERKER: ICharacterData = {
  id: 'char-5',
  name: 'Berserker1',
  imageUrl: `${IMAGE_BASE}/mon_079.png`,
  level: 5,
  className: 'Berserker',
  hasStar: true,
  selected: false,
};

const ARCHER: ICharacterData = {
  id: 'char-6',
  name: 'Archer1',
  imageUrl: `${IMAGE_BASE}/mon_018.png`,
  level: 2,
  className: 'Archer',
  hasStar: false,
  selected: false,
};

/** ==================== 故事 ==================== */

/** 四人隊伍（carpet0,1,0,1 交替）/ Four members */
export const FourMemberTeam: Story = {
  args: {
    characters: [MAGE, HEALER, HERO, PRIEST],
  },
  parameters: {
    docs: {
      description: {
        story:
          '4 人隊伍：carpet0 → Mage1, carpet1 → Healer1, carpet0 → Hero1, carpet1 → Priest1 交替展示。\n4 members: carpet0→Mage1, carpet1→Healer1, carpet0→Hero1, carpet1→Priest1 alternation.',
      },
    },
  },
};

/** 五人滿編 / Five members full team */
export const FiveMemberTeam: Story = {
  args: {
    characters: [MAGE, HEALER, HERO, PRIEST, BERSERKER],
  },
  parameters: {
    docs: {
      description: {
        story:
          '5 人完整隊伍（carpet0,1,0,1,0 交替）。\nComplete team of 5 (carpet0,1,0,1,0 alternation).',
      },
    },
  },
};

/** 已選取第三位 / Third character selected */
export const ThirdSelected: Story = {
  args: {
    characters: [MAGE, HEALER, HERO, PRIEST].map((c, i) => ({
      ...c,
      selected: i === 2,
    })),
  },
  parameters: {
    docs: {
      description: {
        story:
          '第三位角色 Hero1 為選取狀態（高亮文字）。\nThird character Hero1 selected (highlighted text).',
      },
    },
  },
};

/** 只有一人 / Solo member */
export const SoloMember: Story = {
  args: {
    characters: [HERO],
  },
  parameters: {
    docs: {
      description: {
        story:
          '只有一名角色（carpet0）。\nSolo character (carpet0).',
      },
    },
  },
};

/** 空隊伍 / Empty team */
export const EmptyTeam: Story = {
  args: {
    characters: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          '空隊伍。\nEmpty team.',
      },
    },
  },
};

/** 無星標隊伍 / No star markers */
export const NoStarTeam: Story = {
  args: {
    characters: [
      { ...ARCHER },
      {
        id: 'char-7',
        name: 'Novice1',
        imageUrl: `${IMAGE_BASE}/mon_214.png`,
        level: 1,
        className: 'Novice',
        hasStar: false,
        selected: false,
      },
      {
        id: 'char-8',
        name: 'Novice2',
        imageUrl: `${IMAGE_BASE}/mon_018.png`,
        level: 1,
        className: 'Novice',
        hasStar: false,
        selected: false,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '全部無星標的新手角色（carpet0,1,0 交替）。\nNovices without star markers (carpet0,1,0 alternation).',
      },
    },
  },
};
