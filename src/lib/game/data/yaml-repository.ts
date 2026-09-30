/**
 * YAML 資源倉庫建置
 *
 * 只把 Skill/Item/Job/Char/Mon 灌入 IDataRepository（對應其五個 getter）；
 * Guard/Judge/Land/Skilltree/Union 沒有定義型別，維持 raw 讀取、不註冊。
 */

import { InMemoryRepository, type IDataRepository } from './repository';
import {
	loadAllChars,
	loadAllMons,
	loadAllSkills,
	loadAllItems,
	loadAllJobs,
	loadAllResourceYaml,
} from './yaml-load';
import { EnumResourceKind } from './yaml-resource-kind';
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
	repo.addAll({ skills, items, jobs, chars, mons });

	return { repo, skills, items, jobs, chars, mons };
}

/**
 * 種類 → 已轉換定義的 id 取值器 / kind → id extractor over the converted defs
 * 五類已定義轉換器，直接取用定義上的 `no`；其餘種類（Guard/Judge/Land/Skilltree/Union）
 * 為純資料層、無轉換器，落回 `loadAllResourceIds` 從 raw 物件取 `no`。
 */
const RESOURCE_ID_READERS: Partial<Record<EnumResourceKind, (root: string) => IResourceId[]>> = {
	[EnumResourceKind.Char]: (root) => loadAllChars(root).map((r) => r.no),
	[EnumResourceKind.Mon]: (root) => loadAllMons(root).map((r) => r.no),
	[EnumResourceKind.Item]: (root) => loadAllItems(root).map((r) => r.no),
	[EnumResourceKind.Job]: (root) => loadAllJobs(root).map((r) => r.no),
	[EnumResourceKind.Skill]: (root) => loadAllSkills(root).map((r) => r.no),
};

/**
 * 依資源種類列出已存在的 id / List the existing ids of a kind
 * （檔案層級探勘用；不會讀取內容）/ lists the file-level ids (no content read)
 */
export function listResourceIds(kind: EnumResourceKind, root: string): IResourceId[]
{
	const read = RESOURCE_ID_READERS[kind];
	return read ? read(root) : loadAllResourceIds(kind, root);
}

/** 讀取某種類全部 id（不轉換）/ load all ids of a kind (no conversion) */
function loadAllResourceIds(kind: EnumResourceKind, root: string): IResourceId[]
{
	// 以 raw 物件上的 no 欄位取值（Guard/Land 等文字 id 亦統一為 no）
	return (loadAllResourceYaml(kind, root) as Array<{ no?: IResourceId }>).map((r) => r.no).filter(
		(v): v is IResourceId => v !== undefined,
	);
}