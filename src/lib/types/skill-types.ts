import type { INamedIconDef } from './base-types';
import type { EnumPosition } from './battle-enum';
import type { EnumWeaponType } from './item-enum';
import type {
	EnumInfluence,
	EnumSkillDamageType,
	EnumSkillPriority,
	EnumTargetMethod,
	EnumTargetType,
} from './skill-enum';
import type { ISkillMagicCircleFields } from './skill-magic-circle-fields';
import type { ISkillPlusFields } from './skill-plus-fields';
import type { ICompField, IStatusDownKey, IStatusUpKey } from './status-attr-types';

/**
 * 技能目標規格 / Skill target specification
 *
 * 三元組 [目標類型, 選取方式, 數量]，直接對應 YAML skill.target 欄位；
 * 數量僅在 Multi 時有意義；技能省略 target 時預設 [Enemy, Individual, 1]。
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
 * 詠唱/蓄力二元組 [詠唱時間, 硬直] / Charge tuple [cast time, stiff]
 *
 * 索引 0＝詠唱時間（回合數）、索引 1＝行動後硬直；ISkillDef.charge 與 convertCharge 共用本型別。
 */
export type IChargeTuple = [castTime: number, stiff: number];

/**
 * 補正欄位型別（P_* / M_*，由 COMP_FIELDS 衍生）/ Compensation bonus type
 *
 * Partial 表示技能／道具只需宣告實際擁有的補正欄位；
 * ISkillDef 與 IItemDef 皆 extends 本型別，使被動(passive)與裝備加總可共用同一組鍵。
 */
export type ICompBonuses = Partial<Record<ICompField, number>>;

/**
 * 技能 Up* 臨時增益欄位 / Skill Up* temporary buff fields
 *
 * 由 EnumStatusAttr 衍生（IStatusUpKey，共 11 鍵），鍵名對應 status-attrs.ts 的
 * STATUS_UP_KEY_NAME 與 UPMAP；新增狀態屬性時本型別自動跟隨，
 * 無需在 ISkillDef 重複宣告欄位（型別追溯）。
 *
 * statusChanges 命中 UPMAP 鍵時，以 % 作用於「目標」（對齊原始 StatusChanges 全部作用在 $target）。
 */
export type ISkillUpFields = Partial<Record<IStatusUpKey, number>>;

/**
 * 技能 Down* 臨時減益欄位 / Skill Down* temporary debuff fields
 *
 * 由 EnumStatusAttr 衍生（IStatusDownKey，共 11 鍵），鍵名對應 status-attrs.ts 的
 * STATUS_DOWN_KEY_NAME 與 DOWNMAP（型別追溯）。
 *
 * statusChanges 命中 DOWNMAP 鍵時，以 % 作用於「目標」。
 */
export type ISkillDownFields = Partial<Record<IStatusDownKey, number>>;

/**
 * 技能共用欄位（raw 與 target 宣告完全同形者）
 *
 * 本組欄位在 raw `IRawSkillYaml` 與 `ISkillDef` 的名稱、選取性、型別三者完全一致，
 * 於此定義一次、兩側皆以 `extends` 繼承，不再各自重覆宣告。
 * 兩層宣告有差異者（`sp`／`type`／`target`／`priority`／`charge`／`inf`／`move`／`umove`／
 * `limit` 與 raw 獨有的 `p_maxhp`）不納入本組，仍由各層自行宣告。
 *
 * 魔方陣欄位（MagicCircle*）見 ISkillMagicCircleFields（經本介面繼承）。
 *
 * **旗標欄位恆為 `number` / flag fields are always `number`：**
 * `invalid`／`support`／`passive`／`quick`／`pierce`／`CurePoison`／`revive` 在來源寫
 * `true`／`'1'`／`1` 三種形態，但 yaml-load 的 Skill 規格（COERCE_SPECS）於載入時統一收斂為
 * `1`／`0`，故本層（載入後）型別是 `number`，**不是** `number | boolean`。
 *
 * 使用方 / Consumers: `ISkillDef`（target）與 raw `IRawSkillYaml`
 */
