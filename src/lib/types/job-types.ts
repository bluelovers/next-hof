import type { IStatsHpSpMax, IDescInfo } from './base-types';
import type { EnumGender } from './char-enum';
import type { EnumWeaponType } from './item-enum';
import type { IDataEx } from './data-ex-types';
import type { ITSRequiredWith } from 'ts-type';

/**
 * 職業的名稱與圖示 / A job's name & icon
 *
 * 「`job_name` + `img`」這一對欄位的**單一事實來源**，只在此宣告一次：
 * 職業本體與性別覆寫共用同一形狀，兩側都不再各自重寫。
 * Single source of truth for the `job_name` + `img` pair, declared here exactly once: the job
 * itself and its gender overrides share the shape, so neither side re-declares it.
 *
 * 命名取「職業的名稱＋圖示」而非「覆寫」：本型別同時承載「職業本體」與「性別覆寫」兩種角色，
 * 只描述欄位內容，不描述它在某處的用途。
 * The name says "a job's name & icon" rather than "an override", because the type plays both
 * roles — it describes the fields, not the role they happen to play at one call site.
 */
export interface IJobNamedIcon
{
	/** 圖示路徑 / icon path */
	img?: string;
	/** 職業名稱 / job name */
	job_name?: string;
}

/**
 * 職業定義核心 / Job definition core
 *
 * 約束：職業本體的 `job_name` 必填（自 IJobNamedIcon 收窄），而 `img` 與 `gender` 內的
 * 性別覆寫欄位皆可省略——省略即沿用職業預設，不補空字串。
 * Constraint: a job's own `job_name` is required (narrowed from IJobNamedIcon), while `img`
 * and every per-gender field inside `gender` stay optional — omitted means "keep the job
 * default", not "empty string".
 */
export interface IJobDefCore extends ITSRequiredWith<IJobNamedIcon, 'job_name'>
{
	/**
	 * 職業編號（yaml-load 的 `COERCE_SPECS` 於讀取時收斂為 number）
	 * job number (yaml-load's `COERCE_SPECS` coerces it to number at read time)
	 */
	no: number;
	/** 職業編號欄位（no 之外的另一份）/ job number (a duplicate seat alongside `no`) */
	job?: number;
	/** 可裝備的武器／裝備型別 / equippable weapon/armor types */
	equip?: EnumWeaponType[];
	/** 成長係數（maxhp/maxsp 及其餘六維的成長率）/ growth coefficients (IGrowthCoefficients) */
	coe?: IGrowthCoefficients;
	/** 依性別（EnumGender）覆寫名稱與圖示 / per-gender (EnumGender) name & icon overrides */
	gender?: Partial<Record<EnumGender, IJobNamedIcon>>;
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
