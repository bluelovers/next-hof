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
import type { IBattleEvent, IBattleSnapshot, ISkillDef } from '#/lib/game/types';
import { SPRITE_LAYOUT_WIDTH, SPRITE_LAYOUT_HEIGHT } from '#/components/battle/types';
import { EnumTeamSideUI, EnumChargeKind, EnumUnitStatus, EnumActionType, EnumAttributeType, EnumMagicCircleKind } from '#/components/battle/enums';
import type {
	IBattleAction,
	IBattleDisplayData,
	IBattleDisplayMeta,
	IBattleResult,
	IBattleSprite,
	IBattleTeam,
	IBattleUnit,
	IBattleSnapshotDisplay,
	IMagicCircleRecord,
	ISummonedUnit,
	ITeamFinalStats,
	ITeamSide,
} from '#/components/battle/types';
import {
	buildActMessage,
	buildActionMessage,
	buildChargeText,
	buildDamageMessage,
	buildDownMessage,
	buildHealMessage,
	buildMagicCircleMessage,
	buildProtectMessage,
	buildSummonMessage,
	buildValueChangeText,
} from '#/components/battle/battleUtils';
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
 *
 * `title`／`time` 欄位繼承自 IBattleDisplayMeta（與 IBattleDisplayData 共用定義）；
 * `title` 省略時由 runShowcaseBattle 以 DEFAULT_SHOWCASE_TITLE 補。
 * `title` / `time` inherit IBattleDisplayMeta (shared definition with IBattleDisplayData);
 * when `title` is omitted, runShowcaseBattle falls back to DEFAULT_SHOWCASE_TITLE.
 */
