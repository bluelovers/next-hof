/**
 * 陣營側別 / Battle team side
 * 陣營以數值成員表示（Team0 / Team1），不用字串字面量。
 * Teams are represented by numeric enum members (Team0 / Team1), not string literals.
 */
export enum EnumTeamSide
{
	/** 陣營 0 / Team side 0 */
	Team0 = 0,
	/** 陣營 1 / Team side 1 */
	Team1 = 1,
}

/**
 * 角色狀態列舉 / Character state enumeration
 */
export enum EnumState
{
	/** 存活 / alive */
	Alive = 0,
	/** 死亡 / dead */
	Dead = 1,
	/** 中毒（CurePoison 判定所用狀態）/ poisoned (state checked by CurePoison) */
	Poison = 2,
	/** 二階中毒（目前無任何使用點）/ secondary poison (currently unused anywhere) */
	Poison2 = 3,
	/** 一般狀態（未中毒也未死亡）/ normal (neither poisoned nor dead) */
	Normal = 4,
}

/**
 * 隊伍位置列舉 / Formation position enumeration
 */
export enum EnumPosition
{
	/** 前衛（可守護後衛）/ front row (can guard the back row) */
	Front = 'front',
	/** 後衛（受前衛守護）/ back row (protected by front-row guard) */
	Back = 'back',
}

/**
 * 預期行為列舉 / Expected action enumeration
 */
export enum EnumExpect
{
	/** 蓄力預期 / charge expected */
	Charge = 'charge',
	/** 詠唱預期 / cast expected */
	Cast = 'cast',
}

/**
 * 防禦種類 / Guard kind
 *
 *
 * 決定前排守護者「何時替後排擋傷」（由 guard.ts guardActive() 逐次判定）：
 * - LifeNN：守護者自身 HP% <= NN 時生效（血量越低越常守）
 * - ProbNN：每次攻擊獨立擲骰 NN% 機率生效（需具備 rng，否則視為不發動）
 * - Always/Never：恆真／恆假；behavior.guard 省略時預設 Always
 */
export enum EnumGuardKind
{
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

