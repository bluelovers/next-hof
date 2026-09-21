/**
 * GameData 類型定義
 * GameData type definitions
 */

/** 技能目標類型 / Skill target type */
export type ISkillTarget = 'enemy' | 'friend' | 'self';

/** 技能範圍 / Skill scope */
export type ISkillScope = 'normal' | 'multi' | 'all';

/** 技能資料 / Skill data */
export interface ISkillData {
  /** 技能名稱 / Skill name */
  name: string;
  /** 圖示 URL / Icon URL */
  iconUrl?: string;
  /** 目標 / Target */
  target: ISkillTarget;
  /** 範圍 / Scope */
  scope: ISkillScope;
  /** SP 消耗 / SP cost */
  spCost: number;
  /** 威力倍率 % / Power percentage */
  powerPct?: number;
  /** 攻擊次數 / Hit count */
  hits?: number;
  /** 命中率 / Hit rate (format: "n:m" or "n") */
  hitRate?: string;
  /** 武器限制 / Weapon restriction */
  weaponLimit?: string;
  /** 特殊效果說明 / Special effect description */
  effect?: string;
  /** 額外屬性標籤 / Extra attribute tags */
  extraAttrs?: string[];
}

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