export interface ISkillSharedFields extends ISkillMagicCircleFields
{
	/** 技能說明文字（PHP exp；UI 顯示為 effect）/ description text (PHP exp; shown as effect in UI) */
	exp?: string;
	/** 習得所需技能點（0＝初期即持有）/ skill points to learn (0 = known from the start) */
	learn?: number;
	/** 威力倍率 %（支援技能時視為回復倍率）/ power % (interpreted as heal ratio for support skills) */
	pow?: number;
	/** 命中率（目前僅資料層保留，引擎未讀取）/ hit rate (data-layer only; not read by the engine) */
	hit?: number;
	/**
	 * 防禦貫穿（前衛守護無效）
	 *
	 * 為真時跳過 Defending 攔截，且不被 Barrier 抵消。
	 */
	invalid?: number;
	/**
	 * 支援魔法（pow 視為回復倍率）
	 *
	 * 為真時走 calcRecoveryValue 回復路線，且不觸發守護。
	 */
	support?: number;
	/** 為真時視為被動技能，由 passive.ts 在戰鬥初始化時累加補正 / truthy = passive skill; passive.ts accumulates its bonuses at battle setup */
	passive?: number;
	/**
	 * 快速行動標記（SkillEffect 讀取：召喚技能帶 quick 時，召喚物立即行動）
	 * quick-action flag (read by SkillEffect: with `quick`, a summoned unit acts immediately)
	 */
	quick?: number;
	/** 為真時無視 target.def 百分比／定值減傷，並加算 SPECIAL.Pierce（且穿透 Barrier）/ when truthy, ignores target.def percent/flat reduction, adds SPECIAL.Pierce, and bypasses Barrier */
	pierce?: number;
	/**
	 * 解毒標記 / cure-poison flag
	 *
	 * SkillEffect.default 讀取（對齊原始 Skill/Effect.php）：CurePoison 為真且目標「中毒」時
	 * 才解毒，解毒時產出 Poison(text='cured') 事件。
	 */
	CurePoison?: number;
	/** 蘇生技能標記（目前僅資料層使用）/ revive skill flag (data layer only) */
	revive?: number;
	/** 行動後硬直 %（目前僅資料層保留，引擎未讀取）/ post-action stiff % (data-layer only; not read by the engine) */
	stiff?: number;
	/** 回復加成（被動技能時由 passive.ts 累加至 SPECIAL.HealBonus）/ heal bonus (passive.ts accumulates it into SPECIAL.HealBonus for passive skills) */
	HealBonus?: number;
	/**
	 * 行動延遲速率 %（SkillEffect 的 DelayChar 讀取：施放後 `delay += DelayValue(target) × rate/100`）
	 */
	delay?: number;
	/** 擊退率 %（引擎已讀取：statusChanges 將目標逼退至後排）/ knockback % (engine reads: statusChanges forces the target to the back row) */
	knockback?: number;
	/** 施毒機率 %（statusChanges 呼叫 getPoison）/ poison chance % (statusChanges calls getPoison) */
	poison?: number;
	/** 抗毒增益 %（statusChanges 呼叫 getPoisonResist，對應原始技能 1220 AntiPoisoning）/ poison-resist gain % (statusChanges calls getPoisonResist, mirrors skill 1220 AntiPoisoning) */
	poisonResist?: number;
	/** 召喚怪物編號或其陣列 / summon monster number or array of numbers */
	summon?: number | number[];
	/** 犧牲比例 %（消耗自身 HP；引擎已讀取：Battle.UseSkill 施法前犧牲使用者 HP）/ sacrifice % (costs own HP; engine reads: Battle.UseSkill sacrifices user HP before casting) */
	sacrifice?: number;
	/** 疊加至目標 SPECIAL.HpRegen 的回復 % / regen % accumulated into the target's SPECIAL.HpRegen */
	HpRegen?: number;
	/** 疊加至目標 SPECIAL.SpRegen 的回復 % / regen % accumulated into the target's SPECIAL.SpRegen */
	SpRegen?: number;
	/** SP 回復倍率（目前僅資料層保留）/ SP recovery rate multiplier (data-layer only) */
	SpRecoveryRate?: number;
}

/**
 * 技能定義 / Skill definition
 *
 * 對應 YAML skill 資料結構；extends ICompBonuses 共用 P_* / M_* 補正欄位，
 * 並 extends ISkillUpFields／ISkillDownFields 衍生 Up* / Down* 能力變化欄位、
 * ISkillPlusFields 承載 Plus* 永久加算欄位。
 *
 * 欄位消費狀態（本 repo）/ Field consumption status (this repo):
 * - 戰鬥引擎實際讀取：sp, type, target, pow, inf, charge, support, invalid,
 *   Up* 與 Down* 與 Plus* 系列
 * - hit 目前引擎未讀取（資料層保留）
 * - 其餘欄位（delay, stiff, quick, limit, summon,
 *   revive, SpRecoveryRate, MagicCircle*, priority, learn, exp, img）目前僅供資料層保留
 */
export interface ISkillDef extends ICompBonuses, ISkillSharedFields, ISkillUpFields, ISkillDownFields, ISkillPlusFields, INamedIconDef
{
	/** SP 消耗；怪物施放時以 ×0.7 折扣檢查（Battle.UseSkill）/ SP cost; monsters pay ×0.7 when checked (Battle.UseSkill) */
	sp: number;
	/**
	 * 技能傷害類型：Physical＝0（物理）、Magic＝1（魔法）
	 *
	 * calcBasicDamage 據此選擇 STR/INT 與 atk/def 的物理／魔法索引。
	 */
	type: EnumSkillDamageType;
	/** 目標規格 [類型, 方式, 數量]；省略時預設 [Enemy, Individual, 1] / target spec [type, method, count]; defaults to [Enemy, Individual, 1] */
	target?: ITargetSpec;
	/** 目標優先條件（Dead 由 Battle.selectTargets 讀取：復活技從死亡成員中選目標；其餘仍為資料層保留）/ target priority (Battle.selectTargets reads Dead: revive skills pick from fallen members; the rest stay data-layer only) */
	priority?: EnumSkillPriority;
	/**
	 * 詠唱/蓄力 [詠唱時間, 硬直]
	 *
	 * 只要存在本欄位（陣列恆為真），首回合即設定 expect 進入詠唱、次回合才施放；
	 * 期間施放其他技能會被中斷（expect 不符即 return）。
	 */
	charge?: IChargeTuple;
	/** 傷害參照能力（省略＝物理 STR／魔法 INT）/ influencing stat (omitted = physical STR / magic INT) */
	inf?: EnumInfluence;
	/** 施放後自身移動方向（引擎已讀取：statusChanges 將目標移至指定站位）/ self movement direction after casting (engine reads: statusChanges moves the target to the specified row) */
	move?: EnumPosition;
	/** 可使用之武器型別限制（Partial 鍵集合，目前僅資料層保留）/ allowed weapon-type restriction (partial key set; data-layer only) */
	limit?: Partial<Record<EnumWeaponType, boolean>>;
	/** 使用後移動方向（引擎已讀取：Battle.UseSkill 使用後將使用者移至指定站位）/ post-use movement direction (engine reads: Battle.UseSkill moves the user after casting) */
	umove?: EnumPosition;
}
