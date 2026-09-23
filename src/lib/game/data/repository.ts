// 資料儲存抽象 / Data repository abstraction
// 本變更僅提供 InMemoryRepository + 少量範例資料；YAML 資源匯入留待後續變更。
// 所有系統透過 IDataRepository 取得技能/職業/物品/怪物/角色定義。

import type { ISkillDef, IItemDef, IJobDef, ICharDef, IMonDef } from '../types';


/**
 * 資料儲存庫介面 / Data repository interface
 * 介面 / interface
 */
export interface IDataRepository {
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
 * 記憶體資料儲存庫實作 / In-memory data repository implementation
 * 類別 / class
 */
export class InMemoryRepository implements IDataRepository {
	/** 技能表 / skills */
	private skills = new Map<number, ISkillDef>();
	/** 職業表（鍵已 Number() 正規化）/ jobs (keys normalized with Number()) */
	private jobs = new Map<number, IJobDef>();
	/** 道具表 / items */
	private items = new Map<number, IItemDef>();
	/** 怪物表 / monsters */
	private mons = new Map<number, IMonDef>();
	/** 角色表 / characters */
	private chars = new Map<number, ICharDef>();

	/** 登入技能 / register a skill */
	addSkill(d: ISkillDef): void { this.skills.set(d.no, d); }
	/** 登入職業 / register a job */
	addJob(d: IJobDef): void { this.jobs.set(Number(d.no), d); }
	/** 登入道具 / register an item */
	addItem(d: IItemDef): void { this.items.set(d.no, d); }
	/** 登入怪物 / register a monster */
	addMon(d: IMonDef): void { this.mons.set(d.no, d); }
	/** 登入角色 / register a character */
	addChar(d: ICharDef): void { this.chars.set(d.no, d); }

	/** 依編號取得技能 / fetch a skill by number */
	getSkill(no: number): ISkillDef | undefined { return this.skills.get(no); }
	/** 依編號取得職業 / fetch a job by number */
	getJob(no: number): IJobDef | undefined { return this.jobs.get(no); }
	/** 依編號取得道具 / fetch an item by number */
	getItem(no: number): IItemDef | undefined { return this.items.get(no); }
	/** 依編號取得怪物 / fetch a monster by number */
	getMon(no: number): IMonDef | undefined { return this.mons.get(no); }
	/** 依編號取得角色 / fetch a character by number */
	getCharBase(no: number): ICharDef | undefined { return this.chars.get(no); }
}
