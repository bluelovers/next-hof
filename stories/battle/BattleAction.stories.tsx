/**
 * BattleAction 個別展示
 * BattleAction individual showcase
 *
 * 各種戰鬥行動/技能的日誌條目
 * Various battle action/skill log entry types
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeDarkDecorator } from '../decorators';
import { BattleAction } from '../../src/components/battle/BattleAction';
import type { IBattleAction } from '../../src/components/battle/types';

const meta: Meta<typeof BattleAction> = {
  title: 'Battle/Atoms/BattleAction',
  component: BattleAction,
  parameters: {
    layout: 'centered',
    docs: { description: { component: '單一戰鬥行動的日誌條目，支援多種行動類型。\nSingle battle action log entry supporting multiple action types.' } },
  },
  tags: ['autodocs'],
  decorators: [
    makeDarkDecorator({
      padding: '10px',
      borderRadius: '4px',
      width: '450px',
      color: '#bdc8d7',
      fontSize: '12px',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof BattleAction>;
type StoryArgs = { action: IBattleAction };

/** 技能攻擊：FatalStab / Skill attack: FatalStab */
export const SkillAttack: Story = {
  args: {
    action: {
      type: 'skill',
      source: 'GoblinWarrior(B)',
      skill: { name: 'FatalStab', iconUrl: '/image/icon/skill/skill_074z.png' },
      message: 'GoblinWarrior(B) FatalStab',
      attribute: 'dmg',
    },
  } as StoryArgs,
};

/** 普通攻擊 / Normal attack */
export const NormalAttack: Story = {
  args: {
    action: {
      type: 'attack',
      source: 'GoblinAxe',
      skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' },
      message: 'GoblinAxe Attack',
      attribute: 'dmg',
    },
  } as StoryArgs,
};

/** 傷害 / Damage */
export const DamageDealt: Story = {
  args: {
    action: {
      type: 'damage',
      source: 'GoblinWarrior(B)',
      target: 'Hero1',
      value: 182,
      valueChange: '349 > 167',
      message: '182 Damage to Hero1(349 > 167)',
      attribute: 'dmg',
    },
  } as StoryArgs,
};

/** 保護 / Protect */
export const ProtectAction: Story = {
  args: {
    action: {
      type: 'protect',
      source: 'Hero1',
      target: 'Priest1',
      message: 'Hero1 protected Priest1!',
      attribute: 'support',
    },
  } as StoryArgs,
};

/** 單位入場 / Unit entrance */
export const UnitEntrance: Story = {
  args: {
    action: {
      type: 'enter',
      source: 'GoblinWarrior(A)',
      message: 'GoblinWarrior(A) Lv.4 enter the Battlefield.',
      attribute: 'normal',
    },
  } as StoryArgs,
};

/** 詠唱 / Casting */
export const CastingAction: Story = {
  args: {
    action: {
      type: 'casting',
      source: 'Mage1',
      message: 'Mage1 start casting.',
      attribute: 'charge',
    },
  } as StoryArgs,
};

/** 單位陣亡 / Unit down */
export const UnitDown: Story = {
  args: {
    action: {
      type: 'down',
      source: 'Mage1',
      message: 'Mage1 down.',
      attribute: 'dmg',
    },
  } as StoryArgs,
};

/** 回復 / Heal */
export const HealAction: Story = {
  args: {
    action: {
      type: 'heal',
      source: 'Priest1',
      target: 'Hero1',
      value: 120,
      valueChange: '1 > 121',
      message: '120 Heal to Hero1(1 > 121)',
      attribute: 'recover',
    },
  } as StoryArgs,
};

/** 多行日誌範例展示 / Multiple log entries example */
export const LogSequence: Story = {
  render: () => (
    <div>
      <BattleAction action={{ type: 'skill', source: 'GoblinWarrior(B)', skill: { name: 'FatalStab', iconUrl: '/image/icon/skill/skill_074z.png' }, message: 'GoblinWarrior(B) FatalStab', attribute: 'dmg' } as IBattleAction} />
      <BattleAction action={{ type: 'protect', source: 'Hero1', target: 'Priest1', message: 'Hero1 protected Priest1!', attribute: 'support' } as IBattleAction} />
      <BattleAction action={{ type: 'damage', source: 'GoblinWarrior(B)', target: 'Hero1', value: 182, valueChange: '349 > 167', message: '182 Damage to Hero1(349 > 167)', attribute: 'dmg' } as IBattleAction} />
      <BattleAction action={{ type: 'attack', source: 'GoblinAxe', skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' }, message: 'GoblinAxe Attack', attribute: 'dmg' } as IBattleAction} />
      <BattleAction action={{ type: 'damage', source: 'GoblinAxe', target: 'Healer1', value: 44, valueChange: '213 > 169', message: '44 Damage to Healer1(213 > 169)', attribute: 'dmg' } as IBattleAction} />
    </div>
  ),
};
