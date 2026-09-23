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
	/** 角色類型集合（char/mon/summon/union 等）/ character type tags (char/mon/summon/union, ...) */
	types: EnumCharType[];
	/** 當前累積經驗（怪物可省略）/ accumulated exp (optional for monsters) */
	exp?: number;
	/** 職業編號 / job number */
	job?: number;
	/** 各欄位裝備的道具編號 / equipped item number per slot */
	equip?: Partial<Record<EnumEquipSlot, number>>;
	/** 怪物獎勵定義（僅怪物有）/ monster reward definition (monsters only) */
	reward?: IMonReward;
}

/**
 * 特殊能力的初始值 / Initial values for SPECIAL
 * 回傳全零的 ISpecial（所有數值欄位歸零、Pierce 為 [0,0]）。
 * Returns an all-zero ISpecial (numeric fields at 0, Pierce as [0,0]).
 */
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
	/** 單位編號 / unit number */
	no: number;
	/** 單位名稱 / unit name */
	name: string;
	/** 類型集合（char/mon/summon/union）/ type tags (char/mon/summon/union) */
	types: Set<EnumCharType>;
	/** 唯一識別字串（類型-編號-隨機尾碼）/ unique id (types-no-random suffix) */
	uniqid: string;
	/** 等級 / level */
	level: number;
	/** 當前累積經驗 / accumulated exp */
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
	/** 戰鬥六維（基礎值 + P_* 補正，setBattleVariable 計算）/ battle stats (base + P_*, computed by setBattleVariable) */
	STR = 0; INT = 0; DEX = 0; SPD = 0; LUK = 0;
	/** 戰鬥用 HP/SP 上限與現值（乘 M_% 加 P_* 後的結果）/ battle HP/SP caps and current values (after M_% scaling and P_* bonuses) */
	MAXHP = 0; HP = 0; MAXSP = 0; SP = 0;
	/** 物理/魔法攻擊（來源於裝備；索引同 EnumAtkSlot）/ physical/magic attack from equipment (indices match EnumAtkSlot) */
	atk: [number, number] = [0, 0];
	/** [物理%, 物理定值, 魔法%, 魔法定值] 減傷（索引同 EnumDefSlot）/ [phys%, phys flat, mag%, mag flat] reductions (indices match EnumDefSlot) */
	def: [number, number, number, number] = [0, 0, 0, 0];
	/** 目前主手武器型別（CalcEquips 寫入，供技能武器限制比對）/ current main-hand weapon type (written by CalcEquips for skill weapon limits) */
	WEAPON: EnumWeaponType | undefined = undefined;

	/** 生死／中毒狀態 / alive-dead / poison state */
	STATE: EnumState = EnumState.Alive;
	/** 前衛／後衛站位（開戰隨機決定）/ front/back row (randomized at battle start) */
	POSITION: EnumPosition = EnumPosition.Front;
	/** 特殊能力（Barrier/Pierce/Regen 等）/ special abilities (Barrier/Pierce/Regen, ...) */
	SPECIAL: ISpecial = defaultSpecial();

	/** 已習得技能編號 / learned skill numbers */
	skill: number[] = [];
	/** 各欄位裝備的道具編號 / equipped item number per slot */
	equip: Partial<Record<EnumEquipSlot, number>> = {};
	/** AI 行為設定 / AI behavior settings */
	behavior?: IBehavior;
	/** 職業編號 / job number */
	job?: number;
	/** 怪物獎勵定義 / monster reward definition */
	reward?: { moneyhold?: number; exphold?: number; itemtable?: Record<number, number> };

	// 戰鬥執行期狀態 / runtime
	/** 行動延遲值（越小越先行動；死亡設為 Infinity）/ action delay (smaller acts first; Infinity when dead) */
	delay = 0;
	/** 詠唱中的技能編號（null＝無）/ skill currently charging (null = none) */
	expect: number | null = null;
	/** 詠唱預期類型 / expected action type while charging */
	expect_type: EnumExpect | null = null;
	/** 預期目標（保留欄位）/ intended target (reserved field) */
	target_expect: Character | null = null;
	/** 已行動次數 / number of actions taken */
	actCount = 0;
	/** 所屬隊伍（BattleTeam；以 unknown 承載避免迴圈相依）/ owning team (BattleTeam; held as unknown to avoid a circular import) */
	team: unknown = null;
	/** 隨機源（開戰前注入）/ random source (injected before battle) */
	rng: RNG | null = null;

	/**
	 * 由初始化參數建立角色 / Build a character from its init parameters
	 * hp/sp 省略時以 maxhp/maxsp 補齊；types 轉為 Set 並產生 uniqid。
	 * hp/sp default to maxhp/maxsp; types become a Set and uniqid is generated.
	 */
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

	/** 是否為玩家角色 / whether this is a player character */
	isChar(): boolean { return this.types.has(EnumCharType.Char); }
	/** 是否為怪物（含召喚物/工會怪）/ whether this is a monster (summons/unions included) */
	isMon(): boolean { return this.types.has(EnumCharType.Mon); }
	/** 是否為召喚物 / whether this is a summon */
	isSummon(): boolean { return this.types.has(EnumCharType.Summon); }
	/** 是否為工會怪 / whether this is a union monster */
	isUnion(): boolean { return this.types.has(EnumCharType.Union); }

	/** 以字串鍵讀取 SPECIAL 數值（缺省 0）/ read a SPECIAL value by string key (0 when absent) */
	getSpecial(key: string): number {
		return (this.SPECIAL as unknown as Record<string, number>)[key] ?? 0;
	}
	/** 以字串鍵累加 SPECIAL 數值，回傳新值 / add to a SPECIAL value by string key, returning the new value */
	addSpecial(key: string, amount: number): number {
		const s = this.SPECIAL as unknown as Record<string, number>;
		s[key] = (s[key] ?? 0) + amount;
		return s[key];
	}
	/** 以字串鍵設定 SPECIAL 數值 / set a SPECIAL value by string key */
	setSpecial(key: string, value: number): void {
		(this.SPECIAL as unknown as Record<string, number>)[key] = value;
	}

	/** HP 百分比（MAXHP=0 時回 0）/ HP percentage (0 when MAXHP is 0) */
	hpPercent(): number {
		return this.MAXHP > 0 ? (this.HP / this.MAXHP) * 100 : 0;
	}
	/** SP 百分比（MAXSP=0 時回 0）/ SP percentage (0 when MAXSP is 0) */
	spPercent(): number {
		return this.MAXSP > 0 ? (this.SP / this.MAXSP) * 100 : 0;
	}
}
