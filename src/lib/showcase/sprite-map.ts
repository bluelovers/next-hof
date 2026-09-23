// 展示頁 sprite 對應表 / Showcase sprite image map
// 將 seed 角色/怪物定義編號（def no）對應到實際精靈圖路徑；查無對應時回傳明確
// placeholder（noimage），確保戰場每一單位都有圖可用。
// Maps seed char/monster definition numbers to concrete sprite image paths; falls
// back to an explicit placeholder (noimage) when no entry exists, so every battle
// unit always has an image.
//
// 朝向慣例（見 spriteFlip.ts）：char/ 圖預設朝右。本展示頁固定「我方＝左隊、
// 敵方＝右隊」，兩側皆使用 /image/char/，右隊由 computeBattleSpritePositions
// 自動鏡像朝左，無需手動翻轉。
// Facing convention (see spriteFlip.ts): /image/char/ images face right by default.
// This showcase always places allies on the left team and enemies on the right
// team, both using /image/char/; the right team is auto-mirrored (face left) by
// computeBattleSpritePositions — no manual flipping needed.

/** 缺圖時的明確 placeholder / Explicit fallback when an image is missing */
export const SPRITE_PLACEHOLDER_URL = '/image/char/noimage.png';

/**
 * 玩家角色（def no → 精靈圖路徑，位於 /image/char/，我方左隊）
 * Player char sprite map (def no → image path under /image/char/, left team)
 */
export const CHAR_SPRITE_URLS: Readonly<Record<number, string>> = {
	100: '/image/char/mon_079.png', // Warrior
	101: '/image/char/mon_078.png', // Swordman
	102: '/image/char/mon_018.png', // Mage
	103: '/image/char/mon_019.png', // Ranger
	104: '/image/char/mon_013.png', // Priest
	105: '/image/char/mon_012.png', // Berserker
};

/**
 * 怪物（def no → 精靈圖路徑，位於 /image/char/，敵方右隊）
 * Monster sprite map (def no → image path under /image/char/, right team)
 */
export const MON_SPRITE_URLS: Readonly<Record<number, string>> = {
	1000: '/image/char/mon_053.png', // GoblinAxe
	1001: '/image/char/mon_214.png', // DarkElfHunter
	1002: '/image/char/mon_051.png', // Slime
};

/**
 * 取得玩家角色精靈圖路徑（無對應時回傳 placeholder）
 * Get a player char's sprite URL (returns the placeholder when unmapped)
 */
export function getCharSpriteUrl(no: number): string {
	return CHAR_SPRITE_URLS[no] ?? SPRITE_PLACEHOLDER_URL;
}

/**
 * 取得怪物精靈圖路徑（無對應時回傳 placeholder）
 * Get a monster's sprite URL (returns the placeholder when unmapped)
 */
export function getMonSpriteUrl(no: number): string {
	return MON_SPRITE_URLS[no] ?? SPRITE_PLACEHOLDER_URL;
}
