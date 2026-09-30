/**
 * 上級戰鬥事件引擎：技能事件 / 一般事件
 * Upper battle event engine: skill events / general events
 *
 * 兩類涵蓋所有戰鬥紀錄（IBattleEvent），讓上層「消費各種戰鬥紀錄」時只面對兩種形狀，
 * 而不是各自拼接底層欄位（actor/target/skill/value…）：
 * - 技能事件（Skill）：依附某次技能執行的紀錄。以 Act／Cast／Charge 起頭，
 *   先依「技能定義」偵測效果（一個技能可同時有多種效果），再把後續紀錄分派給對應效果系統；
 *   效果系統處理完還能衍生後續事件（例：召喚系統 → 入場事件）。
 * - 一般事件（General）：不依附技能的紀錄（死亡、每回合毒傷、Info…），直接轉手。
 * Two classes cover every battle record (IBattleEvent), so consumers only ever face two shapes
 * instead of hand-stitching raw fields (actor / target / skill / value …):
 * - Skill: records attached to one skill execution. Started by Act / Cast / Charge; effects are
 *   first detected from the skill definition (one skill may carry several effects), then the
 *   following records are dispatched to the matching effect systems. A system may derive further
 *   events after processing (e.g. the summon system → the entry event).
 * - General: records not attached to a skill (death, per-turn poison damage, Info …), passed through.
 *
 * 引擎不改寫任何原始紀錄：輸入什麼 IBattleEvent 就原樣保留在結果裡（單一事實來源）。
 * The engine never rewrites an input record: every IBattleEvent stays verbatim in the output
 * (single source of truth).
 */

import { STATUS_UP_KEYS, STATUS_DOWN_KEYS, STATUS_PLUS_KEYS } from '../character/status-attrs';
import type { IStatusUpKey, IStatusDownKey, IStatusPlusKey } from '#/lib/types/status-attr-types';
import type { IBattleEvent } from '#/lib/types/battle-types';
import type { ISkillDef } from '#/lib/types/skill-types';
import { EnumBattleEventType } from '#/lib/types/battle-event-enum';

/**
 * 事件分類（兩類涵蓋所有戰鬥紀錄）/ Event class (two classes cover every battle record)
 */
export enum EnumEventClass
{
	/** 技能事件：依附某次技能執行 / skill event: attached to one skill execution */
	Skill = 'skill',
	/** 一般事件：不依附技能 / general event: not attached to a skill */
	General = 'general',
}

/**
 * 效果系統（技能事件的分派對象）/ Effect system (dispatch target of a skill event)
 *
 * 只列「引擎有生產點、可被分派」的效果；尚無生產點的欄位（knockback、sacrifice、delay…）
 * 不在此列，偵測時也不會回報，避免出現「偵測到卻永遠沒有紀錄」的空系統。
 * Lists only the effects the engine can produce and dispatch; fields with no producer yet
 * (knockback, sacrifice, delay …) are left out and are not reported by detection either, so we
 * never surface a system that can never carry a record.
 */
export enum EnumSkillEffect
{
	/** 傷害系統（非支援技能的 calcBasicDamage 路線）/ damage system (calcBasicDamage path of non-support skills) */
	Damage = 'damage',
	/** 恢復系統（support 回復與 HpRegen／SpRegen）/ heal system (support heal plus HpRegen / SpRegen) */
	Heal = 'heal',
	/** 毒系統（施毒；每回合毒傷屬一般事件）/ poison system (applying poison; per-turn damage is a general event) */
	Poison = 'poison',
	/** 增益系統（Up*／Plus*）/ buff system (Up* / Plus*) */
	Buff = 'buff',
	/** 減益系統（Down*）/ debuff system (Down*) */
	Debuff = 'debuff',
	/** 召喚系統（summon，處理後衍生入場事件）/ summon system (summon, derives the entry event after processing) */
	Summon = 'summon',
	/** 魔方陣系統（MagicCircle*）/ magic-circle system (MagicCircle*) */
	MagicCircle = 'magiccircle',
	/** 守護系統（Barrier 攔截）/ guard system (barrier interception) */
	Guard = 'guard',
	/** 命中系統（Miss；引擎尚未有 hit 判定，保留給 fixture／日後補上）/ miss system (hit is not in the engine yet; kept for fixtures and later use) */
	Miss = 'miss',
}

/**
 * 行動的起點紀錄：用來開立（或重新開立）一筆技能事件
 * Execution-start records: used to open (or re-open) one skill event
 */
