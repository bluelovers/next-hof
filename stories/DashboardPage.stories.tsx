/**
 * DashboardPage Storybook 故事
 * DashboardPage Storybook stories
 *
 * 展示登入後首頁（含 carpet_frame 底座角色卡片）
 * Showcases post-login dashboard with carpet_frame character cards
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GameLayout } from '../src/components/GameLayout/GameLayout';
import { DashboardPage } from '../src/components/DashboardPage/DashboardPage';
import type { ICharacterData } from '../src/components/DashboardPage/atoms/CharacterCard';

const IMAGE_BASE = 'http://127.0.0.1:8085/static/image/char';

/** 使用 GameLayout 包裝的 DashboardPage / DashboardPage wrapped in GameLayout */
const DashboardWithLayout: React.FC<{
  characters?: ICharacterData[];
  teamName?: string;
  funds?: number;
  timeCurrent?: number;
  timeMax?: number;
}> = ({ characters, teamName, funds, timeCurrent, timeMax }) => (
  <GameLayout>
    <DashboardPage
      teamStatus={{ teamName, funds, timeCurrent, timeMax }}
      characters={characters}
    />
  </GameLayout>
);

const meta: Meta<typeof DashboardWithLayout> = {
  title: 'Pages/DashboardPage',
  component: DashboardWithLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Hall of Rumor 登入後的主頁面。\n'
          + '包含 NavigationBar、TeamStatus、CharacterList（carpet_frame 底座角色卡片）、Footer。\n'
          + '角色卡片使用 carpet0/carpet1 交替背景。\n\n'
          + 'Post-login dashboard. Includes NavigationBar, TeamStatus, '
          + 'CharacterList (carpet_frame pedestal), Footer. '
          + 'Character cards use carpet0/carpet1 alternating backgrounds.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DashboardWithLayout>;

/** ==================== 預設角色資料 / Default character data ==================== */

const DEFAULT_CHARACTERS: ICharacterData[] = [
  {
    id: '2f4954e7348fff17f92b46e8d72005d1',
    name: 'Mage1',
    imageUrl: `${IMAGE_BASE}/mon_018.png`,
    level: 3,
    className: 'Sorceress',
    hasStar: true,
    selected: false,
  },
  {
    id: '6ece402a38eab57ef07afff56535d6e1',
    name: 'Healer1',
    imageUrl: `${IMAGE_BASE}/mon_214.png`,
    level: 3,
    className: 'Priestess',
    hasStar: true,
    selected: true,
  },
  {
    id: 'b3e304903f09e14b8386a49a1e1e1e01e3',
    name: 'Hero1',
    imageUrl: `${IMAGE_BASE}/mon_079.png`,
    level: 3,
    className: 'Warrior',
    hasStar: true,
    selected: false,
  },
  {
    id: 'de979500692a963857ea9d68868f2958',
    name: 'Priest1',
    imageUrl: `${IMAGE_BASE}/mon_214.png`,
    level: 3,
    className: 'Priestess',
    hasStar: true,
    selected: false,
  },
];

/** ==================== 故事 ==================== */

/** 預設儀表板 / Default dashboard */
export const Default: Story = {
  args: {
    characters: DEFAULT_CHARACTERS,
    teamName: 'TestTeam',
    funds: 43080,
    timeCurrent: 1000,
    timeMax: 1000,
  },
  parameters: {
    docs: {
      description: {
        story:
          '預設狀態。4 名角色（carpet0,1,0,1 交替），資金 $43,080，時間全滿。\n'
          + 'Default state. 4 characters (carpet0,1,0,1), $43,080 funds, full time.',
      },
    },
  },
};

/** 完整五人隊伍 / Full five-member team */
export const FullTeam: Story = {
  args: {
    characters: [
      ...DEFAULT_CHARACTERS,
      {
        id: 'char-5',
        name: 'Berserker1',
        imageUrl: `${IMAGE_BASE}/mon_079.png`,
        level: 5,
        className: 'Berserker',
        hasStar: true,
        selected: false,
      },
    ],
    teamName: 'ShadowLegion',
    funds: 999999,
    timeCurrent: 850,
    timeMax: 1000,
  },
  parameters: {
    docs: {
      description: {
        story:
          '5 人滿編隊伍（carpet0,1,0,1,0 交替），資金充足。\n'
          + 'Full team of 5 (carpet0,1,0,1,0), abundant funds.',
      },
    },
  },
};

/** 新手隊伍 / Beginner team */
export const BeginnerTeam: Story = {
  args: {
    characters: [
      {
        id: 'char-b1',
        name: 'Warrior1',
        imageUrl: `${IMAGE_BASE}/mon_079.png`,
        level: 1,
        className: 'Warrior',
        hasStar: false,
        selected: true,
      },
      {
        id: 'char-b2',
        name: 'Mage1',
        imageUrl: `${IMAGE_BASE}/mon_018.png`,
        level: 1,
        className: 'Sorceress',
        hasStar: false,
        selected: false,
      },
    ],
    teamName: 'NewBeginners',
    funds: 10000,
    timeCurrent: 1000,
    timeMax: 1000,
  },
  parameters: {
    docs: {
      description: {
        story:
          '新手隊伍（carpet0,1），全部無星標。\n'
          + 'Beginner team (carpet0,1), no star markers.',
      },
    },
  },
};

/** 瀕危隊伍 / Depleted team */
export const DepletedTeam: Story = {
  args: {
    characters: [
      {
        id: 'char-d1',
        name: 'LoneHero',
        imageUrl: `${IMAGE_BASE}/mon_079.png`,
        level: 1,
        className: 'Warrior',
        hasStar: true,
        selected: true,
      },
    ],
    teamName: 'AlmostDead',
    funds: 120,
    timeCurrent: 3,
    timeMax: 1000,
  },
  parameters: {
    docs: {
      description: {
        story:
          '資源即將耗盡（carpet0 單人），只剩 $120、時間 3。\n'
          + 'Depleted (carpet0 solo), $120 funds, 3 time remaining.',
      },
    },
  },
};