export interface IShowcaseBattleInput extends IBattleDisplayMeta {
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
 * def no → 單位精靈圖 URL（角色／怪物表分開查，缺圖回 placeholder）
 * def no → unit sprite URL (separate char/mon lookup; placeholder when unmapped)
 *
 * 單位精靈（IBattleUnit.sprite）與快照單位外觀（imageUrl）共用此查表；
 * 兩張表的 def no 互斥，故以 isMon 決定查哪一張。
 * Shared by unit sprites (IBattleUnit.sprite) and snapshot unit appearance
 * (imageUrl); the two def-no tables are disjoint, so `isMon` picks the right one.
 */
function spriteUrlFor(no: number, isMon: boolean): string {
	return isMon ? getMonSpriteUrl(no) : getCharSpriteUrl(no);
}

/**
 * 單位轉接：Character → IBattleUnit（任務 3.2）
 * Unit adapter: Character → IBattleUnit (task 3.2)
 *
 * hp/sp 顯示值夾限於 0 起（引擎可能留下負值），status 依 STATE／詠唱中判定；
 * 同時帶入單位精靈（sprite-map 依 def no 查表），供狀態列左側顯示。
 * Display hp/sp clamp at 0 (engine may leave negatives); status from STATE/charging.
 * Also carries the unit sprite (sprite-map lookup by def no) for the status column.
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
		sprite: { url: spriteUrlFor(c.no, c.isMon()) },
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

/** 事件角色解析結果（轉接上下文的元件，供測試直接比對）/ Resolved event participant (a building block of the context, directly assertable in tests) */
export interface IResolvedRef {
	/** 名稱（查無時為原始 no 字串；未提供時 undefined）/ name (raw no when unknown; undefined if absent) */
	name?: string;
	/** 隊伍側（查無時 undefined）/ team side (undefined when unknown) */
	side?: ITeamSide;
}

/**
 * 將事件的 actor/target no 字串解析為名稱與側別（查無時名稱退回原始 no 字串）
 * Resolve an event actor/target no string into a name and side (unknown refs keep the raw no string)
 */
export function resolveRef(key: string | undefined, lookup: IUnitLookup): IResolvedRef {
	if (key === undefined) return {};
	const info = lookup.get(Number(key));
	return { name: info?.name ?? key, side: info?.side };
}

/**
 * 由技能定義判定魔方陣事件的種類（對應 PHP 的分支順序）
 * Decide a magic-circle event's kind from the skill definition (mirrors PHP's branch order)
 *
 * PHP 依序檢查 $skill["MagicCircleAdd"]、$skill["MagicCircleDeleteEnemy"]、
 * $skill["MagicCircleDeleteTeam"]；技能未帶任一欄位時退回 draw（由呼叫端以 value 補數量）。
 * PHP checks $skill["MagicCircleAdd"], $skill["MagicCircleDeleteEnemy"] then
 * $skill["MagicCircleDeleteTeam"]; when the skill carries none of them it falls back to
 * draw (the caller fills in the amount from `value`).
 *
 * Fail 無法由技能定義推得（它是成本檢查失敗），需待引擎實作後另行提供。
 * Fail cannot be derived from the skill definition (it is a cost-check failure) and awaits
 * an engine-side producer.
 */
function resolveMagicCircleKind(def?: ISkillDef): EnumMagicCircleKind {
	if (def?.MagicCircleAdd) return EnumMagicCircleKind.Draw;
	if (def?.MagicCircleDeleteEnemy) return EnumMagicCircleKind.EraseEnemy;
	if (def?.MagicCircleDeleteTeam) return EnumMagicCircleKind.Use;
	return EnumMagicCircleKind.Draw;
}

/** 該種類在技能定義中的魔方陣數量（無則 undefined）/ That kind's amount in the skill definition (undefined when absent) */
function magicCircleAmount(def: ISkillDef | undefined, kind: EnumMagicCircleKind): number | undefined {
	switch (kind) {
		case EnumMagicCircleKind.EraseEnemy:
			return def?.MagicCircleDeleteEnemy;
		case EnumMagicCircleKind.Use:
			return def?.MagicCircleDeleteTeam;
		default:
			return def?.MagicCircleAdd;
	}
}

/**
 * 事件轉接：IBattleEvent → IBattleAction（任務 3.3）
 * Event adapter: IBattleEvent → IBattleAction (task 3.3)
 *
 * 分層組裝（可組裝、可逐段測試）：
 * 1. resolveEventContext — 與型別無關的前置解析（actor／target／skill／歸屬側別）只做一次；
 * 2. composeAction      — 預填共同欄位（source／target／side／attribute／skill），轉接器只寫差異；
 * 3. EVENT_MAPPERS      — 型別 → 轉接器對照表，新增型別只需註冊一筆，未註冊者走 mapUnknownEvent。
 * Layered composition (composable and testable piecewise):
 * 1. resolveEventContext resolves the type-independent facts (actor / target / skill / side) once;
 * 2. composeAction fills the shared fields (source / target / side / attribute / skill) so a mapper
 * only states what differs;
 * 3. EVENT_MAPPERS is the type → mapper table: a new type needs a single entry, and anything
 * unregistered falls through to mapUnknownEvent.
 *
 * 對應：Act→skill、Cast→casting、Charge→casting(charging)、Damage→damage、Heal→heal、
 * Guard→protect、Death→down、Summon→summon、MagicCircle→magiccircle、Buff→buff、
 * Debuff→debuff、Poison→poison、Miss→miss、Info→info，
 * 未知型別以 type 'result' + message 文字 fallback，確保 N 事件 → N 條日誌。
 * Mapping: Act→skill, Cast→casting, Charge→casting(charging), Damage→damage, Heal→heal,
 * Guard→protect, Death→down, Summon→summon, MagicCircle→magiccircle, Buff→buff,
 * Debuff→debuff, Poison→poison, Miss→miss, Info→info; unknown types fall back to type
 * 'result' + a message so N events → N entries.
 */

/**
 * 事件未帶 text 時的兜底文案（單一事實來源）
 * Fallback copy for events that carry no text (single source of truth)
 *
 * 原始日誌的通用句型；事件帶 text 時一律以 text 為準。
 * The original log's generic phrases; an event-supplied `text` always wins.
 */
export const DEFAULT_EVENT_TEXT: Readonly<{
	buff: string;
	debuff: string;
	poison: string;
	miss: string;
}> = {
	buff: 'gained buff.',
	debuff: 'got debuffed.',
	poison: 'get poisoned!',
	miss: 'Failed!',
};

/**
 * 解析事件欄位中的 def no（缺省或非數字時 undefined）
 * Parse a def no out of an event field (undefined when absent or not a number)
 *
 * @param key - 事件的 no 欄位（字串）/ the event's no field (string)
 * @returns def no / def no
 */
export function parseDefNo(key: string | undefined): number | undefined {
	if (key === undefined) return undefined;
	const no = Number(key);
	return Number.isNaN(no) ? undefined : no;
}

/**
 * 依技能定義決定蓄力種類（Physical → charging，其餘含缺省 → casting）
 * Decide the charge kind from a skill definition (Physical → charging; otherwise, incl. absent, casting)
 *
 * Cast 事件與快照單位的 (charging)/(casting) 標示共用此判定，避免兩處各自實作而漂移。
 * The Cast event and the snapshot unit's (charging)/(casting) marker share this rule so the two
 * cannot drift apart.
 *
 * @param def - 技能定義（可省略）/ skill definition (optional)
 * @returns 蓄力種類 / charge kind
 */
export function chargeKindOf(def?: ISkillDef): EnumChargeKind {
	return def?.type === EnumSkillDamageType.Physical ? EnumChargeKind.Charging : EnumChargeKind.Casting;
}

/** 事件轉接上下文（每個事件解析一次，所有轉接器共用）/ Event adapter context (resolved once per event, shared by every mapper) */
export interface IEventContext {
	/** 行動者 / actor */
	actor: IResolvedRef;
	/** 目標 / target */
	target: IResolvedRef;
	/** 行動歸屬側別：優先 actor，其次 target（Death 只有 target）/ owning side: actor first, target fallback */
	side?: ITeamSide;
	/** 關聯技能定義（事件未帶 skill 編號或查無時 undefined）/ related skill definition */
	skillDef?: ISkillDef;
	/** 關聯技能名稱（＝skillDef?.name）/ related skill name (= skillDef?.name) */
	skillName?: string;
	/** 資料倉儲（def 查表；未提供 repo 時 undefined）/ data repository (def lookups; undefined without repo) */
	repo?: IDataRepository;
}

/**
 * 解析事件的 actor／target／skill 與歸屬側別，組成轉接上下文
 * Resolve an event's actor / target / skill and owning side into the adapter context
 *
 * 前置解析集中於此：轉接器不再各自查表，型別再多也不會重複解析或漏掉側別。
 * The front-loaded resolution lives here: mappers never re-query the lookup, so no matter how many
 * types exist, nothing resolves twice or drops the side.
 *
 * @param ev - 引擎事件 / engine event
 * @param lookup - no → 單位查詢表 / no → unit lookup
 * @param repo - 資料倉儲（僅用於查技能定義）/ data repository (skill definitions only)
 * @returns 轉接上下文 / adapter context
 */
export function resolveEventContext(
	ev: IBattleEvent,
	lookup: IUnitLookup,
	repo?: IDataRepository,
): IEventContext {
	const actor = resolveRef(ev.actor, lookup);
	const target = resolveRef(ev.target, lookup);
	const skillDef = ev.skill !== undefined ? repo?.getSkill(ev.skill) : undefined;
	return {
		actor,
		target,
		side: actor.side ?? target.side,
		skillDef,
		skillName: skillDef?.name,
		repo,
	};
}

/** 單一事件轉接器（事件＋上下文 → 一條日誌）/ Single event mapper (event + context → one log entry) */
export type IEventMapper = (ev: IBattleEvent, ctx: IEventContext) => IBattleAction;

/**
 * 轉接器填寫的欄位：type 必填，其餘覆寫 composeAction 的預設值
 * Fields a mapper fills: type is required, the rest override composeAction's defaults
 *
 * 「粗體主詞 ＋ 其後文案」版面只要給 `text`，message 由 composeAction 交給唯一合併點
 * buildActionMessage 合併一次（純文字鏡像）；其餘版面直接給 message。
 * The "bold subject + trailing copy" layout only needs `text` — composeAction hands it to the
 * single join point buildActionMessage once (a plain-text mirror); every other layout supplies
 * `message` itself.
 */
export type IActionFields = Pick<IBattleAction, 'type'> & Partial<IBattleAction>;

/**
 * 組裝各型別共用的欄位（單一事實來源）
 * Assemble the fields every type shares (single source of truth)
 *
 * source／target／side／skill 由上下文預填、attribute 預設 Normal；轉接器只宣告差異，
 * 因此新增型別不會漏掉側別或技能名稱。
 * source / target / side / skill come from the context and attribute defaults to Normal; a mapper
 * only states what differs, so a new type can never drop the side or the skill name.
 *
 * `text` 與 `message` 的關係只在此處定義一次：交由唯一合併點 buildActionMessage 產出
 * 純文字鏡像 message，兩者由同一份輸入得出，不會各自漂移。
 * The `text` / `message` relationship is defined exactly once here: the single join point
 * buildActionMessage produces the plain-text mirror `message`, and both come from the same input
 * so they cannot drift apart.
 *
 * @param ctx - 轉接上下文 / adapter context
 * @param fields - 型別專屬欄位 / type-specific fields
 * @returns 日誌條目 / log entry
 */
export function composeAction(ctx: IEventContext, fields: IActionFields): IBattleAction {
	const source = fields.source ?? ctx.actor.name;
	// 給 text 時在此合併一次；渲染端只讀 source／text，不會再切割 message
	// Joined here once when `text` is given; renderers read source / text and never slice message
	const message = buildActionMessage({ source, text: fields.text, message: fields.message });
	const base: IBattleAction = {
		type: fields.type,
		message,
		source,
		target: ctx.target.name,
		side: ctx.side,
		attribute: EnumAttributeType.Normal,
		skill: ctx.skillName ? { name: ctx.skillName } : undefined,
	};
	return { ...base, ...fields, message };
}

// ==================== 個別事件轉接器 / Per-event mappers ====================
// 每個轉接器都是純函式（ev + ctx），可經 EVENT_MAPPERS 單獨呼叫與測試。
// Every mapper is a pure function (ev + ctx) and can be called and tested on its own
// through EVENT_MAPPERS.

/** Act → 技能行動（`name SkillName`；無技能時只印名稱）/ Act → skill action (`name SkillName`; name only without a skill) */
const mapAct: IEventMapper = (_ev, ctx) =>
	composeAction(ctx, {
		type: EnumActionType.Skill,
		message: buildActMessage(ctx.actor.name, ctx.skillName),
	});

/** Cast → 詠唱／蓄力（Physical 技能 → charging，其餘 → casting）/ Cast → charge line (Physical → charging, otherwise casting) */
const mapCast: IEventMapper = (_ev, ctx) => {
	const castType = chargeKindOf(ctx.skillDef);
	return composeAction(ctx, {
		type: EnumActionType.Casting,
		text: buildChargeText(castType),
		attribute: EnumAttributeType.Charge,
		castType,
	});
};

/**
 * Charge → 蓄力開始（文案與 castType 固定 charging，與 Cast 分開）
 * Charge → charge start (both copy and castType are fixed to charging, kept apart from Cast)
 *
 * Charge 事件本身即「貯め開始」，引擎目前尚無生產點。
 * The Charge event *is* "charge start"; the engine has no producer yet.
 */
const mapCharge: IEventMapper = (_ev, ctx) =>
	composeAction(ctx, {
		type: EnumActionType.Casting,
		text: buildChargeText(EnumChargeKind.Charging),
		attribute: EnumAttributeType.Charge,
		castType: EnumChargeKind.Charging,
	});

/** Damage → 傷害（valueChangeText＝`前 > 後`；無 hp 資訊時退回 `by 攻擊者`）/ Damage (valueChangeText = `before > after`; `by attacker` without hp info) */
const mapDamage: IEventMapper = (ev, ctx) => {
	const value = ev.value ?? 0;
	return composeAction(ctx, {
		type: EnumActionType.Damage,
		value,
		valueChangeText:
			buildValueChangeText({ from: ev.hpBefore, to: ev.hpAfter }) ??
			(ctx.actor.name ? `by ${ctx.actor.name}` : undefined),
		message: buildDamageMessage(value, ctx.target.name),
		attribute: EnumAttributeType.Dmg,
		hpBefore: ev.hpBefore,
		hpAfter: ev.hpAfter,
	});
};

/** Heal → 回復（valueChangeText＝`前 > 後`、固定 HP 單位）/ Heal (valueChangeText = `before > after`, HP unit) */
const mapHeal: IEventMapper = (ev, ctx) => {
	const value = ev.value ?? 0;
	return composeAction(ctx, {
		type: EnumActionType.Heal,
		value,
		valueUnit: 'HP',
		valueChangeText: buildValueChangeText({ from: ev.hpBefore, to: ev.hpAfter }),
		message: buildHealMessage(value, ctx.target.name),
		attribute: EnumAttributeType.Recover,
		hpBefore: ev.hpBefore,
		hpAfter: ev.hpAfter,
	});
};

/** Guard → 守護（同單位或缺目標時改印攔截文案）/ Guard (interception copy when same-unit or targetless) */
const mapGuard: IEventMapper = (_ev, ctx) =>
	composeAction(ctx, {
		type: EnumActionType.Protect,
		message: buildProtectMessage(ctx.actor.name, ctx.target.name),
		attribute: EnumAttributeType.Support,
	});

/** Death → 倒下（來源＝倒下者、側別＝目標側）/ Death (source = the fallen unit, side = the target's side) */
const mapDeath: IEventMapper = (_ev, ctx) => {
	const name = ctx.target.name ?? 'Unknown';
	return composeAction(ctx, {
		type: EnumActionType.Down,
		source: name,
		side: ctx.target.side,
		message: buildDownMessage(name),
		attribute: EnumAttributeType.Dmg,
	});
};

/** Summon → 召喚（target＝被召喚 def no、value＝等級、圖依 def no 查怪物表）/ Summon (target = summoned def no, value = level, image from the mon table) */
const mapSummon: IEventMapper = (ev, ctx) => {
	// 召喚事件契約（引擎目前尚無生產點，見 #/lib/game/types 的 EnumBattleEventType.Summon）：
	// target＝被召喚單位的 def no、value＝其等級；圖片依 def no 查 sprite-map 怪物表。
	// Summon event contract (the engine has no producer yet; see EnumBattleEventType.Summon in
	// #/lib/game/types): target = the summoned unit's def no, value = its level; the image comes
	// from sprite-map's monster table by that def no.
	const summonedNo = parseDefNo(ev.target);
	const summoned: ISummonedUnit[] = ctx.target.name
		? [
				{
					name: ctx.target.name,
					level: ev.value,
					imageUrl: summonedNo !== undefined && ctx.repo?.getMon(summonedNo)
						? getMonSpriteUrl(summonedNo)
						: undefined,
				},
			]
		: [];
	return composeAction(ctx, {
		type: EnumActionType.Summon,
		summoned,
		message: buildSummonMessage(ctx.target.name, ctx.actor.name),
	});
};

/**
 * MagicCircle → 魔方陣紀錄（種類由技能定義判定、數量優先取 event.value）
 * MagicCircle → magic-circle record (kind from the skill definition, amount prefers event.value)
 *
 * 魔方陣事件契約（引擎目前尚無生產點，見 #/lib/game/types 的 EnumBattleEventType.MagicCircle）：
 *   skill＝施放的技能編號，用以判定是哪一種 MagicCircle* 效果（同 PHP 依 $skill[...] 分支）；
 *   value＝變更數量，缺省時取技能定義的對應欄位值。
 * 配色不經 attribute：由紀錄種類經 getMagicCircleClass 決定（單一事實來源）。
 * Magic-circle event contract (the engine has no producer yet; see
 * EnumBattleEventType.MagicCircle in #/lib/game/types): skill = the cast skill no, used to decide
 * which MagicCircle* effect fired (PHP branches on $skill[...] the same way); value = the amount,
 * falling back to the matching skill-definition field. The colour does not travel on `attribute`:
 * it comes from the record kind via getMagicCircleClass (single source of truth).
 */
const mapMagicCircle: IEventMapper = (ev, ctx) => {
	const kind = resolveMagicCircleKind(ctx.skillDef);
	const magicCircle: IMagicCircleRecord = {
		kind,
		amount: ev.value ?? magicCircleAmount(ctx.skillDef, kind),
	};
	return composeAction(ctx, {
		type: EnumActionType.MagicCircle,
		magicCircle,
		message: buildMagicCircleMessage(ctx.actor.name, magicCircle),
	});
};

/** Buff → 增益（text＝原始日誌文案，缺省時退回通用文案；message 由 composeAction 合併）/ Buff (text = the original phrase, generic copy when absent; composeAction joins the message) */
const mapBuff: IEventMapper = (ev, ctx) =>
	composeAction(ctx, {
		type: EnumActionType.Buff,
		text: ev.text ?? DEFAULT_EVENT_TEXT.buff,
		attribute: EnumAttributeType.Support,
	});

/** Debuff → 減益（原始日誌無 span，沿用預設色）/ Debuff (no span in the original log, default colour) */
const mapDebuff: IEventMapper = (ev, ctx) =>
	composeAction(ctx, {
		type: EnumActionType.Debuff,
		text: ev.text ?? DEFAULT_EVENT_TEXT.debuff,
	});

/** Poison → 中毒（來源＝中毒單位、側別優先取目標側）/ Poison (source = the poisoned unit, side prefers the target) */
const mapPoison: IEventMapper = (ev, ctx) => {
	const name = ctx.target.name ?? ctx.actor.name;
	return composeAction(ctx, {
		type: EnumActionType.Poison,
		source: name,
		side: ctx.target.side ?? ctx.side,
		text: ev.text ?? DEFAULT_EVENT_TEXT.poison,
		attribute: EnumAttributeType.Spdmg,
	});
};

/** Miss → 未命中（text＝原始日誌文案）/ Miss (text = the original phrase) */
const mapMiss: IEventMapper = (ev, ctx) =>
	composeAction(ctx, {
		type: EnumActionType.Miss,
		text: ev.text ?? DEFAULT_EVENT_TEXT.miss,
	});

/** Info → 純文字資訊（text 即完整訊息，無名稱無 span）/ Info (text is the whole message: no name, no span) */
const mapInfo: IEventMapper = (ev, ctx) =>
	composeAction(ctx, { type: EnumActionType.Info, message: ev.text ?? '' });

/**
 * 事件型別 → 轉接器對照表（單一事實來源；可組裝、可列舉、可逐型別測試）
 * Event type → mapper table (single source of truth; composable, enumerable, testable per type)
 *
 * EnumBattleEventType 的 14 種型別皆已註冊；未註冊（或型別遭竄改）時 mapBattleEvent 走
 * mapUnknownEvent，保證 N 個事件 → N 條日誌。
 * All 14 EnumBattleEventType members are registered; anything unregistered (or a tampered type)
 * goes through mapUnknownEvent in mapBattleEvent, guaranteeing N events → N entries.
 */
export const EVENT_MAPPERS: Readonly<Partial<Record<EnumBattleEventType, IEventMapper>>> = {
	[EnumBattleEventType.Act]: mapAct,
	[EnumBattleEventType.Cast]: mapCast,
	[EnumBattleEventType.Charge]: mapCharge,
	[EnumBattleEventType.Damage]: mapDamage,
	[EnumBattleEventType.Heal]: mapHeal,
	[EnumBattleEventType.Guard]: mapGuard,
	[EnumBattleEventType.Death]: mapDeath,
	[EnumBattleEventType.Summon]: mapSummon,
	[EnumBattleEventType.MagicCircle]: mapMagicCircle,
	[EnumBattleEventType.Buff]: mapBuff,
	[EnumBattleEventType.Debuff]: mapDebuff,
	[EnumBattleEventType.Poison]: mapPoison,
	[EnumBattleEventType.Miss]: mapMiss,
	[EnumBattleEventType.Info]: mapInfo,
};

/**
 * 未註冊事件型別的兜底轉接器（單一事實來源）
 * Fallback mapper for unregistered event types (single source of truth)
 *
 * 事件自帶 text 時直接採用；否則以 `名稱 型別 目標` 組出可讀文字，型別本身也留在訊息裡
 * 便於除錯。
 * An event-supplied `text` is used verbatim; otherwise `name type target` is assembled, keeping
 * the raw type inside the copy for easier debugging.
 *
 * @param ev - 引擎事件 / engine event
 * @param ctx - 轉接上下文 / adapter context
 * @returns 日誌條目（type 恆為 Result）/ log entry (type is always Result)
 */
export function mapUnknownEvent(ev: IBattleEvent, ctx: IEventContext): IBattleAction {
	const message =
		ev.text ??
		`${ctx.actor.name ?? ''} ${ev.type}${ctx.target.name ? ` ${ctx.target.name}` : ''}`.trim();
	return composeAction(ctx, { type: EnumActionType.Result, message });
}

/**
 * 事件轉接入口：解析上下文 → 查表 → 未註冊走兜底
 * Event adapter entry: resolve context → table lookup → unregistered falls back
 *
 * @param ev - 引擎事件 / engine event
 * @param lookup - no → 單位查詢表 / no → unit lookup
 * @param repo - 資料倉儲（技能定義／怪物圖）/ data repository (skill definitions / monster images)
 * @returns 展示用日誌條目 / display log entry
 */
export function mapBattleEvent(
	ev: IBattleEvent,
	lookup: IUnitLookup,
	repo?: IDataRepository,
): IBattleAction {
	const ctx = resolveEventContext(ev, lookup, repo);
	return (EVENT_MAPPERS[ev.type] ?? mapUnknownEvent)(ev, ctx);
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
 * 單隊 HP 統計的最小單位形狀（Character 與展示用 IBattleUnit 皆可映射至此）
 * Minimal unit shape for one-team HP stats (both Character and showcase IBattleUnit map to this)
 */
export interface ITeamHpUnit {
	/** 目前 HP / current HP */
	hp: number;
	/** 最大 HP / max HP */
	maxHp: number;
	/** 是否陣亡 / whether downed */
	dead: boolean;
}

/**
 * 由單位清單計算隊伍 HP 統計（hpRemain／totalMaxHp／alive／totalUnits）
 * Compute a team's HP stats (hpRemain / totalMaxHp / alive / totalUnits) from a unit list.
 *
 * 抽離自 runShowcaseBattle → buildResultData → buildTeamStats，供展示資料與引擎共用同一套計算，
 * 確保「HP remain」的分母（totalMaxHp）永遠存在且與畫面上顯示的單位一致。
 * Extracted from runShowcaseBattle → buildResultData → buildTeamStats so the showcase data and
 * the engine share one computation, guaranteeing the "HP remain" denominator (totalMaxHp) is
 * always present and matches the units shown on screen.
 */
export function computeTeamHpStats(units: readonly ITeamHpUnit[]): {
	hpRemain: number;
	totalMaxHp: number;
	alive: number;
	totalUnits: number;
} {
	let hpRemain = 0;
	let totalMaxHp = 0;
	let alive = 0;
	for (const u of units) {
		hpRemain += Math.max(0, u.hp);
		totalMaxHp += u.maxHp;
		if (!u.dead) alive++;
	}
	return { hpRemain, totalMaxHp, alive, totalUnits: units.length };
}

/**
 * 彙總某一側造成的傷害（單一事實來源）
 * Sum the damage dealt by one side (single source of truth)
 *
 * 只累計 Damage 事件，且 actor 經 no → lookup 反查後的側別須相符；查詢表缺漏時該筆不計。
 * Only Damage events accumulate, and only when the actor's side — looked up from no via the
 * lookup — matches; entries missing from the lookup are skipped.
 *
 * @param events - 事件日誌（可省略）/ event log (optional)
 * @param lookup - no → 單位查詢表（可省略）/ no → unit lookup (optional)
 * @param side - 要統計的側別 / side to tally
 * @returns 傷害總和 / total damage
 */
export function computeSideDamage(
	events: readonly IBattleEvent[] | undefined,
	lookup: IUnitLookup | undefined,
	side: ITeamSide,
): number {
	let total = 0;
	for (const ev of events ?? []) {
		if (ev.type !== EnumBattleEventType.Damage) continue;
		const info = ev.actor !== undefined ? lookup?.get(Number(ev.actor)) : undefined;
		if (info?.side === side) total += ev.value ?? 0;
	}
	return total;
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
	// HP 統計抽離為共用邏輯（展示資料亦使用 computeTeamHpStats）
	// HP stats extracted into the shared helper (the showcase data also uses computeTeamHpStats)
	const hp = computeTeamHpStats(
		members.map((c) => ({ hp: c.HP, maxHp: c.MAXHP, dead: c.STATE === EnumState.Dead })),
	);
	return { ...hp, totalDamage: computeSideDamage(events, lookup, side) };
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
 * 快照單位的蓄力種類（無倉儲／無預期技能／查無技能時 undefined）
 * A snapshot unit's charge kind (undefined without a repo, without an expected skill, or when unknown)
 *
 * 與 Cast 事件共用 chargeKindOf，(charging)/(casting) 的判定只有一份。
 * Shares chargeKindOf with the Cast event so the (charging)/(casting) rule exists exactly once.
 *
 * @param repo - 資料倉儲 / data repository
 * @param expectSkill - 預期施放的技能編號 / expected skill no
 * @returns 蓄力種類（非蓄力中時 undefined）/ charge kind (undefined when not charging)
 */
function snapshotChargeKind(
	repo: IDataRepository | undefined,
	expectSkill: number | null | undefined,
): EnumChargeKind | undefined {
	if (!repo || expectSkill === null || expectSkill === undefined) return undefined;
	const sk = repo.getSkill(expectSkill);
	return sk ? chargeKindOf(sk) : undefined;
}

/**
 * 從快照轉換為展示側快照 / Convert engine snapshot to display snapshot
 *
 * 側別直接取自引擎快照的 `team`（不再經由 no → lookup 推導）；單位以實例 uid 識別。
 * `imageUrl` 由 def no 查 sprite-map（角色表優先），作為單位精靈資料來源。
 * Side comes straight from the engine snapshot's `team` (no more no → lookup); units are
 * identified by their instance uid. `imageUrl` is resolved from sprite-map by def no
 * (char table first) and serves as the unit sprite's data source.
 */
function toSnapshotDisplay(snap: IBattleSnapshot, repo?: IDataRepository): IBattleSnapshotDisplay {
	return {
		at: snap.at,
		units: snap.units.map((u) => {
			const side = u.team === EnumTeamSide.Team1 ? EnumTeamSideUI.Left : EnumTeamSideUI.Right;
			const dead = u.dead;
			// def no → 精靈圖（角色表優先，怪物表次之）/ def no → sprite image (char table first, then mon)
			const unitNo = Number(u.no);
			const imageUrl = repo ? spriteUrlFor(unitNo, !repo.getCharBase(unitNo)) : undefined;
			return {
				unitUuid: u.unitUuid,
				name: u.name,
				side,
				imageUrl,
				corpse: u.corpse,
				hp: u.hp,
				maxHp: u.maxHp,
				sp: u.sp,
				maxSp: u.maxSp,
				dead,
				status: dead ? EnumUnitStatus.Down : undefined,
				// 依 skill.type 決定 (charging)/(casting)
				// (charging)/(casting) decided by skill.type
				chargeKind: snapshotChargeKind(repo, u.expectSkill),
			};
		}),
	};
}

/**
 * 檢查展示戰鬥輸入（單一事實來源，可獨立測試）
 * Validate the showcase battle input (single source of truth, independently testable)
 *
 * 我方須為 1..MAX_CHAR 人、敵方至少 1 隻；違反時拋出中英並列的錯誤訊息。
 * Allies must number 1..MAX_CHAR and the encounter needs at least one monster; violations throw
 * a bilingual error.
 *
 * @param input - 轉接層輸入（僅需 charNos／monNos）/ adapter input (charNos / monNos only)
 */
export function validateShowcaseInput(input: Pick<IShowcaseBattleInput, 'charNos' | 'monNos'>): void {
	if (input.charNos.length < 1 || input.charNos.length > MAX_CHAR) {
		throw new Error(
			`Party size must be 1..${MAX_CHAR}: got ${input.charNos.length} / 隊伍人數須為 1–${MAX_CHAR} 人`,
		);
	}
	if (input.monNos.length < 1) {
		throw new Error('Encounter needs at least one monster / encounter 至少要有 1 隻怪物');
	}
}

/**
 * 展示資料的頁面層欄位（title／time／隊名；IShowcaseBattleInput 結構相容此型別）
 * Page-level display fields (title / time / team names; IShowcaseBattleInput structurally satisfies this)
 *
 * 組裝展示資料不需要知道隊伍編號（charNos／monNos），只吃頁面層欄位，
 * 因此可用假資料直接組出完整展示資料。
 * Assembling display data does not need the party picks (charNos / monNos), only the page-level
 * fields, so fabricated data can produce a complete display payload.
 */
export interface IDisplayDataMeta extends IBattleDisplayMeta {
	/** 我方隊名（預設 DEFAULT_ALLY_TEAM_NAME）/ ally team name (default DEFAULT_ALLY_TEAM_NAME) */
	allyTeamName?: string;
	/** 敵方隊名（預設 DEFAULT_ENEMY_TEAM_NAME）/ enemy team name (default DEFAULT_ENEMY_TEAM_NAME) */
	enemyTeamName?: string;
}

/** 展示資料組裝輸入 / Display-data assembly input */
export interface IDisplayDataInput {
	/** 頁面層欄位（title／time／隊名）/ page-level fields (title / time / team names) */
	input: IDisplayDataMeta;
	/** 我方（右隊）最終成員（含中途召喚）/ final ally members (mid-battle summons included) */
	allies: readonly Character[];
	/** 敵方（左隊）最終成員 / final enemy members */
	enemies: readonly Character[];
	/** 資料倉儲（def 查表與精靈圖）/ data repository (def lookups and sprite images) */
	repo: IDataRepository;
	/** 引擎事件日誌 / engine event log */
	events: readonly IBattleEvent[];
	/** 引擎快照（缺省或空陣列時不輸出 snapshots）/ engine snapshots (omitted when absent or empty) */
	snapshots?: readonly IBattleSnapshot[];
	/** 引擎判定（供 result 轉接）/ engine outcome (feeds the result adapter) */
	outcome: EnumOutcome;
}

/**
 * 組裝 IBattleDisplayData（可獨立呼叫；以假事件／假快照即可單獨測試）
 * Assemble IBattleDisplayData (callable on its own; testable with fabricated events/snapshots)
 *
 * 與引擎執行分離：給定成員、事件與快照即可組出完整展示資料，展示層測試因此不必真的跑一整場。
 * Kept apart from the engine run: given members, events and snapshots it builds the full display
 * data, so display-layer tests do not have to run a real battle.
 */
export function buildDisplayData(args: IDisplayDataInput): IBattleDisplayData {
	const allyTeamName = args.input.allyTeamName ?? DEFAULT_ALLY_TEAM_NAME;
	const enemyTeamName = args.input.enemyTeamName ?? DEFAULT_ENEMY_TEAM_NAME;
	const lookup = buildUnitLookup(args.allies, args.enemies);
	const snapshots: IBattleSnapshotDisplay[] = (args.snapshots ?? []).map((s) =>
		toSnapshotDisplay(s, args.repo),
	);
	return {
		title: args.input.title ?? DEFAULT_SHOWCASE_TITLE,
		time: args.input.time,
		// 側別對齊原版：左=敵方，右=我方
		// Side matches original: left = enemies, right = allies
		leftTeam: buildTeam(enemyTeamName, args.enemies, EnumTeamSideUI.Left),
		rightTeam: buildTeam(allyTeamName, args.allies, EnumTeamSideUI.Right),
		battlefield: {
			backgroundImageUrl: SHOWCASE_BATTLEFIELD_BG,
			backgroundType: 'grass',
			width: SPRITE_LAYOUT_WIDTH,
			height: SPRITE_LAYOUT_HEIGHT,
		},
		sprites: buildSprites(args.allies, args.enemies),
		actions: args.events.map((ev) => mapBattleEvent(ev, lookup, args.repo)),
		result: buildResultData({
			outcome: args.outcome,
			allyTeamName,
			enemyTeamName,
			enemyMembers: args.enemies,
			allyMembers: args.allies,
			events: args.events,
			lookup,
		}),
		snapshots: snapshots.length > 0 ? snapshots : undefined,
	};
}

/**
 * 執行一整場展示戰鬥並產出 IBattleDisplayData（任務 3.1–3.5 整合入口）
 * Run a full showcase battle and produce IBattleDisplayData (integration entry, tasks 3.1–3.5)
 *
 * 即時結算：同步呼叫 Battle.run() 跑完整場（毫秒級），無逐步播放。
 * Settles in one shot: calls Battle.run() synchronously to completion (millisecond-scale).
 *
 * 分工（每一段都能單獨呼叫與測試）：
 * validateShowcaseInput 驗證輸入 → buildShowcaseTeams 建隊 → Battle.run() 跑引擎 →
 * buildDisplayData 組裝展示資料。
 * Division of labour (every step can be called and tested on its own): validateShowcaseInput
 * checks the input → buildShowcaseTeams builds the teams → Battle.run() runs the engine →
 * buildDisplayData assembles the display data.
 *
 * @param input - 展示戰鬥輸入 / showcase battle input
 * @returns 展示資料與引擎判定 / display data plus the engine outcome
 */
export function runShowcaseBattle(input: IShowcaseBattleInput): IShowcaseBattleOutcome {
	validateShowcaseInput(input);

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

	const data = buildDisplayData({
		input,
		// 以「戰鬥結束後的隊伍成員」為準（含中途加入的召喚物），而非開戰前的初始陣列
		// Use the post-battle team members (summons that joined mid-battle included),
		// not just the initial pre-battle arrays.
		allies: battle.teams[EnumTeamSide.Team0].members,
		enemies: battle.teams[EnumTeamSide.Team1].members,
		repo,
		events: battle.log,
		snapshots: battle.snapshots,
		outcome: engineResult.outcome,
	});

	return {
		data,
		outcome: engineResult.outcome,
		turns: engineResult.turns,
		events: battle.log,
	};
}
