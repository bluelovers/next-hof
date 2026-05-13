/**
 * SkillCard 技能卡片元件故事
 * SkillCard component stories
 *
 * 個別展示各種技能卡片
 * Show various skill cards
 */

import type { Meta, StoryObj } from '@storybook/react';
import { SkillCard } from '../../src/components/game-data/SkillCard';
import type { ISkillData, ISkillTarget, ISkillScope } from '../../src/components/game-data/GameDataTypes';

/** SkillCard 元件設定 / SkillCard component settings */
const meta: Meta<typeof SkillCard> = {
  title: 'GameData/SkillCard',
  component: SkillCard,
  parameters: {
    // Storybook 裝飾器配置 / Storybook decorators configuration
    decorators: [
      (Story) => (
        <div className="home-page" style={{ 
          backgroundColor: '#10151b', 
          padding: '20px',
          color: '#e0e0e0',
          fontFamily: 'Arial, sans-serif'
        }}>
          <Story />
        </div>
      ),
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本技能卡片 / Basic skill card */
export const Basic: Story = {
  args: {
    skill: {
      name: 'ファイア',
      iconUrl: '/image/icon/skill/fire.png',
      target: 'enemy' as ISkillTarget,
      scope: 'normal' as ISkillScope,
      spCost: 10,
      powerPct: 80,
      hits: 1,
      hitRate: 85,
      weaponLimit: '杖',
      effect: '敵単体に炎属性ダメージ',
      extraAttrs: [],
    },
  },
};

/** 多次攻擊技能 / Multi-hit skill */
export const MultiHit: Story = {
  args: {
    skill: {
      name: 'マルチショット',
      iconUrl: '/image/icon/skill/arrow.png',
      target: 'enemy' as ISkillTarget,
      scope: 'multi' as ISkillScope,
      spCost: 20,
      powerPct: 40,
      hits: 3,
      hitRate: 75,
      weaponLimit: '弓',
      effect: '敵全体に矢属性ダメージ',
      extraAttrs: [],
    },
  },
};

/** 補助技能 / Support skill */
export const Support: Story = {
  args: {
    skill: {
      name: 'ヒール',
      iconUrl: '/image/icon/skill/heal.png',
      target: 'friend' as ISkillTarget,
      scope: 'normal' as ISkillScope,
      spCost: 15,
      powerPct: 50,
      hits: 1,
      hitRate: 100,
      weaponLimit: '杖',
      effect: '味単体に回復',
      extraAttrs: [],
    },
  },
};

/** 自我強化技能 / Self-buff skill */
export const SelfBuff: Story = {
  args: {
    skill: {
      name: 'バーサク',
      iconUrl: '/image/icon/skill/rage.png',
      target: 'self' as ISkillTarget,
      scope: 'normal' as ISkillScope,
      spCost: 25,
      powerPct: 0,
      hits: 1,
      hitRate: 100,
      weaponLimit: '剣',
      effect: '自分の攻撃力をアップ',
      extraAttrs: ['ターン制限'],
    },
  },
};

/** 高 SP 消耗技能 / High SP cost skill */
export const HighSPCost: Story = {
  args: {
    skill: {
      name: 'メテオ',
      iconUrl: '/image/icon/skill/meteor.png',
      target: 'enemy' as ISkillTarget,
      scope: 'multi' as ISkillScope,
      spCost: 50,
      powerPct: 120,
      hits: 1,
      hitRate: 60,
      weaponLimit: '杖',
      effect: '敵全体に大ダメージ',
      extraAttrs: ['ターン制限'],
    },
  },
};

/** 無圖標技能 / Skill without icon */
export const WithoutIcon: Story = {
  args: {
    skill: {
      name: '基本攻撃',
      iconUrl: '',
      target: 'enemy' as ISkillTarget,
      scope: 'normal' as ISkillScope,
      spCost: 0,
      powerPct: 100,
      hits: 1,
      hitRate: 95,
      weaponLimit: '剣',
      effect: '敵単体に物理ダメージ',
      extraAttrs: [],
    },
  },
};

/** 長名稱技能 / Long name skill */
export const LongName: Story = {
  args: {
    skill: {
      name: '伝説の剣技・究極奥義',
      iconUrl: '/image/icon/skill/legendary.png',
      target: 'enemy' as ISkillTarget,
      scope: 'normal' as ISkillScope,
      spCost: 80,
      powerPct: 200,
      hits: 1,
      hitRate: 50,
      weaponLimit: '伝説の剣',
      effect: '敵単体に超絶大ダメージ',
      extraAttrs: ['ターン制限', 'MP消費'],
    },
  },
};