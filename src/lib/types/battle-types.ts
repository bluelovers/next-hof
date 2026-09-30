import type { IStatsHpSpAll } from './base-types';
import type { EnumTeamSide } from './battle-enum';
import type {
	EnumBattleEventType,
	EnumResource,
	EnumValueWho,
} from './battle-event-enum';
import type { ICorpsePolicy, ICorpsePolicyField } from '#/lib/game/battle/corpse-policy';

/**
 * 結構化數值變化 / Structured value change
 *
 * 單一單位／單一資源的前後值；`who` 決定「這段變化是誰的」（Drain 的雙方、Delay 的自身），
 * `unit` 決定資源維度（hp／sp／delay）。展示層將其組成 valueChange（單筆）或 valueChanges（多筆）。
 * The before/after pair of one unit (or one resource); `who` says whose change it is (both sides
 * of a Drain, the caster's own delay) and `unit` names the resource (hp / sp / delay). The display
 * layer turns these into valueChange (single) or valueChanges (multiple).
 */
export interface IBattleValueChange
{
	/**
	 * 變化歸屬（缺省＝事件的 target 自身）/ whose change this is (absent = the event's target itself)
	 * actor＝行動者自身的變化、target＝目標的變化；展示層以名字替換 who。
	 * actor = a change on the actor, target = a change on the target; the display swaps in the name.
	 */
	who?: EnumValueWho;
	/** 資源維度（缺省＝hp）/ resource dimension (defaults to hp) */
	unit?: EnumResource;
	/** 變化前 / value before */
	from: number;
	/** 變化後 / value after */
	to: number;
}

/**
 * 戰鬥事件 / Battle event
 */
export interface IBattleEvent
{
	/** 事件類型 / battle event type */
	type: EnumBattleEventType;
	/** 行動者名稱 / actor name */
	actor?: string;
	/** 目標名稱 / target name */
	target?: string;
	/** 關聯技能編號 / related skill number */
	skill?: number;
	/** 數值（傷害量／回復量等）/ numeric value (damage/heal amount, etc.) */
	value?: number;
	/** 數值變化的前後 HP（Damage/Heal 時帶出 a > b 用）/ HP before/after for value-change display */
	hpBefore?: number;
	hpAfter?: number;
	/**
	 * 單資源事件的資源維度（SpDamage／SpHeal／Regen／Drain 用；缺省＝hp）
	 * resource dimension of a single-resource event (SpDamage / SpHeal / Regen / Drain; defaults to hp)
	 */
	unit?: EnumResource;
	/**
	 * 結構化數值變化（Drain 雙方、EnergyExchange 的 hp／sp 對、Delay 的前後分數）
	 * structured value changes (both sides of a Drain, EnergyExchange's hp / sp pair, a Delay's
	 * before/after score)
	 */
	valueChanges?: IBattleValueChange[];
	/** 顯示文字（Info 等文字類事件）/ display text (for Info and other text events) */
	text?: string;
}

/**
 * 單位共用核心欄位（共用組 1：識別碼＋名稱＋HP/SP）
 * Shared unit core fields (group 1: uid + name + HP/SP)
 *
 * 由引擎層 IBattleSnapshotUnit 與展示層 IBattleUnit／IBattleSnapshotDisplayUnit 共同繼承，
 * 這些完全同名同型的欄位只在這裡宣告一次。
 * 不相容的欄位不納入本組、仍由各層自行宣告——
 * 例如引擎的 team（EnumTeamSide）vs 顯示層的 side（EnumTeamSideUI）、
 * 引擎的 dead vs 顯示層的 status、level/no/expectSkill 等——
 * 因此不需要任何轉換函式，也不會因强行統一而改變既有行為。
 * Inherited by the engine's IBattleSnapshotUnit and the display's IBattleUnit /
 * IBattleSnapshotDisplayUnit, so these identically named, identically typed fields are
 * declared exactly once. Incompatible fields are deliberately left declared on each layer —
 * e.g. the engine's team (EnumTeamSide) vs the display's side (EnumTeamSideUI), the engine's
 * dead vs the display's status, level/no/expectSkill — so no conversion function is needed
 * and no existing behaviour changes.
 */
export interface IBattleUnitVitals extends Required<IStatsHpSpAll>
{
	/**
	 * 戰鬥單位實例唯一識別碼（Character.unitUuid）
	 * Battle-unit instance uid (Character.unitUuid)
	 *
	 * 展示層用來關聯戰場精靈與快照單位（sprite.unitUuid ↔ snapshot unitUuid）；
	 * 引擎層 IBattleSnapshotUnit 將其收窄為必填（個體追蹤用）。
	 * The display layer links battlefield sprites and snapshot units
	 * (sprite.unitUuid ↔ snapshot unitUuid); the engine's IBattleSnapshotUnit narrows it
	 * to required (per-instance tracking).
	 */
	unitUuid?: string;
	/** 名稱 / name */
	name: string;
}

/**
 * 單位列表容器（共用組 2：units 欄位）
 * Unit list container (group 2: the `units` field)
 *
 * 由引擎層 IBattleSnapshot 與展示層 IBattleTeam／IBattleSnapshotDisplay 共同繼承，
 * `units` 宣告只維護一份，元素型別以型別參數依各層指定。
 * Inherited by the engine's IBattleSnapshot and the display's IBattleTeam /
 * IBattleSnapshotDisplay so the `units` declaration is maintained once, with the element
 * type supplied per layer as a type parameter.
 */
export interface IUnitList<TUnit>
{
	/** 單位列表（元素型別依層別而定）/ unit list (element type varies by layer) */
	units: TUnit[];
}

/** 快照單位資料（戰場狀態某一刻的切面）/ Snapshot unit data (a moment's field state) */
export interface IBattleSnapshotUnit extends ICorpsePolicyField, IBattleUnitVitals
{
	/**
	 * 戰鬥單位實例唯一識別碼（Character.unitUuid；個體追蹤用）/ unit instance uid (for per-instance tracking)
	 *
	 * 承接 IBattleUnitVitals.unitUuid 並收窄為必填。
	 * Inherits IBattleUnitVitals.unitUuid and narrows it to required.
	 */
	unitUuid: string;
	/**
	 * 繼承 ICorpsePolicyField.corpse 並收窄為必填：引擎保證已完成
	 * 角色 > 隊伍 > 戰鬥級繼承解析（false＝不留下屍體，物件＝帶圖／class／style 規格）。
	 * Inherits ICorpsePolicyField.corpse and narrows it to required: the engine guarantees the
	 * character > team > battle inheritance has been resolved (false = no corpse, object =
	 * corpse carrying image/class/style spec).
	 */
	corpse: ICorpsePolicy;
	/** 單位編號 String(char.no)（物種／定義編號）/ unit number as string (species / definition id) */
	no: string;
	/** 隊伍側別 / team */
	team: EnumTeamSide;
	/** 是否已死亡 / whether this unit is dead */
	dead: boolean;
	/** 當前正在蓄力/詠唱的技號（無則 null）/ skill being charged/cast, null otherwise */
	expectSkill: number | null;
}

/** 戰鬥快照（每 10 次行動插入，記錄戰場圖與 HP/SP）/ Battle snapshot (one per 10 actions) */
export interface IBattleSnapshot extends IUnitList<IBattleSnapshotUnit>
{
	/** 插入時的 log.length / log length at insertion time */
	at: number;
}
