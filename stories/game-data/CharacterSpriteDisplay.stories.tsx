/**
 * CharacterSpriteDisplay Storybook 故事
 * CharacterSpriteDisplay Storybook stories
 *
 * 展示角色精靈顯示組件的各種狀態與配置
 * Showcases character sprite display component in various states and configurations
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeDarkDecorator, makeScaleDecorator } from '../decorators';
import { CharacterSpriteDisplay } from '../../src/components/game-data/CharacterSpriteDisplay';

/** 圖像基礎路徑 / Image base path */
const IMG = '/image/char';

/** 背景裝飾器 — 模擬遊戲深色背景 / Dark background decorator */
const meta: Meta<typeof CharacterSpriteDisplay> = {
  title: 'GameData/CharacterSpriteDisplay',
  component: CharacterSpriteDisplay,
  parameters: {
    docs: {
      description: {
        component:
          '角色精靈顯示組件，顯示角色精靈圖片。\nCharacter sprite display component showing character sprite images.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    makeDarkDecorator({
      padding: '30px',
      minHeight: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ==================== 故事 ==================== */

/** 單一精靈 / Single sprite */
export const SingleSprite: Story = {
  args: {
    spriteUrls: [`${IMG}/mon_079.png`],
  },
  parameters: {
    docs: {
      description: {
        story:
          '單一角色精靈顯示。\nSingle character sprite display.',
      },
    },
  },
};

/** 雙精靈 / Dual sprites */
export const DualSprites: Story = {
  args: {
    spriteUrls: [`${IMG}/mon_079.png`, `${IMG}/mon_080r.png`],
  },
  parameters: {
    docs: {
      description: {
        story:
          '雙重角色精靈顯示（通常用於男女版本）。\nDual character sprite display (typically for male/female versions).',
      },
    },
  },
};

/** 多精靈 / Multiple sprites */
export const MultipleSprites: Story = {
  args: {
    spriteUrls: [`${IMG}/mon_079.png`, `${IMG}/mon_080r.png`, `${IMG}/mon_199r.png`, `${IMG}/mon_234r.png`],
  },
  parameters: {
    docs: {
      description: {
        story:
          '多重角色精靈顯示。\nMultiple character sprite display.',
      },
    },
  },
};

/** 戰士系列精靈 / Warrior series sprites */
export const WarriorSprites: Story = {
  args: {
    spriteUrls: [`${IMG}/mon_079.png`, `${IMG}/mon_080r.png`, `${IMG}/mon_199r.png`, `${IMG}/mon_234r.png`, `${IMG}/mon_100r.png`, `${IMG}/mon_012.png`],
  },
  parameters: {
    docs: {
      description: {
        story:
          '戰士系列職業的精靈集合。\nWarrior job series sprite collection.',
      },
    },
  },
};

/** 法師系列精靈 / Sorcerer series sprites */
export const SorcererSprites: Story = {
  args: {
    spriteUrls: [`${IMG}/mon_205.png`, `${IMG}/mon_206.png`, `${IMG}/mon_210.png`, `${IMG}/mon_210r.png`, `${IMG}/mon_213r.png`, `${IMG}/mon_213.png`],
  },
  parameters: {
    docs: {
      description: {
        story:
          '法師系列職業的精靈集合。\nSorcerer job series sprite collection.',
      },
    },
  },
};

/** 祭司系列精靈 / Priest series sprites */
export const PriestSprites: Story = {
  args: {
    spriteUrls: [`${IMG}/mon_214.png`, `${IMG}/mon_214r.png`, `${IMG}/mon_205.png`, `${IMG}/mon_206.png`, `${IMG}/mon_207.png`, `${IMG}/mon_208.png`],
  },
  parameters: {
    docs: {
      description: {
        story:
          '祭司系列職業的精靈集合。\nPriest job series sprite collection.',
      },
    },
  },
};

/** 弓箭手系列精靈 / Archer series sprites */
export const ArcherSprites: Story = {
  args: {
    spriteUrls: [`${IMG}/mon_214.png`, `${IMG}/mon_214r.png`, `${IMG}/mon_216.png`, `${IMG}/mon_216y.png`, `${IMG}/mon_217.png`, `${IMG}/mon_217z.png`],
  },
  parameters: {
    docs: {
      description: {
        story:
          '弓箭手系列職業的精靈集合。\nArcher job series sprite collection.',
      },
    },
  },
};

/** 自訂樣式 / Custom styling */
export const CustomStyling: Story = {
  args: {
    spriteUrls: [`${IMG}/mon_079.png`, `${IMG}/mon_080r.png`],
    className: 'custom-sprite-display',
  },
  parameters: {
    docs: {
      description: {
        story:
          '自訂 CSS 樣式的角色精靈顯示。\nCharacter sprite display with custom CSS styling.',
      },
    },
  },
};

/** 大型精靈顯示 / Large sprite display */
export const LargeSprites: Story = {
  args: {
    spriteUrls: [`${IMG}/mon_079.png`, `${IMG}/mon_080r.png`, `${IMG}/mon_199r.png`, `${IMG}/mon_234r.png`],
  },
  decorators: [makeScaleDecorator(1.5)],
  parameters: {
    docs: {
      description: {
        story:
          '放大顯示的角色精靈。\nLarge character sprite display.',
      },
    },
  },
};

/** 小型精靈顯示 / Small sprite display */
export const SmallSprites: Story = {
  args: {
    spriteUrls: [`${IMG}/mon_079.png`, `${IMG}/mon_080r.png`],
  },
  decorators: [makeScaleDecorator(0.8)],
  parameters: {
    docs: {
      description: {
        story:
          '縮小顯示的角色精靈。\nSmall character sprite display.',
      },
    },
  },
};

/** 空精靈列表 / Empty sprite list */
export const EmptySprites: Story = {
  args: {
    spriteUrls: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          '空的精靈列表顯示。\nEmpty sprite list display.',
      },
    },
  },
};