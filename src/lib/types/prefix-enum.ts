/**
 * 前綴 enum
 *
 * 衍生鍵名時一律引用此處 enum，不在呼叫處拼接裸字串。
 */

/**
 * 狀態操作前綴 / Status operation prefixes
 * 僅用於由 EnumStatusAttr 衍生 Up* / Down* / Plus* 操作鍵名，與補正欄位前綴無關。
 * Used solely to derive Up* / Down* / Plus* op keys from EnumStatusAttr; unrelated to comp-field prefixes.
 */
export enum EnumStatusPrefix
{
	/** 增益前綴 / Up prefix */
	Up = 'Up',
	/** 減益前綴 / Down prefix */
	Down = 'Down',
	/** 永久加成前綴 / Plus prefix */
	Plus = 'Plus',
}

/**
 * 補正欄位前綴 / Compensation field prefixes
 * P_ 為定值加成、M_ 為百分比加成；用途與狀態操作前綴（EnumStatusPrefix）不同，故獨立成 enum。
 */
export enum EnumCompPrefix
{
	/** 定值加成前綴（P_*）/ flat-add prefix (P_*) */
	Flat = 'P_',
	/** 百分比加成前綴（M_*）/ percent-scale prefix (M_*) */
	Percent = 'M_',
}
