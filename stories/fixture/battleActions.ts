/**
 * BattleAction 展示用戰鬥行動資料（單一事實來源）
 * BattleAction fixture battle action data (single source of truth)
 *
 * 各故事展示用的獨立戰鬥行動（日誌條目），集中管理避免重複定義。
 * 角色／怪物名稱與圖像統一取自 spriteCast，日誌文案以此組出（與引擎同一來源）。
 * Individual battle-action log entries for story showcases, centralized to avoid duplication.
 * Character / monster names and images come from spriteCast; the log copy is composed
 * from them (same source as the engine).
 */
import type { IBattleAction } from '../../src/components/battle/types';
import { EnumActionType, EnumAttributeType, EnumStatDirection } from '#/components/battle/enums';
import { EnumValueWho } from '#/lib/game/types';
import { EnumStatusAttr } from '#/lib/game/character/status-enum';
import {
	buildActionMessage,
	buildDamageCountMessage,
	buildDamageMessage,
	buildDrainMessage,
	buildHealCountMessage,
	buildHealMessage,
	buildPoisonDamageText,
	buildPoisonResistText,
	buildPossessiveText,
	buildRecoveredText,
	buildRegenText,
	buildSpDamageMessage,
	buildStatToText,
	buildValueChangeFromDelay,
	EnumLogCopy,
} from '#/components/battle/battleUtils';
import { characterSprites, monsterSprites, monsterOf } from './spriteCast';

/** 角色名稱別名（由 spriteCast 派生，避免字面重複） / Character name aliases (derived from spriteCast) */
const Hero1 = characterSprites.hero.name;
const Mage1 = characterSprites.mage.name;
const Healer1 = characterSprites.healer.name;
const Priest1 = characterSprites.priest.name;
/** 怪物名稱別名（由 spriteCast 派生） / Monster name aliases (derived from spriteCast) */
const GoblinWarriorA = monsterSprites.goblinWarriorA.name;
const GoblinWarriorB = monsterSprites.goblinWarriorB.name;
const GoblinAxe = monsterSprites.goblinAxe.name;

/** 技能攻擊：FatalStab / Skill attack: FatalStab */
export const skillAttackAction: IBattleAction = {
	type: EnumActionType.Skill,
	source: GoblinWarriorB,
	skill: { name: 'FatalStab', iconUrl: '/image/icon/skill/skill_074z.png' },
	message: `${GoblinWarriorB} FatalStab`,
	attribute: EnumAttributeType.Dmg,
};

/** 普通攻擊 / Normal attack */
export const normalAttackAction: IBattleAction = {
	type: EnumActionType.Attack,
	source: GoblinAxe,
	skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' },
	message: `${GoblinAxe} Attack`,
	attribute: EnumAttributeType.Dmg,
};

/** 傷害（Hero1，182） / Damage dealt to Hero1 (182) */
export const damageDealtAction: IBattleAction = {
	type: EnumActionType.Damage,
	source: GoblinWarriorB,
	target: Hero1,
	value: 182,
	valueChange: { from: 349, to: 167 },
	message: buildDamageMessage(182, Hero1),
	attribute: EnumAttributeType.Dmg,
};

/** 保護：Hero1 保護 Priest1 / Protect: Hero1 protects Priest1 */
export const protectAction: IBattleAction = {
	type: EnumActionType.Protect,
	source: Hero1,
	target: Priest1,
	message: `${Hero1} protected ${Priest1}!`,
	attribute: EnumAttributeType.Support,
};

/** 單位入場 / Unit entrance */
export const unitEntranceAction: IBattleAction = {
	type: EnumActionType.Enter,
	source: GoblinWarriorA,
	message: `${GoblinWarriorA} Lv.4 enter the Battlefield.`,
	attribute: EnumAttributeType.Normal,
};

/** 召喚：GraveYard 召喚 3 隻木乃伊 / Summon: GraveYard summons 3 mummies */
export const summonAction: IBattleAction = {
	type: EnumActionType.Summon,
	source: Mage1,
	skill: { name: 'GraveYard', iconUrl: '/image/icon/skill/skill_028.png' },
	summoned: [
		{ ...monsterOf('mummy'), level: 10 },
		{ ...monsterOf('mummyPrisoner'), level: 10 },
		{ ...monsterOf('mummy'), level: 10 },
	],
	message: `${Mage1} GraveYard: ${monsterSprites.mummy.name} joined to the team.`,
	attribute: EnumAttributeType.Normal,
};

/** 詠唱 / Casting */
export const castingAction: IBattleAction = {
	type: EnumActionType.Casting,
	source: Mage1,
	message: `${Mage1} start casting.`,
	attribute: EnumAttributeType.Charge,
};

