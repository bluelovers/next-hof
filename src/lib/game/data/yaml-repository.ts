/**
 * YAML 資源倉庫建置 / YAML-backed repository builder
 * 串接 yaml-load（讀取）→ yaml-convert（轉換）→ InMemoryRepository（註冊）。
 * Chains yaml-load (read) → yaml-convert (convert) → InMemoryRepository (register).
 *
 * 僅箱入 Char/Mon 兩種資源（Job/Item/Skill 等仍由 seed-data 或其他來源提供）。
 * Only Char/Mon are seeded here; Job/Item/Skill etc. still come from seed-data or other sources.
 */

import { InMemoryRepository, type IDataRepository } from './repository';
import { loadAllChars, loadAllMons, type IResourceKind } from './yaml-load';
import { convertCharYaml, convertMonYaml } from './yaml-convert';
import type { ICharDef, IMonDef } from '#/lib/game/types';

/** YAML 倉庫建置結果 / Results of building a YAML-backed repository */
export interface IYamlRepositoryResult
{
	/** 已註冊的資料倉庫 / the populated data repository */
	repo: IDataRepository;
	/** 已轉換的角色定義（依 no 升冪）/ converted char defs (ascending no) */
	chars: ICharDef[];
	/** 已轉換的怪物定義（依 no 升冪）/ converted mon defs (ascending no) */
	mons: IMonDef[];
}

/**
 * 自 HOF Resource 目錄建置資料倉庫 / Build a repository from the HOF Resource dirs
 * @param root 資源根目錄（含 Char／Mon 子目錄之上層，由呼叫方提供）/ resource root (the parent holding the Char/Mon subdirectories; supplied by the caller)
 * @returns 已註冊的 repo 與轉換結果 / the registered repo plus the converted defs
 */
export function createYamlRepository(root: string): IYamlRepositoryResult
{
	const chars = loadAllChars(root).map(convertCharYaml);
	const mons = loadAllMons(root).map(convertMonYaml);

	const repo = new InMemoryRepository();
	for (const c of chars) repo.addChar(c);
	for (const m of mons) repo.addMon(m);

	return { repo, chars, mons };
}

/**
 * 依資源種類列出已存在的編號 / List the existing numbers of a kind
 * （檔案層級探勘用；不會讀取內容）/ lists the file-level numbering (no content read)
 */
export function listResourceNos(kind: IResourceKind, root: string): number[]
{
	return kind === 'Char'
		? loadAllChars(root).map((c) => c.no)
		: loadAllMons(root).map((m) => m.no);
}