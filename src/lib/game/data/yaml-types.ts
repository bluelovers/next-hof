/**
 * 原始 YAML 資源型別 / Raw YAML resource types
 * 對應 HOF Resource 下各資源目錄的 `*.yml` 結構。
 * Mirrors the `*.yml` files under the HOF Resource directories.
 *
 * **數值正規化 / Numeric normalization：**
 * 由 yaml-load 在讀取後統一將「數值字串」收斂為 number（`'1'` → 1），
 * 故本層的數值欄位直接以 `number` 定型；文字欄位（名稱、圖示、desc）維持 string。
 * yaml-load normalizes numeric strings to numbers right after reading (`'1'` → 1),
 * so numeric fields here are typed `number`; textual fields stay `string`.
 *
 * **單一事實來源 / Single source of truth：**
 * 與 #/lib/game/types 形狀相同的區塊（戰鬥數值、pattern、reward、補正欄位）
 * 直接引用既有介面，不重覆宣告。
 * Blocks that mirror #/lib/game/types (combat stats, pattern, reward, compensation
 * fields) reference the existing interfaces instead of re-declaring them.
 */

import type {
	IAtkDefFields,
	IAtkTuple,
	IBehavior,
	IDataEx,
	ICombatStats,
	ICompBonuses,
	IDescInfo,
	IEncounterTable,
	IEquipTable,
	IGenderOverride,
	IGrowthCoefficients,
	IMonReward,
	INamedIconDef,
	INumberTable,
	IPatternItem,
	ISpecial,
} from '#/lib/game/types';
import { SKILL_EXTRA_NUMERIC_KEYS } from './yaml-skill-keys';

/**
 * 技能擴充數值欄位（Plus*／Up*／Down*，單一事實來源）/ skill extra numeric fields (SSOT)
 * 鍵為 SKILL_EXTRA_NUMERIC_KEYS 的字面聯集（29 鍵），具名屬性、非 index signature。
 * Keys are the 29-literal union of SKILL_EXTRA_NUMERIC_KEYS (named props, not an index signature).
 */
export type IRawSkillExtraNumerics = Partial<
	Record<(typeof SKILL_EXTRA_NUMERIC_KEYS)[number], number>
>;

/**
 * 原始戰鬥核心欄位（角色與怪物共用）/ Raw combat-core fields (shared by char & mon)
 * 六維與 HP/SP 引用 ICombatStats；no/name 引用 INamedIconDef（無 img）。
 * Stats/HP/SP reference ICombatStats; no/name reference INamedIconDef (with img omitted).
 *
 * behavior 直接使用 IBehavior（載入後即與引擎目標同形：position 值即 EnumPosition、
 * guard 值即 EnumGuardKind、pattern 列即 IPatternItem——來源筆誤／空物件已於載入修正）。
 * behavior uses IBehavior directly (post-load it is identical to the engine target: position
 * values ARE EnumPosition, guard values ARE EnumGuardKind, pattern rows ARE IPatternItem;
 * source typos / empty objects are already fixed at load).
 */
export interface IRawCombatCoreYaml extends ICombatStats, Omit<INamedIconDef, 'img'>
{
	/** AI 行為 / AI behavior */
	behavior?: IBehavior;
}

/**
 * 原始角色定義（char.*.yml）/ Raw player-character definition (char.*.yml)
 */
export interface IRawCharYaml extends IRawCombatCoreYaml
{
	/** 目前累積經驗 / accumulated exp */
	exp?: number;
	/** 職業編號 / job number */
	job?: number;
	/** 已習得技能編號 / learned skill numbers */
	skill?: number[];
	/** 擴充資料（共用 IDataEx；char 只用 recruit_money）/ extra data (shared IDataEx; char uses recruit_money only) */
	data_ex?: IDataEx;
	/** 各欄位裝備 / equipped items per slot */
	equip?: IEquipTable;
}

