/**
 * JobDetailTable Storybook 故事
 * JobDetailTable Storybook stories
 *
 * 展示職業詳細表格組件的各種狀態與配置
 * Showcases job detail table component in various states and configurations
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { JobDetailTableDarkDecorator } from '../decorators';
import { JobDetailTable } from '../../src/components/game-data/JobDetailTable';
import { baseJobs, advancedJobs } from '../fixture/gameDataJobs';
import { mixedJobs, highSkillJob } from '../fixture/jobDetailTables';

/** 背景裝飾器 — 模擬遊戲深色背景 / Dark game background decorator */
const meta: Meta<typeof JobDetailTable> = {
  title: 'GameData/JobDetailTable',
  component: JobDetailTable,
  parameters: {
    docs: {
      description: {
        component:
          '職業詳細表格組件，顯示職業詳細資料的表格容器。\nJob detail table component that handles the container for displaying job detail data.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [JobDetailTableDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ==================== 故事 ==================== */

/** 基礎職業表格 / Base jobs table */
export const BaseJobs: Story = {
  args: {
    jobs: baseJobs,
  },
  parameters: {
    docs: {
      description: {
        story:
          '僅顯示基礎職業的詳細表格。\nDetail table showing only base jobs.',
      },
    },
  },
};

/** 上級職業表格 / Advanced jobs table */
export const AdvancedJobs: Story = {
  args: {
    jobs: advancedJobs,
  },
  parameters: {
    docs: {
      description: {
        story:
          '僅顯示上級職業的詳細表格。\nDetail table showing only advanced jobs.',
      },
    },
  },
};

/** 混合職業表格 / Mixed jobs table */
export const MixedJobs: Story = {
  args: {
    jobs: mixedJobs,
  },
  parameters: {
    docs: {
      description: {
        story:
          '混合基礎職業和上級職業的詳細表格。\nDetail table mixing base and advanced jobs.',
      },
    },
  },
};

/** 單一職業表格 / Single job table */
export const SingleJob: Story = {
  args: {
    jobs: [baseJobs[0]],
  },
  parameters: {
    docs: {
      description: {
        story:
          '單一職業的詳細表格。\nDetail table for single job.',
      },
    },
  },
};

/** 高技能數量表格 / High skill count table */
export const HighSkillCount: Story = {
  args: {
    jobs: highSkillJob,
  },
  parameters: {
    docs: {
      description: {
        story:
          '包含大量技能的職業詳細表格。\nDetail table for job with many skills.',
      },
    },
  },
};

/** 空表格 / Empty table */
export const EmptyTable: Story = {
  args: {
    jobs: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          '空的職業表格。\nEmpty job table.',
      },
    },
  },
};
