/**
 * SkillCard 技能卡片元件故事
 * SkillCard component stories
 *
 * 個別展示各種技能卡片
 * Show various skill cards
 */

import type { Meta, StoryObj } from '@storybook/react';
import { SkillCardDarkDecorator } from '../decorators';
import { SkillCard } from '../../src/components/game-data/SkillCard';
import {
  basicSkill,
  multiHitSkill,
  supportSkill,
  selfBuffSkill,
  highSPCostSkill,
  withoutIconSkill,
  longNameSkill,
} from '../fixture/skillCards';

/** SkillCard 元件設定 / SkillCard component settings */
const meta: Meta<typeof SkillCard> = {
  title: 'GameData/SkillCard',
  component: SkillCard,
  parameters: {
    // Storybook 裝飾器配置 / Storybook decorators configuration
    decorators: [SkillCardDarkDecorator],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本技能卡片 / Basic skill card */
export const Basic: Story = {
  args: { skill: basicSkill },
};

/** 多次攻擊技能 / Multi-hit skill */
export const MultiHit: Story = {
  args: { skill: multiHitSkill },
};

/** 補助技能 / Support skill */
export const Support: Story = {
  args: { skill: supportSkill },
};

/** 自我強化技能 / Self-buff skill */
export const SelfBuff: Story = {
  args: { skill: selfBuffSkill },
};

/** 高 SP 消耗技能 / High SP cost skill */
export const HighSPCost: Story = {
  args: { skill: highSPCostSkill },
};

/** 無圖標技能 / Skill without icon */
export const WithoutIcon: Story = {
  args: { skill: withoutIconSkill },
};

/** 長名稱技能 / Long name skill */
export const LongName: Story = {
  args: { skill: longNameSkill },
};