/**
 * 原始怪物定義（mon.*.yml）/ Raw monster definition (mon.*.yml）
 *
 * 原始檔的小寫 `special` 為錯字（僅 mon.1000 出現且為空物件）——正規鍵只有大寫 `SPECIAL`。
 * The lowercase `special` key is a source typo (only mon.1000, an empty object) — the canonical
 * key is `SPECIAL` only.
 */
export interface IRawMonYaml extends IRawCombatCoreYaml, IAtkDefFields, INamedIconDef
{
	/** 特殊能力（以 ISpecial 為單一事實來源，省略＝無該能力）/ special abilities (ISpecial is the SSOT, omitted = no ability) */
	SPECIAL?: ISpecial;
	/** 說明資訊 / description info */
	info?: IDescInfo;
	/** 掉落與獎勵 / drop & reward */
	reward?: IMonReward;
	/** AI 行為 / AI behavior */
	behavior?: IBehavior;
	/** 獨特怪物出現週期（秒）/ union spawn cycle (seconds) */
	cycle?: number;
	/** 獨特怪物土地（背景）/ union land (background) */
	land?: string;
	/** 獨特怪物等級限制 / union level limit */
	lv_limit?: number;
	/** 隨行僕從表 { 怪物編號: [出現權重, 旗標] } / escort table (IEncounterTable) */
	servant?: IEncounterTable;
	/** 隨行僕從數量 / escort count */
	servantAmount?: number;
	/** 必出隨行僕從編號 / guaranteed escort monster numbers */
	servantSpecify?: number[];
}

/**
 * 原始道具定義（Item/item.*.yml）/ Raw item definition (Item/item.*.yml)
 * 補正欄位（P_* / M_*）由 ICompBonuses 提供（單一事實來源）。
 * Compensation fields (P_* / M_*) come from ICompBonuses (SSOT).
 */
export interface IRawItemYaml extends ICompBonuses, IAtkDefFields, INamedIconDef
{
	/** 武器／裝備型別（PascalCase；含 Key/Map/Special 等無對應成員的值）/ weapon/equipment type (PascalCase; includes values like Key/Map/Special without enum members) */
	type?: string;
	/** 類別細分（WEAPON / GUARD / OTHER）/ sub-category (WEAPON / GUARD / OTHER) */
	type2?: string;
	/** 購入價格 / buy price */
	buy?: number;
	/** 賣出價格 / sell price */
	sell?: number;
	/** 雙手武器標記 / two-handed flag */
	dh?: boolean | string | number;
	/** 裝備負荷 / equipment weight */
	handle?: number;
	/** 習得條件 { 職業編號: 等級 } / learn requirement (INumberTable) */
	need?: INumberTable;
	/** 強化後基礎道具名 / base item name after refinement */
	base_name?: string;
	/** 附加召喚效果值 / attached summon bonus */
	P_SUMMON?: number;
	/** 附加貫穿效果值（P_PIERCE = [物理, 魔法]）/ attached pierce bonus (P_PIERCE = [phys, mag]) */
	P_PIERCE?: IAtkTuple;
}

/**
 * 原始職業定義（Job/job.*.yml）/ Raw job definition (Job/job.*.yml)
 */
export interface IRawJobYaml
{
	/** 職業編號 / job number */
	no?: number;
	/** 職業名稱 / job name */
	job_name?: string;
	/** 職業編號欄位（no 之外的另一份）/ job number (a duplicate seat alongside `no`) */
	job?: number;
	/** 可裝備的武器／裝備型別 / equippable weapon/armor types */
	equip?: (string | number)[];
	/** 成長係數 / growth coefficients（IGrowthCoefficients） */
	coe?: IGrowthCoefficients;
	/** 行為樣式（原始檔恆為 null＝無 AI 模式）/ behavior pattern (always null in the source = no AI pattern) */
	pattern?: unknown;
	/** 職業圖示 / job icon */
	img?: string;
	/** 依性別區分的名稱／圖示（鍵為 1=男、2=女）/ per-gender name/icon (keys: 1 = male, 2 = female; value IGenderOverride) */
	gender?: Record<string, IGenderOverride>;
	/** 說明資訊 / description info */
	info?: IDescInfo;
	/** 擴充資料（共用 IDataEx；job 用 job_base＋job_conditions）/ extra data (shared IDataEx; job uses job_base + job_conditions) */
	data_ex?: IDataEx;
}

