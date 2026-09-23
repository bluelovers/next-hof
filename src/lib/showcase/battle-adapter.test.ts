import { describe, it, expect } from 'vitest';
import { EnumOutcome } from '#/lib/game/battle/BattleResult';
import { EnumState, MAX_CHAR } from '#/lib/game/constants';
import { RNG } from '#/lib/game/core/rng';
import { createSeedRepository, SEED } from '#/lib/game/data/seed-data';
import { newChar, newMon } from '#/lib/game/character/factory';
import { EnumBattleEventType } from '#/lib/game/types';
import type { IBattleEvent } from '#/lib/game/types';
import { SPRITE_PLACEHOLDER_URL } from './sprite-map';
import {
	DEFAULT_ALLY_TEAM_NAME,
	DEFAULT_ENEMY_TEAM_NAME,
	buildPositionRoster,
	buildResultData,
	buildShowcaseTeams,
	buildTeam,
	buildUnitLookup,
	mapBattleEvent,
	runShowcaseBattle,
	type IUnitLookup,
} from './battle-adapter';

// ==================== 3.1 固定種子跑完整場 ====================
// Task 3.1: run a complete battle with a fixed seed
describe('3.1 runShowcaseBattle', () => {
	it('completes a battle with outcome in {win, lose, draw} and is reproducible', () => {
		const input = { charNos: [100, 101], monNos: [1000], seed: 7 };
		const a = runShowcaseBattle(input);

		expect([EnumOutcome.Win, EnumOutcome.Lose, EnumOutcome.Draw]).toContain(a.outcome);
		expect(a.turns).toBeGreaterThan(0);
		expect(a.events.length).toBeGreaterThan(0);
		expect(a.data.actions.length).toBe(a.events.length);

		const b = runShowcaseBattle(input);
		expect(b.outcome).toBe(a.outcome);
		expect(b.turns).toBe(a.turns);
		expect(b.data.actions).toEqual(a.data.actions);
	});

	it('rejects a party below 1 or above MAX_CHAR', () => {
		expect(() => runShowcaseBattle({ charNos: [], monNos: [1000] })).toThrow();
		const sixNos = SEED.chars.slice(0, MAX_CHAR + 1).map((c) => c.no);
		expect(sixNos).toHaveLength(MAX_CHAR + 1);
		expect(() => runShowcaseBattle({ charNos: sixNos, monNos: [1000] })).toThrow();
	});

	it('rejects an empty encounter', () => {
		expect(() => runShowcaseBattle({ charNos: [100], monNos: [] })).toThrow();
	});
});

// ==================== 3.2 單位/隊伍轉接 ====================
// Task 3.2: unit/team adapter
describe('3.2 buildTeam / toBattleUnit', () => {
	const run = runShowcaseBattle({ charNos: [100, 102], monNos: [1000, 1002], seed: 11 });

	it('maps party and encounter into left/right teams with correct sizes', () => {
		const { leftTeam, rightTeam } = run.data;
		expect(leftTeam.side).toBe('left');
		expect(rightTeam.side).toBe('right');
		expect(leftTeam.units).toHaveLength(2);
		expect(rightTeam.units).toHaveLength(2);
		expect(leftTeam.units.every((u) => u.side === 'left')).toBe(true);
		expect(rightTeam.units.every((u) => u.side === 'right')).toBe(true);
	});

	it('keeps name/level and HP/SP caps from seed definitions', () => {
		const { leftTeam, rightTeam } = run.data;

		const warrior = leftTeam.units.find((u) => u.name === SEED.char100.name);
		expect(warrior).toBeDefined();
		expect(warrior!.level).toBe(SEED.char100.level);
		expect(warrior!.maxHp).toBe(SEED.char100.maxhp);
		expect(warrior!.maxSp).toBe(SEED.char100.maxsp);

		const slime = rightTeam.units.find((u) => u.name === SEED.mon1002.name);
		expect(slime).toBeDefined();
		expect(slime!.level).toBe(SEED.mon1002.level);
		expect(slime!.maxHp).toBe(SEED.mon1002.maxhp);

		for (const u of [...leftTeam.units, ...rightTeam.units]) {
			expect(u.hp).toBeGreaterThanOrEqual(0);
			expect(u.hp).toBeLessThanOrEqual(u.maxHp);
			expect(u.sp).toBeGreaterThanOrEqual(0);
			expect(u.sp).toBeLessThanOrEqual(u.maxSp);
			expect(['alive', 'down', 'casting']).toContain(u.status);
			expect(u.spriteId).toBeTruthy();
		}
	});

	it('dead units report status down and HP clamps at 0', () => {
		const repo = createSeedRepository();
		const rng = new RNG(1);
		const dead = newChar(repo.getCharBase(100)!, repo, rng);
		dead.STATE = EnumState.Dead;
		dead.HP = -20;

		const team = buildTeam('T', [dead], 'left');
		expect(team.units[0].status).toBe('down');
		expect(team.units[0].hp).toBe(0);
		expect(team.units[0].maxHp).toBe(SEED.char100.maxhp);
	});
});

