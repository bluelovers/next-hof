// 判定碼與預設模式常量 / Judge codes and default pattern constants
// 單一事實來源：所有 judge code、預設 action、pattern 預設值集中定義於此。
// Single source of truth: all judge codes, default actions, and pattern defaults are centralized here.

/** AI 判定碼 / AI judge codes */
export enum EnumJudgeCode {
	/** 預設攻擊 / default attack */
	DefaultAttack = 1000,
	/** 恆真判定 / always true judge */
	AlwaysTrue = 1001,
	/** HP% ≤ 40 判定 / HP% ≤ 40 judge */
	LowHp40 = 1101,
	/** 逃跑判定 / flee judge */
	Flee = 1405,
	/** 約 10% 機率特殊觸發 / ~10% chance special trigger */
	SpecialTrigger = 1940,
	/** 動作碼（非判定）/ action code (not a judge) */
	ActionCode = 9000,
	/** HP 相關（預設不觸發）/ HP related (default non-triggering) */
	HpRelated = 1205,
}

/** 空殼判定碼範圍 / Empty-shell judge code range */
export const EMPTY_SHELL_JUDGE_RANGE = { min: 1300, max: 1381 } as const;

/** 預設模式前置：逃跑 / Default pattern prelude: flee */
export const DEFAULT_PATTERN_FLEE = { judge: EnumJudgeCode.Flee, quantity: 1, action: EnumJudgeCode.ActionCode } as const;

/** 復活技能編號 / Revive skill number (default action for special pattern) */
export const REVIVE_SKILL_NO = 3040;

/** 預設模式前置：特殊/復活 / Default pattern prelude: special/revive */
export const DEFAULT_PATTERN_SPECIAL = { judge: EnumJudgeCode.SpecialTrigger, quantity: 10, action: REVIVE_SKILL_NO } as const;

/** 預設模式收尾 / Default pattern tail */
export const DEFAULT_PATTERN_TAIL = { judge: EnumJudgeCode.DefaultAttack, quantity: 0, action: EnumJudgeCode.DefaultAttack } as const;

/** 判定碼 1101 的 HP% 閾值 / HP% threshold for judge code 1101 */
export const LOW_HP_THRESHOLD = 40;

/** 判定碼 1940 的觸發機率（百分比）/ Trigger chance for judge code 1940 (percentage) */
export const SPECIAL_TRIGGER_CHANCE = 10;

/** 判定碼範圍檢查工具 / Judge code range check utility */
export function isInEmptyShellRange(code: number): boolean {
	return code >= EMPTY_SHELL_JUDGE_RANGE.min && code <= EMPTY_SHELL_JUDGE_RANGE.max;
}

/** 預設攻擊判定碼 / Whether code is the default attack judge */
export function isDefaultAttackCode(code: number): boolean {
	return code === EnumJudgeCode.DefaultAttack || code === EnumJudgeCode.AlwaysTrue;
}