/**
 * 原始技能定義（Skill/skill.*.yml）/ Raw skill definition (Skill/skill.*.yml)
 * 補正欄位（P_* / M_*）由 ICompBonuses 提供（單一事實來源）；source 內尚有 name2 等未收錄鍵。
 * Compensation fields (P_* / M_*) come from ICompBonuses (SSOT); the source also has
 * uncatalogued keys like `name2`.
 */
export interface IRawSkillYaml extends ICompBonuses, IRawSkillExtraNumerics, INamedIconDef
{
	/** 說明文字 / description text */
	exp?: string;
	/** SP 消耗 / SP cost */
	sp?: number;
	/** 傷害類型（0=物理、1=魔法）/ damage type (0 = physical, 1 = magic) */
	type?: number;
	/** 習得所需技能點 / skill points to learn */
	learn?: number;
	/** 目標規格三元組 [目標類型, 選取方式, 數量] / target 3-tuple [target type, selection method, count] */
	target?: [type: string, method: string, count: number];
	/** 威力倍率 % / power % */
	pow?: number;
	/** 命中率 / hit rate */
	hit?: number;
	/** 防禦貫穿旗標 / guard-bypass flag */
	invalid?: number | boolean;
	/** 支援魔法旗標 / support-magic flag */
	support?: number | boolean;
	/** 被動技能旗標 / passive flag */
	passive?: number | boolean;
	/** 快速行動旗標 / quick-action flag */
	quick?: number | boolean;
	/** 目標優先條件 / target priority */
	priority?: string;
	/** 詠唱/蓄力 [詠唱時間, 硬直] / charge [cast time, stiff] */
	charge?: number[];
	/** 行動後硬直 % / post-action stiff % */
	stiff?: number;
	/** 傷害參照能力 / influencing stat */
	inf?: string;
	/** 回復加成 / heal bonus */
	HealBonus?: number;
	/** 貫穿旗標 / pierce flag */
	pierce?: number | boolean;
	/** 行動延遲速率 % / action delay rate % */
	delay?: number;
	/** 擊退率 % / knockback % */
	knockback?: number;
	/** 施毒機率 % / poison chance % */
	poison?: number;
	/** 抗毒增益 % / poison-resist gain % */
	poisonResist?: number;
	/** 召喚怪物編號（單一或陣列）/ summon monster number (single or array) */
	summon?: number | number[];
	/** 施放後自身移動 / self movement after casting */
	move?: string;
	/** 使用後移動方向 / post-use movement */
	umove?: string;
	/** 武器限制 / weapon-type restriction */
	limit?: Record<string, boolean | string | number>;
	/** 犧牲比例 % / sacrifice % */
	sacrifice?: number;
	/** 解毒旗標 / cure-poison flag */
	CurePoison?: number | boolean;
	/** HP 回復 % / HP regen % */
	HpRegen?: number;
	/** SP 回復 % / SP regen % */
	SpRegen?: number;
	/** 蘇生旗標 / revive flag */
	revive?: number | boolean;
	/** SP 回復倍率 / SP recovery rate multiplier */
	SpRecoveryRate?: number;
	/** 增加己方魔方陣數 / add own magic circles */
	MagicCircleAdd?: number;
	/** 消除己方魔方陣數 / remove own magic circles */
	MagicCircleDelete?: number;
	/** 消耗己方魔方陣數 / consume own magic circles */
	MagicCircleDeleteTeam?: number;
	/** 消除敵方魔方陣數 / remove enemy magic circles */
	MagicCircleDeleteEnemy?: number;
	/** 補正欄位的小寫變體（source 的 p_maxhp）/ lowercase compensation variant from the source */
	p_maxhp?: number;
}

