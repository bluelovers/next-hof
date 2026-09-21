/**
 * SkillCard 展示用技能資料
 * SkillCard fixture skill data
 *
 * 各故事展示用的獨立技能資料。
 * Individual skill data for each story showcase.
 */
import type { ISkillData } from '../../src/components/game-data/GameDataTypes';

/** 基本技能卡片 / Basic skill card (FireBall) */
export const basicSkill: ISkillData = {
  name: 'FireBall',
  iconUrl: '/image/icon/skill/skill_018.png',
  target: 'enemy',
  scope: 'multi',
  spCost: 20,
  powerPct: 100,
  hits: 4,
  hitRate: '60:0',
  effect: '施放一個火球對多個敵人造成範圍傷害',
  extraAttrs: ['Magic', 'invalid'],
};

/** 多次攻擊技能 / Multi-hit skill (DoubleAttack) */
export const multiHitSkill: ISkillData = {
  name: 'DoubleAttack',
  iconUrl: '/image/icon/skill/skill_073.png',
  target: 'enemy',
  scope: 'normal',
  spCost: 15,
  powerPct: 90,
  hits: 2,
  effect: '连续发动两次攻击',
  extraAttrs: [],
};

/** 補助技能 / Support skill (PartyHeal) */
export const supportSkill: ISkillData = {
  name: 'PartyHeal',
  iconUrl: '/image/icon/skill/skill_013c.png',
  target: 'friend',
  scope: 'all',
  spCost: 30,
  powerPct: 150,
  hits: 1,
  hitRate: '50:0',
  effect: 'HP回復',
  extraAttrs: ['Magic'],
};

/** 自我強化技能 / Self-buff skill (ObtainMind) */
export const selfBuffSkill: ISkillData = {
  name: 'ObtainMind',
  iconUrl: '/image/icon/skill/skill_057.png',
  target: 'self',
  scope: 'normal',
  spCost: 0,
  extraAttrs: ['Sacrifice:15%', 'Int+100%'],
  effect: '知力上昇',
};

/** 高 SP 消耗技能 / High SP cost skill (SummonLeviathan) */
export const highSPCostSkill: ISkillData = {
  name: 'SummonLeviathan',
  iconUrl: '/image/icon/skill/skill_029.png',
  target: 'self',
  scope: 'normal',
  spCost: 700,
  hitRate: '100:300',
  effect: '召唤海兽',
  extraAttrs: ['MagicCircle x4', 'Magic', 'Quick'],
};

/** 無圖標技能 / Skill without icon (StanceRestore) */
export const withoutIconSkill: ISkillData = {
  name: 'StanceRestore',
  iconUrl: '',
  target: 'friend',
  scope: 'all',
  spCost: 0,
  effect: '隊列修正',
  extraAttrs: [],
};

/** 長名稱技能 / Long name skill (FullSupport) */
export const longNameSkill: ISkillData = {
  name: 'FullSupport',
  iconUrl: '/image/icon/skill/we_other007z.png',
  target: 'friend',
  scope: 'normal',
  spCost: 200,
  hitRate: '0:150',
  weaponLimit: 'Limit:Whip',
  effect: '召喚キャラ強化',
  extraAttrs: ['Str+100%', 'Int+100%', 'Spd+100%'],
};
