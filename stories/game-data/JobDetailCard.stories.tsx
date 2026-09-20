/**
 * JobDetailCard 職業詳細卡片元件故事
 * JobDetailCard component stories
 *
 * 個別展示各種職業詳細資訊
 * Show various job details
 */

import type { Meta, StoryObj } from '@storybook/react';
import { makeDarkDecorator } from '../decorators';
import { JobDetailCard } from '../../src/components/game-data/JobDetailCard';

/** JobDetailCard 元件設定 / JobDetailCard component settings */
const meta: Meta<typeof JobDetailCard> = {
  title: 'GameData/JobDetailCard',
  component: JobDetailCard,
  parameters: {
    // Storybook 裝飾器配置 / Storybook decorators configuration
    decorators: [
      makeDarkDecorator({
        className: 'home-page',
        color: '#e0e0e0',
        fontFamily: 'Arial, sans-serif',
        table: true,
        tableStyle: { border: '1px solid #1a232d', width: '100%' },
      }),
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本職業卡片 / Basic job card */
export const Basic: Story = {
  args: {
    job: {
      id: 'warrior',
      name: '戦士',
      spriteUrls: ['/image/char/warrior.png'],
      description: 'HPが高く、攻撃力も高い。重装備で防御力も高い。',
      equipment: ['剣', '盾', '鎧'],
      skills: [
        {
          name: 'スラッシュ',
          iconUrl: '/image/icon/skill/slash.png',
          target: 'enemy' as any,
          scope: 'normal' as any,
          spCost: 5,
          powerPct: 80,
          hits: 1,
          hitRate: 90,
          weaponLimit: '剣',
          effect: '敵単体に物理ダメージ',
          extraAttrs: [],
        },
      ],
    },
  },
};

/** 多精靈職業 / Job with multiple sprites */
export const MultipleSprites: Story = {
  args: {
    job: {
      id: 'mage',
      name: '魔法使い',
      spriteUrls: ['/image/char/male_mage.png', '/image/char/female_mage.png'],
      description: 'MPが高く、魔法攻撃が得意。防御力は低い。',
      equipment: ['杖', 'ローブ'],
      skills: [
        {
          name: 'ファイア',
          iconUrl: '/image/icon/skill/fire.png',
          target: 'enemy' as any,
          scope: 'normal' as any,
          spCost: 10,
          powerPct: 80,
          hits: 1,
          hitRate: 85,
          weaponLimit: '杖',
          effect: '敵単体に炎属性ダメージ',
          extraAttrs: [],
        },
        {
          name: 'ヒール',
          iconUrl: '/image/icon/skill/heal.png',
          target: 'friend' as any,
          scope: 'normal' as any,
          spCost: 15,
          powerPct: 50,
          hits: 1,
          hitRate: 100,
          weaponLimit: '杖',
          effect: '味単体に回復',
          extraAttrs: [],
        },
      ],
    },
  },
};

/** 多技能職業 / Job with multiple skills */
export const MultipleSkills: Story = {
  args: {
    job: {
      id: 'ranger',
      name: '弓使い',
      spriteUrls: ['/image/char/ranger.png'],
      description: '遠距離攻撃が得意。敏捷性が高い。',
      equipment: ['弓', '皮鎧'],
      skills: [
        {
          name: 'マルチショット',
          iconUrl: '/image/icon/skill/arrow.png',
          target: 'enemy' as any,
          scope: 'multi' as any,
          spCost: 20,
          powerPct: 40,
          hits: 3,
          hitRate: 75,
          weaponLimit: '弓',
          effect: '敵全体に矢属性ダメージ',
          extraAttrs: [],
        },
        {
          name: 'スナイプ',
          iconUrl: '/image/icon/skill/snipe.png',
          target: 'enemy' as any,
          scope: 'normal' as any,
          spCost: 25,
          powerPct: 150,
          hits: 1,
          hitRate: 60,
          weaponLimit: '弓',
          effect: '敵単体に超強力な攻撃',
          extraAttrs: ['ターン制限'],
        },
        {
          name: 'バインド',
          iconUrl: '/image/icon/skill/bind.png',
          target: 'enemy' as any,
          scope: 'normal' as any,
          spCost: 30,
          powerPct: 0,
          hits: 1,
          hitRate: 80,
          weaponLimit: '弓',
          effect: '敵単体を行動不能にする',
          extraAttrs: [],
        },
      ],
    },
  },
};

/** 交替背景色 / With alternating background */
export const AlternatingBackground: Story = {
  args: {
    job: {
      id: 'priest',
      name: '僧侶',
      spriteUrls: ['/image/char/priest.png'],
      description: '回復とサポートが得意。HPとMPが高い。',
      equipment: ['杖', '祭服'],
      skills: [
        {
          name: 'ヒール',
          iconUrl: '/image/icon/skill/heal.png',
          target: 'friend' as any,
          scope: 'normal' as any,
          spCost: 15,
          powerPct: 50,
          hits: 1,
          hitRate: 100,
          weaponLimit: '杖',
          effect: '味単体に回復',
          extraAttrs: [],
        },
      ],
    },
    altBg: true,
  },
};

/** 長描述職業 / Job with long description */
export const LongDescription: Story = {
  args: {
    job: {
      id: 'paladin',
      name: '聖騎士',
      spriteUrls: ['/image/char/paladin.png'],
      description: '攻撃と防御の両方に長けている。信仰心が強く、魔法も少しだけ使える。味方を守ることに長けている。',
      equipment: ['聖剣', '盾', '聖鎧', '聖盾'],
      skills: [
        {
          name: 'ホーリー',
          iconUrl: '/image/icon/skill/holy.png',
          target: 'enemy' as any,
          scope: 'normal' as any,
          spCost: 35,
          powerPct: 120,
          hits: 1,
          hitRate: 70,
          weaponLimit: '聖剣',
          effect: '敵単体に聖属性ダメージ',
          extraAttrs: [],
        },
        {
          name: 'プロテクション',
          iconUrl: '/image/icon/skill/protect.png',
          target: 'friend' as any,
          scope: 'multi' as any,
          spCost: 25,
          powerPct: 0,
          hits: 1,
          hitRate: 100,
          weaponLimit: '聖盾',
          effect: '味全体の防御力をアップ',
          extraAttrs: [],
        },
      ],
    },
  },
};