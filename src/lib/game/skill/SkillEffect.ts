/**
 * 技能效果：特例分支與 default 分支（完整移植 HOF/Class/Skill/Effect.php 的 SkillEffect）
 * Skill effect: the special branches and the default branch (a complete port of SkillEffect in
 * HOF/Class/Skill/Effect.php)
 *
 */
// ---- 分派語意 / dispatch semantics ----
/**
 * 原始 PHP 以 `switch ($skill_no): ... endswitch` 分派：命中特例 case 後的 break 或 return
 * **一律不落 default**，只有沒有任何 case 匹配的技能編號才執行 default 分支。
 * TS 以「每個 case 皆 `return { events }`、`default:` 另行 return」重現同一規則。
 * The original PHP dispatches through `switch ($skill_no): ... endswitch`: a matched special case
 * that breaks or returns never falls into the default branch; only a skill number no case matches
 * runs the default branch. Every case here therefore ends with `return { events }` and `default:`
 * returns separately, which reproduces the same rule.
 *
 */
// ---- 事件而非字串 / events, not strings ----
/**
 * 本類只產結構化 IBattleEvent，**不產任何日誌字串**；文案一律由展示層解析
 * （EnumLogCopy 成員或 battleUtils 的 buildXxx 建構器）。因此這裡的 `text` 一律是結構化 token
 * （如 'cured'／'multiply'／'front'），不是可顯示文字。
 * This class only produces structured IBattleEvent values and never builds log copy; the display
 * layer resolves every line (an EnumLogCopy member or a battleUtils buildXxx builder). The `text`
 * fields here are therefore structured tokens ('cured' / 'multiply' / 'front'), never display text.
 *
 */
// ---- 計算與列印的分工 / calculation vs. printing ----
/**
 * - calc 路徑（calcBasicDamage 後 DamageHP）→ hpDamage：含玩家保護，一次保護即原版等價
 *   （原始保護寫在 CalcBasicDamage 內）。
 *   calc path (CalcBasicDamage then DamageHP) → hpDamage: player protection included, one pass
 *   equals the original (the original protection lives inside CalcBasicDamage).
 * - raw 路徑（1024／1025／1116／3901 與 AbsorbHP 的扣血）→ hpDamageRaw：純扣血、不套保護，
 *   否則保護會被套兩次。
 *   raw path (1024 / 1025 / 1116 / 3901 and AbsorbHP's HP loss) → hpDamageRaw: a plain
 *   subtraction with no protection, otherwise protection would apply twice.
 * - DamageHP2（3012）→ hpDamage2：`value` 為**請求值**，hpBefore／hpAfter 為實際值（下限 1）。
 *   DamageHP2 (3012) → hpDamage2: `value` is the *requested* amount, hpBefore / hpAfter the actual
 *   ones (floored at 1).
 * - SpDamage → spDamage：`value` 為請求值，hpBefore／hpAfter 為 SP 前後、`unit='sp'`。
 *   SpDamage → spDamage: `value` is requested, hpBefore / hpAfter are the SP ends, unit = 'sp'.
 * - RecoverHP／SpHeal：`value` 為**實際**回復量（TS 既有慣例，與 applySkill 一致）。
 *   RecoverHP / SpHeal: `value` is the *actual* amount healed (the existing TypeScript convention,
 *   shared with applySkill).
 */

import type { Battle } from '../battle/Battle';
import type { Character } from '../character/Character';
import { charIdToString } from '../character/Character';
import { EnumExpect, EnumPosition, EnumState } from '../constants';
import type { BattleTeam } from '../team/BattleTeam';
import { newMonSummon } from '../character/factory';
import {
	getNormal,
	getPoison,
	getPoisonResist,
	hpDamage,
	hpDamage2,
	hpDamageRaw,
	hpRecover,
	poisonDamage,
	spDamage,
	spRecover,
} from '../character/status';
import { DOWNMAP, UPMAP } from '../character/status-attrs';
import type { IBattleEvent, ISkillDef } from '../types';
import {
	EnumBattleEventType,
	EnumInfoText,
	EnumMoveText,
	EnumResource,
	EnumSkillPriority,
	EnumValueWho,
} from '../types';
import type { IDamageOption } from './effect.core';
import type { ISkillResult } from './effect';
import { applyDamage, applySkill, barrierGuard, calcBasicDamage, calcRecoveryValue, statusChanges } from './effect';

/** Move 事件的 `text` 使用 EnumMoveText（展示層依 token 對照 EnumLogCopy 的位移成員）/
 * Move event `text` uses EnumMoveText (the display maps the token to EnumLogCopy's movement members) */

/** Info 事件的 `text` 使用 EnumInfoText（展示層依 token 選 EnumLogCopy 成員或 buildXxx 建構器）/
 * Info event `text` uses EnumInfoText (the display picks an EnumLogCopy member or a buildXxx builder per token) */

/**
 * 技能效果執行器：移植 HOF/Class/Skill/Effect.php 的 `SkillEffect()`
 * Skill-effect executor: a port of `SkillEffect()` in HOF/Class/Skill/Effect.php
 *
 * 一次 `apply()` = 原始 `SkillEffect($skill, $skill_no, $char, $target)` 對**單一目標**的一次執行。
 * 目標選取、守護攔截（前衛替後衛擋）、SP 檢查與死亡判定都在 Battle.UseSkill，
 * 與原始 Skill.php 的分工一致。
 * One `apply()` is one execution of the original `SkillEffect($skill, $skill_no, $char, $target)`
 * against a *single* target. Target selection, front-row guard interception, the SP check and the
 * death check all live in Battle.UseSkill, mirroring how the original Skill.php divides the work.
 *
 * 不接受「選不到目標」：原始在 `$target === false` 時印 `No target.Failed!` 並 return，
 * 這裡改由 Battle.UseSkill 產 `Info('no-target')`，故 `target` 恆為有效單位。
 * "No target" is not handled here: the original prints `No target.Failed!` and returns when
 * `$target === false`, while Battle.UseSkill emits `Info('no-target')` instead, so `target` is
 * always a real unit.
 */
export class SkillEffect
{
	/** 所屬戰鬥（提供 rng／repo／delay 基準／單位清單）/ the owning battle (rng, repo, delay base, unit list) */
	private readonly battle: Battle;

	/**
	 * @param battle - 所屬戰鬥 / the owning battle
	 */
	constructor(battle: Battle)
	{
		this.battle = battle;
	}

