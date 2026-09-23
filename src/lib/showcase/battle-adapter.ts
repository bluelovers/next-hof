// 展示頁戰鬥轉接層 / Showcase battle adapter
// 將引擎的「名冊 → 建隊 → 戰鬥執行」輸出轉為展示頁所需的 IBattleDisplayData
// 契約（隊伍/單位/日誌/結果/精靈）。以固定種子保證同輸入同結果，所有轉接函式
// 皆可獨立單元測試（OpenSpec 任務 3.1–3.5）。
// Bridges the engine's "roster → teams → battle run" output into the showcase
// IBattleDisplayData contract (teams/units/log/result/sprites). A fixed seed keeps
// runs reproducible, and every adapter function is unit-testable (tasks 3.1–3.5).
//
// 側別慣例（與 sprite-map.ts 一致）：我方＝左隊 'left'、敵方＝右隊 'right'。
// Side convention (matches sprite-map.ts): allies = left team, enemies = right team.

import { EnumState, EnumPosition, MAX_CHAR } from '#/lib/game/constants';
import { Battle } from '#/lib/game/battle/Battle';
import { EnumOutcome } from '#/lib/game/battle/BattleResult';
import { newChar, newMon } from '#/lib/game/character/factory';
import type { Character } from '#/lib/game/character/Character';
import { RNG } from '#/lib/game/core/rng';
import { createSeedRepository } from '#/lib/game/data/seed-data';
import type { IDataRepository } from '#/lib/game/data/repository';
import { EnumBattleEventType } from '#/lib/game/types';
import type { IBattleEvent } from '#/lib/game/types';
import { SPRITE_LAYOUT_WIDTH, SPRITE_LAYOUT_HEIGHT } from '#/components/battle/types';
import type {
	IBattleAction,
	IBattleDisplayData,
	IBattleResult,
	IBattleSprite,
	IBattleTeam,
	IBattleUnit,
	ITeamFinalStats,
	ITeamSide,
} from '#/components/battle/types';
import {
	computeBattleSpritePositions,
	groupBattleChars,
} from '#/components/battle/computeSpritePositions';
import type { IBattlePositionChar } from '#/components/battle/computeSpritePositions';
import { getSpriteImageSize } from '#/components/battle/spriteImageSizes';
import { getCharSpriteUrl, getMonSpriteUrl } from './sprite-map';

/** 預設戰鬥種子（固定，保證可重現）/ Default battle seed (fixed, reproducible) */
export const DEFAULT_SHOWCASE_SEED = 42;

/** 我方預設隊名 / Default ally team name */
export const DEFAULT_ALLY_TEAM_NAME = 'Adventure Party';

/** 敵方預設隊名（可用 encounter 名稱覆寫）/ Default enemy team name (overridable by encounter) */
export const DEFAULT_ENEMY_TEAM_NAME = 'Monster Party';

/** 展示頁預設標題 / Default showcase title */
export const DEFAULT_SHOWCASE_TITLE = '組隊戰鬥 / Team Battle';

/** 我方戰場背景（草地）/ Ally battlefield background (grass) */
const SHOWCASE_BATTLEFIELD_BG = '/image/land/bg_grass.png';

/**
 * 單位名稱／側別查詢條目（事件 actor/target 為 `String(no)`，需 no → 名稱/side）
 * Unit name/side lookup entry (event actor/target are `String(no)`; needs no → name/side)
 */
export interface IUnitRef {
	/** 單位名稱（查無時回傳原始 no 字串）/ Unit name (raw no string when unknown) */
	name: string;
	/** 隊伍側 / Team side */
	side: ITeamSide;
}

/** no → 單位查詢表 / no → unit lookup */
export interface IUnitLookup extends ReadonlyMap<number, IUnitRef> {}

/**
 * 轉接層輸入：我方角色 def no、敵方怪物 def no、固定種子與隊名
 * Adapter input: ally char def nos, enemy mon def nos, seed, and team names
 */
