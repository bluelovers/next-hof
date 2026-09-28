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

/**
 * 原始道具定義（Item/item.*.yml）/ Raw item definition (Item/item.*.yml)
 */
export interface IRawItemYaml
{
	/** 道具編號 / item number */
	no: string | number;
	/** 名稱 / name */
	name: string;
	/** 武器／裝備型別（PascalCase；含 Key/Map/Special 等無對應成員的值）/ weapon/equipment type (PascalCase; includes values like Key/Map/Special without enum members) */
	type?: string;
	/** 類別細分（WEAPON / GUARD / OTHER）/ sub-category (WEAPON / GUARD / OTHER) */
	type2?: string;
	/** 圖示資源路徑 / icon asset path */
	img?: string;
	/** 購入價格 / buy price */
	buy?: string | number;
	/** 賣出價格 / sell price */
	sell?: string | number;
	/** 攻擊力 [物理, 魔法] / attack [physical, magic] */
	atk?: (string | number)[];
	/** 減傷四槽 / four reduction slots */
	def?: (string | number)[];
	/** 雙手武器標記 / two-handed flag */
	dh?: boolean | string | number;
	/** 裝備負荷 / equipment weight */
	handle?: string | number;
	/** 習得條件 { 職業編號: 等級 } / learn requirement { job number: level } */
	need?: Record<string, string | number>;
	/** 強化後基礎道具名 / base item name after refinement */
	base_name?: string;
	/** 附加召喚效果值 / attached summon bonus */
	P_SUMMON?: string | number;
	/** 附加貫穿效果值 / attached pierce bonus */
	P_PIERCE?: string | number;
	/** 補正欄位（ICompBonuses 的 9 鍵）/ compensation fields (the 9 ICompBonuses keys) */
	P_STR?: string | number;
	P_INT?: string | number;
	P_DEX?: string | number;
	P_SPD?: string | number;
	P_LUK?: string | number;
	P_MAXHP?: string | number;
	P_MAXSP?: string | number;
	M_MAXHP?: string | number;
	M_MAXSP?: string | number;
}

/**
 * 原始職業定義（Job/job.*.yml）/ Raw job definition (Job/job.*.yml)
 */
export interface IRawJobYaml
{
	/** 職業編號（原始檔為字串，如 '100'）/ job number (a string in the source, e.g. '100') */
	no?: string | number;
	/** 職業名稱 / job name */
	job_name?: string;
	/** 職業編號欄位（no 之外的另一份）/ job number (a duplicate seat alongside `no`) */
	job?: string | number;
	/** 可裝備的武器／裝備型別 / equippable weapon/armor types */
	equip?: (string | number)[];
	/** 成長係數 / growth coefficients */
	coe?: Record<string, string | number>;
	/** 行為樣式（原始檔恆為 null）/ behavior pattern (always null in the source) */
	pattern?: unknown | null;
	/** 職業圖示 / job icon */
	img?: string;
	/** 依性別區分的名稱／圖示（鍵為 1=男、2=女）/ per-gender name/icon (keys: 1 = male, 2 = female) */
	gender?: Record<string, { img?: string; job_name?: string }>;
	/** 說明資訊 / description info */
	info?: { desc?: string };
	/** 擴充資料 / extra data */
	data_ex?: Record<string, unknown>;
}

/**
 * 原始技能定義（Skill/skill.*.yml）/ Raw skill definition (Skill/skill.*.yml)
 * 僅收錄轉換所需的欄位；source 內尚有 name2 等未收錄鍵。
 * Only the fields required by conversion are declared; the source also has uncatalogued keys like `name2`.
 */
