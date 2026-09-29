/**
 * YAML 資源讀取器 / YAML resource loader
 * 從 HOF Resource/{Char,Mon} 目錄讀取 char.*.yml / mon.*.yml 原始資料。
 * Reads the raw char.*.yml / mon.*.yml files from the HOF Resource/{Char,Mon} dirs.
 *
 * 本模組依賴 Node fs，僅供伺服器端／匯入腳本使用；瀏覽器端請以預轉換的 JSON 或 seed-data 餵入。
 * This module depends on Node fs and is server-side / import-script only; browsers should consume
 * pre-converted JSON or seed-data instead.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { EnumGuardKind, type IItemDef, type IJobDefCore } from '#/lib/game/types';
import type { IResourceId } from '#/lib/types/seg-types';
import { COMP_FIELDS } from '#/lib/game/character/status-attrs';
import { SKILL_EXTRA_NUMERIC_KEYS } from './yaml-skill-keys';
import type {
	IRawCharYaml,
	IRawGuardYaml,
	IRawJudgeYaml,
	IRawLandYaml,
	IRawMonYaml,
	IRawSkillYaml,
	IRawSkilltreeYaml,
	IRawUnionYaml,
} from './yaml-types';

/**
 * 資源種類 / Resource kind
 * 對應 Resource 目錄下的全部子目錄，單一事實來源（成員值＝目錄名）。
 * All Resource sub-directories; single source of truth (member = directory name).
 */
export enum EnumResourceKind
{
	/** 角色 / player characters */
	Char = 'Char',
	/** 怪物 / monsters */
	Mon = 'Mon',
	/** 道具 / items */
	Item = 'Item',
	/** 職業 / jobs */
	Job = 'Job',
	/** 技能 / skills */
	Skill = 'Skill',
	/** 守護設定 / guard settings */
	Guard = 'Guard',
	/** 判定碼 / judge codes */
	Judge = 'Judge',
	/** 土地 / lands */
	Land = 'Land',
	/** 技能樹 / skill trees */
	Skilltree = 'Skilltree',
	/** 獨特怪物 / unions */
	Union = 'Union',
}

/** 全部資源種類（由列舉衍生）/ all resource kinds (derived from the enum) */
export const RESOURCE_KINDS: readonly EnumResourceKind[] = Object.values(EnumResourceKind);

/**
 * 資源檔名模式：`{kind}.{id}.yml` / resource file name pattern: `{kind}.{id}.yml`
 * id 可為數字（mon.1000）、補零字串（union.0000）或文字（guard.always、land.ac0）。
 * The id may be numeric (mon.1000), zero-padded (union.0000), or textual (guard.always, land.ac0).
 */
const FILE_PATTERN = /^[a-z]+\.([^.]+)\.yml$/i;

/* ------------------------------------------------------------------ */
/* 數值正規化 / numeric normalization                                  */
/* ------------------------------------------------------------------ */

/**
 * 數值收斂：null → 0、boolean → 1/0、字串數值 → number；其餘原樣保留。
 * Coerce null → 0, booleans → 1/0, and numeric strings → number; other input stays untouched.
 * （`quantity: null` 即 0、`Undead: true` 即 1，皆於載入時定案。）
 * (`quantity: null` means 0 and `Undead: true` means 1; both resolved at load.)
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
	/** 值收斂為 number（null → 0、boolean 原樣保留）/ coerce the value to number (null → 0; booleans kept) */
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
 * 以 EnumGuardKind 成員值為單一事實來源（值即字串）；
 * 另收錄來源筆誤別名（pro50／prpb50 → prob50）於載入時修正。
 * Built from EnumGuardKind member values (values ARE the strings); source typos
 * (pro50/prpb50 → prob50) are fixed here at load time.
 */
export const GUARD_ALIASES: Record<string, EnumGuardKind> = Object.fromEntries(
	Object.values(EnumGuardKind).map((value) => [value, value]),
) as Record<string, EnumGuardKind>;
GUARD_ALIASES.pro50 = EnumGuardKind.Prob50;
GUARD_ALIASES.prpb50 = EnumGuardKind.Prob50;

/** 行為規則列規格（judge/quantity/action 皆數值；空物件 `{ }` → undefined） */
const PATTERN_SPEC: ICoerceSpec = {
	kind: 'nullableArray',
	item: { kind: 'object', fields: { judge: NUM, quantity: NUM, action: NUM } },
};