	/**
	 * 對單一目標施放一次技能效果（對應原始 `SkillEffect()`）
	 * Apply one skill effect to a single target (mirrors the original `SkillEffect()`)
	 *
	 * @param skill - 技能定義 / skill definition
	 * @param skillNo - 特例分支的分派鍵（與 skill.no 相同，沿用原始參數）/ dispatch key of the special
	 * branches (identical to skill.no; kept to mirror the original signature)
	 * @param char - 施放者 / the caster
	 * @param target - 目標（永不為 null）/ the target (never null)
	 * @returns 技能執行結果（events 由呼叫方併入 Battle.log）/ skill result (the caller merges events into Battle.log)
	 */
	apply(skill: ISkillDef, skillNo: number, char: Character, target: Character): ISkillResult
	{
		const events: IBattleEvent[] = [];

		/**
		 * 特例分支：命中即 return，**不落 default**（對齊原始 switch 語意）。
		 * Special branches: hitting one returns immediately and never falls into the default branch
		 * (mirrors the original switch semantics).
		 */
		switch (skillNo)
		{
			// ---- 打擊系 / strikes ----

			/** ManaBreak：以傷害值扣 SP */
			case 1020:
			{
				if (this.blockedByBarrier(skill, target, events)) return { events, damage: 0 };
				const dmg = calcBasicDamage(skill, char, target);
				this.damageSp(events, skill, char, target, dmg);
				return { events, damage: dmg };
			}

			/** SoulBreak：同一傷害值先扣 HP 再扣 SP */
			case 1021:
			{
				if (this.blockedByBarrier(skill, target, events)) return { events, damage: 0 };
				const dmg = calcBasicDamage(skill, char, target);
				this.damageHp(events, skill, char, target, dmg);
				this.damageSp(events, skill, char, target, dmg);
				return { events, damage: dmg };
			}

			/** ChargeAttack：非前衛時威力 ×4，之後自己移至前衛 */
			case 1022:
			{
				if (this.blockedByBarrier(skill, target, events)) return { events, damage: 0 };
				/**
				 * 只有非前衛才加成；其餘路徑不帶 option（原始 `$option["multiply"] = 4` 同理）
				 * The bonus applies only off the front row; the other path carries no option (the
				 * original's `$option["multiply"] = 4` likewise)
				 */
				const option: IDamageOption | undefined = char.POSITION !== EnumPosition.Front ? { multiply: 4 } : undefined;
				const dmg = calcBasicDamage(skill, char, target, option);
				this.damageHp(events, skill, char, target, dmg);
				this.moveUnit(events, skill, char, char, EnumPosition.Front, EnumMoveText.Front);
				return { events, damage: dmg };
			}

			/** Hit&Away：前衛時威力 ×3，之後自己移至後衛 */
			case 1023:
			{
				if (this.blockedByBarrier(skill, target, events)) return { events, damage: 0 };
				const option: IDamageOption | undefined = char.POSITION === EnumPosition.Front ? { multiply: 3 } : undefined;
				const dmg = calcBasicDamage(skill, char, target, option);
				this.damageHp(events, skill, char, target, dmg);
				this.moveUnit(events, skill, char, char, EnumPosition.Back, EnumMoveText.Back);
				return { events, damage: dmg };
			}

			// ---- 分割／反傷 / division & retribution ----

			/** LifeDivision：HP 差的一半轉移（無保護的 raw 值） */
			case 1024:
			{
				let value = Math.round(Math.abs(target.HP - char.HP) * 0.5);
				if (char.HP <= target.HP)
				{
					if (value >= 1000)
					{
						this.info(events, EnumInfoText.OverCap);
						value = 500;
					}
					this.damageHpRaw(events, skill, char, target, value);
					this.recoverHp(events, skill, char, char, value);
				}
				else
				{
					this.damageHpRaw(events, skill, char, char, value);
					this.recoverHp(events, skill, char, target, value);
				}
				return { events };
			}

			/** ManaDivision：SP 差的一半轉移（raw 值） */
			case 1025:
			{
				let value = Math.round(Math.abs(target.SP - char.SP) * 0.5);
				if (char.SP <= target.SP)
				{
					if (value >= 1000)
					{
						this.info(events, EnumInfoText.OverCap);
						value = 500;
					}
					this.damageSp(events, skill, char, target, value);
					this.recoverSp(events, skill, char, char, value);
				}
				else
				{
					this.damageSp(events, skill, char, char, value);
					this.recoverSp(events, skill, char, target, value);
				}
				return { events };
			}

			/** Punish：以「自己欠缺的 HP」為傷害值打目標 */
			case 1116:
			{
				const dmg = char.MAXHP - char.HP;
				this.damageHpRaw(events, skill, char, target, dmg);
				return { events, damage: dmg };
			}

			/** Possession：對自己無效 */
			case 1119:
			{
				if (char === target) return { events };
				events.push(...statusChanges(skill, char, target, this.battle.rng));
				return { events };
			}

			// ---- 毒系 / poison ----

			/** PoisonBlow：目標中毒時威力 ×6 */
			case 1200:
			{
				const option: IDamageOption = {};
				if (target.STATE === EnumState.Poison)
				{
					option.multiply = 6;
					this.info(events, EnumInfoText.Multiply, 6);
				}
				if (this.blockedByBarrier(skill, target, events)) return { events, damage: 0 };
				const dmg = calcBasicDamage(skill, char, target, option);
				this.damageHp(events, skill, char, target, dmg);
				return { events, damage: dmg };
			}

			/** PoisonInvasion：依 INT 決定的中毒傷害倍率 */
			case 1208:
			{
				/**
				 * 原始公式：Rate = (log((INT+22)/10) - 0.8) / 0.85（PHP log 為自然對數）
				 * Original: Rate = (log((INT+22)/10) - 0.8) / 0.85 (PHP's log is the natural log)
				 */
				const rate = (Math.log((char.INT + 22) / 10) - 0.8) / 0.85;
				/**
				 * 未中毒時 poisonDamage 回傳 0 且不扣血（原始 PoisonDamage 同樣直接 return false）。
				 * 負 Rate 忠實不鉗：公式可能為負，原始亦照算（等同回血）。
				 * Without poison poisonDamage returns 0 and deals nothing (the original PoisonDamage
				 * likewise returns false). A negative Rate is deliberately not clamped: the formula can
				 * go negative and the original computes it as-is (which heals).
				 */
				if (target.STATE !== EnumState.Poison) return { events };
				const hpBefore = target.HP;
				const lost = poisonDamage(target, rate);
				events.push({
					type: EnumBattleEventType.Poison,
					target: charIdToString(target.no),
					skill: skill.no,
					value: lost,
					hpBefore,
					hpAfter: target.HP,
				});
				return { events };
			}

			/** TransPoison：轉移中毒後解除 */
			case 1209:
			{
				if (target.STATE !== EnumState.Poison) return { events };
				events.push(...statusChanges(skill, char, target, this.battle.rng));
				events.push(...this.getNormalEvents(target, skill));
				return { events };
			}

			/** AntiPoisoning：取得中毒抗性 */
			case 1220:
			{
				const total = getPoisonResist(target, 50);
				events.push({
					type: EnumBattleEventType.PoisonResist,
					actor: charIdToString(char.no),
					target: charIdToString(target.no),
					skill: skill.no,
					value: total,
				});
				return { events };
			}

			// ---- 吸取系 / drains ----

			/** LifeDrain */
			case 2030:
			/** LifeSqueeze */
			case 2031:
			{
				/** 自己不吸自己 */
				if (char === target) return { events };
				if (this.blockedByBarrier(skill, target, events)) return { events, damage: 0 };
				const dmg = calcBasicDamage(skill, char, target);
				this.drainHp(events, skill, char, target, dmg);
				return { events, damage: dmg };
			}

			/** EneryRob：吸取 SP（無視 def） */
			case 2090:
			/** EneryCollect */
			case 2091:
			{
				if (char === target) return { events };
				if (this.blockedByBarrier(skill, target, events)) return { events, damage: 0 };
				const dmg = calcBasicDamage(skill, char, target, { pierce: true });
				this.drainSp(events, skill, char, target, dmg);
				return { events, damage: dmg };
			}

			/** BloodSuck：吸取 HP（無視 def） */
			case 5002:
			{
				if (this.blockedByBarrier(skill, target, events)) return { events, damage: 0 };
				const dmg = calcBasicDamage(skill, char, target, { pierce: true });
				this.drainHp(events, skill, char, target, dmg);
				return { events, damage: dmg };
			}

			// ---- 一擊／死亡 / instant kill ----

			/** DeathKnell：過半機率直接歸零（無傷害事件，死亡由 UseSkill 迴環尾判定） */
			case 2032:
			{
				const p = this.battle.rng.randInt(1, 100);
				if (p > 50)
				{
					target.HP = 0;
				}
				else
				{
					/**
					 * 原始印裸的 `Failed!`（無名稱）→ 事件不帶 actor，展示層退回裸文案。
					 * The original prints a bare `Failed!` (no name) → the event carries no actor and the
					 * display falls back to the unnamed copy.
					 */
					events.push({
						type: EnumBattleEventType.Miss,
						target: charIdToString(target.no),
						skill: skill.no,
					});
				}
				return { events };
			}

			// ---- 蘇生／變身 / revival & transformation ----

			/** SoulRevenge：每有一位死者威力 +1 */
			case 2055:
			{
				const team = char.team as BattleTeam;
				const count = team.CountDead() + 1;
				this.info(events, EnumInfoText.Multiply, count);
				if (this.blockedByBarrier(skill, target, events)) return { events, damage: 0 };
				const dmg = calcBasicDamage(skill, char, target, { multiply: count });
				this.damageHp(events, skill, char, target, dmg);
				return { events, damage: dmg };
			}

			/** ZombieRevival：只對死者有效 */
			case 2056:
			{
				if (target.STATE !== EnumState.Dead) return { events };
				events.push(...this.getNormalEvents(target, skill));
				events.push(...statusChanges(skill, char, target, this.battle.rng));
				this.recoverHp(events, skill, char, target, target.MAXHP);
				return { events };
			}

			/** SelfMetamorphorse：HP>60% 或已變身時失敗 */
			case 2057:
			{
				if (60 < target.hpPercent() || target.getSpecial('Metamo'))
				{
					/**
					 * 原始印裸的 `Failed!` → 與 2032 相同，事件不帶 actor。
					 * The original prints a bare `Failed!` →, as with 2032, the event carries no actor.
					 */
					events.push({
						type: EnumBattleEventType.Miss,
						target: charIdToString(target.no),
						skill: skill.no,
					});
					return { events };
				}
				/**
				 * 原始另會換 img／性別對應的立圖；展示層以既有精靈呈現，故不移植。
				 * The original also swaps the portrait by gender; the display keeps the existing sprite,
				 * so that part is not ported.
				 */
				target.setSpecial('Metamo', 1);
				events.push(...statusChanges(skill, char, target, this.battle.rng));
				/**
				 * 原始 `RecoverHP($target, round($target->MAXHP / 2))`
				 * The original's `RecoverHP($target, round($target->MAXHP / 2))`
				 */
				this.recoverHp(events, skill, char, target, Math.round(target.MAXHP / 2));
				return { events };
			}

			// ---- 詠唱／延遲 / casting & delay ----

			case 2110:
			/** 蓄力／詠唱中的目標才會被延遲 */
			case 2111:
			{
				if (target.expect === null) return { events };
				this.delayChar(char, target, skill, events);
				return { events };
			}

			/** Quick：對象不能是自己、也不能正在詠唱 */
			case 3050:
			{
				if (target === char) return { events };
				if (target.expect !== null) return { events };
				/**
				 * 只產 Quick 事件、不另產 Delay：原始 `got quicked!(old >>> new/100)` 是**單行**，
				 * 括號由 DelayCut 的 $Show 輸出、屬於同一行；拆成兩行會與原版不符。
				 * Only the Quick record is produced, no separate Delay one: the original's
				 * `got quicked!(old >>> new/100)` is a *single* line whose parentheses come from
				 * DelayCut's $Show, so splitting it into two lines would diverge.
				 */
				this.delayCut(target, 101);
				events.push({
					type: EnumBattleEventType.Quick,
					actor: charIdToString(char.no),
					target: charIdToString(target.no),
					skill: skill.no,
				});
				return { events };
			}

			/** CastAsist：只對詠唱中（expect_type＝Cast）的目標生效 */
			case 3055:
			{
				if (target.expect === null || target.expect_type !== EnumExpect.Cast) return { events };
				/**
				 * 同 3050：原始 `casting shorted!(old >>> new/100)` 為單行，故只產 CastShort。
				 * As with 3050: the original's `casting shorted!(old >>> new/100)` is one line, so only
				 * CastShort is produced.
				 */
				this.delayCut(target, 60);
				events.push({
					type: EnumBattleEventType.CastShort,
					actor: charIdToString(char.no),
					target: charIdToString(target.no),
					skill: skill.no,
				});
				return { events };
			}

			// ---- 防護 / protection ----

			/** HolyShield */
			case 3060:
			/** BananaProtection：已有 Barrier 時不重複取得 */
			case 5067:
			{
				if (target.SPECIAL.Barrier) return { events };
				target.setSpecial('Barrier', 1);
				events.push({
					type: EnumBattleEventType.BarrierGain,
					actor: charIdToString(char.no),
					target: charIdToString(target.no),
					skill: skill.no,
				});
				return { events };
			}

			// ---- 回復系 / heals ----

			/** ProgressiveHeal：HP≤30% 時回復量 ×2 */
			case 3005:
			{
				/**
				 * 原始 CalcRecoveryValue($skill, $char, $target) 的第三參未被讀取，TS 簽名已精簡。
				 * The original CalcRecoveryValue's third parameter is never read, so the TypeScript
				 * signature drops it.
				 */
				let heal = calcRecoveryValue(skill, char);
				/** 共用 HP 百分比邏輯（不重覆公式） */
				const rate = target.hpPercent();
				if (rate <= 30)
				{
					heal *= 2;
					this.info(events, EnumInfoText.HealMultiply, 2);
				}
				this.recoverHp(events, skill, char, target, heal);
				return { events, heal };
			}

			/** ManaRecharge */
			case 3010:
			{
				const spRec = Math.ceil(target.MAXSP * 3 / 10);
				this.recoverSp(events, skill, char, target, spRec);
				return { events, heal: spRec };
			}

			/** HiManaRecharge */
			case 3011:
			{
				const spRec = Math.ceil(target.MAXSP * 5 / 10);
				this.recoverSp(events, skill, char, target, spRec);
				return { events, heal: spRec };
			}

			/** LifeConvert：以 HP 換 SP（扣血走 DamageHP2、下限 1） */
			case 3012:
			{
				const hpDmg = Math.ceil(target.MAXHP * 3 / 10);
				this.damageHp2(events, skill, char, target, hpDmg);
				const spRec = Math.ceil(target.MAXSP * 7 / 10);
				this.recoverSp(events, skill, char, target, spRec);
				return { events, damage: hpDmg, heal: spRec };
			}

			/** FirstAid */
			case 3120:
			{
				const heal = Math.ceil(50 + target.MAXHP * 1 / 10);
				this.recoverHp(events, skill, char, target, heal);
				return { events, heal };
			}

			/** SelfRecovery */
			case 3121:
			{
				const heal = Math.ceil(50 + target.MAXHP * 2 / 10);
				this.recoverHp(events, skill, char, target, heal);
				return { events, heal };
			}

			/** HyperRecovery：回復量依**施放者**欠缺的 HP 計算 */
			case 3122:
			{
				const dif = char.MAXHP - char.HP;
				const heal = Math.ceil(dif * 0.6);
				this.recoverHp(events, skill, char, target, heal);
				return { events, heal };
			}

			/** Fortune：對自己無效 */
			case 5022:
			{
				if (char === target) return { events };
				const heal = calcRecoveryValue(skill, char);
				this.recoverHp(events, skill, char, target, heal);
				events.push(...statusChanges(skill, char, target, this.battle.rng));
				return { events, heal };
			}

			// ---- 資源交換／上限 / resource swap & caps ----

			/** EnergyExchange：把 HP 比率與 SP 比率互換 */
			case 3013:
			{
				/**
				 * 上限為 0 時比率無定義，額外防呆令其為 0（原版會算出 NAN 並寫回角色）。
				 * When a cap is 0 the rate is undefined; a defensive guard pins it to 0 (the original
				 * would compute NAN and store it on the character).
				 */
				/** 共用 HP/SP 百分比邏輯（hpPercent 已含取整與 0 上限防呆） */
				const hpRate = target.hpPercent();
				const spRate = target.spPercent();
				const hpFrom = target.HP;
				const spFrom = target.SP;
				target.HP = Math.round(spRate / 100 * target.MAXHP);
				target.SP = Math.round(hpRate / 100 * target.MAXSP);
				events.push({
					type: EnumBattleEventType.EnergyExchange,
					actor: charIdToString(char.no),
					target: charIdToString(target.no),
					skill: skill.no,
					valueChanges: [
						{ who: EnumValueWho.Target, unit: EnumResource.Hp, from: hpFrom, to: target.HP },
						{ who: EnumValueWho.Target, unit: EnumResource.Sp, from: spFrom, to: target.SP },
					],
				});
				return { events };
			}

			/** ManaExtend：MAXSP ×1.2 */
			case 3020:
			{
				target.MAXSP = Math.round(target.MAXSP * 1.2);
				events.push({
					type: EnumBattleEventType.StatChange,
					actor: charIdToString(char.no),
					target: charIdToString(target.no),
					skill: skill.no,
					value: target.MAXSP,
					text: 'maxsp-extend',
				});
				return { events };
			}

			/** Resurrection */
			case 3040:
			/** SoulRestor */
			case 5030:
			/** WakeUp：只對死者有效（原始 STATE !== 1 即非死亡 → break） */
			case 5063:
			{
				if (target.STATE !== EnumState.Dead) return { events };
				const heal = calcRecoveryValue(skill, char);
				events.push(...this.getNormalEvents(target, skill));
				this.recoverHp(events, skill, char, target, heal);
				return { events, heal };
			}

			// ---- 召喚物限定 / summon-only ----

			/** PowerTrain */
			case 3300:
			/** MindTrain */
			case 3301:
			/** SpeedTrain */
			case 3302:
			/** DefenceTrain */
			case 3303:
			case 3304:
			case 3305:
			case 3306:
			case 3307:
			case 3308:
			/** SuppressBeast：非召喚物一律無效 */
			case 3310:
			{
				if (!target.isSummon()) return { events };
				events.push(...statusChanges(skill, char, target, this.battle.rng));
				return { events };
			}

			// ---- 自傷／自身狀態 / self-inflicted ----

			/** GetPoison：無條件讓自己中毒（原始先印字、後 GetPoison） */
			case 3900:
			{
				events.push({
					type: EnumBattleEventType.Poison,
					target: charIdToString(char.no),
					skill: skill.no,
					text: 'self',
				});
				getPoison(char, 100, this.battle.rng);
				return { events };
			}

			/** GetDead：自殺 */
			case 3901:
			{
				const dmg = this.damageHpRaw(events, skill, char, char, 9999);
				return { events, damage: dmg };
			}

			/** StanceRestore：回到 AI 設定的預期站位 */
			case 4000:
			{
				const want = target.behavior?.position;
				if (want !== undefined && target.POSITION !== want)
				{
					this.moveUnit(events, skill, char, target, want, want === EnumPosition.Front
						? EnumMoveText.Front
						: EnumMoveText.Back);
				}
				return { events };
			}

			// ---- 敵方技能 / monster skills ----

			/** Charge!!! */
			case 5006:
			{
				if (char === target)
				{
					/**
					 * 自己是對象時只有「自己往後排」且**靜默**（原始 return false、無印字）。
					 * When the target is the caster only "the caster steps back" happens, and *silently*
					 * (the original returns false without printing).
					 */
					char.POSITION = EnumPosition.Back;
					return { events };
				}
				this.moveUnit(events, skill, char, target, EnumPosition.Front, EnumMoveText.Forward);
				events.push(...statusChanges(skill, char, target, this.battle.rng));
				return { events };
			}

			/** ArmorSnatch：目標 DEF/MDEF 下降、自己 DEF/MDEF 上升 */
			case 5060:
			{
				DOWNMAP.DownDEF?.(target, 30);
				DOWNMAP.DownMDEF?.(target, 30);
				UPMAP.UpDEF?.(char, 30);
				UPMAP.UpMDEF?.(char, 30);
				events.push({
					type: EnumBattleEventType.Debuff,
					actor: charIdToString(char.no),
					target: charIdToString(target.no),
					skill: skill.no,
				});
				events.push({
					type: EnumBattleEventType.Buff,
					actor: charIdToString(char.no),
					target: charIdToString(char.no),
					skill: skill.no,
				});
				return { events };
			}

			/** Spawn：隨機召喚一隻（原始 break，不落 default） */
			case 5803:
			{
				const spawn = [1018, 1019, 1020, 1021, 5002];
				const monNo = spawn[this.battle.rng.randInt(0, spawn.length - 1)];
				const def = this.battle.repo.getMon(monNo);
				if (def)
				{
					/**
					 * 原始 newMonSummon($mob) 未帶召喚力，TS 對應 strength 預設 1。
					 * The original calls newMonSummon($mob) with no strength; TypeScript's default of 1
					 * is the equivalent.
					 */
					const summoned = newMonSummon(def, this.battle.repo, this.battle.rng);
					(char.team as BattleTeam).add(summoned);
					events.push({
						type: EnumBattleEventType.Summon,
						actor: charIdToString(char.no),
						target: charIdToString(monNo),
						value: summoned.level,
						skill: skill.no,
					});
				}
				return { events };
			}

			/**
			 * 3000–3004／3103／5007／5055 等在原始中整段被註解掉，沒有 case → 落 default。
			 * 3000-3004 / 3103 / 5007 / 5055 are commented out in the original, so they have no case
			 * and fall through to the default branch.
			 */

			/**
			 * 3113（Berserk）是空 case：只中斷、不做任何事、也不落 default。
			 * 3113 (Berserk) is an empty case: it only breaks — no effect, and no fall into default.
			 */
			case 3113:
				return { events };

			default:
				return this.defaultEffect(skill, char, target, events);
		}
	}

