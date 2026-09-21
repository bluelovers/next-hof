/**
 * JobDetailCard 展示用職業資料
 * JobDetailCard fixture job data
 *
 * 各故事展示用的獨立職業資料。
 * Individual job data for each story showcase.
 */
import type { IJobData } from '../../src/components/game-data/GameDataTypes';

/** 基本職業卡片 / Basic job card */
export const basicJob: IJobData = {
  id: 1,
  parentId: 0,
  name: '戦士',
  spriteUrls: ['/image/char/warrior.png'],
  description: 'HPが高く、攻撃力も高い。重装備で防御力も高い。',
  equipment: ['剣', '盾', '鎧'],
  skills: [
    {
      name: 'スラッシュ',
      iconUrl: '/image/icon/skill/skill_073.png',
      target: 'enemy',
      scope: 'normal',
      spCost: 5,
      powerPct: 80,
      hits: 1,
      hitRate: '90',
      weaponLimit: '剣',
      effect: '敵単体に物理ダメージ',
      extraAttrs: [],
    },
  ],
};

/** 多精靈職業 / Job with multiple sprites */
export const multipleSpritesJob: IJobData = {
  id: 2,
  parentId: 0,
  name: '魔法使い',
  spriteUrls: ['/image/char/mon_106.png', '/image/char/mon_018.png'],
  description: 'MPが高く、魔法攻撃が得意。防御力は低い。',
  equipment: ['杖', 'ローブ'],
  skills: [
    {
      name: 'ファイア',
      iconUrl: '/image/icon/skill/skill_018.png',
      target: 'enemy',
      scope: 'normal',
      spCost: 10,
      powerPct: 80,
      hits: 1,
      hitRate: '85',
      weaponLimit: '杖',
      effect: '敵単体に炎属性ダメージ',
      extraAttrs: [],
    },
    {
      name: 'ヒール',
      iconUrl: '/image/icon/skill/skill_013c.png',
      target: 'friend',
      scope: 'normal',
      spCost: 15,
      powerPct: 50,
      hits: 1,
      hitRate: '100',
      weaponLimit: '杖',
      effect: '味単体に回復',
      extraAttrs: [],
    },
  ],
};

/** 多技能職業 / Job with multiple skills */
export const multipleSkillsJob: IJobData = {
  id: 3,
  parentId: 0,
  name: '弓使い',
  spriteUrls: ['/image/char/mon_216.png'],
  description: '遠距離攻撃が得意。敏捷性が高い。',
  equipment: ['弓', '皮鎧'],
  skills: [
    {
      name: 'マルチショット',
      iconUrl: '/image/icon/skill/item_042.png',
      target: 'enemy',
      scope: 'multi',
      spCost: 20,
      powerPct: 40,
      hits: 3,
      hitRate: '75',
      weaponLimit: '弓',
      effect: '敵全体に矢属性ダメージ',
      extraAttrs: [],
    },
    {
      name: 'スナイプ',
      iconUrl: '/image/icon/skill/item_042.png',
      target: 'enemy',
      scope: 'normal',
      spCost: 25,
      powerPct: 150,
      hits: 1,
      hitRate: '60',
      weaponLimit: '弓',
      effect: '敵単体に超強力な攻撃',
      extraAttrs: ['ターン制限'],
    },
    {
      name: 'バインド',
      iconUrl: '/image/icon/skill/skill_025.png',
      target: 'enemy',
      scope: 'normal',
      spCost: 30,
      powerPct: 0,
      hits: 1,
      hitRate: '80',
      weaponLimit: '弓',
      effect: '敵単体を行動不能にする',
      extraAttrs: [],
    },
  ],
};

/** 交替背景色用職業 / Job for alternating background */
export const alternatingBgJob: IJobData = {
  id: 4,
  parentId: 0,
  name: '僧侶',
  spriteUrls: ['/image/char/mon_213.png'],
  description: '回復とサポートが得意。HPとMPが高い。',
  equipment: ['杖', '祭服'],
  skills: [
    {
      name: 'ヒール',
      iconUrl: '/image/icon/skill/skill_013c.png',
      target: 'friend',
      scope: 'normal',
      spCost: 15,
      powerPct: 50,
      hits: 1,
      hitRate: '100',
      weaponLimit: '杖',
      effect: '味単体に回復',
      extraAttrs: [],
    },
  ],
};

/** 長描述職業 / Job with long description */
export const longDescJob: IJobData = {
  id: 5,
  parentId: 0,
  name: '聖騎士',
  spriteUrls: ['/image/char/mon_199r.png'],
  description: '攻撃と防御の両方に長けている。信仰心が強く、魔法も少しだけ使える。味方を守ることに長けている。',
  equipment: ['聖剣', '盾', '聖鎧', '聖盾'],
  skills: [
    {
      name: 'ホーリー',
      iconUrl: '/image/icon/skill/skill_010.png',
      target: 'enemy',
      scope: 'normal',
      spCost: 35,
      powerPct: 120,
      hits: 1,
      hitRate: '70',
      weaponLimit: '聖剣',
      effect: '敵単体に聖属性ダメージ',
      extraAttrs: [],
    },
    {
      name: 'プロテクション',
      iconUrl: '/image/icon/skill/skill_045z.png',
      target: 'friend',
      scope: 'multi',
      spCost: 25,
      powerPct: 0,
      hits: 1,
      hitRate: '100',
      weaponLimit: '聖盾',
      effect: '味全体の防御力をアップ',
      extraAttrs: [],
    },
  ],
};
