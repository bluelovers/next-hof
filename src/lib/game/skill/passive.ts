// 被動技能加成 / Passive skill bonuses
// 對應 docs/log/battle/03 §6.2 skill_passive()：將已學被動技能的 P_*/M_* 與 SPECIAL 累加至角色。

import type { Character } from '../character/Character';
import type { IDataRepository } from '../data/repository';

/** 套用所有已學且為被動(passive)技能的能力加成 */
export function skillPassive(char: Character, repo: IDataRepository): void {
	for (const no of char.skill) {
		const sk = repo.getSkill(no);
		if (!sk || !sk.passive) continue;

		if (sk.P_MAXHP) char.P_MAXHP += sk.P_MAXHP;
		if (sk.P_MAXSP) char.P_MAXSP += sk.P_MAXSP;
		if (sk.P_STR) char.P_STR += sk.P_STR;
		if (sk.P_INT) char.P_INT += sk.P_INT;
		if (sk.P_DEX) char.P_DEX += sk.P_DEX;
		if (sk.P_SPD) char.P_SPD += sk.P_SPD;
		if (sk.P_LUK) char.P_LUK += sk.P_LUK;
		if (sk.M_MAXHP) char.M_MAXHP += sk.M_MAXHP;
		if (sk.M_MAXSP) char.M_MAXSP += sk.M_MAXSP;
		if (sk.HealBonus) char.SPECIAL.HealBonus += sk.HealBonus;
	}
}