/**
 * 原始守護設定（Guard/guard.*.yml）/ Raw guard setting (Guard/guard.*.yml)
 * 鍵為守護種類字串（guard.always → id 'always'）；純資料層。
 * The id is the guard-kind string (guard.always → id 'always'); data-layer only.
 */
export interface IRawGuardYaml
{
	/** 守護種類（always/never/life25/…；含筆誤 prpb50）/ guard kind (always/never/life25/…; incl. the typo prpb50) */
	no: string;
	/** 說明資訊 / description info */
	info?: IDescInfo;
	/** 多語翻譯 / i18n copy（值為 IDescInfo） */
	_i18n?: Record<string, IDescInfo>;
}

/**
 * 原始判定碼設定（Judge/judge.*.yml）/ Raw judge-code setting (Judge/judge.*.yml)
 * 純資料層（UI 說明用）。/ data-layer only (UI copy).
 */
export interface IRawJudgeYaml
{
	/** 判定碼 / judge code */
	no: number;
	/** 說明 / description */
	exp?: string;
	/** 標籤 { no, exp } / tag { no, exp } */
	tag?: { no?: string | number; exp?: string };
	/** 是否需要 quantity / whether quantity is required */
	quantity?: boolean | string | number;
	/** CSS class / css class */
	css?: string;
	/** 子判定 / sub judge codes */
	subs?: unknown;
	/** 詳細說明 / detail info */
	info?: IDescInfo;
}

/**
 * 原始土地設定（Land/land.*.yml）/ Raw land setting (Land/land.*.yml)
 * no 為字串 id（ac0、blow01…）；純資料層。
 * `no` is a string id (ac0, blow01…); data-layer only.
 */
export interface IRawLandYaml
{
	/** 土地 id / land id */
	no: string;
	/** 土地資訊（名稱等）/ land info (name, etc.) */
	land?: { name?: string; name0?: string; land?: string; proper?: string };
	/** 怪物遭遇表 { 怪物編號: [權重, 旗標] } / monster encounter table (IEncounterTable) */
	monster?: IEncounterTable;
	/** 觸發（事件道具等）/ triggers (event items, etc.) */
	trigger?: unknown;
}

/**
 * 原始技能樹節點（Skilltree/skilltree.*.yml）/ Raw skill-tree node (Skilltree/skilltree.*.yml)
 * 純資料層。/ data-layer only.
 */
export interface IRawSkilltreeYaml
{
	/** 節點編號（＝技能編號）/ node number (the skill number) */
	no: number;
	/** 習得條件（and/or 邏輯樹）/ learn conditions (and/or logic tree) */
	check?: unknown;
}

/**
 * 原始獨特怪物設定（Union/union.*.yml）/ Raw union setting (Union/union.*.yml)
 * no 為補零字串（'0000'）；純資料層（對應 mon.*.yml 的獨特怪物細節）。
 * `no` is a zero-padded string ('0000'); data-layer only (the union details for the mon.*.yml bosses).
 */
export interface IRawUnionYaml
{
	/** 獨特怪物 id（補零字串）/ union id (zero-padded string) */
	no: string | number;
	/** 獨特怪物名稱 / union name */
	name?: string;
	/** 核心資料（隊伍、基底怪物、條件）/ core data (team, base monster, conditions) */
	data?: {
		team?: { name?: string; servant?: IEncounterTable };
		base?: { type?: string; no?: string | number };
		conditions?: { lv_limit?: number };
	};
	/** 展示資料（共用 IDataEx；union 用 name/level/img/land/cycle）/ display data (shared IDataEx; union uses name/level/img/land/cycle) */
	data_ex?: IDataEx;
}