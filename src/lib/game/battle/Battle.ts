// 戰鬥引擎 / Battle engine
// 對應 docs/log/battle/02（Battle）、03、04、05 的核心流程：
// 建隊 → setBattleVariable → SetDelay → Action（自動回復→中毒→判定→技能）→ 行動順序 → 結果。

import {
	EnumState, EnumExpect,
	BATTLE_MAX_TURNS, TURN_EXTENDS, BATTLE_MAX_EXTENDS, DELAY_BASE, BATTLE_STAT_TURNS,
	EnumTeamSide,
} from '../constants';
import { Character, charIdToString } from '../character/Character';
import { setBattleVariable } from '../character/battle-variable';
import { autoRegeneration, poisonDamage } from '../character/status';
import { getSkill } from '../skill/Skill';
import { applySkill } from '../skill/effect';
import { BattleTeam } from '../team/BattleTeam';
import { Defending } from './guard';
import { buildPattern, MultiFactJudge } from './pattern';
import { computeOutcome, BattleResult, EnumOutcome } from './BattleResult';
import { EnumJudgeCode } from './judge-codes';
import { resolveCorpsePolicy, type ICorpsePolicy } from './corpse-policy';
import type { IDataRepository } from '../data/repository';
import type { RNG } from '../core/rng';
import type { ITimeService } from '../core/time-service';
import type { ISkillDef, IBattleEvent, IBattleSnapshot } from '../types';
import { EnumTargetType, EnumTargetMethod, EnumBattleEventType } from '../types';


/**
 * 戰鬥配置 / Battle configuration
 * 介面 / interface
 */
export interface IBattleConfig {
	/** 資料儲存庫（技能/職業/物品/怪物/角色）/ data repository (skills/jobs/items/mons/chars) */
	repo: IDataRepository;
	/** 可注入的隨機源 / injectable random source */
	rng: RNG;
	/**
	 * 虛擬時間服務（省略時不啟用時間相關功能）/ virtual time service (time features disabled when omitted)
	 *
	 * 命名 `timeService` 而非 `time`，以明確區別展示層同名的 time 時間字串
	 * （IShowcaseBattleInput／IBattleDisplayData 的 `time?: IDisplayTimeString`）。
	 * Named `timeService` (not `time`) to distinguish it from the same-named display-side
	 * time string (`time?: IDisplayTimeString` on IShowcaseBattleInput / IBattleDisplayData).
	 */
	timeService?: ITimeService;
	/**
	 * 戰鬥級屍體政策（全場預設；省略＝不留屍體）。可為布林或物件規格（圖／class／style）。
	 * 逐級繼承：角色級 > 隊伍級 > 戰鬥級；這裡是最外層預設。
	 * Battle-level corpse policy (battle-wide default; omitted = no corpse). Either a boolean or
	 * an object spec (image/class/style).
	 * Inheritance: character > team > battle; this is the outermost default.
	 */
	corpse?: ICorpsePolicy;
	/**
	 * 隊伍級屍體政策覆寫（某側未提供＝沿用戰鬥級）。
	 * Team-level corpse policy overrides (an omitted side inherits the battle-level value).
	 */
	teamCorpse?: Partial<Record<EnumTeamSide, ICorpsePolicy>>;
}

