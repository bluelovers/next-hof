/**
 * YAML → 現有型別轉換器
 *
 * 原始 YAML 進入現有型別系統的唯一入口：既有實作只消費轉換後的定義型別，不直接接觸 YAML 欄位。
 * 數值字串／null／guard 筆誤／空物件等正規化已於讀取時完成（yaml-coerce），本層只承接乾淨值。
 */

import {
	EnumGender,
} from '#/lib/types/char-enum';
import { EnumSkillDamageType } from '#/lib/types/skill-enum';
import {
	EnumWeaponType,
} from '#/lib/types/item-enum';
import {
	IJobDefCore,
	type IJobNamedIcon,
	type IGrowthCoefficients,
	type IJobDef,
} from '#/lib/types/job-types';
import type { ISkillDef } from '#/lib/types/skill-types';
import type { ICharDef } from '#/lib/types/char-types';
import type { IItemDef } from '#/lib/types/item-types';
import type { IMonDef } from '#/lib/types/mon-types';
import type {
	IRawCharYaml,
	IRawMonYaml,
	IRawSkillYaml,
} from '#/lib/types/raw/yaml-types';
import { SKILL_EXTRA_NUMERIC_KEYS } from './yaml-skill-keys';
import { COMP_FIELDS } from '#/lib/game/character/status-attrs';
import { toNumberRecord } from './yaml-numeric';
import {
	INF_LOOKUP,
	ITEM_TYPE2_ALIASES,
	ITEM_TYPE_ALIASES,
	JOB_GENDER_ALIASES,
	SKILL_PRIORITY_LOOKUP,
	WEAPON_TYPE_LOOKUP,
} from './yaml-lookup';
import {
	convertBehaviorYaml,
	convertBonuses,
	convertCharge,
	convertCombatCoreYaml,
	convertEquipYaml,
	convertLimit,
	convertPosition,
	convertRewardYaml,
	convertServantYaml,
	convertSpecialYaml,
	convertTarget,
	copyNumericKeys,
	emptyToUndefined,
} from './yaml-convert-blocks';

/**
 * 角色轉換 / Convert a raw char YAML into ICharDef
 */
export function convertCharYaml(raw: IRawCharYaml): ICharDef
{
	return {
		...convertCombatCoreYaml(raw),
		exp: raw.exp,
		job: raw.job,
		skill: raw.skill,
		data_ex: raw.data_ex ? raw.data_ex : undefined,
		equip: convertEquipYaml(raw.equip),
		behavior: convertBehaviorYaml(raw.behavior),
	};
}

/**
 * 怪物轉換 / Convert a raw mon YAML into IMonDef
 */
export function convertMonYaml(raw: IRawMonYaml): IMonDef
{
	return {
		...convertCombatCoreYaml(raw),
		img: raw.img ?? undefined,
		atk: raw.atk,
		def: raw.def,
		SPECIAL: convertSpecialYaml(raw),
		info: raw.info && typeof raw.info.desc === 'string' ? { desc: raw.info.desc } : undefined,
		reward: convertRewardYaml(raw.reward),
		behavior: convertBehaviorYaml(raw.behavior),
		cycle: raw.cycle,
		land: raw.land ?? undefined,
		lv_limit: raw.lv_limit,
		servant: convertServantYaml(raw.servant),
		servantAmount: raw.servantAmount,
		servantSpecify: raw.servantSpecify,
	};
}

/**
 * 道具轉換 / Convert a raw item YAML into IItemDef
 */
export function convertItemYaml(raw: IItemDef): IItemDef
{
	const itemType = raw.type ? ITEM_TYPE_ALIASES[raw.type] : undefined;
	return {
		no: raw.no,
		name: raw.name,
		type: itemType ?? EnumWeaponType.Other,
		type2: raw.type2 !== undefined ? ITEM_TYPE2_ALIASES[raw.type2] : undefined,
		img: raw.img ?? undefined,
		buy: raw.buy,
		sell: raw.sell,
		atk: raw.atk,
		def: raw.def,
		dh: raw.dh,
		handle: raw.handle,
		need: toNumberRecord(raw.need),
		base_name: raw.base_name,
		P_SUMMON: raw.P_SUMMON,
		P_PIERCE: raw.P_PIERCE,
		...convertBonuses(raw),
	};
}

