/**
 * 屍體政策逐級解析測試
 * Corpse-policy level resolution tests
 */
import { describe, it, expect } from 'vitest';
import { resolveCorpsePolicy, corpseSpecOf, type ICorpseSpec } from './corpse-policy';

describe('resolveCorpsePolicy', () => {
	it('prefers character > team > battle', () => {
		expect(resolveCorpsePolicy(true, false, false)).toBe(true);
		expect(resolveCorpsePolicy(false, true, true)).toBe(false);
		expect(resolveCorpsePolicy(undefined, true, false)).toBe(true);
		expect(resolveCorpsePolicy(undefined, false, true)).toBe(false);
	});

	it('defaults to false (no corpse) when every level is unset', () => {
		expect(resolveCorpsePolicy(undefined, undefined, undefined)).toBe(false);
	});

	it('treats an unset level as falsy, never as leave-corpse', () => {
		expect(resolveCorpsePolicy(undefined, undefined, false)).toBe(false);
		expect(resolveCorpsePolicy(undefined, false, undefined)).toBe(false);
	});

	it('honours an explicit true at any level', () => {
		expect(resolveCorpsePolicy(true, undefined, undefined)).toBe(true);
		expect(resolveCorpsePolicy(undefined, true, undefined)).toBe(true);
		expect(resolveCorpsePolicy(undefined, undefined, true)).toBe(true);
	});

	it('returns an object spec as-is (more specific level wins whole)', () => {
		const spec: ICorpseSpec = { imageUrl: '/image/char/mon_146.png', className: 'corpse-frost' };
		// 角色級物件勝出，戰鬥級布林不被合併進來
		// The character-level object wins; the battle-level boolean is not merged in
		expect(resolveCorpsePolicy(spec, true, false)).toBe(spec);
		// 戰鬥級物件在上層皆未設定時被繼承
		// The battle-level object is inherited when the upper levels are unset
		expect(resolveCorpsePolicy(undefined, undefined, spec)).toBe(spec);
		// 更具體一級的 false 仍可否決下層的物件
		// A more specific `false` still vetoes a lower-level object
		expect(resolveCorpsePolicy(false, undefined, spec)).toBe(false);
		expect(resolveCorpsePolicy(undefined, false, spec)).toBe(false);
	});

	it('treats an empty object as leave-corpse (object form is truthy)', () => {
		const empty: ICorpseSpec = {};
		expect(resolveCorpsePolicy(empty, false, false)).toBe(empty);
		expect(!resolveCorpsePolicy(undefined, undefined, empty)).toBe(false);
	});
});

describe('corpseSpecOf', () => {
	it('returns the spec for an object policy (including an empty one)', () => {
		const spec: ICorpseSpec = { className: 'corpse-frost' };
		expect(corpseSpecOf(spec)).toBe(spec);
		expect(corpseSpecOf({})).toEqual({});
	});

	it('returns undefined for boolean / unset policies', () => {
		expect(corpseSpecOf(true)).toBeUndefined();
		expect(corpseSpecOf(false)).toBeUndefined();
		expect(corpseSpecOf(undefined)).toBeUndefined();
	});

	it('defends against a null arriving from JSON data', () => {
		expect(corpseSpecOf(null as unknown as boolean)).toBeUndefined();
	});
});
