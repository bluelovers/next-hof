// 展示頁戰鬥轉接層 / Showcase battle adapter
// 將引擎的「名冊 → 建隊 → 戰鬥執行」輸出轉為展示頁所需的 IBattleDisplayData
// 契約（隊伍/單位/日誌/結果/精靈）。以固定種子保證同輸入同結果，所有轉接函式
// 皆可獨立單元測試（OpenSpec 任務 3.1–3.5）。
//
// 側別慣例（與原版頁面一致）：敵方＝左隊 'left'、我方＝右隊 'right'。
// Side convention (matches the original page): enemies = left team 'left', allies = right team 'right'.

import { EnumState, EnumPosition, EnumTeamSide, MAX_CHAR } from '#/lib/game/constants';
import { Battle } from '#/lib/game/battle/Battle';
import { EnumOutcome } from '#/lib/game/battle/BattleResult';
import { newChar, newMon } from '#/lib/game/character/factory';
import type { Character } from '#/lib/game/character/Character';
import { RNG } from '#/lib/game/core/rng';
import { createSeedRepository } from '#/lib/game/data/seed-data';
import type { IDataRepository } from '#/lib/game/data/repository';
import { EnumBattleEventType, EnumSkillDamageType } from '#/lib/game/types';
import type { IBattleEvent, IBattleSnapshot } from '#/lib/game/types';
import { SPRITE_LAYOUT_WIDTH, SPRITE_LAYOUT_HEIGHT } from '#/components/battle/types';
import { EnumTeamSideUI, EnumChargeKind, EnumUnitStatus, EnumActionType, EnumAttributeType } from '#/components/battle/enums';
import type {
	IBattleAction,
	IBattleDisplayData,
	IBattleResult,
	IBattleSprite,
	IBattleTeam,
	IBattleUnit,
	IBattleSnapshotDisplay,
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
		status: c.STATE === EnumState.Dead ? EnumUnitStatus.Down : c.expect !== null ? EnumUnitStatus.Casting : EnumUnitStatus.Alive,
		unitUuid: c.unitUuid,
		side,
		spd: c.SPD,
		position: c.POSITION === EnumPosition.Back ? EnumPosition.Back : EnumPosition.Front,
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
 *
 * 側別已翻轉：我方＝'right'、敵方＝'left'（與原版頁面一致）
 * Side flipped: allies = 'right', enemies = 'left' (matches original page)
 */
export function buildUnitLookup(
	allies: readonly Character[],
	enemies: readonly Character[],
): IUnitLookup {
	const lookup = new Map<number, IUnitRef>();
	for (const c of allies) lookup.set(c.no, { name: c.name, side: EnumTeamSideUI.Right });
	for (const c of enemies) lookup.set(c.no, { name: c.name, side: EnumTeamSideUI.Left });
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
 * 對應：Act→skill、Cast→casting、Damage→damage、Heal→heal、Guard→protect、Death→down，
 * 未知型別以 type 'result' + message 文字 fallback，確保 N 事件 → N 條日誌。
 * Mapping: Act→skill, Cast→casting, Damage→damage, Heal→heal, Guard→protect, Death→down;
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
	const skillDef = ev.skill !== undefined ? repo?.getSkill(ev.skill) : undefined;
	const skillName = skillDef?.name;

	switch (ev.type) {
		case EnumBattleEventType.Act: {
			return {
				type: EnumActionType.Skill,
				source: actor.name,
				target: target.name,
				skill: skillName ? { name: skillName } : undefined,
				message: skillName ? `${actor.name} ${skillName}` : actor.name ?? '',
				side,
				attribute: EnumAttributeType.Normal,
			};
		}
		case EnumBattleEventType.Cast: {
			const verb = skillDef?.type === EnumSkillDamageType.Physical ? EnumChargeKind.Charging : EnumChargeKind.Casting;
			return {
				type: EnumActionType.Casting,
				source: actor.name,
				message: `start ${verb}.`,
				side,
				attribute: EnumAttributeType.Charge,
				castType: verb,
				skill: skillName ? { name: skillName } : undefined,
			};
		}
		case EnumBattleEventType.Damage: {
			const value = ev.value ?? 0;
			const valueChange =
				ev.hpBefore !== undefined && ev.hpAfter !== undefined
					? `${ev.hpBefore} > ${ev.hpAfter}`
					: actor.name
						? `by ${actor.name}`
						: undefined;
			const message = target.name ? `${value} Damage to ${target.name}` : `${value} Damage`;
			return {
				type: EnumActionType.Damage,
				source: actor.name,
				target: target.name,
				value,
				valueChange,
				message,
				side,
				attribute: EnumAttributeType.Dmg,
				hpBefore: ev.hpBefore,
				hpAfter: ev.hpAfter,
				skill: skillName ? { name: skillName } : undefined,
			};
		}
		case EnumBattleEventType.Heal: {
			const value = ev.value ?? 0;
			const valueChange =
				ev.hpBefore !== undefined && ev.hpAfter !== undefined
					? `${ev.hpBefore} > ${ev.hpAfter}`
					: undefined;
			const message = target.name
				? `${target.name} Recovered ${value} HP`
				: `${value} Heal`;
			return {
				type: EnumActionType.Heal,
				source: actor.name,
				target: target.name,
				value,
				valueChange,
				message,
				side,
				attribute: EnumAttributeType.Recover,
				hpBefore: ev.hpBefore,
				hpAfter: ev.hpAfter,
				skill: skillName ? { name: skillName } : undefined,
			};
		}
		case EnumBattleEventType.Guard: {
			const message =
				actor.name && target.name && actor.name !== target.name
					? `${actor.name} protected ${target.name}!`
					: `${actor.name ?? 'Unknown'} blocked the attack with barrier!`;
			return {
				type: EnumActionType.Protect,
				source: actor.name,
				target: target.name,
				message,
				side,
				attribute: EnumAttributeType.Support,
			};
		}
		case EnumBattleEventType.Death: {
			const name = target.name ?? 'Unknown';
			return {
				type: EnumActionType.Down,
				source: name,
				target: target.name,
				message: `${name} down.`,
				side: target.side,
				attribute: EnumAttributeType.Dmg,
			};
		}
		default: {
			const message =
				ev.text ??
				`${actor.name ?? ''} ${ev.type}${target.name ? ` ${target.name}` : ''}`.trim();
			return {
				type: EnumActionType.Result,
				source: actor.name,
				target: target.name,
				message,
				side,
				attribute: EnumAttributeType.Normal,
			};
		}
	}
}

/** 結果轉接輸入 / Result adapter input */
export interface IResultDataInput {
	/** 引擎判定 / Engine outcome */
	outcome: EnumOutcome;
	/** 敵方（左隊）名稱 / Enemy (left team) name */
	enemyTeamName: string;
	/** 我方（右隊）名稱 / Ally (right team) name */
	allyTeamName: string;
	/** 敵方成員（左隊）/ Enemy members (left team) */
	enemyMembers: readonly Character[];
	/** 我方成員（右隊）/ Ally members (right team) */
	allyMembers: readonly Character[];
	/** 事件日誌（供 totalDamage 彙總）/ event log (for totalDamage) */
	events?: readonly IBattleEvent[];
	/** no → 單位查詢表 / no → unit lookup */
	lookup?: IUnitLookup;
}

/**
 * 建立單隊最終統計（hpRemain／alive／totalUnits／totalDamage／totalMaxHp）
 * Build one team's final stats (hpRemain/alive/totalUnits/totalDamage/totalMaxHp)
 */
function buildTeamStats(
	members: readonly Character[],
	side: ITeamSide,
	events: readonly IBattleEvent[] | undefined,
	lookup: IUnitLookup | undefined,
): ITeamFinalStats {
	let hpRemain = 0;
	let alive = 0;
	let totalMaxHp = 0;
	for (const c of members) {
		hpRemain += Math.max(0, c.HP);
		totalMaxHp += c.MAXHP;
		if (c.STATE !== EnumState.Dead) alive++;
	}
	let totalDamage = 0;
	for (const ev of events ?? []) {
		if (ev.type !== EnumBattleEventType.Damage) continue;
		const info = ev.actor !== undefined ? lookup?.get(Number(ev.actor)) : undefined;
		if (info?.side === side) totalDamage += ev.value ?? 0;
	}
	return { hpRemain, alive, totalUnits: members.length, totalDamage, totalMaxHp };
}

/**
 * 結果轉接：引擎判定 → IBattleResult（任務 3.4）
 * Result adapter: engine outcome → IBattleResult (task 3.4)
 *
 * Win → winner＝我方名（右隊）、winnerSide='right'；Lose → winner＝敵方名（左隊）、winnerSide='left'；
 * Draw → winner ''＋isDraw true。
 */
export function buildResultData(input: IResultDataInput): IBattleResult {
	const { outcome, allyTeamName, enemyTeamName, allyMembers, enemyMembers } = input;
	const isDraw = outcome === EnumOutcome.Draw;
	const winner =
		outcome === EnumOutcome.Win
			? allyTeamName
			: outcome === EnumOutcome.Lose
				? enemyTeamName
				: '';
	const winnerSide =
		outcome === EnumOutcome.Win
			? EnumTeamSideUI.Right
			: outcome === EnumOutcome.Lose
				? EnumTeamSideUI.Left
				: undefined;
	return {
		winner,
		winnerSide,
		isDraw,
		leftTeam: buildTeamStats(enemyMembers, EnumTeamSideUI.Left, input.events, input.lookup),
		rightTeam: buildTeamStats(allyMembers, EnumTeamSideUI.Right, input.events, input.lookup),
	};
}

/**
 * 精靈名冊轉接：Character[] → IBattlePositionChar[]（側別＋站位＋圖檔，任務 3.5）
 * Sprite roster adapter: Character[] → IBattlePositionChar[] (side/row/image, task 3.5)
 *
 * 側別已翻轉：我方＝'right'、敵方＝'left'。名冊以敵方（左隊）在前、我方（右隊）在後排列，
 * 對齊原版頁面左右欄位順序。右隊 char/ 圖由 computeBattleSpritePositions 自動翻轉朝左。
 * Side flipped: allies = 'right', enemies = 'left'. Roster lists enemies (left) first,
 * allies (right) second, matching the original page column order.
 */
export function buildPositionRoster(
	allies: readonly Character[],
	enemies: readonly Character[],
): IBattlePositionChar[] {
	const toEntry = (c: Character, side: ITeamSide, imageUrl: string): IBattlePositionChar => ({
		unitUuid: c.unitUuid,
		name: c.name,
		imageUrl,
		imageSize: getSpriteImageSize(imageUrl),
		position: c.POSITION === EnumPosition.Back ? EnumPosition.Back : EnumPosition.Front,
		side,
	});
	return [
		...enemies.map((c) => toEntry(c, EnumTeamSideUI.Left, getMonSpriteUrl(c.no))),
		...allies.map((c) => toEntry(c, EnumTeamSideUI.Right, getCharSpriteUrl(c.no))),
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
 * 從快照轉換為展示側快照 / Convert engine snapshot to display snapshot
 *
 * 側別直接取自引擎快照的 `team`（不再經由 no → lookup 推導）；單位以實例 uid 識別。
 * Side comes straight from the engine snapshot's `team` (no more no → lookup); units are
 * identified by their instance uid.
 */
function toSnapshotDisplay(snap: IBattleSnapshot, repo?: IDataRepository): IBattleSnapshotDisplay {
	return {
		at: snap.at,
		units: snap.units.map((u) => {
			const side = u.team === EnumTeamSide.Team1 ? EnumTeamSideUI.Left : EnumTeamSideUI.Right;
			const dead = u.dead;
			// 依 skill.type 決定 (charging)/(casting)
			let chargeKind: EnumChargeKind | undefined;
			if (u.expectSkill !== null && u.expectSkill !== undefined && repo) {
				const sk = repo.getSkill(u.expectSkill);
				if (sk) chargeKind = sk.type === EnumSkillDamageType.Physical ? EnumChargeKind.Charging : EnumChargeKind.Casting;
			}
			return {
				unitUuid: u.unitUuid,
				name: u.name,
				side,
				corpse: u.corpse,
				hp: u.hp,
				maxHp: u.maxHp,
				sp: u.sp,
				maxSp: u.maxSp,
				dead,
				status: dead ? EnumUnitStatus.Down : undefined,
				chargeKind,
			};
		}),
	};
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

	// 屍體政策三級示範（詳見 seed-data.ts）：
	// - 戰鬥級：corpse:true → 全場預設留屍體（我方 Team0）
	// - 隊伍級：teamCorpse Team1:false → 敵方預設不留屍體
	// - 角色級：seed def 的 corpse（Priest:false、DarkElfHunter:true、Slime:false）覆寫上層
	// Corpse-policy 3-level demo (see seed-data.ts): battle-level corpse:true,
	// team-level Team1:false, character-level overrides via def.corpse.
	const battle = new Battle(allies, enemies, {
		repo,
		rng,
		corpse: true,
		teamCorpse: { [EnumTeamSide.Team1]: false },
	});
	const engineResult = battle.run();

	const allyTeamName = input.allyTeamName ?? DEFAULT_ALLY_TEAM_NAME;
	const enemyTeamName = input.enemyTeamName ?? DEFAULT_ENEMY_TEAM_NAME;

	// 以「戰鬥結束後的隊伍成員」為準（含中途加入的召喚物），而非開戰前的初始陣列
	// Use the post-battle team members (summons that joined mid-battle included),
	// not just the initial pre-battle arrays.
	const finalAllies = battle.teams[EnumTeamSide.Team0].members;
	const finalEnemies = battle.teams[EnumTeamSide.Team1].members;

	const lookup = buildUnitLookup(finalAllies, finalEnemies);
	const snapshots: IBattleSnapshotDisplay[] = battle.snapshots.map((s) => toSnapshotDisplay(s, repo));

	const data: IBattleDisplayData = {
		title: input.title ?? DEFAULT_SHOWCASE_TITLE,
		time: input.time,
		// 側別對齊原版：左=敵方，右=我方
		// Side matches original: left=enemies, right=allies
		leftTeam: buildTeam(enemyTeamName, finalEnemies, EnumTeamSideUI.Left),
		rightTeam: buildTeam(allyTeamName, finalAllies, EnumTeamSideUI.Right),
		battlefield: {
			backgroundImageUrl: SHOWCASE_BATTLEFIELD_BG,
			backgroundType: 'grass',
			width: SPRITE_LAYOUT_WIDTH,
			height: SPRITE_LAYOUT_HEIGHT,
		},
		sprites: buildSprites(finalAllies, finalEnemies),
		actions: battle.log.map((ev) => mapBattleEvent(ev, lookup, repo)),
		result: buildResultData({
			outcome: engineResult.outcome,
			allyTeamName,
			enemyTeamName,
			enemyMembers: finalEnemies,
			allyMembers: finalAllies,
			events: battle.log,
			lookup,
		}),
		snapshots: snapshots.length > 0 ? snapshots : undefined,
	};

	return {
		data,
		outcome: engineResult.outcome,
		turns: engineResult.turns,
		events: battle.log,
	};
}