// ==================== 3.3 事件 → 日誌轉接 ====================
// Task 3.3: event → action adapter
describe('3.3 mapBattleEvent', () => {
	const lookup: IUnitLookup = new Map<number, { name: string; side: 'left' | 'right' }>([
		[100, { name: 'Warrior', side: 'left' }],
		[1000, { name: 'GoblinAxe', side: 'right' }],
	]);
	const repo = createSeedRepository();

	it('maps every known event type to its action type', () => {
		const events: IBattleEvent[] = [
			{ type: EnumBattleEventType.Damage, actor: '100', target: '1000', skill: 1000, value: 42 },
			{ type: EnumBattleEventType.Heal, actor: '100', target: '1000', value: 10 },
			{ type: EnumBattleEventType.Guard, actor: '1000', target: '1000', text: 'barrier' },
			{ type: EnumBattleEventType.Death, target: '1000' },
			{ type: EnumBattleEventType.Cast, actor: '100', skill: 2000 },
			{ type: EnumBattleEventType.Poison, actor: '100', target: '1000', text: 'poisoned' },
		];
		const actions = events.map((ev) => mapBattleEvent(ev, lookup, repo));

		expect(actions).toHaveLength(events.length);
		expect(actions.map((a) => a.type)).toEqual([
			'damage',
			'heal',
			'protect',
			'down',
			'casting',
			'result',
		]);

		expect(actions[0].source).toBe('Warrior');
		expect(actions[0].target).toBe('GoblinAxe');
		expect(actions[0].value).toBe(42);
		expect(actions[0].message).toContain('GoblinAxe');
		expect(actions[0].side).toBe('left');

		expect(actions[1].source).toBe('Warrior');
		expect(actions[1].value).toBe(10);
		expect(actions[1].side).toBe('left');

		// Guard（Barrier，actor === target）→ protect，訊息含 protected/barrier 供 ProtectMessage 分割
		expect(actions[2].message).toContain('barrier');
		expect(actions[2].side).toBe('right');

		// Death → down，來源＝倒下者，側別＝目標側
		expect(actions[3].source).toBe('GoblinAxe');
		expect(actions[3].side).toBe('right');

		expect(actions[4].source).toBe('Warrior');
		expect(actions[4].side).toBe('left');

		// 未知型別 → type 'result'，訊息 fallback 為 event.text
		expect(actions[5].type).toBe('result');
		expect(actions[5].message).toBe('poisoned');
	});

	it('unknown type without text falls back to a message containing the type', () => {
		const action = mapBattleEvent({ type: EnumBattleEventType.Info }, lookup, repo);
		expect(action.type).toBe('result');
		expect(action.message).toContain(EnumBattleEventType.Info);
	});

	it('a real battle produces N actions for N events, in order, with actor/target names', () => {
		const run = runShowcaseBattle({ charNos: [100, 104], monNos: [1000, 1002], seed: 5 });
		const { events, data } = run;

		expect(events.length).toBeGreaterThan(0);
		expect(data.actions).toHaveLength(events.length);

		const names = new Set(
			[...data.leftTeam.units, ...data.rightTeam.units].map((u) => u.name),
		);

		events.forEach((ev, i) => {
			const action = data.actions[i];
			if (ev.type === EnumBattleEventType.Damage) {
				expect(action.type).toBe('damage');
				expect(names.has(action.source!)).toBe(true);
				expect(names.has(action.target!)).toBe(true);
			} else if (ev.type === EnumBattleEventType.Heal) {
				expect(action.type).toBe('heal');
			} else if (ev.type === EnumBattleEventType.Death) {
				expect(action.type).toBe('down');
				expect(names.has(action.source!)).toBe(true);
			} else if (ev.type === EnumBattleEventType.Cast) {
				expect(action.type).toBe('casting');
				expect(names.has(action.source!)).toBe(true);
			} else if (ev.type === EnumBattleEventType.Guard) {
				expect(action.type).toBe('protect');
			} else {
				expect(action.type).toBe('result');
				expect(action.message).toBeTruthy();
			}
		});

		// 順序一致：damage 值序列逐筆相符
		const evDamage = events
			.filter((e) => e.type === EnumBattleEventType.Damage)
			.map((e) => e.value);
		const actDamage = data.actions
			.filter((a) => a.type === 'damage')
			.map((a) => a.value);
		expect(actDamage).toEqual(evDamage);
		expect(evDamage.length).toBeGreaterThan(0);
	});
});