	// ==================== default 分支 / the default branch ====================

	/**
	 * default 分支：原始 Effect.php 473–583 的處理流程（精確順序）
	 * The default branch: the exact flow of Effect.php lines 473-583
	 *
	 * 順序／order:
	 * 1. 魔方陣（MagicCircleAdd／Delete*）→ **留在 Battle.UseSkill**（每次施放只記一筆，見該處註解）
	 *    magic circles → *kept in Battle.UseSkill* (one record per cast; see the note there)
	 * 2. HpRegen／SpRegen → SPECIAL 疊加 + Regen 事件（regen 在最前，先於一切）
	 *    HpRegen / SpRegen → SPECIAL accumulate + Regen record (regen comes first, before everything)
	 * 3. charge 門檻：priority=Charge 且目標未在詠唱／蓄力 → 提前結束
	 *    charge gate: priority = Charge with a target not charging → return early
	 * 4. summon → 召喚完成即**提前結束**（原始 `return true`，不走後續 pow／poison／delay）
	 *    summon → returns right after summoning (the original's `return true`, so pow / poison /
	 *    delay never run)
	 * 5. CurePoison → 目標中毒時解毒（Poison(text='cured')）
	 *    CurePoison → cure a poisoned target (Poison with text = 'cured')
	 * 6. pow → support 走 applySkill（heal + statusChanges）；傷害走 applyDamage（**不含**狀態變化）
	 *    pow → support goes through applySkill (heal + statusChanges); damage goes through
	 *    applyDamage (*without* status changes)
	 * 7. SpRecoveryRate → SpHeal
	 * 8. statusChanges → 毒化／抗毒／擊退／Up·Down·Plus／移動（原版分散三段，TS 已合併於此）
	 *    statusChanges → poison / resist / knockback / Up-Down-Plus / move (the original spreads
	 *    these over three spots; TypeScript has them consolidated here)
	 * 9. DelayChar → skill.delay 真改變順位才產 Delay 事件
	 *    DelayChar → a Delay record only when skill.delay really changes the order
	 *
	 * 注意（與原版逐字一致）：傷害分支在這裡**不**呼叫 StatusChanges，狀態變化只有第 8 步那一次；
	 * 支援分支則在第 6 步與第 8 步各一次——原始正是如此（回復技能的狀態會被套用兩次）。
	 * Note (verbatim to the original): the damage branch does *not* call StatusChanges here — the
	 * statuses come only from step 8 — while the support branch runs it at both step 6 and step 8,
	 * exactly as the original does (a healing skill applies its statuses twice).
	 *
	 * @param skill - 技能定義 / skill definition
	 * @param char - 施放者 / the caster
	 * @param target - 目標 / the target
	 * @param events - 事件收集器（由 apply() 傳入）/ event accumulator (passed in by apply())
	 * @returns 技能執行結果 / skill result
	 */
	private defaultEffect(skill: ISkillDef, char: Character, target: Character, events: IBattleEvent[]): ISkillResult
	{
		/**
		 * HP 持続回復：疊加至 SPECIAL.HpRegen（原始 GetSpecial("HpRegen", n) 為疊加）
		 * HP regen: accumulates into SPECIAL.HpRegen (the original's GetSpecial("HpRegen", n) adds)
		 */
		if (skill.HpRegen)
		{
			target.addSpecial('HpRegen', skill.HpRegen);
			this.regen(events, skill, char, target, EnumResource.Hp, skill.HpRegen);
		}
		/**
		 * SP 持続回復
		 */
		if (skill.SpRegen)
		{
			target.addSpecial('SpRegen', skill.SpRegen);
			this.regen(events, skill, char, target, EnumResource.Sp, skill.SpRegen);
		}

		/**
		 * 蓄力技能只對「已在詠唱／蓄力」的目標生效（原始 `break` → 不走 default 餘下流程）
		 * A charge skill only affects a target that is already charging (the original `break`s, so the
		 * rest of default never runs)
		 */
		if (skill.priority === EnumSkillPriority.Charge && target.expect === null) return { events };

		/**
		 * 召喚系：完成即結束（原始 `return true`）
		 * Summon: done right after the summons are joined (the original's `return true`)
		 */
		if (skill.summon)
		{
			const defNos = Array.isArray(skill.summon) ? skill.summon : [skill.summon];
			/**
			 * 召喚力＝施放者的 summonPower()（SPECIAL.Summon 為真時再加成）
			 * Summon strength = the caster's summonPower() (further scaled by SPECIAL.Summon)
			 */
			const strength = char.summonPower();
			const team = char.team as BattleTeam;
			for (const monNo of defNos)
			{
				const def = this.battle.repo.getMon(monNo);
				/** 未知編號略過（不產半成品紀錄）/ unknown no skipped (no half-built record) */
				if (!def) continue;
				const summoned = newMonSummon(def, this.battle.repo, this.battle.rng, strength);
				/**
				 * 速攻：原始 `$add->Quick($this->battle->delay * 2)`；TS 為「排在目前最快者之前」。
				 * quick: the original's `$add->Quick($this->battle->delay * 2)`; in TypeScript it means
				 * "line up ahead of whoever is currently next".
				 */
				if (skill.quick) this.quickNow(summoned);
				team.add(summoned);
				events.push({
					type: EnumBattleEventType.Summon,
					actor: charIdToString(char.no),
					target: charIdToString(monNo),
					value: summoned.level,
					skill: skill.no,
				});
			}
			return { events };
		}

		/**
		 * 毒の治療：只在目標真的中毒時解毒
		 * Cure poison: only a genuinely poisoned target is cured
		 */
		if (skill.CurePoison && target.STATE === EnumState.Poison)
		{
			events.push(...this.getNormalEvents(target, skill));
		}

		let damage: number | undefined;
		let heal: number | undefined;

		/**
		 * 基本的なダメージの計算
		 */
		if (skill.pow)
		{
			if (skill.support)
			{
				/**
				 * applySkill 自帶 heal + statusChanges，與原始「RecoverHP → StatusChanges」同序。
				 * applySkill carries both the heal and the statusChanges, in the original's
				 * RecoverHP → StatusChanges order.
				 */
				const res = applySkill(skill, char, target, this.battle.rng);
				events.push(...res.events);
				heal = res.heal;
			}
			else
			{
				/**
				 * applyDamage 只產 Barrier／Damage，狀態變化交給下方統一的 statusChanges。
				 * applyDamage only produces the barrier / damage records; the statuses are left to the
				 * single statusChanges below.
				 */
				const res = applyDamage(skill, char, target);
				events.push(...res.events);
				damage = res.damage;
			}
		}

		/**
		 * SP 回復(レート)：ceil(sqrt(MAXSP) × rate)
		 * SP recovery (rate): ceil(sqrt(MAXSP) × rate)
		 */
		if (skill.SpRecoveryRate)
		{
			const spRec = Math.ceil(Math.sqrt(target.MAXSP) * skill.SpRecoveryRate);
			this.recoverSp(events, skill, char, target, spRec);
			heal = spRec;
		}

		/**
		 * 毒化／擊退／ステータス変化／隊列の移動（原版分散於此處與其前後，TS 統一於 statusChanges）
		 * poison / knockback / status changes / row movement (spread across this spot and its
		 * neighbours in the original; consolidated into statusChanges here)
		 */
		events.push(...statusChanges(skill, char, target, this.battle.rng));

		/**
		 * 行動を遅らせる(DELAY)
		 */
		this.delayChar(char, target, skill, events);

		const result: ISkillResult = { events };
		if (damage !== undefined) result.damage = damage;
		if (heal !== undefined) result.heal = heal;
		return result;
	}

