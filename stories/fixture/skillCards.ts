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
  sp: 20,
  powerPct: 100,
  hits: 4,
  hitRate: '60:0',
  effect: '施放一個火球對多個敵人造成範圍傷害',
  skillType: 'magic',
  isInvalid: true,
};

/** 多次攻擊技能 / Multi-hit skill (DoubleAttack) */
export const multiHitSkill: ISkillData = {
  name: 'DoubleAttack',
  iconUrl: '/image/icon/skill/skill_073.png',
  target: 'enemy',
  scope: 'normal',
  sp: 15,
  powerPct: 90,
  hits: 2,
  effect: '连续发动两次攻击',
};

/** 補助技能 / Support skill (PartyHeal) */
export const supportSkill: ISkillData = {
  name: 'PartyHeal',
  iconUrl: '/image/icon/skill/skill_013c.png',
  target: 'friend',
  scope: 'all',
  sp: 30,
  powerPct: 150,
  hits: 1,
  hitRate: '50:0',
  effect: 'HP回復',
  skillType: 'magic',
  isSupport: true,
};

/** 自我強化技能 / Self-buff skill (ObtainMind) */
export const selfBuffSkill: ISkillData = {
  name: 'ObtainMind',
  iconUrl: '/image/icon/skill/skill_057.png',
  target: 'self',
  scope: 'normal',
  sp: 0,
  sacrificePct: 15,
  upStats: { INT: 100 },
  effect: '知力上昇',
};

/** 高 SP 消耗技能 / High SP cost skill (SummonLeviathan) */
export const highSPCostSkill: ISkillData = {
  name: 'SummonLeviathan',
  iconUrl: '/image/icon/skill/skill_029.png',
  target: 'self',
  scope: 'normal',
  sp: 700,
  hitRate: '100:300',
  effect: '召唤海兽',
  magicCircleCost: 4,
  skillType: 'magic',
  isQuick: true,
};

/** 無圖標技能 / Skill without icon (StanceRestore) */
export const withoutIconSkill: ISkillData = {
  name: 'StanceRestore',
  iconUrl: '',
  target: 'friend',
  scope: 'all',
  sp: 0,
  effect: '隊列修正',
};

/** 長名稱技能 / Long name skill (FullSupport) */
export const longNameSkill: ISkillData = {
  name: 'FullSupport',
  iconUrl: '/image/icon/skill/we_other007z.png',
  target: 'friend',
  scope: 'normal',
  sp: 200,
  hitRate: '0:150',
  weaponLimit: 'Whip',
  effect: '召喚キャラ強化',
  upStats: { STR: 100, INT: 100, SPD: 100 },
};