export interface IRawSkillYaml
{
	/** 技能編號 / skill number */
	no: string | number;
	/** 技能名稱 / name */
	name: string;
	/** 圖示資源路徑 / icon asset path */
	img?: string;
	/** 說明文字 / description text */
	exp?: string;
	/** SP 消耗 / SP cost */
	sp?: string | number;
	/** 傷害類型（0=物理、1=魔法）/ damage type (0 = physical, 1 = magic) */
	type?: string | number;
	/** 習得所需技能點 / skill points to learn */
	learn?: string | number;
	/** 目標規格 [類型, 方式, 數量] / target spec [type, method, count] */
	target?: (string | number)[];
	/** 威力倍率 % / power % */
	pow?: string | number;
	/** 命中率 / hit rate */
	hit?: string | number;
	/** 防禦貫穿旗標 / guard-bypass flag */
	invalid?: string | number | boolean;
	/** 支援魔法旗標 / support-magic flag */
	support?: string | number | boolean;
	/** 被動技能旗標 / passive flag */
	passive?: string | number | boolean;
	/** 快速行動旗標 / quick-action flag */
	quick?: string | number | boolean;
	/** 目標優先條件 / target priority */
	priority?: string;
	/** 詠唱/蓄力 [詠唱時間, 硬直] / charge [cast time, stiff] */
	charge?: (string | number)[];
	/** 行動後硬直 % / post-action stiff % */
	stiff?: string | number;
	/** 傷害參照能力 / influencing stat */
	inf?: string;
	/** 回復加成 / heal bonus */
	HealBonus?: string | number;
	/** 貫穿旗標 / pierce flag */
	pierce?: string | number | boolean;
	/** 行動延遲速率 % / action delay rate % */
	delay?: string | number;
	/** 擊退率 % / knockback % */
	knockback?: string | number;
	/** 施毒機率 % / poison chance % */
	poison?: string | number;
	/** 抗毒增益 % / poison-resist gain % */
	poisonResist?: string | number;
	/** 召喚怪物編號 / summon monster number */
	summon?: string | number | (string | number)[];
	/** 施放後自身移動 / self movement after casting */
	move?: string;
	/** 使用後移動方向 / post-use movement */
	umove?: string;
	/** 武器限制 / weapon-type restriction */
	limit?: Record<string, boolean | string | number>;
	/** 犧牲比例 % / sacrifice % */
	sacrifice?: string | number;
	/** 解毒旗標 / cure-poison flag */
	CurePoison?: string | number | boolean;
	/** HP 回復 % / HP regen % */
	HpRegen?: string | number;
	/** SP 回復 % / SP regen % */
	SpRegen?: string | number;
	/** 蘇生旗標 / revive flag */
	revive?: string | number | boolean;
	/** SP 回復倍率 / SP recovery rate multiplier */
	SpRecoveryRate?: string | number;
	/** 增加己方魔方陣數 / add own magic circles */
	MagicCircleAdd?: string | number;
	/** 消除己方魔方陣數 / remove own magic circles */
	MagicCircleDelete?: string | number;
	/** 消耗己方魔方陣數 / consume own magic circles */
	MagicCircleDeleteTeam?: string | number;
	/** 消除敵方魔方陣數 / remove enemy magic circles */
	MagicCircleDeleteEnemy?: string | number;
	/** 永久加算 Plus*（7 鍵）/ permanent flat Plus* bonuses (7 keys) */
	PlusSTR?: string | number;
	PlusINT?: string | number;
	PlusDEX?: string | number;
	PlusSPD?: string | number;
	PlusLUK?: string | number;
	PlusMAXHP?: string | number;
	PlusMAXSP?: string | number;
	/** 補正欄位（ICompBonuses 9 鍵；含小寫變體 p_maxhp）/ compensation fields (the 9 ICompBonuses keys; incl. the lowercase variant p_maxhp) */
	P_STR?: string | number;
	P_INT?: string | number;
	P_DEX?: string | number;
	P_SPD?: string | number;
	P_LUK?: string | number;
	P_MAXHP?: string | number;
	p_maxhp?: string | number;
	P_MAXSP?: string | number;
	M_MAXHP?: string | number;
	M_MAXSP?: string | number;
	/** 臨時增益 Up*（11 鍵）/ temporary buff Up* fields (11 keys) */
	UpSTR?: string | number;
	UpINT?: string | number;
	UpDEX?: string | number;
	UpSPD?: string | number;
	UpLUK?: string | number;
	UpATK?: string | number;
	UpMATK?: string | number;
	UpDEF?: string | number;
	UpMDEF?: string | number;
	UpMAXHP?: string | number;
	UpMAXSP?: string | number;
	/** 臨時減益 Down*（11 鍵）/ temporary debuff Down* fields (11 keys) */
	DownSTR?: string | number;
	DownINT?: string | number;
	DownDEX?: string | number;
	DownSPD?: string | number;
	DownLUK?: string | number;
	DownATK?: string | number;
	DownMATK?: string | number;
	DownDEF?: string | number;
	DownMDEF?: string | number;
	DownMAXHP?: string | number;
	DownMAXSP?: string | number;
}

