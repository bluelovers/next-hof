/**
 * BattleResult 個別展示
 * BattleResult individual showcase
 *
 * 戰鬥結果：勝利方宣告與雙方最終統計數據
 * Battle result: winner announcement and final team statistics
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleResult } from '../src/components/BattleDisplay/BattleResult';

const meta: Meta<typeof BattleResult> = {
  title: 'Battle/Atoms/BattleResult',
  component: BattleResult,
  parameters: {
    layout: 'centered',
    docs: { description: { component: '戰鬥結果：勝利方宣告與雙方最終統計。\nBattle result: winner announcement and final statistics.' } },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ background: '#10151b', borderRadius: '4px', width: '600px' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody><Story /></tbody>
        </table>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BattleResult>;

/** ゴブリン勝利 / Goblins win */
export const GoblinsWin: Story = {
  args: {
    leftTeamName: 'ゴブリンと遊ぶ(最弱)',
    rightTeamName: 'TestTeam',
    result: {
      winner: 'ゴブリンと遊ぶ(最弱)',
      leftTeam: { hpRemain: 573, alive: 4, totalUnits: 4, totalDamage: 1384, totalExp: 4, funds: '4' },
      rightTeam: { hpRemain: 0, alive: 0, totalUnits: 4, totalDamage: 379 },
    },
  },
};

/** 玩家隊伍勝利 / Player team wins */
export const PlayerWins: Story = {
  args: {
    leftTeamName: 'DarkGoblins',
    rightTeamName: 'TestTeam',
    result: {
      winner: 'TestTeam',
      leftTeam: { hpRemain: 0, alive: 0, totalUnits: 4, totalDamage: 952 },
      rightTeam: { hpRemain: 489, alive: 3, totalUnits: 4, totalDamage: 2100, totalExp: 12, funds: '500' },
    },
  },
};

/** 壓倒性勝利 / Overwhelming victory */
export const OverwhelmingVictory: Story = {
  args: {
    leftTeamName: 'ChampionGuild',
    rightTeamName: 'SlimeSwarm',
    result: {
      winner: 'ChampionGuild',
      leftTeam: { hpRemain: 25000, alive: 5, totalUnits: 5, totalDamage: 99999, totalExp: 999, funds: '99999' },
      rightTeam: { hpRemain: 0, alive: 0, totalUnits: 8, totalDamage: 0 },
    },
  },
};

/** 慘勝 / Pyrrhic victory */
export const PyrrhicVictory: Story = {
  args: {
    leftTeamName: 'TestTeam',
    rightTeamName: 'DragonLord',
    result: {
      winner: 'TestTeam',
      leftTeam: { hpRemain: 12, alive: 1, totalUnits: 5, totalDamage: 15000, totalExp: 5000, funds: '100000' },
      rightTeam: { hpRemain: 0, alive: 0, totalUnits: 1, totalDamage: 14900 },
    },
  },
};