/** 單位陣亡 / Unit down */
export const unitDownAction: IBattleAction = {
	type: EnumActionType.Down,
	source: Mage1,
	message: `${Mage1} down.`,
	attribute: EnumAttributeType.Dmg,
};

/** 回復（Hero1，120） / Heal on Hero1 (120) */
export const healAction: IBattleAction = {
	type: EnumActionType.Heal,
	source: Priest1,
	target: Hero1,
	value: 120,
	valueChange: { from: 1, to: 121 },
	message: buildHealMessage(120, Hero1),
	attribute: EnumAttributeType.Recover,
};

/** SP 傷害（40SP Damage to GoblinAxe，行首無施放者名稱） / SP damage (no caster name at the head) */
export const spDamageAction: IBattleAction = {
	type: EnumActionType.SpDamage,
	source: undefined,
	target: GoblinAxe,
	value: 40,
	valueUnit: 'SP',
	message: buildSpDamageMessage(40, GoblinAxe),
	attribute: EnumAttributeType.Spdmg,
};

/** 吸取（Drained 40 HP from GoblinAxe(1000 ↘ 960)Warrior(200 ↗ 240)） / Drain */
export const drainAction: IBattleAction = {
	type: EnumActionType.Drain,
	source: undefined,
	target: GoblinAxe,
	value: 40,
	valueUnit: 'HP',
	message: buildDrainMessage(40, 'HP', GoblinAxe),
	valueChanges: [{ from: 1000, to: 960 }, { who: EnumValueWho.Actor, from: 200, to: 240 }],
	attribute: EnumAttributeType.Recover,
};

/** SP 回復（Warrior Recovered 30 SP） / SP heal */
export const recoverSpAction: IBattleAction = {
	type: EnumActionType.Recover,
	source: 'Warrior',
	value: 30,
	valueUnit: 'SP',
	valueChange: { from: 60, to: 90 },
	text: buildRecoveredText(30, 'SP'),
	message: buildActionMessage({ source: 'Warrior', text: buildRecoveredText(30, 'SP') }),
	attribute: EnumAttributeType.Support,
};

/** 持續回復（gained SP regeneration +15%） / Regeneration */
export const regenAction: IBattleAction = {
	type: EnumActionType.Regen,
	source: Mage1,
	valueUnit: 'SP',
	text: buildRegenText('SP', 15),
	message: buildActionMessage({ source: Mage1, text: buildRegenText('SP', 15) }),
	attribute: EnumAttributeType.Support,
};

/** 復活（Hero1 revived!） / Revive */
export const reviveAction: IBattleAction = {
	type: EnumActionType.Revive,
	source: Hero1,
	text: EnumLogCopy.Revived,
	message: buildActionMessage({ source: Hero1, text: EnumLogCopy.Revived }),
	emphasis: 'revived',
	attribute: EnumAttributeType.Recover,
};

/** 增益：障壁 / Buff: barrier */
export const buffAction: IBattleAction = {
	type: EnumActionType.Buff,
	source: Mage1,
	text: EnumLogCopy.Barriered,
	message: buildActionMessage({ source: Mage1, text: EnumLogCopy.Barriered }),
	attribute: EnumAttributeType.Support,
};

/** 施法縮短（casting shorted!） / Cast shortened */
export const castShortAction: IBattleAction = {
	type: EnumActionType.Buff,
	source: Mage1,
	text: EnumLogCopy.CastingShorted,
	message: buildActionMessage({ source: Mage1, text: EnumLogCopy.CastingShorted }),
	attribute: EnumAttributeType.Support,
};

/** 加速（got quicked!） / Quick */
export const quickAction: IBattleAction = {
	type: EnumActionType.Buff,
	source: Hero1,
	text: EnumLogCopy.Quicked,
	message: buildActionMessage({ source: Hero1, text: EnumLogCopy.Quicked }),
	attribute: EnumAttributeType.Support,
};

/** 上限變化（MAXSP extended to 400，原始日誌無 span） / Cap change */
export const statChangeAction: IBattleAction = {
	type: EnumActionType.StatChange,
	source: Mage1,
	text: buildStatToText(EnumStatusAttr.MAXSP, EnumStatDirection.Extended, 400),
	message: buildActionMessage({
		source: Mage1,
		text: buildStatToText(EnumStatusAttr.MAXSP, EnumStatDirection.Extended, 400),
	}),
	attribute: EnumAttributeType.Normal,
};

/** 位移（moved to front.，原始日誌無 span） / Move */
export const moveAction: IBattleAction = {
	type: EnumActionType.Move,
	source: Hero1,
	text: EnumLogCopy.MoveToFront,
	message: buildActionMessage({ source: Hero1, text: EnumLogCopy.MoveToFront }),
	attribute: EnumAttributeType.Normal,
};

