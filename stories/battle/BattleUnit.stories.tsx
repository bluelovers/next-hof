/**
 * BattleUnit 個別展示
 * BattleUnit individual showcase
 *
 * 單一戰鬥單位的 HP/SP 狀態條（展示資料集中於 fixture）
 * Individual battle unit HP/SP status bars (showcase data lives in the fixture)
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleUnitDarkDecorator } from '../decorators';
import { BattleUnit } from '../../src/components/battle/BattleUnit';
import type { IBattleUnit } from '../../src/components/battle/types';
import {
	fullHealthUnit,
	lowHealthUnit,
	nearDeathUnit,
	downedUnit,
	castingUnit,
	lowSpUnit,
	highLevelEnemyUnit,
} from '../fixture/battleUnits';

const meta: Meta<typeof BattleUnit> = {
	title: 'Battle/Atoms/BattleUnit',
	component: BattleUnit,
	parameters: {
		layout: 'centered',
		docs: { description: { component: '單一戰鬥單位的 HP/SP 狀態條。\nIndividual battle unit HP/SP status bars.' } },
	},
	tags: ['autodocs'],
	decorators: [BattleUnitDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof BattleUnit>;
type StoryArgs = { unit: IBattleUnit };

/** 滿血滿 SP 的單位 / Full HP and SP */
export const FullHealth: Story = {
	args: {
		unit: fullHealthUnit,
	} as StoryArgs,
};

/** 低血量單位 / Low HP */
export const LowHealth: Story = {
	args: {
		unit: lowHealthUnit,
	} as StoryArgs,
};

/** 瀕死單位 / Near death */
export const NearDeath: Story = {
	args: {
		unit: nearDeathUnit,
	} as StoryArgs,
};

/** 陣亡單位 / Downed unit */
export const Downed: Story = {
	args: {
		unit: downedUnit,
	} as StoryArgs,
};

/** 詠唱中 / Casting */
export const Casting: Story = {
	args: {
		unit: castingUnit,
	} as StoryArgs,
};

/** SP 不足 / Low SP */
export const LowSP: Story = {
	args: {
		unit: lowSpUnit,
	} as StoryArgs,
};

/** 高等級敵人 / High level enemy */
export const HighLevelEnemy: Story = {
	args: {
		unit: highLevelEnemyUnit,
	} as StoryArgs,
};