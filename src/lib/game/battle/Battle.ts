// 戰鬥引擎 / Battle engine
// 對應 docs/log/battle/02（Battle）、03、04、05 的核心流程：
// 建隊 → setBattleVariable → SetDelay → Action（自動回復→中毒→判定→技能）→ 行動順序 → 結果。

import {
	EnumState, EnumExpect,
	BATTLE_MAX_TURNS, TURN_EXTENDS, BATTLE_MAX_EXTENDS, DELAY_BASE,
} from '../constants';
import { Character } from '../character/Character';
import { setBattleVariable } from '../character/battle-variable';
import { autoRegeneration, poisonDamage } from '../character/status';
import { getSkill } from '../skill/Skill';
import { applySkill } from '../skill/effect';
import { BattleTeam } from '../team/BattleTeam';
import { Defending } from './guard';
import { buildPattern, MultiFactJudge } from './pattern';
import { computeOutcome, BattleResult } from './BattleResult';
import type { IDataRepository } from '../data/repository';
import type { RNG } from '../core/rng';
import type { ITimeService } from '../core/time-service';
import type { ISkillDef, IBattleEvent } from '../types';


/**
 * 戰鬥配置 / Battle configuration
 * 介面 / interface
 */
export interface IBattleConfig {
	repo: IDataRepository;
	rng: RNG;
	time?: ITimeService;
}

export class Battle {
	repo: IDataRepository;
	rng: RNG;
	time: ITimeService | null;
	teams: { '0': BattleTeam; '1': BattleTeam };
	turn = 0;
	extend = 0;
	log: IBattleEvent[] = [];
	result: BattleResult | null = null;

	constructor(team0: Character[], team1: Character[], cfg: IBattleConfig) {
		this.repo = cfg.repo;
		this.rng = cfg.rng;
		this.time = cfg.time ?? null;
		this.teams = { '0': new BattleTeam('0'), '1': new BattleTeam('1') };
		for (const c of team0) this.teams['0'].add(c);
		for (const c of team1) this.teams['1'].add(c);
		for (const c of this.allChars()) {
			setBattleVariable(c, this.repo, this.rng);
			c.delay = 0;
		}
	}

	allChars(): Character[] {
		return [...this.teams['0'].members, ...this.teams['1'].members];
	}

	enemyTeamOf(char: Character): BattleTeam {
		const side = (char.team as BattleTeam).side;
		return side === '0' ? this.teams['1'] : this.teams['0'];
	}

	DelayValue(c: Character): number {
		return Math.sqrt(c.SPD) + DELAY_BASE;
	}

	/** 選出下一個行動者：delay 最小者；同 delay 時高 SPD 優先（對應 SPD 越高越早上場） */
	NextActer(): Character | null {
		let best: Character | null = null;
		let bestDelay = Infinity;
		let bestSpd = -1;
		const EPS = 1e-9;
		for (const c of this.allChars()) {
			if (c.STATE === EnumState.Dead) continue;
			if (c.delay < bestDelay - EPS) {
				bestDelay = c.delay; bestSpd = c.SPD; best = c;
			} else if (Math.abs(c.delay - bestDelay) <= EPS && c.SPD > bestSpd) {
				bestSpd = c.SPD; best = c;
			}
		}
		return best;
	}

	SetDelay(): void {
		for (const c of this.allChars()) {
			if (c.STATE === EnumState.Dead) c.delay = Infinity;
		}
	}

	ChooseSkill(actor: Character): number {
		const keys = buildPattern(actor);
		const action = MultiFactJudge(keys, actor, this);
		return action ?? 1000;
	}

	selectTargets(actor: Character, skill: ISkillDef): Character[] {
		const enemyTeam = this.enemyTeamOf(actor);
		const friendTeam = actor.team as BattleTeam;
		const t = skill.target?.[0] ?? 'enemy';
		const method = skill.target?.[1] ?? 'individual';
		const count = skill.target?.[2] ?? 1;

		if (t === 'enemy') {
			if (method === 'all') return enemyTeam.alive();
			if (method === 'multi') return enemyTeam.pickList(count, this.rng);
			const p = enemyTeam.pick(this.rng);
			return p ? [p] : [];
		}
		if (t === 'friend') {
			if (method === 'all') return friendTeam.alive();
			if (method === 'multi') return friendTeam.pickList(count, this.rng);
			const p = friendTeam.pick(this.rng);
			return p ? [p] : [];
		}
		if (t === 'self') return [actor];
		return this.allChars().filter((c) => c.STATE !== EnumState.Dead);
	}

	UseSkill(actor: Character, skillNo: number): void {
		const skill = getSkill(skillNo, this.repo);
		if (!skill) return;

		// 詠唱/蓄力（charge）：首回合設定 expect，次回合執行
		if (skill.charge && actor.expect === null) {
			actor.expect = skillNo;
			actor.expect_type = EnumExpect.Cast;
			this.log.push({ type: 'cast', actor: String(actor.no), skill: skillNo });
			return;
		}
		if (actor.expect !== null && actor.expect !== skillNo) {
			return; // 正在詠唱其他技能
		}
		actor.expect = null;
		actor.expect_type = null;

		// SP 檢查（怪物 ×0.7 折扣）
		const need = Math.ceil(skill.sp * (actor.isMon() ? 0.7 : 1));
		if (skill.sp > 0 && actor.SP < need) return;
		if (skill.sp > 0) actor.SP -= need;

		const targets = this.selectTargets(actor, skill);
		for (const tgt of targets) {
			let realTarget = tgt;
			if (!skill.support && !skill.invalid && skill.target?.[0] !== 'all') {
				const guard = Defending(tgt.team as BattleTeam, tgt, skill);
				if (guard) realTarget = guard;
			}
			const res = applySkill(skill, actor, realTarget, this.rng);
			for (const ev of res.events) this.log.push(ev);
			if (realTarget.HP <= 0 && realTarget.STATE !== EnumState.Dead) {
				realTarget.STATE = EnumState.Dead;
				this.log.push({ type: 'death', target: String(realTarget.no) });
			}
		}
	}

	Action(actor: Character): void {
		autoRegeneration(actor);
		poisonDamage(actor);
		if (actor.STATE === EnumState.Dead) return;
		const skillNo = this.ChooseSkill(actor);
		this.UseSkill(actor, skillNo);
		actor.actCount++;
	}

	/** 執行整場戰鬥直到分出勝負或超時平手 */
	run(): BattleResult {
		while (!this.result) {
			const actor = this.NextActer();
			if (!actor) {
				this.result = new BattleResult(
					computeOutcome(this.teams['0'], this.teams['1']), this.turn, this.extend,
				);
				break;
			}
			this.Action(actor);
			actor.delay += this.DelayValue(actor);
			this.SetDelay();
			this.turn++;

			const outcome = computeOutcome(this.teams['0'], this.teams['1']);
			if (outcome !== 'draw') {
				this.result = new BattleResult(outcome, this.turn, this.extend);
				break;
			}

			// 回合上限：超過則延伸，最多 BATTLE_MAX_EXTENDS 次後判平手
			if (this.turn > BATTLE_MAX_TURNS + this.extend * TURN_EXTENDS) {
				if (this.extend >= BATTLE_MAX_EXTENDS) {
					this.result = new BattleResult('draw', this.turn, this.extend);
					break;
				}
				this.extend++;
				this.turn = 0;
			}
		}
		return this.result;
	}
}
