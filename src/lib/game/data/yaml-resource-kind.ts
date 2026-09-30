/**
 * 資源種類 / Resource kind
 *
 * 成員值即 Resource 底下的子目錄名（`Char` → `root/Char`），因此改名等於改動磁碟路徑，
 * 必須與既有資源目錄同步。
 * Member values are the sub-directory names under Resource (`Char` → `root/Char`), so renaming
 * a member renames an on-disk path and must be synced with the resource directories.
 */
export enum EnumResourceKind
{
	/** 角色 / player characters */
	Char = 'Char',
	/** 怪物 / monsters */
	Mon = 'Mon',
	/** 道具 / items */
	Item = 'Item',
	/** 職業 / jobs */
	Job = 'Job',
	/** 技能 / skills */
	Skill = 'Skill',
	/** 守護設定 / guard settings */
	Guard = 'Guard',
	/** 判定碼 / judge codes */
	Judge = 'Judge',
	/** 土地 / lands */
	Land = 'Land',
	/** 技能樹 / skill trees */
	Skilltree = 'Skilltree',
	/** 獨特怪物 / unions */
	Union = 'Union',
}
