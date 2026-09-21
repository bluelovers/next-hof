/**
 * CharacterCard (checkbox 模式) Storybook 故事
 * CharacterCard (checkbox mode) Storybook stories
 *
 * 展示 selection="checkbox" 的戰鬥編成角色卡片
 * Showcases CharacterCard in checkbox mode for battle formation
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MUTED_TEXT_COLOR, CardDarkDecorator } from '../../decorators';
import { CharacterCard } from '../../../src/components/characters/CharacterCard';
import { buildCharacterUrl } from '../../../src/components/characters/characterUtils';

const IMG = '/image/char';

const meta: Meta<typeof CharacterCard> = {
  title: 'Characters/CharacterCard (Checkbox)',
  component: CharacterCard,
  parameters: {
    docs: {
      description: {
        component:
          'CharacterCard checkbox 模式（selection="checkbox"）。用於戰鬥編成等多選場景。\n'
          + 'CharacterCard in checkbox mode (selection="checkbox"). For multi-select scenarios like battle formation.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [CardDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** 未勾選 / Unchecked */
export const Unchecked: Story = {
  args: {
    index: 0,
    selection: 'checkbox',
    character: {
      id: 'char-uncheck',
      name: 'Mage1',
      imageUrl: `${IMG}/mon_018.png`,
      level: 3,
      className: 'Sorceress',
      hasStar: true,
      active: false,
    },
    onActiveChange: (id, active) => console.log(`${id} → ${active}`),
  },
};

/** 已勾選 / Checked */
export const Checked: Story = {
  args: {
    index: 1,
    selection: 'checkbox',
    character: {
      id: 'char-check',
      name: 'Healer1',
      imageUrl: `${IMG}/mon_214.png`,
      level: 5,
      className: 'Priestess',
      hasStar: true,
      active: true,
    },
    onActiveChange: (id, active) => console.log(`${id} → ${active}`),
  },
};

/** 勾選對比 / Check compare */
export const CheckCompare: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div>
        <CharacterCard
          index={0}
          selection="checkbox"
          character={{
            id: 'uncheck',
            name: 'Unchecked',
            imageUrl: `${IMG}/mon_018.png`,
            level: 1,
            className: 'Novice',
            active: false,
          }}
        />
        <p style={{ textAlign: 'center', color: MUTED_TEXT_COLOR, marginTop: 4 }}>
          未勾選
        </p>
      </div>
      <div>
        <CharacterCard
          index={1}
          selection="checkbox"
          character={{
            id: 'checked',
            name: 'Checked',
            imageUrl: `${IMG}/mon_079.png`,
            level: 5,
            className: 'Warrior',
            hasStar: true,
            active: true,
          }}
        />
        <p style={{ textAlign: 'center', color: MUTED_TEXT_COLOR, marginTop: 4 }}>
          已勾選
        </p>
      </div>
    </div>
  ),
};

/** 帶連結底座 + checkbox / Linked pedestal + checkbox */
export const WithLink: Story = {
  args: {
    index: 0,
    selection: 'checkbox',
    character: {
      id: 'char-link',
      name: 'LinkedChar',
      imageUrl: `${IMG}/mon_079.png`,
      level: 10,
      className: 'Warrior',
      hasStar: true,
      active: false,
    },
    avatarHref: buildCharacterUrl('char-link'),
    onActiveChange: (id, active) => console.log(`${id} → ${active}`),
  },
  parameters: {
    docs: {
      description: {
        story: '傳入 avatarHref 自動加連結 + selection="checkbox" 多選模式。\nPass avatarHref for auto-link + checkbox multi-select.',
      },
    },
  },
};
