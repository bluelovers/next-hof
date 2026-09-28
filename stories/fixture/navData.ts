/**
 * NavigationBar / GDSubNav / GameLayout 展示用導航資料（單一事實來源）
 * NavigationBar / GDSubNav / GameLayout fixture nav data (single source of truth)
 *
 * 各故事展示用的獨立導航連結資料，集中管理避免重複定義。
 * Individual navigation-link showcase data, centralized to avoid duplication.
 */
import type { INavLink } from '../../src/components/navigation/NavTypes';

// ==================== NavigationBar 導航列資料 / NavigationBar nav data ====================

/** 預設導航（Top 啟用） / Default nav (Top active) */
export const defaultNavItems: INavLink[] = [
	{ label: 'Top', href: '#', active: true },
	{ label: 'Hunt', href: '#' },
	{ label: 'Item', href: '#' },
	{ label: 'Town', href: '#' },
	{ label: 'Setting', href: '#' },
	{ label: 'Log', href: '#' },
];

/** Hunt 頁導航 / Hunt-active nav */
export const huntActiveNavItems: INavLink[] = [
	{ label: 'Top', href: '#' },
	{ label: 'Hunt', href: '#', active: true },
	{ label: 'Item', href: '#' },
	{ label: 'Town', href: '#' },
	{ label: 'Setting', href: '#' },
	{ label: 'Log', href: '#' },
];

/** Item 頁導航 / Item-active nav */
export const itemActiveNavItems: INavLink[] = [
	{ label: 'Top', href: '#' },
	{ label: 'Hunt', href: '#' },
	{ label: 'Item', href: '#', active: true },
	{ label: 'Town', href: '#' },
	{ label: 'Setting', href: '#' },
	{ label: 'Log', href: '#' },
];

/** Town 頁導航 / Town-active nav */
export const townActiveNavItems: INavLink[] = [
	{ label: 'Top', href: '#' },
	{ label: 'Hunt', href: '#' },
	{ label: 'Item', href: '#' },
	{ label: 'Town', href: '#', active: true },
	{ label: 'Setting', href: '#' },
	{ label: 'Log', href: '#' },
];

/** Setting 頁導航 / Setting-active nav */
export const settingActiveNavItems: INavLink[] = [
	{ label: 'Top', href: '#' },
	{ label: 'Hunt', href: '#' },
	{ label: 'Item', href: '#' },
	{ label: 'Town', href: '#' },
	{ label: 'Setting', href: '#', active: true },
	{ label: 'Log', href: '#' },
];

/** Log 頁導航 / Log-active nav */
export const logActiveNavItems: INavLink[] = [
	{ label: 'Top', href: '#' },
	{ label: 'Hunt', href: '#' },
	{ label: 'Item', href: '#' },
	{ label: 'Town', href: '#' },
	{ label: 'Setting', href: '#' },
	{ label: 'Log', href: '#', active: true },
];

/** 自訂圖示導航 / Custom icon-nav items */
export const customNavItems: INavLink[] = [
	{ label: '🏠 Home', href: '#', active: true },
	{ label: '⚔️ Battle', href: '#' },
	{ label: '🎒 Inventory', href: '#' },
];

// ==================== GDSubNav 子導航資料 / GDSubNav sub-link data ====================

/** 自訂子導航連結 / Custom sub-links */
export const customSubLinks: INavLink[] = [
	{ label: '職業(Job)', href: 'http://127.0.0.1:8085/gamedata/job' },
	{ label: '技能(Skill)', href: 'http://127.0.0.1:8085/gamedata/skill' },
	{ label: '裝備(Equipment)', href: 'http://127.0.0.1:8085/gamedata/equipment' },
	{ label: '場景(Scene)', href: 'http://127.0.0.1:8085/gamedata/scene' },
];

/** 最少子導航連結 / Minimal sub-links */
export const minimalSubLinks: INavLink[] = [
	{ label: '職', href: 'http://127.0.0.1:8085/gamedata/job' },
	{ label: '物', href: 'http://127.0.0.1:8085/gamedata/item' },
];

/** 長標籤子導航連結 / Long-label sub-links */
export const longSubLinks: INavLink[] = [
	{ label: '職業情報(Job Info)', href: 'http://127.0.0.1:8085/gamedata/job' },
	{ label: 'アイテム詳細(Item Details)', href: 'http://127.0.0.1:8085/gamedata/item' },
	{ label: '判定基準(Judgment Criteria)', href: 'http://127.0.0.1:8085/gamedata/judge' },
	{ label: 'モンスター図鑑(Monster Encyclopedia)', href: 'http://127.0.0.1:8085/gamedata/monster' },
];

// ==================== GameLayout 自訂導航資料 / GameLayout custom nav data ====================

/** GameLayout 自訂導航連結 / GameLayout custom nav links */
export const layoutCustomNavLinks: INavLink[] = [
	{ href: '/home', label: '首頁 / Home' },
	{ href: '/game', label: '戰鬥 / Battle' },
	{ href: '/data', label: '數據 / Data' },
	{ href: '/help', label: '幫助 / Help' },
];