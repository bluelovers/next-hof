/**
 * GameData 類型定義
 * GameData type definitions
 *
 * 類別分類參考：PHP skill.detail.php + docs/data/skill.md
 * Category reference: PHP skill.detail.php + docs/data/skill.md
 *
 * 與 canonical 的去重規則 / Dedupe rule against canonical:
 * 本檔欄位若與 `#/lib/game/types` 的 `ISkillDef` 同名（含僅大小寫不同者）一律不重複宣告，
 * 改以 `Pick<ISkillDef, ...>` 繼承；兩側宣告衝突時本檔優先度最低，以 canonical 為準。
 * Fields duplicating `ISkillDef` (same name, including case-only variants) are never
 * re-declared here — they are inherited via `Pick<ISkillDef, ...>`. On conflict this file
 * has the lowest priority: canonical wins.
 */

import { EnumSkillType } from '../battle/enums';
import type { IPrimaryStat } from '#/lib/game/character/status-attrs';
import type { EnumStatusAttr } from '#/lib/game/character/status-enum';
import type { ISkillDef } from '#/lib/game/types';
import { EnumPosition } from '#/lib/game/constants';

// ==================== 子類型 / Sub-types ====================

/**
 * 能力值名稱（不含 HP/SP）/ Ability stat names (excluding HP/SP)
 * 對應 PHP Plus* 系列欄位
 * 由 lib 單一來源 PRIMARY_STATS 經顯示層轉大寫 derive，可追溯、非獨立來源。
 * Derived (uppercased) from lib's single source PRIMARY_STATS; traceable, not an independent source.
 */
export type IAbilityStatName = Uppercase<IPrimaryStat>;

// ==================== 分類介面 / Categorized Interfaces ====================

/**
 * 消費相關 / Consumption
 * 對應 PHP: sp, sacrifice, MagicCircleDeleteTeam
 *
 * `sp` 與 canonical `ISkillDef.sp` 同名（且為必填），故由 Pick 繼承、不在此重複宣告。
 * `sp` is a same-name duplicate of canonical `ISkillDef.sp` (and required), so it is
 * inherited via Pick rather than re-declared here.
 */
export interface ISkillCost extends Pick<ISkillDef, 'sp'>
{
	/** 犧牲比例 % / Sacrifice HP percentage */
	sacrificePct?: number;
	/** 消耗己方魔方陣數 / Magic circle consumption from own team */
	magicCircleCost?: number;
}

/**
 * 能力變動 / Stat changes
 * 對應 PHP: Up*, Down*, Plus* 系列欄位
 */
export interface ISkillStatChanges
{
	/** 臨時增益 % / Temporary buff percentages */
	upStats?: Partial<Record<EnumStatusAttr, number>>;
	/** 臨時減益 % / Temporary debuff percentages */
	downStats?: Partial<Record<EnumStatusAttr, number>>;
	/** 永久加算（無%）/ Permanent flat bonuses (no %) */
	plusStats?: Partial<Record<IAbilityStatName, number>>;
}

/**
 * 戰鬥標誌 / Battle flags
 * 對應 PHP: type, invalid, quick, passive, support, priority, CurePoison
 *
 * `priority` 與 canonical 同名同型、`curePoison` 與 canonical `CurePoison` 僅大小寫不同，
 * 兩者皆改由 `Pick<ISkillDef, ...>` 繼承；`skillType`/`is*` 為顯示層改名欄位，維持本檔宣告。
 * `priority` (same name/type) and `curePoison` (case-only variant of `CurePoison`) are inherited
 * via `Pick<ISkillDef, ...>`; `skillType`/`is*` are display-layer renames and stay declared here.
 */
export interface ISkillFlags extends Pick<ISkillDef, 'priority' | 'CurePoison'>
{
	/** 技能類型 / Skill damage type */
	skillType?: EnumSkillType;
	/** 防禦貫穿（穿透前衛守護）/ Guard bypass */
	isInvalid?: boolean;
	/** 可先行動（召喚後立即行動）/ Quick action after summon */
	isQuick?: boolean;
	/** 被動技能 / Passive skill */
	isPassive?: boolean;
	/** 支援魔法（不觸發守護，pow 改為回復）/ Support magic */
	isSupport?: boolean;
}

/**
 * 詠唱與硬直 / Charge & cooldown
 * 對應 PHP: charge[], stiff, delay
 *
 * `stiff` 與 canonical `ISkillSharedFields.stiff` 同名同型，改由 Pick 繼承、不重複宣告。
 * `stiff` duplicates canonical `ISkillSharedFields.stiff` (same name/type), so it is inherited.
 */
export interface ISkillCharge extends Pick<ISkillDef, 'stiff'>
{
	/** 詠唱時間 / Charge time */
	chargeTime?: number;
	/** 硬直時間 / Cooldown time */
	cooldownTime?: number;
	/** 行動延遲 % / Action delay percentage */
	delayPct?: number;
}

