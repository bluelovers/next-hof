/**
 * HuntPage / HuntAreaLink / HuntSubNav 展示用資料（單一事實來源）
 * HuntPage / HuntAreaLink / HuntSubNav fixture data (single source of truth)
 *
 * 各故事展示用的獨立狩獵區域／子導航資料，集中管理避免重複定義。
 * Individual hunting area / sub-nav showcase data, centralized to avoid duplication.
 */
import type { IHuntAreaData } from '../../src/components/areas/HuntAreaLink';
import type { INavLink } from '../../src/components/navigation/NavTypes';

// ==================== HuntAreaLink 獵區資料 / HuntAreaLink area data ====================

/** 草地獵區 / Grass terrain area */
export const grassArea: IHuntAreaData = { name: 'GoblinField', land: 'gb0', levelRange: 'Lv1-5', landType: 'grass' };

/** 洞穴獵區 / Cave terrain area */
export const caveArea: IHuntAreaData = { name: 'DarkCave', land: 'cave01', levelRange: 'Lv10-20', landType: 'cave' };

/** 雪地獵區 / Snow terrain area */
export const snowArea: IHuntAreaData = { name: 'FrozenTundra', land: 'snow01', levelRange: 'Lv30-40', landType: 'snow' };

/** 沙漠獵區 / Desert terrain area */
export const desertArea: IHuntAreaData = { name: 'ScorchedDesert', land: 'des01', levelRange: 'Lv5-10', landType: 'sand' };

/** 熔岩獵區 / Lava terrain area */
export const lavaArea: IHuntAreaData = { name: 'VolcanoCore', land: 'volc01', levelRange: 'Lv50-70', landType: 'lava' };

/** 沼地獵區 / Swamp terrain area */
export const swampArea: IHuntAreaData = { name: 'PoisonMarsh', land: 'swamp01', levelRange: 'Lv15-25', landType: 'swamp' };

/** 海洋獵區 / Ocean terrain area */
export const oceanArea: IHuntAreaData = { name: 'DeepSea', land: 'ocean01', levelRange: 'Lv35-55', landType: 'ocean0' };

/** 廢墟獵區 / Abandoned terrain area */
export const abandonedArea: IHuntAreaData = { name: 'RuinedCity', land: 'blow01', levelRange: 'Lv20-30', landType: 'aband' };

/** 高山獵區 / Mountain terrain area */
export const mountainArea: IHuntAreaData = { name: 'RockyPeak', land: 'mt01', levelRange: 'Lv25-35', landType: 'mount' };

/** 無背景獵區（fallback） / No-background area (fallback) */
export const unknownArea: IHuntAreaData = { name: 'UnknownArea', land: 'unknown01', levelRange: 'Lv??' };

/** 橫排展示用迷你獵區 / Row-showcase mini areas */
export const rowMiniAreas: IHuntAreaData[] = [
	{ name: 'Grass', land: 'g', levelRange: 'Lv1', landType: 'grass' },
	{ name: 'Cave', land: 'c', levelRange: 'Lv5', landType: 'cave' },
	{ name: 'Lava', land: 'l', levelRange: 'Lv50', landType: 'lava' },
	{ name: 'Sea', land: 's', levelRange: 'Lv10', landType: 'sea' },
];

// ==================== HuntPage 獵區列表資料 / HuntPage area list data ====================

/** 自訂高階獵區（龍の巣／深淵の迷宮） / Custom high-level areas */
export const dragonNestAreas: IHuntAreaData[] = [
	{ name: '龍の巣', land: 'dragon01', levelRange: 'Lv50-70' },
	{ name: '深淵の迷宮', land: 'abyss01', levelRange: 'Lv80-99' },
];

/** 少量獵區（ゴブリン） / Few goblin areas */
export const goblinFewAreas: IHuntAreaData[] = [
	{ name: 'ゴブリンと遊ぶ(最弱)', land: 'gb0', levelRange: 'Lv1' },
	{ name: 'ちょっと強いゴブリン', land: 'gb1', levelRange: 'Lv1-5' },
];

// ==================== HuntSubNav 子導航資料 / HuntSubNav item data ====================

/** 單一子導航項目 / Single sub-nav item */
export const singleNavItems: INavLink[] = [
	{ label: 'AllMonsters', href: '/battle/list_all', active: true },
];

/** 三個子導航項目（第二個啟用） / Three sub-nav items (second active) */
export const threeNavItems: INavLink[] = [
	{ label: 'Easy', href: '/battle/easy' },
	{ label: 'Normal', href: '/battle/normal', active: true },
	{ label: 'Hard', href: '/battle/hard' },
];

/** 多個子導航項目 / Many sub-nav items */
export const manyNavItems: INavLink[] = [
	{ label: 'Common', href: '/battle/common', active: true },
	{ label: 'Rare', href: '/battle/rare' },
	{ label: 'Elite', href: '/battle/elite' },
	{ label: 'Boss', href: '/battle/boss' },
	{ label: 'Event', href: '/battle/event' },
];