// ==================== 3.4 結果轉接 ====================
// Task 3.4: result adapter
describe('3.4 buildResultData', () => {
	it('win branch: ally wipeout of the encounter names the ally team', () => {
		const run = runShowcaseBattle({
			charNos: [100, 101, 105],
			monNos: [1002],
			seed: 3,
			allyTeamName: 'My Party',
		});
		expect(run.outcome).toBe(EnumOutcome.Win);

		const result = run.data.result!;
		expect(result.winner).toBe('My Party');
		expect(result.isDraw).toBe(false);
		expect(result.leftTeam.alive).toBeGreaterThan(0);
		expect(result.leftTeam.totalUnits).toBe(3);
		expect(result.leftTeam.hpRemain).toBeGreaterThan(0);
		expect(result.rightTeam.alive).toBe(0);
		expect(result.rightTeam.totalUnits).toBe(1);
		expect(result.rightTeam.hpRemain).toBe(0);
	});

	it('lose branch: our wipeout names the enemy team', () => {
		const run = runShowcaseBattle({
			charNos: [104],
			monNos: [1001],
			seed: 3,
			enemyTeamName: 'Dark Force',
		});
		expect(run.outcome).toBe(EnumOutcome.Lose);

		const result = run.data.result!;
		expect(result.winner).toBe('Dark Force');
		expect(result.isDraw).toBe(false);
		expect(result.leftTeam.alive).toBe(0);
		expect(result.rightTeam.alive).toBeGreaterThan(0);
	});

	it('draw branch: flags a draw without naming a winner', () => {
		const repo = createSeedRepository();
		const rng = new RNG(1);
		const a = newChar(repo.getCharBase(100)!, repo, rng);
		const b = newMon(repo.getMon(1000)!, repo, rng);

		const result = buildResultData({
			outcome: EnumOutcome.Draw,
			leftTeamName: DEFAULT_ALLY_TEAM_NAME,
			rightTeamName: DEFAULT_ENEMY_TEAM_NAME,
			leftMembers: [a],
			rightMembers: [b],
		});

		expect(result.isDraw).toBe(true);
		expect(result.winner).toBe('');
		expect(result.leftTeam).toEqual({
			hpRemain: SEED.char100.maxhp,
			alive: 1,
			totalUnits: 1,
			totalDamage: 0,
		});
		expect(result.rightTeam.alive).toBe(1);
		expect(result.rightTeam.totalUnits).toBe(1);
	});

	it('totalDamage accumulates per side from Damage events', () => {
		const repo = createSeedRepository();
		const rng = new RNG(1);
		const ally = newChar(repo.getCharBase(100)!, repo, rng);
		const enemy = newMon(repo.getMon(1000)!, repo, rng);
		const lookup = buildUnitLookup([ally], [enemy]);
		const events: IBattleEvent[] = [
			{ type: EnumBattleEventType.Damage, actor: '100', target: '1000', value: 30 },
			{ type: EnumBattleEventType.Damage, actor: '1000', target: '100', value: 12 },
			{ type: EnumBattleEventType.Heal, actor: '100', target: '100', value: 5 },
		];

		const result = buildResultData({
			outcome: EnumOutcome.Win,
			leftTeamName: 'L',
			rightTeamName: 'R',
			leftMembers: [ally],
			rightMembers: [enemy],
			events,
			lookup,
		});

		expect(result.leftTeam.totalDamage).toBe(30);
		expect(result.rightTeam.totalDamage).toBe(12);
	});
});

