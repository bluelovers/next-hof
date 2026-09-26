/**
 * BattleEventDispatch 展示資料（單一事實來源）
 * BattleEventDispatch showcase data (single source of truth)
 *
 * 這裡只描述「輸入的戰鬥紀錄」與「技能定義」；分類、效果偵測、分派與後續事件
 * 全部交給上級事件引擎 runEventEngine 決定，fixture 不自行推導任何一項。
 * This file only states the input battle records and the skill definitions; classification,
 * effect detection, dispatch and follow-ups are all decided by the upper event engine
 * (runEventEngine) — the fixture derives none of them by hand.
 *
 * 紀錄內容對齊生產點契約（見 #/lib/game/types 的 EnumBattleEventType）：
 * - Act → Battle.UseSkill（同一筆技能執行的起點）
 * - Damage / Heal → skill/effect 的 applySkill（帶 skill、value、hpBefore/hpAfter）
 * - Debuff / Poison（施毒）→ skill/effect 的 statusChanges（帶 skill）
 * - MagicCircle → Battle.UseSkill（只帶 skill，數量由展示層依定義回推）
 * - Summon → Battle.UseSkill.applySummon（target＝def no、value＝等級）
 * - Poison（每回合毒傷）→ Battle.Action（帶 value 與前後 HP、不帶 skill → 一般事件）
 * - Death → Battle.UseSkill（不帶 skill → 一般事件）
 * Records follow the producer contracts (see EnumBattleEventType in #/lib/game/types):
 * Act → Battle.UseSkill (start of one skill execution); Damage / Heal → applySkill (skill,
 * value, hpBefore / hpAfter); Debuff / poison-apply → statusChanges (skill); MagicCircle →
 * Battle.UseSkill (skill only; the display derives the amount from the definition); Summon →
 * applySummon (target = def no, value = level); per-turn Poison → Battle.Action (value plus
 * before/after HP, no skill → general event); Death → Battle.UseSkill (no skill → general).
 *
 * 技能定義刻意選在 fixture 內：一來「一個技能不一定只有一種效果」的複合效果技能（傷害＋施毒＋減益、
 * 治療＋解毒）不存在於 seed-data，二來召喚技能也沒有 seed 筆，引擎的分派邏輯與資料來源各自獨立。
 * The skill definitions live in the fixture on purpose: the multi-effect skills (damage + poison +
 * debuff, heal + cure) and the summon skill are not in seed-data, so the engine's dispatch logic and
 * the data source stay independent of each other.
 */
import { runEventEngine } from '#/lib/game/battle/event-engine';
import type { IBattleEventRecord } from '#/lib/game/battle/event-engine';
import {
  EnumBattleEventType,
  EnumSkillDamageType,
  EnumTargetMethod,
  EnumTargetType,
} from '#/lib/game/types';
import type { IBattleEvent, ISkillDef } from '#/lib/game/types';

/** 複合效果技能：傷害＋施毒＋減益 / Multi-effect skill: damage + poison + debuff */
const plagueHex: ISkillDef = {
  no: 1210,
  name: 'PlagueHex',
  sp: 20,
  type: EnumSkillDamageType.Magic,
  target: [EnumTargetType.Enemy, EnumTargetMethod.Individual, 1],
  pow: 120,
  poison: 70,
  DownSTR: 15,
};

/** 治療技能：回復＋解毒（毒系統被偵測到，但施毒/毒傷紀錄不會出現）/ Heal skill: recovery + cure */
const purify: ISkillDef = {
  no: 3110,
  name: 'Purify',
  sp: 8,
  type: EnumSkillDamageType.Physical,
  target: [EnumTargetType.Friend, EnumTargetMethod.Individual, 1],
  pow: 200,
  support: 1,
  CurePoison: 1,
  SpRegen: 5,
};

/** 召喚技能：回復＋魔方陣＋召喚（魔方陣先行，召喚物再入場）/ Summon skill: heal + magic circle + summon */
const summonSlime: ISkillDef = {
  no: 2500,
  name: 'SummonSlime',
  sp: 30,
  type: EnumSkillDamageType.Physical,
  target: [EnumTargetType.Self, EnumTargetMethod.Individual, 1],
  pow: 100,
  support: 1,
  MagicCircleAdd: 1,
  summon: 1002,
};

const skillDefs = new Map<number, ISkillDef>([
  [plagueHex.no, plagueHex],
  [purify.no, purify],
  [summonSlime.no, summonSlime],
]);

