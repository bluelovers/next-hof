/**
 * BattleTeamInfo 個別展示
 * BattleTeamInfo individual showcase
 *
 * 隊伍標頭資訊：隊伍名稱、等級總和、平均等級、總 HP
 * Team header info: name, total level, average level, total HP
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleTeamInfo } from '../src/components/BattleDisplay/BattleTeamInfo';

const meta: Meta<typeof BattleTeamInfo> = {
  title: 'Battle/Atoms/BattleTeamInfo',
  component: BattleTeamInfo,
  parameters: {
    layout: 'centered',
    docs: { description: { component: '隊伍標頭資訊：隊伍名稱、等級總和、平均等級、總 HP。\nTeam header info: name, total level, average level, total HP.' } },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <table style={{ background: '#10151b', borderCollapse: 'collapse', width: '400px' }}>
        <tbody><tr><Story /></tr></tbody>
      </table>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BattleTeamInfo>;

/** ゴブリン隊伍 / Goblin team */
export const GoblinTeam: Story = {
  args: {
    name: 'ゴブリンと遊ぶ(最弱)',
    units: [
      { name: 'GoblinWarrior(A)', level: 4, hp: 263, maxHp: 263, sp: 263, maxSp: 174, side: 'left' },
      { name: 'GoblinWarrior(B)', level: 4, hp: 263, maxHp: 263, sp: 263, maxSp: 174, side: 'left' },
      { name: 'GoblinWarrior(C)', level: 1, hp: 213, maxHp: 213, sp: 213, maxSp: 154, side: 'left' },
      { name: 'GoblinAxe', level: 1, hp: 213, maxHp: 213, sp: 213, maxSp: 154, side: 'left' },
    ],
    sideClass: 'ttd2',
  },
};

/** TestTeam / Test team */
export const TestTeam: Story = {
  args: {
    name: 'TestTeam',
    units: [
      { name: 'Hero1', level: 3, hp: 349, maxHp: 349, sp: 349, maxSp: 53, side: 'right' },
      { name: 'Mage1', level: 3, hp: 159, maxHp: 159, sp: 159, maxSp: 112, side: 'right' },
      { name: 'Healer1', level: 3, hp: 213, maxHp: 213, sp: 213, maxSp: 89, side: 'right' },
      { name: 'Priest1', level: 3, hp: 213, maxHp: 213, sp: 213, maxSp: 89, side: 'right' },
    ],
    sideClass: 'ttd1',
  },
};

/** 高階玩家隊伍 / High level player team */
export const HighLevelTeam: Story = {
  args: {
    name: 'ChampionGuild',
    units: [
      { name: 'Paladin', level: 99, hp: 9999, maxHp: 9999, sp: 5000, maxSp: 5000, side: 'right' },
      { name: 'ArchMage', level: 95, hp: 3200, maxHp: 3200, sp: 8000, maxSp: 8000, side: 'right' },
      { name: 'HighPriest', level: 90, hp: 4500, maxHp: 4500, sp: 6000, maxSp: 6000, side: 'right' },
      { name: 'Ranger', level: 88, hp: 3800, maxHp: 3800, sp: 4000, maxSp: 4000, side: 'right' },
    ],
    sideClass: 'ttd1',
  },
};
