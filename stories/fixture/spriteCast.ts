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

/** 職業系統（依 GameDataPage 職業 spriteUrls 對照：每個職業第 1 個為男性、第 2 個為女性） / Job system enum (per GameDataPage job spriteUrls: 1st = male, 2nd = female) */
export enum EnumJobSystem
{
	Warrior = 'Warrior',
	Sorcerer = 'Sorcerer',
	Priest = 'Priest',
	Hunter = 'Hunter',
}

/** 精靈基底（名稱＋圖檔名） / Sprite base (name + image file name) */
export interface IEntitySprite
{
	/** 顯示名稱 / Display name */
	name: string;
	/** 圖檔名（char 與 char_rev 共用相同檔名） / Image file name (shared by char & char_rev) */
	file: string;
	/**
	 * 女性版圖檔名（存在＝此資料明確具有性別對應，見 GameDataPage 職業 spriteUrls）
	 * Female image file name (when present, this entry explicitly has a gender correspondence)
	 */
	femaleFile?: string;
	/** 職業系統（存在＝此資料明確屬於某個職業系） / Job system (present = this entry clearly belongs to a job family) */
	jobSystem?: EnumJobSystem;
}

/** 名稱＋圖像 URL 成對資訊（charOf / charRevOf / monsterOf 的傳回型別） / Paired name + image URL info (return type of charOf / charRevOf / monsterOf) */
export interface IEntityInfo extends Pick<IEntitySprite, 'name' | 'jobSystem'>
{
	/** 正向或多為特定目錄的圖像 URL / Image URL (normal or a given directory) */
	imageUrl: string;
	/** 女性版圖像 URL（存在＝此資料明確具有性別對應） / Female image URL (present = explicit gender correspondence) */
	femaleImage?: string;
}

// ==================== 角色基底 / Character base ====================

