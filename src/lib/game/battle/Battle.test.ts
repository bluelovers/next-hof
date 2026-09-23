import { describe, it, expect } from 'vitest';
import { RNG } from '../core/rng';
import { EnumState } from '../constants';
import { FakeTimeService } from '../core/time-service';
import { Character } from '../character/Character';
import { createSeedRepository } from '../data/seed-data';
import { newChar, newMon } from '../character/factory';
import { Battle } from './Battle';
import { EnumCharType } from '../types';

const repo = createSeedRepository();

describe('Battle engine (9.1)', () => {
	it('DelayValue = sqrt(SPD)+DELAY_BASE and SPD 100 acts before SPD 25', () => {
		const rng = new RNG(1);
		const c100 = new Character({
			no: 1, name: 'a', types: [EnumCharType.Char], level: 1,
			str: 10, int: 10, dex: 10, spd: 100, luk: 10, maxhp: 100, maxsp: 50,
		});
		const c25 = new Character({
			no: 2, name: 'b', types: [EnumCharType.Char], level: 1,
			str: 10, int: 10, dex: 10, spd: 25, luk: 10, maxhp: 100, maxsp: 50,
		});
		const battle = new Battle([c100], [c25], { repo, rng });
		expect(battle.DelayValue(c100)).toBe(Math.sqrt(100) + 5);
		expect(battle.DelayValue(c25)).toBe(Math.sqrt(25) + 5);
		expect(battle.NextActer()).toBe(c100); // SPD 越高越早上場
	});
});

describe('Battle action (9.2)', () => {
	it('a normal attack reduces target HP and a dead actor stops acting', () => {
		const rng = new RNG(1);
		const attacker = newChar({ ...repo.getCharBase(100)!, str: 200 }, repo, rng);
		const target = newMon(repo.getMon(1000)!, repo, rng);
		const battle = new Battle([attacker], [target], { repo, rng });

		const hpBefore = target.HP;
		battle.UseSkill(attacker, 1000);
		expect(target.HP).toBeLessThan(hpBefore);

		attacker.STATE = EnumState.Dead;
		expect(battle.NextActer()).not.toBe(attacker);
	});
});

describe('Battle result (9.4)', () => {
	it('enemy wipeout → TEAM_0 wins', () => {
		const rng = new RNG(1);
		const attacker = newChar({ ...repo.getCharBase(100)!, str: 200 }, repo, rng);
		const target = newMon(repo.getMon(1000)!, repo, rng);
		const battle = new Battle([attacker], [target], { repo, rng });
		const res = battle.run();
		expect(res.outcome).toBe('win');
		expect(res.turns).toBeGreaterThan(0);
	});

	it('unwinnable battle times out to a draw', () => {
		const rng = new RNG(2);
		const repo2 = createSeedRepository();
		const d1 = new Character({
			no: 1, name: 'x', types: [EnumCharType.Char], level: 1,
			str: 0, int: 0, dex: 1, spd: 1, luk: 1, maxhp: 1000, maxsp: 50,
		});
		const d2 = new Character({
			no: 2, name: 'y', types: [EnumCharType.Char], level: 1,
			str: 0, int: 0, dex: 1, spd: 1, luk: 1, maxhp: 1000, maxsp: 50,
		});
		const battle = new Battle([d1], [d2], { repo: repo2, rng });
		const res = battle.run();
		expect(res.outcome).toBe('draw');
	});
});

describe('Integration 2v2 (11.1)', () => {
	it('fixed seed yields a deterministic winner and a structured event log', () => {
		const rng = new RNG(12345);
		const time = new FakeTimeService();
		const p1 = newChar({ ...repo.getCharBase(100)!, str: 200 }, repo, rng);
		const p2 = newChar({ ...repo.getCharBase(100)!, str: 200 }, repo, rng);
		const m1 = newMon(repo.getMon(1000)!, repo, rng);
		const m2 = newMon(repo.getMon(1000)!, repo, rng);
		const battle = new Battle([p1, p2], [m1, m2], { repo, rng, time });
		const res = battle.run();

		expect(res.outcome).not.toBe('draw');
		expect(battle.log.length).toBeGreaterThan(0);
		expect(battle.log.some((e) => e.type === 'damage')).toBe(true);

		// 確定性：相同 seed 重跑得到相同結果與日誌長度
		const rng2 = new RNG(12345);
		const time2 = new FakeTimeService();
		const p1b = newChar({ ...repo.getCharBase(100)!, str: 200 }, repo, rng2);
		const p2b = newChar({ ...repo.getCharBase(100)!, str: 200 }, repo, rng2);
		const m1b = newMon(repo.getMon(1000)!, repo, rng2);
		const m2b = newMon(repo.getMon(1000)!, repo, rng2);
		const battle2 = new Battle([p1b, p2b], [m1b, m2b], { repo, rng: rng2, time: time2 });
		const res2 = battle2.run();
		expect(res2.outcome).toBe(res.outcome);
		expect(battle2.log.length).toBe(battle.log.length);
	});
});
