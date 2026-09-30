/**
 * 職業型別 / Job type definitions
 * 性別覆寫、職業定義與成長係數集中於本檔。
 * Gender overrides, job definitions and growth coefficients live here.
 */

import type { IStatsHpSpMax, IDescInfo } from './base-types';
import type { EnumGender } from './char-enum';
import type { EnumWeaponType } from './item-enum';
import type { IDataEx } from './data-ex-types';
import type { IResourceId } from './seg-types';
import type { ITSRequiredWith } from 'ts-type';

/**
 * 性別專屬的名稱與圖示覆寫 / Gender-specific name & icon overrides
 * 介面 / interface
 */
export interface IGenderOverride
{
	/** 圖示路徑（覆寫職業預設 img）/ icon path (overrides the job default img) */
	img?: string;
	/** 性別專屬職業名稱（覆寫 job_name）/ gender-specific job name (overrides job_name) */
	job_name?: string;
}

/**
 * 職業定義核心 / Job definition core
 * 介面 / interface
 */
export interface IJobDefCore extends ITSRequiredWith<IGenderOverride, 'job_name'>
{
	/** 職業編號（資料來源可能為字串）/ job number (may arrive as a string in raw data) */
	no: IResourceId;
	/** 職業編號欄位（no 之外的另一份）/ job number (a duplicate seat alongside `no`) */
	job?: number;
	/** 可裝備的武器／裝備型別 / equippable weapon/armor types */
	equip?: EnumWeaponType[];
	/** 成長係數（maxhp/maxsp 及其餘六維的成長率）/ growth coefficients (IGrowthCoefficients) */
	coe?: IGrowthCoefficients;
	/** 依性別（EnumGender）區分的名稱與圖示 / per-gender (EnumGender) name and icon overrides */
	gender?: Partial<Record<EnumGender, IGenderOverride>>;
	/** 職業說明資訊 / job description info（IDescInfo） */
	info?: IDescInfo;
	/** 擴充資料（共用 IDataEx；job 用 job_base＋job_conditions）/ extra data (shared IDataEx; job uses job_base + job_conditions) */
	data_ex?: IDataEx;
}

export interface IJobDef extends IJobDefCore
{
	/** 職業階級（數字越小越高階）/ job rank (lower = higher tier) */
	rank?: number;
}

/**
 * 成長係數（maxhp/maxsp 及其餘六維）/ growth coefficients
 * IJobDef.coe 與 raw coe 皆引用。
 * Referenced by IJobDef.coe and the raw coe shape.
 */
export interface IGrowthCoefficients extends IStatsHpSpMax
{

}
