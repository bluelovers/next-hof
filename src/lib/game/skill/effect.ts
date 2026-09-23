// 技能效果套用 / Skill effect application
// 對應 docs/log/battle/02 §3（傷害/回復）, §4（守護由 battle/guard 處理）, §7（Buff/Debuff）,
// docs/data/skill.md（Up*/Down*/Plus*/Poison/CurePoison/HpRegen/SpRegen ...）。

import { MAX_STATUS_MAXIMUM, EnumState } from '../constants';
import type { Character } from '../character/Character';
import { hpDamage, hpRecover, getPoison, getNormal } from '../character/status';
import type { ISkillDef, IBattleEvent } from '../types';
import type { RNG } from '../core/rng';


/**
 * 技能執行結果 / Skill execution result
 * 介面 / interface
 */
export interface ISkillResult {
	damage?: number;
	heal?: number;
	events: IBattleEvent[];
}

/** 物理/魔法基礎傷害計算（對應 CalcBasicDamage） */
export function calcBasicDamage(skill: ISkillDef, user: Character, target: Character): number {
	const isMagic = skill.type === 1;
	const stat = skill.inf === 'dex'
		? user.DEX
		: (isMagic ? user.INT : user.STR);
	const atkIdx = isMagic ? 1 : 0;
	const base = Math.sqrt(stat) * 10 + (user.atk[atkIdx] ?? 0);
	let raw = base * (skill.pow ?? 100) / 100;

	if (!skill.pierce) {
		if (isMagic) {
			raw = raw * (1 - (target.def[2] ?? 0) / 100);
			raw = raw - (target.def[3] ?? 0);
		} else {
			raw = raw * (1 - (target.def[0] ?? 0) / 100);
			raw = raw - (target.def[1] ?? 0);
		}
	}

	const minDmg = raw * 0.1; // 最小傷害保證
	let dmg = Math.max(raw, minDmg);

	if (skill.pierce) {
		const p = user.SPECIAL.Pierce[isMagic ? 1 : 0] ?? 0;
		dmg += (p * (skill.pow ?? 100)) / 100;
	}

	return Math.ceil(dmg);
}

/** 回復量計算（對應 CalcRecoveryValue） */
export function calcRecoveryValue(skill: ISkillDef, user: Character): number {
	const heal = Math.sqrt(user.INT) * 10 + (user.atk[1] ?? 0);
	return Math.ceil(heal * (skill.pow ?? 100) / 100);
}


/**
 * 屬性函式 / Attribute function
 * 型別別名 / type alias
 */
type IAttrFn = (c: Character, n: number) => void;

const upAttr = (get: (c: Character) => number, set: (c: Character, v: number) => void): IAttrFn =>
	(c, n) => {
		const orig = get(c);
		const cap = orig * (MAX_STATUS_MAXIMUM / 100);
		const next = Math.round(orig * (1 + n / 100));
		set(c, Math.min(next, cap));
	};

const downAttr = (get: (c: Character) => number, set: (c: Character, v: number) => void): IAttrFn =>
	(c, n) => {
		const orig = get(c);
		set(c, Math.round(orig * (1 - n / 100)));
	};

const plusAttr = (get: (c: Character) => number, set: (c: Character, v: number) => void): IAttrFn =>
	(c, n) => set(c, get(c) + n);

const UPMAP: Record<string, IAttrFn> = {
	UpSTR: upAttr((c) => c.STR, (c, v) => (c.STR = v)),
	UpINT: upAttr((c) => c.INT, (c, v) => (c.INT = v)),
	UpDEX: upAttr((c) => c.DEX, (c, v) => (c.DEX = v)),
	UpSPD: upAttr((c) => c.SPD, (c, v) => (c.SPD = v)),
	UpLUK: upAttr((c) => c.LUK, (c, v) => (c.LUK = v)),
	UpATK: upAttr((c) => c.atk[0], (c, v) => (c.atk[0] = v)),
	UpMATK: upAttr((c) => c.atk[1], (c, v) => (c.atk[1] = v)),
	UpDEF: (c, n) => { c.def[0] += Math.floor((100 - c.def[0]) * (n / 100)); },
	UpMDEF: (c, n) => { c.def[2] += Math.floor((100 - c.def[2]) * (n / 100)); },
	UpMAXHP: upAttr((c) => c.MAXHP, (c, v) => (c.MAXHP = v)),
	UpMAXSP: upAttr((c) => c.MAXSP, (c, v) => (c.MAXSP = v)),
};