const SKILL_START_TYPES: ReadonlySet<EnumBattleEventType> = new Set<EnumBattleEventType>([
	EnumBattleEventType.Act,
	EnumBattleEventType.Cast,
	EnumBattleEventType.Charge,
]);

/**
 * 型別 → 效果系統對照表（單一事實來源；Act／Cast／Charge 是事件本身，不進分派）
 * Event type → effect system table (single source of truth; Act / Cast / Charge are the event
 * itself and are not dispatched)
 *
 * 未列於此表、也非起點型別的紀錄，即使帶 skill 也不會被歸類成技能事件（無法歸因到系統）。
 * A type absent here that is not a start type is not classified as a skill event even when it
 * carries a skill number, because it cannot be attributed to a system.
 */
export const EVENT_EFFECT: Readonly<Partial<Record<EnumBattleEventType, EnumSkillEffect>>> = {
	[EnumBattleEventType.Damage]: EnumSkillEffect.Damage,
	[EnumBattleEventType.Heal]: EnumSkillEffect.Heal,
	[EnumBattleEventType.Guard]: EnumSkillEffect.Guard,
	[EnumBattleEventType.Buff]: EnumSkillEffect.Buff,
	[EnumBattleEventType.Debuff]: EnumSkillEffect.Debuff,
	[EnumBattleEventType.Poison]: EnumSkillEffect.Poison,
	[EnumBattleEventType.Summon]: EnumSkillEffect.Summon,
	[EnumBattleEventType.MagicCircle]: EnumSkillEffect.MagicCircle,
	[EnumBattleEventType.Miss]: EnumSkillEffect.Miss,
	// ---- SkillEffect 移植新增（不新增 EnumSkillEffect 成員）----
	/**
	 * Added by the SkillEffect port (no new EnumSkillEffect member)
	 */
	[EnumBattleEventType.SpDamage]: EnumSkillEffect.Damage,
	[EnumBattleEventType.Drain]: EnumSkillEffect.Damage,
	[EnumBattleEventType.SpHeal]: EnumSkillEffect.Heal,
	[EnumBattleEventType.Regen]: EnumSkillEffect.Heal,
	[EnumBattleEventType.Revive]: EnumSkillEffect.Heal,
	[EnumBattleEventType.Quick]: EnumSkillEffect.Buff,
	[EnumBattleEventType.CastShort]: EnumSkillEffect.Buff,
	[EnumBattleEventType.BarrierGain]: EnumSkillEffect.Buff,
	[EnumBattleEventType.StatChange]: EnumSkillEffect.Buff,
	[EnumBattleEventType.EnergyExchange]: EnumSkillEffect.Buff,
	[EnumBattleEventType.PoisonResist]: EnumSkillEffect.Poison,
	/**
	 * Move／Delay／Info 不進表：位移與延遲無法歸因到單一效果系統，Info 本身是純文字。
	 * Move / Delay / Info stay out: a row change and an action lag cannot be attributed to one
	 * effect system, and Info is plain copy by nature.
	 */
};

/**
 * 紀錄型別標籤（EnumBattleEventType 全員）
 * Record type labels (every EnumBattleEventType member)
 *
 * 與 EVENT_EFFECT 同居事件引擎，作為「事件語意」的單一事實來源：型別如何分類（EVENT_EFFECT）、
 * 型別如何顯示（EVENT_TYPE_LABEL）都在同一處，消費方（BattleEventDispatch）只從這裡取用。
 * Co-located with EVENT_EFFECT as the single source of truth for event semantics: how a type is
 * classified (EVENT_EFFECT) and how it is labelled (here) live together, and consumers
 * (BattleEventDispatch) only import from this module.
 */
