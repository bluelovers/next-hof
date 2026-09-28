/**
 * MonsterCard 展示用怪物資料（單一事實來源）
 * MonsterCard fixture monster data (single source of truth)
 *
 * 各故事展示用的獨立怪物資料，集中管理避免重複定義。
 * Individual monster data for each story showcase, centralized to avoid duplication.
 */
import type { IMonsterData } from '../../src/components/monsters/MonsterTypes';

/** 草地哥布林斧兵 / Grassland GoblinAxe */
export const goblinAxeMonster: IMonsterData = {
	name: 'GoblinAxe',
	imageUrl: '/image/char/mon_053.png',
	level: 1,
	landType: 'grass',
};

/** 草地哥布林法師 / Grassland GoblinMage */
export const goblinMageMonster: IMonsterData = {
	name: 'GoblinMage',
	imageUrl: '/image/char/mon_052.png',
	level: 1,
	landType: 'grass',
};

/** 洞穴蝙蝠 / Cave bat */
export const caveBatMonster: IMonsterData = {
	name: 'Cave Bat',
	imageUrl: '/image/char/mon_052.png',
	level: 3,
	landType: 'cave',
};

/** 熔岩地獄犬 / Lava hell hound */
export const hellHoundMonster: IMonsterData = {
	name: 'Hell Hound',
	imageUrl: '/image/char/mon_079.png',
	level: 15,
	landType: 'lava',
};

/** 高山龍王（高階） / Mountain DragonLord (high level) */
export const dragonLordMonster: IMonsterData = {
	name: 'DragonLord',
	imageUrl: '/image/char/mon_214.png',
	level: 99,
	landType: 'mount',
};

/** 雪地狼 / Snow wolf */
export const wolfMonster: IMonsterData = {
	name: 'Wolf',
	imageUrl: '/image/char/mon_079.png',
	level: 5,
	landType: 'snow',
};

/** 沼地史萊姆 / Swamp slime */
export const slimeMonster: IMonsterData = {
	name: 'Slime',
	imageUrl: '/image/char/mon_018.png',
	level: 2,
	landType: 'swamp',
};

/** 冰山雪狼 / Snow-mountain ice wolf */
export const iceWolfMonster: IMonsterData = {
	name: 'IceWolf',
	imageUrl: '/image/char/mon_053.png',
	level: 10,
	landType: 'snow',
};

/** 冰山雪熊 / Snow-mountain snow bear */
export const snowBearMonster: IMonsterData = {
	name: 'SnowBear',
	imageUrl: '/image/char/mon_052.png',
	level: 12,
	landType: 'snow',
};

/** 冰山企鵝 / Snow-mountain penguin */
export const penguinMonster: IMonsterData = {
	name: 'Penguin',
	imageUrl: '/image/char/mon_079.png',
	level: 8,
	landType: 'snow',
};

/** 洞穴蝙蝠（地圖用） / Cave-map bat */
export const caveMapBatMonster: IMonsterData = {
	name: 'CaveBat',
	imageUrl: '/image/char/mon_053.png',
	level: 5,
	landType: 'cave',
};

/** 洞穴暗影史萊姆 / Cave-map dark slime */
export const darkSlimeMonster: IMonsterData = {
	name: 'DarkSlime',
	imageUrl: '/image/char/mon_052.png',
	level: 7,
	landType: 'cave',
};