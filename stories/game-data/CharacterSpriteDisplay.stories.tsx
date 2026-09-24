/**
 * CharacterSprite Storybook 故事（原 CharacterSpriteDisplay 已合併）
 * CharacterSprite Storybook stories (merged from CharacterSpriteDisplay)
 *
 * 展示角色精靈的各種狀態與配置
 * Showcases character sprites in various states and configurations
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeScaleDecorator, CharacterSpriteDisplayDarkDecorator } from '../decorators';
import { CharacterSprite } from '../../src/components/characters/CharacterSprite';
import { EnumSpriteVariant } from '../../src/components/battle/enums';
import { EnumSpriteSize } from '../../src/components/battle/enums';

/** 圖像基礎路徑 / Image base path */
const IMG = '/image/char';

/** 背景裝飾器 — 模擬遊戲深色背景 / Dark background decorator */
const meta: Meta<typeof CharacterSprite> = {
  title: 'GameData/CharacterSprite',
  component: CharacterSprite,
  parameters: {
    docs: {
      description: {
        component:
          '角色精靈顯示組件，顯示角色精靈圖片。\nCharacter sprite display component showing character sprite images.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [CharacterSpriteDisplayDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ==================== 故事 ==================== */

/** 單一精靈（boxed） / Single sprite (boxed) */
export const SingleSprite: Story = {
  args: {
    url: `${IMG}/mon_079.png`,
    variant: EnumSpriteVariant.Boxed,
  },
  parameters: {
    docs: {
      description: {
        story:
          '單一角色精靈顯示（boxed 變體）。\nSingle character sprite display (boxed variant).',
      },
    },
  },
};

/** 女性精靈（大） / Female sprite (large) */
export const FemaleLarge: Story = {
  args: {
    url: `${IMG}/mon_080r.png`,
    variant: EnumSpriteVariant.Boxed,
    size: EnumSpriteSize.Large,
  },
  parameters: {
    docs: {
      description: {
        story:
          '女性角色精靈，大尺寸顯示。\nFemale character sprite, large size.',
      },
    },
  },
};

/** 女性精靈（小） / Female sprite (small) */
export const FemaleSmall: Story = {
  args: {
    url: `${IMG}/mon_080r.png`,
    variant: EnumSpriteVariant.Boxed,
    size: EnumSpriteSize.Small,
  },
  parameters: {
    docs: {
      description: {
        story:
          '女性角色精靈，小尺寸顯示。\nFemale character sprite, small size.',
      },
    },
  },
};

/** 無邊框精靈 / Borderless sprite */
export const BorderlessSprite: Story = {
  args: {
    url: `${IMG}/mon_079.png`,
    variant: EnumSpriteVariant.Boxed,
    border: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          '不顯示邊框的精靈。\nSprite without border.',
      },
    },
  },
};

/** 無背景精靈 / No-background sprite */
export const NoBackgroundSprite: Story = {
  args: {
    url: `${IMG}/mon_079.png`,
    variant: EnumSpriteVariant.Boxed,
    background: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          '不顯示背景的精靈。\nSprite without background.',
      },
    },
  },
};

/** 大型精靈顯示 / Large sprite display */
export const LargeSprites: Story = {
  args: {
    url: `${IMG}/mon_079.png`,
    variant: EnumSpriteVariant.Boxed,
    size: EnumSpriteSize.Large,
  },
  decorators: [makeScaleDecorator({ scale: 1.5 })],
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
    url: `${IMG}/mon_079.png`,
    variant: EnumSpriteVariant.Boxed,
    size: EnumSpriteSize.Small,
  },
  decorators: [makeScaleDecorator({ scale: 0.8 })],
  parameters: {
    docs: {
      description: {
        story:
          '縮小顯示的角色精靈。\nSmall character sprite display.',
      },
    },
  },
};