export interface IShowcaseBattleInput {
	/** 我方角色 def no（1–MAX_CHAR 人，順序即隊伍順序）/ ally char def nos (1–MAX_CHAR) */
	charNos: readonly number[];
	/** 敵方怪物 def no（來自 encounter 選項）/ enemy monster def nos (from encounter) */
	monNos: readonly number[];
	/** RNG 種子（預設 DEFAULT_SHOWCASE_SEED）/ RNG seed (default DEFAULT_SHOWCASE_SEED) */
	seed?: number;
	/** 我方隊名（預設 DEFAULT_ALLY_TEAM_NAME）/ ally team name */
	allyTeamName?: string;
	/** 敵方隊名（預設 DEFAULT_ENEMY_TEAM_NAME）/ enemy team name */
	enemyTeamName?: string;
	/** 標題（預設 DEFAULT_SHOWCASE_TITLE）/ title (default DEFAULT_SHOWCASE_TITLE) */
	title?: string;
	/** 顯示時間字串（可省略）/ optional display time string */
	time?: string;
}

/**
 * 轉接層輸出：完整展示資料＋引擎判定
 * Adapter output: full display data plus the engine outcome
 */
export interface IShowcaseBattleOutcome {
	/** 展示頁完整資料 / Full display data */
	data: IBattleDisplayData;
	/** 引擎判定（team0＝我方視角）/ Engine outcome (team0 = our side) */
	outcome: EnumOutcome;
	/** 已進行回合數 / Turns played */
	turns: number;
	/** 原始事件日誌（與 data.actions 一對一）/ Raw event log (1:1 with data.actions) */
	events: readonly IBattleEvent[];
}

/**
 * 依 def no 建立我方與敵方兩隊角色（任務 3.1）
 * Build ally and enemy characters from def nos (task 3.1)
 *
 * @param charNos 我方角色 def no / ally char def nos
 * @param monNos 敵方怪物 def nos / enemy monster def nos
 * @param repo 資料倉庫 / data repository
 * @param rng 隨機源（同一種子 → 同一序列）/ random source (same seed → same sequence)
 */
export function buildShowcaseTeams(
	charNos: readonly number[],
	monNos: readonly number[],
	repo: IDataRepository,
	rng: RNG,
): { allies: Character[]; enemies: Character[] } {
	const allies = charNos.map((no) => {
		const def = repo.getCharBase(no);
		if (!def) throw new Error(`Unknown char def no: ${no} / 找不到角色定義 no=${no}`);
		return newChar(def, repo, rng);
	});
	const enemies = monNos.map((no) => {
		const def = repo.getMon(no);
		if (!def) throw new Error(`Unknown mon def no: ${no} / 找不到怪物定義 no=${no}`);
		return newMon(def, repo, rng);
	});
	return { allies, enemies };
}

/**
 * 單位轉接：Character → IBattleUnit（任務 3.2）
 * Unit adapter: Character → IBattleUnit (task 3.2)
 *
 * hp/sp 顯示值夾限於 0 起（引擎可能留下負值），status 依 STATE／詠唱中判定。
 * Display hp/sp clamp at 0 (engine may leave negatives); status from STATE/charging.
 */
export function toBattleUnit(c: Character, side: ITeamSide): IBattleUnit {
	return {
		name: c.name,
		level: c.level,
		hp: Math.max(0, c.HP),
		maxHp: c.MAXHP,
		sp: Math.max(0, c.SP),
		maxSp: c.MAXSP,
		status: c.STATE === EnumState.Dead ? 'down' : c.expect !== null ? 'casting' : 'alive',
		spriteId: c.uniqid,
		side,
	};
}

/**
 * 隊伍轉接：成員清單 → IBattleTeam（任務 3.2）
 * Team adapter: member list → IBattleTeam (task 3.2)
 */
export function buildTeam(
	name: string,
	members: readonly Character[],
	side: ITeamSide,
): IBattleTeam {
	return { name, units: members.map((c) => toBattleUnit(c, side)), side };
}

