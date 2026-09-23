// 被動技能加成 / Passive skill bonuses
// 對應 docs/log/battle/03 §6.2 skill_passive()：將已學被動技能的 P_*/M_* 與 SPECIAL 累加至角色。

import type { Character } from '../character/Character';
import { COMP_FIELDS } from '../character/status-attrs';
import type { IDataRepository } from '../data/repository';

/** 套用所有已學且為被動(passive)技能的能力加成 */
export function skillPassive(char: Character, repo: IDataRepository): void {
	for (const no of char.skill) {
		const sk = repo.getSkill(no);
		if (!sk || !sk.passive) continue;

		for (const f of COMP_FIELDS) {
			const v = sk[f];
			if (v) char[f] += v;
		}
		if (sk.HealBonus) char.SPECIAL.HealBonus += sk.HealBonus;
	}
}
