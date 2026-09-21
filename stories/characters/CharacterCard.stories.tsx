/**
 * CharacterCard Storybook 故事
 * CharacterCard Storybook stories
 *
 * 展示統一版角色卡片：
 * - radio / checkbox 模式
 * - render prop 替換各區塊
 * - 傳 false 隱藏區塊
 * - 自訂 children
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MUTED_TEXT_COLOR, CardDarkDecorator } from '../decorators';
import { CharacterCard } from '../../src/components/characters/CharacterCard';
import type { ICharacterInfoProps } from '../../src/components/characters/CharacterCard';

const IMG = '/image/char';

const meta: Meta<typeof CharacterCard> = {
  title: 'Characters/CharacterCard',
  component: CharacterCard,
  parameters: {
    docs: {
      description: {
        component:
          '統一版角色卡片。透過 selection 切換 radio/checkbox，各區塊可 render prop 替換或傳 false 隱藏。\n'
          + 'Unified character card. Switch radio/checkbox via selection; override sections with render props or hide with false.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [CardDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ==================== 基本展示 / Basic showcase ====================

/** radio 模式（預設）/ Radio mode (default) */
export const RadioMode: Story = {
  args: {
    index: 0,
    selection: 'radio',
    character: {
      id: 'char-mage',
      name: 'Mage1',
      imageUrl: `${IMG}/mon_018.png`,
      level: 3,
      className: 'Sorceress',
      hasStar: true,
      active: false,
    },
    onActiveChange: (id, active) => console.log(`radio: ${id} → ${active}`),
  },
};

/** checkbox 模式 / Checkbox mode */
export const CheckboxMode: Story = {
  args: {
    index: 1,
    selection: 'checkbox',
    character: {
      id: 'char-healer',
      name: 'Healer1',
      imageUrl: `${IMG}/mon_214.png`,
      level: 5,
      className: 'Priestess',
      hasStar: true,
      active: true,
    },
    onActiveChange: (id, active) => console.log(`checkbox: ${id} → ${active}`),
  },
};

/** 已選取狀態 / Active state */
export const Active: Story = {
  args: {
    index: 2,
    character: {
      id: 'char-warrior',
      name: 'Hero1',
      imageUrl: `${IMG}/mon_079.png`,
      level: 10,
      className: 'Warrior',
      hasStar: true,
      active: true,
    },
  },
};

// ==================== Render Props 展示 / Render props showcase ====================

/** 自訂底座 — 帶連結 / Custom pedestal — with link */
export const WithLink: Story = {
  args: {
    index: 0,
    character: {
      id: 'char-link',
      name: 'Linked',
      imageUrl: `${IMG}/mon_079.png`,
      level: 1,
      className: 'Warrior',
    },
    avatarHref: '/char/char?char=char-link',
  },
  parameters: {
    docs: {
      description: {
        story: '傳入 avatarHref 即可在頭像自動加入超連結，無需手動複製底座。\nPass avatarHref to auto-wrap avatar with a hyperlink — no need to copy pedestal code.',
      },
    },
  },
};

/** 自訂資訊區 — 只顯示名稱 / Custom info — name only */
export const CustomInfo: Story = {
  args: {
    index: 0,
    character: {
      id: 'char-nameonly',
      name: 'SimpleChar',
      imageUrl: `${IMG}/mon_018.png`,
      level: 1,
      className: 'Novice',
      active: false,
    },
    renderInfo: ({ character, textId, highlighted, onClick }) => (
      <div id={textId} className={highlighted ? '' : 'unselect'} onClick={onClick}>
        <strong>{character.name}</strong>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '透過 renderInfo 自訂資訊區，僅顯示名稱。\nCustom info via renderInfo showing name only.',
      },
    },
  },
};

/** 隱藏選取控件 / Hide selection control */
export const NoSelection: Story = {
  args: {
    index: 0,
    character: {
      id: 'char-noselect',
      name: 'DisplayOnly',
      imageUrl: `${IMG}/mon_018.png`,
      level: 7,
      className: 'Mage',
      hasStar: true,
    },
    renderSelection: false,
  },
  parameters: {
    docs: {
      description: {
        story: '傳 renderSelection={false} 隱藏 radio/checkbox。\nPass renderSelection={false} to hide the selection control.',
      },
    },
  },
};

/** 隱藏底座 / Hide pedestal */
export const NoPedestal: Story = {
  args: {
    index: 0,
    character: {
      id: 'char-nopedestal',
      name: 'NoCarpet',
      imageUrl: `${IMG}/mon_018.png`,
      level: 1,
      className: 'Novice',
    },
    renderPedestal: false,
  },
  parameters: {
    docs: {
      description: {
        story: '傳 renderPedestal={false} 隱藏底座。\nPass renderPedestal={false} to hide the pedestal.',
      },
    },
  },
};

/** 自訂子元件 / Custom children */
export const WithChildren: Story = {
  args: {
    index: 0,
    character: {
      id: 'char-child',
      name: 'WithBadge',
      imageUrl: `${IMG}/mon_079.png`,
      level: 5,
      className: 'Warrior',
      hasStar: true,
    },
    children: (
      <div style={{ textAlign: 'center', fontSize: 10, color: '#ffcc33' }}>
        ★ VIP ★
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '透過 children 在卡片底部插入自訂內容。\nInsert custom content at the bottom via children.',
      },
    },
  },
};

// ==================== 向後兼容 / Backward compatibility ====================

/** 向後兼容 selected / Backward compat with selected */
export const BackwardSelected: Story = {
  args: {
    index: 0,
    character: {
      id: 'char-backward',
      name: 'OldAPI',
      imageUrl: `${IMG}/mon_018.png`,
      level: 1,
      className: 'Novice',
      selected: true,
    } as any,
  },
  parameters: {
    docs: {
      description: {
        story: '向後兼容：使用舊版 selected 欄位仍可正常運作。\nBackward compat: legacy selected field still works.',
      },
    },
  },
};
