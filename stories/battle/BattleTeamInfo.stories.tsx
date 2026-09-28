/**
 * BattleTeamInfo 個別展示
 * BattleTeamInfo individual showcase
 *
 * 隊伍標頭資訊：隊伍名稱、等級總和、平均等級、總 HP（展示資料集中於 fixture）
 * Team header info: name, total level, average level, total HP (showcase data lives in
 * the fixture)
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleTeamInfoDarkDecorator } from '../decorators';
import { BattleTeamInfo } from '../../src/components/battle/BattleTeamInfo';
import { EnumTeamSideClass } from '../../src/components/battle/enums';
import {
	goblinTeamInfo,
	testTeamInfo,
	championTeamInfo,
} from '../fixture/battleUnits';

const meta: Meta<typeof BattleTeamInfo> = {
	title: 'Battle/Atoms/BattleTeamInfo',
	component: BattleTeamInfo,
	parameters: {
		layout: 'centered',
		docs: { description: { component: '隊伍標頭資訊：隊伍名稱、等級總和、平均等級、總 HP。\nTeam header info: name, total level, average level, total HP.' } },
	},
	tags: ['autodocs'],
	decorators: [BattleTeamInfoDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof BattleTeamInfo>;

/** ゴブリン隊伍 / Goblin team */
export const GoblinTeam: Story = {
	args: {
		...goblinTeamInfo,
		sideClass: EnumTeamSideClass.Ttd2,
	},
};

/** TestTeam / Test team */
export const TestTeam: Story = {
	args: {
		...testTeamInfo,
		sideClass: EnumTeamSideClass.Ttd1,
	},
};

/** 高階玩家隊伍 / High level player team */
export const HighLevelTeam: Story = {
	args: {
		...championTeamInfo,
		sideClass: EnumTeamSideClass.Ttd1,
	},
};