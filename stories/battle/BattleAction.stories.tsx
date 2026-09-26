/**
 * BattleAction 個別展示
 * BattleAction individual showcase
 *
 * 各種戰鬥行動/技能的日誌條目
 * Various battle action/skill log entry types
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleActionDarkDecorator } from '../decorators';
import { BattleAction } from '../../src/components/battle/BattleAction';
import type { IBattleAction } from '../../src/components/battle/types';
import {
  buildDamageMessage,
  buildHealMessage,
} from '#/components/battle/battleUtils';

const meta: Meta<typeof BattleAction> = {
  title: 'Battle/Atoms/BattleAction',
  component: BattleAction,
  parameters: {
    layout: 'centered',
    docs: { description: { component: '單一戰鬥行動的日誌條目，支援多種行動類型。\nSingle battle action log entry supporting multiple action types.' } },
  },
  tags: ['autodocs'],
  decorators: [BattleActionDarkDecorator],
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
      // 前後值只寫數字，兩端之間的符號（↘ 下降）由渲染端唯一組出；message 是同一件事的純文字鏡像
      // Only the numbers are written: the renderer builds the symbol between them (↘ falling)
      // once, and `message` is the plain-text mirror of the same fact
      valueChange: { from: 349, to: 167 },
      message: buildDamageMessage(182, 'Hero1'),
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

/** 召喚：GraveYard 召喚 3 隻木乃伊 / Summon: GraveYard summons 3 mummies */
export const SummonAction: Story = {
  args: {
    action: {
      type: 'summon',
      source: 'Mage1',
      skill: { name: 'GraveYard', iconUrl: '/image/icon/skill/skill_028.png' },
      summoned: [
        { name: 'Mummy', level: 10, imageUrl: '/image/char/mon_146.png' },
        { name: 'MummyPrisoner', level: 10, imageUrl: '/image/char/mon_146r.png' },
        { name: 'Mummy', level: 10, imageUrl: '/image/char/mon_146.png' },
      ],
      message: 'Mage1 GraveYard: Mummy joined to the team.',
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
      valueChange: { from: 1, to: 121 },
      message: buildHealMessage(120, 'Hero1'),
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
      <BattleAction action={{ type: 'damage', source: 'GoblinWarrior(B)', target: 'Hero1', value: 182, valueChange: { from: 349, to: 167 }, message: buildDamageMessage(182, 'Hero1'), attribute: 'dmg' } as IBattleAction} />
      <BattleAction action={{ type: 'attack', source: 'GoblinAxe', skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' }, message: 'GoblinAxe Attack', attribute: 'dmg' } as IBattleAction} />
      <BattleAction action={{ type: 'damage', source: 'GoblinAxe', target: 'Healer1', value: 44, valueChange: { from: 213, to: 169 }, message: buildDamageMessage(44, 'Healer1'), attribute: 'dmg' } as IBattleAction} />
    </div>
  ),
};