	// ==================== 共用原語 / shared primitives ====================

	/**
	 * 復活／解毒（對齊原始 `GetNormal(true)`）：先產事件、再把狀態改回 Alive
	 * Revive / cure (mirrors the original `GetNormal(true)`): the record comes first, then the state
	 * returns to Alive
	 *
	 * 事件的 actor 與 target 都是「被復活／被解毒者」——原始 `Name('bold')` 印的就是他本人。
	 * Both the event's actor and target are the revived / cured unit: the original prints
	 * `Name('bold')` for that same unit.
	 *
	 * @param target - 狀態異常者 / the unit whose status is cleared
	 * @param skill - 技能定義（供 skill 編號）/ skill definition (supplies the skill number)
	 * @returns Revive 或 Poison(text='cured') 事件；非死亡非中毒時為空陣列
	 * Revive or Poison (text = 'cured') records; an empty array when neither dead nor poisoned
	 */
	private getNormalEvents(target: Character, skill: ISkillDef): IBattleEvent[]
	{
		const no = charIdToString(target.no);
		if (target.STATE === EnumState.Dead)
		{
			const events: IBattleEvent[] = [
				{
					type: EnumBattleEventType.Revive,
					actor: no,
					target: no,
					skill: skill.no,
				},
			];
			getNormal(target);
			return events;
		}
		if (target.STATE === EnumState.Poison)
		{
			const events: IBattleEvent[] = [
				{
					type: EnumBattleEventType.Poison,
					actor: no,
					target: no,
					skill: skill.no,
					text: 'cured',
				},
			];
			getNormal(target);
			return events;
		}
		return [];
	}

