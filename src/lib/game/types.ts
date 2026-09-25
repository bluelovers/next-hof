// 共用型別定義 / Shared type definitions
// 欄位對應 docs/data/{char,job,skill,item,mon}.md 分析的 YAML 結構。

import { EnumState, EnumPosition, EnumTeamSide } from './constants';
import type { ICompField, IStatusAttr } from './character/status-attrs';
import type { ICorpsePolicy, ICorpsePolicyField } from './battle/corpse-policy';

/**
 * 角色類型 / Character type
 * 列舉 / enumeration
 *
 * 以 Set<EnumCharType> 存於 Character.types，可同時持有複數類型：
 * Stored as Set<EnumCharType> on Character.types; a unit may hold several types at once:
 * 召喚物 = Mon + Summon、工會怪 = Mon + Union（factory 以 add() 疊加）。
 * summon = Mon + Summon, union monster = Mon + Union (factory stacks them via add()).
 * 戰鬥統計（CountAlive 等）據此排除召喚物，勝負判定只計算真實角色。
 * Battle counters (CountAlive etc.) exclude summons based on this; only real chars decide victory.
 */
export enum EnumCharType {
	/** 玩家角色 / Player character */
	Char = 'char',
	/** 怪物 / Monster */
	Mon = 'mon',
	/** 召喚物（疊加於 Mon 之上）/ Summon (stacked on top of Mon) */
	Summon = 'summon',
	/** 工會怪（疊加於 Mon 之上）/ Union monster (stacked on top of Mon) */
	Union = 'union',
}

/**
 * 裝備欄位 / Equipment slot
 * 列舉 / enumeration
 *
 * 作為 Character.equip（Partial<Record>）的鍵；欄位可缺省＝該處未裝備。
 * Keys of Character.equip (Partial<Record>); a missing key means the slot is empty.
 * MainHand 與 OffHand 受雙手武器(dh)互斥規則約束（見 equip.ts setEquip）；
 * MainHand 裝備時會同步寫入 Character.WEAPON 供技能武器限制比對。
 * MainHand/OffHand are mutually exclusive under two-handed (dh) weapons (see equip.ts setEquip);
 * equipping MainHand also writes Character.WEAPON for skill weapon-limit checks.
 */
export enum EnumEquipSlot {
	/** 主手（武器）/ Main hand (weapon) */
	MainHand = 'main_hand',
	/** 副手（盾／左手劍）/ Off hand (shield / main-gauche) */
	OffHand = 'off_hand',
	/** 防具 / Armor */
	Armor = 'armor',
	/** 道具欄（消耗品）/ Item slot (consumables) */
	Item = 'item',
}

/**
 * 武器類型 / Weapon type
 * 列舉 / enumeration
 *
 * 同時是「武器分類」與「道具分類」的單一事實來源（值採 PascalCase，與 YAML 來源一致）：
 * Single source of truth for both weapon classes and item categories (PascalCase values, matching the YAML source):
 * - IItemDef.type 存放此值；IJobDef.equip 以此值做職業裝備白名單比對（equipAllowed）
 *   IItemDef.type stores this value; IJobDef.equip is whitelisted against it (equipAllowed)
 * - ISkillDef.limit 以 Partial<Record<EnumWeaponType, boolean>> 表達武器限制
 *   ISkillDef.limit expresses weapon restrictions as Partial<Record<EnumWeaponType, boolean>>
 * 非武器成員（Armor/Cloth/Robe/Item/Material/Other）供道具分類共用，勿視為可持握武器。
 * Non-weapon members (Armor/Cloth/Robe/Item/Material/Other) exist for item categories; they are not wieldable weapons.
 */
export enum EnumWeaponType {
	/** 劍（單手）/ Sword (one-handed) */
	Sword = 'Sword',
	/** 匕首 / Dagger */
	Dagger = 'Dagger',
	/** 長矛（Pike 類長柄）/ Pike */
	Pike = 'Pike',
	/** 手斧 / Hatchet */
	Hatchet = 'Hatchet',
	/** 魔杖 / Wand */
	Wand = 'Wand',
	/** 錘 / Mace */
	Mace = 'Mace',
	/** 雙手劍（通常搭配 dh=true）/ Two-handed sword (usually dh=true) */
	TwoHandSword = 'TwoHandSword',
	/** 槍 / Spear */
	Spear = 'Spear',
	/** 戰斧 / Axe */
	Axe = 'Axe',
	/** 法杖 / Staff */
	Staff = 'Staff',
	/** 弓 / Bow */
	Bow = 'Bow',
	/** 弩 / Crossbow */
	CrossBow = 'CrossBow',
	/** 鞭 / Whip */
	Whip = 'Whip',
	/** 盾（副手）/ Shield (off hand) */
	Shield = 'Shield',
	/** 左手劍（副手）/ Main-gauche (off hand) */
	MainGauche = 'MainGauche',
	/** 書（魔法書）/ Book */
	Book = 'Book',
	/** 鎧甲 / Armor */
	Armor = 'Armor',
	/** 布甲 / Cloth */
	Cloth = 'Cloth',
	/** 法袍 / Robe */
	Robe = 'Robe',
	/** 道具 / Item */
	Item = 'Item',
	/** 素材 / Material */
	Material = 'Material',
	/** 其他 / Other */
	Other = 'Other',
}

/**
 * 防禦種類 / Guard kind
 * 列舉 / enumeration
 *
 * 決定前排守護者「何時替後排擋傷」（由 guard.ts guardActive() 逐次判定）：
 * Decides when a front-row guardian intercepts damage for the back row (re-evaluated per hit by guard.ts guardActive()):
 * - LifeNN：守護者自身 HP% <= NN 時生效（血量越低越常守）
 *   LifeNN: active while the guardian's own HP% <= N (guards more as HP drops)
 * - ProbNN：每次攻擊獨立擲骰 NN% 機率生效（需具備 rng，否則視為不發動）
 *   ProbNN: rolls an independent NN% chance per attack (requires rng; treated as inactive without it)
 * - Always/Never：恆真／恆假；behavior.guard 省略時預設 Always
 *   Always/Never: always true / always false; defaults to Always when behavior.guard is absent
 */
