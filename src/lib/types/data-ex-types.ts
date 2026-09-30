/**
 * 擴充資料型別 / Extra-data (data_ex) type definitions
 * char／job／union 三種資源各自的 data_ex 切面與組合介面 IDataEx 集中於本檔。
 * The per-kind data_ex slices (char / job / union) and the aggregate IDataEx live here.
 */

import type { IResourceId } from './seg-types';

/**
 * 角色擴充資料（char data_ex）/ char extra data
 * 來源欄位目前僅 recruit_money（雇用費用）。
 * The source currently only carries recruit_money (hire cost).
 */
export interface ICharDataEx
{
	/** 雇用費用（char）/ hire cost (char) */
	recruit_money?: number;
}

/**
 * 職業擴充資料（job data_ex）/ job extra data
 * 對應 PHP `getJobConditions()` 讀取的 `data_ex['job_conditions']['job_from']`。
 * Matches the `data_ex['job_conditions']['job_from']` that getJobConditions() reads.
 */
export interface IJobDataEx
{
	/** 基礎職業 / base job */
	job_base?: number;
	/** 轉職條件（含 job_from 來源職業表）/ job-change conditions (incl. the job_from source table) */
	job_conditions?: {
		/** 轉職來源 { 職業編號: 等級條件 } / source jobs { job no: level condition } */
		job_from?: Record<IResourceId, { lv?: number }>;
	};
}

/** 獨特怪物展示資料（union data_ex）/ union display data */
export interface IUnionDataEx
{
	/** 獨特怪物名稱 / union name */
	name?: string;
	/** 等級 / level */
	level?: number;
	/** 圖示資源路徑 / icon asset path */
	img?: string;
	/** 土地 / land */
	land?: string;
	/** 出現週期（秒）/ spawn cycle in seconds */
	cycle?: number;
}

/**
 * 資源擴充資料（全部資源共用的單一 data_ex 定義）/ unified extra-data definition shared by all kinds
 * 由各 kind 基底組合而成（extends ICharDataEx、IJobDataEx、IUnionDataEx）；
 * 每個切面各自定義一次，IDataEx 只做組合。
 * Composed from the per-kind bases (extends ICharDataEx, IJobDataEx, IUnionDataEx);
 * each slice is defined once and IDataEx only aggregates.
 */
export interface IDataEx extends ICharDataEx, IJobDataEx, IUnionDataEx
{
}
