import { describe, it, expect } from 'vitest';
import { Character } from '../character/Character';
import { EnumCharType, EnumSkillDamageType, EnumInfluence, EnumPosition } from '../types';
import { calcBasicDamage } from './effect';
import { calcBasicDamageOriginal } from './effect.original';

describe('calcBasicDamageOriginal (對照原始 PHP CalcBasicDamage)', () => {
	// 戰鬥六維（STR/INT/DEX/MAXHP/HP/level/def）皆為預設 0，需手動設定（對齊 Skill.test.ts 模式）。
	// Battle stats (STR/INT/DEX/MAXHP/HP/level/def) default to 0 and must be set manually
	// (mirrors the Skill.test.ts fixture pattern).
	const makeUser = () => {
		const u = new Character({
			no: 1, name: 'u', types: [EnumCharType.Char], level: 1,
			str: 100, int: 100, dex: 10, spd: 10, luk: 10, maxhp: 300, maxsp: 50,
		});
		u.STR = 100; // 戰鬥六維需手動設定 / battle stat must be set explicitly
		u.atk = [0, 0];
		return u;
	};

	const makeTarget = (withDef = false) => {
		const t = new Character({
			no: 2, name: 't', types: [EnumCharType.Mon], level: 1,
			str: 10, int: 10, dex: 10, spd: 10, luk: 10, maxhp: 300, maxsp: 50,
		});
		t.def = withDef ? [20, 5, 0, 0] : [0, 0, 0, 0];
		return t;
	};

	it('基礎傷害（無穿透／無 barrier）與移植版一致：sqrt(100)*10=100; *1.6=160; *(1-0.2)=128; -5=123', () => {
		const user = makeUser();
		const target = makeTarget(true);
		const orig = calcBasicDamageOriginal({ type: EnumSkillDamageType.Physical, pow: 160 }, user, target);
		expect(orig).toBe(123);
		expect(calcBasicDamage({ type: EnumSkillDamageType.Physical, pow: 160 } as never, user, target)).toBe(123);
	});

	it('無條件穿透：角色帶 SPECIAL.Pierce 但 option.pierce=false 時，原始仍加算穿透（移植版不會）', () => {
		const user = makeUser();
		user.SPECIAL.Pierce = [50, 0]; // 物理穿透 50
		const target = makeTarget(false);
		const orig = calcBasicDamageOriginal({ type: EnumSkillDamageType.Physical, pow: 100 }, user, target, { pierce: false });
		// base 100；無 def；穿透 +50 → 150
		expect(orig).toBe(150);
		const port = calcBasicDamage({ type: EnumSkillDamageType.Physical, pow: 100 } as never, user, target);
		expect(port).toBe(100); // 移植版不套用穿透（skill.pierce 未設）
	});

	it('Barrier：目標有 Barrier 時原始傷害歸 0 並消耗一次（移植版由 Battle 處理）', () => {
		const user = makeUser();
		const target = makeTarget(false);
		target.SPECIAL.Barrier = 1;
		const orig = calcBasicDamageOriginal({ type: EnumSkillDamageType.Physical, pow: 100 }, user, target);
		expect(orig).toBe(0);
		expect(target.SPECIAL.Barrier).toBe(0);
	});

	it('multiply：option.multiply=4 時原始傷害 ×4（移植版不支援）', () => {
		const user = makeUser();
		const target = makeTarget(false);
		const orig = calcBasicDamageOriginal({ type: EnumSkillDamageType.Physical, pow: 100 }, user, target, { multiply: 4 });
		// base 100 ×4 = 400
		expect(orig).toBe(400);
	});

	it('玩家保護：isChar 目標 dmg>=HP 時留 1 HP（移植版由 hpDamage 處理）', () => {
		const user = makeUser();
		const target = makeTarget(false);
		target.types = new Set([EnumCharType.Char]);
		target.HP = 50; target.MAXHP = 300; target.level = 20;
		// base 100；無 def → dmg 100；玩家保護：HP>10 && dmg>=HP → dmg = HP-1 = 49
		const orig = calcBasicDamageOriginal({ type: EnumSkillDamageType.Physical, pow: 100 }, user, target);
		expect(orig).toBe(49);
	});
});
