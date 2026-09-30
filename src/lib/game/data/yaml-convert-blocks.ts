/**
 * 共用區塊轉換器 / Shared block converters
 *
 * 數值字串／null／guard 筆誤／空物件等正規化已於讀取時（yaml-coerce）完成，本層只承接乾淨值。
 * Numeric strings, nulls, guard typos and empty objects are already resolved at read time
 * (yaml-coerce), so this layer consumes clean values directly.
 */

import { EnumEquipSlot } from '#/lib/types/char-enum';
import {
	EnumTargetMethod,
	EnumTargetType,
} from '#/lib/types/skill-enum';
import { EnumWeaponType } from '#/lib/types/item-enum';
import { EnumPosition } from '#/lib/types/battle-enum';
import {
	type IEncounterTable,
	type IEquipTable,
} from '#/lib/types/base-types';
import {
	type IBehavior,
	type ICharCore,
	type ICharDef,
	type IPatternItem,
	type ISpecial,
} from '#/lib/types/char-types';
import {
	type ICompBonuses,
	type ITargetSpec,
} from '#/lib/types/skill-types';
import type { IMonReward } from '#/lib/types/mon-types';
import type {
	IRawCombatCoreYaml,
	IRawMonYaml,
} from '#/lib/types/raw/yaml-types';
import { COMP_FIELDS } from '#/lib/game/character/status-attrs';
import { toNumber } from './yaml-numeric';
import { isEnumValue } from './yaml-lookup';

/**
 * 空物件 → undefined / Empty object → undefined
 * 轉換器對「來源給了空 `{ }`」的統一收斂：空塊等同未提供，交由上層走預設路徑。
 * The shared rule converters apply when the source supplies an empty `{ }`: an empty block
 * means "absent", so the upper layer falls back to its default.
 *
 * 語意 / Semantics：`undefined` 與 `{ }` 都回 `undefined`；帶任一鍵則原樣回傳。
 * Both `undefined` and `{ }` yield `undefined`; any non-empty object is returned as-is.
 */
export function emptyToUndefined<T extends object>(value: T | undefined): T | undefined
{
	if (!value) return undefined;
	return Object.keys(value).length > 0 ? value : undefined;
}

/**
 * 依鍵清單複製「已定義」的數值欄位 / Copy the defined numeric fields named by a key list
 *
 * 供轉換器把一組同型數值鍵（Plus*／Up*／Down*、補正 P_* / M_* 等）從 raw 逐鍵搬到目標定義，
 * 未定義的鍵略過（**不寫入 undefined**，避免 `toEqual` 比對多出鍵）。
 * Lets a converter move a group of same-typed numeric keys (Plus*／Up*／Down*, the P_* / M_*
 * comps, …) from the raw record onto the target definition, skipping absent keys (**never
 * writing `undefined`**, so a strict `toEqual` does not see an extra key).
 *
 * 型別上雙端皆為 `Partial<Record<K, number>>`，因此呼叫端完全不需 `as unknown as` 轉型
 * ——原先 `convertSkillYaml` 對 29 鍵逐一 `(skill as unknown as Record<string, number>)[k]`
 * 的斷言即由此取代（鍵集合仍由 SKILL_EXTRA_NUMERIC_KEYS / COMP_FIELDS 單一來源供給）。
 * Both ends are `Partial<Record<K, number>>` on the type level, so call sites need no
 * `as unknown as` at all — this replaces the per-key
 * `(skill as unknown as Record<string, number>)[k]` assertion that convertSkillYaml used to
 * make for all 29 keys (the key sets still come from the single sources
 * SKILL_EXTRA_NUMERIC_KEYS / COMP_FIELDS).
 *
 * @param target 目標定義 / target definition
 * @param source raw 來源（鍵已於載入收斂為 number）/ raw source (keys already numbers after load)
 * @param keys 要複製的鍵 / the keys to copy
 */
export function copyNumericKeys<K extends string>(
	target: Partial<Record<K, number>>,
	source: Partial<Record<K, number>>,
	keys: readonly K[],
): void
{
	for (const k of keys)
	{
		const v = source[k];
		if (v !== undefined) target[k] = v;
	}
}

/**
 * position 字串 → EnumPosition / position string → EnumPosition
 * 未提供或無法辨識時回 undefined（開戰時 setBattleVariable 隨機決定）。
 * Returns undefined when absent/unknown (setBattleVariable randomizes at battle start anyway).
 */