/** 延遲（Mage1 Delayed（15 ⏳↘ 25/100）） / Delay */
export const delayAction: IBattleAction = {
	type: EnumActionType.Delay,
	source: Mage1,
	text: EnumLogCopy.Delay,
	message: buildActionMessage({ source: Mage1, text: EnumLogCopy.Delay }),
	valueChange: buildValueChangeFromDelay(15, 25, 100),
	attribute: EnumAttributeType.Normal,
};

/** 中毒施加（get poisoned!） / Poison applied */
export const poisonAction: IBattleAction = {
	type: EnumActionType.Poison,
	source: GoblinAxe,
	text: EnumLogCopy.PoisonApplied,
	message: buildActionMessage({ source: GoblinAxe, text: EnumLogCopy.PoisonApplied }),
	emphasis: 'poisoned',
	attribute: EnumAttributeType.Spdmg,
};

/** 每回合毒傷（got 12 damage by poison.，帶前後 HP） / Per-turn poison damage */
export const poisonDamageAction: IBattleAction = {
	type: EnumActionType.Poison,
	source: GoblinAxe,
	value: 12,
	valueChange: { from: 1200, to: 1050 },
	text: buildPoisonDamageText(12),
	message: buildActionMessage({ source: GoblinAxe, text: buildPoisonDamageText(12) }),
	attribute: EnumAttributeType.Spdmg,
};

/** 解毒（GoblinAxe's poison has cured.，所有格片段不加空格、無 span） / Cure */
export const poisonCureAction: IBattleAction = {
	type: EnumActionType.Poison,
	source: GoblinAxe,
	text: buildPossessiveText(EnumLogCopy.PoisonCured),
	message: buildActionMessage({ source: GoblinAxe, text: buildPossessiveText(EnumLogCopy.PoisonCured) }),
	attribute: EnumAttributeType.Normal,
};

/** 抗毒（got PoisonResist!(50%)，support 色） / Poison resist */
export const poisonResistAction: IBattleAction = {
	type: EnumActionType.Poison,
	source: GoblinWarriorA,
	text: buildPoisonResistText(50),
	message: buildActionMessage({ source: GoblinWarriorA, text: buildPoisonResistText(50) }),
	attribute: EnumAttributeType.Support,
};

/** 自我中毒（Got poisoned，無主詞無 span） / Self-poison */
export const poisonSelfAction: IBattleAction = {
	type: EnumActionType.Poison,
	source: undefined,
	text: EnumLogCopy.PoisonSelf,
	message: EnumLogCopy.PoisonSelf,
	attribute: EnumAttributeType.Normal,
};

/** 未命中（無施放者時整段即 Failed!） / Miss without an actor */
export const missAction: IBattleAction = {
	type: EnumActionType.Miss,
	source: undefined,
	text: EnumLogCopy.Miss,
	message: EnumLogCopy.Miss,
	attribute: EnumAttributeType.Normal,
};

/** 純文字資訊（Damage x6!，無主詞無 span） / Plain info */
export const infoAction: IBattleAction = {
	type: EnumActionType.Info,
	source: undefined,
	message: buildDamageCountMessage(6),
	attribute: EnumAttributeType.Normal,
};

/** 回復倍數資訊（heal x2!；對照 SkillEffect 的 3005） / Heal multiplier info */
export const healCountInfoAction: IBattleAction = {
	type: EnumActionType.Info,
	source: undefined,
	message: buildHealCountMessage(2),
	attribute: EnumAttributeType.Normal,
};

/** HP/SP 交換（3 行區塊：交換句＋HP 行＋SP 行） / HP/SP exchange */
export const energyExchangeAction: IBattleAction = {
	type: EnumActionType.EnergyExchange,
	source: Hero1,
	text: EnumLogCopy.EnergyExchange,
	message: buildActionMessage({ source: Hero1, text: EnumLogCopy.EnergyExchange }),
	energyExchange: {
		hpFrom: 500,
		hpFromRate: 50,
		hpTo: 800,
		hpToRate: 80,
		spFrom: 80,
		spFromRate: 80,
		spTo: 50,
		spToRate: 50,
	},
	attribute: EnumAttributeType.Normal,
};

/** 多行日誌範例（最後一擊為 Healer1 的 44 傷害） / Log sequence sample (final hit: 44 damage to Healer1) */
export const logSequenceActions: IBattleAction[] = [
	skillAttackAction,
	protectAction,
	damageDealtAction,
	normalAttackAction,
	{
		type: EnumActionType.Damage,
		source: GoblinAxe,
		target: Healer1,
		value: 44,
		valueChange: { from: 213, to: 169 },
		message: buildDamageMessage(44, Healer1),
		attribute: EnumAttributeType.Dmg,
	},
];