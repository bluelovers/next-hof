// 屍體政策逐級解析（單一事實來源）/ Corpse policy level resolution (single source of truth)
//
// 繼承順序：角色級 → 隊伍級 → 戰鬥級（越具體越優先）；皆未設定＝false（不留屍體）。
// Inheritance: character → team → battle (more specific wins); all unset = false (no corpse).

/**
 * 逐級解析屍體政策 / Resolve the corpse policy level by level
 *
 * 一律以 falsy 判定：`true` 才留屍體，`false`／未設定皆不留；因此「未設定」語意上
 * 不會被誤認為 true。此函式供引擎（Battle）與展示層共用，避免各自實作漂移。
 * Always falsy-evaluated: only `true` leaves a corpse; `false`/unset do not, so an unset
 * value is never implicitly true. Shared by the engine (Battle) and the display layer so
 * the rule cannot drift between implementations.
 *
 * @param characterCorpse 角色級政策 / character-level policy
 * @param teamCorpse 隊伍級政策 / team-level policy
 * @param battleCorpse 戰鬥級政策 / battle-level policy
 * @returns 解析後的布林政策 / the resolved boolean policy
 */
export function resolveCorpsePolicy(
	characterCorpse: boolean | undefined,
	teamCorpse: boolean | undefined,
	battleCorpse: boolean | undefined,
): boolean {
	return characterCorpse ?? teamCorpse ?? battleCorpse ?? false;
}
