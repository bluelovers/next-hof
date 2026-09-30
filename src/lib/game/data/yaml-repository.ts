/**
 * YAML 資源倉庫建置 / YAML-backed repository builder
 * 串接 yaml-load（讀取）→ yaml-convert（轉換）→ InMemoryRepository（註冊）。
 * Chains yaml-load (read) → yaml-convert (convert) → InMemoryRepository (register).
 *
 * 箱入 Skill/Item/Job/Char/Mon 五類（對應 IDataRepository 的 getter）；
 * Guard/Judge/Land/Skilltree/Union 為純資料層，僅提供 raw 讀取（未註冊）。
 * Seeds Skill/Item/Job/Char/Mon (matching the IDataRepository getters);
 * Guard/Judge/Land/Skilltree/Union are data-layer only and stay raw (not registered).
 */

import { InMemoryRepository, type IDataRepository } from './repository';
import {
	loadAllChars,
	loadAllMons,
	loadAllSkills,
	loadAllItems,
	loadAllJobs,
	loadAllResourceYaml,
	EnumResourceKind,
} from './yaml-load';
import { convertCharYaml, convertMonYaml, convertSkillYaml, convertItemYaml, convertJobYaml } from './yaml-convert';
import type { ICharDef } from '#/lib/types/char-types';
import type { IItemDef } from '#/lib/types/item-types';
import type { IJobDef } from '#/lib/types/job-types';
import type { IMonDef } from '#/lib/types/mon-types';
import type { ISkillDef } from '#/lib/types/skill-types';
import type { IResourceId } from '#/lib/types/seg-types';

/** YAML 倉庫建置結果 / Results of building a YAML-backed repository */
export interface IYamlRepositoryResult
{
	/** 已註冊的資料倉庫 / the populated data repository */
	repo: IDataRepository;
	/** 已轉換的技能定義（依 no 升冪）/ converted skill defs (ascending no) */
	skills: ISkillDef[];
	/** 已轉換的道具定義（依 no 升冪）/ converted item defs (ascending no) */
	items: IItemDef[];
	/** 已轉換的職業定義（依 no 升冪）/ converted job defs (ascending no) */
	jobs: IJobDef[];
	/** 已轉換的角色定義（依 no 升冪）/ converted char defs (ascending no) */
	chars: ICharDef[];
	/** 已轉換的怪物定義（依 no 升冪）/ converted mon defs (ascending no) */
	mons: IMonDef[];
}

/**
 * 自 HOF Resource 目錄建置資料倉庫 / Build a repository from the HOF Resource dirs
 * @param root 資源根目錄（含各資源子目錄之上層，由呼叫方提供）/ resource root (the parent holding the resource subdirectories; supplied by the caller)
 * @returns 已註冊的 repo 與轉換結果 / the registered repo plus the converted defs
 */
export function createYamlRepository(root: string): IYamlRepositoryResult
{
	const skills = loadAllSkills(root).map(convertSkillYaml);
	const items = loadAllItems(root).map(convertItemYaml);
	const jobs = loadAllJobs(root).map(convertJobYaml);
	const chars = loadAllChars(root).map(convertCharYaml);
	const mons = loadAllMons(root).map(convertMonYaml);

	const repo = new InMemoryRepository();
	for (const s of skills) repo.addSkill(s);
	for (const i of items) repo.addItem(i);
	for (const j of jobs) repo.addJob(j);
	for (const c of chars) repo.addChar(c);
	for (const m of mons) repo.addMon(m);

	return { repo, skills, items, jobs, chars, mons };
}

/**
 * 依資源種類列出已存在的 id / List the existing ids of a kind
 * （檔案層級探勘用；不會讀取內容）/ lists the file-level ids (no content read)
 */
export function listResourceIds(kind: EnumResourceKind, root: string): (IResourceId)[]
{
	switch (kind)
	{
		case EnumResourceKind.Char: return loadAllChars(root).map((r) => r.no);
		case EnumResourceKind.Mon: return loadAllMons(root).map((r) => r.no);
		case EnumResourceKind.Item: return loadAllItems(root).map((r) => r.no);
		case EnumResourceKind.Job: return loadAllJobs(root).map((r) => r.no).filter((v): v is number => v !== undefined);
		case EnumResourceKind.Skill: return loadAllSkills(root).map((r) => r.no);
		default: return loadAllResourceIds(kind, root);
	}
}

/** 讀取某種類全部 id（不轉換）/ load all ids of a kind (no conversion) */
function loadAllResourceIds(kind: EnumResourceKind, root: string): (IResourceId)[]
{
	// 以 raw 物件上的 no 欄位取值（Guard/Land 等文字 id 亦統一為 no）
	return (loadAllResourceYaml(kind, root) as Array<{ no?: IResourceId }>).map((r) => r.no).filter(
		(v): v is IResourceId => v !== undefined,
	);
}