/**
 * 職業轉換 / Convert a raw job YAML into IJobDef
 * gender 鍵 1/2 → EnumGender；原始檔 pattern 恆為 null（無 AI 模式）→ 省略（undefined）。
 * gender keys 1/2 → EnumGender; the source `pattern: null` (no AI pattern) → omitted (undefined).
 */
export function convertJobYaml(raw: IJobDefCore): IJobDef
{
	const coe: IGrowthCoefficients = { ...raw.coe };

	const gender: Partial<Record<EnumGender, IJobNamedIcon>> = {};
	for (const [k, v] of Object.entries(raw.gender ?? {}))
	{
		const g = JOB_GENDER_ALIASES[k];
		if (g === undefined || !v) continue;
		gender[g] = { img: v.img, job_name: v.job_name };
	}

	return {
		/** 來源檔案漏寫 `no` 時以 0 兜底，確保倉庫鍵恆為 number（IJobDef.no） */
		no: raw.no ?? 0,
		job_name: raw.job_name,
		equip: raw.equip
			?.map((e) => WEAPON_TYPE_LOOKUP[String(e)])
			.filter((v): v is EnumWeaponType => v !== undefined),
		coe: emptyToUndefined(coe),
		img: raw.img,
		gender: emptyToUndefined(gender),
		info: raw.info && typeof raw.info.desc === 'string' ? { desc: raw.info.desc } : undefined,
	};
}

/**
 * 技能轉換 / Convert a raw skill YAML into ISkillDef
 * type '0'/'1' → EnumSkillDamageType；target/move/umove/inf/priority 以 enum 值直接對應。
 * type '0'/'1' → EnumSkillDamageType; target/move/umove/inf/priority map by enum values directly.
 */
export function convertSkillYaml(raw: IRawSkillYaml): ISkillDef
{
	const skill: ISkillDef = {
		no: raw.no,
		name: raw.name,
		img: raw.img,
		exp: raw.exp,
		sp: raw.sp ?? 0,
		type: (raw.type ?? 0) as EnumSkillDamageType,
		learn: raw.learn,
		target: convertTarget(raw.target),
		pow: raw.pow,
		hit: raw.hit,
		invalid: raw.invalid,
		support: raw.support,
		priority: raw.priority !== undefined ? SKILL_PRIORITY_LOOKUP[raw.priority] : undefined,
		charge: convertCharge(raw.charge),
		stiff: raw.stiff,
		inf: raw.inf !== undefined ? INF_LOOKUP[raw.inf] : undefined,
		HealBonus: raw.HealBonus,
		pierce: raw.pierce,
		delay: raw.delay,
		knockback: raw.knockback,
		poison: raw.poison,
		poisonResist: raw.poisonResist,
		summon: raw.summon,
		move: convertPosition(raw.move),
		umove: convertPosition(raw.umove),
		limit: convertLimit(raw.limit),
		passive: raw.passive,
		quick: raw.quick,
		sacrifice: raw.sacrifice,
		CurePoison: raw.CurePoison,
		HpRegen: raw.HpRegen,
		SpRegen: raw.SpRegen,
		revive: raw.revive,
		SpRecoveryRate: raw.SpRecoveryRate,
		MagicCircleAdd: raw.MagicCircleAdd,
		MagicCircleDelete: raw.MagicCircleDelete,
		MagicCircleDeleteTeam: raw.MagicCircleDeleteTeam,
		MagicCircleDeleteEnemy: raw.MagicCircleDeleteEnemy,
	};

	/**
	 * Plus*／Up*／Down* 29 鍵與補正 P_* / M_* 9 鍵：raw 端已於載入收斂為 number，
	 * 逐鍵搬移、略過未定義者，兩端皆不逐鍵手寫。
	 */
	copyNumericKeys(skill, raw, SKILL_EXTRA_NUMERIC_KEYS);
	copyNumericKeys(skill, raw, COMP_FIELDS);

	if (raw.p_maxhp !== undefined) skill.P_MAXHP = raw.p_maxhp;

	return skill;
}
