/**
 * GameData 類型定義
 * GameData type definitions
 *
 * 類別分類參考：PHP skill.detail.php + docs/data/skill.md
 * Category reference: PHP skill.detail.php + docs/data/skill.md
 */

import { EnumSkillType } from '../battle/enums';
import type {
	IStatusAttr,
	IPrimaryStat,
} from '#/lib/game/character/status-attrs';
import {
	EnumTargetType,
	EnumTargetMethod,
	EnumSkillPriority,
} from '#/lib/game/types';
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
 */
export interface ISkillCost {
  /** SP 消耗 / SP cost */
  sp?: number;
  /** 犧牲比例 % / Sacrifice HP percentage */
  sacrificePct?: number;
  /** 消耗己方魔方陣數 / Magic circle consumption from own team */
  magicCircleCost?: number;
}

/**
 * 能力變動 / Stat changes
 * 對應 PHP: Up*, Down*, Plus* 系列欄位
 */
export interface ISkillStatChanges {
  /** 臨時增益 % / Temporary buff percentages */
  upStats?: Partial<Record<IStatusAttr, number>>;
  /** 臨時減益 % / Temporary debuff percentages */
  downStats?: Partial<Record<IStatusAttr, number>>;
  /** 永久加算（無%）/ Permanent flat bonuses (no %) */
  plusStats?: Partial<Record<IAbilityStatName, number>>;
}

/**
 * 戰鬥標誌 / Battle flags
 * 對應 PHP: type, invalid, quick, passive, support, priority, CurePoison
 */
export interface ISkillFlags {
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
  /** 目標優先選擇 / Target priority */
  priority?: EnumSkillPriority;
  /** 解毒 / Cure poison */
  curePoison?: boolean;
}

/**
 * 詠唱與硬直 / Charge & cooldown
 * 對應 PHP: charge[], stiff, delay
 */
export interface ISkillCharge {
  /** 詠唱時間 / Charge time */
  chargeTime?: number;
  /** 硬直時間 / Cooldown time */
  cooldownTime?: number;
  /** 行動延遲 % / Action delay percentage */
  delayPct?: number;
  /** 行動後硬直 / Post-action stiff (100 = double interval) */
  stiff?: number;
}

/**
 * 其他效果 / Other effects
 * 對應 PHP: poison, knockback, HpRegen, SpRegen, SpRecoveryRate,
 *          summon, move, umove, pierce, MagicCircleAdd/Delete/DeleteEnemy
 */
export interface ISkillEffects {
  /** 中毒率 % / Poison chance % */
  poisonPct?: number;
  /** 擊退率 %（後衛化）/ Knockback chance % */
  knockbackPct?: number;
  /** 持續 HP 回復 / HP regeneration */
  hpRegen?: boolean;
  /** 持續 SP 回復 / SP regeneration */
  spRegen?: boolean;
  /** SP 回復倍率 / SP recovery rate multiplier */
  spRecoveryRate?: number;
  /** 召喚怪物編號 / Summon monster ID(s) */
  summon?: number | number[];
  /** 使用者隊列移動 / User position move */
  move?: EnumPosition;
  /** 使用者使用後移動 / User post-skill move */
  userMove?: EnumPosition;
  /** 防禦貫穿額外傷害 / Pierce damage (ignores DEF/MDEF) */
  pierce?: number;
  /** 魔方陣增加 / Magic circle add */
  magicCircleAdd?: number;
  /** 魔方陣消除 / Magic circle delete */
  magicCircleDelete?: number;
  /** 消除敵方魔方陣 / Delete enemy magic circle */
  magicCircleDeleteEnemy?: number;
}

// ==================== 主介面 / Main Interface ====================

/**
 * 技能資料（完整 PHP 欄位支援）
 * Skill data (full PHP field support)
 *
 * 分類組織，所有子介面欄位皆為可選，保持向下兼容。
 * Categorized; all sub-interface fields are optional for backward compatibility.
 */
export interface ISkillData
  extends ISkillCost,
    ISkillStatChanges,
    ISkillFlags,
    ISkillCharge,
    ISkillEffects {

  // ---------- 基本資訊 / Basic info ----------
  /** 技能編號 / Skill number (PHP: no) */
  skillNo?: number;
  /** 技能名稱 / Skill name */
  name: string;
  /** 圖示 URL / Icon URL */
  iconUrl?: string;
  /** 技能說明文字 / Skill description (PHP: exp) */
  effect?: string;
  /** 習得所需點數 / Learn point cost (PHP: learn, 0=initial) */
  learnPts?: number;

  // ---------- 目標與範圍 / Target & scope ----------
  /** 目標 / Target */
  target: EnumTargetType;
  /** 範圍 / Scope */
  scope: EnumTargetMethod;
  /** 攻擊/作用次數 / Hit count (PHP: target[2]) */
  hits?: number;

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

  // ---------- 學習點數（radio 模式用）/ Learn points (radio mode) ----------
  /** 學習所需技能點數（僅 radio 模式顯示）/ Learn points (radio mode only) */
  learn?: number;

  // ---------- 向下兼容 / Backward compatibility ----------
  /** @deprecated 使用 sp 代替 / Use sp instead */
  spCost?: number;
  /** @deprecated 使用 effect 代替 / Use effect instead */
  extraAttrs?: string[];
}

// ==================== 職業相關 / Job-related ====================

/** 職業資料 / Job data */
export interface IJobData {
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
export interface IJobTreeNode {
  /** 職業 / Job */
  job: IJobData;
  /** 子職業 / Child jobs */
  children: IJobTreeNode[];
}

/** GameData 頁面完整資料 / Complete GameData page data */
export interface IGameDataPageData {
  /** 職業列表 / Job list */
  jobs: IJobData[];
}