const DOWNMAP: Record<string, IAttrFn> = {
	DownSTR: downAttr((c) => c.STR, (c, v) => (c.STR = v)),
	DownINT: downAttr((c) => c.INT, (c, v) => (c.INT = v)),
	DownDEX: downAttr((c) => c.DEX, (c, v) => (c.DEX = v)),
	DownSPD: downAttr((c) => c.SPD, (c, v) => (c.SPD = v)),
	DownLUK: downAttr((c) => c.LUK, (c, v) => (c.LUK = v)),
	DownATK: downAttr((c) => c.atk[0], (c, v) => (c.atk[0] = v)),
	DownMATK: downAttr((c) => c.atk[1], (c, v) => (c.atk[1] = v)),
	DownDEF: (c, n) => { c.def[0] = Math.round(c.def[0] * (1 - n / 100)); },
	DownMDEF: (c, n) => { c.def[2] = Math.round(c.def[2] * (1 - n / 100)); },
	DownMAXHP: downAttr((c) => c.MAXHP, (c, v) => (c.MAXHP = v)),
	DownMAXSP: downAttr((c) => c.MAXSP, (c, v) => (c.MAXSP = v)),
};

const PLUSMAP: Record<string, IAttrFn> = {
	PlusSTR: plusAttr((c) => c.STR, (c, v) => (c.STR = v)),
	PlusINT: plusAttr((c) => c.INT, (c, v) => (c.INT = v)),
	PlusDEX: plusAttr((c) => c.DEX, (c, v) => (c.DEX = v)),
	PlusSPD: plusAttr((c) => c.SPD, (c, v) => (c.SPD = v)),
	PlusLUK: plusAttr((c) => c.LUK, (c, v) => (c.LUK = v)),
	PlusMAXHP: plusAttr((c) => c.MAXHP, (c, v) => (c.MAXHP = v)),
	PlusMAXSP: plusAttr((c) => c.MAXSP, (c, v) => (c.MAXSP = v)),
};

/** 套用技能的状态變化（對應 StatusChanges）。增益/減益分別作用於使用者/目標。 */
export function statusChanges(skill: ISkillDef, target: Character, user: Character, rng?: RNG): void {
	for (const key of Object.keys(skill)) {
		const n = (skill as unknown as Record<string, unknown>)[key];
		if (typeof n !== 'number') continue;
		if (UPMAP[key]) UPMAP[key](user, n);
		else if (DOWNMAP[key]) DOWNMAP[key](target, n);
		else if (PLUSMAP[key]) PLUSMAP[key](user, n);
	}

	if (skill.poison) {
		getPoison(target, skill.poison, rng);
	}
	if (skill.CurePoison && target.STATE !== EnumState.Poison) {
		getNormal(target);
	}
	if (skill.HpRegen) target.SPECIAL.HpRegen += skill.HpRegen;
	if (skill.SpRegen) target.SPECIAL.SpRegen += skill.SpRegen;
}

/** 執行一次技能效果（傷害或回復），套用 Barrier 與狀態變化。守護/目標選擇由呼叫方處理。 */
export function applySkill(skill: ISkillDef, user: Character, target: Character, rng?: RNG): ISkillResult {
	const events: IBattleEvent[] = [];

	if (skill.support) {
		const heal = calcRecoveryValue(skill, user);
		const applied = hpRecover(target, heal);
		events.push({ type: 'heal', actor: String(user.no), target: String(target.no), skill: skill.no, value: applied });
		statusChanges(skill, target, user, rng);
		return { heal: applied, events };
	}

	const dmg = calcBasicDamage(skill, user, target);

	// 絕對防禦 Barrier：消耗一次，完全抵擋
	if (target.SPECIAL.Barrier > 0 && !skill.pierce) {
		target.SPECIAL.Barrier--;
		events.push({ type: 'guard', actor: String(target.no), target: String(target.no), text: 'barrier' });
		return { damage: 0, events };
	}

	const applied = hpDamage(target, dmg);
	events.push({ type: 'damage', actor: String(user.no), target: String(target.no), skill: skill.no, value: applied });
	statusChanges(skill, target, user, rng);
	return { damage: applied, events };
}