export function convertPosition(value: string | undefined): EnumPosition | undefined
{
	if (value === EnumPosition.Front || value === EnumPosition.Back) return value;
	return undefined;
}

/**
 * 行為規則列轉換 / Convert one pattern row
 * quantity 的 null 已於載入收斂為 0、缺省保持 undefined；judge／action 缺省時略過該列。
 * null quantity is normalized to 0 at load and omission stays undefined;
 * rows with a missing judge/action are dropped.
 */
export function convertPatternItem(raw: IPatternItem | undefined): IPatternItem | undefined
{
	if (!raw) return undefined;
	const judge = raw.judge ?? Number.NaN;
	const action = raw.action ?? Number.NaN;
	if (!Number.isFinite(judge) || !Number.isFinite(action)) return undefined;
	return { judge, quantity: raw.quantity, action };
}

/**
 * 行為定義轉換 / Convert a raw behavior block
 * 空物件（pattern: { }）→ undefined（引擎會以預設收尾補普攻）。
 * Empty block (pattern: { }) → undefined (the engine's default tail supplies the basic attack).
 */
export function convertBehaviorYaml(raw: IBehavior | undefined): IBehavior | undefined
{
	if (!raw) return undefined;
	const behavior: IBehavior = {};

	const position = convertPosition(raw.position);
	if (position !== undefined) behavior.position = position;

	/**
	 * 前排守護條件（已由載入正規化為 EnumGuardKind；來源筆誤 pro50/prpb50 已修正）
	 * guard condition (already normalized to EnumGuardKind at load; typos fixed)
	 */
	if (raw.guard !== undefined) behavior.guard = raw.guard;

	const pattern = Array.isArray(raw.pattern)
		? raw.pattern.map(convertPatternItem).filter((p): p is IPatternItem => p !== undefined)
		: undefined;
	if (pattern && pattern.length > 0) behavior.pattern = pattern;

	return emptyToUndefined(behavior);
}

/**
 * 獎勵轉換 / Convert a raw reward block
 * raw reward 即 IMonReward（單一事實來源）——僅處理「空物件 → undefined」。
 * The raw reward IS IMonReward (SSOT); this only maps an empty object to undefined.
 */
export function convertRewardYaml(raw: IMonReward | undefined): IMonReward | undefined
{
	if (!raw) return undefined;
	const reward: IMonReward = { ...raw };
	/** 空掉落表 = 無掉落，移除 itemtable 鍵 */
	if (raw.itemtable && Object.keys(raw.itemtable).length === 0)
	{
		delete reward.itemtable;
	}
	return emptyToUndefined(reward);
}

/**
 * 裝備欄位轉換 / Convert a raw equip block
 * main_hand/off_hand/armor → EnumEquipSlot 鍵；未知欄位忽略。
 * main_hand/off_hand/armor → EnumEquipSlot keys; unknown keys are ignored.
 */
export function convertEquipYaml(raw: IEquipTable | undefined): ICharDef['equip']
{
	if (!raw) return undefined;
	const out: NonNullable<ICharDef['equip']> = {};
	for (const [slot, itemNo] of Object.entries(raw))
	{
		if (!isEnumValue(slot, Object.values(EnumEquipSlot))) continue;
		out[slot] = itemNo;
	}
	return emptyToUndefined(out);
}

/**
 * SPECIAL 轉換 / Convert a raw SPECIAL block
 *
 * 合併來源錯字的小寫 `special` 與正規鍵 `SPECIAL`（後者優先）。值已於載入收斂為 ISpecial 形狀
 * （boolean → 1/0、Pierce 為 [n, n]）；空塊（兩者皆空）回 undefined。
 * Merges the source-typo lowercase `special` with the canonical `SPECIAL` (the latter wins).
 * Values are already ISpecial-shaped (booleans → 1/0, Pierce as [n, n]) from load-time
 * normalization; an empty result (both sides empty) yields undefined.
 */
export function convertSpecialYaml(raw: IRawMonYaml): Partial<ISpecial> | undefined
{
	const merged: Partial<ISpecial> = { ...raw.special, ...raw.SPECIAL };
	return emptyToUndefined(merged);
}

