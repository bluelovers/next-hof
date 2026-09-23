import { describe, it, expect } from 'vitest';
import { RNG } from '../core/rng';
import { EnumState } from '../constants';
import { Character } from './Character';
import { createSeedRepository } from '../data/seed-data';
import { newChar, newMon, newMonSummon } from './factory';
import { levelFix } from './level-fix';
import { setBattleVariable } from './battle-variable';
import { getPoison, poisonDamage, consumeBarrier } from './status';
import { EnumCharType } from '../types';

const repo = createSeedRepository();

describe('Character factory (4.1)', () => {
	it('newMon carries mon flag; newMonSummon carries mon + summon', () => {
		const rng = new RNG(1);
		const mon = newMon(repo.getMon(1000)!, repo, rng);
		expect(mon.isMon()).toBe(true);
		expect(mon.isChar()).toBe(false);

		const summon = newMonSummon(repo.getMon(1000)!, repo, rng);
		expect(summon.isMon()).toBe(true);
		expect(summon.isSummon()).toBe(true);
		expect(summon.isChar()).toBe(false);
	});
});

describe('level_fix (4.2)', () => {
	it('scales monster base attributes by ceil(base * newLevel/oldLevel)', () => {
		const rng = new RNG(2);
		const mon = newMon(repo.getMon(1000)!, repo, rng); // base str 20, maxhp 140, level 1
		const oldStr = mon.str;
		const oldMaxhp = mon.maxhp;
		const changed = levelFix(mon, 9); // newLevel = 10, div = 10
		expect(changed).toBe(true);
		expect(mon.level).toBe(10);
		expect(mon.str).toBe(Math.ceil(oldStr * 10)); // 200
		expect(mon.maxhp).toBe(Math.ceil(oldMaxhp * 10)); // 1400
		expect(mon.hp).toBe(mon.maxhp);
	});

	it('leaves char type unaffected', () => {
		const rng = new RNG(3);
		const char = newChar(repo.getCharBase(100)!, repo, rng);
		const before = { str: char.str, maxhp: char.maxhp, level: char.level };
		expect(levelFix(char, 5)).toBe(false);
		expect(char.str).toBe(before.str);
		expect(char.maxhp).toBe(before.maxhp);
		expect(char.level).toBe(before.level);
	});
});

describe('battle-variable (4.3)', () => {
	it('computes STR and MAXHP from formula', () => {
		const rng = new RNG(4);
		const char = newChar(repo.getCharBase(100)!, repo, rng);
		expect(char.STR).toBe(char.str + char.P_STR);
		expect(char.MAXHP).toBe(Math.round(char.maxhp * (1 + char.M_MAXHP / 100) + char.P_MAXHP));

		// 補正 P_STR 後重新計算
		char.P_STR = 5;
		setBattleVariable(char, repo, rng);
		expect(char.STR).toBe(char.str + 5);
	});
});

describe('status effects (4.4)', () => {
	it('poison sets state and deals non-lethal damage; barrier blocks one hit', () => {
		const rng = new RNG(5);
		const char = new Character({
			no: 1, name: 't', types: [EnumCharType.Char], level: 1,
			str: 10, int: 10, dex: 10, spd: 10, luk: 10, maxhp: 300, maxsp: 50,
		});
		char.MAXHP = 300; char.HP = 300; char.rng = rng;

		const poison = getPoison(char, 100, rng);
		expect(poison).toBe(true);
		expect(char.STATE).toBe(EnumState.Poison);

		// 非致死：HP=5 經中毒扣 31 → 最低 1
		char.HP = 5;
		const dmg = poisonDamage(char);
		expect(char.HP).toBe(1);
		expect(dmg).toBe(4);

		// Barrier：消耗一次，完全抵擋
		char.STATE = EnumState.Alive;
		char.SPECIAL.Barrier = 1;
		expect(consumeBarrier(char)).toBe(true);
		expect(char.SPECIAL.Barrier).toBe(0);
		expect(consumeBarrier(char)).toBe(false);
	});
});