	/**
	 * calc 路徑的 Barrier 攔截：攔下時 push Guard 事件並回傳 true
	 * Barrier interception on a calc path: pushes the Guard record and returns true when it blocks
	 *
	 * 原始 Barrier 檢查寫在 CalcBasicDamage 內，因此每個 calc 特例都必須先做這關。
	 * The original Barrier check lives inside CalcBasicDamage, so every calc special must pass it first.
	 *
	 * @returns 是否被 Barrier 攔下 / whether the barrier intercepted
	 */
	private blockedByBarrier(skill: ISkillDef, target: Character, events: IBattleEvent[]): boolean
	{
		const guard = barrierGuard(skill, target);
		if (guard === null) return false;
		events.push(guard);
		return true;
	}

	/**
	 * RecoverHP → Heal 事件（`value` 為實際回復量）
	 * RecoverHP → Heal record (`value` is the amount actually healed)
	 *
	 * @param actor - 施放者（事件 actor；展示層以 target 當粗體主詞）/ the caster (the event's actor; the display makes the target the bold subject)
	 * @param healed - 受療者 / the healed unit
	 * @param amount - 請求回復量 / the requested amount
	 * @returns 實際回復量 / the amount actually healed
	 */
	private recoverHp(
		events: IBattleEvent[],
		skill: ISkillDef,
		actor: Character,
		healed: Character,
		amount: number,
	): number
	{
		const hpBefore = healed.HP;
		const applied = hpRecover(healed, amount);
		events.push({
			type: EnumBattleEventType.Heal,
			actor: charIdToString(actor.no),
			target: charIdToString(healed.no),
			skill: skill.no,
			value: applied,
			hpBefore,
			hpAfter: healed.HP,
		});
		return applied;
	}