export enum EnumGuardKind {
	/** 恆常發動 / Always active */
	Always = 'always',
	/** HP ≤ 25% 時發動 / Active while HP ≤ 25% */
	Life25 = 'life25',
	/** HP ≤ 50% 時發動 / Active while HP ≤ 50% */
	Life50 = 'life50',
	/** HP ≤ 75% 時發動 / Active while HP ≤ 75% */
	Life75 = 'life75',
	/** 25% 機率發動 / 25% chance to activate */
	Prob25 = 'prob25',
	/** 50% 機率發動 / 50% chance to activate */
	Prob50 = 'prob50',
	/** 75% 機率發動 / 75% chance to activate */
	Prob75 = 'prob75',
	/** 從不發動 / Never active */
	Never = 'never',
}

/**
 * 守護種類對應的機率值 / Guard kind probability values
 * 單一事實來源：Guard 機率百分比集中定義於此，杜絕 guard.ts 中的硬編碼數字。
 * Single source of truth: guard probability percentages centralized here, eliminating hardcoded numbers in guard.ts.
 * 僅 Prob25/Prob50/Prob75 有數值含義，Life 系列為 HP% 閾值，Always/Never 為恆真/恆假。
 */
export const GUARD_KIND_PROBABILITY: Record<EnumGuardKind, number | null> = {
	[EnumGuardKind.Always]: null,
	[EnumGuardKind.Never]: 0,
	[EnumGuardKind.Life25]: null,
	[EnumGuardKind.Life50]: null,
	[EnumGuardKind.Life75]: null,
	[EnumGuardKind.Prob25]: 25,
	[EnumGuardKind.Prob50]: 50,
	[EnumGuardKind.Prob75]: 75,
} as const;

/**
 * 守護種類對應的 HP% 閾值 / Guard kind HP% thresholds
 * 單一事實來源：Life 系列守護的 HP% 門檻集中定義於此，杜絕 guard.ts 中的硬編碼數字。
 * Single source of truth: Life-series guard HP% thresholds centralized here, eliminating hardcoded numbers in guard.ts.
 */
export const GUARD_KIND_HP_THRESHOLD: Record<EnumGuardKind, number | null> = {
	[EnumGuardKind.Always]: null,
	[EnumGuardKind.Never]: null,
	[EnumGuardKind.Life25]: 25,
	[EnumGuardKind.Life50]: 50,
	[EnumGuardKind.Life75]: 75,
	[EnumGuardKind.Prob25]: null,
	[EnumGuardKind.Prob50]: null,
	[EnumGuardKind.Prob75]: null,
} as const;

/**
 * 模式項目 / Pattern item
 * 介面 / interface
 *
 * AI 行為規則列：buildPattern() 組裝（逃跑／特殊前置 + 角色自身 + 預設收尾），
 * AI behavior rule row: assembled by buildPattern() (flee/special prelude + own rules + default tail),
 * 再由 MultiFactJudge() 依序檢查——第一個 judge 成立且通過 quantity 回合門檻者，
 * then checked in order by MultiFactJudge() — the first row whose judge passes and whose
 * quantity turn gate is met yields its action.
 * 其 action 即本回合要施放的技能編號（1000 為預設攻擊）。
 */
export interface IPatternItem {
	/** 判定碼（交由 judge.ts DecideJudge 評估）/ judge code (evaluated by judge.ts DecideJudge) */
	judge: number;
	/** 回合門檻：0＝恆可觸發，否則需 battle.turn >= quantity / turn gate: 0 = always eligible, else requires battle.turn >= quantity */
	quantity: number;
	/** 動作碼＝技能編號（1000 為預設攻擊）/ action code = skill number (1000 is the default attack) */
	action: number;
}

/**
 * 行為定義 / Behavior definition
 * 介面 / interface
 *
 * 角色／職業的 AI 行為設定（ICharDef.behavior 與 IJobDef.pattern 皆使用本型別）。
 * AI behavior settings for chars/jobs (used by both ICharDef.behavior and IJobDef.pattern).
 */
export interface IBehavior {
	/** 預期站位（資料層保留；開戰時 setBattleVariable 以隨機決定 POSITION）/ intended position (data-layer; setBattleVariable randomizes POSITION at battle start) */
	position?: EnumPosition;
	/** 前排守護條件；省略時視為 EnumGuardKind.Always / front-row guard condition; omitted = EnumGuardKind.Always */
	guard?: EnumGuardKind;
	/** AI 行動規則列；省略時 buildPattern() 只含前置與預設收尾 / AI action rules; when absent, buildPattern() keeps only the prelude and default tail */
	pattern?: IPatternItem[];
}

/**
 * 技能目標類型 / Skill target type
 * 列舉 / enumeration
 *
 * 決定「以誰為中心」選取目標（ITargetSpec 第 1 元，Battle.selectTargets 據此分支）：
 * Determines the camp used as the selection center (ITargetSpec element 1; branches in Battle.selectTargets):
 * - Enemy／Friend：敵隊／己隊（含召喚物在內的隊伍成員）
 *   Enemy / Friend: members of the enemy / friendly team (summons included)
 * - All：不分敵我的全體存活者；Self：僅施法者自己（忽略選取方式）
 * - All: all living units on both sides; Self: the caster only (method ignored)
 */
export enum EnumTargetType {
	/** 敵隊 / Enemy team */
	Enemy = 'enemy',
	/** 己隊 / Friendly team */
	Friend = 'friend',
	/** 全場（敵我不分）/ Entire field (both teams) */
	All = 'all',
	/** 自身 / Self only */
	Self = 'self',
}

/**
 * 技能目標方式 / Skill target method
 * 列舉 / enumeration
 *
 * 決定「在該陣營內取幾個」（ITargetSpec 第 2 元）：
 * Determines how many targets are taken within the chosen camp (ITargetSpec element 2):
 * - Individual：隨機 1 名；Multi：隨機抽 count 名（有放回，可能重複）
 *   Individual: 1 random pick; Multi: count random picks (with replacement, duplicates possible)
 * - All：全體存活者（第 3 元 count 被忽略）
 *   All: every living member (the 3rd element count is ignored)
 */