export const EVENT_TYPE_LABEL: Readonly<Record<EnumBattleEventType, string>> = {
	[EnumBattleEventType.Damage]: '傷害 Damage',
	[EnumBattleEventType.Heal]: '回復 Heal',
	[EnumBattleEventType.Guard]: '守護 Guard',
	[EnumBattleEventType.Buff]: '增益 Buff',
	[EnumBattleEventType.Debuff]: '減益 Debuff',
	[EnumBattleEventType.Poison]: '中毒 Poison',
	[EnumBattleEventType.Death]: '死亡 Death',
	[EnumBattleEventType.Cast]: '詠唱 Cast',
	[EnumBattleEventType.Act]: '行動 Act',
	[EnumBattleEventType.Charge]: '蓄力 Charge',
	[EnumBattleEventType.MagicCircle]: '魔方陣 MagicCircle',
	[EnumBattleEventType.Summon]: '召喚 Summon',
	[EnumBattleEventType.Miss]: '未命中 Miss',
	[EnumBattleEventType.Info]: '資訊 Info',
	[EnumBattleEventType.SpDamage]: 'SP 傷害 SpDamage',
	[EnumBattleEventType.SpHeal]: 'SP 回復 SpHeal',
	[EnumBattleEventType.Drain]: '吸取 Drain',
	[EnumBattleEventType.Revive]: '復活 Revive',
	[EnumBattleEventType.Move]: '位移 Move',
	[EnumBattleEventType.Delay]: '延遲 Delay',
	[EnumBattleEventType.Quick]: '加速 Quick',
	[EnumBattleEventType.CastShort]: '施法縮短 CastShort',
	[EnumBattleEventType.BarrierGain]: '障壁 BarrierGain',
	[EnumBattleEventType.PoisonResist]: '抗毒 PoisonResist',
	[EnumBattleEventType.Regen]: '持續回復 Regen',
	[EnumBattleEventType.StatChange]: '上限變化 StatChange',
	[EnumBattleEventType.EnergyExchange]: 'HP/SP 交換 EnergyExchange',
};

/**
 * 判定單筆紀錄的分類（兩類之外無第三種）/ Classify one record (no third class exists)
 *
 * 規則：帶 skill 編號、且「是執行起點或可歸因到效果系統」＝技能事件；其餘皆為一般事件。
 * 每回合毒傷（Poison 但無 skill）因此落進一般事件，不會被誤掛到某次技能使用上。
 * Rule: a record with a skill number that is either an execution start or attributable to an
 * effect system is a skill event; everything else is general. Per-turn poison damage (Poison
 * without a skill) therefore lands in the general class instead of being attached to a skill use.
 *
 * @param ev - 引擎事件 / engine event
 * @returns 事件分類 / event class
 */
export function classifyBattleEvent(ev: IBattleEvent): EnumEventClass
{
	if (ev.skill === undefined) return EnumEventClass.General;
	return SKILL_START_TYPES.has(ev.type) || EVENT_EFFECT[ev.type] !== undefined
		? EnumEventClass.Skill
		: EnumEventClass.General;
}

/**
 * 依技能定義偵測效果清單（一個技能通常同時具備多種效果）
 * Detect the effect list from a skill definition (one skill usually carries several effects)
 *
 * 順序固定（傷害／恢復 → 毒 → 召喚 → 魔方陣 → 增益／減益）且去重，供展示層穩定排序。
 * 與 statusChanges／Battle.UseSkill 的實際處理同一組欄位判斷，避免兩處各自判斷而漂移。
 * Order is fixed (damage / heal → poison → summon → magic circle → buff / debuff) and deduplicated
 * so the display layer gets a stable order. The field checks mirror what statusChanges and
 * Battle.UseSkill actually process, so the two sides cannot drift apart.
 *
 * @param skill - 技能定義 / skill definition
 * @returns 效果清單（可能為空）/ effect list (may be empty)
 */
export function detectSkillEffects(skill: ISkillDef): EnumSkillEffect[]
{
	const found: EnumSkillEffect[] = [];
	const add = (effect: EnumSkillEffect): void =>
	{
		if (!found.includes(effect)) found.push(effect);
	};

	/**
	 * 傷害／恢復路線：本引擎對非支援技能一律走 calcBasicDamage（無 revive 特例）。
	 * Damage / heal path: the engine always routes non-support skills through calcBasicDamage
	 * (there is no revive special case in this port).
	 */
	if (skill.support)
	{
		add(EnumSkillEffect.Heal);
	}
	else
	{
		add(EnumSkillEffect.Damage);
	}
	if (skill.HpRegen || skill.SpRegen) add(EnumSkillEffect.Heal);
	if (skill.poison || skill.CurePoison || skill.poisonResist) add(EnumSkillEffect.Poison);
	if (skill.summon) add(EnumSkillEffect.Summon);
	if (
		skill.MagicCircleAdd ||
		skill.MagicCircleDelete ||
		skill.MagicCircleDeleteTeam ||
		skill.MagicCircleDeleteEnemy
	)
	{
		add(EnumSkillEffect.MagicCircle);
	}

	/**
	 * Up*／Plus* → 增益、Down* → 減益：與 statusChanges 的分派表共用 UPMAP／DOWNMAP／PLUSMAP。
	 * Up* / Plus* → buff, Down* / debuff: shares UPMAP / DOWNMAP / PLUSMAP with statusChanges.
	 */
	const upFields = skill as Partial<Record<IStatusUpKey, number>>;
	const downFields = skill as Partial<Record<IStatusDownKey, number>>;
	const plusFields = skill as Partial<Record<IStatusPlusKey, number>>;

	if (STATUS_UP_KEYS.some((k) => typeof upFields[k] === 'number')
		|| STATUS_PLUS_KEYS.some((k) => typeof plusFields[k] === 'number'))
	{
		add(EnumSkillEffect.Buff);
	}
	if (STATUS_DOWN_KEYS.some((k) => typeof downFields[k] === 'number'))
	{
		add(EnumSkillEffect.Debuff);
	}
	return found;
}