export class Battle {
	/** 資料儲存庫 / data repository */
	repo: IDataRepository;
	/** 隨機源 / random source */
	rng: RNG;
	/** 時間服務（可為 null；來自 IBattleConfig.timeService）/ time service (may be null; from IBattleConfig.timeService) */
	timeService?: ITimeService;
	/** 雙方隊伍（鍵 EnumTeamSide.Team0／EnumTeamSide.Team1）/ both teams */
	teams: Record<EnumTeamSide, BattleTeam>;
	/** 當前回合數 / current turn counter */
	turn = 0;
	/** 延長次數 / extension count */
	extend = 0;
	/** 戰鬥事件紀錄 / battle event log */
	log: IBattleEvent[] = [];
	/** 戰鬥結果（null＝尚未分出勝負）/ battle result (null = not decided yet) */
	result: BattleResult | null = null;
	/** 已進行行動數（含 charge 扣回）/ number of actions taken (charge deducted) */
	actions = 0;
	/** 最後一次快照時的 actions 值 / actions value at last snapshot */
	private lastSnapshotActions = -1;
	/** 戰鬥級屍體政策（已解析的預設；false＝不留屍體，物件＝留屍體並帶規格）/ battle-level corpse policy (resolved default; false = no corpse, object = leave a corpse with a spec) */
	corpse?: ICorpsePolicy;
	/** 隊伍級屍體政策覆寫 / team-level corpse overrides */
	teamCorpse: Partial<Record<EnumTeamSide, ICorpsePolicy>> = {};
	/** 快照列表（每 10 actions 一張戰場圖＋HP/SP）/ snapshots (one battlefield + HP/SP per 10 actions) */
	snapshots: IBattleSnapshot[] = [];

	/**
	 * 建立戰鬥並初始化雙方單位 / Create the battle and initialize both sides
	 * @param team0 己方角色 / own characters
	 * @param team1 敵方角色 / enemy characters
	 * @param cfg 戰鬥配置 / battle configuration
	 */
	constructor(team0: Character[], team1: Character[], cfg: IBattleConfig) {
		this.repo = cfg.repo;
		this.rng = cfg.rng;
		this.timeService = cfg.timeService;
		this.corpse = cfg.corpse;
		this.teamCorpse = cfg.teamCorpse ?? {};
		this.teams = { [EnumTeamSide.Team0]: new BattleTeam(EnumTeamSide.Team0), [EnumTeamSide.Team1]: new BattleTeam(EnumTeamSide.Team1) };
		for (const c of team0) this.teams[EnumTeamSide.Team0].add(c);
		for (const c of team1) this.teams[EnumTeamSide.Team1].add(c);
		for (const c of this.allChars()) {
			setBattleVariable(c, this.repo, this.rng);
			c.delay = 0;
		}
	}

	/** 所有單位（己隊 + 敵隊）/ every unit on both teams */
	allChars(): Character[] {
		return [...this.teams[EnumTeamSide.Team0].members, ...this.teams[EnumTeamSide.Team1].members];
	}

	/** 取得該單位的敵對隊伍 / the opposing team of the given unit */
	enemyTeamOf(char: Character): BattleTeam {
		const side = (char.team as BattleTeam).side;
		return side === EnumTeamSide.Team0 ? this.teams[EnumTeamSide.Team1] : this.teams[EnumTeamSide.Team0];
	}

	/** 行動延遲值：sqrt(SPD) + DELAY_BASE（SPD 越高延遲越短）/ action delay: sqrt(SPD) + DELAY_BASE (higher SPD = shorter delay) */
	DelayValue(c: Character): number {
		return Math.sqrt(c.SPD) + DELAY_BASE;
	}

	/** 選出下一個行動者：delay 最小者；同 delay 時高 SPD 優先（對應 SPD 越高越早上場）/ pick the next actor: lowest delay, ties broken by higher SPD (higher SPD acts earlier) */
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

	/** 死亡者 delay 設為 Infinity（NextActer 永遠跳過死亡者）/ set dead units' delay to Infinity so NextActer always skips them */
	SetDelay(): void {
		for (const c of this.allChars()) {
			if (c.STATE === EnumState.Dead) c.delay = Infinity;
		}
	}

	/**
	 * 取得下一個技能編號（樣式判定失敗時回預設攻擊）
	 * Pick the next skill number (falls back to the default attack when no rule matches)
	 */
	ChooseSkill(actor: Character): number {
		const keys = buildPattern(actor);
		const action = MultiFactJudge(keys, actor, this);
		return action ?? EnumJudgeCode.DefaultAttack;
	}

