/**
 * BattleCharacterCard Storybook 故事
 * BattleCharacterCard Storybook stories
 *
 * 展示戰鬥編成用的 checkbox 版角色卡片
 * Showcases the checkbox-based character card for battle formation
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MUTED_TEXT_COLOR, CardDarkDecorator } from '../../decorators';
import { BattleCharacterCard } from '../../../src/components/characters/BattleCharacterCard';

const IMG = '/image/char';

/** 背景裝飾器 — 模擬遊戲深色背景 / Dark game background decorator */
const meta: Meta<typeof BattleCharacterCard> = {
  title: 'Characters/BattleCharacterCard',
  component: BattleCharacterCard,
  parameters: {
    docs: {
      description: {
        component:
          '戰鬥編成角色卡片（checkbox 版）。和 CharacterCard 類似但使用 checkbox（可複選）。\n'
          + 'Battle formation character card (checkbox version). Similar to CharacterCard but uses checkbox (multi-select).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
  },
  decorators: [CardDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ==================== 故事 ==================== */

/** 法師未勾選 / Sorceress unchecked */
export const SorceressUnchecked: Story = {
  args: {
    index: 0,
    character: {
      id: '1',
      name: 'Mage1',
      imageUrl: `${IMG}/mon_018.png`,
      level: 3,
      className: 'Sorceress',
      hasStar: true,
      checked: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story: '法師（carpet0 背景），未勾選。\nSorceress (carpet0), unchecked.',
      },
    },
  },
};

/** 祭司已勾選 / Priestess checked */
export const PriestessChecked: Story = {
  args: {
    index: 1,
    character: {
      id: '2',
      name: 'Healer1',
      imageUrl: `${IMG}/mon_214.png`,
      level: 3,
      className: 'Priestess',
      hasStar: true,
      checked: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: '祭司（carpet1 背景），已勾選。\nPriestess (carpet1), checked.',
      },
    },
  },
};

/** 戰士未勾選無星 / Warrior unchecked no star */
export const WarriorNoStar: Story = {
  args: {
    index: 2,
    character: {
      id: '3',
      name: 'Hero1',
      imageUrl: `${IMG}/mon_079.png`,
      level: 5,
      className: 'Warrior',
      hasStar: false,
      checked: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story: '戰士（index=2→carpet0），無星標未勾選。\nWarrior, no star, unchecked.',
      },
    },
  },
};

/** 勾選對比 / Checked vs unchecked comparison */
export const CheckCompare: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div>
        <BattleCharacterCard
          index={0}
          character={{
            id: 'uncheck',
            name: 'Unchecked',
            imageUrl: `${IMG}/mon_018.png`,
            level: 1,
            className: 'Novice',
            hasStar: false,
            checked: false,
          }}
        />
        <p style={{ textAlign: 'center', color: '#5a708f', marginTop: 4 }}>
          未勾選（unselect / Dimmed）
        </p>
      </div>
      <div>
        <BattleCharacterCard
          index={1}
          character={{
            id: 'checked',
            name: 'Checked',
            imageUrl: `${IMG}/mon_079.png`,
            level: 5,
            className: 'Warrior',
            hasStar: true,
            checked: true,
          }}
        />
        <p style={{ textAlign: 'center', color: MUTED_TEXT_COLOR, marginTop: 4 }}>
          已勾選（高亮 / Highlighted）
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '未勾選（unselect 半透明）vs 已勾選（高亮）的對比。\n'
          + 'Unchecked (dimmed) vs Checked (highlighted) comparison.',
      },
    },
  },
};
