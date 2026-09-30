/**
 * YAML 讀取後的數值收斂
 *
 * 數值字串、null、guard 筆誤、空物件等皆於**讀取時**定案
 */

import { EnumGuardKind } from '#/lib/types/battle-enum';
import { COMP_FIELDS } from '#/lib/game/character/status-attrs';
import { SKILL_EXTRA_NUMERIC_KEYS } from './yaml-skill-keys';
import { EnumResourceKind } from './yaml-resource-kind';
import { enumValueLookup } from './yaml-lookup';

/* ------------------------------------------------------------------ */
/* 數值正規化 / numeric normalization                                  */
/* ------------------------------------------------------------------ */

/**
 * 數值收斂：null → 0、boolean → 1/0、字串數值 → number；其餘原樣保留。
 * （`quantity: null` 即 0、`Undead: true` 即 1，皆於載入時定案。）
 */
function coerceNumberValue(value: unknown): unknown
{
	if (value === null) return 0;
	if (typeof value === 'boolean') return value ? 1 : 0;
	if (typeof value === 'string' && value.trim() !== '')
	{
		const n = Number(value);
		if (Number.isFinite(n)) return n;
	}
	return value;
}

/**
 * 正規化規格 / coercion spec
 * 以文件路徑描述每個資源種類的數值欄位，讓 loader 在讀取後統一收斂。
 * Per-kind field description that drives the post-read numeric normalization.
 */
type ICoerceSpec =
	/** 值收斂為 number（null → 0、boolean → 1/0、字串數值 → number）/ coerce the value to number (null → 0, boolean → 1/0, numeric string → number) */
	| { kind: 'number' }
	/** 標量或陣列皆收斂為 number / coerce both a scalar and an array of items */
	| { kind: 'numberOrArray' }
	/** guard 字串 → EnumGuardKind（修正來源筆誤 pro50/prpb50） / guard string → EnumGuardKind (source typos fixed) */
	| { kind: 'guard' }
	/** 物件欄位逐一套用子規格 / object fields, each with its own spec */
	| { kind: 'object'; fields: Record<string, ICoerceSpec> }
	/** 陣列每一元素套用同一規格 / array items share one spec */
	| { kind: 'array'; item: ICoerceSpec }
	/** 陣列；空物件 `{ }` 視為 undefined / array; the empty object `{ }` is treated as undefined */
	| { kind: 'nullableArray'; item: ICoerceSpec }
	/** 依索引套用規格（其他索引原樣）/ per-index specs (other indices untouched) */
	| { kind: 'tuple'; indices: Partial<Record<number, ICoerceSpec>> }
	/** 物件所有值套用同一規格 / object values share one spec */
	| { kind: 'map'; value: ICoerceSpec };

const NUM = { kind: 'number' } as const;
const NUM_ARRAY: ICoerceSpec = { kind: 'array', item: NUM };
const NUM_OR_ARRAY: ICoerceSpec = { kind: 'numberOrArray' };
const GUARD_SPEC: ICoerceSpec = { kind: 'guard' };

/**
 * guard 字串 → EnumGuardKind / guard string → EnumGuardKind
 *
 * 成員值本身即字串，故可直接以 EnumGuardKind 成員值建立對照；
 * 另收錄來源筆誤別名（pro50／prpb50 → prob50）於載入時修正。
 */
export const GUARD_ALIASES: Record<string, EnumGuardKind> = enumValueLookup(
	Object.values(EnumGuardKind),
	{
		pro50: EnumGuardKind.Prob50,
		prpb50: EnumGuardKind.Prob50,
	},
);

/** 行為規則列規格（judge/quantity/action 皆數值；空物件 `{ }` → undefined） */
const PATTERN_SPEC: ICoerceSpec = {
	kind: 'nullableArray',
	item: { kind: 'object', fields: { judge: NUM, quantity: NUM, action: NUM } },
};

/** 角色／怪物共用的核心數值欄位 */
const CORE_NUMERIC_FIELDS: Record<string, ICoerceSpec> = {
	no: NUM, level: NUM, maxhp: NUM, hp: NUM, maxsp: NUM, sp: NUM,
	str: NUM, int: NUM, dex: NUM, spd: NUM, luk: NUM,
};

/** 補正欄位（ICompBonuses 9 鍵，由 COMP_FIELDS 衍生）/ the 9 compensation keys, derived from COMP_FIELDS */
const COMP_BONUS_FIELDS: Record<string, ICoerceSpec> = Object.fromEntries(
	COMP_FIELDS.map((k) => [k, NUM]),
);

/** 技能 Plus／Up／Down 系列（鍵由 yaml-skill-keys 衍生） */
const SKILL_UP_DOWN_PLUS_FIELDS: Record<string, ICoerceSpec> = Object.fromEntries(
	SKILL_EXTRA_NUMERIC_KEYS.map((k) => [k, NUM]),
);

