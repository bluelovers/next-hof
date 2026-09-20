/**
 * CharacterCard Storybook 故事
 * CharacterCard Storybook stories
 *
 * 展示 carpet_frame 底座結構的角色卡片
 * 包含 carpet0/carpet1 交替背景、unselect/selected 狀態
 * Showcases character card with carpet_frame pedestal structure
 * Includes carpet0/carpet1 alternating backgrounds and selection states
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeDarkDecorator } from '../decorators';
import { CharacterCard } from '../../src/components/characters/CharacterCard';

const IMG = '/image/char';

/** 背景裝飾器 — 模擬遊戲深色背景 / Dark game background decorator */
const meta: Meta<typeof CharacterCard> = {
  title: 'Characters/CharacterCard',
  component: CharacterCard,
  parameters: {
    docs: {
      description: {
        component:
          '角色卡片（carpet_frame 底座）。顯示頭像、名稱、等級、職業與選取狀態。\nCharacter card (carpet_frame pedestal). Shows avatar, name, level, class, and selection.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSelect: { action: 'selected' },
  },
  decorators: [makeDarkDecorator({ padding: '30px', minHeight: '200px' })],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ==================== 故事 ==================== */

/**
 * 法師 / Mage - Sorceress (carpet0)
 * index=0 → carpet0 背景
 */
export const Sorceress: Story = {
  args: {
    index: 0,
    character: {
      id: 'char-mage-1',
      name: 'Mage1',
      imageUrl: `${IMG}/mon_018.png`,
      level: 3,
      className: 'Sorceress',
      hasStar: true,
      selected: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '法師（carpet0 背景），附帶星標記。\nSorceress (carpet0 background) with star marker.',
      },
    },
  },
};

/**
 * 補師 / Healer - Priestess (carpet1)
 * index=1 → carpet1 背景
 */
export const Priestess: Story = {
  args: {
    index: 1,
    character: {
      id: 'char-healer-1',
      name: 'Healer1',
      imageUrl: `${IMG}/mon_214.png`,
      level: 3,
      className: 'Priestess',
      hasStar: true,
      selected: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '祭司（carpet1 背景）。\nPriestess (carpet1 background).',
      },
    },
  },
};

/**
 * 戰士 / Hero - Warrior (carpet2 → carpet0 交替)
 * index=2 → carpet0 背景（因為偶數）
 */
export const Warrior: Story = {
  args: {
    index: 2,
    character: {
      id: 'char-hero-1',
      name: 'Hero1',
      imageUrl: `${IMG}/mon_079.png`,
      level: 3,
      className: 'Warrior',
      hasStar: true,
      selected: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '戰士（index=2 → carpet0 交替）。\nWarrior (index=2 → carpet0 alternation).',
      },
    },
  },
};

/**
 * 已選取狀態 / Selected state
 * selected=true 時文字區塊無 unselect 類別 = 高亮
 */
export const Selected: Story = {
  args: {
    index: 3,
    character: {
      id: 'char-selected',
      name: 'Hero1',
      imageUrl: `${IMG}/mon_079.png`,
      level: 5,
      className: 'Warrior',
      hasStar: true,
      selected: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '已選取的角色（selected=true）：文字無 unselect 類別，呈高亮狀態，Radio 為選中。\nSelected character (selected=true): text without unselect class, highlighted, radio checked.',
      },
    },
  },
};

/**
 * 未選取 vs 已選取對比 / Compare unselected vs selected
 * 使用 render 客製化展示兩個卡片對比
 */
export const SelectionCompare: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div>
        <CharacterCard
          index={0}
          character={{
            id: 'char-unsel',
            name: 'Unselected',
            imageUrl: `${IMG}/mon_018.png`,
            level: 1,
            className: 'Novice',
            hasStar: false,
            selected: false,
          }}
        />
        <p style={{ textAlign: 'center', color: '#5a708f', marginTop: 4 }}>
          unselect（未選取 / Dimmed）
        </p>
      </div>
      <div>
        <CharacterCard
          index={1}
          character={{
            id: 'char-sel',
            name: 'Selected',
            imageUrl: `${IMG}/mon_079.png`,
            level: 5,
            className: 'Warrior',
            hasStar: true,
            selected: true,
          }}
        />
        <p style={{ textAlign: 'center', color: '#bdc8d7', marginTop: 4 }}>
          選取中（高亮 / Highlighted）
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '未選取（unselect 半透明）vs 已選取（高亮）的對比。\nUnselected (dimmed) vs Selected (highlighted) comparison.',
      },
    },
  },
};

/**
 * 高等級角色 / High level character
 */
export const HighLevel: Story = {
  args: {
    index: 0,
    character: {
      id: 'char-high',
      name: 'ArchMage',
      imageUrl: `${IMG}/mon_018.png`,
      level: 99,
      className: 'Arch Sorceress',
      hasStar: true,
      selected: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '高等級角色展示。\nHigh level character display.',
      },
    },
  },
};

/**
 * 無星標角色 / Without star marker
 */
export const WithoutStar: Story = {
  args: {
    index: 1,
    character: {
      id: 'char-nostar',
      name: 'Recruit',
      imageUrl: `${IMG}/mon_214.png`,
      level: 1,
      className: 'Novice',
      hasStar: false,
      selected: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '無星標記的新手角色。\nNovice character without star marker.',
      },
    },
  },
};