/**
 * 建立 no → { name, side } 查詢表（我方先建、敵方後建；seed 編號互斥）
 * Build the no → { name, side } lookup (allies first, enemies after; seed nos are disjoint)
 */
export function buildUnitLookup(
	allies: readonly Character[],
	enemies: readonly Character[],
): IUnitLookup {
	const lookup = new Map<number, IUnitRef>();
	for (const c of allies) lookup.set(c.no, { name: c.name, side: 'left' });
	for (const c of enemies) lookup.set(c.no, { name: c.name, side: 'right' });
	return lookup;
}

/** 事件角色解析結果 / Resolved event participant */
interface IResolvedRef {
	/** 名稱（查無時為原始 no 字串；未提供時 undefined）/ name (raw no when unknown; undefined if absent) */
	name?: string;
	/** 隊伍側（查無時 undefined）/ team side (undefined when unknown) */
	side?: ITeamSide;
}

/**
 * 將事件的 actor/target no 字串解析為名稱與側別
 * Resolve an event actor/target no string into a name and side
 */
function resolveRef(key: string | undefined, lookup: IUnitLookup): IResolvedRef {
	if (key === undefined) return {};
	const info = lookup.get(Number(key));
	return { name: info?.name ?? key, side: info?.side };
}

/**
 * 事件轉接：IBattleEvent → IBattleAction（任務 3.3）
 * Event adapter: IBattleEvent → IBattleAction (task 3.3)
 *
 * 對應：Damage→damage、Heal→heal、Guard→protect、Death→down、Cast→casting，
 * 未知型別以 type 'result' + message 文字 fallback，確保 N 事件 → N 條日誌。
 * Mapping: Damage→damage, Heal→heal, Guard→protect, Death→down, Cast→casting;
 * unknown types fall back to type 'result' + a message so N events → N entries.
 */
export function mapBattleEvent(
	ev: IBattleEvent,
	lookup: IUnitLookup,
	repo?: IDataRepository,
): IBattleAction {
	const actor = resolveRef(ev.actor, lookup);
	const target = resolveRef(ev.target, lookup);
	/** 行動歸屬側別：優先 actor，其次 target（Death 只有 target）/ owning side: actor first, target fallback */
	const side = actor.side ?? target.side;
	const skillName = ev.skill !== undefined ? repo?.getSkill(ev.skill)?.name : undefined;

	switch (ev.type) {
		case EnumBattleEventType.Damage: {
			const value = ev.value ?? 0;
			const message = target.name ? `${value} Damage to ${target.name}` : `${value} Damage`;
			return {
				type: 'damage',
				source: actor.name,
				target: target.name,
				value,
				valueChange: actor.name ? `by ${actor.name}` : undefined,
				message,
				side,
				attribute: 'dmg',
				skill: skillName ? { name: skillName } : undefined,
			};
		}
		case EnumBattleEventType.Heal: {
			const value = ev.value ?? 0;
			const message = target.name ? `${value} Heal to ${target.name}` : `${value} Heal`;
			return {
				type: 'heal',
				source: actor.name,
				target: target.name,
				value,
				valueChange: actor.name ? `by ${actor.name}` : undefined,
				message,
				side,
				attribute: 'recover',
				skill: skillName ? { name: skillName } : undefined,
			};
		}
		case EnumBattleEventType.Guard: {
			// 現行生產點僅 Barrier（actor === target）；保留 actor ≠ target 的守護分支
			// Current producer is Barrier only (actor === target); keep the actor ≠ target branch
			const message =
				actor.name && target.name && actor.name !== target.name
					? `${actor.name} protected ${target.name}!`
					: `${actor.name ?? 'Unknown'} blocked the attack with barrier!`;
			return {
				type: 'protect',
				source: actor.name,
				target: target.name,
				message,
				side,
				attribute: 'support',
			};
		}
		case EnumBattleEventType.Death: {
			const name = target.name ?? 'Unknown';
			return {
				type: 'down',
				source: name,
				target: target.name,
				message: `${name} down.`,
				side: target.side,
				attribute: 'dmg',
			};
		}
		case EnumBattleEventType.Cast: {
			const who = actor.name ?? 'Unknown';
			const message = skillName
				? `${who} start casting ${skillName}.`
				: `${who} start casting.`;
			return {
				type: 'casting',
				source: actor.name,
				message,
				side,
				attribute: 'charge',
				skill: skillName ? { name: skillName } : undefined,
			};
		}
		default: {
			// 未知/未實作事件型別：以 text 或型別＋名稱組出 fallback 文字
			// Unknown/unimplemented type: fall back to text, or type plus names
			const message =
				ev.text ??
				`${actor.name ?? ''} ${ev.type}${target.name ? ` ${target.name}` : ''}`.trim();
			return {
				type: 'result',
				source: actor.name,
				target: target.name,
				message,
				side,
				attribute: 'normal',
			};
		}
	}
}

