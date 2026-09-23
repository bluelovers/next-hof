import { describe, it, expect } from 'vitest';
import {
	MAX_TIME, START_TIME, TIME_GAIN_DAY, MAX_CHAR, MAX_LEVEL, MAX_STATUS,
	GET_STATUS_POINT, GET_SKILL_POINT, NORMAL_BATTLE_TIME, ENEMY_INCREASE,
	BATTLE_MAX_TURNS, TURN_EXTENDS, BATTLE_MAX_EXTENDS, MAX_STATUS_MAXIMUM,
	DELAY_TYPE, DELAY_BASE, UNION_BATTLE_TIME, UNION_BATTLE_NEXT,
} from './constants';

describe('game constants', () => {
	it('exposes documented values', () => {
		expect(MAX_TIME).toBe(1000);
		expect(START_TIME).toBe(900);
		expect(TIME_GAIN_DAY).toBe(6000);
		expect(MAX_CHAR).toBe(5);
		expect(MAX_LEVEL).toBe(50);
		expect(MAX_STATUS).toBe(250);
		expect(GET_STATUS_POINT).toBe(5);
		expect(GET_SKILL_POINT).toBe(2);
		expect(NORMAL_BATTLE_TIME).toBe(1);
		expect(ENEMY_INCREASE).toBe(1);
		expect(BATTLE_MAX_TURNS).toBe(100);
		expect(TURN_EXTENDS).toBe(20);
		expect(BATTLE_MAX_EXTENDS).toBe(100);
		expect(MAX_STATUS_MAXIMUM).toBe(2500);
		expect(DELAY_TYPE).toBe(1);
		expect(DELAY_BASE).toBe(5);
		expect(UNION_BATTLE_TIME).toBe(10);
		expect(UNION_BATTLE_NEXT).toBe(1200);
	});
});
