// 可注入的隨機數來源 / Injectable RNG (seedable)
// 使用 mulberry32 PRNG，對應原始 PHP mt_rand 的可重現語意。
// 所有需要隨機性的系統（敵方生成、守護機率、中毒、AI 1940 等）皆依賴此類。

export class RNG {
	private state: number;

	constructor(seed = 1) {
		// 確保 32-bit 無號整數種子
		this.state = seed >>> 0;
	}

	/** 內部產生 [0,1) 浮點數 */
	private next(): number {
		this.state = (this.state + 0x6d2b79f5) | 0;
		let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	}

	/** 整數 [min,max] 含兩端，對應 mt_rand(min,max) */
	randInt(min: number, max: number): number {
		if (max < min) [min, max] = [max, min];
		return min + Math.floor(this.next() * (max - min + 1));
	}

	/** 浮點 [0,1) */
	randFloat(): number {
		return this.next();
	}

	/** Fisher-Yates 洗牌（回傳新陣列，不改變原陣列） */
	shuffle<T>(arr: readonly T[]): T[] {
		const out = arr.slice();
		for (let i = out.length - 1; i > 0; i--) {
			const j = Math.floor(this.next() * (i + 1));
			[out[i], out[j]] = [out[j], out[i]];
		}
		return out;
	}
}