export enum EnumTargetMethod {
	/** 單體（隨機 1 名）/ Single target (1 random pick) */
	Individual = 'individual',
	/** 多體（隨機抽 count 名，有放回）/ Multiple targets (count random picks, with replacement) */
	Multi = 'multi',
	/** 全體存活者（忽略 count）/ All living members (count ignored) */
	All = 'all',
}

/**
 * 技能目標規格 / Skill target specification
 * 型別別名 / type alias
 *
 * 三元組 [目標類型, 選取方式, 數量]，直接對應 YAML skill.target 欄位；
 * Tuple [target type, selection method, count], mapping directly to the YAML skill.target field;
 * 數量僅在 Multi 時有意義；技能省略 target 時預設 [Enemy, Individual, 1]。
 * count matters only for Multi; a skill without target defaults to [Enemy, Individual, 1].
 */
export type ITargetSpec = [
	/** 目標類型（陣營中心）/ target type (selection-center camp) */
	type: EnumTargetType,
	/** 選取方式 / selection method */
	method: EnumTargetMethod,
	/** 數量（僅 Multi 有意義）/ count (meaningful only for Multi) */
	count: number,
];

/**
 * 狀態屬性 / Status attribute
 * 型別別名 / type alias
 */
export type { IStatusAttr } from './character/status-attrs';

/**
 * 補正欄位型別（P_* / M_*，單一事實來源由 COMP_FIELDS 衍生）/ Compensation bonus type
 * 型別別名 / type alias
 *
 * Partial 表示技能／道具只需宣告實際擁有的補正欄位；
 * Partial means skills/items only declare the compensation fields they actually have;
 * ISkillDef 與 IItemDef 皆 extends 本型別，使被動(passive)與裝備加總可共用同一組鍵。
 * both ISkillDef and IItemDef extend this type so passive and equipment bonuses share one key set.
 */
export type ICompBonuses = Partial<Record<ICompField, number>>;

/**
 * 特殊能力定義 / Special ability definition
 * 介面 / interface
 *
 * Character.SPECIAL 的結構；純數值欄位可經 getSpecial/addSpecial 以字串鍵存取。
 * Shape of Character.SPECIAL; numeric fields are also reachable by string key via getSpecial/addSpecial.
 */
export interface ISpecial {
	/** 中毒抗性 %（getPoison 據此折減施毒機率）/ poison resistance % (getPoison reduces the chance by this) */
	PoisonResist: number;
	/** 回復加成（被動技能累加；目前僅儲存，傷害公式尚未讀取）/ heal bonus (accumulated by passives; stored only, not yet read by the heal formula) */
	HealBonus: number;
	/** 絕對防禦次數：>0 時消耗一次並使該次傷害歸 0（pierce 可穿透）/ absolute guard charges: consumes one to nullify a hit (pierced by pierce) */
	Barrier: number;
	/**
	 * 貫穿值（索引同 EnumAtkSlot：0=物理、1=魔法；pierce 技能加算至傷害）
	 * pierce damage (indices follow EnumAtkSlot: 0 = physical, 1 = magic; added when skill.pierce is set)
	 */
	Pierce: [phys: number, mag: number];
	/** 召喚加成（裝備 P_SUMMON 累加）/ summon bonus (accumulated from equipment P_SUMMON) */
	Summon: number;
	/** 不死系標記 / undead flag */
	Undead: number;
	/** 每回合 HP 回復 %（autoRegeneration 於行動前套用）/ per-turn HP regen % (applied by autoRegeneration before acting) */
	HpRegen: number;
	/** 每回合 SP 回復 %（autoRegeneration 於行動前套用）/ per-turn SP regen % (applied by autoRegeneration before acting) */
	SpRegen: number;
}

/**
 * 技能影響能力（參照基礎六維）/ Skill influencing stat
 * 列舉 / enumeration
 *
 * 決定傷害公式採用的主要能力（effect.ts calcBasicDamage）：
 * Selects the primary stat used by the damage formula (effect.ts calcBasicDamage):
 * - 省略（undefined）或 Str：物理用 STR、魔法用 INT（預設路徑）
 *   omitted (undefined) or Str: physical uses STR, magic uses INT (default path)
 * - Dex：無論物理／魔法一律改用 DEX
 *   Dex: always uses DEX regardless of physical/magic
 */
export enum EnumInfluence {
	/** 以 DEX 計算傷害 / compute damage from DEX */
	Dex = 'dex',
	/** 預設路徑：物理 STR／魔法 INT / default path: physical STR / magic INT */
	Str = 'str',
}

/**
 * 技能優先條件 / Skill priority condition
 * 列舉 / enumeration
 *
 * AI 目標選擇的優先判斷（供 judge/pattern 層參考）：
 * Priority hints for AI target selection (consumed by the judge/pattern layer):
 * - LowHpRate：優先低 HP 比率目標；Dead：目標已死亡（蘇生類技能）
 *   LowHpRate: prefer low-HP targets; Dead: target is dead (revive-type skills)
 * - Summon：優先召喚物；Charge：目標正在詠唱；Back：背擊（優先後排）
 *   Summon: prefer summons; Charge: target is casting; Back: back attack (prefer the back row)
 */
export enum EnumSkillPriority {
	/** 低 HP 比率優先 / prefer low HP rate */
	LowHpRate = 'LowHpRate',
	/** 已死亡目標優先（蘇生）/ prefer dead targets (revive) */
	Dead = 'Dead',
	/** 召喚物優先 / prefer summons */
	Summon = 'Summon',
	/** 詠唱中目標優先 / prefer casting targets */
	Charge = 'Charge',
	/** 背擊（後排優先）/ back attack (prefer back row) */
	Back = 'Back',
}

