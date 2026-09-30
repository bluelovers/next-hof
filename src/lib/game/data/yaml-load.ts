/**
 * YAML 資源讀取器 / YAML resource loader
 *
 * 依賴 Node fs，僅供伺服器端／匯入腳本使用；瀏覽器端改以預轉換的 JSON 或 seed-data 餵入。
 * Depends on Node fs, so it is server-side / import-script only; browsers consume
 * pre-converted JSON or seed-data instead.
 *
 * 讀檔後立即套用數值正規化（yaml-coerce），因此下游拿到的 raw 資料不含 null 與字串數值。
 * Numeric normalization is applied right after reading (yaml-coerce), so downstream raw data
 * carries no nulls and no numeric strings.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { IItemDef } from '#/lib/types/item-types';
import type { IJobDefCore } from '#/lib/types/job-types';
import type { IResourceId } from '#/lib/types/seg-types';
import type {
	IRawCharYaml,
	IRawGuardYaml,
	IRawJudgeYaml,
	IRawLandYaml,
	IRawMonYaml,
	IRawSkillYaml,
	IRawSkilltreeYaml,
	IRawUnionYaml,
} from '#/lib/types/raw/yaml-types';
import { EnumResourceKind } from './yaml-resource-kind';
import { normalizeResource } from './yaml-coerce';

/**
 * 資源檔名模式：`{kind}.{id}.yml` / resource file name pattern: `{kind}.{id}.yml`
 * id 可為數字（mon.1000）、補零字串（union.0000）或文字（guard.always、land.ac0）。
 * The id may be numeric (mon.1000), zero-padded (union.0000), or textual (guard.always, land.ac0).
 */
const FILE_PATTERN = /^[a-z]+\.([^.]+)\.yml$/i;

/* ------------------------------------------------------------------ */
/* 解析與路徑 / parsing & paths                                        */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* 讀取 / reading                                                      */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* 種類專屬 loader factory / kind-specific loader factories            */
/* ------------------------------------------------------------------ */

/**
 * 依數字／補零 id 讀取單筆資源 / single-record loader keyed by a numeric or zero-padded id
 * 適用 Char／Mon／Item／Job／Skill／Judge／Skilltree／Union。
 * Used by Char / Mon / Item / Job / Skill / Judge / Skilltree / Union.
 */
function idLoader<T>(kind: EnumResourceKind): (id: IResourceId, root: string) => T | undefined
{
	return (id, root) => loadResourceYaml<T>(kind, id, root);
}

/**
 * 依文字 id 讀取單筆資源 / single-record loader keyed by a textual id
 * 適用 Guard（`guard.always` → `'always'`）與 Land（`land.ac0` → `'ac0'`）。
 * Used by Guard (`guard.always` → `'always'`) and Land (`land.ac0` → `'ac0'`).
 */
function textLoader<T>(kind: EnumResourceKind): (id: string, root: string) => T | undefined
{
	return (id, root) => loadResourceYaml<T>(kind, id, root);
}

/** 讀取某種類的全部資源 / load every record of a kind */
function allLoader<T>(kind: EnumResourceKind): (root: string) => T[]
{
	return (root) => loadAllResourceYaml<T>(kind, root);
}

/* ------------------------------------------------------------------ */
/* 單筆讀取出口 / single-record loaders                                */
/* ------------------------------------------------------------------ */

/** 依編號讀取角色 / Load a player-character resource by number */
export const loadCharYaml = idLoader<IRawCharYaml>(EnumResourceKind.Char);

/** 依編號讀取怪物 / Load a monster resource by number */
export const loadMonYaml = idLoader<IRawMonYaml>(EnumResourceKind.Mon);

/** 依編號讀取道具 / Load an item resource by number */
export const loadItemYaml = idLoader<IItemDef>(EnumResourceKind.Item);

/** 依編號讀取職業 / Load a job resource by number */
export const loadJobYaml = idLoader<IJobDefCore>(EnumResourceKind.Job);

/** 依編號讀取技能 / Load a skill resource by number */
export const loadSkillYaml = idLoader<IRawSkillYaml>(EnumResourceKind.Skill);

/** 依守護種類讀取守護 / Load a guard setting by kind string (guard.always → 'always') */
export const loadGuardYaml = textLoader<IRawGuardYaml>(EnumResourceKind.Guard);

/** 依編號讀取判定碼 / Load a judge-code setting by number */
export const loadJudgeYaml = idLoader<IRawJudgeYaml>(EnumResourceKind.Judge);

/** 依文字 id 讀取土地 / Load a land setting by textual id (land.ac0 → 'ac0') */
export const loadLandYaml = textLoader<IRawLandYaml>(EnumResourceKind.Land);

/** 依編號讀取技能樹節點 / Load a skill-tree node by number */
export const loadSkilltreeYaml = idLoader<IRawSkilltreeYaml>(EnumResourceKind.Skilltree);

/** 依補零 id 讀取獨特怪物 / Load a union setting by zero-padded id */
export const loadUnionYaml = idLoader<IRawUnionYaml>(EnumResourceKind.Union);

/* ------------------------------------------------------------------ */
/* 全部讀取出口 / load-all loaders                                     */
/* ------------------------------------------------------------------ */

/** 讀取全部角色資源 / Load all player-character resources */
export const loadAllChars = allLoader<IRawCharYaml>(EnumResourceKind.Char);

/** 讀取全部怪物資源 / Load all monster resources */
export const loadAllMons = allLoader<IRawMonYaml>(EnumResourceKind.Mon);

/** 讀取全部道具資源 / Load all item resources */
export const loadAllItems = allLoader<IItemDef>(EnumResourceKind.Item);

/** 讀取全部職業資源 / Load all job resources */
export const loadAllJobs = allLoader<IJobDefCore>(EnumResourceKind.Job);

/** 讀取全部技能資源 / Load all skill resources */
export const loadAllSkills = allLoader<IRawSkillYaml>(EnumResourceKind.Skill);

/** 讀取全部守護資源 / Load all guard settings */
export const loadAllGuards = allLoader<IRawGuardYaml>(EnumResourceKind.Guard);

/** 讀取全部判定碼資源 / Load all judge-code settings */
export const loadAllJudges = allLoader<IRawJudgeYaml>(EnumResourceKind.Judge);

/** 讀取全部土地資源 / Load all land settings */
export const loadAllLands = allLoader<IRawLandYaml>(EnumResourceKind.Land);

/** 讀取全部技能樹節點 / Load all skill-tree nodes */
export const loadAllSkilltrees = allLoader<IRawSkilltreeYaml>(EnumResourceKind.Skilltree);

/** 讀取全部獨特怪物資源 / Load all union settings */
export const loadAllUnions = allLoader<IRawUnionYaml>(EnumResourceKind.Union);
