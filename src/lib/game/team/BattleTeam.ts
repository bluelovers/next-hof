// 戰鬥隊伍 / Battle team
// 對應 docs/log/battle/04 §4（Battle_Team）。管理成員、存活統計與隨機選取。

import { EnumState, EnumTeamSide } from '../constants';
import type { Character } from '../character/Character';
import type { RNG } from '../core/rng';
import { weightedPick } from '../core/random';

/**
 * 戰鬥隊伍 / Battle team
 * 類別 / class
 *
 * 管理成員、存活統計與隨機選取。
 * Manages members, alive counts, and random target selection.
 */
export class BattleTeam {
	/** 隊伍側別 / side identifier */
	side: EnumTeamSide;
	/** 隊伍成員 / team members */
	members: Character[] = [];
	/** 魔方陣累計數（team-level）/ accumulated magic circles (team-level) */
	mc = 0;

	/**
	 * 建立隊伍 / Create a team
	 * @param side 側別 / side (EnumTeamSide.Team0 or EnumTeamSide.Team1)
	 */
	constructor(side: EnumTeamSide) {
		this.side = side;
	}

	/** 加入成員並回寫其 team 反向參照 / add a member and set its back-reference to this team */
	add(c: Character): void {
		c.team = this;
		this.members.push(c);
	}

	/** 全部成員（含死亡）/ all members, dead included */
	all(): Character[] {
		return this.members;
	}

	/** 存活成員（含召喚物）/ living members, summons included */
	alive(): Character[] {
		return this.members.filter((c) => c.STATE !== EnumState.Dead);
	}

	/** 該成員是否死亡 / whether the given member is dead */
	isDead(c: Character): boolean {
		return c.STATE === EnumState.Dead;
	}

	/** 存活成員數（不含召喚物）/ count of living members, excluding summons */
	CountAlive(): number {
		return this.members.filter((c) => c.STATE !== EnumState.Dead && !c.isSummon()).length;
	}

	/** 死亡成員數（不含召喚物）/ count of dead members, excluding summons */
	CountDead(): number {
		return this.members.filter((c) => c.STATE === EnumState.Dead && !c.isSummon()).length;
	}

	/** 存活的真實角色（不含召喚物）/ living real characters, excluding summons */
	CountAliveChars(): number {
		return this.members.filter((c) => c.isChar() && c.STATE !== EnumState.Dead).length;
	}

	/** 真實角色總數（不含召喚物）/ total real characters, excluding summons */
	CountTrueChars(): number {
		return this.members.filter((c) => c.isChar()).length;
	}

	/** 隨機選取一名存活成員（含召喚物，可作為目標）/ pick one living member at random (summons included; usable as a target) */
	pick(rng: RNG): Character | undefined {
		const a = this.alive();
		if (a.length === 0) return undefined;
		const entries = a.map((c) => [c, 1] as [Character, number]);
		return weightedPick(entries, rng);
	}

	/** 獨立抽取 amount 名存活成員（有放回，用於群體/多目標技能）/ draw `amount` living members independently (with replacement; for multi-target skills) */
	pickList(amount: number, rng: RNG): Character[] {
		const out: Character[] = [];
		for (let i = 0; i < amount; i++) {
			const c = this.pick(rng);
			if (c) out.push(c);
		}
		return out;
	}
}