/**
 * 技能傷害類型 / Skill damage type
 * 列舉 / enumeration
 *
 * Physical＝0（物理：STR／物理 atk 槽）、Magic＝1（魔法：INT／魔法 atk 槽）；
 * 成員值與 YAML 來源一致。
 * Physical = 0 (physical: STR / physical atk slot), Magic = 1 (magic: INT / magic atk slot);
 * member values match the YAML source.
 *
 * calcBasicDamage 據此選擇能力與 atk/def 的物理／魔法索引；
 * showcase battle-adapter 據此決定蓄力文案（Physical→charging、Magic→casting）。
 * calcBasicDamage picks the stat and the physical/magic atk/def slots from this value;
 * the showcase battle-adapter picks the charge wording (Physical → charging, Magic → casting).
 */
export enum EnumSkillDamageType {
	/** 物理（YAML 值 0）/ physical (YAML value 0) */
	Physical = 0,
	/** 魔法（YAML 值 1）/ magic (YAML value 1) */
	Magic = 1,
}

/**
 * 技能 Up* 臨時增益欄位 / Skill Up* temporary buff fields
 * 型別別名 / type alias
 *
 * 由 IStatusAttr 衍生（`Up${IStatusAttr}`，共 11 鍵），鍵名對應 status-key.ts 的
 * STATUS_UP_KEY_NAME 與 status-attrs.ts 的 UPMAP；新增狀態屬性時本型別自動跟隨，
 * 無需在 ISkillDef 重複宣告欄位（SSoT／型別追溯）。
 * Derived from IStatusAttr (`Up${IStatusAttr}`, 11 keys) mirroring STATUS_UP_KEY_NAME / UPMAP:
 * adding a status attribute updates this type automatically — no hand-maintained copy inside
 * ISkillDef (SSoT / type traceability).
 *
 * statusChanges 命中 UPMAP 鍵時，以 % 作用於「目標」（對齊原始 StatusChanges 全部作用在 $target）。
 * When statusChanges hits a UPMAP key, the % value is applied to the *target* (mirrors original StatusChanges applying everything to $target).
 */
export type ISkillUpFields = Partial<Record<`Up${IStatusAttr}`, number>>;

/**
 * 技能 Down* 臨時減益欄位 / Skill Down* temporary debuff fields
 * 型別別名 / type alias
 *
 * 由 IStatusAttr 衍生（`Down${IStatusAttr}`，共 11 鍵），鍵名對應 status-key.ts 的
 * STATUS_DOWN_KEY_NAME 與 status-attrs.ts 的 DOWNMAP（SSoT／型別追溯）。
 * Derived from IStatusAttr (`Down${IStatusAttr}`, 11 keys) mirroring STATUS_DOWN_KEY_NAME /
 * DOWNMAP (SSoT / type traceability).
 *
 * statusChanges 命中 DOWNMAP 鍵時，以 % 作用於「目標」。
 * When statusChanges hits a DOWNMAP key, the % value is applied to the *target*.
 */
export type ISkillDownFields = Partial<Record<`Down${IStatusAttr}`, number>>;

/**
 * 技能定義 / Skill definition
 * 介面 / interface
 *
 * 對應 YAML skill 資料結構；extends ICompBonuses 共用 P_* / M_* 補正欄位，
 * 並 extends ISkillUpFields／ISkillDownFields 衍生 Up* / Down* 能力變化欄位。
 * Mirrors the YAML skill data structure; extends ICompBonuses to share P_* / M_* bonus fields,
 * and extends ISkillUpFields / ISkillDownFields for the derived Up* / Down* status-change fields.
 *
 * 欄位消費狀態（本 repo）/ Field consumption status (this repo):
 * - 戰鬥引擎實際讀取：sp, type, target, pow, inf, charge, support, invalid,
 *   passive, poison, poisonResist, CurePoison, HpRegen, SpRegen, HealBonus, pierce,
 *   knockback, move, umove, sacrifice,
 *   Up* 與 Down* 與 Plus* 系列
 *   actually read by the battle engine: sp, type, target, pow, inf, charge, support,
 *   invalid, passive, poison, poisonResist, CurePoison, HpRegen, SpRegen, HealBonus, pierce,
 *   knockback, move, umove, sacrifice, and the Up*, Down*, Plus* families
 * - hit 目前引擎未讀取（資料層保留）
 *   hit is not read by the engine (kept for the data layer)
 * - 其餘欄位（delay, stiff, quick, limit, summon,
 *   revive, SpRecoveryRate, MagicCircle*, priority, learn, exp, img）目前僅供資料層保留
 *   remaining fields are currently kept in the data layer only
 */