/** 角色／怪物共用的核心數值欄位（單一事實來源） */
const CORE_NUMERIC_FIELDS: Record<string, ICoerceSpec> = {
	no: NUM, level: NUM, maxhp: NUM, hp: NUM, maxsp: NUM, sp: NUM,
	str: NUM, int: NUM, dex: NUM, spd: NUM, luk: NUM,
};

/** 補正欄位（ICompBonuses 9 鍵，由 COMP_FIELDS 衍生）/ the 9 compensation keys, derived from COMP_FIELDS */
const COMP_BONUS_FIELDS: Record<string, ICoerceSpec> = Object.fromEntries(
	COMP_FIELDS.map((k) => [k, NUM]),
);

/** 技能 Plus／Up／Down 系列（單一事實來源：yaml-skill-keys） */
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
		 * Numeric specs coerce null → 0 (pattern `quantity: null`);
		 * container specs (object/map/array/tuple) keep null as-is.
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
function normalizeResource(kind: EnumResourceKind, doc: unknown): unknown
{
	return coerceNode(doc, COERCE_SPECS[kind]);
}

/**
 * 解析 YAML 文字 / Parse YAML text
 * @param text 原始 YAML 內容 / raw YAML content
 * @returns 解析結果（raw 型別）/ parsed result (raw shape)
 */
export function parseResourceYaml<T>(text: string): T
{
	return parse(text) as T;
}

/**
 * 組出資源目錄路徑 / Build the resource directory path for a kind
 * @param kind 資源種類 / resource kind
 * @param root 資源根目錄（含各資源子目錄之上層）/ resource root (the parent that holds the resource subdirectories)
 */
export function resourceDir(kind: EnumResourceKind, root: string): string
{
	return join(root, kind);
}

/**
 * 依 id 讀取單一資源檔 / Load a single resource file by id
 * @param kind 資源種類 / resource kind
 * @param id 編號或文字 id（guard.always → 'always'）/ numeric or textual id (guard.always → 'always')
 * @param root 資源根目錄 / resource root
 * @returns 原始資料；檔案不存在時回 undefined / raw data; undefined when the file is absent
 */
export function loadResourceYaml<T>(kind: EnumResourceKind, id: string | number, root: string): T | undefined
{
	const file = join(resourceDir(kind, root), `${kind.toLowerCase()}.${String(id)}.yml`);
	if (!existsSync(file)) return undefined;
	const text = readFileSync(file, 'utf8');
	return normalizeResource(kind, parseResourceYaml<unknown>(text)) as T;
}

/**
 * 讀取某種類的全部資源 / Load every resource of a kind
 * @param kind 資源種類 / resource kind
 * @param root 資源根目錄 / resource root
 * @returns 依 id 排序（數字優先數值序、文字依字典序）的原始資料陣列
 *   raw records sorted by id (numeric ids numerically first, textual ids lexicographically)
 */
export function loadAllResourceYaml<T>(kind: EnumResourceKind, root: string): T[]
{
	const dir = resourceDir(kind, root);
	const records: { id: string; data: T }[] = [];

	for (const file of readdirSync(dir))
	{
		const m = FILE_PATTERN.exec(file);
		if (!m) continue;
		const text = readFileSync(join(dir, file), 'utf8');
		records.push({ id: m[1], data: normalizeResource(kind, parseResourceYaml<unknown>(text)) as T });
	}

	records.sort((a, b) =>
	{
		const an = Number(a.id);
		const bn = Number(b.id);
		if (Number.isFinite(an) && Number.isFinite(bn))
		{
			return an - bn;
		}
		return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
	});

	return records.map((r) => r.data);
}

/**
 * 依編號讀取角色 / Load a player-character resource by number
 */
export function loadCharYaml(no: IResourceId, root: string): IRawCharYaml | undefined
{
	return loadResourceYaml<IRawCharYaml>(EnumResourceKind.Char, no, root);
}

/**
 * 依編號讀取怪物 / Load a monster resource by number
 */
export function loadMonYaml(no: IResourceId, root: string): IRawMonYaml | undefined
{
	return loadResourceYaml<IRawMonYaml>(EnumResourceKind.Mon, no, root);
}

/** 依編號讀取道具 / Load an item resource by number */
export function loadItemYaml(no: IResourceId, root: string): IItemDef | undefined
{
	return loadResourceYaml<IItemDef>(EnumResourceKind.Item, no, root);
}

