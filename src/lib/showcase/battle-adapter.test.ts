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
	EnumTeamSideUI,
	EnumUnitStatus,
	EnumActionType,
} from '#/components/battle/enums';
import { EnumPosition } from '#/lib/game/constants';
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
// 側別已翻轉：敵方＝左隊 EnumTeamSideUI.Left、我方＝右隊 EnumTeamSideUI.Right
describe('3.2 buildTeam / toBattleUnit', () => {
	const run = runShowcaseBattle({ charNos: [100, 102], monNos: [1000, 1002], seed: 11 });

	it('maps party and encounter into left/right teams with correct sizes', () => {
		const { leftTeam, rightTeam } = run.data;
		// left = enemies, right = allies
		expect(leftTeam.side).toBe(EnumTeamSideUI.Left);
		expect(rightTeam.side).toBe(EnumTeamSideUI.Right);
		expect(leftTeam.units).toHaveLength(2);
		expect(rightTeam.units).toHaveLength(2);
		expect(leftTeam.units.every((u) => u.side === EnumTeamSideUI.Left)).toBe(true);
		expect(rightTeam.units.every((u) => u.side === EnumTeamSideUI.Right)).toBe(true);
	});

	it('keeps name/level and HP/SP caps from seed definitions', () => {
		const { leftTeam, rightTeam } = run.data;

		// leftTeam = enemies → slime is on left
		const slime = leftTeam.units.find((u) => u.name === SEED.mon1002.name);
		expect(slime).toBeDefined();
		expect(slime!.level).toBe(SEED.mon1002.level);
		expect(slime!.maxHp).toBe(SEED.mon1002.maxhp);

		const warrior = rightTeam.units.find((u) => u.name === SEED.char100.name);
		expect(warrior).toBeDefined();
		expect(warrior!.level).toBe(SEED.char100.level);
		expect(warrior!.maxHp).toBe(SEED.char100.maxhp);
		expect(warrior!.maxSp).toBe(SEED.char100.maxsp);

		for (const u of [...leftTeam.units, ...rightTeam.units]) {
			expect(u.hp).toBeGreaterThanOrEqual(0);
			expect(u.hp).toBeLessThanOrEqual(u.maxHp);
			expect(u.sp).toBeGreaterThanOrEqual(0);
			expect(u.sp).toBeLessThanOrEqual(u.maxSp);
			expect([EnumUnitStatus.Alive, EnumUnitStatus.Down, EnumUnitStatus.Casting]).toContain(u.status);
			expect(u.unitUuid).toBeTruthy();
			expect(u.spd).toBeGreaterThan(0);
			expect([EnumPosition.Front, EnumPosition.Back]).toContain(u.position);
		}
	});

	it('dead units report status down and HP clamps at 0', () => {
		const repo = createSeedRepository();
		const rng = new RNG(1);
		const dead = newChar(repo.getCharBase(100)!, repo, rng);
		dead.STATE = EnumState.Dead;
		dead.HP = -20;

		const team = buildTeam('T', [dead], EnumTeamSideUI.Left);
		expect(team.units[0].status).toBe(EnumUnitStatus.Down);
		expect(team.units[0].hp).toBe(0);
		expect(team.units[0].maxHp).toBe(SEED.char100.maxhp);
	});
});