export interface ISkillDef extends ICompBonuses, ISkillUpFields, ISkillDownFields {
	/** 技能編號（repository 的索引鍵）/ skill number (repository index key) */
	no: number;
	/** 技能名稱 / skill name */
	name: string;
	/** 圖示資源路徑 / icon asset path */
	img?: string;
	/** 技能說明文字（PHP exp；UI 顯示為 effect）/ description text (PHP exp; shown as effect in UI) */
	exp?: string;
	/** SP 消耗；怪物施放時以 ×0.7 折扣檢查（Battle.UseSkill）/ SP cost; monsters pay ×0.7 when checked (Battle.UseSkill) */
	sp: number;
	/**
	 * 技能傷害類型：Physical＝0（物理）、Magic＝1（魔法）
	 * skill damage type: Physical = 0 (physical), Magic = 1 (magic)
	 *
	 * calcBasicDamage 據此選擇 STR/INT 與 atk/def 的物理／魔法索引。
	 * calcBasicDamage uses this to pick STR/INT and the physical/magic atk/def slots.
	 */
	type: EnumSkillDamageType;
	/** 習得所需技能點（0＝初期即持有）/ skill points to learn (0 = known from the start) */
	learn?: number;
	/** 目標規格 [類型, 方式, 數量]；省略時預設 [Enemy, Individual, 1] / target spec [type, method, count]; defaults to [Enemy, Individual, 1] */
	target?: ITargetSpec;
	/** 威力倍率 %（支援技能時視為回復倍率）/ power % (interpreted as heal ratio for support skills) */
	pow?: number;
	/** 命中率（目前僅資料層保留，引擎未讀取）/ hit rate (data-layer only; not read by the engine) */
	hit?: number;
	/**
	 * 防禦貫穿（前衛守護無效）
	 * guard bypass (front-row guardian does not intercept)
	 *
	 * 為真時跳過 Defending 攔截，且不被 Barrier 抵消。
	 * When truthy, skips Defending interception and bypasses Barrier.
	 */
	invalid?: number;
	/**
	 * 支援魔法（pow 視為回復倍率）
	 * support magic (pow is treated as the heal ratio)
	 *
	 * 為真時走 calcRecoveryValue 回復路線，且不觸發守護。
	 * When truthy, routes through calcRecoveryValue instead of damage and never triggers guard.
	 */
	support?: number;
	/** AI 目標優先條件（目前僅資料層保留）/ AI target priority hint (data-layer only) */
	priority?: EnumSkillPriority;
	/**
	 * 詠唱/蓄力 [詠唱時間, 硬直]
	 * charge [cast time, recovery/stiffness]
	 *
	 * 只要存在本欄位（陣列恆為真），首回合即設定 expect 進入詠唱、次回合才施放；
	 * merely having this field (an array is always truthy) makes the first turn set expect
	 * (charging) and the skill fires on the second turn;
	 * 期間施放其他技能會被中斷（expect 不符即 return）。
	 * casting another skill during the charge is rejected (mismatched expect returns early).
	 */
	charge?: [castTime: number, stiff: number];
	/**
	 * 行動後硬直 %（目前僅資料層保留，引擎未讀取）/ post-action stiff % (data-layer only; not read by the engine)
	 */
	stiff?: number;
	/** 傷害參照能力（省略＝物理 STR／魔法 INT）/ influencing stat (omitted = physical STR / magic INT) */
	inf?: EnumInfluence;
	/** 回復加成（被動技能時由 passive.ts 累加至 SPECIAL.HealBonus）/ heal bonus (passive.ts accumulates it into SPECIAL.HealBonus for passive skills) */
	HealBonus?: number;
	/**
	 * 永久加算 Plus*（無 %）：作用於目標（對齊原始 StatusChanges 全部作用在 $target），僅 PLUSMAP 已註冊屬性生效。
	 * statusChanges 依鍵名前綴分派至 UPMAP/DOWNMAP/PLUSMAP，本欄位承載 PLUSMAP 分支。
	 * Permanent flat Plus* bonus (no %): applied to the target (mirrors original StatusChanges applying everything to $target); only PLUSMAP-registered stats take effect.
	 * statusChanges dispatches by key prefix to UPMAP/DOWNMAP/PLUSMAP; this field feeds the PLUSMAP branch.
	 *
	 * 有意保留顯式欄位而非由 IStatusAttr 衍生：PLUSMAP 只註冊六維＋MAXHP/MAXSP，
	 * 顯式列出可讓 PlusATK 等未註冊鍵在編譯期即被拒絕，避免「型別通過但執行期 no-op」的靜默失效。
	 * Deliberately explicit instead of derived from IStatusAttr: PLUSMAP registers only the six base
	 * stats plus MAXHP/MAXSP, so unregistered keys (PlusATK etc.) stay compile-time errors rather
	 * than accepted fields that silently no-op at runtime.
	 */
	PlusSTR?: number; PlusINT?: number; PlusDEX?: number; PlusSPD?: number; PlusLUK?: number;
	PlusMAXHP?: number; PlusMAXSP?: number;
	/** 為真時無視 target.def 百分比／定值減傷，並加算 SPECIAL.Pierce（且穿透 Barrier）/ when truthy, ignores target.def percent/flat reduction, adds SPECIAL.Pierce, and bypasses Barrier */
	pierce?: number;
	/** 行動延遲 %（目前僅資料層保留）/ action delay % (data-layer only) */
	delay?: number;
	/** 擊退率 %（引擎已讀取：statusChanges 將目標逼退至後排）/ knockback % (engine reads: statusChanges forces the target to the back row) */
	knockback?: number;
	/** 施毒機率 %（statusChanges 呼叫 getPoison）/ poison chance % (statusChanges calls getPoison) */
	poison?: number;
	/** 抗毒增益 %（statusChanges 呼叫 getPoisonResist，對應原始技能 1220 AntiPoisoning）/ poison-resist gain % (statusChanges calls getPoisonResist, mirrors skill 1220 AntiPoisoning) */
	poisonResist?: number;
	/** 召喚怪物編號或其陣列 / summon monster number or array of numbers */
	summon?: number | number[];
	/** 施放後自身移動方向（引擎已讀取：statusChanges 將目標移至指定站位）/ self movement direction after casting (engine reads: statusChanges moves the target to the specified row) */
	move?: EnumPosition;
	/** 可使用之武器型別限制（Partial 鍵集合，目前僅資料層保留）/ allowed weapon-type restriction (partial key set; data-layer only) */
	limit?: Partial<Record<EnumWeaponType, boolean>>;
	/** 使用後移動方向（引擎已讀取：Battle.UseSkill 使用後將使用者移至指定站位）/ post-use movement direction (engine reads: Battle.UseSkill moves the user after casting) */
	umove?: EnumPosition;
	/** 為真時視為被動技能，由 passive.ts 在戰鬥初始化時累加補正 / truthy = passive skill; passive.ts accumulates its bonuses at battle setup */
	passive?: number;
	/** 快速行動標記（目前僅資料層保留）/ quick-action flag (data-layer only) */
	quick?: number;
	/** 犧牲比例 %（消耗自身 HP；引擎已讀取：Battle.UseSkill 施法前犧牲使用者 HP）/ sacrifice % (costs own HP; engine reads: Battle.UseSkill sacrifices user HP before casting) */
	sacrifice?: number;
	/**
	 * 解毒標記 / cure-poison flag
	 *
	 * 現行條件：CurePoison 為真且目標「非」中毒時才呼叫 getNormal（與解毒語意相反，屬既有實作）。
	 * Current condition: getNormal is called only when CurePoison is set and the target is NOT poisoned (opposite of cure semantics; as implemented).
	 */
	CurePoison?: number;
	/** 疊加至目標 SPECIAL.HpRegen 的回復 % / regen % accumulated into the target's SPECIAL.HpRegen */
	HpRegen?: number;
	/** 疊加至目標 SPECIAL.SpRegen 的回復 % / regen % accumulated into the target's SPECIAL.SpRegen */
	SpRegen?: number;
	/** SP 回復倍率（目前僅資料層保留）/ SP recovery rate multiplier (data-layer only) */
	SpRecoveryRate?: number;
	/** 增加己方魔方陣數（目前僅資料層保留）/ add to own team's magic circles (data-layer only) */
	MagicCircleAdd?: number;
	/** 消除己方魔方陣數（目前僅資料層保留）/ remove own team's magic circles (data-layer only) */
	MagicCircleDelete?: number;
	/** 消耗己方魔方陣數（目前僅資料層保留）/ consume own team's magic circles (data-layer only) */
	MagicCircleDeleteTeam?: number;
	/** 消除敵方魔方陣數（目前僅資料層保留）/ remove enemy magic circles (data-layer only) */
	MagicCircleDeleteEnemy?: number;
	/** 蘇生技能標記（目前僅資料層使用）/ revive skill flag (data layer only) */
	revive?: number;
}

