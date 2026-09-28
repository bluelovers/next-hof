/**
 * 原始 YAML 資源型別 / Raw YAML resource types
 * 對應 HOF Resource/Char、Resource/Mon 目錄下的 char.*.yml / mon.*.yml 結構。
 * Mirrors the char.*.yml / mon.*.yml files under the HOF Resource/Char and Resource/Mon dirs.
 *
 * 原始資料的數值多為字串（`level: '1'`）、部分為數字（`maxhp: 30400`）。
 * 經實證掃描全部 149 個檔案，**唯一會解析為 `null` 的欄位是
 * `behavior.pattern[].quantity`**（來源檔寫入 `quantity: null`）；其餘欄位要嘛有值
 * （string/number/boolean），要嘛缺席（`undefined`）。
 * Most numeric values in the raw data are quoted strings (`level: '1'`), some are real
 * numbers (`maxhp: 30400`). An empirical scan of all 149 files shows the **only field that
 * parses to `null` is `behavior.pattern[].quantity`** (the source writes `quantity: null`);
 * every other field is either present (string/number/boolean) or absent (`undefined`).
 *
 * 因此 `| null` 只出現在 quantity，其餘以 `?`（undefined）表達缺席。
 * Hence `| null` appears only on quantity; absence is expressed with `?` (undefined).
 */

/**
 * 原始行為規則列（pattern 的一列）/ Raw pattern row inside `behavior.pattern`
 */
export interface IRawPatternItemYaml
{
	/** 判定碼（1000＝預設攻擊）/ judge code (1000 = default attack) */
	judge?: string | number;
	/**
	 * 回合門檻 / turn gate
	 *
	 * 唯一可能為 null 的欄位：來源檔寫入 `quantity: null`（0 的同義）；0＝恆可觸發。
	 * The only nullable field: the source writes `quantity: null` (meaning 0); 0 = always eligible.
	 */
	quantity?: string | number | null;
	/** 動作碼＝技能編號 / action code = skill number */
	action?: string | number;
}

/**
 * 原始 AI 行為定義 / Raw AI behavior definition
 */
export interface IRawBehaviorYaml
{
	/** 預期站位（front/back）/ intended position (front/back) */
	position?: string;
	/** 前排守護條件（always/never/life25/…；原始檔含筆誤 pro50）/ guard condition (always/never/life25/…; the source contains typos like pro50) */
	guard?: string;
	/** AI 行動規則列；空物件 `{ }` 表示無規則 / AI action rules; an empty object `{ }` means no rules */
	pattern?: IRawPatternItemYaml[] | Record<never, never>;
}

/**
 * 原始掉落與獎勵 / Raw reward block
 */
export interface IRawRewardYaml
{
	/** 金幣獎勵上限（通常為字串）/ gold reward cap (usually a string) */
	moneyhold?: string | number;
	/** 經驗獎勵上限 / exp reward cap */
	exphold?: string | number;
	/** 掉落表 { 道具編號: 數量或權重 }；值為字串 / drop table { item no: amount or weight }; values are strings */
	itemtable?: Record<string, string | number>;
}

/**
 * 原始裝備欄（char.*.yml `equip`）/ Raw equip block (char.*.yml `equip`)
 * 鍵為裝備欄位（main_hand/off_hand/armor），值為道具編號字串。
 * Keys are equip slots (main_hand/off_hand/armor); values are item-number strings.
 */
export type IRawEquipYaml = Partial<Record<string, string | number>>;

/**
 * 原始戰鬥核心欄位（角色與怪物共用）/ Raw combat-core fields (shared by char & mon)
 * 單一事實來源：char.*.yml 與 mon.*.yml 共同的基本欄位（編號、名稱、等級、六維、HP/SP）。
 * Single source of truth for the base fields shared by char.*.yml and mon.*.yml
 * (number, name, level, the six primary stats, and HP/SP).
 */
export interface IRawCombatCoreYaml
{
	/** 編號 / number */
	no: number;
	/** 名稱 / name */
	name: string;
	/** 等級 / level */
	level?: string | number;
	/** HP 上限 / max HP */
	maxhp?: string | number;
	/** 目前 HP / current HP */
	hp?: string | number;
	/** SP 上限 / max SP */
	maxsp?: string | number;
	/** 目前 SP / current SP */
	sp?: string | number;
	/** 力量 / strength */
	str?: string | number;
	/** 智力 / intelligence */
	int?: string | number;
	/** 敏捷 / dexterity */
	dex?: string | number;
	/** 速度 / speed */
	spd?: string | number;
	/** 幸運 / luck */
	luk?: string | number;
}

/**
 * 原始角色定義（char.*.yml）/ Raw player-character definition (char.*.yml)
 */
export interface IRawCharYaml extends IRawCombatCoreYaml
{
	/** 目前累積經驗 / accumulated exp */
	exp?: string | number;
	/** 職業編號 / job number */
	job?: string | number;
	/** 已習得技能編號 / learned skill numbers */
	skill?: (string | number)[];
	/** 擴充資料（recruit_money 等）/ extra data (recruit_money, ...) */
	data_ex?: Record<string, unknown>;
	/** 各欄位裝備 / equipped items per slot */
	equip?: IRawEquipYaml;
	/** AI 行為 / AI behavior */
	behavior?: IRawBehaviorYaml;
}

/**
 * 原始怪物定義（mon.*.yml）/ Raw monster definition (mon.*.yml)
 *
 * 注意原始檔欄位大小寫不一致：`special`（全小寫，防呆）與 `SPECIAL`（正式鍵）。
 * Note the source uses inconsistent casing: `special` (all lowercase, seen once) vs `SPECIAL` (the canonical key).
 */
export interface IRawMonYaml extends IRawCombatCoreYaml
{
	/** 圖示資源路徑 / icon asset path */
	img?: string;
	/** 特殊能力（正式鍵）/ special abilities (canonical key) */
	SPECIAL?: Record<string, string | number | boolean>;
	/** 特殊能力（全小寫防呆鍵；僅 mon.1000 出現且為空物件）/ special abilities (all-lowercase key; seen once in mon.1000 as an empty object) */
	special?: Record<string, string | number | boolean>;
	/** 基礎攻擊力 [物理, 魔法] / base attack [physical, magic] */
	atk?: (string | number)[];
	/** 基礎減傷四槽 [物理%, 物理定值, 魔法%, 魔法定值] / base reduction slots [phys %, phys flat, mag %, mag flat] */
	def?: (string | number)[];
	/** 說明資訊 / description info */
	info?: { desc?: string };
	/** 掉落與獎勵 / drop & reward */
	reward?: IRawRewardYaml;
	/** AI 行為 / AI behavior */
	behavior?: IRawBehaviorYaml;
	/** 工會怪出現週期（秒）/ union spawn cycle (seconds) */
	cycle?: string | number;
	/** 工會怪土地（背景）/ union land (background) */
	land?: string;
	/** 工會怪等級限制 / union level limit */
	lv_limit?: string | number;
	/** 隨行雜魚表 { 怪物編號: [權重, 0] } / escort table { monster no: [weight, 0] } */
	servant?: Record<string, (string | number)[]>;
	/** 隨行雜魚數量（字串）/ escort count (string) */
	servantAmount?: string | number;
	/** 必出隨行雜魚編號 / guaranteed escort monster numbers */
	servantSpecify?: (string | number)[];
}