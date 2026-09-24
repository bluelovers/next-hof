/**
 * BattleSegmentStatus 個別展示
 * BattleSegmentStatus individual showcase
 *
 * 分段 HP/SP 狀態欄（左右兩隊單位＋選填精靈），並示範以開關控制：
 * - showTeamSprite：隊伍（側）精靈顯示與否
 * - showUnitSprites：各單位精靈顯示與否
 * - showHpBars／showSpBars：HP／SP 條顯示與否
 *
 * Per-segment HP/SP status column (both teams' units + optional sprites),
 * demonstrating the display toggles:
 * - showTeamSprite: show/hide the team (side) sprite
 * - showUnitSprites: show/hide each unit's sprite
 * - showHpBars / showSpBars: show/hide the HP/SP bars
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeDarkDecorator } from '../decorators';
import { BattleSegmentStatus } from '../../src/components/battle/BattleSegmentStatus';
import { EnumTeamSideUI } from '../../src/components/battle/enums';
import type { IBattleUnit } from '../../src/components/battle/types';
import { getCharSpriteUrl, getMonSpriteUrl } from '../../src/lib/showcase/sprite-map';

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
    leftUnits: [
      {
        name: 'GoblinAxe',
        level: 1,
        hp: 180,
        maxHp: 213,
        sp: 90,
        maxSp: 154,
        side: EnumTeamSideUI.Left,
        sprite: { url: getMonSpriteUrl(1000) },
      },
      {
        name: 'Slime',
        level: 2,
        hp: 213,
        maxHp: 213,
        sp: 154,
        maxSp: 154,
        side: EnumTeamSideUI.Left,
        sprite: { url: getMonSpriteUrl(1002) },
      },
    ] as IBattleUnit[],
    rightUnits: [
      {
        name: 'Hero1',
        level: 3,
        hp: 349,
        maxHp: 349,
        sp: 53,
        maxSp: 53,
        side: EnumTeamSideUI.Right,
        sprite: { url: getCharSpriteUrl(100) },
      },
      {
        name: 'Mage1',
        level: 3,
        hp: 120,
        maxHp: 159,
        sp: 112,
        maxSp: 112,
        side: EnumTeamSideUI.Right,
        sprite: { url: getCharSpriteUrl(102) },
      },
    ] as IBattleUnit[],
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