// ==================== 3.5 精靈轉接 ====================
// Task 3.5: sprite adapter
describe('3.5 buildSprites / buildPositionRoster', () => {
	const charNos = [100, 104];
	const monNos = [1000, 1002, 1001];
	const repo = createSeedRepository();
	const rng = new RNG(9);
	const { allies, enemies } = buildShowcaseTeams(charNos, monNos, repo, rng);
	const roster = buildPositionRoster(allies, enemies);
	const run = runShowcaseBattle({ charNos, monNos, seed: 9 });

	it('roster marks allies left / enemies right with a real image and a valid row', () => {
		expect(roster).toHaveLength(charNos.length + monNos.length);
		expect(roster.filter((r) => r.side === 'left')).toHaveLength(charNos.length);
		expect(roster.filter((r) => r.side === 'right')).toHaveLength(monNos.length);
		for (const r of roster) {
			expect(r.imageUrl).toMatch(/^\/image\/char\//);
			expect(r.imageUrl).not.toBe(SPRITE_PLACEHOLDER_URL);
			expect(r.position === 'front' || r.position === 'back').toBe(true);
			expect(r.imageSize.width).toBeGreaterThan(0);
			expect(r.imageSize.height).toBeGreaterThan(0);
		}
	});

	it('produces exactly one sprite per unit with unique ids and no missing image', () => {
		const units = [...run.data.leftTeam.units, ...run.data.rightTeam.units];
		const sprites = run.data.sprites;

		expect(sprites).toHaveLength(units.length);
		const spriteIds = sprites.map((s) => s.id);
		expect(new Set(spriteIds).size).toBe(units.length);
		expect(spriteIds.sort()).toEqual(units.map((u) => u.spriteId).sort());

		for (const s of sprites) {
			expect(s.imageUrl).toMatch(/^\/image\/char\//);
			expect(s.imageUrl).not.toBe(SPRITE_PLACEHOLDER_URL);
		}
	});

	it('flips the enemy (right) team sprites and keeps ally sprites unflipped', () => {
		const allyIds = new Set(run.data.leftTeam.units.map((u) => u.spriteId));
		for (const s of run.data.sprites) {
			if (allyIds.has(s.id)) {
				expect(s.flipped).toBe(false);
			} else {
				// char/ 圖預設朝右；右隊自動鏡像朝左
				// /image/char/ faces right; the right team is auto-mirrored to face left
				expect(s.flipped).toBe(true);
			}
		}
	});
});