// ==================== 3.3 事件 → 日誌轉接 ====================
// Task 3.3: event → action adapter
// 側別翻轉後：100(我方)=EnumTeamSideUI.Right, 1000(敵方)=EnumTeamSideUI.Left
describe('3.3 mapBattleEvent', () => {
	const lookup: IUnitLookup = new Map<number, { name: string; side: EnumTeamSideUI }>([
		[100, { name: 'Warrior', side: EnumTeamSideUI.Right }],
		[1000, { name: 'GoblinAxe', side: EnumTeamSideUI.Left }],
	]);
	const repo = createSeedRepository();

	it('maps every known event type to its action type', () => {
		const events: IBattleEvent[] = [
			{ type: EnumBattleEventType.Act, actor: '100', skill: 1000 },
			{ type: EnumBattleEventType.Cast, actor: '100', skill: 2000 },
			{ type: EnumBattleEventType.Damage, actor: '100', target: '1000', skill: 1000, value: 42, hpBefore: 200, hpAfter: 158 },
			{ type: EnumBattleEventType.Heal, actor: '100', target: '1000', value: 10, hpBefore: 158, hpAfter: 168 },
			{ type: EnumBattleEventType.Guard, actor: '1000', target: '1000', text: 'barrier' },
			{ type: EnumBattleEventType.Death, target: '1000' },
			{ type: EnumBattleEventType.Poison, actor: '100', target: '1000', text: 'poisoned' },
		];
		const actions = events.map((ev) => mapBattleEvent(ev, lookup, repo));

		expect(actions).toHaveLength(events.length);
		expect(actions.map((a) => a.type)).toEqual([
			EnumActionType.Skill,
			EnumActionType.Casting,
			EnumActionType.Damage,
			EnumActionType.Heal,
			EnumActionType.Protect,
			EnumActionType.Down,
			EnumActionType.Result,
		]);

		// Act → skill
		expect(actions[0].type).toBe(EnumActionType.Skill);
		expect(actions[0].source).toBe('Warrior');

		// Cast 依 skill.type 決定文案（seed skill 2000 預設 casting）
		expect(actions[1].type).toBe(EnumActionType.Casting);
		expect(actions[1].source).toBe('Warrior');
		expect(actions[1].message).toMatch(/^start (charging|casting)\.$/);

		// Damage valueChange 格式 hpBefore > hpAfter
		expect(actions[2].type).toBe(EnumActionType.Damage);
		expect(actions[2].source).toBe('Warrior');
		expect(actions[2].target).toBe('GoblinAxe');
		expect(actions[2].value).toBe(42);
		expect(actions[2].valueChange).toBe('200 > 158');
		expect(actions[2].side).toBe(EnumTeamSideUI.Right);

		// Heal 沿用 valueChange
		expect(actions[3].type).toBe(EnumActionType.Heal);
		expect(actions[3].valueChange).toBe('158 > 168');

		// Guard（Barrier，actor === target）→ protect
		expect(actions[4].message).toContain('barrier');
		expect(actions[4].side).toBe(EnumTeamSideUI.Left);

		// Death → down，來源＝倒下者，側別＝目標側
		expect(actions[5].source).toBe('GoblinAxe');
		expect(actions[5].side).toBe(EnumTeamSideUI.Left);

		// 未知型別 → type result
		expect(actions[6].type).toBe(EnumActionType.Result);
		expect(actions[6].message).toBe('poisoned');
	});

	it('unknown type without text falls back to a message containing the type', () => {
		const action = mapBattleEvent({ type: EnumBattleEventType.Info }, lookup, repo);
		expect(action.type).toBe(EnumActionType.Result);
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
			if (ev.type === EnumBattleEventType.Act) {
				expect(action.type).toBe(EnumActionType.Skill);
				expect(names.has(action.source!)).toBe(true);
			} else if (ev.type === EnumBattleEventType.Damage) {
				expect(action.type).toBe(EnumActionType.Damage);
				expect(names.has(action.source!)).toBe(true);
				expect(names.has(action.target!)).toBe(true);
			} else if (ev.type === EnumBattleEventType.Heal) {
				expect(action.type).toBe(EnumActionType.Heal);
			} else if (ev.type === EnumBattleEventType.Death) {
				expect(action.type).toBe(EnumActionType.Down);
				expect(names.has(action.source!)).toBe(true);
			} else if (ev.type === EnumBattleEventType.Cast) {
				expect(action.type).toBe(EnumActionType.Casting);
				expect(names.has(action.source!)).toBe(true);
			} else if (ev.type === EnumBattleEventType.Guard) {
				expect(action.type).toBe(EnumActionType.Protect);
			} else {
				expect(action.type).toBe(EnumActionType.Result);
				expect(action.message).toBeTruthy();
			}
		});

		// 順序一致：damage 值序列逐筆相符
		const evDamage = events
			.filter((e) => e.type === EnumBattleEventType.Damage)
			.map((e) => e.value);
		const actDamage = data.actions
			.filter((a) => a.type === EnumActionType.Damage)
			.map((a) => a.value);
		expect(actDamage).toEqual(evDamage);
		expect(evDamage.length).toBeGreaterThan(0);
	});
});

