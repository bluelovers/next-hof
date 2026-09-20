/**
 * TownPage Storybook 故事
 * TownPage Storybook stories
 *
 * 展示城鎮頁面的各種狀態
 * Showcases various states of the town page
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DarkDecorator } from '../decorators';
import { GameLayout } from '../../src/components/pages/GameLayout';
import { TownPage } from '../../src/components/pages/TownPage';
import { TownFacility } from '../../src/components/facilities/TownFacility';
import { FacilityGroup } from '../../src/components/facilities/FacilityGroup';
import { MessageBoard } from '../../src/components/facilities/MessageBoard';
import type { IFacilityData } from '../../src/components/facilities/TownFacility';
import type { IMessageBoardProps } from '../../src/components/facilities/MessageBoard';

/** ==================== TownPage Stories ==================== */

/** 使用 GameLayout 包裝的 TownPage / TownPage wrapped in GameLayout */
const TownPageWithLayout: React.FC<{
  messageBoard?: IMessageBoardProps;
}> = ({ messageBoard }) => (
  <GameLayout>
    <TownPage messageBoard={messageBoard} />
  </GameLayout>
);

const meta: Meta<typeof TownPageWithLayout> = {
  title: 'Pages/TownPage',
  component: TownPageWithLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '城鎮頁面，包含商店、人材、鍛冶、拍賣、鬥技等設施與廣場留言板。\nTown page with shop, recruit, smithy, auction, colosseum facilities and plaza message board.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TownPageWithLayout>;

/** 預設城鎮 / Default town */
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          '預設的城鎮頁面，顯示所有設施與空的留言板。\nDefault town page with all facilities and empty message board.',
      },
    },
  },
};

/** 有留言的城鎮 / Town with messages */
export const WithMessages: Story = {
  args: {
    messageBoard: {
      messages: [
        'こんにちは！',
        '今日はいい天気ですね。',
        '誰かパーティー募集してる？',
        'ダンジョン攻略情報求む！',
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '廣場有歷史留言的城鎮頁面。\nTown page with historical messages in the plaza.',
      },
    },
  },
};

/** 多人留言 / Many messages */
export const ManyMessages: Story = {
  args: {
    messageBoard: {
      messages: [
        'こんにちは！',
        '今日はいい天気ですね。',
        '誰かパーティー募集してる？',
        'ダンジョン攻略情報求む！',
        '鍛冶屋で武器強化したよ！',
        'オークションでレアアイテム出品中',
        'コロシアムで対戦相手募集！',
        'アルバイトの報酬が上がったって',
        '新キャラ追加されたらしい',
        '精錬に成功した！やったー！',
      ],
    },
  },
};

/** ==================== TownFacility 獨立故事 / TownFacility standalone stories ==================== */

/** Dark decorator for standalone stories */
const facilityMeta: Meta<typeof TownFacility> = {
  title: 'Facilities/TownFacility',
  component: TownFacility,
  decorators: [DarkDecorator],
  tags: ['autodocs'],
};

export const ShopLink: StoryObj<typeof TownFacility> = {
  render: () => (
    <TownFacility
      facility={{ name: '店', nameEn: 'Shop', href: '#' }}
    />
  ),
};

export const Bilingual: StoryObj<typeof TownFacility> = {
  render: () => (
    <TownFacility
      facility={{ name: '買う', nameEn: 'Buy', href: '#' }}
    />
  ),
};

export const JapaneseOnly: StoryObj<typeof TownFacility> = {
  render: () => (
    <TownFacility
      facility={{ name: 'アルバイト', href: '#' }}
    />
  ),
};

export const WithIcon: StoryObj<typeof TownFacility> = {
  render: () => (
    <TownFacility
      facility={{ name: 'Shop', icon: '🛒', href: '#' }}
    />
  ),
};

/** ==================== FacilityGroup 獨立故事 / FacilityGroup standalone stories ==================== */

const groupMeta: Meta<typeof FacilityGroup> = {
  title: 'Facilities/FacilityGroup',
  component: FacilityGroup,
  decorators: [DarkDecorator],
  tags: ['autodocs'],
};

export const ShopGroup: StoryObj<typeof FacilityGroup> = {
  render: () => (
    <FacilityGroup
      title="店"
      facilities={[
        { name: '店', nameEn: 'Shop', href: '#' },
        { name: '買う', nameEn: 'Buy', href: '#' },
        { name: '売る', nameEn: 'Sell', href: '#' },
        { name: 'アルバイト', href: '#' },
      ]}
    />
  ),
};

export const SmithyGroup: StoryObj<typeof FacilityGroup> = {
  render: () => (
    <FacilityGroup
      title="鍛冶"
      facilities={[
        { name: '鍛冶屋', nameEn: 'Smithy', href: '#' },
        { name: '精錬工房', nameEn: 'Refine', href: '#' },
        { name: '製作工房', nameEn: 'Create', href: '#' },
      ]}
    />
  ),
};

export const SingleFacility: StoryObj<typeof FacilityGroup> = {
  render: () => (
    <FacilityGroup
      title="人材"
      facilities={[
        { name: '人材斡旋所', nameEn: 'Recruit', href: '#' },
      ]}
    />
  ),
};

/** ==================== MessageBoard 獨立故事 / MessageBoard standalone stories ==================== */

const boardMeta: Meta<typeof MessageBoard> = {
  title: 'Facilities/MessageBoard',
  component: MessageBoard,
  decorators: [DarkDecorator],
  tags: ['autodocs'],
};

export const EmptyBoard: StoryObj<typeof MessageBoard> = {
  render: () => <MessageBoard />,
};

export const BoardWithMessages: StoryObj<typeof MessageBoard> = {
  render: () => (
    <MessageBoard
      messages={[
        'こんにちは！',
        '今日はいい天気ですね。',
        'コロシアムで対戦相手募集！',
      ]}
    />
  ),
};

export const BoardManyMessages: StoryObj<typeof MessageBoard> = {
  render: () => (
    <MessageBoard
      messages={[
        'メッセージ1: こんにちは！',
        'メッセージ2: パーティー募集！',
        'メッセージ3: アイテム交換したい',
        'メッセージ4: ダンジョン攻略情報',
        'メッセージ5: 鍛冶屋おすすめ',
      ]}
    />
  ),
};
