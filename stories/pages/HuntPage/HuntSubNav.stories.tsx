/**
 * HuntSubNav Storybook stories
 *
 * Showcases hunting sub-navigation component
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HuntSubNav } from '../../../src/components/navigation/HuntSubNav';

/** Dark game background decorator */
const DarkDecorator = (Story: React.FC) => (
  <div
    style={{
      backgroundColor: '#10151b',
      padding: '20px',
      minHeight: '100px',
      fontFamily: "'メイリオ', Meiryo, 'MS PGothic', Verdana, sans-serif",
      fontSize: '12px',
      color: '#bdc8d7',
    }}
  >
    <Story />
  </div>
);

const meta: Meta<typeof HuntSubNav> = {
  title: 'Pages/HuntPage/HuntSubNav',
  component: HuntSubNav,
  decorators: [DarkDecorator],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Default sub-nav with CommonMonster and UnionMonster */
export const Default: Story = {
  args: {},
};

/** Single item */
export const SingleItem: Story = {
  args: {
    items: [
      { label: 'AllMonsters', href: '/battle/list_all', active: true },
    ],
  },
};

/** Three items with second active */
export const ThreeItems: Story = {
  args: {
    items: [
      { label: 'Easy', href: '/battle/easy' },
      { label: 'Normal', href: '/battle/normal', active: true },
      { label: 'Hard', href: '/battle/hard' },
    ],
  },
};

/** Many items */
export const ManyItems: Story = {
  args: {
    items: [
      { label: 'Common', href: '/battle/common', active: true },
      { label: 'Rare', href: '/battle/rare' },
      { label: 'Elite', href: '/battle/elite' },
      { label: 'Boss', href: '/battle/boss' },
      { label: 'Event', href: '/battle/event' },
    ],
  },
};

/** Empty (no items) */
export const Empty: Story = {
  args: {
    items: [],
  },
};