// ==================== 3.4 結果轉接 ====================
// Task 3.4: result adapter
// 側別翻轉後：leftTeam = 敵方, rightTeam = 我方
describe('3.4 buildResultData', () => {
	it('win branch: ally wipeout names the ally team, winnerSide=EnumTeamSideUI.Right', () => {
		const run = runShowcaseBattle({
			charNos: [100, 101, 105],
			monNos: [1002],
			seed: 3,
			allyTeamName: 'My Party',
		});
		expect(run.outcome).toBe(EnumOutcome.Win);

		const result = run.data.result!;
		expect(result.winner).toBe('My Party');
		expect(result.winnerSide).toBe(EnumTeamSideUI.Right);
		expect(result.isDraw).toBe(false);
		// leftTeam = enemies
		expect(result.leftTeam.totalUnits).toBe(1);
		expect(result.leftTeam.hpRemain).toBe(0);
		// rightTeam = allies
		expect(result.rightTeam.alive).toBeGreaterThan(0);
		expect(result.rightTeam.totalUnits).toBe(3);
		expect(result.rightTeam.hpRemain).toBeGreaterThan(0);
		expect(result.rightTeam.totalMaxHp).toBeGreaterThan(0);
	});

	it('lose branch: our wipeout names the enemy team, winnerSide=EnumTeamSideUI.Left', () => {
		const run = runShowcaseBattle({
			charNos: [104],
			monNos: [1001],
			seed: 3,
			enemyTeamName: 'Dark Force',
		});
		expect(run.outcome).toBe(EnumOutcome.Lose);

		const result = run.data.result!;
		expect(result.winner).toBe('Dark Force');
		expect(result.winnerSide).toBe(EnumTeamSideUI.Left);
		expect(result.isDraw).toBe(false);
		// leftTeam = enemies (still standing on our loss), rightTeam = allies (wiped out)
		expect(result.leftTeam.alive).toBeGreaterThan(0);
		expect(result.rightTeam.alive).toBe(0);
	});

	it('draw branch: flags a draw without naming a winner', () => {
		const repo = createSeedRepository();
		const rng = new RNG(1);
		const a = newChar(repo.getCharBase(100)!, repo, rng);
		const b = newMon(repo.getMon(1000)!, repo, rng);

		const result = buildResultData({
			outcome: EnumOutcome.Draw,
			allyTeamName: DEFAULT_ALLY_TEAM_NAME,
			enemyTeamName: DEFAULT_ENEMY_TEAM_NAME,
			allyMembers: [a],
			enemyMembers: [b],
		});

		expect(result.isDraw).toBe(true);
		expect(result.winner).toBe('');
		expect(result.winnerSide).toBeUndefined();
		expect(result.rightTeam).toEqual({
			hpRemain: SEED.char100.maxhp,
			alive: 1,
			totalUnits: 1,
			totalDamage: 0,
			totalMaxHp: SEED.char100.maxhp,
		});
		expect(result.leftTeam.alive).toBe(1);
		expect(result.leftTeam.totalUnits).toBe(1);
	});

	it('totalDamage accumulates per side and totalMaxHp is set', () => {
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
			allyTeamName: 'L',
			enemyTeamName: 'R',
			allyMembers: [ally],
			enemyMembers: [enemy],
			events,
			lookup,
		});

		// leftTeam=enemies 收到 actor=1000 的傷害 12
		expect(result.leftTeam.totalDamage).toBe(12);
		// rightTeam=allies 收到 actor=100 的傷害 30
		expect(result.rightTeam.totalDamage).toBe(30);
		expect(result.rightTeam.totalMaxHp).toBe(ally.MAXHP);
		expect(result.leftTeam.totalMaxHp).toBe(enemy.MAXHP);
	});
});

// ==================== 3.5 精靈轉接 ====================
// Task 3.5: sprite adapter
// 名冊以敵方(EnumTeamSideUI.Left)在前、我方(EnumTeamSideUI.Right)在後
describe('3.5 buildSprites / buildPositionRoster', () => {
	const charNos = [100, 104];
	const monNos = [1000, 1002, 1001];
	const repo = createSeedRepository();
	const rng = new RNG(9);
	const { allies, enemies } = buildShowcaseTeams(charNos, monNos, repo, rng);
	const roster = buildPositionRoster(allies, enemies);
	const run = runShowcaseBattle({ charNos, monNos, seed: 9 });

	it('roster lists enemies(left) first then allies(right) with a real image', () => {
		expect(roster).toHaveLength(charNos.length + monNos.length);
		// 前半為敵方(EnumTeamSideUI.Left)，後半為我方(EnumTeamSideUI.Right)
		expect(roster.filter((r) => r.side === EnumTeamSideUI.Left)).toHaveLength(monNos.length);
		expect(roster.filter((r) => r.side === EnumTeamSideUI.Right)).toHaveLength(charNos.length);
		for (const r of roster) {
			expect(r.imageUrl).toMatch(/^\/image\/char\//);
			expect(r.imageUrl).not.toBe(SPRITE_PLACEHOLDER_URL);
			expect([EnumPosition.Front, EnumPosition.Back]).toContain(r.position);
			expect(r.imageSize.width).toBeGreaterThan(0);
			expect(r.imageSize.height).toBeGreaterThan(0);
		}
	});

	it('produces exactly one sprite per unit with unique ids and no missing image', () => {
		const units = [...run.data.leftTeam.units, ...run.data.rightTeam.units];
		const sprites = run.data.sprites;

		expect(sprites).toHaveLength(units.length);
		const spriteUids = sprites.map((s) => s.unitUuid);
		expect(new Set(spriteUids).size).toBe(units.length);
		expect(spriteUids.sort()).toEqual(units.map((u) => u.unitUuid).sort());

		for (const s of sprites) {
			expect(s.imageUrl).toMatch(/^\/image\/char\//);
			expect(s.imageUrl).not.toBe(SPRITE_PLACEHOLDER_URL);
		}
	});

	it('right(ally) team sprites are flipped, left(enemy) team unflipped', () => {
		const leftIds = new Set(run.data.leftTeam.units.map((u) => u.unitUuid));
		for (const s of run.data.sprites) {
			if (leftIds.has(s.unitUuid)) {
				// 敵方(EnumTeamSideUI.Left)使用 char/ 圖(預設朝右) → 不翻轉（面向場地中心的右側）
				expect(s.flipped).toBe(false);
			} else {
				// 我方(EnumTeamSideUI.Right)使用 char/ 圖(預設朝右) → 翻轉朝左
				expect(s.flipped).toBe(true);
			}
		}
	});
});
