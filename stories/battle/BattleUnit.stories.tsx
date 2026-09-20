/**
 * BattleUnit 個別展示
 * BattleUnit individual showcase
 *
 * 單一戰鬥單位的 HP/SP 狀態條
 * Individual battle unit HP/SP status bars
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeDarkDecorator } from '../decorators';
import { BattleUnit } from '../../src/components/battle/BattleUnit';
import type { IBattleUnit } from '../../src/components/battle/types';

const meta: Meta<typeof BattleUnit> = {
  title: 'Battle/Atoms/BattleUnit',
  component: BattleUnit,
  parameters: {
    layout: 'centered',
    docs: { description: { component: '單一戰鬥單位的 HP/SP 狀態條。\nIndividual battle unit HP/SP status bars.' } },
  },
  tags: ['autodocs'],
  decorators: [
    makeDarkDecorator({ padding: '20px', borderRadius: '4px', width: '300px' }),
  ],
};

export default meta;
type Story = StoryObj<typeof BattleUnit>;
type StoryArgs = { unit: IBattleUnit };

/** 滿血滿 SP 的單位 / Full HP and SP */
export const FullHealth: Story = {
  args: {
    unit: { name: 'Hero1', level: 3, hp: 349, maxHp: 349, sp: 349, maxSp: 53, side: 'left' },
  } as StoryArgs,
};

/** 低血量單位 / Low HP */
export const LowHealth: Story = {
  args: {
    unit: { name: 'Hero1', level: 3, hp: 42, maxHp: 349, sp: 180, maxSp: 53, side: 'left' },
  } as StoryArgs,
};

/** 瀕死單位 / Near death */
export const NearDeath: Story = {
  args: {
    unit: { name: 'Mage1', level: 3, hp: 1, maxHp: 159, sp: 30, maxSp: 112, side: 'left', status: 'alive' },
  } as StoryArgs,
};

/** 陣亡單位 / Downed unit */
export const Downed: Story = {
  args: {
    unit: { name: 'Healer1', level: 3, hp: 0, maxHp: 213, sp: 0, maxSp: 89, side: 'left', status: 'down' },
  } as StoryArgs,
};

/** 詠唱中 / Casting */
export const Casting: Story = {
  args: {
    unit: { name: 'Mage1', level: 3, hp: 159, maxHp: 159, sp: 80, maxSp: 112, side: 'left', status: 'casting' },
  } as StoryArgs,
};

/** SP 不足 / Low SP */
export const LowSP: Story = {
  args: {
    unit: { name: 'Priest1', level: 3, hp: 213, maxHp: 213, sp: 5, maxSp: 89, side: 'left' },
  } as StoryArgs,
};

/** 高等級敵人 / High level enemy */
export const HighLevelEnemy: Story = {
  args: {
    unit: { name: 'GoblinWarrior(A)', level: 4, hp: 263, maxHp: 263, sp: 200, maxSp: 174, side: 'right' },
  } as StoryArgs,
};
