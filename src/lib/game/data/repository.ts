/**
 * 資料儲存抽象 / Data repository abstraction
 * 所有系統透過 IDataRepository 取得技能/職業/物品/怪物/角色定義。
 * Every system fetches skill / job / item / monster / character definitions through
 * IDataRepository.
 */

import type { ICharDef } from '#/lib/types/char-types';
import type { IItemDef } from '#/lib/types/item-types';
import type { IJobDef } from '#/lib/types/job-types';
import type { IMonDef } from '#/lib/types/mon-types';
import type { ISkillDef } from '#/lib/types/skill-types';

/**
 * 資料儲存庫介面 / Data repository interface
 */
export interface IDataRepository
{
	/** 依編號取得技能 / fetch a skill by number */
	getSkill(no: number): ISkillDef | undefined;

	/** 依編號取得職業 / fetch a job by number */
	getJob(no: number): IJobDef | undefined;

	/** 依編號取得道具 / fetch an item by number */
	getItem(no: number): IItemDef | undefined;

	/** 依編號取得怪物 / fetch a monster by number */
	getMon(no: number): IMonDef | undefined;

	/** 依編號取得角色基礎定義 / fetch a base character definition by number */
	getCharBase(no: number): ICharDef | undefined;
}

/**
 * 定義集合（批次登錄用）/ Collections of definitions (bulk registration)
 * 五類皆可缺省——調用方只需提供手上有的那幾類。
 * Every kind is optional — a caller only supplies the kinds it actually holds.
 */
export interface IDefCollections
{
	/** 技能表 / skills */
	skills?: readonly ISkillDef[];
	/** 職業表 / jobs */
	jobs?: readonly IJobDef[];
	/** 道具表 / items */
	items?: readonly IItemDef[];
	/** 怪物表 / monsters */
	mons?: readonly IMonDef[];
	/** 角色表 / characters */
	chars?: readonly ICharDef[];
}

/**
 * 具 `no` 編號的定義 / A definition carrying its `no` number
 * 五類定義皆 extends INamedIconDef（或其 `Omit<...,'img'>` 變體），`no` 恆為 number。
 * All five kinds extend INamedIconDef (or its `Omit<...,'img'>` variant), so `no` is always
 * a number — that is what lets the table key without a per-kind extractor.
 */
interface INumberedDef
{
	/** 編號（repository 索引鍵）/ number (the repository index key) */
	no: number;
}

/**
 * 以 no 為鍵的單一資源表 / One `no`-keyed resource table
 *
 * 五類定義共用的 Map 存取；鍵直接取自 `def.no`，不需各類自備取鍵函式。
 * The shared Map access for all five kinds; the key comes straight from `def.no`, so no
 * kind needs its own key extractor.
 */
class EntityTable<T extends INumberedDef>
{
	/** 內部表 / backing map */
	private readonly entries = new Map<number, T>();

	/** 登入一筆定義 / register one definition */
	add(def: T): void
	{
		this.entries.set(def.no, def);
	}

	/** 依編號取得 / fetch by number */
	get(no: number): T | undefined
	{
		return this.entries.get(no);
	}
}

/**
 * 記憶體資料儲存庫實作 / In-memory data repository implementation
 */
export class InMemoryRepository implements IDataRepository
{
	/** 技能表 / skills */
	private readonly skills = new EntityTable<ISkillDef>();
	/** 職業表 / jobs */
	private readonly jobs = new EntityTable<IJobDef>();
	/** 道具表 / items */
	private readonly items = new EntityTable<IItemDef>();
	/** 怪物表 / monsters */
	private readonly mons = new EntityTable<IMonDef>();
	/** 角色表 / characters */
	private readonly chars = new EntityTable<ICharDef>();

	/**
	 * 批次登錄定義集合 / Register collections of definitions
	 * 依 skills → jobs → items → mons → chars 順序登錄（鍵為 no，彼此不衝突）。
	 * Registers skills → jobs → items → mons → chars (keys are `no`, so they never collide).
	 */
	addAll(collections: IDefCollections): void
	{
		for (const d of collections.skills ?? []) this.skills.add(d);
		for (const d of collections.jobs ?? []) this.jobs.add(d);
		for (const d of collections.items ?? []) this.items.add(d);
		for (const d of collections.mons ?? []) this.mons.add(d);
		for (const d of collections.chars ?? []) this.chars.add(d);
	}

	/** 登入技能 / register a skill */
	addSkill(d: ISkillDef): void
	{ this.skills.add(d); }

	/** 登入職業 / register a job */
	addJob(d: IJobDef): void
	{ this.jobs.add(d); }

	/** 登入道具 / register an item */
	addItem(d: IItemDef): void
	{ this.items.add(d); }

	/** 登入怪物 / register a monster */
	addMon(d: IMonDef): void
	{ this.mons.add(d); }

	/** 登入角色 / register a character */
	addChar(d: ICharDef): void
	{ this.chars.add(d); }

	/** 依編號取得技能 / fetch a skill by number */
	getSkill(no: number): ISkillDef | undefined
	{ return this.skills.get(no); }

	/** 依編號取得職業 / fetch a job by number */
	getJob(no: number): IJobDef | undefined
	{ return this.jobs.get(no); }

	/** 依編號取得道具 / fetch an item by number */
	getItem(no: number): IItemDef | undefined
	{ return this.items.get(no); }

	/** 依編號取得怪物 / fetch a monster by number */
	getMon(no: number): IMonDef | undefined
	{ return this.mons.get(no); }

	/** 依編號取得角色 / fetch a character by number */
	getCharBase(no: number): ICharDef | undefined
	{ return this.chars.get(no); }
}
