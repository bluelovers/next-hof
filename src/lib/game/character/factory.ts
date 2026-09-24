// 角色工廠 / Character factories
// 依據 ICharDef / IMonDef 建立 Character 實例，並完成戰鬥變數初始化。

import { Character } from './Character';
import { setBattleVariable } from './battle-variable';
import { levelFix } from './level-fix';
import { PRIMARY_STATS } from './status-attrs';
import type { IDataRepository } from '../data/repository';
import type { RNG } from '../core/rng';
import type { ICharDef, IMonDef } from '../types';
import { EnumCharType } from '../types';

/**
 * 建立玩家角色 / Create a player character
 * @param def 角色定義 / character definition
 * @param repo 資料倉庫 / data repository
 * @param rng 隨機源（存入 c.rng 供後續擲骰）/ random source (stored on c.rng for later rolls)
 */
export function newChar(def: ICharDef, repo: IDataRepository, rng: RNG): Character {
	const c = new Character({
		no: def.no,
		unitUuid: def.unitUuid,
		name: def.name,
		types: [EnumCharType.Char],
		level: def.level,
		exp: def.exp,
		str: def.str,
		int: def.int,
		dex: def.dex,
		spd: def.spd,
		luk: def.luk,
		maxhp: def.maxhp,
		hp: def.hp,
		maxsp: def.maxsp,
		sp: def.sp,
		job: def.job,
		skill: def.skill,
		equip: def.equip,
		behavior: def.behavior,
		corpse: def.corpse,
	});
	c.rng = rng;
	setBattleVariable(c, repo, rng);
	return c;
}

/**
 * 建立怪物 / Create a monster
 * @param def 怪物定義 / monster definition
 * @param repo 資料倉庫 / data repository
 * @param rng 隨機源 / random source
 * @param strength 強度倍率（≠1 時六維與 HP/SP 上限向上取整並回滿）/ strength multiplier (when ≠1, ceil-scales stats and HP/SP caps, then refills)
 */
export function newMon(def: IMonDef, repo: IDataRepository, rng: RNG, strength = 1): Character {
	const c = new Character({
		no: def.no,
		unitUuid: def.unitUuid,
		name: def.name,
		types: [EnumCharType.Mon],
		level: def.level,
		str: def.str,
		int: def.int,
		dex: def.dex,
		spd: def.spd,
		luk: def.luk,
		maxhp: def.maxhp,
		hp: def.hp,
		maxsp: def.maxsp,
		sp: def.sp,
		skill: def.skill,
		behavior: def.behavior,
		reward: def.reward,
		corpse: def.corpse,
	});
	c.rng = rng;
	if (strength && strength !== 1) {
		for (const k of PRIMARY_STATS) {
			c[k] = Math.ceil(c[k] * strength);
		}
		c.maxhp = Math.ceil(c.maxhp * strength);
		c.hp = c.maxhp;
		c.maxsp = Math.ceil(c.maxsp * strength);
		c.sp = c.maxsp;
	}
	setBattleVariable(c, repo, rng);
	return c;
}

/**
 * 建立召喚物（Mon + Summon 類型疊加）/ Create a summon (Mon + Summon types stacked)
 * Callers rely on EnumCharType.Summon so counts exclude it.
 */
export function newMonSummon(def: IMonDef, repo: IDataRepository, rng: RNG, strength = 1): Character {
	const c = newMon(def, repo, rng, strength);
	c.types.add(EnumCharType.Summon);
	return c;
}

/**
 * 建立工會怪（Mon + Union 類型疊加）/ Create a union monster (Mon + Union types stacked)
 */
export function newUnion(def: IMonDef, repo: IDataRepository, rng: RNG): Character {
	const c = newMon(def, repo, rng, 1);
	c.types.add(EnumCharType.Union);
	return c;
}
