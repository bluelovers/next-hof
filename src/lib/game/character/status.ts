/**
 * 角色戰鬥狀態與效果 / Character battle status & effects
 * 對應 docs/log/battle/02 §3.4, §3.5, §6 與 docs/log/battle/05 §6。
 * 並移植原始 HOF/Class/Char/Battle/Effect.php 的 GetPoisonResist / SacrificeHp。
 * Also ports GetPoisonResist / SacrificeHp from HOF/Class/Char/Battle/Effect.php.
 */

import { EnumState, EnumPosition } from '../constants';
import type { Character } from './Character';
import type { RNG } from '../core/rng';

/**
 * 造成傷害（套用玩家保護機制），回傳實際扣血量
 * Deal damage (with player protection), returning the HP actually lost
 *
 * 玩家保護 / player protection:
 * - 傷害 >20 且會致死（HP>10 且 dmg>=HP）時保留 1 HP。
 *   kills are prevented (HP>10 and dmg>=HP) by leaving 1 HP when damage > 20.
 * - 低等（level<10 且 MAXHP<200）再額外減傷 max(10, 25-level)。
 *   low level (level<10 and MAXHP<200) takes an extra reduction of max(10, 25-level).
 */
export function hpDamage(char: Character, dmg: number): number
{
	if (char.isChar() && dmg > 20)
	{
		if (char.HP > 10 && dmg >= char.HP)
		{
			/** 留 1 HP（不致死） */
			dmg = char.HP - 1;
		}
		else if (char.level < 10 && char.MAXHP < 200)
		{
			/** 低等減傷 */
			dmg -= Math.max(10, 25 - char.level);
		}
	}
	dmg = Math.max(0, dmg);
	const before = char.HP;
	char.HP = Math.max(0, char.HP - dmg);
	return before - char.HP;
}

/**
 * 無保護扣血（對齊原始 HpDamage：純減血、可致死、無玩家保護、不下鉗 0）
 * Unprotected HP loss (mirrors the original HpDamage: a plain subtraction that can be fatal,
 * with no player protection and no floor at 0)
 *
 * 原始 HpDamage 只做 `HP -= damage` 並印出前後值；玩家保護在 CalcBasicDamage 內完成。
 * calcBasicDamage 的路徑因此由 hpDamage（含保護）套一次即為原版等價，而特例分支的原始值
 * （1024／1025／1116／3901 等直接 DamageHP 的路徑）必須走本函式，避免重複套保護。
 * The original HpDamage only does `HP -= damage` and shows the change; player protection lives in
 * CalcBasicDamage. A calcBasicDamage path therefore needs exactly one protection pass via hpDamage
 * to equal the original, while raw special-case values (1024 / 1025 / 1116 / 3901 and friends,
 * which call DamageHP directly) must go through this function so protection is not applied twice.
 *
 * @returns 實際扣血量（可能為負的 HP 變化量）/ HP actually lost (HP may go negative)
 */
export function hpDamageRaw(char: Character, dmg: number): number
{
	const before = char.HP;
	char.HP -= dmg;
	return before - char.HP;
}

/**
 * 扣血但不致死（對齊原始 HpDamage2：低於 1 時補回 1），回傳實際扣血量
 * Deal damage that cannot kill (mirrors the original HpDamage2: floors at 1), returning HP lost
 */
export function hpDamage2(char: Character, dmg: number): number
{
	const before = char.HP;
	char.HP -= dmg;
	if (char.HP < 1) char.HP = 1;
	return before - char.HP;
}

/** 回復 HP，回傳實際回復量（不超過 MAXHP）/ recover HP, returning the amount actually healed (capped at MAXHP) */
export function hpRecover(char: Character, amount: number): number
{
	const before = char.HP;
	char.HP = Math.min(char.MAXHP, char.HP + amount);
	return char.HP - before;
}

/** 消耗 SP，回傳實際消耗量（下限 0）/ spend SP, returning the amount actually spent (floor 0) */
export function spDamage(char: Character, dmg: number): number
{
	const before = char.SP;
	char.SP = Math.max(0, char.SP - dmg);
	return before - char.SP;
}

/** 回復 SP，回傳實際回復量（不超過 MAXSP）/ recover SP, returning the amount actually restored (capped at MAXSP) */
export function spRecover(char: Character, amount: number): number
{
	const before = char.SP;
	char.SP = Math.min(char.MAXSP, char.SP + amount);
	return char.SP - before;
}

/** 中毒傷害公式：(MAXHP*10% + ceil(level/2)) × multiply（對齊原始 PoisonDamageFormula）/ poison damage formula: (MAXHP*10% + ceil(level/2)) × multiply (mirrors PoisonDamageFormula) */
export function poisonDamageFormula(char: Character, multiply = 1): number
{
	const base = Math.round(char.MAXHP * 0.1) + Math.ceil(char.level / 2);
	return Math.round(base * multiply);
}