	/**
	 * RecoverSP → SpHeal 事件（`unit='sp'`、`value` 為實際回復量）
	 * RecoverSP → SpHeal record (unit = 'sp', `value` is the amount actually restored)
	 *
	 * @param healed - 受療者 / the healed unit
	 * @param amount - 請求回復量 / the requested amount
	 * @returns 實際回復量 / the amount actually restored
	 */
	private recoverSp(
		events: IBattleEvent[],
		skill: ISkillDef,
		actor: Character,
		healed: Character,
		amount: number,
	): number
	{
		const spBefore = healed.SP;
		const applied = spRecover(healed, amount);
		events.push({
			type: EnumBattleEventType.SpHeal,
			actor: charIdToString(actor.no),
			target: charIdToString(healed.no),
			skill: skill.no,
			value: applied,
			unit: EnumResource.Sp,
			hpBefore: spBefore,
			hpAfter: healed.SP,
		});
		return applied;
	}

	/**
	 * DamageHP（calc 路徑）→ Damage 事件：hpDamage 含玩家保護，`value` 為實際扣血
	 * DamageHP (calc path) → Damage record: hpDamage carries the player protection and `value` is the
	 * HP actually lost
	 *
	 * @returns 實際扣血量 / the HP actually lost
	 */
	private damageHp(
		events: IBattleEvent[],
		skill: ISkillDef,
		actor: Character,
		damaged: Character,
		dmg: number,
	): number
	{
		const hpBefore = damaged.HP;
		const applied = hpDamage(damaged, dmg);
		events.push({
			type: EnumBattleEventType.Damage,
			actor: charIdToString(actor.no),
			target: charIdToString(damaged.no),
			skill: skill.no,
			value: applied,
			hpBefore,
			hpAfter: damaged.HP,
		});
		return applied;
	}

