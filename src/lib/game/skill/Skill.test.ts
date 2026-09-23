import { describe, it, expect } from 'vitest';
import { RNG } from '../core/rng';
import { Character } from '../character/Character';
import { createSeedRepository } from '../data/seed-data';
import { InMemoryRepository } from '../data/repository';
import { getSkill } from './Skill';
import { skillPassive } from './passive';
import { calcBasicDamage, calcRecoveryValue, applySkill } from './effect';
import type { ISkillDef } from '../types';

const repo = createSeedRepository();

describe('Skill definition (6.1)', () => {
	it('parses support / invalid flags and target tuple', () => {
		const attack = getSkill(1000, repo)!;
		expect(attack.target).toEqual(['enemy', 'individual', 1]);
		expect(attack.support).toBeUndefined();
		expect(attack.invalid).toBeUndefined();

		const fire = getSkill(2000, repo)!;
		expect(fire.invalid).toBe(1);
		expect(fire.type).toBe(1);
		expect(fire.target).toEqual(['enemy', 'multi', 6]);

		const heal = getSkill(3000, repo)!;
		expect(heal.support).toBe(1);
		expect(heal.target).toEqual(['friend', 'individual', 1]);
	});
});

describe('Skill effect (6.2)', () => {
	it('physical damage reduces HP by DEF-reduced amount', () => {
		const user = new Character({
			no: 1, name: 'u', types: ['char'], level: 1,
			str: 100, int: 100, dex: 10, spd: 10, luk: 10, maxhp: 300, maxsp: 50,
		});
		user.STR = 100;
		user.atk = [0, 0];

		const target = new Character({
			no: 2, name: 't', types: ['mon'], level: 1,
			str: 10, int: 10, dex: 10, spd: 10, luk: 10, maxhp: 300, maxsp: 50,
		});
		target.def = [20, 5, 0, 0];
		target.HP = 300; target.MAXHP = 300;

		const atk: ISkillDef = { no: 1000, name: 'Attack', sp: 0, type: 0, target: ['enemy', 'individual', 1], pow: 160 };
		// sqrt(100)*10 = 100; *1.6 = 160; *(1-0.2)=128; -5=123; ceil(max(123,12.3))=123
		expect(calcBasicDamage(atk, user, target)).toBe(123);

		const res = applySkill(atk, user, target);
		expect(res.damage).toBe(123);
		expect(target.HP).toBe(300 - 123);
	});

	it('support heal adds HP and does not trigger guard', () => {
		const user = new Character({
			no: 1, name: 'u', types: ['char'], level: 1,
			str: 10, int: 100, dex: 10, spd: 10, luk: 10, maxhp: 300, maxsp: 50,
		});
		user.INT = 100;
		user.atk = [0, 0];

		const target = new Character({
			no: 3, name: 't2', types: ['mon'], level: 1,
			str: 10, int: 10, dex: 10, spd: 10, luk: 10, maxhp: 1000, maxsp: 50,
		});
		target.HP = 100; target.MAXHP = 1000;

		const heal: ISkillDef = { no: 3000, name: 'Healing', sp: 5, type: 0, target: ['friend', 'individual', 1], pow: 200, support: 1 };
		expect(calcRecoveryValue(heal, user)).toBe(200); // ceil((10*10)*2)=200

		const res = applySkill(heal, user, target);
		expect(res.heal).toBe(200);
		expect(target.HP).toBe(300);
	});
});

describe('Passive skill (6.3)', () => {
	it('accumulates P_STR from a passive skill', () => {
		const r = new InMemoryRepository();
		r.addSkill({ no: 7000, name: 'PassiveStr', sp: 0, type: 0, passive: 1, P_STR: 50 });

		const char = new Character({
			no: 1, name: 'c', types: ['char'], level: 1,
			str: 10, int: 10, dex: 10, spd: 10, luk: 10, maxhp: 300, maxsp: 50,
		});
		char.skill = [7000];
		skillPassive(char, r);
		expect(char.P_STR).toBe(50);
	});
});
