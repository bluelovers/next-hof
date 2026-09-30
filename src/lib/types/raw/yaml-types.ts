/**
 * 原始 YAML 資源型別 / Raw YAML resource types
 * 對應 HOF Resource 下各資源目錄的 `*.yml` 結構。
 * Mirrors the `*.yml` files under the HOF Resource directories.
 * 本檔（src/lib/types/raw）收集「yaml 讀取層」的原始型別，與上層定義型別分開放置。
 * This directory collects the raw yaml-reading-layer types, kept apart from the upper definitions.
 *
 * **數值正規化 / Numeric normalization：**
 * 由 yaml-load 在讀取後統一將「數值字串」收斂為 number（`'1'` → 1），
 * 故本層的數值欄位直接以 `number` 定型；文字欄位（名稱、圖示、desc）維持 string。
 * yaml-load normalizes numeric strings to numbers right after reading (`'1'` → 1),
 * so numeric fields here are typed `number`; textual fields stay `string`.
 *
 * **與上層共用形狀 / Shared shapes with the upper layer：**
 * 與 #/lib/types 形狀相同的區塊（戰鬥數值、pattern、reward、補正欄位）
 * 直接引用既有介面，不重覆宣告。
 * Blocks that mirror #/lib/types (combat stats, pattern, reward, compensation
 * fields) reference the existing interfaces instead of re-declaring them.
 */

import type {
	IAtkDefFields,
	ICombatStats,
	IDescInfo,
	IEncounterTable,
	INamedIconDef,
} from '#/lib/types/base-types';
import type {
	IBehaviorField,
	ICharExtraFields,
	ILearnedSkillsField,
	ISpecialField,
} from '#/lib/types/char-types';
import type { IDataEx } from '#/lib/types/data-ex-types';
import type { IMonExtraFields } from '#/lib/types/mon-types';
import type { ICompBonuses, ISkillSharedFields } from '#/lib/types/skill-types';
import type { IResourceId } from '#/lib/types/seg-types';
import { SKILL_EXTRA_NUMERIC_KEYS } from '#/lib/game/data/yaml-skill-keys';

/**
 * 技能擴充數值欄位（Plus*／Up*／Down*）/ skill extra numeric fields
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
 * behavior 繼承 IBehaviorField（載入後即與引擎目標同形：
 * position 值即 EnumPosition、guard 值即 EnumGuardKind、pattern 列即 IPatternItem——
 * 來源筆誤／空物件已於載入修正）。
 * behavior comes from IBehaviorField (post-load it is identical to the engine target:
 * position values ARE EnumPosition, guard values ARE EnumGuardKind, pattern rows ARE
 * IPatternItem; source typos / empty objects are already fixed at load).
 */
export interface IRawCombatCoreYaml extends ICombatStats, IBehaviorField, Omit<INamedIconDef, 'img'>
{
}

/**
 * 原始角色定義（char.*.yml）/ Raw player-character definition (char.*.yml)
 *
 * exp／job／equip／data_ex 繼承 ICharExtraFields、skill 繼承 ILearnedSkillsField
 * （皆為與 `ICharDef` 同形的共用宣告）。
 * exp / job / equip / data_ex come from ICharExtraFields and skill from ILearnedSkillsField
 * (both are shared declarations identical to `ICharDef`).
 */
export interface IRawCharYaml extends IRawCombatCoreYaml, ICharExtraFields, ILearnedSkillsField
{
}

/**
 * 原始怪物定義（mon.*.yml）/ Raw monster definition (mon.*.yml)
 *
 * 原始檔的小寫 `special` 為錯字（僅 mon.1000 出現且為空物件）——正規鍵只有大寫 `SPECIAL`。
 * The lowercase `special` key is a source typo (only mon.1000, an empty object) — the canonical
 * key is `SPECIAL` only.
 */
export interface IRawMonYaml extends IRawCombatCoreYaml, IAtkDefFields, IMonExtraFields, ISpecialField, INamedIconDef
{
}

/**
 * 原始技能定義（Skill/skill.*.yml）/ Raw skill definition (Skill/skill.*.yml)
 * 補正欄位（P_* / M_*）由 ICompBonuses 提供；source 內尚有 name2 等未收錄鍵。
 * Compensation fields (P_* / M_*) come from ICompBonuses; the source also has
 * uncatalogued keys like `name2`.
 *
 * 旗標欄位（invalid／support／passive／quick／pierce／CurePoison／revive）繼承
 * ISkillSharedFields：來源寫 `true`／`'1'`／`1`，載入時（Skill 的 COERCE_SPECS）已統一收斂為
 * `number`（1／0），故**不是** `number | boolean`。
 * The flag fields (invalid/support/passive/quick/pierce/CurePoison/revive) are inherited from
 * ISkillSharedFields: the source writes `true`/`'1'`/`1`, and the Skill COERCE_SPECS collapse
 * them to `number` (1/0) at load — never `number | boolean`.
 *
 * `limit` 的值在來源即為布林（`Whip: true`），且載入不經數值收斂 → `Record<string, boolean>`。
 * `limit` values are booleans in the source (`Whip: true`) and are not coerced at load,
 * so the shape is `Record<string, boolean>` (no resource-id branch).
 */
export interface IRawSkillYaml extends ICompBonuses, IRawSkillExtraNumerics, ISkillSharedFields, INamedIconDef
{
	/** SP 消耗 / SP cost */
	sp?: number;
	/** 傷害類型（0=物理、1=魔法）/ damage type (0 = physical, 1 = magic) */
	type?: number;
	/** 目標規格三元組 [目標類型, 選取方式, 數量] / target 3-tuple [target type, selection method, count] */
	target?: [type: string, method: string, count: number];
	/** 目標優先條件 / target priority */
	priority?: string;
	/** 詠唱/蓄力 [詠唱時間, 硬直] / charge [cast time, stiff] */
	charge?: number[];
	/** 傷害參照能力 / influencing stat */
	inf?: string;
	/** 施放後自身移動 / self movement after casting */
	move?: string;
	/** 使用後移動方向 / post-use movement */
	umove?: string;
	/** 武器限制 { 武器型別: 是否可使用 } / weapon restriction { weapon type: allowed } */
	limit?: Record<string, boolean>;
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

export interface IRawJudgeYamlSub
{
	/** 判定碼 / judge code */
	no: number;
	/** 說明 / description */
	exp?: string;
	/** 標籤 { no, exp } / tag { no, exp } */
	tag?: { no?: IResourceId; exp?: string };
	/** 是否需要 quantity / whether quantity is required */
	quantity?: boolean;
}

/**
 * 原始判定碼設定（Judge/judge.*.yml）/ Raw judge-code setting (Judge/judge.*.yml)
 * 純資料層（UI 說明用）。/ data-layer only (UI copy).
 */
export interface IRawJudgeYaml extends IRawJudgeYamlSub
{
	/** CSS class / css class */
	css?: string;
	/** 子判定 / sub judge codes */
	subs?: Record<IResourceId, IRawJudgeYamlSub>;
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
	no: IResourceId;
	/** 獨特怪物名稱 / union name */
	name?: string;
	/** 核心資料（隊伍、基底怪物、條件）/ core data (team, base monster, conditions) */
	data?: {
		team?: { name?: string; servant?: IEncounterTable };
		base?: { type?: string; no?: IResourceId };
		conditions?: { lv_limit?: number };
	};
	/** 展示資料（共用 IDataEx；union 用 name/level/img/land/cycle）/ display data (shared IDataEx; union uses name/level/img/land/cycle) */
	data_ex?: IDataEx;
}
