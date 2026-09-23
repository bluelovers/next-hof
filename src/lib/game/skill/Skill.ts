// 技能定義 / Skill definition helpers
// 對應 docs/data/skill.md。倉庫回傳的即為 ISkillDef（YAML 結構），此處提供正規化與取值。

import type { ISkillDef } from '../types';
import type { IDataRepository } from '../data/repository';


/**
 * 原始技能資料 / Raw skill data
 * 型別別名 / type alias
 *
 * 必填欄位（no/name/sp/type）+ 其餘 ISkillDef 欄位皆可缺省。
 * Required fields (no/name/sp/type) plus optional remaining ISkillDef fields.
 */
type IRawSkill = Partial<ISkillDef> & { no: number; name: string; sp: number; type: 0 | 1 };

/** 正規化原始技能資料 / normalize raw skill data */
export function parseSkill(raw: IRawSkill): ISkillDef {
	return { ...raw };
}

/**
 * 依編號取得技能（倉庫無此筆回傳 undefined）/ fetch a skill by number (undefined when absent) */
export function getSkill(no: number, repo: IDataRepository): ISkillDef | undefined {
	const d = repo.getSkill(no);
	return d ? parseSkill(d) : undefined;
}
