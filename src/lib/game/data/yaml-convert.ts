/**
 * YAML → 現有型別轉換器 / YAML → existing-type converters
 * 將 Resource/Char、Resource/Mon 的原始 YAML 轉為現有實作使用的 ICharDef / IMonDef。
 * Converts raw Char/Mon YAML into the ICharDef / IMonDef consumed by the existing implementation.
 *
 * 數值字串／null／guard 筆誤／空物件等正規化於 yaml-load 讀取時完成，本層直接承接：
 * Numeric strings, nulls, guard typos and empty objects are normalized at load (yaml-load);
 * this layer consumes the clean values directly:
 * - `special`（小寫）／`SPECIAL` 合併，Undead: true → 1
 */

import {
	EnumEquipSlot,
	EnumGender,
	EnumInfluence,
	EnumItemCategory,
	EnumSkillDamageType,
	EnumSkillPriority,
	EnumTargetMethod,
	EnumTargetType,
	EnumWeaponType,
	type IAtkTuple,
	type IBehavior,
	type ICharCore,
	type ICharDef,
	type ICompBonuses,
	type IDefTuple,
	type IEncounterTable,
	type IEquipTable,
	type IGenderOverride,
	type IGrowthCoefficients,
	type IItemDef,
	type IJobDef,
	type IMonDef,
	type IMonReward,
	type IPatternItem,
	type ISkillDef,
	type ISpecial,
	type ITargetSpec,
} from '#/lib/game/types';
import { EnumPosition } from '#/lib/game/constants';
import { COMP_FIELDS } from '#/lib/game/character/status-attrs';
import { SKILL_EXTRA_NUMERIC_KEYS as SHARED_SKILL_EXTRA_NUMERIC_KEYS } from './yaml-skill-keys';
import type {
	IRawCharYaml,
	IRawCombatCoreYaml,
	IRawItemYaml,
	IRawJobYaml,
	IRawMonYaml,
	IRawSkillYaml,
} from './yaml-types';

/**
 * 數值正規化 / Numeric coercion
 * 字串／數字／布林／null → number；無法解析時回 fallback（預設 0）。
 * Coerce string / number / boolean / null to number; NaN falls back (default 0).
 */
