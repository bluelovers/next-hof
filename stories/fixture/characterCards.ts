/**
 * CharacterCard / CharacterList 展示用角色資料（單一事實來源）
 * CharacterCard / CharacterList fixture character data (single source of truth)
 *
 * 各故事展示用的獨立角色資料，集中管理避免重複定義。
 * Individual character data for each story showcase, centralized to avoid duplication.
 */
import type { ICharacterData, IBattleCharacterData } from '../../src/components/characters/CharacterTypes';

// ==================== CharacterList 隊員資料 / CharacterList roster ====================

/** 法師隊員（mon_018 = 72px 高） / Mage member (mon_018 = 72px tall) */
export const mageChar: ICharacterData = {
	id: 'char-1',
	name: 'Mage1',
	imageUrl: '/image/char/mon_018.png',
	level: 3,
	className: 'Sorceress',
	hasStar: true,
	selected: false,
};

/** 補師隊員（mon_214 = 72px 高） / Healer member (mon_214 = 72px tall) */
export const healerChar: ICharacterData = {
	id: 'char-2',
	name: 'Healer1',
	imageUrl: '/image/char/mon_214.png',
	level: 3,
	className: 'Priestess',
	hasStar: true,
	selected: false,
};

/** 戰士隊員（mon_079 = 64px 高） / Hero member (mon_079 = 64px tall) */
export const heroChar: ICharacterData = {
	id: 'char-3',
	name: 'Hero1',
	imageUrl: '/image/char/mon_079.png',
	level: 3,
	className: 'Warrior',
	hasStar: true,
	selected: false,
};

/** 主教隊員（mon_214 = 72px 高） / Priest member (mon_214 = 72px tall) */
export const priestChar: ICharacterData = {
	id: 'char-4',
	name: 'Priest1',
	imageUrl: '/image/char/mon_214.png',
	level: 3,
	className: 'Priestess',
	hasStar: true,
	selected: false,
};

/** 狂戰士隊員（mon_079 = 64px 高） / Berserker member (mon_079 = 64px tall) */
export const berserkerChar: ICharacterData = {
	id: 'char-5',
	name: 'Berserker1',
	imageUrl: '/image/char/mon_079.png',
	level: 5,
	className: 'Berserker',
	hasStar: true,
	selected: false,
};

/** 弓箭手隊員（mon_018 = 72px 高） / Archer member (mon_018 = 72px tall) */
export const archerChar: ICharacterData = {
	id: 'char-6',
	name: 'Archer1',
	imageUrl: '/image/char/mon_018.png',
	level: 2,
	className: 'Archer',
	hasStar: false,
	selected: false,
};

/** 新手隊員一（mon_214 = 72px 高） / Novice member one (mon_214 = 72px tall) */
export const novice1Char: ICharacterData = {
	id: 'char-7',
	name: 'Novice1',
	imageUrl: '/image/char/mon_214.png',
	level: 1,
	className: 'Novice',
	hasStar: false,
	selected: false,
};

/** 新手隊員二（mon_018 = 72px 高） / Novice member two (mon_018 = 72px tall) */
export const novice2Char: ICharacterData = {
	id: 'char-8',
	name: 'Novice2',
	imageUrl: '/image/char/mon_018.png',
	level: 1,
	className: 'Novice',
	hasStar: false,
	selected: false,
};

// ==================== 矮 / 高對照資料 / Short & tall comparison ====================

/** 矮個子角色（精靈圖 32px 高） / Short character (32px-tall sprite) */
export const shortChar: ICharacterData = {
	id: 'char-short',
	name: 'Shorty',
	imageUrl: '/image/char/mon_036z.png',
	level: 1,
	className: 'Chibi',
	hasStar: false,
	selected: false,
};

/** 高個子角色（精靈圖 128px 高） / Tall character (128px-tall sprite) */
export const tallChar: ICharacterData = {
	id: 'char-tall',
	name: 'Giant',
	imageUrl: '/image/char/mon_162.png',
	level: 10,
	className: 'Titan',
	hasStar: true,
	selected: false,
};

// ==================== CharacterCard 展示資料 / CharacterCard showcase ====================

/** radio 模式法師（未選取） / Radio-mode mage (unselected) */
export const radioMage: ICharacterData = {
	id: 'char-mage',
	name: 'Mage1',
	imageUrl: '/image/char/mon_018.png',
	level: 3,
	className: 'Sorceress',
	hasStar: true,
	active: false,
};

/** checkbox 模式補師（已勾選） / Checkbox-mode healer (checked) */
export const checkboxHealer: ICharacterData = {
	id: 'char-healer',
	name: 'Healer1',
	imageUrl: '/image/char/mon_214.png',
	level: 5,
	className: 'Priestess',
	hasStar: true,
	active: true,
};

/** 已選取戰士 / Active warrior */
export const activeWarrior: ICharacterData = {
	id: 'char-warrior',
	name: 'Hero1',
	imageUrl: '/image/char/mon_079.png',
	level: 10,
	className: 'Warrior',
	hasStar: true,
	active: true,
};

/** 帶連結的戰士 / Linked warrior */
export const linkedWarrior: ICharacterData = {
	id: 'char-link',
	name: 'Linked',
	imageUrl: '/image/char/mon_079.png',
	level: 1,
	className: 'Warrior',
};

/** 僅顯示名稱的角色 / Name-only character */
export const nameOnlyChar: ICharacterData = {
	id: 'char-nameonly',
	name: 'SimpleChar',
	imageUrl: '/image/char/mon_018.png',
	level: 1,
	className: 'Novice',
	active: false,
};

