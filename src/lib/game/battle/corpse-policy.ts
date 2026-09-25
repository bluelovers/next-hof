// 屍體政策逐級解析（單一事實來源）/ Corpse policy level resolution (single source of truth)
//
// 繼承順序：角色級 → 隊伍級 → 戰鬥級（越具體越優先）；皆未設定＝false（不留屍體）。
// 每一級的值可以是布林（簡易開關）或物件（進階規格），較具體的一級整個勝出（不做欄位合併）。
// Inheritance: character → team → battle (more specific wins); all unset = false (no corpse).
// Each level may be a boolean (simple switch) or an object (detailed spec); the more
// specific level wins as a whole (fields are NOT merged across levels).

import type { IStyleProps } from '#/components/shared/types';

/**
 * 屍體呈現規格（`corpse` 寫成物件時的進階設定）
 * Corpse presentation spec (the object form of `corpse`)
 *
 * 只要 `corpse` 是物件（哪怕空物件）就代表「留下屍體」，並可另外指定屍體圖路徑、
 * 附加 CSS class 與 inline style；未指定的欄位沿用顯示層預設
 * （圖＝由顯示層依原圖目錄自動挑選正向／鏡像屍體圖，見 battleUtils.SPRITE_CORPSE_URL；
 * class/style＝無）。
 * 本層刻意不寫死屍體圖檔名：資產選擇屬於顯示層，引擎只決定「留不留、帶什麼規格」。
 * Any object (even an empty one) means "leave a corpse", and may additionally choose the
 * corpse image path, an extra CSS class, and an inline style. Unspecified fields fall back
 * to the display-layer defaults (image = the display layer auto-picks the forward/mirrored
 * corpse asset from the original image's directory, see battleUtils.SPRITE_CORPSE_URL;
 * class/style = none). The corpse asset name is deliberately never restated here: asset
 * choice belongs to the display layer — the engine only decides "leave or not, with what
 * spec".
 *
 * 注意：inline style 的優先權高於 CSS class；若 `style` 與 `className` 都設定 `filter`
 * 之類的同一屬性，會以 `style` 為準。
 * NOTE: inline style outranks a CSS class; if both `style` and `className` set the same
 * property (e.g. `filter`), `style` wins.
 */
export interface ICorpseSpec extends IStyleProps {
	/**
	 * 屍體圖路徑（省略或空字串＝依原圖目錄自動挑選正向／鏡像屍體圖）
	 * Corpse image path (omitted or empty = auto-pick the forward/mirrored corpse by the
	 * original image's directory)
	 */
	imageUrl?: string;
}

/**
 * 屍體政策值：布林（簡易開關）或物件（進階規格）
 * Corpse policy value: boolean (simple switch) or object (detailed spec)
 *
 * 顯示層一律以 falsy 判定：`false`／undefined＝死亡即消失；`true`／物件＝留下屍體。
 * The display layer always checks falsy: `false`/unset = vanish on death;
 * `true`/object = leave a corpse.
 */
export type ICorpsePolicy = boolean | ICorpseSpec;

/**
 * 屍體政策欄位的共用形狀（`corpse` 欄位的單一事實來源）
 * Shared shape of the corpse-policy field (single source of truth for the `corpse` field)
 *
 * 所有帶 `corpse` 欄位的介面一律以 `extends` 繼承本型別，不再各自定義；
 * 完整欄位語意寫在下方「欄位自身」的 JSDoc，使繼承方在 IDE 悬停時仍取得有效說明。
 * Every interface carrying a `corpse` field extends this type instead of redefining it.
 * The full field semantics live in the field's own JSDoc below, so inheriting sites still
 * surface an effective description on IDE hover.
 *
 * 使用方 / Consumers:
 * - `ICharCore`（角色級輸入）、`IBattleConfig`（戰鬥級最外層預設）
 * - `IBattleSnapshotUnit`（解析結果，繼承後收窄為必填）
 * - `IBattleSnapshotDisplayUnit`（顯示側，沿襲解析結果）
 * - `Character` 以 `implements ICharCore` 間接受到本欄位約束
 * - `ICharCore` (character-level input), `IBattleConfig` (battle-level outermost default)
 * - `IBattleSnapshotUnit` (resolved result, narrowed to required after extends)
 * - `IBattleSnapshotDisplayUnit` (display side, carries the resolved value)
 * - `Character` is constrained via `implements ICharCore`
 */