/**
 * 效果系統衍生的後續事件（不進 Battle.log，由引擎在分派後補上）
 * Follow-up event derived by an effect system (never enters Battle.log; added by the engine after dispatch)
 */
export enum EnumFollowUpType
{
	/** 入場事件（召喚系統處理完召喚紀錄後觸發）/ entry event (emitted after the summon system processes a summon record) */
	Enter = 'enter',
}

/**
 * 後續事件 / Follow-up event
 * 介面 / interface
 *
 * 保留來源紀錄以便回溯（source 即觸發它的那一筆召喚紀錄）。
 * Keeps the source record for traceability (the summon record that triggered it).
 */
export interface IEngineFollowUp
{
	/** 後續事件種類 / follow-up kind */
	type: EnumFollowUpType;
	/** 觸發的來源紀錄 / the source record that triggered it */
	source: IBattleEvent;
	/** 入場單位（＝來源紀錄 target，通常為 def no）/ entering unit (= the source record's target, usually a def no) */
	unit?: string;
	/** 等級（＝來源紀錄 value）/ level (= the source record's value) */
	level?: number;
}

/**
 * 一個效果系統在某次技能執行中處理到的內容 / What one effect system processed during a skill execution
 * 介面 / interface
 */
export interface ISkillDispatch
{
	/** 效果系統 / effect system */
	effect: EnumSkillEffect;
	/** 系統處理到的原始紀錄（原樣保留）/ raw records handled by the system (kept verbatim) */
	records: IBattleEvent[];
	/** 系統處理後衍生的後續事件 / follow-up events derived after processing */
	followUps: IEngineFollowUp[];
}

/**
 * 技能事件（「角色A 對 B 使用了技能」及其效果分派）/ Skill event ("A used a skill on B" plus its effect dispatch)
 * 介面 / interface
 */
export interface ISkillEvent
{
	/** 分類（恆為 skill）/ class (always skill) */
	class: EnumEventClass.Skill;
	/** 技能執行紀錄（Act／Cast／Charge；缺席時取第一筆帶 skill 的紀錄）/ execution record (Act / Cast / Charge; the first skill-carrying record when absent) */
	source: IBattleEvent;
	/** 技能編號 / skill number */
	skill: number;
	/** 技能名稱（查無定義時 undefined）/ skill name (undefined when the definition is unknown) */
	skillName?: string;
	/** 偵測到的效果（一個技能可同時有多種；查無定義時為空陣列）/ detected effects (a skill may carry several; empty when the definition is unknown) */
	effects: EnumSkillEffect[];
	/** 各效果系統處理到的紀錄與衍生事件 / records and follow-ups per effect system */
	dispatch: ISkillDispatch[];
}

/**
 * 一般事件（不依附技能的紀錄）/ General event (a record not attached to a skill)
 * 介面 / interface
 */
export interface IGeneralEvent
{
	/** 分類（恆為 general）/ class (always general) */
	class: EnumEventClass.General;
	/** 原始紀錄（原樣保留）/ raw record (kept verbatim) */
	event: IBattleEvent;
}

/** 上級事件（兩類聯集）/ Upper-level record (the union of the two classes) */
export type IBattleEventRecord = ISkillEvent | IGeneralEvent;

/**
 * 引擎選項 / Engine options
 * 介面 / interface
 */
export interface IEventEngineOptions
{
	/**
	 * 技能定義查詢（省略時不偵測效果，effects 為空陣列）
	 * Skill definition lookup (omitted = no detection; `effects` stays empty)
	 */
	getSkill?: (no: number) => ISkillDef | undefined;
}