	/**
	 * 依技能 target 規格選取目標 / Pick targets per the skill's target spec
	 *
	 * 分支 / branches:
	 * - Enemy + all → 敵方全體存活者 / all living enemies
	 * - Enemy + multi → 敵方隨機 count 人 / random `count` enemies
	 * - Enemy + individual → 敵方隨機 1 人 / one random enemy
	 * - Friend + all/multi/individual → 己方對應分支（同上，改為 friendTeam）
	 *   friend-side equivalents of the enemy branches above
	 * - Self → 使用者本人 / the actor itself
	 * - 其餘（如 All）→ 雙方所有存活單位 / otherwise (e.g. All) → every living unit on both sides
	 */
	selectTargets(actor: Character, skill: ISkillDef): Character[] {
		const enemyTeam = this.enemyTeamOf(actor);
		const friendTeam = actor.team as BattleTeam;
		const t = skill.target?.[0] ?? EnumTargetType.Enemy;
		const method = skill.target?.[1] ?? EnumTargetMethod.Individual;
		const count = skill.target?.[2] ?? 1;

		if (t === EnumTargetType.Enemy) {
			if (method === EnumTargetMethod.All) return enemyTeam.alive();
			if (method === EnumTargetMethod.Multi) return enemyTeam.pickList(count, this.rng);
			const p = enemyTeam.pick(this.rng);
			return p ? [p] : [];
		}
		if (t === EnumTargetType.Friend) {
			if (method === EnumTargetMethod.All) return friendTeam.alive();
			if (method === EnumTargetMethod.Multi) return friendTeam.pickList(count, this.rng);
			const p = friendTeam.pick(this.rng);
			return p ? [p] : [];
		}
		if (t === EnumTargetType.Self) return [actor];
		return this.allChars().filter((c) => c.STATE !== EnumState.Dead);
	}