/** 引擎的技能定義查詢（同 IDataRepository.getSkill）/ The engine's skill lookup (same as IDataRepository.getSkill) */
const getSkill = (no: number): ISkillDef | undefined => skillDefs.get(no);

/**
 * 單位對照：事件的 actor／target 為 def no 時的顯示名稱
 * Unit names: display names for events whose actor / target is a def no
 */
export const dispatchUnitNames: Record<string, string> = {
  '1002': 'Slime',
};

/**
 * 一、複合效果技能事件：同一個技能的多種效果各自分派到不同系統，中間夾一筆一般事件
 * 1. Multi-effect skill events: one skill's several effects dispatch to different systems, with a
 * general event in between
 */
const skillUseEvents: IBattleEvent[] = [
  { type: EnumBattleEventType.Act, actor: 'Mage', skill: plagueHex.no },
  {
    type: EnumBattleEventType.Damage,
    actor: 'Mage',
    target: 'GoblinAxe',
    skill: plagueHex.no,
    value: 96,
    hpBefore: 140,
    hpAfter: 44,
  },
  { type: EnumBattleEventType.Debuff, actor: 'Mage', target: 'GoblinAxe', skill: plagueHex.no },
  { type: EnumBattleEventType.Poison, actor: 'Mage', target: 'GoblinAxe', skill: plagueHex.no },
  // 每回合毒傷：屬一般事件，夾在技能執行中間也不會切開它
  // Per-turn poison damage: a general event that must not split the execution even when interleaved
  { type: EnumBattleEventType.Poison, target: 'Warrior', value: 31, hpBefore: 240, hpAfter: 209 },
  { type: EnumBattleEventType.Act, actor: 'Priest', skill: purify.no },
  {
    type: EnumBattleEventType.Heal,
    actor: 'Priest',
    target: 'Warrior',
    skill: purify.no,
    value: 120,
    hpBefore: 180,
    hpAfter: 300,
  },
];

/** 複合效果技能的分派結果 / Dispatch output of the multi-effect skill uses */
export const multiEffectRecords: IBattleEventRecord[] = runEventEngine(skillUseEvents, { getSkill });

/**
 * 二、召喚技能事件：召喚系統處理後衍生入場事件（不進 Battle.log）
 * 2. Summon skill event: the summon system derives an entry follow-up (never written to Battle.log)
 */
const summonUseEvents: IBattleEvent[] = [
  { type: EnumBattleEventType.Cast, actor: 'Priest', skill: summonSlime.no },
  { type: EnumBattleEventType.Act, actor: 'Priest', skill: summonSlime.no },
  {
    type: EnumBattleEventType.Heal,
    actor: 'Priest',
    target: 'Priest',
    skill: summonSlime.no,
    value: 0,
    hpBefore: 300,
    hpAfter: 300,
  },
  { type: EnumBattleEventType.MagicCircle, actor: 'Priest', skill: summonSlime.no },
  {
    type: EnumBattleEventType.Summon,
    actor: 'Priest',
    target: '1002',
    value: 1,
    skill: summonSlime.no,
  },
];

/** 召喚與入場的分派結果 / Dispatch output of the summon and entry */
export const summonEntryRecords: IBattleEventRecord[] = runEventEngine(summonUseEvents, {
  getSkill,
});

/**
 * 三、混合日誌：技能事件、一般事件（死亡／毒傷）交錯，兩類共同涵蓋整段日誌
 * 3. Mixed log: skill events interleaved with general events (death / poison damage); the two
 * classes together cover the whole log
 */
const mixedEvents: IBattleEvent[] = [
  ...skillUseEvents,
  { type: EnumBattleEventType.Death, target: 'GoblinAxe' },
  { type: EnumBattleEventType.Act, actor: 'Warrior', skill: 1000 },
  {
    type: EnumBattleEventType.Damage,
    actor: 'Warrior',
    target: 'GoblinClub',
    skill: 1000,
    value: 78,
    hpBefore: 78,
    hpAfter: 0,
  },
  { type: EnumBattleEventType.Death, target: 'GoblinClub' },
];

/** 混合日誌的分派結果（技能 1000 不在 fixture 技能表 → effects 為空，分派照常）/ Dispatch output of the mixed log (skill 1000 is not in the fixture table: `effects` stays empty while dispatch still works) */
export const mixedLogRecords: IBattleEventRecord[] = runEventEngine(mixedEvents, { getSkill });
