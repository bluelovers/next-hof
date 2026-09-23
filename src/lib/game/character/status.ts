// 角色戰鬥狀態與效果 / Character battle status & effects
// 對應 docs/log/battle/02 §3.4, §3.5, §6 與 docs/log/battle/05 §6。

import { EnumState } from '../constants';
import type { Character } from './Character';
import type { RNG } from '../core/rng';

/** 造成傷害（套用玩家保護機制），回傳實際扣血量 */
export function hpDamage(char: Character, dmg: number): number {
	if (char.isChar() && dmg > 20) {
		if (char.HP > 10 && dmg >= char.HP) {
			dmg = char.HP - 1; // 留 1 HP（不致死）
		} else if (char.level < 10 && char.MAXHP < 200) {
			dmg -= Math.max(10, 25 - char.level); // 低等減傷
		}
	}
	dmg = Math.max(0, dmg);
	const before = char.HP;
	char.HP = Math.max(0, char.HP - dmg);
	return before - char.HP;
}

/** 回復 HP，回傳實際回復量（不超過 MAXHP） */
export function hpRecover(char: Character, amount: number): number {
	const before = char.HP;
	char.HP = Math.min(char.MAXHP, char.HP + amount);
	return char.HP - before;
}

export function spDamage(char: Character, dmg: number): number {
	const before = char.SP;
	char.SP = Math.max(0, char.SP - dmg);
	return before - char.SP;
}

export function spRecover(char: Character, amount: number): number {
	const before = char.SP;
	char.SP = Math.min(char.MAXSP, char.SP + amount);
	return char.SP - before;
}

/** 中毒傷害公式：MAXHP*10% + ceil(level/2) */
export function poisonDamageFormula(char: Character): number {
	return Math.round(char.MAXHP * 0.1) + Math.ceil(char.level / 2);
}

/**
 * 嘗試施加中毒。回傳：
 *  - false：已中毒（無法再次）
 *  - true：成功中毒
 *  - 'BLOCK'：有抗性且機率抵抗
 */
export function getPoison(char: Character, bePoison: number, rng?: RNG): boolean | 'BLOCK' {
	if (char.STATE === EnumState.Poison) return false;

	if (char.SPECIAL.PoisonResist && rng) {
		const chance = bePoison * (1 - char.SPECIAL.PoisonResist / 100);
		if (rng.randInt(0, 99) < chance) {
			char.STATE = EnumState.Poison;
			return true;
		}
		return 'BLOCK';
	}

	char.STATE = EnumState.Poison;
	return true;
}

/** 中毒持續傷害（不致死，最低 HP=1），回傳實際扣血量 */
export function poisonDamage(char: Character): number {
	if (char.STATE !== EnumState.Poison) return 0;
	const dmg = poisonDamageFormula(char);
	const before = char.HP;
	const after = char.HP - dmg;
	char.HP = after < 1 ? 1 : after; // 不會致死
	return before - char.HP;
}

/** 消耗一次 Barrier（絕對防禦），成功回傳 true */
export function consumeBarrier(char: Character): boolean {
	if (char.SPECIAL.Barrier > 0) {
		char.SPECIAL.Barrier--;
		return true;
	}
	return false;
}

/** 持續回復（HpRegen / SpRegen），每回合行動前觸發 */
export function autoRegeneration(char: Character): void {
	if (char.SPECIAL.HpRegen) {
		hpRecover(char, Math.round(char.MAXHP * char.SPECIAL.HpRegen / 100));
	}
	if (char.SPECIAL.SpRegen) {
		spRecover(char, Math.round(char.MAXSP * char.SPECIAL.SpRegen / 100));
	}
}

/** 解除異常狀態（復活/解毒後回到正常） */
export function getNormal(char: Character): void {
	char.STATE = EnumState.Alive;
}
