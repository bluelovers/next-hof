import type { IStatsHpSpMax, IDescInfo } from './base-types';
import type { EnumGender } from './char-enum';
import type { EnumWeaponType } from './item-enum';
import type { IDataEx } from './data-ex-types';
import type { ITSRequiredWith } from 'ts-type';

/**
 * 職業的名稱與圖示
 */
export interface IJobNamedIcon
{
	/** 圖示路徑 / icon path */
	img?: string;
	/** 職業名稱 / job name */
	job_name?: string;
}

/**
 * 職業定義核心
 */
export interface IJobDefCore extends ITSRequiredWith<IJobNamedIcon, 'job_name'>
{
	/**
	 * 職業編號
	 */
	no: number;
	/** 職業編號欄位 */
	job?: number;
	/** 可裝備的武器／裝備型別 / equippable weapon/armor types */
	equip?: EnumWeaponType[];
	/** 職業能力值的成長係數，例如 maxhp/maxsp 與其他能力值 */
	coe?: IGrowthCoefficients;
	/** 依性別（{@link EnumGender}）覆寫名稱與圖示；未指定的欄位沿用職業預設值。 */
	gender?: Partial<Record<EnumGender, IJobNamedIcon>>;
	/** 職業說明資訊 */
	info?: IDescInfo;
	/** 職業專用的擴充資料，詳見 {@link IJobDataEx} */
	data_ex?: IDataEx;
}

export interface IJobDef extends IJobDefCore
{
	/** 職業階級（數字越小越高階）/ job rank (lower = higher tier) */
	rank?: number;
}

/**
 * 成長係數（maxhp/maxsp 及其餘六維）/ growth coefficients
 */
export interface IGrowthCoefficients extends IStatsHpSpMax
{

}
