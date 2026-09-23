// 角色物件 / Character model
// 統一玩家角色(char)、怪物(mon)、召喚物(summon)、工會怪(union) 的基礎與戰鬥屬性。
// 邏輯以自由函式（battle-variable / level-fix / status / equip / passive）操作本物件，
// 不採用 PHP 的多層繼承，保持可序列化與易測試。

import { EnumState, EnumPosition, EnumExpect } from '../constants';
import type { IBehavior, ISpecial, ICharCore, IMonReward } from '../types';
import { EnumCharType, EnumEquipSlot, EnumWeaponType } from '../types';
import type { RNG } from '../core/rng';


/**
 * 角色初始化參數 / Character initialization parameters
 * 介面 / interface
 */
export interface ICharInit extends ICharCore {
	types: EnumCharType[];
	exp?: number;
	job?: number;
	equip?: Partial<Record<EnumEquipSlot, number>>;
	reward?: IMonReward;
}

export function defaultSpecial(): ISpecial {
	return {
		PoisonResist: 0,
		HealBonus: 0,
		Barrier: 0,
		Pierce: [0, 0],
		Summon: 0,
		Undead: 0,
		HpRegen: 0,
		SpRegen: 0,
	};
}

export class Character {
	no: number;
	name: string;
	types: Set<EnumCharType>;
	uniqid: string;
	level: number;
	exp = 0;

	// 基礎屬性 / base
	str: number;
	int: number;
	dex: number;
	spd: number;
	luk: number;
	maxhp: number;
	hp: number;
	maxsp: number;
	sp: number;

	// 補正 / compensation
	P_STR = 0; P_INT = 0; P_DEX = 0; P_SPD = 0; P_LUK = 0;
	P_MAXHP = 0; P_MAXSP = 0;
	M_MAXHP = 0; M_MAXSP = 0;

	// 戰鬥屬性 / battle
	STR = 0; INT = 0; DEX = 0; SPD = 0; LUK = 0;
	MAXHP = 0; HP = 0; MAXSP = 0; SP = 0;
	atk: [number, number] = [0, 0];
	def: [number, number, number, number] = [0, 0, 0, 0];
	WEAPON: EnumWeaponType | undefined = undefined;

	STATE: EnumState = EnumState.Alive;
	POSITION: EnumPosition = EnumPosition.Front;
	SPECIAL: ISpecial = defaultSpecial();

	skill: number[] = [];
	equip: Partial<Record<EnumEquipSlot, number>> = {};
	behavior?: IBehavior;
	job?: number;
	reward?: { moneyhold?: number; exphold?: number; itemtable?: Record<number, number> };

	// 戰鬥執行期狀態 / runtime
	delay = 0;
	expect: number | null = null;
	expect_type: EnumExpect | null = null;
	target_expect: Character | null = null;
	actCount = 0;
	team: unknown = null;
	rng: RNG | null = null;

	constructor(init: ICharInit) {
		this.no = init.no;
		this.name = init.name;
		this.types = new Set(init.types);
		this.uniqid = `${init.types.join('-')}-${init.no}-${Math.random().toString(36).slice(2, 8)}`;
		this.level = init.level;
		this.exp = init.exp ?? 0;
		this.str = init.str;
		this.int = init.int;
		this.dex = init.dex;
		this.spd = init.spd;
		this.luk = init.luk;
		this.maxhp = init.maxhp;
		this.hp = init.hp ?? init.maxhp;
		this.maxsp = init.maxsp;
		this.sp = init.sp ?? init.maxsp;
		this.job = init.job;
		this.skill = init.skill ?? [];
		this.equip = init.equip ?? {};
		this.behavior = init.behavior;
		this.reward = init.reward;
	}

	isChar(): boolean { return this.types.has(EnumCharType.Char); }
	isMon(): boolean { return this.types.has(EnumCharType.Mon); }
	isSummon(): boolean { return this.types.has(EnumCharType.Summon); }
	isUnion(): boolean { return this.types.has(EnumCharType.Union); }

	getSpecial(key: string): number {
		return (this.SPECIAL as unknown as Record<string, number>)[key] ?? 0;
	}
	addSpecial(key: string, amount: number): number {
		const s = this.SPECIAL as unknown as Record<string, number>;
		s[key] = (s[key] ?? 0) + amount;
		return s[key];
	}
	setSpecial(key: string, value: number): void {
		(this.SPECIAL as unknown as Record<string, number>)[key] = value;
	}

	hpPercent(): number {
		return this.MAXHP > 0 ? (this.HP / this.MAXHP) * 100 : 0;
	}
	spPercent(): number {
		return this.MAXSP > 0 ? (this.SP / this.MAXSP) * 100 : 0;
	}
}
