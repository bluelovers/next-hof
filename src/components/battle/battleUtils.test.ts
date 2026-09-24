/**
 * battleUtils 分段與快照轉接測試
 * battleUtils segmentation & snapshot adapter tests
 */
import { describe, it, expect } from 'vitest';
import {
	splitActionsBySnapshots,
	snapshotUnitToBattleUnit,
	segmentUnitsForSide,
	resolveSegmentSprites,
	SPRITE_CORPSE_URL,
	SPRITE_CORPSE_URL_REV,
} from './battleUtils';
import { EnumActionType, EnumTeamSideUI, EnumUnitStatus, EnumChargeKind } from './enums';
import type {
	IBattleAction,
	IBattleSnapshotDisplay,
	IBattleSnapshotDisplayUnit,
	IBattleSprite,
} from './types';

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

describe('resolveSegmentSprites', () => {
	/** 建立最小精靈 / Build a minimal sprite */
	function sprite(id: string, imageUrl = `/image/char/${id}.png`): IBattleSprite {
		return { unitUuid: id, imageUrl, x: 0, y: 0 };
	}

	/** 建立最小快照單位 / Build a minimal snapshot unit */
	function unit(
		id: string,
		dead: boolean,
		extra?: Partial<IBattleSnapshotDisplayUnit>,
	): IBattleSnapshotDisplayUnit {
		return {
			unitUuid: id,
			name: `unit-${id}`,
			side: EnumTeamSideUI.Left,
			hp: dead ? 0 : 1,
			maxHp: 1,
			sp: 0,
			maxSp: 0,
			dead,
			// 預設留屍體；個別測試可覆寫為 false / 省略來驗證不留屍體
			// Leaves a corpse by default; individual tests override to false / omit to vanish
			corpse: true,
			...extra,
		};
	}

	it('returns the same sprites when no snapshot is given', () => {
		const sprites = [sprite('u1')];
		expect(resolveSegmentSprites(sprites)).toBe(sprites);
	});

	it('keeps living units with their own image', () => {
		const sprites = [sprite('u1', '/image/char/mon_052.png')];
		const snap = snapshot(0, [unit('u1', false)]);
		expect(resolveSegmentSprites(sprites, snap)[0].imageUrl).toBe('/image/char/mon_052.png');
	});

	it('replaces a dead unit with the corpse image (forward directory)', () => {
		const sprites = [sprite('u1', '/image/char/mon_052.png')];
		const snap = snapshot(0, [unit('u1', true)]);
		expect(resolveSegmentSprites(sprites, snap)[0].imageUrl).toBe(SPRITE_CORPSE_URL);
	});

	it('uses the mirrored corpse for char_rev sprites', () => {
		const sprites = [sprite('u1', '/image/char_rev/mon_018.png')];
		const snap = snapshot(0, [unit('u1', true)]);
		expect(resolveSegmentSprites(sprites, snap)[0].imageUrl).toBe(SPRITE_CORPSE_URL_REV);
	});

	it('vanishes a dead unit when its policy is corpse:false', () => {
		const sprites = [sprite('u1'), sprite('u2')];
		const snap = snapshot(0, [unit('u1', true, { corpse: false }), unit('u2', true)]);
		// u1 vanishes (no corpse); u2 stays as a corpse
		expect(resolveSegmentSprites(sprites, snap).map((s) => s.unitUuid)).toEqual(['u2']);
	});

	it('treats an unset corpse policy as falsy (vanish), never as leave-corpse', () => {
		const sprites = [sprite('u1')];
		const unset: IBattleSnapshotDisplayUnit = {
			unitUuid: 'u1',
			name: 'unit-u1',
			side: EnumTeamSideUI.Left,
			hp: 0,
			maxHp: 1,
			sp: 0,
			maxSp: 0,
			dead: true,
		};
		expect(resolveSegmentSprites(sprites, snapshot(0, [unset]))).toHaveLength(0);
	});

	it('hides units absent from the snapshot (not yet joined / already gone)', () => {
		const sprites = [sprite('u1'), sprite('u2')];
		const snap = snapshot(0, [unit('u1', false)]);
		expect(resolveSegmentSprites(sprites, snap).map((s) => s.unitUuid)).toEqual(['u1']);
	});

	it('restores the original image after a revive (same uid)', () => {
		const sprites = [sprite('u1', '/image/char/mon_052.png')];
		const deadSnap = snapshot(0, [unit('u1', true)]);
		const revivedSnap = snapshot(1, [unit('u1', false)]);
		expect(resolveSegmentSprites(sprites, deadSnap)[0].imageUrl).toBe(SPRITE_CORPSE_URL);
		expect(resolveSegmentSprites(sprites, revivedSnap)[0].imageUrl).toBe('/image/char/mon_052.png');
	});

	it('applies a form-change appearance override from the snapshot', () => {
		const sprites = [sprite('u1', '/image/char/mon_052.png')];
		const snap = snapshot(0, [unit('u1', false, { imageUrl: '/image/char/mon_053.png' })]);
		expect(resolveSegmentSprites(sprites, snap)[0].imageUrl).toBe('/image/char/mon_053.png');
	});

	it('uses a custom corpse image from the object spec (verbatim path)', () => {
		const sprites = [sprite('u1', '/image/char/mon_052.png')];
		const snap = snapshot(0, [
			unit('u1', true, { corpse: { imageUrl: '/image/char/mon_146.png' } }),
		]);
		expect(resolveSegmentSprites(sprites, snap)[0].imageUrl).toBe('/image/char/mon_146.png');
	});

	it('falls back to the directory-based corpse image when the spec path is blank', () => {
		const sprites = [{ ...sprite('u1', '/image/char_rev/mon_018.png'), flipped: true }];
		const snap = snapshot(0, [unit('u1', true, { corpse: { imageUrl: '   ' } })]);
		const out = resolveSegmentSprites(sprites, snap)[0];
		expect(out.imageUrl).toBe(SPRITE_CORPSE_URL_REV);
		// 空白路徑＝未指定，故沿用原精靈朝向（不重新推導）
		// A blank path counts as unspecified, so the original facing is kept (no re-derivation)
		expect(out.flipped).toBe(true);
	});

	it('treats an empty object spec as leave-corpse with the default appearance', () => {
		const sprites = [sprite('u1', '/image/char/mon_052.png')];
		const snap = snapshot(0, [unit('u1', true, { corpse: {} })]);
		const out = resolveSegmentSprites(sprites, snap);
		expect(out).toHaveLength(1);
		expect(out[0].imageUrl).toBe(SPRITE_CORPSE_URL);
		expect(out[0].className).toBeUndefined();
		expect(out[0].style).toBeUndefined();
	});

	it('appends the spec className and merges the spec style onto the corpse layer', () => {
		const sprites = [
			{ ...sprite('u1'), className: 'on-field', style: { opacity: 1, filter: 'none' } },
		];
		const snap = snapshot(0, [
			unit('u1', true, { corpse: { className: 'corpse-frost', style: { opacity: 0.6 } } }),
		]);
		const out = resolveSegmentSprites(sprites, snap)[0];
		// class 併存而非取代；style 同名屬性由 spec 覆寫、其餘保留
		// Classes coexist (not replaced); same-named style keys come from the spec, the rest stay
		expect(out.className).toBe('on-field corpse-frost');
		expect(out.style).toEqual({ opacity: 0.6, filter: 'none' });
	});

	it('keeps the original facing for the default (boolean) corpse image', () => {
		const sprites = [{ ...sprite('u1', '/image/char/mon_052.png'), flipped: true }];
		const snap = snapshot(0, [unit('u1', true)]);
		expect(resolveSegmentSprites(sprites, snap)[0].flipped).toBe(true);
	});

	it('re-derives facing from a custom corpse image plus the team side', () => {
		// char 圖 + 左隊 → 不翻轉（原精靈 char_rev + 左隊本來是翻轉的）
		// char image + left team → no flip (the original char_rev + left sprite was flipped)
		const onLeft = [{ ...sprite('u1', '/image/char_rev/mon_018.png'), flipped: true }];
		const leftSnap = snapshot(0, [
			unit('u1', true, { corpse: { imageUrl: '/image/char/mon_146.png' } }),
		]);
		expect(resolveSegmentSprites(onLeft, leftSnap)[0].flipped).toBe(false);

		// char 圖 + 右隊 → 翻轉（維持面向場地中心）
		// char image + right team → flipped (keeps facing the centre)
		const onRight = [{ ...sprite('u2', '/image/char_rev/mon_018.png'), flipped: false }];
		const rightSnap = snapshot(0, [
			unit('u2', true, {
				side: EnumTeamSideUI.Right,
				corpse: { imageUrl: '/image/char/mon_146.png' },
			}),
		]);
		expect(resolveSegmentSprites(onRight, rightSnap)[0].flipped).toBe(true);
	});

	it('keeps the explicit flip for a custom image outside char / char_rev', () => {
		const sprites = [{ ...sprite('u1', '/image/char/mon_052.png'), flipped: true }];
		const snap = snapshot(0, [
			unit('u1', true, { corpse: { imageUrl: '/image/other/tomb.png' } }),
		]);
		expect(resolveSegmentSprites(sprites, snap)[0].flipped).toBe(true);
	});
});
