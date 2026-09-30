/**
 * 技能 Plus* 永久加算欄位 / Skill Plus* permanent flat-bonus fields
 *
 * 永久加算 Plus*（無 %）：作用於目標（對齊原始 StatusChanges 全部作用在 $target），僅 PLUSMAP
 * 已註冊屬性生效。statusChanges 依鍵名前綴分派至 UPMAP/DOWNMAP/PLUSMAP，本組欄位承載 PLUSMAP 分支。
 * Permanent flat Plus* bonus (no %): applied to the target (mirrors original StatusChanges applying
 * everything to $target); only PLUSMAP-registered stats take effect. statusChanges dispatches by key
 * prefix to UPMAP/DOWNMAP/PLUSMAP; this field group feeds the PLUSMAP branch.
 *
 * 有意保留顯式欄位而非由 EnumStatusAttr 衍生：PLUSMAP 只註冊六維＋MAXHP/MAXSP，
 * 顯式列出可讓 PlusATK 等未註冊鍵在編譯期即被拒絕，避免「型別通過但執行期 no-op」的靜默失效。
 * Deliberately explicit instead of derived from EnumStatusAttr: PLUSMAP registers only the six base
 * stats plus MAXHP/MAXSP, so unregistered keys (PlusATK etc.) stay compile-time errors rather
 * than accepted fields that silently no-op at runtime.
 */
export interface ISkillPlusFields
{
	PlusSTR?: number;
	PlusINT?: number;
	PlusDEX?: number;
	PlusSPD?: number;
	PlusLUK?: number;
	PlusMAXHP?: number;
	PlusMAXSP?: number;
}