/**
 * 道具類別細分 / Item sub-category
 * 列舉 / enumeration
 *
 * 對應 YAML item.type2 的有限集合（成員值與 YAML 來源一致，全大寫）：
 * Mirrors the closed set of YAML item.type2 values (member values match the YAML source, uppercase):
 * Weapon=WEAPON、Armor=ARMOR、Item=ITEM、Material=MATERIAL、Other=OTHER。
 *
 * 作為 IItemDef.type2 的型別；Item.ts 的 ITEM_TYPE_DEFAULT 指向 Item 成員作為預設值。
 * Type of IItemDef.type2; Item.ts's ITEM_TYPE_DEFAULT points at the Item member as the default.
 */
export enum EnumItemCategory {
	/** 武器 / Weapon */
	Weapon = 'WEAPON',
	/** 防具 / Armor */
	Armor = 'ARMOR',
	/** 道具 / Item */
	Item = 'ITEM',
	/** 素材 / Material */
	Material = 'MATERIAL',
	/** 其他 / Other */
	Other = 'OTHER',
}

/**
 * 道具定義 / Item definition
 * 介面 / interface
 */
export interface IItemDef extends ICompBonuses {
	/** 道具編號（repository 索引鍵）/ item number (repository index key) */
	no: number;
	/** 道具名稱 / item name */
	name: string;
	/** 武器／裝備型別（同時決定可裝備欄位）/ weapon/equipment type (also decides the equip slot) */
	type: EnumWeaponType;
	/** 類別細分（Weapon/Armor/Item/Material/Other，見 EnumItemCategory）/ sub-category (see EnumItemCategory) */
	type2?: EnumItemCategory;
	/** 圖示資源路徑 / icon asset path */
	img?: string;
	/** 購入價格（金幣）/ buy price (gold) */
	buy?: number;
	/** 賣出價格（金幣）/ sell price (gold) */
	sell?: number;
	/** 攻擊力（索引同 EnumAtkSlot：0=物理、1=魔法）/ attack power (indices follow EnumAtkSlot: 0 = physical, 1 = magic) */
	atk?: [phys: number, mag: number];
	/** 減傷四槽（索引同 EnumDefSlot：物理%減、物理定值減、魔法%減、魔法定值減）/ four reduction slots (indices follow EnumDefSlot: physical %, physical flat, magic %, magic flat) */
	def?: [physPct: number, physFlat: number, magPct: number, magFlat: number];
	/** 雙手武器（佔用手部＋副手）/ two-handed weapon (occupies both hand slots) */
	dh?: boolean;
	/** 裝備負荷（參與 Delay 系統運算）/ equipment weight (feeds the delay calculation) */
	handle?: number;
	/** 習得條件 { 職業編號: 等級 } / learn requirement { job number: level } */
	need?: Record<number, number>;
	/** 強化／進化後的基礎道具名 / base item name after refinement/evolution */
	base_name?: string;
	/** 附加的召喚效果值（SPECIAL.P_SUMMON）/ attached summon bonus (SPECIAL.P_SUMMON) */
	P_SUMMON?: number;
	/** 附加的貫穿效果值（SPECIAL.P_PIERCE）/ attached pierce bonus (SPECIAL.P_PIERCE) */
	P_PIERCE?: number;
}

/**
 * 性別 / Gender
 * 列舉 / enumeration
 *
 * 作為 IJobDef.gender 的鍵（Partial<Record>）：0＝男性、1＝女性。
 * Keys of IJobDef.gender (Partial<Record>): 0 = male, 1 = female.
 */
export enum EnumGender {
	/** 男性（值 0）/ male (value 0) */
	Male = 0,
	/** 女性（值 1）/ female (value 1) */
	Female = 1,
}

/**
 * 性別專屬的名稱與圖示覆寫 / Gender-specific name & icon overrides
 * 介面 / interface
 */
export interface IGenderOverride {
	/** 圖示路徑（覆寫職業預設 img）/ icon path (overrides the job default img) */
	img?: string;
	/** 性別專屬職業名稱（覆寫 job_name）/ gender-specific job name (overrides job_name) */
	job_name?: string;
}

/**
 * 職業定義 / Job definition
 * 介面 / interface
 */
export interface IJobDef {
	/** 職業編號（資料來源可能為字串）/ job number (may arrive as a string in raw data) */
	no: number | string;
	/** 職業名稱 / job name */
	job_name?: string;
	/** 可裝備的武器／裝備型別 / equippable weapon/armor types */
	equip?: EnumWeaponType[];
	/** 成長係數（maxhp/maxsp 及其餘六維的成長率）/ growth coefficients (maxhp/maxsp and the six primary stats) */
	coe?: { maxhp?: number; maxsp?: number; [k: string]: number | undefined };
	/** 戰鬥行為樣式；null＝無 AI 模式 / battle behavior pattern; null = no AI pattern */
	pattern?: IBehavior | null;
	/** 職業圖示路徑 / job icon path */
	img?: string;
	/** 依性別（EnumGender）區分的名稱與圖示 / per-gender (EnumGender) name and icon overrides */
	gender?: Partial<Record<EnumGender, IGenderOverride>>;
	/** 職業說明資訊 / job description info */
	info?: { desc?: string };
	/** 職業階級（數字越小越高階）/ job rank (lower = higher tier) */
	rank?: number;
}