/** 結果轉接輸入 / Result adapter input */
export interface IResultDataInput {
	/** 引擎判定 / Engine outcome */
	outcome: EnumOutcome;
	/** 我方（左隊）名稱 / Left (ally) team name */
	leftTeamName: string;
	/** 敵方（右隊）名稱 / Right (enemy) team name */
	rightTeamName: string;
	/** 我方成員 / Left team members */
	leftMembers: readonly Character[];
	/** 敵方成員 / Right team members */
	rightMembers: readonly Character[];
	/** 事件日誌（供 totalDamage 彙總）/ event log (for totalDamage) */
	events?: readonly IBattleEvent[];
	/** no → 單位查詢表 / no → unit lookup */
	lookup?: IUnitLookup;
}

/**
 * 建立單隊最終統計（hpRemain／alive／totalUnits／totalDamage）
 * Build one team's final stats (hpRemain/alive/totalUnits/totalDamage)
 */
function buildTeamStats(
	members: readonly Character[],
	side: ITeamSide,
	events: readonly IBattleEvent[] | undefined,
	lookup: IUnitLookup | undefined,
): ITeamFinalStats {
	let hpRemain = 0;
	let alive = 0;
	for (const c of members) {
		hpRemain += Math.max(0, c.HP);
		if (c.STATE !== EnumState.Dead) alive++;
	}
	let totalDamage = 0;
	for (const ev of events ?? []) {
		if (ev.type !== EnumBattleEventType.Damage) continue;
		const info = ev.actor !== undefined ? lookup?.get(Number(ev.actor)) : undefined;
		if (info?.side === side) totalDamage += ev.value ?? 0;
	}
	return { hpRemain, alive, totalUnits: members.length, totalDamage };
}

/**
 * 結果轉接：引擎判定 → IBattleResult（任務 3.4）
 * Result adapter: engine outcome → IBattleResult (task 3.4)
 *
 * Win → winner＝我方名；Lose → winner＝敵方名；Draw → winner ''＋isDraw true
 * （UI 於 isDraw 時顯示「Draw!」）。
 */
export function buildResultData(input: IResultDataInput): IBattleResult {
	const { outcome, leftTeamName, rightTeamName, leftMembers, rightMembers } = input;
	const isDraw = outcome === EnumOutcome.Draw;
	const winner =
		outcome === EnumOutcome.Win
			? leftTeamName
			: outcome === EnumOutcome.Lose
				? rightTeamName
				: '';
	return {
		winner,
		isDraw,
		leftTeam: buildTeamStats(leftMembers, 'left', input.events, input.lookup),
		rightTeam: buildTeamStats(rightMembers, 'right', input.events, input.lookup),
	};
}

/**
 * 精靈名冊轉接：Character[] → IBattlePositionChar[]（側別＋站位＋圖檔，任務 3.5）
 * Sprite roster adapter: Character[] → IBattlePositionChar[] (side/row/image, task 3.5)
 *
 * 圖檔經 sprite-map（查無回傳 placeholder）；站位取引擎實際 POSITION（開戰隨機），
 * 右隊 char/ 圖由 computeBattleSpritePositions 自動翻轉朝左。
 */
