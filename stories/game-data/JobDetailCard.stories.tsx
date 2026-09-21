/**
 * JobDetailCard 職業詳細卡片元件故事
 * JobDetailCard component stories
 *
 * 個別展示各種職業詳細資訊
 * Show various job details
 */

import type { Meta, StoryObj } from '@storybook/react';
import { JobDetailCardDarkDecorator } from '../decorators';
import { JobDetailCard } from '../../src/components/game-data/JobDetailCard';
import {
  basicJob,
  multipleSpritesJob,
  multipleSkillsJob,
  alternatingBgJob,
  longDescJob,
} from '../fixture/jobDetailCards';

/** JobDetailCard 元件設定 / JobDetailCard component settings */
const meta: Meta<typeof JobDetailCard> = {
  title: 'GameData/JobDetailCard',
  component: JobDetailCard,
  parameters: {
    // Storybook 裝飾器配置 / Storybook decorators configuration
    decorators: [JobDetailCardDarkDecorator],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本職業卡片 / Basic job card */
export const Basic: Story = {
  args: { job: basicJob },
};

/** 多精靈職業 / Job with multiple sprites */
export const MultipleSprites: Story = {
  args: { job: multipleSpritesJob },
};

/** 多技能職業 / Job with multiple skills */
export const MultipleSkills: Story = {
  args: { job: multipleSkillsJob },
};

/** 交替背景色 / With alternating background */
export const AlternatingBackground: Story = {
  args: { job: alternatingBgJob, altBg: true },
};

/** 長描述職業 / Job with long description */
export const LongDescription: Story = {
  args: { job: longDescJob },
};