/**
 * 怪物/召喚/工會獎勵 / Monster / summon / union reward
 * 介面 / interface
 */
export interface IMonReward {
	/** 金幣獎勵上限（moneyhold：超過此值不再累積）/ gold reward cap (gold stops accumulating past this) */
	moneyhold?: number;
	/** 經驗獎勵上限（exphold：超過此值不再累積）/ exp reward cap (exp stops accumulating past this) */
	exphold?: number;
	/** 掉落表 { 道具編號: 數量或權重 } / drop table { item number: amount or weight } */
	itemtable?: Record<number, number>;
}

/**
 * 戰鬥單位基礎定義（角色/怪物共用）/ Combatant base definition (shared by char & mon)
 * 介面 / interface
 */
export interface ICharCore extends ICorpsePolicyField {
	/** 單位編號 / unit number */
	no: number;
	/**
	 * 戰鬥單位實例唯一識別碼（資料提供者可指定；未提供時由 Character 自動產生）
	 * Battle-unit instance uid (a data provider may supply one; otherwise Character generates it).
	 *
	 * 與 `no`（物種／定義編號）不同：同一 `no` 可有多個個體（同名怪物），`unitUuid` 用來識別
	 * 「這一個」單位個體，召喚（新加入）、復活、型態變化等跨時間的追蹤都以此為準。
	 * 命名刻意帶上 `unit`，以免與 item／map 等其他實體的 id 混淆。
	 * Distinct from `no` (species / definition id): one `no` may have several individuals
	 * (same-name monsters). `unitUuid` identifies *this* unit individual and is the key for
	 * tracking it across summon (joining later), revive, and form changes. The `unit`
	 * prefix is deliberate so it cannot be mistaken for an item/map id.
	 */
	unitUuid?: string;
	/** 單位名稱 / unit name */
	name: string;
	/** 等級 / level */
	level: number;
	/** HP 上限 / max HP */
	maxhp: number;
	/** 目前 HP（省略時視為滿血）/ current HP (full HP when omitted) */
	hp?: number;
	/** SP 上限 / max SP */
	maxsp: number;
	/** 目前 SP（省略時視為滿 SP）/ current SP (full SP when omitted) */
	sp?: number;
	/** 力量（物理攻擊主因）/ strength (main physical-attack stat) */
	str: number;
	/** 智力（魔法攻擊主因）/ intelligence (main magic-attack stat) */
	int: number;
	/** 敏捷（命中／迴避相關）/ dexterity (hit/evasion related) */
	dex: number;
	/** 速度（行動順序與 Delay 距離）/ speed (action order and delay distance) */
	spd: number;
	/** 幸運 / luck */
	luk: number;
	/** 已習得技能編號列表 / learned skill numbers */
	skill?: number[];
	/** AI 行為樣式（怪物戰鬥決策用）/ AI behavior pattern (monster battle decisions) */
	behavior?: IBehavior;
}

/**
 * 角色定義 / Character definition
 * 介面 / interface
 */
export interface ICharDef extends ICharCore {
	/** 當前累積經驗 / accumulated exp */
	exp?: number;
	/** 職業編號 / job number */
	job?: number;
	/** 各欄位裝備的道具編號 / equipped item number per slot */
	equip?: Partial<Record<EnumEquipSlot, number>>;
	/** 擴充資料（非核心欄位原樣保留）/ extra data (non-core fields kept as-is) */
	data_ex?: Record<string, unknown>;
}

/**
 * 怪物定義 / Monster definition
 * 介面 / interface
 */
export interface IMonDef extends ICharCore {
	/** 掉落與獎勵設定（省略＝無獎勵）/ drop & reward settings (omitted = no reward) */
	reward?: IMonReward;
	/**
	 * 工會怪標記 / union-monster flag
	 *
	 * 目前僅資料層保留：引擎以 factory.newUnion() 疊加 EnumCharType.Union，尚未讀取本欄。
	 * Data-layer only: the engine stacks EnumCharType.Union via factory.newUnion() and does not read this field yet.
	 */
	isUnion?: boolean;
}

/**
 * 戰鬥事件類型 / Battle event type
 * 列舉 / enumeration
 * 實際被 push 的事件：Damage, Heal, Guard, Death, Cast（Battle.UseSkill / applySkill）。
 * Currently pushed events: Damage, Heal, Guard, Death, Cast (Battle.UseSkill / applySkill).
 * 其餘成員（Buff, Debuff, Poison, Charge, MagicCircle, Summon, Miss, Info）目前無生產點。
 * Remaining members (Buff, Debuff, Poison, Charge, MagicCircle, Summon, Miss, Info) have no producer yet.
 */
export enum EnumBattleEventType {
	/** 造成傷害 / damage dealt */
	Damage = 'damage',
	/** 回復 HP / HP heal */
	Heal = 'heal',
	/** 守護攔截（前衛替後衛擋傷）/ guard interception (front row shields back row) */
	Guard = 'guard',
	/**
	 * 增益（Up* 與 Plus* 能力變化）/ buff (Up* and Plus* stat change)
	 * 目前無生產點 / currently no producer
	 */
	Buff = 'buff',
	/**
	 * 減益（Down* 能力變化）/ debuff (Down* stat change)
	 * 目前無生產點 / currently no producer
	 */
	Debuff = 'debuff',
	/**
	 * 中毒狀態 / poison state
	 * 目前無生產點 / currently no producer
	 */
	Poison = 'poison',
	/** 死亡 / death */
	Death = 'death',
	/** 施放技能 / skill cast */
	Cast = 'cast',
	/** 實際行動（技能施放成功，非蓄力開始） / actual action (skill executed, not charge start) */
	Act = 'act',
	/**
	 * 詠唱／蓄力開始 / charge (cast time) started
	 * 目前無生產點 / currently no producer
	 */
	Charge = 'charge',
	/**
	 * 魔方陣增減 / magic circle change
	 * 目前無生產點 / currently no producer
	 */
	MagicCircle = 'magiccircle',
	/**
	 * 召喚 / summon
	 * 目前無生產點 / currently no producer
	 */
	Summon = 'summon',
	/**
	 * 未命中 / miss
	 * 目前無生產點（hit 未進引擎，無 Miss 判定）/ currently no producer (hit is not in the engine, so no Miss branch)
	 */
	Miss = 'miss',
	/**
	 * 一般資訊訊息 / informational message
	 * 目前無生產點 / currently no producer
	 */
	Info = 'info',
}

