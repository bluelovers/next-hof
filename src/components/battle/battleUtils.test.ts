/**
 * battleUtils 分段與快照轉接測試
 * battleUtils segmentation & snapshot adapter tests
 */
import { describe, it, expect } from 'vitest';
import {
	splitActionsBySnapshots,
	snapshotUnitToBattleUnit,
	segmentUnitsForSide,
	filterSpritesBySnapshot,
} from './battleUtils';
import { EnumActionType, EnumTeamSideUI, EnumUnitStatus, EnumChargeKind } from './enums';
import type { IBattleAction, IBattleSnapshotDisplay, IBattleSprite } from './types';

/** 建立最小可用行動 / Build a minimal action */
function action(message: string, side?: EnumTeamSideUI): IBattleAction {
	return { type: EnumActionType.Attack, message, side };
}

/** 建立最小快照 / Build a minimal snapshot */
function snapshot(
	at: number,
	units: IBattleSnapshotDisplay['units'] = [],
): IBattleSnapshotDisplay {
	return { at, units };
}

describe('splitActionsBySnapshots', () => {
	it('returns a single snapshot-less segment when no snapshots are given', () => {
		const actions = [action('a'), action('b')];
		const segments = splitActionsBySnapshots(actions);
		expect(segments).toHaveLength(1);
		expect(segments[0].snapshot).toBeUndefined();
		expect(segments[0].actions).toEqual(actions);
	});

	it('splits actions at snapshot boundaries', () => {
		const actions = [action('a'), action('b'), action('c'), action('d')];
		const segments = splitActionsBySnapshots(actions, [snapshot(0), snapshot(2)]);
		expect(segments.map((s) => s.actions.map((a) => a.message))).toEqual([
			['a', 'b'],
			['c', 'd'],
		]);
		expect(segments.map((s) => s.index)).toEqual([0, 1]);
	});

	it('keeps a trailing state-only snapshot as the final-state segment', () => {
		const actions = [action('a'), action('b')];
		const segments = splitActionsBySnapshots(actions, [snapshot(0), snapshot(2)]);
		expect(segments).toHaveLength(2);
		expect(segments[0].actions).toHaveLength(2);
		expect(segments[1].actions).toHaveLength(0);
		expect(segments[1].snapshot?.at).toBe(2);
	});

	it('sorts out-of-order snapshot bounds and indexes sequentially', () => {
		const actions = [action('a'), action('b'), action('c')];
		const segments = splitActionsBySnapshots(actions, [snapshot(2), snapshot(0)]);
		expect(segments.map((s) => s.index)).toEqual([0, 1]);
		expect(segments.map((s) => s.actions.map((a) => a.message))).toEqual([['a', 'b'], ['c']]);
		expect(segments[0].snapshot?.at).toBe(0);
	});
});

describe('snapshotUnitToBattleUnit', () => {
	it('maps dead/charging status', () => {
		const dead = snapshotUnitToBattleUnit({
			name: 'Goblin',
			side: EnumTeamSideUI.Left,
			hp: 0,
			maxHp: 100,
			sp: 0,
			maxSp: 10,
			dead: true,
		});
		expect(dead.status).toBe(EnumUnitStatus.Down);
		expect(dead.hp).toBe(0);

		const casting = snapshotUnitToBattleUnit({
			name: 'Mage',
			side: EnumTeamSideUI.Right,
			hp: 50,
			maxHp: 100,
			sp: 20,
			maxSp: 50,
			dead: false,
			chargeKind: EnumChargeKind.Casting,
		});
		expect(casting.status).toBe(EnumUnitStatus.Casting);
		expect(casting.side).toBe(EnumTeamSideUI.Right);
	});
});

describe('segmentUnitsForSide', () => {
	it('uses the snapshot state filtered by side', () => {
		const left = { name: 'Goblin', side: EnumTeamSideUI.Left, hp: 30, maxHp: 100, sp: 0, maxSp: 10, dead: false };
		const right = { name: 'Hero', side: EnumTeamSideUI.Right, hp: 80, maxHp: 100, sp: 0, maxSp: 10, dead: false };
		const segment = splitActionsBySnapshots([action('a')], [snapshot(0, [left, right])])[0];

		expect(segmentUnitsForSide(segment, EnumTeamSideUI.Left, []).map((u) => u.name)).toEqual(['Goblin']);
		expect(segmentUnitsForSide(segment, EnumTeamSideUI.Right, []).map((u) => u.name)).toEqual(['Hero']);
	});

	it('falls back to the provided units when the segment has no snapshot', () => {
		const segment = splitActionsBySnapshots([action('a')])[0];
		const fallback = [
			{ name: 'Hero', level: 1, hp: 1, maxHp: 1, sp: 0, maxSp: 0, side: EnumTeamSideUI.Right },
		];
		expect(segmentUnitsForSide(segment, EnumTeamSideUI.Right, fallback)).toEqual(fallback);
		expect(segmentUnitsForSide(segment, EnumTeamSideUI.Left, fallback)).toEqual([]);
	});
});

describe('filterSpritesBySnapshot', () => {
	/** 建立最小精靈 / Build a minimal sprite */
	function sprite(id: string, unitNo: string): IBattleSprite {
		return { id, unitNo, imageUrl: `/image/char/${id}.png`, x: 0, y: 0 };
	}

	const left = { name: 'Goblin', side: EnumTeamSideUI.Left, hp: 0, maxHp: 100, sp: 0, maxSp: 10 };

	it('returns the same sprites when no snapshot is given', () => {
		const sprites = [sprite('a', '1000')];
		expect(filterSpritesBySnapshot(sprites)).toBe(sprites);
	});

	it('removes sprites whose unitNo is dead in every instance', () => {
		const sprites = [sprite('a', '1000'), sprite('b', '1001')];
		const snap = snapshot(0, [
			{ ...left, id: '1000', dead: true },
			{ ...left, id: '1001', dead: false },
		]);
		expect(filterSpritesBySnapshot(sprites, snap).map((s) => s.unitNo)).toEqual(['1001']);
	});

	it('keeps all sprites of a unitNo when at least one instance is alive', () => {
		const sprites = [sprite('a', '1002'), sprite('b', '1002')];
		const snap = snapshot(0, [
			{ ...left, id: '1002', dead: true },
			{ ...left, id: '1002', dead: false },
		]);
		expect(filterSpritesBySnapshot(sprites, snap)).toHaveLength(2);
	});

	it('keeps sprites without a unitNo', () => {
		const sprites = [{ imageUrl: '/image/x.png', x: 0, y: 0 } as IBattleSprite];
		const snap = snapshot(0, [{ ...left, id: '1000', dead: true }]);
		expect(filterSpritesBySnapshot(sprites, snap)).toHaveLength(1);
	});
});
