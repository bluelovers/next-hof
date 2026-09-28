/**
 * BattleResult 個別展示
 * BattleResult individual showcase
 *
 * 戰鬥結果：勝利方宣告與雙方最終統計數據（展示資料集中於 fixture）
 * Battle result: winner announcement and final team statistics (showcase data lives
 * in the fixture)
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleResultDarkDecorator } from '../decorators';
import { BattleResult } from '../../src/components/battle/BattleResult';
import {
	goblinsWinResult,
	playerWinsResult,
	overwhelmingResult,
	pyrrhicResult,
} from '../fixture/battleUnits';

const meta: Meta<typeof BattleResult> = {
	title: 'Battle/Atoms/BattleResult',
	component: BattleResult,
	parameters: {
		layout: 'centered',
		docs: { description: { component: '戰鬥結果：勝利方宣告與雙方最終統計。\nBattle result: winner announcement and final statistics.' } },
	},
	tags: ['autodocs'],
	decorators: [BattleResultDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof BattleResult>;

/** ゴブリン勝利 / Goblins win */
export const GoblinsWin: Story = {
	args: goblinsWinResult,
};

/** 玩家隊伍勝利 / Player team wins */
export const PlayerWins: Story = {
	args: playerWinsResult,
};

/** 壓倒性勝利 / Overwhelming victory */
export const OverwhelmingVictory: Story = {
	args: overwhelmingResult,
};

/** 慘勝 / Pyrrhic victory */
export const PyrrhicVictory: Story = {
	args: pyrrhicResult,
};