	/**
	 * DamageHP（raw 路徑）→ Damage 事件：不套保護，故 `value`＝請求值＝實際扣血
	 * DamageHP (raw path) → Damage record: no protection is applied, so `value` = requested = HP lost
	 *
	 * @returns 實際扣血量（與請求值相同）/ the HP actually lost (identical to the requested amount)
	 */
	private damageHpRaw(
		events: IBattleEvent[],
		skill: ISkillDef,
		actor: Character,
		damaged: Character,
		dmg: number,
	): number
	{
		const hpBefore = damaged.HP;
		const applied = hpDamageRaw(damaged, dmg);
		events.push({
			type: EnumBattleEventType.Damage,
			actor: charIdToString(actor.no),
			target: charIdToString(damaged.no),
			skill: skill.no,
			value: applied,
			hpBefore,
			hpAfter: damaged.HP,
		});
		return applied;
	}

	/**
	 * DamageHP2 → Damage 事件：`value` 為**請求值**，hpBefore／hpAfter 為實際值（下限 1）
	 * DamageHP2 → Damage record: `value` is the *requested* amount, hpBefore / hpAfter the actual
	 * ones (floored at 1)
	 *
	 * @returns 實際扣血量 / the HP actually lost
	 */
	private damageHp2(
		events: IBattleEvent[],
		skill: ISkillDef,
		actor: Character,
		damaged: Character,
		dmg: number,
	): number
	{
		const hpBefore = damaged.HP;
		const applied = hpDamage2(damaged, dmg);
		events.push({
			type: EnumBattleEventType.Damage,
			actor: charIdToString(actor.no),
			target: charIdToString(damaged.no),
			skill: skill.no,
			value: dmg,
			hpBefore,
			hpAfter: damaged.HP,
		});
		return applied;
	}

	/**
	 * DamageSP → SpDamage 事件：`value` 為請求值、hpBefore／hpAfter 為 SP 前後、`unit='sp'`
	 * DamageSP → SpDamage record: `value` is requested, hpBefore / hpAfter are the SP ends,
	 * unit = 'sp'
	 *
	 * @param dmg - 請求扣 SP 量 / the requested SP loss
	 */
	private damageSp(
		events: IBattleEvent[],
		skill: ISkillDef,
		actor: Character,
		damaged: Character,
		dmg: number,
	): void
	{
		const spBefore = damaged.SP;
		spDamage(damaged, dmg);
		events.push({
			type: EnumBattleEventType.SpDamage,
			actor: charIdToString(actor.no),
			target: charIdToString(damaged.no),
			skill: skill.no,
			value: dmg,
			unit: EnumResource.Sp,
			hpBefore: spBefore,
			hpAfter: damaged.SP,
		});
	}

	/**
	 * AbsorbHP → Drain 事件（HP）
	 * AbsorbHP → Drain record (HP)
	 *
	 * 順序對齊原始 AbsorbHP：**施放者先回復、目標後扣血**；事件的 `valueChanges` 則固定
	 * 「目標在前、施放者在後」，展示層印成 `from 目標(tFrom → tTo)施放者(aFrom → aTo)`。
	 * Order mirrors the original AbsorbHP: the caster heals first and the target loses HP second;
	 * the record's `valueChanges` is fixed as *target first, caster second*, which the display prints
	 * as `from target(tFrom → tTo)caster(aFrom → aTo)`.
	 *
	 * `value` 為請求值（原始 `Drained N HP` 印的即是此值）。
	 * `value` is the requested amount (exactly what the original's `Drained N HP` prints).
	 *
	 * @param dmg - 請求吸取量 / the requested drain amount
	 */
	private drainHp(
		events: IBattleEvent[],
		skill: ISkillDef,
		caster: Character,
		target: Character,
		dmg: number,
	): void
	{
		const actorBefore = caster.HP;
		hpRecover(caster, dmg);
		const targetBefore = target.HP;
		hpDamageRaw(target, dmg);
		events.push({
			type: EnumBattleEventType.Drain,
			actor: charIdToString(caster.no),
			target: charIdToString(target.no),
			skill: skill.no,
			value: dmg,
			unit: EnumResource.Hp,
			valueChanges: [
				{ who: EnumValueWho.Target, unit: EnumResource.Hp, from: targetBefore, to: target.HP },
				{ who: EnumValueWho.Actor, unit: EnumResource.Hp, from: actorBefore, to: caster.HP },
			],
		});
	}

	/**
	 * AbsorbSP → Drain 事件（SP，`unit='sp'`）
	 * AbsorbSP → Drain record (SP, unit = 'sp')
	 *
	 * 順序與 valueChanges 排列同 drainHp。
	 * The application order and the valueChanges order match drainHp.
	 *
	 * @param dmg - 請求吸取量 / the requested drain amount
	 */
	private drainSp(
		events: IBattleEvent[],
		skill: ISkillDef,
		caster: Character,
		target: Character,
		dmg: number,
	): void
	{
		const actorBefore = caster.SP;
		spRecover(caster, dmg);
		const targetBefore = target.SP;
		spDamage(target, dmg);
		events.push({
			type: EnumBattleEventType.Drain,
			actor: charIdToString(caster.no),
			target: charIdToString(target.no),
			skill: skill.no,
			value: dmg,
			unit: EnumResource.Sp,
			valueChanges: [
				{ who: EnumValueWho.Target, unit: EnumResource.Sp, from: targetBefore, to: target.SP },
				{ who: EnumValueWho.Actor, unit: EnumResource.Sp, from: actorBefore, to: caster.SP },
			],
		});
	}

	/**
	 * 設定持續回復 → Regen 事件
	 * Configure a regen → Regen record
	 *
	 * `unit` 為資源、`value` 為百分比；原始印 `gained HP regeneration +N%`，
	 * 文案交給展示層 buildRegenText。
	 * `unit` is the resource and `value` the percentage; the original prints
	 * `gained HP regeneration +N%`, whose copy comes from the display's buildRegenText.
	 */
	private regen(
		events: IBattleEvent[],
		skill: ISkillDef,
		actor: Character,
		recipient: Character,
		unit: EnumResource,
		value: number,
	): void
	{
		events.push({
			type: EnumBattleEventType.Regen,
			actor: charIdToString(actor.no),
			target: charIdToString(recipient.no),
			skill: skill.no,
			unit,
			value,
		});
	}

	/**
	 * 移動單位並在**真的改變站位**時產 Move 事件
	 * Move a unit and emit a Move record only when the row really changes
	 *
	 * 對齊原始 `Move($posi)`：已在該站位時直接 return false、不印字。
	 * Mirrors the original `Move($posi)`: already in that row returns false and prints nothing.
	 *
	 * @param to - 目標站位 / destination row
	 * @param text - Move 的 `text` token（front／back／forward）/ the Move `text` token
	 * @returns 是否真的移動 / whether the unit actually moved
	 */
	private moveUnit(
		events: IBattleEvent[],
		skill: ISkillDef,
		actor: Character,
		moved: Character,
		to: EnumPosition,
		text: EnumMoveText,
	): boolean
	{
		if (moved.POSITION === to) return false;
		moved.POSITION = to;
		events.push({
			type: EnumBattleEventType.Move,
			actor: charIdToString(actor.no),
			target: charIdToString(moved.no),
			skill: skill.no,
			text,
		});
		return true;
	}