/** 無選取控件的展示角色 / Display-only character (no selection control) */
export const displayOnlyChar: ICharacterData = {
	id: 'char-noselect',
	name: 'DisplayOnly',
	imageUrl: '/image/char/mon_018.png',
	level: 7,
	className: 'Mage',
	hasStar: true,
};

/** 無底座的角色 / Character without pedestal */
export const noCarpetChar: ICharacterData = {
	id: 'char-nopedestal',
	name: 'NoCarpet',
	imageUrl: '/image/char/mon_018.png',
	level: 1,
	className: 'Novice',
};

/** 自訂 children 的角色 / Character with custom children badge */
export const badgeChar: ICharacterData = {
	id: 'char-child',
	name: 'WithBadge',
	imageUrl: '/image/char/mon_079.png',
	level: 5,
	className: 'Warrior',
	hasStar: true,
};

/** 向後兼容 selected 欄位的角色 / Backward-compatible legacy selected character */
export const legacySelectedChar: ICharacterData = {
	id: 'char-backward',
	name: 'OldAPI',
	imageUrl: '/image/char/mon_018.png',
	level: 1,
	className: 'Novice',
	selected: true,
};

// ==================== CharacterCard（checkbox）展示資料 / CharacterCard (checkbox) showcase ====================

/** 未勾選法師 / Unchecked mage */
export const checkboxUnchecked: ICharacterData = {
	id: 'char-uncheck',
	name: 'Mage1',
	imageUrl: '/image/char/mon_018.png',
	level: 3,
	className: 'Sorceress',
	hasStar: true,
	active: false,
};

/** 已勾選補師 / Checked healer */
export const checkboxChecked: ICharacterData = {
	id: 'char-check',
	name: 'Healer1',
	imageUrl: '/image/char/mon_214.png',
	level: 5,
	className: 'Priestess',
	hasStar: true,
	active: true,
};

/** 對比用未勾選新手 / Compare-unchecked novice */
export const compareUnchecked: ICharacterData = {
	id: 'uncheck',
	name: 'Unchecked',
	imageUrl: '/image/char/mon_018.png',
	level: 1,
	className: 'Novice',
	active: false,
};

/** 對比用已勾選戰士 / Compare-checked warrior */
export const compareChecked: ICharacterData = {
	id: 'checked',
	name: 'Checked',
	imageUrl: '/image/char/mon_079.png',
	level: 5,
	className: 'Warrior',
	hasStar: true,
	active: true,
};

/** checkbox 模式帶連結的角色 / Checkbox-mode linked character */
export const checkboxLinked: ICharacterData = {
	id: 'char-link',
	name: 'LinkedChar',
	imageUrl: '/image/char/mon_079.png',
	level: 10,
	className: 'Warrior',
	hasStar: true,
	active: false,
};

// ==================== DashboardPage 展示資料 / DashboardPage showcase ====================

/** 儀表板預設隊伍（沿用隊員資料，ID 為 DB 記錄值） / Dashboard default roster (reuses member data, DB record ids) */
export const dashboardCharacters: ICharacterData[] = [
	{ ...mageChar, id: '2f4954e7348fff17f92b46e8d72005d1' },
	{ ...healerChar, id: '6ece402a38eab57ef07afff56535d6e1', selected: true },
	{ ...heroChar, id: 'b3e304903f09e14b8386a49a1e1e1e01e3' },
	{ ...priestChar, id: 'de979500692a963857ea9d68868f2958' },
];

/** 新手隊伍戰士（未滿編） / Beginner-team warrior */
export const beginnerWarrior: ICharacterData = {
	id: 'char-b1',
	name: 'Warrior1',
	imageUrl: '/image/char/mon_079.png',
	level: 1,
	className: 'Warrior',
	hasStar: false,
	selected: true,
};

/** 新手隊伍法師（未滿編） / Beginner-team mage */
export const beginnerMage: ICharacterData = {
	id: 'char-b2',
	name: 'Mage1',
	imageUrl: '/image/char/mon_018.png',
	level: 1,
	className: 'Sorceress',
	hasStar: false,
	selected: false,
};

/** 瀕危隊伍唯一角色 / Sole survivor of a depleted team */
export const loneHeroChar: ICharacterData = {
	id: 'char-d1',
	name: 'LoneHero',
	imageUrl: '/image/char/mon_079.png',
	level: 1,
	className: 'Warrior',
	hasStar: true,
	selected: true,
};

// ==================== BattlePage 編成角色資料 / BattlePage formation characters ====================

/** 編成角色：名探偵 / Formation character: Detective */
export const battleDetectiveChar: IBattleCharacterData = {
	id: '1',
	name: '名探偵',
	imageUrl: '/image/char/m_chr30101.png',
	level: 1,
	className: '探偵',
};

/** 編成角色：新米錬金術師 / Formation character: Novice alchemist */
export const battleAlchemistChar: IBattleCharacterData = {
	id: '2',
	name: '新米錬金術師',
	imageUrl: '/image/char/f_chr03901.png',
	level: 1,
	className: '錬金術師',
};

/** 編成角色：魔導剣士 / Formation character: Sword mage */
export const battleSwordMageChar: IBattleCharacterData = {
	id: '3',
	name: '魔導剣士',
	imageUrl: '/image/char/m_chr02901.png',
	level: 1,
	className: '魔導剣士',
};

/** 編成角色：弓聖（高階） / Formation character: Bow saint (high level) */
export const battleBowSaintChar: IBattleCharacterData = {
	id: '4',
	name: '弓聖',
	imageUrl: '/image/char/f_chr04201.png',
	level: 137,
	className: '弓聖',
};

/** 預設編成角色一覽 / Default formation character roster */
export const battleCharacters: IBattleCharacterData[] = [
	battleDetectiveChar,
	battleAlchemistChar,
	battleSwordMageChar,
	battleBowSaintChar,
];