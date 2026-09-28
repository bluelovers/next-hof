/**
 * YAML → 現有型別轉換器 / YAML → existing-type converters
 * 將 Resource/Char、Resource/Mon 的原始 YAML 轉為現有實作使用的 ICharDef / IMonDef。
 * Converts raw Char/Mon YAML into the ICharDef / IMonDef consumed by the existing implementation.
 *
 * 正規化（normalization）處理：
 * - 字串數值 → number（`level: '1'` → 1）
 * - pattern.quantity 的 null → 0（原始檔大量出現）
 * - 缺漏數值 → 0（mon.1010/1011 Bat、char.400 無 maxhp/maxsp）
 * - guard 筆誤（pro50 → prob50）→ EnumGuardKind
 * - `special`（小寫）／`SPECIAL` 合併，Undead: true → 1
 */

import {
	EnumEquipSlot,
	EnumGender,
	EnumGuardKind,
	EnumInfluence,
	EnumItemCategory,
	EnumSkillDamageType,
	EnumSkillPriority,
	EnumTargetMethod,
	EnumTargetType,
	EnumWeaponType,
	type IBehavior,
	type ICharCore,
	type ICharDef,
	type ICompBonuses,
	type IGenderOverride,
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
import type {
	IRawBehaviorYaml,
	IRawCharYaml,
	IRawCombatCoreYaml,
	IRawEquipYaml,
	IRawItemYaml,
	IRawJobYaml,
	IRawMonYaml,
	IRawPatternItemYaml,
	IRawRewardYaml,
	IRawSkillYaml,
} from './yaml-types';

/**
 * 數值正規化 / Numeric coercion
 * 字串／數字／布林／null → number；無法解析時回 fallback（預設 0）。
 * Coerce string / number / boolean / null to number; NaN falls back (default 0).
 */
export function toNumber(value: string | number | boolean | null | undefined, fallback = 0): number
{
	if (value === null || value === undefined || value === '') return fallback;
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

/** 陣列數值正規化（字串陣列 → number 陣列）/ coerce a numeric array (strings → numbers) */
export function toNumberArray(value: readonly (string | number)[] | null | undefined, fallback = 0): number[]
{
	if (!Array.isArray(value)) return [];
	return value.map((v) => toNumber(v, fallback));
}

/** 可選數值正規化：無法解析或省略時回 undefined / optional numeric coercion (NaN/absent → undefined) */
export function toOptionalNumber(value: string | number | null | undefined): number | undefined
{
	if (value === null || value === undefined || value === '') return undefined;
	const n = Number(value);
	return Number.isFinite(n) ? n : undefined;
}

/**
 * 字串鍵紀錄 → number 鍵紀錄 / string-keyed record → number-keyed record
 * 用於 reward.itemtable（{ '6000': '1000' } → { 6000: 1000 }）。
 * Used for reward.itemtable ({ '6000': '1000' } → { 6000: 1000 }).
 */
export function toNumberRecord(
	value: Record<string, string | number> | null | undefined,
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
 * guard 字串 → EnumGuardKind / guard string → EnumGuardKind
 *
 * 以 EnumGuardKind 的成員值為單一事實來源（新增守護種類自動涵蓋），
 * 僅額外收錄原始檔筆誤的別名（pro50 / prpb50 → prob50）。
 * Built from the EnumGuardKind member values (adding a guard kind auto-covers it);
 * only the source typos are extra aliases (pro50 / prpb50 → prob50).
 */
export const GUARD_ALIASES: Record<string, EnumGuardKind> = Object.fromEntries(
	Object.values(EnumGuardKind).map((value) => [value, value]),
) as Record<string, EnumGuardKind>;
GUARD_ALIASES.pro50 = EnumGuardKind.Prob50;
GUARD_ALIASES.prpb50 = EnumGuardKind.Prob50;

/**
 * position 字串 → EnumPosition / position string → EnumPosition
 * 未提供或無法辨識時回 undefined（開戰時 setBattleVariable 隨機決定）。
 * Returns undefined when absent/unknown (setBattleVariable randomizes at battle start anyway).
 */
export function convertPosition(value: string | null | undefined): EnumPosition | undefined
{
	if (value === EnumPosition.Front || value === EnumPosition.Back) return value as EnumPosition;
	return undefined;
}

/**
 * 行為規則列轉換 / Convert one pattern row
 * quantity 的 null → 0；judge／action 無法解析時略過該列。
 * null quantity → 0; rows with unparseable judge/action are dropped.
 */
export function convertPatternItem(raw: IRawPatternItemYaml | null | undefined): IPatternItem | undefined
{
	if (!raw) return undefined;
	const judge = toNumber(raw.judge, Number.NaN);
	const action = toNumber(raw.action, Number.NaN);
	if (!Number.isFinite(judge) || !Number.isFinite(action)) return undefined;
	return { judge, quantity: toNumber(raw.quantity, 0), action };
}

/**
 * 行為定義轉換 / Convert a raw behavior block
 * 空物件（pattern: { }）→ undefined（引擎會以預設收尾補普攻）。
 * Empty block (pattern: { }) → undefined (the engine's default tail supplies the basic attack).
 */
export function convertBehaviorYaml(raw: IRawBehaviorYaml | null | undefined): IBehavior | undefined
{
	if (!raw) return undefined;
	const behavior: IBehavior = {};

	const position = convertPosition(raw.position);
	if (position !== undefined) behavior.position = position;

	if (typeof raw.guard === 'string' && raw.guard in GUARD_ALIASES)
	{
		behavior.guard = GUARD_ALIASES[raw.guard];
	}

	const pattern = Array.isArray(raw.pattern)
		? raw.pattern.map(convertPatternItem).filter((p): p is IPatternItem => p !== undefined)
		: undefined;
	if (pattern && pattern.length > 0) behavior.pattern = pattern;

	return Object.keys(behavior).length > 0 ? behavior : undefined;
}

/** 獎勵轉換 / Convert a raw reward block */
export function convertRewardYaml(raw: IRawRewardYaml | null | undefined): IMonReward | undefined
{
	if (!raw) return undefined;
	const reward: IMonReward = {};

	const money = toNumber(raw.moneyhold, Number.NaN);
	if (Number.isFinite(money)) reward.moneyhold = money;

	const exp = toNumber(raw.exphold, Number.NaN);
	if (Number.isFinite(exp)) reward.exphold = exp;

	const itemtable = toNumberRecord(raw.itemtable);
	if (Object.keys(itemtable).length > 0) reward.itemtable = itemtable;

	return Object.keys(reward).length > 0 ? reward : undefined;
}

/**
 * 裝備欄位轉換 / Convert a raw equip block
 * main_hand/off_hand/armor → EnumEquipSlot 鍵；未知欄位忽略。
 * main_hand/off_hand/armor → EnumEquipSlot keys; unknown keys are ignored.
 */
export function convertEquipYaml(raw: IRawEquipYaml | null | undefined): ICharDef['equip']
{
	if (!raw) return undefined;
	const out: NonNullable<ICharDef['equip']> = {};
	const slotValues = Object.values(EnumEquipSlot) as string[];
	for (const [slot, value] of Object.entries(raw))
	{
		if (!slotValues.includes(slot)) continue;
		const itemNo = toNumber(value, Number.NaN);
		if (Number.isFinite(itemNo)) out[slot as EnumEquipSlot] = itemNo;
	}
	return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * SPECIAL 轉換 / Convert a raw SPECIAL block (both casings)
 *
 * 原始檔同時出現大寫 `SPECIAL`（正式）與小寫 `special`（mon.1000 的空物件）；
 * 兩者合併、大寫優先。Undead: true → 1（ISpecial 為數值欄位）。
 * The source uses both `SPECIAL` (canonical) and `special` (mon.1000's empty object);
 * both are merged with the uppercase winning. Undead:true → 1 (ISpecial is numeric).
 */
export function convertSpecialYaml(raw: IRawMonYaml): Partial<ISpecial> | undefined
{
	const merged: Record<string, string | number | boolean> = {};
	if (raw.special) Object.assign(merged, raw.special);
	if (raw.SPECIAL) Object.assign(merged, raw.SPECIAL);
	if (Object.keys(merged).length === 0) return undefined;

	const out: Partial<ISpecial> = {};
	const undead = merged.Undead;
	if (undead !== undefined)
	{
		out.Undead = undead === true ? 1 : undead === false ? 0 : toNumber(undead);
	}

	for (const key of ['PoisonResist', 'HealBonus', 'Barrier', 'Summon', 'HpRegen', 'SpRegen'] as (keyof ISpecial)[])
	{
		const v = merged[key];
		if (v === undefined) continue;
		(out as Record<string, number>)[key] = typeof v === 'boolean' ? (v ? 1 : 0) : toNumber(v);
	}

	const pierce = merged.Pierce;
	if (Array.isArray(pierce) && pierce.length >= 2)
	{
		out.Pierce = [toNumber(pierce[0]), toNumber(pierce[1])];
	}

	return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * 核心欄位轉換 / Shared conversion of the combat-core fields
 * 角色與怪物共用的 no/name/level/六維/HP/SP（單一事實來源）。
 * Single source of truth for the fields shared by chars and mons
 * (no/name/level, six stats, HP/SP).
 *
 * hp/sp 缺省時回 undefined（ICharCore 語意：省略＝滿血）。
 * Missing hp/sp → undefined (ICharCore semantics: omitted = full HP).
 */
function convertCombatCoreYaml(raw: IRawCombatCoreYaml): ICharCore
{
	return {
		no: toNumber(raw.no),
		name: raw.name ?? '',
		level: toNumber(raw.level),
		maxhp: toNumber(raw.maxhp),
		hp: toOptionalNumber(raw.hp),
		maxsp: toNumber(raw.maxsp),
		sp: toOptionalNumber(raw.sp),
		str: toNumber(raw.str),
		int: toNumber(raw.int),
		dex: toNumber(raw.dex),
		spd: toNumber(raw.spd),
		luk: toNumber(raw.luk),
	};
}

/**
 * 角色轉換 / Convert a raw char YAML into ICharDef
 */
export function convertCharYaml(raw: IRawCharYaml): ICharDef
{
	return {
		...convertCombatCoreYaml(raw),
		exp: toOptionalNumber(raw.exp),
		job: toOptionalNumber(raw.job),
		skill: raw.skill?.map((s) => toNumber(s)).filter((n) => Number.isFinite(n)),
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
	const atkRaw = raw.atk ? toNumberArray(raw.atk) : [];
	const defRaw = raw.def ? toNumberArray(raw.def) : [];

	return {
		...convertCombatCoreYaml(raw),
		img: raw.img ?? undefined,
		atk: atkRaw.length >= 2 ? [atkRaw[0], atkRaw[1]] : undefined,
		def: defRaw.length >= 4 ? [defRaw[0], defRaw[1], defRaw[2], defRaw[3]] : undefined,
		special: convertSpecialYaml(raw),
		info: raw.info && typeof raw.info.desc === 'string' ? { desc: raw.info.desc } : undefined,
		reward: convertRewardYaml(raw.reward),
		behavior: convertBehaviorYaml(raw.behavior),
		cycle: toOptionalNumber(raw.cycle),
		land: raw.land ?? undefined,
		lv_limit: toOptionalNumber(raw.lv_limit),
		servant: convertServantYaml(raw.servant),
		servantAmount: toOptionalNumber(raw.servantAmount),
		servantSpecify: raw.servantSpecify ? toNumberArray(raw.servantSpecify) : undefined,
	};
}

/** 隨行雜魚表轉換 / Convert the raw servant table { no: [weight, 0] } */
function convertServantYaml(
	raw: IRawMonYaml['servant'],
): Record<number, [weight: number, ignored: number]> | undefined
{
	if (!raw) return undefined;
	const out: Record<number, [number, number]> = {};
	for (const [k, pair] of Object.entries(raw))
	{
		const key = Number(k);
		if (!Number.isFinite(key) || !Array.isArray(pair)) continue;
		out[key] = [toNumber(pair[0]), toNumber(pair[1])];
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

/** 補正欄位鍵（ICompBonuses 9 鍵，單一事實來源）/ the 9 compensation keys (ICompBonuses) */
const BONUS_KEYS = [
	'P_STR', 'P_INT', 'P_DEX', 'P_SPD', 'P_LUK', 'P_MAXHP', 'P_MAXSP', 'M_MAXHP', 'M_MAXSP',
] as const;

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
	const atk = raw.atk ? toNumberArray(raw.atk) : [];
	const def = raw.def ? toNumberArray(raw.def) : [];
	return {
		no: toNumber(raw.no),
		name: raw.name ?? '',
		type: ITEM_TYPE_ALIASES[raw.type ?? ''] ?? EnumWeaponType.Other,
		type2: raw.type2 !== undefined ? ITEM_TYPE2_ALIASES[raw.type2] : undefined,
		img: raw.img ?? undefined,
		buy: toOptionalNumber(raw.buy),
		sell: toOptionalNumber(raw.sell),
		atk: atk.length >= 2 ? [atk[0], atk[1]] : undefined,
		def: def.length >= 4 ? [def[0], def[1], def[2], def[3]] : undefined,
		dh: raw.dh !== undefined ? toBool(raw.dh) : undefined,
		handle: toOptionalNumber(raw.handle),
		need: toNumberRecord(raw.need),
		base_name: raw.base_name,
		P_SUMMON: toOptionalNumber(raw.P_SUMMON),
		P_PIERCE: toOptionalNumber(raw.P_PIERCE),
		...convertBonuses(raw as unknown as Record<string, string | number | undefined>),
	};
}

/**
 * 職業轉換 / Convert a raw job YAML into IJobDef
 * gender 鍵 1/2 → EnumGender；pattern: null 原樣保留。
 * gender keys 1/2 → EnumGender; `pattern: null` is preserved as-is.
 */
export function convertJobYaml(raw: IRawJobYaml): IJobDef
{
	const coe: IJobDef['coe'] = {};
	for (const [k, v] of Object.entries(raw.coe ?? {}))
	{
		coe[k] = toNumber(v);
	}

	const gender: Partial<Record<EnumGender, IGenderOverride>> = {};
	for (const [k, v] of Object.entries(raw.gender ?? {}))
	{
		const g = JOB_GENDER_ALIASES[k];
		if (g === undefined || !v) continue;
		gender[g] = { img: v.img, job_name: v.job_name };
	}

	return {
		no: toNumber(raw.no),
		job_name: raw.job_name,
		equip: raw.equip
			?.map((e) => WEAPON_TYPE_LOOKUP[String(e)])
			.filter((v): v is EnumWeaponType => v !== undefined),
		coe: Object.keys(coe).length > 0 ? coe : undefined,
		pattern: raw.pattern === null ? null : undefined,
		img: raw.img,
		gender: Object.keys(gender).length > 0 ? gender : undefined,
		info: raw.info && typeof raw.info.desc === 'string' ? { desc: raw.info.desc } : undefined,
	};
}

/** 常數加成鍵（Plus／Up／Down 系列，複製自 raw 的技能擴充欄位） */
const SKILL_EXTRA_NUMERIC_KEYS = [
	'PlusSTR', 'PlusINT', 'PlusDEX', 'PlusSPD', 'PlusLUK', 'PlusMAXHP', 'PlusMAXSP',
	'UpSTR', 'UpINT', 'UpDEX', 'UpSPD', 'UpLUK', 'UpATK', 'UpMATK', 'UpDEF', 'UpMDEF', 'UpMAXHP', 'UpMAXSP',
	'DownSTR', 'DownINT', 'DownDEX', 'DownSPD', 'DownLUK', 'DownATK', 'DownMATK', 'DownDEF', 'DownMDEF', 'DownMAXHP', 'DownMAXSP',
] as const;

/**
 * 技能轉換 / Convert a raw skill YAML into ISkillDef
 * type '0'/'1' → EnumSkillDamageType；target/move/umove/inf/priority 以 enum 值直接對應。
 * type '0'/'1' → EnumSkillDamageType; target/move/umove/inf/priority map by enum values directly.
 */
export function convertSkillYaml(raw: IRawSkillYaml): ISkillDef
{
	const skill: ISkillDef = {
		no: toNumber(raw.no),
		name: raw.name ?? '',
		img: raw.img,
		exp: raw.exp,
		sp: toNumber(raw.sp),
		type: toNumber(raw.type) as EnumSkillDamageType,
		learn: toOptionalNumber(raw.learn),
		target: convertTarget(raw.target),
		pow: toOptionalNumber(raw.pow),
		hit: toOptionalNumber(raw.hit),
		invalid: raw.invalid !== undefined ? toFlag(raw.invalid) : undefined,
		support: raw.support !== undefined ? toFlag(raw.support) : undefined,
		priority: raw.priority !== undefined ? SKILL_PRIORITY_LOOKUP[raw.priority] : undefined,
		charge: convertCharge(raw.charge),
		stiff: toOptionalNumber(raw.stiff),
		inf: raw.inf !== undefined ? INF_LOOKUP[raw.inf] : undefined,
		HealBonus: toOptionalNumber(raw.HealBonus),
		pierce: raw.pierce !== undefined ? toFlag(raw.pierce) : undefined,
		delay: toOptionalNumber(raw.delay),
		knockback: toOptionalNumber(raw.knockback),
		poison: toOptionalNumber(raw.poison),
		poisonResist: toOptionalNumber(raw.poisonResist),
		summon: convertSummon(raw.summon),
		move: convertPosition(raw.move),
		umove: convertPosition(raw.umove),
		limit: convertLimit(raw.limit),
		passive: raw.passive !== undefined ? toFlag(raw.passive) : undefined,
		quick: raw.quick !== undefined ? toFlag(raw.quick) : undefined,
		sacrifice: toOptionalNumber(raw.sacrifice),
		CurePoison: raw.CurePoison !== undefined ? toFlag(raw.CurePoison) : undefined,
		HpRegen: toOptionalNumber(raw.HpRegen),
		SpRegen: toOptionalNumber(raw.SpRegen),
		revive: raw.revive !== undefined ? toFlag(raw.revive) : undefined,
		SpRecoveryRate: toOptionalNumber(raw.SpRecoveryRate),
		MagicCircleAdd: toOptionalNumber(raw.MagicCircleAdd),
		MagicCircleDelete: toOptionalNumber(raw.MagicCircleDelete),
		MagicCircleDeleteTeam: toOptionalNumber(raw.MagicCircleDeleteTeam),
		MagicCircleDeleteEnemy: toOptionalNumber(raw.MagicCircleDeleteEnemy),
	};

	const rawLoose = raw as unknown as Record<string, string | number | boolean | undefined>;
	for (const k of SKILL_EXTRA_NUMERIC_KEYS)
	{
		const v = rawLoose[k];
		if (v !== undefined) (skill as unknown as Record<string, number>)[k] = toNumber(v);
	}

	Object.assign(skill, convertBonuses(raw as unknown as Record<string, string | number | undefined>));
	if (raw.p_maxhp !== undefined) skill.P_MAXHP = toNumber(raw.p_maxhp);

	return skill;
}