/**
 * 其他效果 / Other effects
 * 對應 PHP: poison, knockback, HpRegen, SpRegen, SpRecoveryRate,
 *          summon, move, umove, pierce, MagicCircleAdd/Delete/DeleteEnemy
 *
 * 標示之欄位與 canonical 同名（`hpRegen`/`spRegen`/`spRecoveryRate` 與 `magicCircle*`
 * 僅大小寫不同），一律由 `Pick<ISkillDef, ...>` 繼承；`poisonPct`/`knockbackPct`/`userMove`
 * 為顯示層改名欄位，維持本檔宣告。
 * The marked fields duplicate canonical ones (the `hpRegen`/`spRegen`/`spRecoveryRate` and
 * `magicCircle*` ones differ only by case) and are inherited via `Pick<ISkillDef, ...>`;
 * `poisonPct`/`knockbackPct`/`userMove` are display-layer renames and stay declared here.
 */
export interface ISkillEffects
	extends Pick<
		ISkillDef,
		| 'HpRegen'
		| 'SpRegen'
		| 'SpRecoveryRate'
		| 'summon'
		| 'move'
		| 'pierce'
		| 'MagicCircleAdd'
		| 'MagicCircleDelete'
		| 'MagicCircleDeleteEnemy'
	>
{
	/** 中毒率 % / Poison chance % */
	poisonPct?: number;
	/** 擊退率 %（後衛化）/ Knockback chance % */
	knockbackPct?: number;
	/** 使用者使用後移動 / User post-skill move */
	userMove?: EnumPosition;
}

// ==================== 主介面 / Main Interface ====================

/**
 * 技能資料（完整 PHP 欄位支援）
 * Skill data (full PHP field support)
 *
 * 分類組織，所有子介面欄位皆為可選，保持向下兼容。
 * Categorized; all sub-interface fields are optional for backward compatibility.
 *
 * `name`/`target`/`learn` 與 canonical 同名，改由 `Pick<ISkillDef, ...>` 繼承；
 * `target` 因此為 canonical 的 `ITargetSpec` 三元組（省略時預設 [Enemy, Individual, 1]），
 * 原本拆解出的 `scope`（target[1]）與 `hits`（target[2]）不再重複宣告，請直接解構 `target`。
 * `name`/`target`/`learn` duplicate canonical names and are inherited via `Pick<ISkillDef, ...>`;
 * `target` is therefore canonical's `ITargetSpec` tuple (defaults to [Enemy, Individual, 1] when
 * omitted), and the derived `scope` (target[1]) / `hits` (target[2]) fields are no longer
 * re-declared — destructure `target` instead.
 */
export interface ISkillData
	extends ISkillCost,
		ISkillStatChanges,
		ISkillFlags,
		ISkillCharge,
		ISkillEffects,
		Pick<ISkillDef, 'name' | 'target' | 'learn'>
{

	// ---------- 基本資訊 / Basic info ----------
	/** 技能編號 / Skill number (PHP: no) */
	skillNo?: number;
	/** 圖示 URL / Icon URL */
	iconUrl?: string;
	/** 技能說明文字 / Skill description (PHP: exp) */
	effect?: string;
	/** 習得所需點數 / Learn point cost (PHP: learn, 0=initial) */
	learnPts?: number;

	// ---------- 威力 / Power ----------
	/** 威力倍率 % / Power percentage (PHP: pow) */
	powerPct?: number;

	// ---------- 命中與詠唱 / Hit & charge ----------
	/**
	 * 命中率 / Hit rate
	 * - PHP charge[] 的簡化表示：格式 "詠唱:硬直" 或 "命中:迴避"
	 * - 若需完整 charge 資料，使用 chargeTime + cooldownTime
	 */
	hitRate?: string;

	// ---------- 武器限制 / Weapon limit ----------
	/** 武器限制（PHP limit 物件的 keys）/ Weapon restriction */
	weaponLimit?: string;

	// ---------- 向下兼容 / Backward compatibility ----------
	/** @deprecated 使用 sp 代替 / Use sp instead */
	spCost?: number;
	/** @deprecated 使用 effect 代替 / Use effect instead */
	extraAttrs?: string[];
}

// ==================== 職業相關 / Job-related ====================

/** 職業資料 / Job data */
export interface IJobData
{
	/** 職業 ID / Job ID */
	id: number;
	/** 職業名稱 / Job name */
	name: string;
	/** 上級職業 ID / Parent job ID (0 = base) */
	parentId: number;
	/** 職業描述 / Description */
	description: string;
	/** 角色精靈 URL / Character sprite URLs */
	spriteUrls: string[];
	/** 可裝備類型 / Equippable types */
	equipment: string[];
	/** 技能列表 / Skill list */
	skills: ISkillData[];
}

/** 職業樹節點 / Job tree node */
export interface IJobTreeNode
{
	/** 職業 / Job */
	job: IJobData;
	/** 子職業 / Child jobs */
	children: IJobTreeNode[];
}

/** GameData 頁面完整資料 / Complete GameData page data */
export interface IGameDataPageData
{
	/** 職業列表 / Job list */
	jobs: IJobData[];
}
