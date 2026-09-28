/**
 * SkillCard 展示用技能卡片（技能定義的展示別名層）
 * SkillCard showcase skill cards (display alias layer over the skill registry)
 *
 * 技能定義已統一收斂至 skills.ts（單一事實來源），此檔僅以故事所需名稱重導出別名，
 * 或對同一技能提供覆寫變體。
 * Skill definitions live in skills.ts (single source of truth); this file only
 * re-exports the aliases the SkillCard stories need, or overridden variants.
 */
import type { ISkillData } from '../../src/components/game-data/GameDataTypes';
import { skills } from './skills';

/** 基本技能卡片（FireBall） / Basic skill card (FireBall) */
export const basicSkill: ISkillData = skills.fireBall;

/** 多次攻擊技能（DoubleAttack） / Multi-hit skill (DoubleAttack) */
export const multiHitSkill: ISkillData = skills.doubleAttack;

/** 補助技能（PartyHeal） / Support skill (PartyHeal) */
export const supportSkill: ISkillData = skills.partyHeal;

/** 自我強化技能（ObtainMind） / Self-buff skill (ObtainMind) */
export const selfBuffSkill: ISkillData = skills.obtainMind;

/** 高 SP 消耗技能（SummonLeviathan） / High SP cost skill (SummonLeviathan) */
export const highSPCostSkill: ISkillData = skills.summonLeviathan;

/**
 * 無圖標技能（StanceRestore，SkillCard 展示用去圖標變體）
 * Skill without icon (StanceRestore; icon stripped for the SkillCard showcase)
 */
export const withoutIconSkill: ISkillData = {
	...skills.stanceRestore,
	iconUrl: '',
};

/** 長名稱技能（FullSupport） / Long name skill (FullSupport) */
export const longNameSkill: ISkillData = skills.fullSupport;