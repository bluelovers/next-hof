/**
 * MonsterCard 展示用怪物資料（單一事實來源）
 * MonsterCard fixture monster data (single source of truth)
 *
 * 名稱與圖像由 spriteCast 的 `monsterOf` 成對取得（展開為 name＋imageUrl），
 * 此檔僅負責組合等級／地形等展示欄位。
 * Names and images come together from spriteCast's `monsterOf` (spread as name +
 * imageUrl); this file only composes the showcase fields (level / land type).
 */
import type { IMonsterData } from '../../src/components/monsters/MonsterTypes';
import { monsterOf } from './spriteCast';

/** 草地哥布林斧兵 / Grassland GoblinAxe */
export const goblinAxeMonster: IMonsterData = {
	...monsterOf('goblinAxe'),
	level: 1,
	landType: 'grass',
};

/** 草地哥布林法師 / Grassland GoblinMage */
export const goblinMageMonster: IMonsterData = {
	...monsterOf('goblinMage'),
	level: 1,
	landType: 'grass',
};

/** 洞穴蝙蝠 / Cave bat */
export const caveBatMonster: IMonsterData = {
	...monsterOf('caveBat'),
	level: 3,
	landType: 'cave',
};

/** 熔岩地獄犬 / Lava hell hound */
export const hellHoundMonster: IMonsterData = {
	...monsterOf('hellHound'),
	level: 15,
	landType: 'lava',
};

/** 高山龍王（高階） / Mountain DragonLord (high level) */
export const dragonLordMonster: IMonsterData = {
	...monsterOf('dragonLord'),
	level: 99,
	landType: 'mount',
};

/** 雪地狼 / Snow wolf */
export const wolfMonster: IMonsterData = {
	...monsterOf('wolf'),
	level: 5,
	landType: 'snow',
};

/** 沼地史萊姆 / Swamp slime */
export const slimeMonster: IMonsterData = {
	...monsterOf('slime'),
	level: 2,
	landType: 'swamp',
};

/** 冰山雪狼 / Snow-mountain ice wolf */
export const iceWolfMonster: IMonsterData = {
	...monsterOf('iceWolf'),
	level: 10,
	landType: 'snow',
};

/** 冰山雪熊 / Snow-mountain snow bear */
export const snowBearMonster: IMonsterData = {
	...monsterOf('snowBear'),
	level: 12,
	landType: 'snow',
};

/** 冰山企鵝 / Snow-mountain penguin */
export const penguinMonster: IMonsterData = {
	...monsterOf('penguin'),
	level: 8,
	landType: 'snow',
};

/** 洞穴蝙蝠（地圖用，沿用哥布林斧兵圖像） / Cave-map bat (reuses the GoblinAxe image) */
export const caveMapBatMonster: IMonsterData = {
	...monsterOf('goblinAxe'),
	name: 'CaveBat',
	level: 5,
	landType: 'cave',
};

/** 洞穴暗影史萊姆 / Cave-map dark slime */
export const darkSlimeMonster: IMonsterData = {
	...monsterOf('darkSlime'),
	level: 7,
	landType: 'cave',
};