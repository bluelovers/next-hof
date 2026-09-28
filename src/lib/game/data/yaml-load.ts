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
import type {
	IRawCharYaml,
	IRawGuardYaml,
	IRawItemYaml,
	IRawJobYaml,
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
	/** 工會 / unions */
	Union = 'Union',
}

/** 全部資源種類（由列舉衍生）/ all resource kinds (derived from the enum) */
export const RESOURCE_KINDS: readonly EnumResourceKind[] = Object.values(EnumResourceKind);

export type IResourceId = string | number;

/**
 * 資源檔名模式：`{kind}.{id}.yml` / resource file name pattern: `{kind}.{id}.yml`
 * id 可為數字（mon.1000）、補零字串（union.0000）或文字（guard.always、land.ac0）。
 * The id may be numeric (mon.1000), zero-padded (union.0000), or textual (guard.always, land.ac0).
 */
const FILE_PATTERN = /^[a-z]+\.([^.]+)\.yml$/i;

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
export function loadResourceYaml<T>(kind: EnumResourceKind, id: IResourceId, root: string): T | undefined
{
	const file = join(resourceDir(kind, root), `${kind.toLowerCase()}.${String(id)}.yml`);
	if (!existsSync(file)) return undefined;
	const text = readFileSync(file, 'utf8');
	return parseResourceYaml<T>(text);
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
		records.push({ id: m[1], data: parseResourceYaml<T>(readFileSync(join(dir, file), 'utf8')) });
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
export function loadItemYaml(no: IResourceId, root: string): IRawItemYaml | undefined
{
	return loadResourceYaml<IRawItemYaml>(EnumResourceKind.Item, no, root);
}

/** 依編號讀取職業 / Load a job resource by number */
export function loadJobYaml(no: IResourceId, root: string): IRawJobYaml | undefined
{
	return loadResourceYaml<IRawJobYaml>(EnumResourceKind.Job, no, root);
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

/** 依補零 id 讀取工會 / Load a union setting by zero-padded id */
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
export function loadAllItems(root: string): IRawItemYaml[]
{
	return loadAllResourceYaml<IRawItemYaml>(EnumResourceKind.Item, root);
}

/** 讀取全部職業資源 / Load all job resources */
export function loadAllJobs(root: string): IRawJobYaml[]
{
	return loadAllResourceYaml<IRawJobYaml>(EnumResourceKind.Job, root);
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

/** 讀取全部工會資源 / Load all union settings */
export function loadAllUnions(root: string): IRawUnionYaml[]
{
	return loadAllResourceYaml<IRawUnionYaml>(EnumResourceKind.Union, root);
}