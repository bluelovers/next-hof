/**
 * TownPage / TownFacility / FacilityGroup / MessageBoard 展示用資料（單一事實來源）
 * TownPage / TownFacility / FacilityGroup / MessageBoard fixture data (single source of truth)
 *
 * 各故事展示用的獨立城鎮資料，集中管理避免重複定義。
 * Individual town showcase data, centralized to avoid duplication.
 */
import type { IFacilityData } from '../../src/components/facilities/TownFacility';

// ==================== 留言板資料 / MessageBoard data ====================

/** 少量留言（TownPage 用） / Few messages (for TownPage) */
export const townMessagesFew: string[] = [
	'こんにちは！',
	'今日はいい天気ですね。',
	'誰かパーティー募集してる？',
	'ダンジョン攻略情報求む！',
];

/** 大量留言（TownPage 用） / Many messages (for TownPage) */
export const townMessagesMany: string[] = [
	'こんにちは！',
	'今日はいい天気ですね。',
	'誰かパーティー募集してる？',
	'ダンジョン攻略情報求む！',
	'鍛冶屋で武器強化したよ！',
	'オークションでレアアイテム出品中',
	'コロシアムで対戦相手募集！',
	'アルバイトの報酬が上がったって',
	'新キャラ追加されたらしい',
	'精錬に成功した！やったー！',
];

/** 三則留言（MessageBoard 獨立故事） / Three messages (MessageBoard standalone) */
export const boardMessagesThree: string[] = [
	'こんにちは！',
	'今日はいい天気ですね。',
	'コロシアムで対戦相手募集！',
];

/** 五則留言（MessageBoard 獨立故事） / Five messages (MessageBoard standalone) */
export const boardMessagesFive: string[] = [
	'メッセージ1: こんにちは！',
	'メッセージ2: パーティー募集！',
	'メッセージ3: アイテム交換したい',
	'メッセージ4: ダンジョン攻略情報',
	'メッセージ5: 鍛冶屋おすすめ',
];

// ==================== 設施資料 / Facility data ====================

/** 商店設施（雙語） / Shop facility (bilingual) */
export const shopFacility: IFacilityData = { name: '店', nameEn: 'Shop', href: '#' };

/** 購買設施（雙語） / Buy facility (bilingual) */
export const buyFacility: IFacilityData = { name: '買う', nameEn: 'Buy', href: '#' };

/** 純日文設施 / Japanese-only facility */
export const japaneseOnlyFacility: IFacilityData = { name: 'アルバイト', href: '#' };

/** 附圖示的設施 / Facility with icon */
export const iconFacility: IFacilityData = { name: 'Shop', icon: '🛒', href: '#' };

/** 商店群（店／買う／売る／アルバイト） / Shop group facilities */
export const shopFacilities: IFacilityData[] = [
	{ name: '店', nameEn: 'Shop', href: '#' },
	{ name: '買う', nameEn: 'Buy', href: '#' },
	{ name: '売る', nameEn: 'Sell', href: '#' },
	{ name: 'アルバイト', href: '#' },
];

/** 鍛冶群（鍛冶屋／精錬工房／製作工房） / Smithy group facilities */
export const smithyFacilities: IFacilityData[] = [
	{ name: '鍛冶屋', nameEn: 'Smithy', href: '#' },
	{ name: '精錬工房', nameEn: 'Refine', href: '#' },
	{ name: '製作工房', nameEn: 'Create', href: '#' },
];

/** 人材群（單一設施） / Recruit group facilities */
export const recruitFacilities: IFacilityData[] = [
	{ name: '人材斡旋所', nameEn: 'Recruit', href: '#' },
];