	/**
	 * 施放技能 / Execute a skill
	 *
	 * 流程 / flow: 取技能 → 詠唱/蓄力門檻（charge）→ SP 檢查（怪物 ×0.7）→ 選目標 →
	 * 守護攔截（非 support/invalid/All）→ applySkill → HP<=0 標記死亡。
	 * fetch skill → charge gate → SP check (monsters ×0.7) → pick targets →
	 * guard interception (unless support/invalid/All) → applySkill → mark death at HP<=0.
	 */
	UseSkill(actor: Character, skillNo: number): void {
		const skill = getSkill(skillNo, this.repo);
		if (!skill) return;

		// 詠唱/蓄力（charge）：首回合設定 expect，次回合執行
		if (skill.charge && actor.expect === null) {
			actor.expect = skillNo;
			actor.expect_type = EnumExpect.Cast;
			this.log.push({ type: EnumBattleEventType.Cast, actor: charIdToString(actor.no), skill: skillNo });
			// 戰鬥的總行動回數減少(蓄力不計為行動)
			this.actions--;
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

		// 實際施放技能，計為一次行動
		this.log.push({ type: EnumBattleEventType.Act, actor: charIdToString(actor.no), skill: skillNo });

		const targets = this.selectTargets(actor, skill);
		for (const tgt of targets) {
			let realTarget = tgt;
			if (!skill.support && !skill.invalid && skill.target?.[0] !== EnumTargetType.All) {
				const guard = Defending(tgt.team as BattleTeam, tgt, skill);
				if (guard) realTarget = guard;
			}
			const res = applySkill(skill, actor, realTarget, this.rng);
			for (const ev of res.events) this.log.push(ev);
			if (realTarget.HP <= 0 && realTarget.STATE !== EnumState.Dead) {
				realTarget.STATE = EnumState.Dead;
				this.log.push({ type: EnumBattleEventType.Death, target: charIdToString(realTarget.no) });
			}
		}
	}

	/** 執行單一單位的回合 / Run one unit's turn
	 * 自動回復 → 中毒傷害 → 死亡則跳過 → 選技能 → 施放 → 行動計數 +1。
	 * auto-regen → poison damage → skip if dead → choose skill → cast → actCount +1.
	 */
	Action(actor: Character): void {
		autoRegeneration(actor);
		poisonDamage(actor);
		if (actor.STATE === EnumState.Dead) return;
		const skillNo = this.ChooseSkill(actor);
		this.UseSkill(actor, skillNo);
		actor.actCount++;
		this.actions++;
	}

	/**
	 * 逐級解析某單位的屍體政策：角色級 > 隊伍級 > 戰鬥級；皆未設定＝false（不留屍體）。
	 * 回傳布林或物件規格（物件＝留下屍體並指定圖／class／style）。
	 * Resolve a unit's corpse policy level by level: character > team > battle;
	 * when none is set the result is false (no corpse). Returns a boolean or an object
	 * spec (object = leave a corpse carrying image/class/style).
	 */
	private resolveCorpse(c: Character): ICorpsePolicy {
		const team = c.team as BattleTeam | null;
		const teamSide = team?.side;
		return resolveCorpsePolicy(
			c.corpse,
			teamSide !== undefined ? this.teamCorpse[teamSide] : undefined,
			this.corpse,
		);
	}

	/** 建立目前快照單位列表 / Build current snapshot unit list */
	private snapshotUnits(): IBattleSnapshot['units'] {
		return this.allChars().map((c) => ({
			unitUuid: c.unitUuid,
			corpse: this.resolveCorpse(c),
			no: charIdToString(c.no),
			name: c.name,
			// c.team 是 BattleTeam 反向參照，需取其 side 才是 Team0/Team1 列舉
			// c.team is a BattleTeam back-reference; take its `side` for the Team0/Team1 enum
			team: (c.team as BattleTeam).side,
			hp: c.HP,
			maxHp: c.MAXHP,
			sp: c.SP,
			maxSp: c.MAXSP,
			dead: c.STATE === EnumState.Dead,
			expectSkill: c.expect,
		}));
	}

	/**
	 * 執行整場戰鬥直到分出勝負或超時平手
	 * Run the whole battle until an outcome or a timeout draw
	 */
	run(): BattleResult {
		while (!this.result) {
			// 每 BATTLE_STAT_TURNS 次行動插入一張快照（對齊 PHP BattleState）
			if (this.actions % BATTLE_STAT_TURNS === 0 && this.actions !== this.lastSnapshotActions) {
				this.lastSnapshotActions = this.actions;
				this.snapshots.push({ at: this.log.length, units: this.snapshotUnits() });
			}
			const actor = this.NextActer();
			if (!actor) {
				this.result = new BattleResult(
					computeOutcome(this.teams[EnumTeamSide.Team0], this.teams[EnumTeamSide.Team1]), this.turn, this.extend,
				);
				break;
			}
			this.Action(actor);
			actor.delay += this.DelayValue(actor);
			this.SetDelay();
			this.turn++;

			const outcome = computeOutcome(this.teams[EnumTeamSide.Team0], this.teams[EnumTeamSide.Team1]);
			if (outcome !== EnumOutcome.Draw) {
				this.result = new BattleResult(outcome, this.turn, this.extend);
				break;
			}

			// 回合上限：超過則延伸，最多 BATTLE_MAX_EXTENDS 次後判平手
			if (this.turn > BATTLE_MAX_TURNS + this.extend * TURN_EXTENDS) {
				if (this.extend >= BATTLE_MAX_EXTENDS) {
					this.result = new BattleResult(EnumOutcome.Draw, this.turn, this.extend);
					break;
				}
				this.extend++;
				this.turn = 0;
			}
		}
		// 補最終快照（若與上一張不同）
		const lastSnap = this.snapshots[this.snapshots.length - 1];
		if (!lastSnap || lastSnap.at !== this.log.length) {
			this.snapshots.push({ at: this.log.length, units: this.snapshotUnits() });
		}
		return this.result;
	}
}
