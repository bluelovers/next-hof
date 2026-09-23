// 戰鬥隊伍 / Battle team
// 對應 docs/log/battle/04 §4（Battle_Team）。管理成員、存活統計與隨機選取。

import { EnumState } from '../constants';
import type { Character } from '../character/Character';
import type { RNG } from '../core/rng';
import { weightedPick } from '../core/random';

export class BattleTeam {
	side: string;
	members: Character[] = [];
	mc = 0; // 魔方陣累計數（team-level）

	constructor(side: string) {
		this.side = side;
	}

	add(c: Character): void {
		c.team = this;
		this.members.push(c);
	}

	all(): Character[] {
		return this.members;
	}

	alive(): Character[] {
		return this.members.filter((c) => c.STATE !== EnumState.Dead);
	}

	isDead(c: Character): boolean {
		return c.STATE === EnumState.Dead;
	}

	/** 存活成員數（不含召喚物） */
	CountAlive(): number {
		return this.members.filter((c) => c.STATE !== EnumState.Dead && !c.isSummon()).length;
	}

	/** 死亡成員數（不含召喚物） */
	CountDead(): number {
		return this.members.filter((c) => c.STATE === EnumState.Dead && !c.isSummon()).length;
	}

	/** 存活的真實角色（不含召喚物） */
	CountAliveChars(): number {
		return this.members.filter((c) => c.isChar() && c.STATE !== EnumState.Dead).length;
	}

	/** 真實角色總數（不含召喚物） */
	CountTrueChars(): number {
		return this.members.filter((c) => c.isChar()).length;
	}

	/** 隨機選取一名存活成員（含召喚物，可作為目標） */
	pick(rng: RNG): Character | undefined {
		const a = this.alive();
		if (a.length === 0) return undefined;
		const entries = a.map((c) => [c, 1] as [Character, number]);
		return weightedPick(entries, rng);
	}

	/** 獨立抽取 amount 名存活成員（有放回，用於群體/多目標技能） */
	pickList(amount: number, rng: RNG): Character[] {
		const out: Character[] = [];
		for (let i = 0; i < amount; i++) {
			const c = this.pick(rng);
			if (c) out.push(c);
		}
		return out;
	}
}