/** 角色基底（單一事實來源） / Character base roster (SSOT) */
export const characterSprites = {
	/** 戰士（Warrior 系男性；女性 mon_080r） / Warrior (male; female mon_080r) */
	hero: {
		name: 'Hero1',
		file: 'mon_079.png',
		femaleFile: 'mon_080r.png',
		jobSystem: EnumJobSystem.Warrior,
	},
	/** 法師（Sorcerer 系女性角色；即 mon_018，無女性孿生設定） / Mage (Sorcerer female; mon_018, no femaleFile) */
	mage: {
		name: 'Mage1',
		file: 'mon_018.png',
		jobSystem: EnumJobSystem.Sorcerer,
	},
	/** 補師（Priest 系女性角色；即 mon_214） / Healer (Priest female; mon_214) */
	healer: {
		name: 'Healer1',
		file: 'mon_214.png',
		jobSystem: EnumJobSystem.Priest,
	},
	/** 主教（Priest 系女性角色；即 mon_214） / Priest (Priest female; mon_214) */
	priest: {
		name: 'Priest1',
		file: 'mon_214.png',
		jobSystem: EnumJobSystem.Priest,
	},
	/** 狂戰士（Warrior 系男性；女性 mon_080r） / Berserker (Warrior male; female mon_080r) */
	berserker: {
		name: 'Berserker1',
		file: 'mon_079.png',
		femaleFile: 'mon_080r.png',
		jobSystem: EnumJobSystem.Warrior,
	},
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
	/** 女性角色（Warrior 系女性；精靈展示用，本身即女性故無 femaleFile） / Female character (Warrior female; sprite display — already female, so no femaleFile) */
	female: {
		name: 'Female',
		file: 'mon_080r.png',
		jobSystem: EnumJobSystem.Warrior,
	},

	// ==================== 職業系統角色（GameDataPage 職業 spriteUrls 男／女對照） / Job-system characters (per GameDataPage job pairs) ====================

	/** Warrior 系基礎職（男→女 mon_080r） / Warrior base job (male → female mon_080r) */
	jobWarrior: {
		name: 'Warrior',
		file: 'mon_079.png',
		femaleFile: 'mon_080r.png',
		jobSystem: EnumJobSystem.Warrior,
	},
	/** Warrior 系 RoyalGuard（男→女 mon_234r） / RoyalGuard (male → female mon_234r) */
	jobRoyalGuard: {
		name: 'RoyalGuard',
		file: 'mon_199r.png',
		femaleFile: 'mon_234r.png',
		jobSystem: EnumJobSystem.Warrior,
	},
	/** Warrior 系 Sacrier（男→女 mon_012） / Sacrier (male → female mon_012) */
	jobSacrier: {
		name: 'Sacrier',
		file: 'mon_100r.png',
		femaleFile: 'mon_012.png',
		jobSystem: EnumJobSystem.Warrior,
	},
	/** Warrior 系 WitchHunt（男→女 mon_234） / WitchHunt (male → female mon_234) */
	jobWitchHunt: {
		name: 'WitchHunt',
		file: 'mon_150.png',
		femaleFile: 'mon_234.png',
		jobSystem: EnumJobSystem.Warrior,
	},
	/** Sorcerer 系基礎職（男→女 mon_018） / Sorcerer base job (male → female mon_018) */
	jobSorcerer: {
		name: 'Sorcerer',
		file: 'mon_106.png',
		femaleFile: 'mon_018.png',
		jobSystem: EnumJobSystem.Sorcerer,
	},
	/** Sorcerer 系 Warlock（男→女 mon_246r） / Warlock (male → female mon_246r) */
	jobWarlock: {
		name: 'Warlock',
		file: 'mon_196z.png',
		femaleFile: 'mon_246r.png',
		jobSystem: EnumJobSystem.Sorcerer,
	},
	/** Sorcerer 系 Summoner（男→女 mon_246z） / Summoner (male → female mon_246z) */
	jobSummoner: {
		name: 'Summoner',
		file: 'mon_196y.png',
		femaleFile: 'mon_246z.png',
		jobSystem: EnumJobSystem.Sorcerer,
	},
	/** Sorcerer 系 Necromancer（男→女 mon_246y） / Necromancer (male → female mon_246y) */
	jobNecromancer: {
		name: 'Necromancer',
		file: 'mon_196x.png',
		femaleFile: 'mon_246y.png',
		jobSystem: EnumJobSystem.Sorcerer,
	},
	/** Priest 系基礎職（男→女 mon_214） / Priest base job (male → female mon_214) */
	jobPriest: {
		name: 'Priest',
		file: 'mon_213.png',
		femaleFile: 'mon_214.png',
		jobSystem: EnumJobSystem.Priest,
	},
	/** Priest 系 Bishop（男→女 mon_214r） / Bishop (male → female mon_214r) */
	jobBishop: {
		name: 'Bishop',
		file: 'mon_213r.png',
		femaleFile: 'mon_214r.png',
		jobSystem: EnumJobSystem.Priest,
	},
	/** Priest 系 Druid（男→女 mon_214rz） / Druid (male → female mon_214rz) */
	jobDruid: {
		name: 'Druid',
		file: 'mon_213rz.png',
		femaleFile: 'mon_214rz.png',
		jobSystem: EnumJobSystem.Priest,
	},
	/** Hunter 系基礎職（男→女 mon_219r） / Hunter base job (male → female mon_219r) */
	jobHunter: {
		name: 'Hunter',
		file: 'mon_219rr.png',
		femaleFile: 'mon_219r.png',
		jobSystem: EnumJobSystem.Hunter,
	},
	/** Hunter 系 Sniper（男→女 mon_042z） / Sniper (male → female mon_042z) */
	jobSniper: {
		name: 'Sniper',
		file: 'mon_076z.png',
		femaleFile: 'mon_042z.png',
		jobSystem: EnumJobSystem.Hunter,
	},
	/** Hunter 系 BeastTamer（男→女 mon_217z） / BeastTamer (male → female mon_217z) */
	jobBeastTamer: {
		name: 'BeastTamer',
		file: 'mon_216z.png',
		femaleFile: 'mon_217z.png',
		jobSystem: EnumJobSystem.Hunter,
	},
	/** Hunter 系 Murderer（男→女 mon_217rz） / Murderer (male → female mon_217rz) */
	jobMurderer: {
		name: 'Murderer',
		file: 'mon_216y.png',
		femaleFile: 'mon_217rz.png',
		jobSystem: EnumJobSystem.Hunter,
	},
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
 * 角色成對資訊（名稱＋圖像 URL，指定目錄；有性別對應時一併帶上 femaleImage／jobSystem）
 * Paired character info (name + image URL, given directory; includes femaleImage / jobSystem
 * when a gender correspondence exists)
 */
export function charOf(key: ICharacterKey, dir: EnumSpriteImageDir = EnumSpriteImageDir.Char): IEntityInfo
{
	/** base 以 IEntitySprite 定型，使 femaleFile / jobSystem 可選欄位得以存取 / Type base as IEntitySprite so the optional femaleFile / jobSystem fields are accessible */
	const base: IEntitySprite = characterSprites[key];
	const info: IEntityInfo = {
		name: base.name,
		imageUrl: spriteUrl(base, dir),
	};
	if (base.femaleFile)
	{
		/** 女性版圖像（與本角色同目錄） / Female image (same directory as this character) */
		info.femaleImage = spriteUrl({ name: base.name, file: base.femaleFile }, dir);
	}
	if (base.jobSystem)
	{
		info.jobSystem = base.jobSystem;
	}
	return info;
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