export interface ICorpsePolicyField {
	/**
	 * 死亡後是否留下屍體 / Whether this unit leaves a corpse on death
	 *
	 * `true`／物件＝留下屍體（物件可指定屍體圖、CSS class、style；見 ICorpseSpec）；
	 * `false`＝死亡即消失；省略＝未設定。一律以 falsy 判定（`!corpse`），
	 * 因此「未設定」語意上就是不留下屍體，不會被誤認為 true。
	 * `true`/object = leave a corpse (the object form chooses the corpse image, CSS class
	 * and style; see ICorpseSpec); `false` = vanish; omitted = unset.
	 * Always evaluated as falsy (`!corpse`), so "unset" is never mistaken for true.
	 *
	 * 各層語意 / Per-layer meaning:
	 * - `ICharCore`：角色級；省略＝往上繼承（隊伍級 → 戰鬥級 → 預設 false）/
	 *   character level; omitted = inherit upward (team → battle → default false)
	 * - `IBattleConfig`：戰鬥級最外層預設；省略＝不留屍體 /
	 *   battle-level outermost default; omitted = no corpse
	 * - `IBattleSnapshotUnit`：收窄為必填＝三級繼承解析後的結果 /
	 *   narrowed to required = result after the three-level inheritance
	 * - `IBattleSnapshotDisplayUnit`：顯示側沿襲解析結果，顯示層一律以 `!corpse` 判定 /
	 *   display side carries the resolved value; the display layer always checks `!corpse`
	 */
	corpse?: ICorpsePolicy;
}

/**
 * 逐級解析屍體政策 / Resolve the corpse policy level by level
 *
 * 繼承順序「角色級 → 隊伍級 → 戰鬥級」以 `??` 串接，因此較具體的一整個值勝出：
 * 布林就是布林、物件就是物件，不做跨層欄位合併，語意單純。
 * 一律以 falsy 判定：`true`／物件才留屍體，`false`／未設定皆不留；因此「未設定」
 * 語意上不會被誤認為 true。此函式供引擎（Battle）與展示層共用，避免各自實作漂移。
 * The character → team → battle chain uses `??`, so the more specific value wins as a
 * whole (boolean stays boolean, object stays object) with no cross-level field merging.
 * Always falsy-evaluated: only `true`/an object leaves a corpse; `false`/unset do not, so
 * an unset value is never implicitly true. Shared by the engine (Battle) and the display
 * layer so the rule cannot drift between implementations.
 *
 * @param characterCorpse 角色級政策 / character-level policy
 * @param teamCorpse 隊伍級政策 / team-level policy
 * @param battleCorpse 戰鬥級政策 / battle-level policy
 * @returns 解析後的政策（布林或物件）/ the resolved policy (boolean or object)
 */
export function resolveCorpsePolicy(
	characterCorpse: ICorpsePolicy | undefined,
	teamCorpse: ICorpsePolicy | undefined,
	battleCorpse: ICorpsePolicy | undefined,
): ICorpsePolicy {
	return characterCorpse ?? teamCorpse ?? battleCorpse ?? false;
}

/**
 * 取出 `corpse` 的物件規格 / Extract the object spec from a `corpse` value
 *
 * `corpse` 為物件（含空物件）時回傳該規格；為 `true`／`false`／undefined／null 時回
 * undefined。型別已排除 null，但資料可能來自 JSON，故仍防禦判斷。
 * Returns the spec when `corpse` is an object (including an empty one); `undefined` for
 * `true`/`false`/unset/null. The type excludes null, but data may arrive from JSON, so the
 * null check stays as a guard.
 *
 * @param policy 屍體政策值 / corpse policy value
 * @returns 物件規格（非物件時為 undefined）/ the object spec (undefined when not an object)
 */
export function corpseSpecOf(policy: ICorpsePolicy | undefined): ICorpseSpec | undefined {
	return policy !== null && typeof policy === 'object' ? policy : undefined;
}