export function buildPositionRoster(
	allies: readonly Character[],
	enemies: readonly Character[],
): IBattlePositionChar[] {
	const toEntry = (c: Character, side: ITeamSide, imageUrl: string): IBattlePositionChar => ({
		id: c.uniqid,
		name: c.name,
		imageUrl,
		imageSize: getSpriteImageSize(imageUrl),
		position: c.POSITION === EnumPosition.Back ? 'back' : 'front',
		side,
	});
	return [
		...allies.map((c) => toEntry(c, 'left', getCharSpriteUrl(c.no))),
		...enemies.map((c) => toEntry(c, 'right', getMonSpriteUrl(c.no))),
	];
}

/**
 * 精靈定位轉接：名冊 → groupBattleChars → computeBattleSpritePositions（任務 3.5）
 * Sprite position adapter: roster → groupBattleChars → computeBattleSpritePositions (task 3.5)
 */
export function buildSprites(
	allies: readonly Character[],
	enemies: readonly Character[],
): IBattleSprite[] {
	const roster = buildPositionRoster(allies, enemies);
	return computeBattleSpritePositions(groupBattleChars(roster), {
		width: SPRITE_LAYOUT_WIDTH,
		height: SPRITE_LAYOUT_HEIGHT,
	});
}

/**
 * 執行一整場展示戰鬥並產出 IBattleDisplayData（任務 3.1–3.5 整合入口）
 * Run a full showcase battle and produce IBattleDisplayData (integration entry, tasks 3.1–3.5)
 *
 * 即時結算：同步呼叫 Battle.run() 跑完整場（毫秒級），無逐步播放。
 * Settles in one shot: calls Battle.run() synchronously to completion (millisecond-scale).
 */
export function runShowcaseBattle(input: IShowcaseBattleInput): IShowcaseBattleOutcome {
	if (input.charNos.length < 1 || input.charNos.length > MAX_CHAR) {
		throw new Error(
			`Party size must be 1..${MAX_CHAR}: got ${input.charNos.length} / 隊伍人數須為 1–${MAX_CHAR} 人`,
		);
	}
	if (input.monNos.length < 1) {
		throw new Error('Encounter needs at least one monster / encounter 至少要有 1 隻怪物');
	}

	const repo = createSeedRepository();
	const rng = new RNG(input.seed ?? DEFAULT_SHOWCASE_SEED);
	const { allies, enemies } = buildShowcaseTeams(input.charNos, input.monNos, repo, rng);

	const battle = new Battle(allies, enemies, { repo, rng });
	const engineResult = battle.run();

	const allyTeamName = input.allyTeamName ?? DEFAULT_ALLY_TEAM_NAME;
	const enemyTeamName = input.enemyTeamName ?? DEFAULT_ENEMY_TEAM_NAME;

	const lookup = buildUnitLookup(allies, enemies);
	const data: IBattleDisplayData = {
		title: input.title ?? DEFAULT_SHOWCASE_TITLE,
		time: input.time,
		leftTeam: buildTeam(allyTeamName, allies, 'left'),
		rightTeam: buildTeam(enemyTeamName, enemies, 'right'),
		battlefield: {
			backgroundImageUrl: SHOWCASE_BATTLEFIELD_BG,
			backgroundType: 'grass',
			width: SPRITE_LAYOUT_WIDTH,
			height: SPRITE_LAYOUT_HEIGHT,
		},
		sprites: buildSprites(allies, enemies),
		actions: battle.log.map((ev) => mapBattleEvent(ev, lookup, repo)),
		result: buildResultData({
			outcome: engineResult.outcome,
			leftTeamName: allyTeamName,
			rightTeamName: enemyTeamName,
			leftMembers: allies,
			rightMembers: enemies,
			events: battle.log,
			lookup,
		}),
	};

	return {
		data,
		outcome: engineResult.outcome,
		turns: engineResult.turns,
		events: battle.log,
	};
}
