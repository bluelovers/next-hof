import type { IAtkDefFields, IAtkTuple, ICombatStats, IEquipTable, INamedIconDef } from './base-types';
import type { EnumGuardKind, EnumPosition } from './battle-enum';
import type { ICorpsePolicyField } from '#/lib/game/battle/corpse-policy';
import type { IDataEx } from './data-ex-types';

/**
 * 模式項目 / Pattern item
 *
 * AI 行為規則列：buildPattern() 組裝（逃跑／特殊前置 + 角色自身 + 預設收尾），
 * AI behavior rule row: assembled by buildPattern() (flee/special prelude + own rules + default tail),
 * 再由 MultiFactJudge() 依序檢查——第一個 judge 成立且通過 quantity 回合門檻者，
 * then checked in order by MultiFactJudge() — the first row whose judge passes and whose
 * quantity turn gate is met yields its action.
 * 其 action 即本回合要施放的技能編號（1000 為預設攻擊）。
 */
export interface IPatternItem
{
	/** 判定碼（交由 judge.ts DecideJudge 評估）/ judge code (evaluated by judge.ts DecideJudge) */
	judge: number;
	/**
	 * 回合門檻：省略或 0＝恆可觸發，否則需 battle.turn >= quantity
	 * turn gate: omitted or 0 = always eligible, else requires battle.turn >= quantity;
	 * 省略（undefined）由引擎以 0 視之，與來源 `quantity: null`（載入時已收斂為 0）同義。
	 * an omitted value counts as 0 in the engine, same as the source `quantity: null` (already normalized to 0 at load).
	 */
	quantity?: number;
	/** 動作碼＝技能編號（1000 為預設攻擊）/ action code = skill number (1000 is the default attack) */
	action: number;
}

/**
 * 行為定義 / Behavior definition
 *
 * 角色／職業的 AI 行為設定（ICharDef.behavior 與 IJobDef.pattern 皆使用本型別）。
 * AI behavior settings for chars/jobs (used by both ICharDef.behavior and IJobDef.pattern).
 */
export interface IBehavior
{
	/** 預期站位（資料層保留；開戰時 setBattleVariable 以隨機決定 POSITION）/ intended position (data-layer; setBattleVariable randomizes POSITION at battle start) */
	position?: EnumPosition;
	/** 前排守護條件；省略時視為 EnumGuardKind.Always / front-row guard condition; omitted = EnumGuardKind.Always */
	guard?: EnumGuardKind;
	/** AI 行動規則列；省略時 buildPattern() 只含前置與預設收尾 / AI action rules; when absent, buildPattern() keeps only the prelude and default tail */
	pattern?: IPatternItem[];
}

/**
 * 特殊能力定義 / Special ability definition
 *
 * Character.SPECIAL 的結構；各欄位可經 getSpecial/addSpecial/setSpecial 以字串鍵存取
 * （數值鍵以數字累加，Pierce（IAtkTuple）逐槽累加）。
 * Shape of Character.SPECIAL; every field is reachable by string key via getSpecial/addSpecial/setSpecial
 * (numeric keys accumulate scalars, Pierce (IAtkTuple) accumulates per slot).
 */
export interface ISpecial
{
	/** 中毒抗性 %（getPoison 據此折減施毒機率）/ poison resistance % (getPoison reduces the chance by this) */
	PoisonResist?: number;
	/** 回復加成（被動技能累加；目前僅儲存，傷害公式尚未讀取）/ heal bonus (accumulated by passives; stored only, not yet read by the heal formula) */
	HealBonus?: number;
	/** 絕對防禦次數：>0 時消耗一次並使該次傷害歸 0（pierce 可穿透）/ absolute guard charges: consumes one to nullify a hit (pierced by pierce) */
	Barrier?: number;
	/**
	 * 貫穿值（索引同 EnumSkillDamageType：0=物理、1=魔法；pierce 技能加算至傷害）
	 * pierce damage (IAtkTuple; indices follow EnumSkillDamageType: 0 = physical, 1 = magic; added when skill.pierce is set)
	 */
	Pierce?: IAtkTuple;
	/** 召喚加成（裝備 P_SUMMON 累加）/ summon bonus (accumulated from equipment P_SUMMON) */
	Summon?: number;
	/** 不死系標記 / undead flag */
	Undead?: number;
	/** 變身標記（技能 2057 SelfMetamorphorse 設定）/ metamorphosis flag (set by skill 2057) */
	Metamo?: number;
	/** 每回合 HP 回復 %（autoRegeneration 於行動前套用）/ per-turn HP regen % (applied by autoRegeneration before acting) */
	HpRegen?: number;
	/** 每回合 SP 回復 %（autoRegeneration 於行動前套用）/ per-turn SP regen % (applied by autoRegeneration before acting) */
	SpRegen?: number;
}

