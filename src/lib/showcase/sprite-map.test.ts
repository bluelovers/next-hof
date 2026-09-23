import { describe, it, expect } from 'vitest';
import { SEED } from '#/lib/game/data/seed-data';
import {
	CHAR_SPRITE_URLS,
	MON_SPRITE_URLS,
	SPRITE_PLACEHOLDER_URL,
	getCharSpriteUrl,
	getMonSpriteUrl,
} from './sprite-map';

// OpenSpec 任務 2.2：每個 seed 角色/怪物都必須有 imageUrl 或明確 placeholder
// OpenSpec task 2.2: every seed char/monster must resolve to an image URL or the
// explicit placeholder.
describe('showcase sprite map', () => {
	it('every seed char has a non-placeholder sprite image', () => {
		for (const c of SEED.chars) {
			const url = CHAR_SPRITE_URLS[c.no];
			expect(url, `char ${c.no} (${c.name}) missing sprite mapping`).toBeTruthy();
			expect(url).toMatch(/^\/image\/char\//);
		}
	});

	it('every seed monster has a non-placeholder sprite image', () => {
		for (const m of SEED.mons) {
			const url = MON_SPRITE_URLS[m.no];
			expect(url, `mon ${m.no} (${m.name}) missing sprite mapping`).toBeTruthy();
			expect(url).toMatch(/^\/image\/char\//);
		}
	});

	it('unmapped numbers fall back to the explicit placeholder', () => {
		expect(getCharSpriteUrl(99999)).toBe(SPRITE_PLACEHOLDER_URL);
		expect(getMonSpriteUrl(99999)).toBe(SPRITE_PLACEHOLDER_URL);
	});
});