/**
 * 戰鬥事件 / Battle event
 * 介面 / interface
 */
export interface IBattleEvent {
	/** 事件類型 / battle event type */
	type: EnumBattleEventType;
	/** 行動者名稱 / actor name */
	actor?: string;
	/** 目標名稱 / target name */
	target?: string;
	/** 關聯技能編號 / related skill number */
	skill?: number;
	/** 數值（傷害量／回復量等）/ numeric value (damage/heal amount, etc.) */
	value?: number;
	/** 數值變化的前後 HP（Damage/Heal 時帶出 a > b 用）/ HP before/after for value-change display */
	hpBefore?: number;
	hpAfter?: number;
	/** 顯示文字（Info 等文字類事件）/ display text (for Info and other text events) */
	text?: string;
}

export type { EnumState };

/**
 * 單位共用核心欄位（共用組 1：識別碼＋名稱＋HP/SP）
 * Shared unit core fields (group 1: uid + name + HP/SP)
 *
 * 由引擎層 IBattleSnapshotUnit 與展示層 IBattleUnit／IBattleSnapshotDisplayUnit 共同繼承，
 * 這些完全同名同型的欄位只在這裡宣告一次（單一事實來源）。
 * 不相容的欄位不納入本組、仍由各層自行宣告——
 * 例如引擎的 team（EnumTeamSide）vs 顯示層的 side（EnumTeamSideUI）、
 * 引擎的 dead vs 顯示層的 status、level/no/expectSkill 等——
 * 因此不需要任何轉換函式，也不會因强行統一而改變既有行為。
 * Inherited by the engine's IBattleSnapshotUnit and the display's IBattleUnit /
 * IBattleSnapshotDisplayUnit, so these identically named, identically typed fields are
 * declared exactly once (single source of truth). Incompatible fields are deliberately
 * left declared on each layer — e.g. the engine's team (EnumTeamSide) vs the display's
 * side (EnumTeamSideUI), the engine's dead vs the display's status, level/no/expectSkill —
 * so no conversion function is needed and no existing behaviour changes.
 */
export interface IBattleUnitVitals {
	/**
	 * 戰鬥單位實例唯一識別碼（Character.unitUuid）
	 * Battle-unit instance uid (Character.unitUuid)
	 *
	 * 展示層用來關聯戰場精靈與快照單位（sprite.unitUuid ↔ snapshot unitUuid）；
	 * 引擎層 IBattleSnapshotUnit 將其收窄為必填（個體追蹤用）。
	 * The display layer links battlefield sprites and snapshot units
	 * (sprite.unitUuid ↔ snapshot unitUuid); the engine's IBattleSnapshotUnit narrows it
	 * to required (per-instance tracking).
	 */
	unitUuid?: string;
	/** 名稱 / name */
	name: string;
	/** 目前 HP / current HP */
	hp: number;
	/** HP 上限 / max HP */
	maxHp: number;
	/** 目前 SP / current SP */
	sp: number;
	/** SP 上限 / max SP */
	maxSp: number;
}

/**
 * 單位列表容器（共用組 2：units 欄位）
 * Unit list container (group 2: the `units` field)
 *
 * 由引擎層 IBattleSnapshot 與展示層 IBattleTeam／IBattleSnapshotDisplay 共同繼承，
 * `units` 宣告只維護一份，元素型別以型別參數依各層指定。
 * Inherited by the engine's IBattleSnapshot and the display's IBattleTeam /
 * IBattleSnapshotDisplay so the `units` declaration is maintained once, with the element
 * type supplied per layer as a type parameter.
 */
export interface IUnitList<TUnit> {
	/** 單位列表（元素型別依層別而定）/ unit list (element type varies by layer) */
	units: TUnit[];
}

/** 快照單位資料（戰場狀態某一刻的切面）/ Snapshot unit data (a moment's field state) */
export interface IBattleSnapshotUnit extends ICorpsePolicyField, IBattleUnitVitals {
	/**
	 * 戰鬥單位實例唯一識別碼（Character.unitUuid；個體追蹤用）/ unit instance uid (for per-instance tracking)
	 *
	 * 承接 IBattleUnitVitals.unitUuid 並收窄為必填。
	 * Inherits IBattleUnitVitals.unitUuid and narrows it to required.
	 */
	unitUuid: string;
	/**
	 * 繼承 ICorpsePolicyField.corpse 並收窄為必填：引擎保證已完成
	 * 角色 > 隊伍 > 戰鬥級繼承解析（false＝不留下屍體，物件＝帶圖／class／style 規格）。
	 * Inherits ICorpsePolicyField.corpse and narrows it to required: the engine guarantees the
	 * character > team > battle inheritance has been resolved (false = no corpse, object =
	 * corpse carrying image/class/style spec).
	 */
	corpse: ICorpsePolicy;
	/** 單位編號 String(char.no)（物種／定義編號）/ unit number as string (species / definition id) */
	no: string;
	/** 隊伍側別 / team */
	team: EnumTeamSide;
	/** 是否已死亡 / whether this unit is dead */
	dead: boolean;
	/** 當前正在蓄力/詠唱的技號（無則 null）/ skill being charged/cast, null otherwise */
	expectSkill: number | null;
}

/** 戰鬥快照（每 10 次行動插入，記錄戰場圖與 HP/SP）/ Battle snapshot (one per 10 actions) */
export interface IBattleSnapshot extends IUnitList<IBattleSnapshotUnit> {
	/** 插入時的 log.length / log length at insertion time */
	at: number;
}
