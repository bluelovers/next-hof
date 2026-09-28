/**
 * BattleSegmentStatus 個別展示
 * BattleSegmentStatus individual showcase
 *
 * 分段 HP/SP 狀態欄（左右兩隊單位＋選填精靈），並示範以開關控制：
 * - showTeamSprite：隊伍（側）精靈顯示與否
 * - showUnitSprites：各單位精靈顯示與否
 * - showHpBars／showSpBars：HP／SP 條顯示與否
 *
 * 展示資料集中於 fixture。
 * Per-segment HP/SP status column (both teams' units + optional sprites),
 * demonstrating the display toggles (showcase data lives in the fixture).
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeDarkDecorator } from '../decorators';
import { BattleSegmentStatus } from '../../src/components/battle/BattleSegmentStatus';
import { segmentLeftUnits, segmentRightUnits } from '../fixture/battleUnits';

/** 深色裝飾器（狀態欄兩欄並排，給 600px 寬）/ Dark decorator (two side-by-side columns, 600px wide) */
const SegmentStatusDarkDecorator = makeDarkDecorator({ width: '600px' });

const meta: Meta<typeof BattleSegmentStatus> = {
	title: 'Battle/Atoms/BattleSegmentStatus',
	component: BattleSegmentStatus,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'分段 HP/SP 狀態欄；showTeamSprite／showUnitSprites 可各自控制隊伍精靈與單位精靈的顯示。\n' +
					'Per-segment HP/SP status column; showTeamSprite / showUnitSprites independently control the team sprite and unit sprites.',
			},
		},
	},
	tags: ['autodocs'],
	decorators: [SegmentStatusDarkDecorator],
	argTypes: {
		showTeamSprite: { control: 'boolean', description: '是否顯示隊伍（側）精靈 / Show the team (side) sprite' },
		showUnitSprites: { control: 'boolean', description: '是否顯示單位精靈 / Show each unit sprite' },
		showHpBars: { control: 'boolean', description: '是否顯示 HP 條 / Show HP bars' },
		showSpBars: { control: 'boolean', description: '是否顯示 SP 條 / Show SP bars' },
	},
	args: {
		leftUnits: segmentLeftUnits,
		rightUnits: segmentRightUnits,
		showTeamSprite: true,
		showUnitSprites: true,
		showHpBars: true,
		showSpBars: true,
	},
};

export default meta;
type Story = StoryObj<typeof BattleSegmentStatus>;

/** 隊伍精靈＋單位精靈皆顯示（預設，可用控制列切換）/ Both team and unit sprites shown (default; toggle via the controls panel) */
export const AllSprites: Story = {};

/** 兩種精靈皆隱藏（showTeamSprite/showUnitSprites = false）/ Both sprites hidden (showTeamSprite / showUnitSprites = false) */
export const NoSprites: Story = {
	args: {
		showTeamSprite: false,
		showUnitSprites: false,
	},
};

/** 只顯示單位精靈（隊伍精靈關閉）/ Only unit sprites (team sprite off) */
export const UnitSpritesOnly: Story = {
	args: {
		showTeamSprite: false,
		showUnitSprites: true,
	},
};

/** 只顯示隊伍精靈（單位精靈關閉）/ Only the team sprite (unit sprites off) */
export const TeamSpriteOnly: Story = {
	args: {
		showTeamSprite: true,
		showUnitSprites: false,
	},
};