/**
 * TeamStatus Storybook 故事
 * TeamStatus Storybook stories
 *
 * 展示隊伍狀態列的不同資料狀態
 * Showcases team status bar with various data states
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TeamStatus } from '../../src/components/info/TeamStatus';

/** 背景裝飾器 / Background decorator */
const DarkDecorator = (Story: React.FC) => (
  <div
    style={{
      backgroundColor: '#10151b',
      padding: '0',
      fontFamily: "'メイリオ', Meiryo, 'MS PGothic', Verdana, sans-serif",
    }}
  >
    <Story />
  </div>
);

const meta: Meta<typeof TeamStatus> = {
  title: 'Info/TeamStatus',
  component: TeamStatus,
  parameters: {
    docs: {
      description: {
        component:
          '隊伍狀態列，顯示隊名、資金與時間。\nTeam status bar showing team name, funds, and time.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [DarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ==================== 故事 ==================== */

/** 預設狀態 / Default state */
export const Default: Story = {
  args: {
    teamName: 'TestTeam',
    funds: 43080,
    timeCurrent: 1000,
    timeMax: 1000,
  },
  parameters: {
    docs: {
      description: {
        story:
          '預設隊伍狀態，資金 $43,080，時間 1000/1000。\nDefault team status with $43,080 funds and 1000/1000 time.',
      },
    },
  },
};

/** 資金充足 / Rich team */
export const RichTeam: Story = {
  args: {
    teamName: 'GoldMasters',
    funds: 99999999,
    timeCurrent: 980,
    timeMax: 1000,
  },
  parameters: {
    docs: {
      description: {
        story:
          '資金雄厚的隊伍。\nA team with abundant funds.',
      },
    },
  },
};

/** 資金不足 / Poor team */
export const PoorTeam: Story = {
  args: {
    teamName: 'Beggars',
    funds: 50,
    timeCurrent: 100,
    timeMax: 1000,
  },
  parameters: {
    docs: {
      description: {
        story:
          '資金與時間都所剩無幾的隊伍。\nA team with low funds and time remaining.',
      },
    },
  },
};

/** 時間耗盡 / Time depleted */
export const TimeDepleted: Story = {
  args: {
    teamName: 'LateComers',
    funds: 5000,
    timeCurrent: 0,
    timeMax: 1000,
  },
  parameters: {
    docs: {
      description: {
        story:
          '時間已耗盡的隊伍。\nA team with no time remaining.',
      },
    },
  },
};

/** 長隊名 / Long team name */
export const LongTeamName: Story = {
  args: {
    teamName: 'VeryLongTeamNameForTesting',
    funds: 1234567,
    timeCurrent: 500,
    timeMax: 1000,
  },
  parameters: {
    docs: {
      description: {
        story:
          '隊名較長時的顯示效果。\nDisplay behavior with a long team name.',
      },
    },
  },
};

/** 初始隊伍 / Starting team */
export const StartingTeam: Story = {
  args: {
    teamName: 'NewTeam',
    funds: 10000,
    timeCurrent: 1000,
    timeMax: 1000,
  },
  parameters: {
    docs: {
      description: {
        story:
          '初始隊伍狀態，資金 $10,000，時間全滿。\nStarting team with $10,000 funds and full time.',
      },
    },
  },
};
