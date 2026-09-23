// 資料儲存抽象 / Data repository abstraction
// 本變更僅提供 InMemoryRepository + 少量範例資料；YAML 資源匯入留待後續變更。
// 所有系統透過 IDataRepository 取得技能/職業/物品/怪物/角色定義。

import type { ISkillDef, IItemDef, IJobDef, ICharDef, IMonDef } from '../types';


/**
 * 資料儲存庫介面 / Data repository interface
 * 介面 / interface
 */
export interface IDataRepository {
	getSkill(no: number): ISkillDef | undefined;
	getJob(no: number): IJobDef | undefined;
	getItem(no: number): IItemDef | undefined;
	getMon(no: number): IMonDef | undefined;
	getCharBase(no: number): ICharDef | undefined;
}

export class InMemoryRepository implements IDataRepository {
	private skills = new Map<number, ISkillDef>();
	private jobs = new Map<number, IJobDef>();
	private items = new Map<number, IItemDef>();
	private mons = new Map<number, IMonDef>();
	private chars = new Map<number, ICharDef>();

	addSkill(d: ISkillDef): void { this.skills.set(d.no, d); }
	addJob(d: IJobDef): void { this.jobs.set(Number(d.no), d); }
	addItem(d: IItemDef): void { this.items.set(d.no, d); }
	addMon(d: IMonDef): void { this.mons.set(d.no, d); }
	addChar(d: ICharDef): void { this.chars.set(d.no, d); }

	getSkill(no: number): ISkillDef | undefined { return this.skills.get(no); }
	getJob(no: number): IJobDef | undefined { return this.jobs.get(no); }
	getItem(no: number): IItemDef | undefined { return this.items.get(no); }
	getMon(no: number): IMonDef | undefined { return this.mons.get(no); }
	getCharBase(no: number): ICharDef | undefined { return this.chars.get(no); }
}
