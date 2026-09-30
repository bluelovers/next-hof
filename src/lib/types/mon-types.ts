import type { IDescInfo, IEncounterTable, INamedIconDef, INumberTable } from './base-types';
import type { ICharCore } from './char-types';

/**
 * 怪物/召喚/獨特怪物獎勵 / Monster / summon / union reward
 */
export interface IMonReward
{
	/** 金幣獎勵上限（moneyhold：超過此值不再累積）/ gold reward cap (gold stops accumulating past this) */
	moneyhold?: number;
	/** 經驗獎勵上限（exphold：超過此值不再累積）/ exp reward cap (exp stops accumulating past this) */
	exphold?: number;
	/** 掉落表 { 道具編號: 數量或權重 } / drop table (INumberTable) */
	itemtable?: INumberTable;
}

/**
 * 怪物附加欄位（`IMonDef` 與 raw `IRawMonYaml` 同形）
 * Monster extra fields shared by `IMonDef` and raw `IRawMonYaml`
 *
 * 說明、掉落與獨特怪物細節（週期／土地／等級限制／隨行表）在兩層的名稱、選取性、型別
 * 完全一致，於此定義一次、兩側皆 `extends` 繼承；`SPECIAL`／`behavior` 另見
 * ISpecialField／IBehaviorField。
 * Description, drops and union-monster details are identical on both sides, so both extend
 * this interface; `SPECIAL` / `behavior` live in ISpecialField / IBehaviorField.
 *
 * 使用方 / Consumers: `IMonDef`（target）與 raw `IRawMonYaml`
 */
export interface IMonExtraFields
{
	/** 掉落與獎勵設定（省略＝無獎勵）/ drop & reward settings (omitted = no reward) */
	reward?: IMonReward;
	/** 怪物說明資訊（YAML `info`；例如技能說明）/ monster description info (IDescInfo) */
	info?: IDescInfo;
	/**
	 * 獨特怪物出現週期（秒；YAML `cycle`） / union monster spawn cycle (seconds; YAML `cycle`)
	 * 目前僅資料層保留 / data-layer only
	 */
	cycle?: number;
	/** 獨特怪物所在土地（背景；YAML `land`）/ union monster land/background (YAML `land`) */
	land?: string;
	/** 獨特怪物等級限制（YAML `lv_limit`）/ union monster level limit (YAML `lv_limit`) */
	lv_limit?: number;
}

export interface IMonExtraFieldsServant
{
	/**
	 * 獨特怪物隨行雜魚表 { 怪物編號: [出現權重, 0] }（YAML `servant`）
	 * union escort table { monster no: [spawn weight, 0] } (YAML `servant`)
	 * 目前僅資料層保留 / data-layer only
	 */
	servant?: IEncounterTable;
	/** 隨行雜魚數量（YAML `servantAmount`）/ escorted minion count (YAML `servantAmount`); data-layer only */
	servantAmount?: number;
	/** 必出隨行雜魚編號（YAML `servantSpecify`）/ guaranteed escort minion nos (YAML `servantSpecify`); data-layer only */
	servantSpecify?: number[];
}

/**
 * 怪物定義 / Monster definition
 */
export interface IMonDef extends ICharCore, IMonExtraFields, IMonExtraFieldsServant, INamedIconDef
{
	/**
	 * 獨特怪物標記 / union-monster flag
	 *
	 * 目前僅資料層保留：引擎以 factory.newUnion() 疊加 EnumCharType.Union，尚未讀取本欄。
	 * Data-layer only: the engine stacks EnumCharType.Union via factory.newUnion() and does not read this field yet.
	 */
	isUnion?: boolean;
}