export function toNumber(value: string | number | boolean | undefined, fallback = 0): number
{
	if (value === undefined || value === '') return fallback;
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

/** 陣列數值正規化（字串陣列 → number 陣列）/ coerce a numeric array (strings → numbers) */
export function toNumberArray(value: readonly (string | number)[] | undefined, fallback = 0): number[]
{
	if (!Array.isArray(value)) return [];
	return value.map((v) => toNumber(v, fallback));
}

/** 可選數值正規化：無法解析或省略時回 undefined / optional numeric coercion (NaN/absent → undefined) */
export function toOptionalNumber(value: string | number | undefined): number | undefined
{
	if (value === undefined || value === '') return undefined;
	const n = Number(value);
	return Number.isFinite(n) ? n : undefined;
}

/**
 * 字串鍵紀錄 → number 鍵紀錄 / string-keyed record → number-keyed record
 * 用於 reward.itemtable（{ '6000': '1000' } → { 6000: 1000 }）。
 * Used for reward.itemtable ({ '6000': '1000' } → { 6000: 1000 }).
 */
export function toNumberRecord(
	value: Record<string, string | number> | undefined,
): Record<number, number>
{
	const out: Record<number, number> = {};
	if (!value) return out;
	for (const [k, v] of Object.entries(value))
	{
		const key = Number(k);
		const num = toNumber(v);
		if (Number.isFinite(key)) out[key] = num;
	}
	return out;
}

/**
 * position 字串 → EnumPosition / position string → EnumPosition
 * 未提供或無法辨識時回 undefined（開戰時 setBattleVariable 隨機決定）。
 * Returns undefined when absent/unknown (setBattleVariable randomizes at battle start anyway).
 */
export function convertPosition(value: string | undefined): EnumPosition | undefined
{
	if (value === EnumPosition.Front || value === EnumPosition.Back) return value as EnumPosition;
	return undefined;
}

/**
 * 行為規則列轉換 / Convert one pattern row
 * quantity 的 null 已於載入收斂為 0、缺省保持 undefined；judge／action 缺省時略過該列。
 * null quantity is normalized to 0 at load and omission stays undefined;
 * rows with a missing judge/action are dropped.
 */
export function convertPatternItem(raw: IPatternItem | undefined): IPatternItem | undefined
{
	if (!raw) return undefined;
	const judge = raw.judge ?? Number.NaN;
	const action = raw.action ?? Number.NaN;
	if (!Number.isFinite(judge) || !Number.isFinite(action)) return undefined;
	return { judge, quantity: raw.quantity, action };
}

/**
 * 行為定義轉換 / Convert a raw behavior block
 * 空物件（pattern: { }）→ undefined（引擎會以預設收尾補普攻）。
 * Empty block (pattern: { }) → undefined (the engine's default tail supplies the basic attack).
 */
export function convertBehaviorYaml(raw: IBehavior | undefined): IBehavior | undefined
{
	if (!raw) return undefined;
	const behavior: IBehavior = {};

	const position = convertPosition(raw.position);
	if (position !== undefined) behavior.position = position;

	/**
	 * 前排守護條件（已由載入正規化為 EnumGuardKind；來源筆誤 pro50/prpb50 已修正）
	 * guard condition (already normalized to EnumGuardKind at load; typos fixed)
	 */
	if (raw.guard !== undefined) behavior.guard = raw.guard;

	const pattern = Array.isArray(raw.pattern)
		? raw.pattern.map(convertPatternItem).filter((p): p is IPatternItem => p !== undefined)
		: undefined;
	if (pattern && pattern.length > 0) behavior.pattern = pattern;

	return Object.keys(behavior).length > 0 ? behavior : undefined;
}

/**
 * 獎勵轉換 / Convert a raw reward block
 * raw reward 即 IMonReward（單一事實來源）——僅處理「空物件 → undefined」。
 * The raw reward IS IMonReward (SSOT); this only maps an empty object to undefined.
 */
export function convertRewardYaml(raw: IMonReward | undefined): IMonReward | undefined
{
	if (!raw || Object.keys(raw).length === 0) return undefined;
	const reward: IMonReward = { ...raw };
	/** 空掉落表 = 無掉落，移除 itemtable 鍵 */
	if (raw.itemtable && Object.keys(raw.itemtable).length === 0)
	{
		delete reward.itemtable;
	}
	return reward;
}

/**
 * 裝備欄位轉換 / Convert a raw equip block
 * main_hand/off_hand/armor → EnumEquipSlot 鍵；未知欄位忽略。
 * main_hand/off_hand/armor → EnumEquipSlot keys; unknown keys are ignored.
 */
export function convertEquipYaml(raw: IEquipTable | undefined): ICharDef['equip']
{
	if (!raw) return undefined;
	const out: NonNullable<ICharDef['equip']> = {};
	const slotValues = Object.values(EnumEquipSlot) as string[];
	for (const [slot, itemNo] of Object.entries(raw))
	{
		if (!slotValues.includes(slot)) continue;
		out[slot as EnumEquipSlot] = itemNo;
	}
	return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * SPECIAL 轉換 / Convert a raw SPECIAL block
 *
 * 只讀大寫 `SPECIAL`（小寫 `special` 為來源錯字，不處理）。值已於載入收斂為 ISpecial 形狀
 * （boolean → 1/0、Pierce 為 [n, n]）。
 * Only the uppercase `SPECIAL` is read (the lowercase `special` is a source typo and ignored).
 * Values are already ISpecial-shaped (booleans → 1/0, Pierce as [n, n]) from load-time normalization.
 */
export function convertSpecialYaml(raw: IRawMonYaml): Partial<ISpecial> | undefined
{
	const merged: Partial<ISpecial> = { ...(raw as any).special, ...raw.SPECIAL };
	return Object.keys(merged).length > 0 ? merged : undefined;
}

/**
 * 核心欄位轉換 / Shared conversion of the combat-core fields
 * 角色與怪物共用的 no/name/六維/HP/SP（單一事實來源：ICombatStats）。
 * Single source of truth for the fields shared by chars and mons (ICombatStats).
 *
 * 缺省數值**不補 0**——保持 undefined，由實例化（Character 建構）解析。
 * Missing stats stay undefined here (no 0 invention); instantiation resolves them.
 */
function convertCombatCoreYaml(raw: IRawCombatCoreYaml): ICharCore
{
	return {
		no: raw.no,
		name: raw.name,
		level: raw.level,
		maxhp: raw.maxhp,
		hp: raw.hp,
		maxsp: raw.maxsp,
		sp: raw.sp,
		str: raw.str,
		int: raw.int,
		dex: raw.dex,
		spd: raw.spd,
		luk: raw.luk,
	};
}

/**
 * 角色轉換 / Convert a raw char YAML into ICharDef
 */
export function convertCharYaml(raw: IRawCharYaml): ICharDef
{
	return {
		...convertCombatCoreYaml(raw),
		exp: raw.exp,
		job: raw.job,
		skill: raw.skill,
		data_ex: raw.data_ex ? raw.data_ex : undefined,
		equip: convertEquipYaml(raw.equip),
		behavior: convertBehaviorYaml(raw.behavior),
	};
}

/**
 * 怪物轉換 / Convert a raw mon YAML into IMonDef
 */
export function convertMonYaml(raw: IRawMonYaml): IMonDef
{
	return {
		...convertCombatCoreYaml(raw),
		img: raw.img ?? undefined,
		atk: raw.atk,
		def: raw.def,
		SPECIAL: convertSpecialYaml(raw),
		info: raw.info && typeof raw.info.desc === 'string' ? { desc: raw.info.desc } : undefined,
		reward: convertRewardYaml(raw.reward),
		behavior: convertBehaviorYaml(raw.behavior),
		cycle: raw.cycle,
		land: raw.land ?? undefined,
		lv_limit: raw.lv_limit,
		servant: convertServantYaml(raw.servant),
		servantAmount: raw.servantAmount,
		servantSpecify: raw.servantSpecify,
	};
}

/** 隨行雜魚表轉換 / Convert the raw servant table (IEncounterTable) */
function convertServantYaml(
	raw: IRawMonYaml['servant'],
): IEncounterTable | undefined
{
	if (!raw) return undefined;
	const out: IEncounterTable = {};
	for (const [k, pair] of Object.entries(raw))
	{
		const key = Number(k);
		if (Number.isFinite(key)) out[key] = pair;
	}
	return Object.keys(out).length > 0 ? out : undefined;
}

/* ------------------------------------------------------------------ */
/* Item / Job / Skill 轉換 / Item, Job, Skill converters              */
/* ------------------------------------------------------------------ */

/**
 * enum 值 → 自我對照表 / Build a value-to-value lookup from an enum
 * 以列舉成員值為單一事實來源（新增成員自動涵蓋）。
 * Built from the enum member values (a new member auto-covers itself).
 */
function enumValueLookup<T extends string>(values: readonly T[]): Record<string, T>
{
	return Object.fromEntries(values.map((v) => [v, v])) as Record<string, T>;
}

/** 武器型別對照（EnumWeaponType 成員值）/ weapon-type lookup from EnumWeaponType */
const WEAPON_TYPE_LOOKUP: Record<string, EnumWeaponType> = enumValueLookup(Object.values(EnumWeaponType));

/** 技能優先條件對照 / skill-priority lookup from EnumSkillPriority */
const SKILL_PRIORITY_LOOKUP: Record<string, EnumSkillPriority> = enumValueLookup(Object.values(EnumSkillPriority));

/** 傷害參照能力對照 / influencing-stat lookup from EnumInfluence */
const INF_LOOKUP: Record<string, EnumInfluence> = enumValueLookup(Object.values(EnumInfluence));

/**
 * item type 對照 / item-type lookup
 * Key/Map/Special 無對應 EnumWeaponType 成員 → 收斂為 Other（保留道具本體資料）。
 * Key/Map/Special have no EnumWeaponType member, so they collapse to Other (the item body is kept).
 */
const ITEM_TYPE_ALIASES: Record<string, EnumWeaponType> = enumValueLookup(Object.values(EnumWeaponType));
ITEM_TYPE_ALIASES.Key = EnumWeaponType.Other;
ITEM_TYPE_ALIASES.Map = EnumWeaponType.Other;
ITEM_TYPE_ALIASES.Special = EnumWeaponType.Other;

/**
 * item type2 對照 / item type2 lookup
 * GUARD（防具類別）無對應 EnumItemCategory 成員 → 映射至 Armor。
 * GUARD (defensive equipment) has no member, so it maps to Armor.
 */
const ITEM_TYPE2_ALIASES: Record<string, EnumItemCategory> = enumValueLookup(Object.values(EnumItemCategory));
ITEM_TYPE2_ALIASES.GUARD = EnumItemCategory.Armor;

/**
 * job gender 鍵對照 / job gender-key lookup
 * 原始檔鍵 1=男、2=女；EnumGender.Male=0、Female=1。
 * Source keys are 1 = male, 2 = female; EnumGender.Male = 0, Female = 1.
 */
const JOB_GENDER_ALIASES: Record<string, EnumGender> = {
	'1': EnumGender.Male,
	'2': EnumGender.Female,
};

/**
 * 旗標正規化（boolean → 1/0）/ Flag coercion (boolean → 1/0)
 * ISkillDef 的旗標欄位為 number（truthy）；boolean 轉 1/0。
 * Flag fields are numbers on ISkillDef; booleans coerce to 1/0.
 */
export function toFlag(value: string | number | boolean | undefined): number
{
	if (typeof value === 'boolean') return value ? 1 : 0;
	return toNumber(value);
}

/** 布林正規化 / Boolean coercion (item.dh, skill.limit) */
export function toBool(value: string | number | boolean | undefined): boolean
{
	return value === true || value === 1 || value === '1' || value === 'true';
}

/** 目標規格轉換 / Convert a raw [type, method, count] spec into ITargetSpec */
export function convertTarget(raw: (string | number)[] | undefined): ITargetSpec | undefined
{
	if (!Array.isArray(raw) || raw.length < 3) return undefined;
	const type = String(raw[0]);
	const method = String(raw[1]);
	if (!(Object.values(EnumTargetType) as string[]).includes(type)) return undefined;
	if (!(Object.values(EnumTargetMethod) as string[]).includes(method)) return undefined;
	return [type as EnumTargetType, method as EnumTargetMethod, toNumber(raw[2])];
}

/** 詠唱/蓄力轉換（[a] 或 [a, b] → [a, b ?? 0]）/ Convert a raw charge into the [cast, stiff] tuple */
export function convertCharge(raw: (string | number)[] | undefined): [cast: number, stiff: number] | undefined
{
	if (!Array.isArray(raw) || raw.length < 1) return undefined;
	return [toNumber(raw[0]), toNumber(raw[1], 0)];
}

/** 召喚轉換（單一編號或編號陣列）/ Convert a raw summon (single number or array) into number | number[] */
export function convertSummon(
	raw: string | number | (string | number)[] | undefined,
): number | number[] | undefined
{
	if (raw === undefined) return undefined;
	if (Array.isArray(raw)) return toNumberArray(raw);
	return toOptionalNumber(raw);
}

/** 武器限制轉換 / Convert a raw weapon-limit object into Partial<Record<EnumWeaponType, boolean>> */
export function convertLimit(
	raw: Record<string, boolean | string | number> | undefined,
): Partial<Record<EnumWeaponType, boolean>> | undefined
{
	if (!raw) return undefined;
	const out: Partial<Record<EnumWeaponType, boolean>> = {};
	for (const [k, v] of Object.entries(raw))
	{
		if (!(k in WEAPON_TYPE_LOOKUP)) continue;
		out[k as EnumWeaponType] = toBool(v);
	}
	return Object.keys(out).length > 0 ? out : undefined;
}

/** 補正欄位鍵（ICompBonuses 9 鍵，單一事實來源：COMP_FIELDS）/ the 9 compensation keys (SSOT: COMP_FIELDS) */
const BONUS_KEYS = COMP_FIELDS;

/** 補正欄位複製 / Copy the 9 compensation keys from a raw record */
export function convertBonuses(raw: Record<string, string | number | undefined>): ICompBonuses
{
	const out: ICompBonuses = {};
	for (const k of BONUS_KEYS)
	{
		const v = raw[k];
		if (v !== undefined) out[k] = toNumber(v);
	}
	return out;
}

/**
 * 道具轉換 / Convert a raw item YAML into IItemDef
 */
export function convertItemYaml(raw: IRawItemYaml): IItemDef
{
	const itemType = raw.type ? ITEM_TYPE_ALIASES[raw.type] : undefined;
	return {
		no: raw.no,
		name: raw.name,
		type: itemType ?? EnumWeaponType.Other,
		type2: raw.type2 !== undefined ? ITEM_TYPE2_ALIASES[raw.type2] : undefined,
		img: raw.img ?? undefined,
		buy: raw.buy,
		sell: raw.sell,
		atk: raw.atk,
		def: raw.def,
		dh: raw.dh !== undefined ? toBool(raw.dh) : undefined,
		handle: raw.handle,
		need: toNumberRecord(raw.need),
		base_name: raw.base_name,
		P_SUMMON: raw.P_SUMMON,
		P_PIERCE: raw.P_PIERCE,
		...convertBonuses(raw as unknown as Record<string, string | number | undefined>),
	};
}

/**
 * 職業轉換 / Convert a raw job YAML into IJobDef
 * gender 鍵 1/2 → EnumGender；原始檔 pattern 恆為 null（無 AI 模式）→ 省略（undefined）。
 * gender keys 1/2 → EnumGender; the source `pattern: null` (no AI pattern) → omitted (undefined).
 */
export function convertJobYaml(raw: IRawJobYaml): IJobDef
{
	const coe: IGrowthCoefficients = { ...raw.coe };

	const gender: Partial<Record<EnumGender, IGenderOverride>> = {};
	for (const [k, v] of Object.entries(raw.gender ?? {}))
	{
		const g = JOB_GENDER_ALIASES[k];
		if (g === undefined || !v) continue;
		gender[g] = { img: v.img, job_name: v.job_name };
	}

	return {
		no: raw.no ?? 0,
		job_name: raw.job_name,
		equip: raw.equip
			?.map((e) => WEAPON_TYPE_LOOKUP[String(e)])
			.filter((v): v is EnumWeaponType => v !== undefined),
		coe: Object.keys(coe).length > 0 ? coe : undefined,
		img: raw.img,
		gender: Object.keys(gender).length > 0 ? gender : undefined,
		info: raw.info && typeof raw.info.desc === 'string' ? { desc: raw.info.desc } : undefined,
	};
}

/** 常數加成鍵（Plus／Up／Down 系列，單一事實來源：yaml-skill-keys） */
const SKILL_EXTRA_NUMERIC_KEYS = SHARED_SKILL_EXTRA_NUMERIC_KEYS;

/**
 * 技能轉換 / Convert a raw skill YAML into ISkillDef
 * type '0'/'1' → EnumSkillDamageType；target/move/umove/inf/priority 以 enum 值直接對應。
 * type '0'/'1' → EnumSkillDamageType; target/move/umove/inf/priority map by enum values directly.
 */
export function convertSkillYaml(raw: IRawSkillYaml): ISkillDef
{
	const skill: ISkillDef = {
		no: raw.no,
		name: raw.name,
		img: raw.img,
		exp: raw.exp,
		sp: raw.sp ?? 0,
		type: (raw.type ?? 0) as EnumSkillDamageType,
		learn: raw.learn,
		target: convertTarget(raw.target),
		pow: raw.pow,
		hit: raw.hit,
		invalid: raw.invalid !== undefined ? toFlag(raw.invalid) : undefined,
		support: raw.support !== undefined ? toFlag(raw.support) : undefined,
		priority: raw.priority !== undefined ? SKILL_PRIORITY_LOOKUP[raw.priority] : undefined,
		charge: convertCharge(raw.charge),
		stiff: raw.stiff,
		inf: raw.inf !== undefined ? INF_LOOKUP[raw.inf] : undefined,
		HealBonus: raw.HealBonus,
		pierce: raw.pierce !== undefined ? toFlag(raw.pierce) : undefined,
		delay: raw.delay,
		knockback: raw.knockback,
		poison: raw.poison,
		poisonResist: raw.poisonResist,
		summon: raw.summon,
		move: convertPosition(raw.move),
		umove: convertPosition(raw.umove),
		limit: convertLimit(raw.limit),
		passive: raw.passive !== undefined ? toFlag(raw.passive) : undefined,
		quick: raw.quick !== undefined ? toFlag(raw.quick) : undefined,
		sacrifice: raw.sacrifice,
		CurePoison: raw.CurePoison !== undefined ? toFlag(raw.CurePoison) : undefined,
		HpRegen: raw.HpRegen,
		SpRegen: raw.SpRegen,
		revive: raw.revive !== undefined ? toFlag(raw.revive) : undefined,
		SpRecoveryRate: raw.SpRecoveryRate,
		MagicCircleAdd: raw.MagicCircleAdd,
		MagicCircleDelete: raw.MagicCircleDelete,
		MagicCircleDeleteTeam: raw.MagicCircleDeleteTeam,
		MagicCircleDeleteEnemy: raw.MagicCircleDeleteEnemy,
	};

	const rawLoose = raw as unknown as Record<string, string | number | boolean | undefined>;
	for (const k of SKILL_EXTRA_NUMERIC_KEYS)
	{
		const v = rawLoose[k];
		if (v !== undefined) (skill as unknown as Record<string, number>)[k] = toNumber(v);
	}

	Object.assign(skill, convertBonuses(raw as unknown as Record<string, string | number | undefined>));
	if (raw.p_maxhp !== undefined) skill.P_MAXHP = raw.p_maxhp;

	return skill;
}