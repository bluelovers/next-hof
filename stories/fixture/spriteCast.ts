/**
 * 角色／怪物 名稱與圖像基底資料（單一事實來源）
 * Canonical character & monster name/image registry (single source of truth)
 *
 * 角色卡（characterCards）、怪物卡（monsterCards）、戰場精靈圖層（sampleData）、
 * 戰鬥行動（battleActions）與單位（battleUnits）統一從此取得「名稱」與「圖像路徑」，
 * 避免同一角色在不同 fixture 中名稱／圖像漂移。
 * Character cards, monster cards, battlefield sprite layers (sampleData), battle actions
 * and units all resolve "name" and "image path" from here, so the same character never
 * drifts across fixtures.
 */
import { EnumSpriteImageDir } from '#/components/battle/enums';

/** 精靈圖根路徑 / Sprite image root path */
const SPRITE_IMAGE_ROOT = '/image';

/** 精靈基底（名稱＋圖檔名） / Sprite base (name + image file name) */
export interface IEntitySprite
{
	/** 顯示名稱 / Display name */
	name: string;
	/** 圖檔名（char 與 char_rev 共用相同檔名） / Image file name (shared by char & char_rev) */
	file: string;
}

/** 名稱＋圖像 URL 成對資訊（charOf / charRevOf / monsterOf 的傳回型別） / Paired name + image URL info (return type of charOf / charRevOf / monsterOf) */
export interface IEntityInfo
{
	/** 顯示名稱 / Display name */
	name: string;
	/** 正向或多為特定目錄的圖像 URL / Image URL (normal or a given directory) */
	imageUrl: string;
}

// ==================== 角色基底 / Character base ====================

/** 角色基底（單一事實來源） / Character base roster (SSOT) */
export const characterSprites = {
	/** 戰士 / Warrior */
	hero: { name: 'Hero1', file: 'mon_079.png' },
	/** 法師 / Mage */
	mage: { name: 'Mage1', file: 'mon_018.png' },
	/** 補師 / Healer */
	healer: { name: 'Healer1', file: 'mon_214.png' },
	/** 主教 / Priest */
	priest: { name: 'Priest1', file: 'mon_214.png' },
	/** 狂戰士 / Berserker */
	berserker: { name: 'Berserker1', file: 'mon_079.png' },
	/** 弓箭手 / Archer */
	archer: { name: 'Archer1', file: 'mon_018.png' },
	/** 新手一 / Novice one */
	novice1: { name: 'Novice1', file: 'mon_214.png' },
	/** 新手二 / Novice two */
	novice2: { name: 'Novice2', file: 'mon_018.png' },
	/** 矮個子 / Short */
	short: { name: 'Shorty', file: 'mon_036z.png' },
	/** 高個子 / Tall */
	tall: { name: 'Giant', file: 'mon_162.png' },
	/** 名探偵 / Detective */
	detective: { name: '名探偵', file: 'm_chr30101.png' },
	/** 新米錬金術師 / Novice alchemist */
	alchemist: { name: '新米錬金術師', file: 'f_chr03901.png' },
	/** 魔導剣士 / Sword mage */
	swordMage: { name: '魔導剣士', file: 'm_chr02901.png' },
	/** 弓聖 / Bow saint */
	bowSaint: { name: '弓聖', file: 'f_chr04201.png' },
	/** 女性角色（精靈展示用） / Female character (sprite display) */
	female: { name: 'Female', file: 'mon_080r.png' },
} as const satisfies Record<string, IEntitySprite>;

/** 角色 key / Character key */
export type ICharacterKey = keyof typeof characterSprites;

// ==================== 怪物基底 / Monster base ====================

