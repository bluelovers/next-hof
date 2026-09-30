/**
 * enum 對照表
 *
 * 以 enum 成員值建立自我對照表：新增成員時自動涵蓋，不需在各轉換器手寫鍵值；
 * 來源特有的值（`Key`→`Other`、`GUARD`→`Armor`、性別 `1`/`2`）以 `aliases` 參數登記收斂規則。
 */

import { EnumGender } from '#/lib/types/char-enum';
import { EnumItemCategory, EnumWeaponType } from '#/lib/types/item-enum';
import { EnumInfluence, EnumSkillPriority } from '#/lib/types/skill-enum';

/**
 * 值是否為該列舉的成員 / Whether a value is a member of the enum
 *
 * 以「成員值集合」比對（字串 enum 的值即字面，故集合比對即可判定），
 * 讓轉換器免於 `value as EnumXxx` 這種繞過檢查的斷言。
 * Matches against the member-value set (a string enum's value IS its literal, so a set
 * membership test is sound), sparing converters the check-bypassing `value as EnumXxx`
 * assertion.
 *
 * @param value 待驗證的來源字串 / the source string to validate
 * @param values 列舉成員值（`Object.values(SomeEnum)`）/ enum member values (`Object.values(SomeEnum)`)
 */
export function isEnumValue<T extends string>(value: string, values: readonly T[]): value is T
{
	return (values as readonly string[]).includes(value);
}

/**
 * enum 值 → 自我對照表 / Build a value-to-value lookup from an enum
 *
 * 新增 enum 成員時自動涵蓋；`aliases` 登記來源特有值的收斂規則。
 */
export function enumValueLookup<T extends string>(
	values: readonly T[],
	aliases?: Record<string, T>,
): Record<string, T>
{
	const table = Object.fromEntries(values.map((v) => [v, v])) as Record<string, T>;
	return aliases ? { ...table, ...aliases } : table;
}

/** 武器型別對照（EnumWeaponType 成員值）/ weapon-type lookup from EnumWeaponType */
export const WEAPON_TYPE_LOOKUP: Record<string, EnumWeaponType> = enumValueLookup(Object.values(EnumWeaponType));

/** 技能優先條件對照 / skill-priority lookup from EnumSkillPriority */
export const SKILL_PRIORITY_LOOKUP: Record<string, EnumSkillPriority> = enumValueLookup(Object.values(EnumSkillPriority));

/** 傷害參照能力對照 / influencing-stat lookup from EnumInfluence */
export const INF_LOOKUP: Record<string, EnumInfluence> = enumValueLookup(Object.values(EnumInfluence));

/**
 * item type 對照 / item-type lookup
 * Key/Map/Special 無對應 EnumWeaponType 成員 → 收斂為 Other（保留道具本體資料）。
 * Key/Map/Special have no EnumWeaponType member, so they collapse to Other (the item body is kept).
 */
export const ITEM_TYPE_ALIASES: Record<string, EnumWeaponType> = enumValueLookup(
	Object.values(EnumWeaponType),
	{
		Key: EnumWeaponType.Other,
		Map: EnumWeaponType.Other,
		Special: EnumWeaponType.Other,
	},
);

/**
 * item type2 對照 / item type2 lookup
 * GUARD（防具類別）無對應 EnumItemCategory 成員 → 映射至 Armor。
 * GUARD (defensive equipment) has no member, so it maps to Armor.
 */
export const ITEM_TYPE2_ALIASES: Record<string, EnumItemCategory> = enumValueLookup(
	Object.values(EnumItemCategory),
	{ GUARD: EnumItemCategory.Armor },
);

/**
 * job gender 鍵對照 / job gender-key lookup
 * 原始檔鍵 1=男、2=女；EnumGender.Male=0、Female=1。
 * Source keys are 1 = male, 2 = female; EnumGender.Male = 0, Female = 1.
 */
export const JOB_GENDER_ALIASES: Record<string, EnumGender> = {
	'1': EnumGender.Male,
	'2': EnumGender.Female,
};