/**
 * 核心欄位轉換 / Shared conversion of the combat-core fields
 * 角色與怪物共用的 no/name/六維/HP/SP（單一事實來源：ICombatStats）。
 * Single source of truth for the fields shared by chars and mons (ICombatStats).
 *
 * 缺省數值**不補 0**——保持 undefined，由實例化（Character 建構）解析。
 * Missing stats stay undefined here (no 0 invention); instantiation resolves them.
 */
export function convertCombatCoreYaml(raw: IRawCombatCoreYaml): ICharCore
{
	return {
		no: raw.no,
		name: raw.name,
		level: raw.level,
		maxhp: raw.maxhp,
		hp: raw.hp,
		maxsp: raw.maxsp,
		sp: raw.sp,
		str: raw.str,
		int: raw.int,
		dex: raw.dex,
		spd: raw.spd,
		luk: raw.luk,
	};
}

/** 隨行雜魚表轉換 / Convert the raw servant table (IEncounterTable) */
export function convertServantYaml(
	raw: IRawMonYaml['servant'],
): IEncounterTable | undefined
{
	if (!raw) return undefined;
	const out: IEncounterTable = {};
	for (const [k, pair] of Object.entries(raw))
	{
		const key = Number(k);
		if (Number.isFinite(key)) out[key] = pair;
	}
	return emptyToUndefined(out);
}

/**
 * 目標規格轉換 / Convert a raw [type, method, count] spec into ITargetSpec
 * raw 三元組的形狀由本類別的來源定案：前兩格為目標／選取方式字串、末格經載入收斂為 number。
 * The raw 3-tuple's shape is fixed by this class's source: the first two entries are
 * target/method strings, the last one is a number after load-time coercion.
 */
export function convertTarget(
	raw: [type: string, method: string, count: number] | undefined,
): ITargetSpec | undefined
{
	if (!Array.isArray(raw) || raw.length < 3) return undefined;
	const type = String(raw[0]);
	const method = String(raw[1]);
	if (!isEnumValue(type, Object.values(EnumTargetType))) return undefined;
	if (!isEnumValue(method, Object.values(EnumTargetMethod))) return undefined;
	return [type, method, toNumber(raw[2])];
}

/** 詠唱/蓄力轉換（[a] 或 [a, b] → [a, b ?? 0]）/ Convert a raw charge into the [cast, stiff] tuple */
export function convertCharge(raw: number[] | undefined): [cast: number, stiff: number] | undefined
{
	if (!Array.isArray(raw) || raw.length < 1) return undefined;
	return [toNumber(raw[0]), toNumber(raw[1], 0)];
}

/**
 * 武器限制轉換 / Convert a raw weapon-limit object into Partial<Record<EnumWeaponType, boolean>>
 * 來源值全為布林（`Whip: true`），不是資源編號，故 raw 形狀為 `Record<string, boolean>`。
 * Source values are all booleans (`Whip: true`), never resource ids, so the raw shape is
 * `Record<string, boolean>`.
 */
export function convertLimit(
	raw: Record<string, boolean> | undefined,
): Partial<Record<EnumWeaponType, boolean>> | undefined
{
	if (!raw) return undefined;
	const out: Partial<Record<EnumWeaponType, boolean>> = {};
	for (const [k, v] of Object.entries(raw))
	{
		if (!isEnumValue(k, Object.values(EnumWeaponType))) continue;
		out[k] = v;
	}
	return emptyToUndefined(out);
}

/** 補正欄位鍵（ICompBonuses 9 鍵，單一事實來源：COMP_FIELDS）/ the 9 compensation keys (SSOT: COMP_FIELDS) */
const BONUS_KEYS = COMP_FIELDS;

/**
 * 補正欄位複製 / Copy the 9 compensation keys from a raw record
 * 補正欄位在載入時已收斂為 number（Item／Skill 的 COERCE_SPECS 含 COMP_BONUS_FIELDS），
 * 故參數形狀就是 `ICompBonuses`——不再是鬆散的 `string | number` 錄型別，
 * 呼叫端也無需 `as unknown as` 轉型。
 * Raw compensation fields are numbers after load (the Item/Skill COERCE_SPECS include
 * COMP_BONUS_FIELDS), so the parameter shape is `ICompBonuses` itself — no loose
 * `string | number` record and no `as unknown as` cast at the call sites.
 */
export function convertBonuses(raw: ICompBonuses): ICompBonuses
{
	const out: ICompBonuses = {};
	for (const k of BONUS_KEYS)
	{
		const v = raw[k];
		if (v !== undefined) out[k] = toNumber(v);
	}
	return out;
}
