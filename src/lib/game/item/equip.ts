// 裝備系統 / Equipment system
// 對應 docs/log/battle/03-char-equipment-system.md §5。
// CalcEquips 計算 atk/def 與 P_*/M_* 補正；setEquip 處理雙手互斥與負荷限制。

import type { Character } from '../character/Character';
import type { IDataRepository } from '../data/repository';
import type { IEquipSlot, IWeaponType } from '../types';
import { parseItem } from './Item';

/** 玩家最大負荷：5 + floor(level/10) + floor(DEX/5) */
export function getHandleMax(char: Character): number {
	return 5 + Math.floor(char.level / 10) + Math.floor(char.DEX / 5);
}

/** 目前裝備總負荷 */
export function currentHandle(char: Character, repo: IDataRepository): number {
	let h = 0;
	for (const no of Object.values(char.equip)) {
		if (!no) continue;
		const it = repo.getItem(no);
		if (it) h += it.handle ?? 0;
	}
	return h;
}

/** 依目前裝備計算 atk/def 與 P_、M_ 補正 */
export function CalcEquips(char: Character, repo: IDataRepository): void {
	char.atk = [0, 0];
	char.def = [0, 0, 0, 0];
	for (const slot of Object.keys(char.equip) as IEquipSlot[]) {
		const no = char.equip[slot];
		if (!no) continue;
		const item = repo.getItem(no);
		if (!item) continue;
		if (slot === 'main_hand') char.WEAPON = item.type as IWeaponType;

		char.atk[0] += item.atk?.[0] ?? 0;
		char.atk[1] += item.atk?.[1] ?? 0;
		char.def[0] += item.def?.[0] ?? 0;
		char.def[1] += item.def?.[1] ?? 0;
		char.def[2] += item.def?.[2] ?? 0;
		char.def[3] += item.def?.[3] ?? 0;

		char.P_MAXHP += item.P_MAXHP ?? 0;
		char.P_MAXSP += item.P_MAXSP ?? 0;
		char.M_MAXHP += item.M_MAXHP ?? 0;
		char.M_MAXSP += item.M_MAXSP ?? 0;
		char.P_STR += item.P_STR ?? 0;
		char.P_INT += item.P_INT ?? 0;
		char.P_DEX += item.P_DEX ?? 0;
		char.P_SPD += item.P_SPD ?? 0;
		char.P_LUK += item.P_LUK ?? 0;

		if (item.P_SUMMON) char.addSpecial('Summon', item.P_SUMMON);
		if (item.P_PIERCE) {
			char.SPECIAL.Pierce[0] += item.P_PIERCE;
			char.SPECIAL.Pierce[1] += item.P_PIERCE;
		}
	}
}

/**
 * 裝備物品。回傳 [是否失敗, 被強制卸下的物品編號陣列]。
 * 規則（對應 setEquip）：
 *  - 雙手武器(dh) 互斥：主手/副手其一為 dh 時，卸下另一側。
 *  - 負荷限制：裝備後總 handle 不得超過 getHandleMax。
 *  - need（職業需求）僅讀取，不強制檢查（與原始行為一致）。
 */
export function setEquip(
	char: Character,
	repo: IDataRepository,
	slot: IEquipSlot,
	itemNo: number,
): [boolean, number[]] {
	const item = repo.getItem(itemNo);
	if (!item) return [true, []];

	const removed: number[] = [];

	// 雙手互斥
	if (slot === 'main_hand' || slot === 'off_hand') {
		const other: IEquipSlot = slot === 'main_hand' ? 'off_hand' : 'main_hand';
		const otherNo = char.equip[other];
		if (otherNo) {
			const otherItem = repo.getItem(otherNo);
			if (item.dh || otherItem?.dh) {
				removed.push(otherNo);
				delete char.equip[other];
			}
		}
	}

	// 負荷檢查
	const trial: Record<string, number | undefined> = { ...char.equip, [slot]: itemNo };
	let h = 0;
	for (const no of Object.values(trial)) {
		if (!no) continue;
		const it = repo.getItem(no);
		h += it?.handle ?? 0;
	}
	if (h > getHandleMax(char)) return [true, removed];

	char.equip[slot] = itemNo;
	return [false, removed];
}

// 讓 parseItem 在測試中可見但不強制使用
export { parseItem };