/**
 * 嘗試施加中毒。回傳：
 *  - false：已中毒（無法再次）
 *  - true：成功中毒
 *  - 'BLOCK'：有抗性且機率抵抗
 *
 * Attempt to poison a character. Returns:
 *  - false: already poisoned (cannot be poisoned again)
 *  - true: poison applied
 *  - 'BLOCK': has PoisonResist and the resist roll succeeded
 *
 * 抗性時機率折減為 bePoison*(1-PoisonResist/100)；無 rng 時視為無抗性直接成功。
 * With resistance the chance becomes bePoison*(1-PoisonResist/100); without an rng the resist roll is skipped (always succeeds).
 */
export function getPoison(char: Character, bePoison: number, rng?: RNG): boolean | 'BLOCK'
{
	if (char.STATE === EnumState.Poison) return false;

	if (char.SPECIAL.PoisonResist && rng)
	{
		const chance = bePoison * (1 - char.SPECIAL.PoisonResist / 100);
		if (rng.randInt(0, 99) < chance)
		{
			char.STATE = EnumState.Poison;
			return true;
		}
		return 'BLOCK';
	}

	char.STATE = EnumState.Poison;
	return true;
}

/**
 * 中毒持續傷害（不致死、地板 1；對齊原始 PoisonDamage→HpDamage2），回傳實際扣血量
 * per-turn poison damage (never fatal; floors at 1; mirrors PoisonDamage → HpDamage2),
 * returns HP lost
 *
 * @param multiply - 倍率（對齊原始 PoisonDamageFormula($multiply)，1208 倍增毒傷用）/
 * multiplier (mirrors PoisonDamageFormula($multiply); used by the 1208 multiplied poison damage)
 */
export function poisonDamage(char: Character, multiply = 1): number
{
	if (char.STATE !== EnumState.Poison) return 0;
	return hpDamage2(char, poisonDamageFormula(char, multiply));
}

/**
 * 取得中毒抗性：剩餘空間的 no% 累加至 SPECIAL.PoisonResist（對齊原始 GetPoisonResist）。
 * Gain poison resistance: add no% of the remaining room (100 - current) to SPECIAL.PoisonResist
 * (mirrors original GetPoisonResist).
 *
 * 原始公式 / original formula:
 *   Add = round( (100 - PoisonResist) * (no / 100) )
 *   PoisonResist += Add
 *
 * 由 statusChanges 在技能帶 `poisonResist` 欄位時呼叫（對應原始技能 1220 AntiPoisoning）。
 * Called by statusChanges when a skill carries the `poisonResist` field (mirrors skill 1220 AntiPoisoning).
 *
 * @returns 新的 PoisonResist 值 / the new PoisonResist value
 */
export function getPoisonResist(char: Character, no: number): number
{
	const add = Math.round((100 - char.SPECIAL.PoisonResist) * (no / 100));
	char.SPECIAL.PoisonResist += add;
	return char.SPECIAL.PoisonResist;
}

/**
 * HP 犧牲（對齊原始 SacrificeHp，由技能 `sacrifice` 欄位觸發、作用於使用者）。
 * Sacrifice HP (mirrors original SacrificeHp, triggered by the skill `sacrifice` field, applied to the user).
 *
 * 原始公式 / original formula:
 *   SelfDamage = ceil( MAXHP * (rate / 100) )
 *   if (POSITION != Front) SelfDamage *= 2   // 後衛犧牲翻倍
 *   HpDamage( SelfDamage )                    // 純扣血，可致死（無玩家保護）
 *
 * 注意：原始 SacrificeHp 呼叫的是 HpDamage（純減血、可致死），故這裡直接扣血而不走 hpDamage 的玩家保護。
 * Note: the original SacrificeHp calls the plain HpDamage (can be fatal), so this subtracts directly
 * instead of going through hpDamage's player-protection path.
 *
 * @returns 實際損失的 HP / the HP actually lost
 */
export function sacrificeHp(char: Character, rate: number): number
{
	if (!rate) return 0;
	let selfDamage = Math.ceil(char.MAXHP * (rate / 100));
	/** 後衛犧牲翻倍 */
	if (char.POSITION !== EnumPosition.Front) selfDamage *= 2;
	const before = char.HP;
	/** 純扣血、可致死 */
	char.HP = Math.max(0, char.HP - selfDamage);
	return before - char.HP;
}

/** 消耗一次 Barrier（絕對防禦），成功回傳 true / consume one Barrier charge (absolute guard), true on success */
export function consumeBarrier(char: Character): boolean
{
	if (char.SPECIAL.Barrier > 0)
	{
		char.SPECIAL.Barrier--;
		return true;
	}
	return false;
}

/** 持續回復（HpRegen / SpRegen），每回合行動前觸發 / periodic regen (HpRegen / SpRegen), triggered before acting each turn */
export function autoRegeneration(char: Character): void
{
	if (char.SPECIAL.HpRegen)
	{
		hpRecover(char, Math.round(char.MAXHP * char.SPECIAL.HpRegen / 100));
	}
	if (char.SPECIAL.SpRegen)
	{
		spRecover(char, Math.round(char.MAXSP * char.SPECIAL.SpRegen / 100));
	}
}

/** 解除異常狀態（復活/解毒後回到正常）/ clear the status effect (back to normal after revive/cure) */
export function getNormal(char: Character): void
{
	char.STATE = EnumState.Alive;
}
