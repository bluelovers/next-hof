/**
 * 屍體政策逐級解析測試
 * Corpse-policy level resolution tests
 */
import { describe, it, expect } from 'vitest';
import { resolveCorpsePolicy } from './corpse-policy';

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
});
