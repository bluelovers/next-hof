import { describe, it, expect } from 'vitest';
import { Character } from '../character/Character';
import { createSeedRepository } from '../data/seed-data';
import { InMemoryRepository } from '../data/repository';
import { getItem } from './Item';
import { setEquip, CalcEquips, getHandleMax } from './equip';
import { EnumWeaponType, EnumCharType, EnumEquipSlot, EnumItemCategory } from '../types';

describe('Item definition (7.1)', () => {
	const repo = createSeedRepository();

	it('getItem parses atk/def/dh/handle/need', () => {
		const sword = getItem(1000, repo)!;
		expect(sword.atk).toEqual([10, 0]);
		expect(sword.def).toEqual([0, 0, 0, 0]);
		expect(sword.dh).toBe(false);
		expect(sword.handle).toBe(1);
		expect(sword.need).toEqual({ 6001: 4 });

		const shield = getItem(3000, repo)!;
		expect(shield.def).toEqual([5, 5, 0, 0]);
		expect(shield.handle).toBe(1);
	});
});

describe('Equip system (7.2)', () => {
	it('dh main-hand unequips off-hand; handle overflow fails', () => {
		const r = new InMemoryRepository();
		r.addItem({ no: 1000, name: 'ShortSword', type: EnumWeaponType.Sword, type2: EnumItemCategory.Weapon, atk: [10, 0], def: [0, 0, 0, 0], handle: 1, need: {} });
		r.addItem({ no: 3000, name: 'WoodShield', type: EnumWeaponType.Shield, type2: EnumItemCategory.Armor, atk: [0, 0], def: [5, 5, 0, 0], handle: 1, need: {} });
		r.addItem({ no: 9000, name: 'BigSword', type: EnumWeaponType.TwoHandSword, type2: EnumItemCategory.Weapon, atk: [50, 0], def: [0, 0, 0, 0], dh: true, handle: 3, need: {} });
		r.addItem({ no: 9999, name: 'Heavy', type: EnumWeaponType.Armor, type2: EnumItemCategory.Armor, atk: [0, 0], def: [0, 0, 0, 0], handle: 10, need: {} });

		const char = new Character({
			no: 1, name: 'c', types: [EnumCharType.Char], level: 1,
			str: 10, int: 10, dex: 4, spd: 10, luk: 10, maxhp: 300, maxsp: 50,
		});
		char.equip = { off_hand: 3000 };

		// 雙手互斥：裝備 dh 主手 → 卸下副手
		const [fail, removed] = setEquip(char, r, EnumEquipSlot.MainHand, 9000);
		expect(fail).toBe(false);
		expect(removed).toContain(3000);
		expect(char.equip.off_hand).toBeUndefined();
		expect(char.equip.main_hand).toBe(9000);

		// 負荷限制：DEX 4, level 1 → 上限 5；handle 10 超過
		const char2 = new Character({
			no: 2, name: 'c2', types: [EnumCharType.Char], level: 1,
			str: 10, int: 10, dex: 4, spd: 10, luk: 10, maxhp: 300, maxsp: 50,
		});
		const [fail2] = setEquip(char2, r, EnumEquipSlot.MainHand, 9999);
		expect(fail2).toBe(true);
	});

	it('CalcEquips accumulates atk/def from equipped items', () => {
		const repo = createSeedRepository();
		const char = new Character({
			no: 1, name: 'c', types: [EnumCharType.Char], level: 1,
			str: 10, int: 10, dex: 4, spd: 10, luk: 10, maxhp: 300, maxsp: 50,
		});
		char.equip = { main_hand: 1000, off_hand: 3000 };
		CalcEquips(char, repo);
		expect(char.atk[0]).toBe(10);
		expect(char.def[0]).toBe(5);
		expect(char.def[1]).toBe(5);
		expect(char.WEAPON).toBe(EnumWeaponType.Sword);
		expect(getHandleMax(char)).toBe(5);
	});
});
