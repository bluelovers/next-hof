// 屍體政策逐級解析（單一事實來源）/ Corpse policy level resolution (single source of truth)
//
// 繼承順序：角色級 → 隊伍級 → 戰鬥級（越具體越優先）；皆未設定＝false（不留屍體）。
// 每一級的值可以是布林（簡易開關）或物件（進階規格），較具體的一級整個勝出（不做欄位合併）。
// Inheritance: character → team → battle (more specific wins); all unset = false (no corpse).
// Each level may be a boolean (simple switch) or an object (detailed spec); the more
// specific level wins as a whole (fields are NOT merged across levels).

/**
 * 屍體圖層的 inline style（鍵＝CSS 屬性名，值＝字串或數值）
 * Inline style for the corpse layer (CSS property → value)
 *
 * 刻意採寬鬆 record 而非 React 的 CSSProperties，讓資料層（引擎／種子資料）不必依賴
 * React 型別；顯示層再把整包樣式併入精靈圖層的 style（CSSProperties）。
 * Deliberately a loose record rather than React's CSSProperties so the data layer
 * (engine / seed data) never depends on React types; the display layer merges the whole
 * bag into the sprite layer's style (CSSProperties).
 */
export type ICorpseStyle = Record<string, string | number>;

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
export interface ICorpseSpec {
	/**
	 * 屍體圖路徑（省略或空字串＝依原圖目錄自動挑選正向／鏡像屍體圖）
	 * Corpse image path (omitted or empty = auto-pick the forward/mirrored corpse by the
	 * original image's directory)
	 */
	imageUrl?: string;
	/**
	 * 附加到屍體圖層的 CSS class（與精靈既有 class 併存）
	 * Extra CSS class added to the corpse layer (kept alongside the sprite's own classes)
	 */
	className?: string;
	/**
	 * 併入屍體圖層的 inline style（覆寫精靈同名屬性）
	 * Inline style merged into the corpse layer (overrides same-named sprite style)
	 */
	style?: ICorpseStyle;
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