/**
 * 原始守護設定（Guard/guard.*.yml）/ Raw guard setting (Guard/guard.*.yml)
 * 鍵為守護種類字串（guard.always → id 'always'）；純資料層。
 * The id is the guard-kind string (guard.always → id 'always'); data-layer only.
 */
export interface IRawGuardYaml
{
	/** 守護種類（always/never/life25/…；含筆誤 prpb50）/ guard kind (always/never/life25/…; incl. the typo prpb50) */
	no: string;
	/** 說明資訊 / description info */
	info?: { desc?: string };
	/** 多語翻譯 / i18n copy */
	_i18n?: Record<string, { desc?: string }>;
}

/**
 * 原始判定碼設定（Judge/judge.*.yml）/ Raw judge-code setting (Judge/judge.*.yml)
 * 純資料層（UI 說明用）。/ data-layer only (UI copy).
 */
export interface IRawJudgeYaml
{
	/** 判定碼 / judge code */
	no: string | number;
	/** 說明 / description */
	exp?: string;
	/** 標籤 { no, exp } / tag { no, exp } */
	tag?: { no?: string | number; exp?: string };
	/** 是否需要 quantity（true/false）/ whether quantity is required */
	quantity?: boolean | string | number;
	/** CSS class / css class */
	css?: string;
	/** 子判定 / sub judge codes */
	subs?: unknown;
	/** 詳細說明 / detail info */
	info?: { desc?: string };
}

/**
 * 原始土地設定（Land/land.*.yml）/ Raw land setting (Land/land.*.yml)
 * no 為字串 id（ac0、blow01…）；純資料層。
 * `no` is a string id (ac0, blow01…); data-layer only.
 */
export interface IRawLandYaml
{
	/** 土地 id / land id */
	no: string;
	/** 土地資訊（名稱等）/ land info (name, etc.) */
	land?: { name?: string; name0?: string; land?: string; proper?: string };
	/** 怪物遭遇表 { 怪物編號: [權重, 旗標] } / monster encounter table { mon no: [weight, flag] } */
	monster?: Record<string, (string | number)[]>;
	/** 觸發（事件道具等）/ triggers (event items, etc.) */
	trigger?: unknown;
}

/**
 * 原始技能樹節點（Skilltree/skilltree.*.yml）/ Raw skill-tree node (Skilltree/skilltree.*.yml)
 * 純資料層。/ data-layer only.
 */
export interface IRawSkilltreeYaml
{
	/** 節點編號（＝技能編號）/ node number (the skill number) */
	no: string | number;
	/** 習得條件（and/or 邏輯樹）/ learn conditions (and/or logic tree) */
	check?: unknown;
}

/**
 * 原始工會設定（Union/union.*.yml）/ Raw union setting (Union/union.*.yml)
 * no 為補零字串（'0000'）；純資料層（對應 mon.*.yml 的工會細節）。
 * `no` is a zero-padded string ('0000'); data-layer only (the union details for the mon.*.yml bosses).
 */
export interface IRawUnionYaml
{
	/** 工會 id（補零字串）/ union id (zero-padded string) */
	no: string | number;
	/** 工會名稱 / union name */
	name?: string;
	/** 核心資料（隊伍、基底怪物、條件）/ core data (team, base monster, conditions) */
	data?: {
		team?: { name?: string; servant?: Record<string, (string | number)[]> };
		base?: { type?: string; no?: string | number };
		conditions?: { lv_limit?: string | number };
	};
	/** 展示資料 / display data */
	data_ex?: Record<string, unknown>;
}