/** 依編號讀取職業 / Load a job resource by number */
export function loadJobYaml(no: IResourceId, root: string): IJobDefCore | undefined
{
	return loadResourceYaml<IJobDefCore>(EnumResourceKind.Job, no, root);
}

/** 依編號讀取技能 / Load a skill resource by number */
export function loadSkillYaml(no: IResourceId, root: string): IRawSkillYaml | undefined
{
	return loadResourceYaml<IRawSkillYaml>(EnumResourceKind.Skill, no, root);
}

/** 依守護種類讀取守護 / Load a guard setting by kind string (guard.always → 'always') */
export function loadGuardYaml(kind: string, root: string): IRawGuardYaml | undefined
{
	return loadResourceYaml<IRawGuardYaml>(EnumResourceKind.Guard, kind, root);
}

/** 依編號讀取判定碼 / Load a judge-code setting by number */
export function loadJudgeYaml(no: IResourceId, root: string): IRawJudgeYaml | undefined
{
	return loadResourceYaml<IRawJudgeYaml>(EnumResourceKind.Judge, no, root);
}

/** 依文字 id 讀取土地 / Load a land setting by textual id (land.ac0 → 'ac0') */
export function loadLandYaml(id: string, root: string): IRawLandYaml | undefined
{
	return loadResourceYaml<IRawLandYaml>(EnumResourceKind.Land, id, root);
}

/** 依編號讀取技能樹節點 / Load a skill-tree node by number */
export function loadSkilltreeYaml(no: IResourceId, root: string): IRawSkilltreeYaml | undefined
{
	return loadResourceYaml<IRawSkilltreeYaml>(EnumResourceKind.Skilltree, no, root);
}

/** 依補零 id 讀取獨特怪物 / Load a union setting by zero-padded id */
export function loadUnionYaml(id: IResourceId, root: string): IRawUnionYaml | undefined
{
	return loadResourceYaml<IRawUnionYaml>(EnumResourceKind.Union, id, root);
}

/** 讀取全部角色資源 / Load all player-character resources */
export function loadAllChars(root: string): IRawCharYaml[]
{
	return loadAllResourceYaml<IRawCharYaml>(EnumResourceKind.Char, root);
}

/** 讀取全部怪物資源 / Load all monster resources */
export function loadAllMons(root: string): IRawMonYaml[]
{
	return loadAllResourceYaml<IRawMonYaml>(EnumResourceKind.Mon, root);
}

/** 讀取全部道具資源 / Load all item resources */
export function loadAllItems(root: string): IItemDef[]
{
	return loadAllResourceYaml<IItemDef>(EnumResourceKind.Item, root);
}

/** 讀取全部職業資源 / Load all job resources */
export function loadAllJobs(root: string): IJobDefCore[]
{
	return loadAllResourceYaml<IJobDefCore>(EnumResourceKind.Job, root);
}

/** 讀取全部技能資源 / Load all skill resources */
export function loadAllSkills(root: string): IRawSkillYaml[]
{
	return loadAllResourceYaml<IRawSkillYaml>(EnumResourceKind.Skill, root);
}

/** 讀取全部守護資源 / Load all guard settings */
export function loadAllGuards(root: string): IRawGuardYaml[]
{
	return loadAllResourceYaml<IRawGuardYaml>(EnumResourceKind.Guard, root);
}

/** 讀取全部判定碼資源 / Load all judge-code settings */
export function loadAllJudges(root: string): IRawJudgeYaml[]
{
	return loadAllResourceYaml<IRawJudgeYaml>(EnumResourceKind.Judge, root);
}

/** 讀取全部土地資源 / Load all land settings */
export function loadAllLands(root: string): IRawLandYaml[]
{
	return loadAllResourceYaml<IRawLandYaml>(EnumResourceKind.Land, root);
}

/** 讀取全部技能樹節點 / Load all skill-tree nodes */
export function loadAllSkilltrees(root: string): IRawSkilltreeYaml[]
{
	return loadAllResourceYaml<IRawSkilltreeYaml>(EnumResourceKind.Skilltree, root);
}

/** 讀取全部獨特怪物資源 / Load all union settings */
export function loadAllUnions(root: string): IRawUnionYaml[]
{
	return loadAllResourceYaml<IRawUnionYaml>(EnumResourceKind.Union, root);
}