	/**
	 * Push an Info record (`text` is a structured token, never display copy)
	 * 產出 Info 事件（`text` 為結構化 token，不是可顯示文字）
	 *
	 * Info 事件刻意**不帶 actor／target／skill**：原始的 `Damage x6!`、
	 * `※値が大きすぎて補正されました。`、`heal x2!` 都是無名稱的獨立行。
	 * Info records deliberately carry *no* actor / target / skill: the original's `Damage x6!`,
	 * `※値が大きすぎて補正されました。` and `heal x2!` are all unnamed standalone lines.
	 *
	 * @param text - token / the token
	 * @param value - 乘算次數等數值（multiply／heal-multiply 用）/ the count for multiply-style tokens
	 */
	private info(events: IBattleEvent[], text: EnumInfoText, value?: number): void
	{
		const event: IBattleEvent = { type: EnumBattleEventType.Info, text };
		if (value !== undefined) event.value = value;
		events.push(event);
	}

	// ==================== 行動順序 / action delay ====================
	/**
	 *
	 * 原始 DELAY_TYPE=1 是「進度制」（0→100、越大越快）；TS 是「分數制」（delay 越小越快，
	 * 每回合行動後 `delay += DelayValue(c)`）。三支換算如下：
	 * The original's DELAY_TYPE=1 is a *progress* scale (0 → 100, bigger = sooner) while the
	 * TypeScript model is a *score* (smaller = sooner, with `delay += DelayValue(c)` after each
	 * action). The three conversions are:
	 *
	 * - DelayByRate($No) → delayByRate：原始 `delay -= No`（進度後退）→ `delay += DV×rate/100`
	 *   （分數制的「更晚行動」），DV＝ DelayValue(target)。
	 *   DelayByRate($No) → delayByRate: the original's `delay -= No` (progress retreats) becomes
	 *   `delay += DV × rate / 100` (a later action on the score scale), DV = DelayValue(target).
	 * - DelayCut($No) → delayCut：向「存活者最小 delay」收斂，rate≥100 時直接領先一名
	 *   （`min - 1`）。以 min 為錨可保證「加快」永遠不會反而變慢。
	 *   DelayCut($No) → delayCut: converges toward the smallest delay among living units; at
	 *   rate ≥ 100 it jumps ahead of everyone (`min - 1`). Anchoring on `min` guarantees that
	 *   speeding up can never slow down.
	 * - Quick → quickNow：排在目前最快者之前（原始 `delay = 100.1`＝「進度滿、立刻行動」）。
	 *   Quick → quickNow: lines up ahead of whoever is currently next (the original's
	 *   `delay = 100.1`, i.e. full progress and acting immediately).
	 *
	 * DelayByRate／DelayCut 原本就沒有死亡檢查；`Delay($no)` 有，但 TS 的三個呼叫點皆不會
	 * 對死亡者觸發（2110/2111 檢查 expect、3050 檢查自身與 expect、3055 檢查 expect）。
	 * DelayByRate / DelayCut had no death check in the original; `Delay($no)` did, but none of the
	 * three TypeScript call sites can fire on a dead unit (2110/2111 and 3055 check expect, 3050
	 * checks the caster and expect).
	 */

	/**
	 * 目前存活單位中的最小 delay（無存活者時回傳 Infinity）
	 * The smallest delay among living units (Infinity when none are alive)
	 */
	private minAliveDelay(): number
	{
		let min = Infinity;
		for (const c of this.battle.allChars())
		{
			if (c.STATE !== EnumState.Dead && c.delay < min) min = c.delay;
		}
		return min;
	}

	/**
	 * 拉開行動順延（DelayByRate 的 TS 等價）
	 * Push an action further back (the TypeScript equivalent of DelayByRate)
	 *
	 * @param target - 被延遲者 / the delayed unit
	 * @param rate - 延遲速率 % / delay rate (%)
	 */
	private delayByRate(target: Character, rate: number): void
	{
		target.delay += this.battle.DelayValue(target) * rate / 100;
	}

	/**
	 * 提前行動（DelayCut 的 TS 等價）：向存活者最小 delay 收斂，rate≥100 → 領先一名
	 * Act sooner (the TypeScript equivalent of DelayCut): converge toward the smallest living delay;
	 * rate ≥ 100 → jump one slot ahead
	 *
	 * @param target - 被加速者 / the sped-up unit
	 * @param rate - 加速率 % / speed-up rate (%)
	 */
	private delayCut(target: Character, rate: number): void
	{
		const min = this.minAliveDelay();
		if (!Number.isFinite(min)) return;
		target.delay = rate >= 100 ? min - 1 : min + (target.delay - min) * (1 - rate / 100);
	}

	/**
	 * 立即行動（Quick 的 TS 等價）：排在目前最快者之前
	 * Act immediately (the TypeScript equivalent of Quick): line up ahead of the current fastest unit
	 *
	 * @param target - 被加速者 / the sped-up unit
	 */
	private quickNow(target: Character): void
	{
		const min = this.minAliveDelay();
		if (!Number.isFinite(min)) return;
		target.delay = min - 1;
	}

	/**
	 * 行動を遅らせる（DelayChar）：真改變順位時才產 Delay 事件
	 * Delay an action (DelayChar): emit a Delay record only when the order really changes
	 *
	 * 事件的 `valueChanges` 帶分數制的前後值；展示層以固定基準 100 組成
	 * `from ⏳↘ to/100`（對齊原始 DelayByRate $Show 的 `old >>> new/base`）。
	 * The record's `valueChanges` carries the score-scale ends; the display joins them against a fixed
	 * base of 100 into `from ⏳↘ to/100` (mirroring the original DelayByRate's
	 * `old >>> new/base` output).
	 *
	 * @param char - 施放者（事件 actor）/ the caster (the event's actor)
	 * @param target - 被延遲者（事件 target，展示層以其名稱為主詞）/ the delayed unit (the event's
	 * target; the display uses its name as the subject)
	 * @param skill - 技能定義 / skill definition
	 * @param events - 事件收集器 / the event accumulator
	 */
	private delayChar(char: Character, target: Character, skill: ISkillDef, events: IBattleEvent[]): void
	{
		/**
		 * 原始 `if (!$skill["delay"]) return false;`——沒有 delay 欄位就不動順位、也不印字。
		 * The original's `if (!$skill["delay"]) return false;` — no delay field means no change and no line.
		 */
		if (!skill.delay) return;

		const from = target.delay;
		this.delayByRate(target, skill.delay);
		if (target.delay === from) return;

		events.push({
			type: EnumBattleEventType.Delay,
			actor: charIdToString(char.no),
			target: charIdToString(target.no),
			skill: skill.no,
			valueChanges: [{ who: EnumValueWho.Target, unit: EnumResource.Delay, from, to: target.delay }],
		});
	}
}
