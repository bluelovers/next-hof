/**
 * 技能 Plus* 永久加算欄位 / Skill Plus* permanent flat-bonus fields
 *
 * 永久加算 Plus*（無 %）：作用於目標（對齊原始 StatusChanges 全部作用在 $target），僅 PLUSMAP
 * 已註冊屬性生效。statusChanges 依鍵名前綴分派至 UPMAP/DOWNMAP/PLUSMAP，本組欄位承載 PLUSMAP 分支。
 *
 * 有意保留顯式欄位而非由 EnumStatusAttr 衍生：PLUSMAP 只註冊六維＋MAXHP/MAXSP，
 * 顯式列出可讓 PlusATK 等未註冊鍵在編譯期即被拒絕，避免「型別通過但執行期 no-op」的靜默失效。
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
