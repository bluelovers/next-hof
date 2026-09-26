import { describe, it, expect } from 'vitest';
import {
	EnumEventClass,
	EnumFollowUpType,
	EnumSkillEffect,
	classifyBattleEvent,
	detectSkillEffects,
	runEventEngine,
} from './event-engine';
import { EnumBattleEventType, EnumSkillDamageType, EnumTargetMethod, EnumTargetType } from '../types';
import type { IBattleEvent, ISkillDef } from '../types';

/** 複合效果技能：傷害＋施毒＋減益 / Multi-effect skill: damage + poison + debuff */
const curse: ISkillDef = {
	no: 1210,
	name: 'PlagueHex',
	sp: 20,
	type: EnumSkillDamageType.Magic,
	target: [EnumTargetType.Enemy, EnumTargetMethod.Individual, 1],
	pow: 120,
	poison: 70,
	DownSTR: 15,
};

/** 召喚技能：恢復＋召喚 / Summon skill: heal + summon */
const summonSkill: ISkillDef = {
	no: 2500,
	name: 'SummonSlime',
	sp: 30,
	type: EnumSkillDamageType.Physical,
	target: [EnumTargetType.Self, EnumTargetMethod.Individual, 1],
	pow: 100,
	support: 1,
	summon: 1002,
};

const defs = new Map<number, ISkillDef>([
	[curse.no, curse],
	[summonSkill.no, summonSkill],
]);
const getSkill = (no: number): ISkillDef | undefined => defs.get(no);

describe('上級事件引擎：兩類涵蓋所有紀錄 / upper event engine: two classes cover every record', () => {
	it('splits records into skill events (skill-attached) and general events (standalone)', () => {
		expect(classifyBattleEvent({ type: EnumBattleEventType.Act, actor: 'Mage', skill: 1000 })).toBe(
			EnumEventClass.Skill,
		);
		expect(
			classifyBattleEvent({ type: EnumBattleEventType.Damage, actor: 'Mage', target: 'GoblinAxe', skill: 1000 }),
		).toBe(EnumEventClass.Skill);
		// 死亡不依附技能 / death attaches to no skill
		expect(classifyBattleEvent({ type: EnumBattleEventType.Death, target: 'GoblinAxe' })).toBe(
			EnumEventClass.General,
		);
		// 每回合毒傷同型別但無 skill → 一般事件，不會誤掛到某次技能使用
		// Per-turn poison damage shares the Poison type but carries no skill → general, so it can
		// never be attached to a skill use
		expect(classifyBattleEvent({ type: EnumBattleEventType.Poison, target: 'Warrior', value: 31 })).toBe(
			EnumEventClass.General,
		);
	});
});

describe('技能事件：效果偵測與分派 / skill events: effect detection and dispatch', () => {
	it('detects every effect of one skill and dispatches each record to its system', () => {
		const events: IBattleEvent[] = [
			{ type: EnumBattleEventType.Act, actor: 'Mage', skill: curse.no },
			{ type: EnumBattleEventType.Damage, actor: 'Mage', target: 'GoblinAxe', skill: curse.no, value: 96, hpBefore: 140, hpAfter: 44 },
			// 每回合毒傷夾在中間：屬一般事件，不切開這次技能執行
			// Per-turn poison damage in the middle: a general event that must not split the execution
			{ type: EnumBattleEventType.Poison, target: 'Warrior', value: 31, hpBefore: 240, hpAfter: 209 },
			{ type: EnumBattleEventType.Debuff, actor: 'Mage', target: 'GoblinAxe', skill: curse.no },
			{ type: EnumBattleEventType.Poison, actor: 'Mage', target: 'GoblinAxe', skill: curse.no },
		];

		const records = runEventEngine(events, { getSkill });
		expect(records).toHaveLength(2);

		const [skill, general] = records;
		expect(skill.class).toBe(EnumEventClass.Skill);
		expect(general.class).toBe(EnumEventClass.General);
		if (skill.class !== EnumEventClass.Skill || general.class !== EnumEventClass.General) return;

		// 一個技能不一定只有一種效果：偵測回清單，分派按紀錄歸系統
		// One skill may carry several effects: detection returns the list, dispatch routes each record
		expect(skill.skillName).toBe('PlagueHex');
		expect(skill.effects).toEqual([EnumSkillEffect.Damage, EnumSkillEffect.Poison, EnumSkillEffect.Debuff]);
		expect(skill.source.type).toBe(EnumBattleEventType.Act);
		expect(skill.dispatch.map((d) => d.effect)).toEqual([
			EnumSkillEffect.Damage,
			EnumSkillEffect.Debuff,
			EnumSkillEffect.Poison,
		]);
		expect(skill.dispatch.map((d) => d.records.length)).toEqual([1, 1, 1]);
		// 一般事件原樣保留 / the general event stays verbatim
		expect(general.event).toBe(events[2]);
	});

	it('groups by execution: a new Act or a changed skill number opens a new skill event', () => {
		const events: IBattleEvent[] = [
			{ type: EnumBattleEventType.Act, actor: 'Priest', skill: 3000 },
			{ type: EnumBattleEventType.Heal, actor: 'Priest', target: 'Warrior', skill: 3000, value: 200 },
			{ type: EnumBattleEventType.Act, actor: 'Mage', skill: curse.no },
			{ type: EnumBattleEventType.Damage, actor: 'Mage', target: 'GoblinAxe', skill: curse.no, value: 96 },
		];

		// 未提供 getSkill：仍照樣分組，只是不偵測效果（effects 為空陣列）
		// Without getSkill the grouping still works; only detection is skipped (empty `effects`)
		const records = runEventEngine(events);
		expect(records).toHaveLength(2);
		expect(records.every((r) => r.class === EnumEventClass.Skill)).toBe(true);

		const [first, second] = records;
		if (first.class !== EnumEventClass.Skill || second.class !== EnumEventClass.Skill) return;
		expect(first.skill).toBe(3000);
		expect(first.effects).toEqual([]);
		expect(first.dispatch.map((d) => d.effect)).toEqual([EnumSkillEffect.Heal]);
		expect(second.skill).toBe(curse.no);
		expect(second.dispatch.map((d) => d.effect)).toEqual([EnumSkillEffect.Damage]);
	});
});

describe('召喚系統的後續事件 / follow-up events of the summon system', () => {
	it('derives one entry event per summon record, without touching the source record', () => {
		const events: IBattleEvent[] = [
			{ type: EnumBattleEventType.Act, actor: 'Priest', skill: summonSkill.no },
			{ type: EnumBattleEventType.Summon, actor: 'Priest', target: '1002', value: 1, skill: summonSkill.no },
		];

		const [skill] = runEventEngine(events, { getSkill });
		if (!skill || skill.class !== EnumEventClass.Skill) throw new Error('expected one skill event');

		expect(skill.effects).toEqual([EnumSkillEffect.Heal, EnumSkillEffect.Summon]);
		const summon = skill.dispatch.find((d) => d.effect === EnumSkillEffect.Summon);
		expect(summon?.records).toEqual([events[1]]);
		expect(summon?.followUps).toEqual([
			{ type: EnumFollowUpType.Enter, source: events[1], unit: '1002', level: 1 },
		]);
	});
});