/** 怪物基底（單一事實來源） / Monster base roster (SSOT) */
export const monsterSprites = {
	goblinWarriorA: { name: 'GoblinWarrior(A)', file: 'mon_052.png' },
	goblinWarriorB: { name: 'GoblinWarrior(B)', file: 'mon_052.png' },
	goblinWarriorC: { name: 'GoblinWarrior(C)', file: 'mon_052.png' },
	goblinAxe: { name: 'GoblinAxe', file: 'mon_053.png' },
	goblinMage: { name: 'GoblinMage', file: 'mon_052.png' },
	caveBat: { name: 'Cave Bat', file: 'mon_052.png' },
	hellHound: { name: 'Hell Hound', file: 'mon_079.png' },
	dragonLord: { name: 'DragonLord', file: 'mon_214.png' },
	wolf: { name: 'Wolf', file: 'mon_079.png' },
	slime: { name: 'Slime', file: 'mon_018.png' },
	iceWolf: { name: 'IceWolf', file: 'mon_053.png' },
	snowBear: { name: 'SnowBear', file: 'mon_052.png' },
	penguin: { name: 'Penguin', file: 'mon_079.png' },
	darkSlime: { name: 'DarkSlime', file: 'mon_052.png' },
	mummy: { name: 'Mummy', file: 'mon_146.png' },
	mummyPrisoner: { name: 'MummyPrisoner', file: 'mon_146r.png' },
} as const satisfies Record<string, IEntitySprite>;

/** 怪物 key / Monster key */
export type IMonsterKey = keyof typeof monsterSprites;

// ==================== URL 輔助 / URL helpers ====================

/** 依目錄組成精靈圖 URL（目錄取自 EnumSpriteImageDir 這份單一事實來源） / Build sprite URL from the EnumSpriteImageDir directory */
export function spriteUrl(entity: IEntitySprite, dir: EnumSpriteImageDir = EnumSpriteImageDir.Char): string
{
	return `${SPRITE_IMAGE_ROOT}/${dir}/${entity.file}`;
}

/** 角色正向精靈圖 URL / Character sprite URL (normal) */
export function charUrl(key: ICharacterKey): string
{
	return spriteUrl(characterSprites[key]);
}

/** 角色鏡像精靈圖 URL（右隊用）/ Character sprite URL (mirrored, for right teams) */
export function charRevUrl(key: ICharacterKey): string
{
	return spriteUrl(characterSprites[key], EnumSpriteImageDir.CharRev);
}

/** 怪物精靈圖 URL / Monster sprite URL */
export function monUrl(key: IMonsterKey): string
{
	return spriteUrl(monsterSprites[key]);
}

/**
 * 角色成對資訊（名稱＋圖像 URL，指定目錄）
 * Paired character info (name + image URL, given directory)
 */
export function charOf(key: ICharacterKey, dir: EnumSpriteImageDir = EnumSpriteImageDir.Char): IEntityInfo
{
	return {
		name: characterSprites[key].name,
		imageUrl: spriteUrl(characterSprites[key], dir),
	};
}

/** 角色鏡像成對資訊（右隊用） / Paired character info (mirrored, for right teams) */
export function charRevOf(key: ICharacterKey): IEntityInfo
{
	return charOf(key, EnumSpriteImageDir.CharRev);
}

/** 怪物成對資訊（名稱＋圖像 URL） / Paired monster info (name + image URL) */
export function monsterOf(key: IMonsterKey): IEntityInfo
{
	return {
		name: monsterSprites[key].name,
		imageUrl: spriteUrl(monsterSprites[key]),
	};
}

/**
 * 依圖檔名組 URL（低階；保留既有 name↔file 對應的場合使用，
 * 例如手調座標的 battleDisplayData 圖層）
 * Build a sprite URL from a raw file name (low-level; for cases that keep an
 * existing name↔file pairing, e.g. hand-tuned battleDisplayData layers)
 */
export function spriteUrlByFile(file: string, dir: EnumSpriteImageDir = EnumSpriteImageDir.Char): string
{
	return `${SPRITE_IMAGE_ROOT}/${dir}/${file}`;
}

/** 英雄精靈 URL（CharacterSprite 展示用，沿用角色基底） / Hero sprite URL (character base) */
export const heroSpriteUrl: string = charUrl('hero');

/** 女性角色精靈 URL（CharacterSprite 展示用） / Female character sprite URL */
export const femaleSpriteUrl: string = charUrl('female');