/** 建立一筆技能事件（含效果偵測）/ Open one skill event (with effect detection) */
function newSkillEvent(ev: IBattleEvent & { skill: number }, getSkill?: IEventEngineOptions['getSkill']): ISkillEvent
{
	const def = getSkill?.(ev.skill);
	return {
		class: EnumEventClass.Skill,
		source: ev,
		skill: ev.skill,
		skillName: def?.name,
		effects: def ? detectSkillEffects(def) : [],
		dispatch: [],
	};
}

/** 把紀錄掛進指定效果系統的分派桶（沒有就開一桶）/ Bucket one record under its effect system (opening the bucket when needed) */
function dispatchRecord(event: ISkillEvent, effect: EnumSkillEffect, ev: IBattleEvent): void
{
	const bucket = event.dispatch.find((d) => d.effect === effect);
	if (bucket)
	{
		bucket.records.push(ev);
	}
	else
	{
		event.dispatch.push({ effect, records: [ev], followUps: [] });
	}
}

/**
 * 召喚系統的後續事件：每筆召喚紀錄衍生一筆入場事件
 * Summon system follow-up: derive one entry event per summon record
 *
 * 只在分派後補上、不寫回 Battle.log——展示層的入場句仍由 SummonMessage 從召喚紀錄合成，
 * 因此不會重複渲染。
 * Added after dispatch only, never written back to Battle.log — the display still builds its entry
 * line from the summon record via SummonMessage, so nothing renders twice.
 */
function appendFollowUps(event: ISkillEvent): void
{
	for (const bucket of event.dispatch)
	{
		if (bucket.effect !== EnumSkillEffect.Summon) continue;
		for (const ev of bucket.records)
		{
			bucket.followUps.push({ type: EnumFollowUpType.Enter, source: ev, unit: ev.target, level: ev.value });
		}
	}
}

/**
 * 上級事件引擎入口：把戰鬥紀錄切成 技能事件 / 一般事件
 * Engine entry: split battle records into skill events / general events
 *
 * 分組規則 / grouping rule:
 * - 帶 skill 且可歸因的紀錄，歸入「目前這筆技能事件」；新的 Act／Cast／Charge 或 skill 編號
 *   變更時開立新的一筆。
 * - 一般事件（如每回合毒傷、死亡）插在中間不會把技能事件切開——它們本來就不屬於任何技能。
 * - 輸出順序即輸入順序；每筆原始紀錄恰好出現一次（不多、不少、不改寫）。
 * - A skill-carrying, attributable record joins the current skill event; a new Act / Cast / Charge
 *   or a changed skill number opens a new one.
 * - A general event in the middle (per-turn poison damage, death) does not split the skill event —
 *   it never belonged to a skill in the first place.
 * - Output order follows input order; every input record appears exactly once (no more, no less,
 *   never rewritten).
 *
 * @param events - 戰鬥紀錄（Battle.log 或 fixture 提供）/ battle records (Battle.log or a fixture)
 * @param options - 引擎選項 / engine options
 * @returns 上級事件序列 / upper-level record sequence
 */
export function runEventEngine(
	events: readonly IBattleEvent[],
	options: IEventEngineOptions = {},
): IBattleEventRecord[]
{
	const records: IBattleEventRecord[] = [];
	let current: ISkillEvent | undefined;

	for (const ev of events)
	{
		const cls = classifyBattleEvent(ev);
		const skillNo = ev.skill;
		/**
		 * 分類已保證技能事件必帶 skill；此處僅為型別收窄。
		 * The classifier already guarantees a skill event carries a skill; this only narrows the type.
		 */
		if (cls !== EnumEventClass.Skill || skillNo === undefined)
		{
			records.push({ class: EnumEventClass.General, event: ev });
			continue;
		}

		const startsSkill = SKILL_START_TYPES.has(ev.type);
		if (!current || startsSkill || current.skill !== skillNo)
		{
			current = newSkillEvent({ ...ev, skill: skillNo }, options.getSkill);
			records.push(current);
		}

		const effect = EVENT_EFFECT[ev.type];
		/**
		 * 起點紀錄本身不是效果，只做事件的 source。
		 * The start record is not an effect; it only becomes the event's source.
		 */
		if (effect !== undefined) dispatchRecord(current, effect, ev);
	}

	for (const record of records)
	{
		if (record.class === EnumEventClass.Skill) appendFollowUps(record);
	}
	return records;
}