/**
 * 已習得技能列表欄位（`skill`）
 * Learned-skill list field (`skill`)
 *
 * 兩層宣告完全一致，一律以 `extends` 繼承本型別，不各自宣告。
 * Both layers declare it identically; every interface carrying `skill` extends this type.
 *
 * 使用方 / Consumers: `ICharCore`（→ `ICharDef`／`IMonDef`）與 raw `IRawCharYaml`
 */
export interface ILearnedSkillsField
{
	/** 已習得技能編號列表 / learned skill numbers */
	skill?: number[];
}

/**
 * AI 行為欄位（`behavior`）
 * AI-behavior field (`behavior`)
 *
 * 載入後即與引擎目標同形（position 值即 EnumPosition、guard 值即 EnumGuardKind、
 * pattern 列即 IPatternItem），一律以 `extends` 繼承，不各自宣告。
 * Post-load it is identical to the engine target (position values ARE EnumPosition,
 * guard values ARE EnumGuardKind, pattern rows ARE IPatternItem); extend instead of declaring.
 *
 * 使用方 / Consumers: `ICharCore`（→ `ICharDef`／`IMonDef`）與 raw `IRawCombatCoreYaml`
 */
export interface IBehaviorField
{
	/** AI 行為樣式（怪物戰鬥決策用）/ AI behavior pattern (monster battle decisions) */
	behavior?: IBehavior;
}

/**
 * 特殊能力欄位（`SPECIAL`）
 * Special-ability field (`SPECIAL`)
 *
 * 以 ISpecial 為型別來源、全欄位選填（省略＝無該能力）；一律以 `extends` 繼承。
 * ISpecial is the type source (every member optional; omitted = no ability); extend instead of declaring.
 *
 * 使用方 / Consumers: `ICharCore`（→ `ICharDef`／`IMonDef`）與 raw `IRawMonYaml`
 */
export interface ISpecialField
{
	/** 天生特殊能力（ISpecial；省略＝無該能力）/ innate special abilities (ISpecial; omitted = none) */
	SPECIAL?: ISpecial;
}

/**
 * 角色附加欄位（`ICharDef` 與 raw `IRawCharYaml` 同形）
 * Character extra fields shared by `ICharDef` and raw `IRawCharYaml`
 *
 * 兩層宣告完全一致（名稱、選取性、型別），於此定義一次、兩側皆 `extends` 繼承；
 * `skill`（已習得技能列表）同理，另見 ILearnedSkillsField。
 * Both layers declare these identically (name, optionality, type), so both extend this
 * interface; `skill` follows the same rule via ILearnedSkillsField.
 *
 * 使用方 / Consumers: `ICharDef`（target）與 raw `IRawCharYaml`
 */
export interface ICharExtraFields
{
	/** 當前累積經驗 / accumulated exp */
	exp?: number;
	/** 職業編號 / job number */
	job?: number;
	/** 各欄位裝備的道具編號 / equipped item number per slot（IEquipTable） */
	equip?: IEquipTable;
	/** 擴充資料（共用 IDataEx；char 只使用 recruit_money）/ extra data (shared IDataEx) */
	data_ex?: IDataEx;
}

/**
 * 戰鬥單位基礎定義（角色/怪物共用）/ Combatant base definition (shared by char & mon)
 *
 * 六維與 HP/SP 由 ICombatStats 提供、`atk`／`def` 由 IAtkDefFields、`skill` 由
 * ILearnedSkillsField、`behavior` 由 IBehaviorField、`SPECIAL` 由 ISpecialField 提供；
 * 本介面只宣告實例識別碼 `unitUuid`。
 * Stats/HP/SP come from ICombatStats, `atk` / `def` from IAtkDefFields, `skill` from
 * ILearnedSkillsField, `behavior` from IBehaviorField and `SPECIAL` from ISpecialField;
 * this interface declares the instance uid `unitUuid` only.
 */
export interface ICharCore extends ICorpsePolicyField, ICombatStats, IAtkDefFields, ILearnedSkillsField, IBehaviorField, ISpecialField, Omit<INamedIconDef, 'img'>
{
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
}

/**
 * 角色定義 / Character definition
 */
export interface ICharDef extends ICharCore, ICharExtraFields
{
}