/** 各資源種類的數值欄位規格 / per-kind numeric-field specs */
const COERCE_SPECS: Record<EnumResourceKind, ICoerceSpec> = {
	[EnumResourceKind.Char]: {
		kind: 'object',
		fields: {
			...CORE_NUMERIC_FIELDS,
			exp: NUM, job: NUM,
			skill: NUM_ARRAY,
			equip: { kind: 'map', value: NUM },
			behavior: { kind: 'object', fields: { guard: GUARD_SPEC, pattern: PATTERN_SPEC } },
			data_ex: { kind: 'object', fields: { recruit_money: NUM } },
		},
	},
	[EnumResourceKind.Mon]: {
		kind: 'object',
		fields: {
			...CORE_NUMERIC_FIELDS,
			SPECIAL: { kind: 'map', value: NUM_OR_ARRAY },
			atk: NUM_ARRAY, def: NUM_ARRAY,
			reward: { kind: 'object', fields: { moneyhold: NUM, exphold: NUM, itemtable: { kind: 'map', value: NUM } } },
			behavior: { kind: 'object', fields: { guard: GUARD_SPEC, pattern: PATTERN_SPEC } },
			cycle: NUM, lv_limit: NUM, servantAmount: NUM,
			servant: { kind: 'map', value: NUM_ARRAY },
			servantSpecify: NUM_ARRAY,
		},
	},
	[EnumResourceKind.Item]: {
		kind: 'object',
		fields: {
			no: NUM, buy: NUM, sell: NUM, atk: NUM_ARRAY, def: NUM_ARRAY, handle: NUM,
			need: { kind: 'map', value: NUM },
			P_SUMMON: NUM, P_PIERCE: NUM_ARRAY,
			...COMP_BONUS_FIELDS,
		},
	},
	[EnumResourceKind.Job]: {
		kind: 'object',
		fields: {
			no: NUM, job: NUM, coe: { kind: 'map', value: NUM },
			data_ex: {
				kind: 'object',
				fields: {
					job_base: NUM,
					job_conditions: {
						kind: 'object',
						fields: {
							job_from: { kind: 'map', value: { kind: 'object', fields: { lv: NUM } } },
						},
					},
				},
			},
		},
	},
	[EnumResourceKind.Skill]: {
		kind: 'object',
		fields: {
			no: NUM, sp: NUM, type: NUM, learn: NUM, pow: NUM, hit: NUM,
			charge: NUM_ARRAY,
			target: { kind: 'tuple', indices: { 2: NUM } },
			summon: NUM_OR_ARRAY,
			invalid: NUM, support: NUM, passive: NUM, quick: NUM, pierce: NUM, CurePoison: NUM, revive: NUM,
			stiff: NUM, HealBonus: NUM, delay: NUM, knockback: NUM, poison: NUM, poisonResist: NUM,
			sacrifice: NUM, HpRegen: NUM, SpRegen: NUM, SpRecoveryRate: NUM,
			MagicCircleAdd: NUM, MagicCircleDelete: NUM, MagicCircleDeleteTeam: NUM, MagicCircleDeleteEnemy: NUM,
			p_maxhp: NUM,
			...COMP_BONUS_FIELDS,
			...SKILL_UP_DOWN_PLUS_FIELDS,
		},
	},
	[EnumResourceKind.Guard]: { kind: 'object', fields: {} },
	[EnumResourceKind.Judge]: { kind: 'object', fields: { no: NUM } },
	[EnumResourceKind.Land]: { kind: 'object', fields: { monster: { kind: 'map', value: NUM_ARRAY } } },
	[EnumResourceKind.Skilltree]: { kind: 'object', fields: {} },
	[EnumResourceKind.Union]: {
		kind: 'object',
		fields: {
			data: {
				kind: 'object',
				fields: {
					conditions: { kind: 'object', fields: { lv_limit: NUM } },
				},
			},
			data_ex: { kind: 'object', fields: { level: NUM, cycle: NUM } },
		},
	},
};

/** 依規格走訪並收斂數值 / walk the document per spec, coercing numeric fields */
function coerceNode(value: unknown, spec: ICoerceSpec): unknown
{
	if (value === undefined) return value;
	if (value === null)
	{
		/**
		 * 數值欄位以 null→0 收斂（pattern `quantity: null`）；
		 * 容器規格（object/map/array/tuple）對 null 直接原樣保留。
		 */
		return spec.kind === 'number' || spec.kind === 'numberOrArray' ? coerceNumberValue(value) : value;
	}

	switch (spec.kind)
	{
		case 'number':
			return coerceNumberValue(value);
		case 'numberOrArray':
			return Array.isArray(value) ? value.map(coerceNumberValue) : coerceNumberValue(value);
		case 'guard':
			return typeof value === 'string' ? GUARD_ALIASES[value] : undefined;
		case 'array':
			return Array.isArray(value) ? value.map((v) => coerceNode(v, spec.item)) : value;
		case 'nullableArray':
			if (Array.isArray(value)) return value.map((v) => coerceNode(v, spec.item));
			if (value && typeof value === 'object') return undefined; // 空物件 `{ }` → undefined
			return value;
		case 'tuple':
			return Array.isArray(value)
				? value.map((v, i) => (spec.indices[i] ? coerceNode(v, spec.indices[i]) : v))
				: value;
		case 'map':
			if (typeof value === 'object' && !Array.isArray(value))
			{
				const out: Record<string, unknown> = {};
				for (const [k, v] of Object.entries(value as Record<string, unknown>))
				{
					out[k] = coerceNode(v, spec.value);
				}
				return out;
			}
			return value;
		case 'object':
			if (typeof value === 'object' && !Array.isArray(value))
			{
				const out: Record<string, unknown> = {};
				for (const [k, v] of Object.entries(value as Record<string, unknown>))
				{
					const child = spec.fields[k];
					out[k] = child ? coerceNode(v, child) : v;
				}
				return out;
			}
			return value;
	}
}

/**
 * 讀取後正規化：將該資源種類的數值字串欄位收斂為 number。
 * Post-read normalization: coerce the kind's numeric-string fields to numbers.
 */
export function normalizeResource(kind: EnumResourceKind, doc: unknown): unknown
{
	return coerceNode(doc, COERCE_SPECS[kind]);
}
