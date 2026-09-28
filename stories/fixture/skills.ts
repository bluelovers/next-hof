/**
 * 技能定義（單一事實來源）
 * Skill definitions (single source of truth)
 *
 * 原 gameDataJobs（各職業內嵌技能）與 skillCards（獨立技能卡）各自定義技能，
 * 且多有重複（FatalStab／Paralysis／FireBall／PartyHeal…）。統一收斂於此：
 * - gameDataJobs 的職業以 `skills.<key>` 引用
 * - skillCards 的展示技能以 `skills.<key>` 別名（或覆寫變體）重導出
 * Skill definitions were duplicated across gameDataJobs (inline per-job skills) and
 * skillCards (standalone cards). Centralized here: jobs reference `skills.<key>`;
 * skillCards re-exports themed aliases (or overridden variants).
 *
 * 資料來源：GameDataPage 職業實際技能（對應 PHP 頁面輸出）
 * Source: actual job skills from the GameDataPage (matching the PHP page output).
 */
import type { ISkillData } from '../../src/components/game-data/GameDataTypes';
import { EnumTargetType, EnumTargetMethod, EnumSkillPriority } from '../../src/lib/game/types';
import { EnumSkillType } from '../../src/components/battle/enums';
import { EnumPosition } from '../../src/lib/game/constants';

/** 技能定義集（單一事實來源） / Skill registry (SSOT) */
export const skills = {
	// ==================== Warrior 系 / Warrior family ====================

	/** 多次斬擊 / Double attack */
	doubleAttack: {
		name: 'DoubleAttack',
		iconUrl: '/image/icon/skill/skill_073.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 15,
		powerPct: 90,
		hits: 2,
		effect: '连续发动两次攻击',
	},
	/** 突刺 / Stab */
	stab: {
		name: 'Stab',
		iconUrl: '/image/icon/skill/skill_074.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 15,
		powerPct: 190,
		hits: 1,
		hitRate: '0:40',
		effect: '瞄準要害進行致命一擊',
	},
	/** 致命一擊 / Fatal stab */
	fatalStab: {
		name: 'FatalStab',
		iconUrl: '/image/icon/skill/skill_074z.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 50,
		powerPct: 360,
		hits: 1,
		hitRate: '0:50',
		effect: '致命一擊，造成大量傷害',
	},
	/** 狂怒之擊 / Raging blow */
	ragingBlow: {
		name: 'RagingBlow',
		iconUrl: '/image/icon/skill/skill_031.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Multi,
		sp: 40,
		powerPct: 100,
		hits: 5,
		hitRate: '40:60',
		effect: '狂怒之擊，對多個敵人造成範圍傷害',
	},
	/** 突進攻擊（後列時威力4倍＋前進） / Charge attack */
	chargeAttack: {
		name: 'ChargeAttack',
		iconUrl: '/image/icon/skill/skill_033.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 10,
		powerPct: 100,
		hits: 1,
		hitRate: '0:30',
		effect: '後列の時威力4倍+前進',
		move: EnumPosition.Front,
	},
	/** 知力上昇 / Obtain mind */
	obtainMind: {
		name: 'ObtainMind',
		iconUrl: '/image/icon/skill/skill_057.png',
		target: EnumTargetType.Self,
		scope: EnumTargetMethod.Individual,
		sp: 0,
		sacrificePct: 15,
		upStats: { INT: 100 },
		effect: '知力上昇',
	},
	/** 衝鋒（犧牲體力） / Rush (self-sacrificing attack) */
	rush: {
		name: 'Rush',
		iconUrl: '/image/icon/skill/skill_057.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Multi,
		sp: 0,
		powerPct: 100,
		hits: 4,
		sacrificePct: 15,
		effect: '向敌人发起冲锋，造成伤害',
	},
	/** 毒化 / Illness (poison) */
	illness: {
		name: 'illness',
		iconUrl: '/image/icon/skill/skill_057.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.All,
		sp: 32,
		hitRate: '0:50',
		sacrificePct: 20,
		effect: '毒化',
	},
	/** 武器破壞 / Weapon break */
	weaponBreak: {
		name: 'WeaponBreak',
		iconUrl: '/image/icon/skill/skill_072.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 30,
		powerPct: 100,
		hits: 1,
		downStats: { ATK: 50, MATK: 50 },
		effect: '攻撃力低下',
	},
	/** 魔力破壞 / Mana break */
	manaBreak: {
		name: 'ManaBreak',
		iconUrl: '/image/icon/skill/skill_073z.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 20,
		powerPct: 120,
		hits: 1,
		effect: 'SPダメージ',
	},
	/** 心智破壞 / Mind break */
	mindBreak: {
		name: 'MindBreak',
		iconUrl: '/image/icon/skill/skill_050.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.All,
		sp: 60,
		skillType: EnumSkillType.Magic,
		downStats: { INT: 40 },
		hitRate: '30:0',
		effect: '降低敵人智力',
	},

	// ==================== Sorcerer 系 / Sorcerer family ====================

	/** 火球術 / Fire ball */
	fireBall: {
		name: 'FireBall',
		iconUrl: '/image/icon/skill/skill_018.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Multi,
		sp: 20,
		powerPct: 100,
		hits: 4,
		skillType: EnumSkillType.Magic,
		isInvalid: true,
		hitRate: '60:0',
		effect: '施放一個火球對多個敵人造成範圍傷害',
	},
	/** 火柱術 / Fire pillar */
	firePillar: {
		name: 'FirePillar',
		iconUrl: '/image/icon/skill/skill_007a.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Multi,
		sp: 40,
		powerPct: 140,
		hits: 2,
		skillType: EnumSkillType.Magic,
		isInvalid: true,
		downStats: { STR: 40 },
		hitRate: '50:0',
		effect: '力DOWN',
	},
	/** 高級 SP 回復 / High mana recharge */
	hiManaRecharge: {
		name: 'HiManaRecharge',
		iconUrl: '/image/icon/skill/skill_019z.png',
		target: EnumTargetType.Self,
		scope: EnumTargetMethod.Individual,
		sp: 0,
		skillType: EnumSkillType.Magic,
		hitRate: '30:0',
		effect: 'SP回復',
	},
	/** 暴風雪 / Blizzard */
	blizzard: {
		name: 'Blizzard',
		iconUrl: '/image/icon/skill/skill_006b.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Multi,
		sp: 240,
		powerPct: 90,
		hits: 10,
		skillType: EnumSkillType.Magic,
		hitRate: '90:0',
		effect: '对多个敌人造成冰霜伤害',
	},
	/** 冰牢 / Ice prison */
	icePrison: {
		name: 'IcePrison',
		iconUrl: '/image/icon/skill/skill_055.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 40,
		powerPct: 180,
		hits: 1,
		skillType: EnumSkillType.Magic,
		isInvalid: true,
		downStats: { DEF: 30, MDEF: 30 },
		hitRate: '40:0',
		effect: '防御DOWN',
	},
	/** 麻痺 / Paralysis */
	paralysis: {
		name: 'Paralysis',
		iconUrl: '/image/icon/skill/skill_025.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 15,
		powerPct: 50,
		hits: 1,
		skillType: EnumSkillType.Magic,
		delayPct: 120,
		hitRate: '30:0',
		effect: '行動遅延',
	},
	/** 火焰風暴 / Fire storm */
	fireStorm: {
		name: 'FireStorm',
		iconUrl: '/image/icon/skill/skill_004a.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Multi,
		sp: 70,
		powerPct: 100,
		hits: 6,
		skillType: EnumSkillType.Magic,
		isInvalid: true,
		hitRate: '70:0',
		effect: '施展火焰风暴，对多个敌人造成伤害',
	},
	/** 召喚海獸 / Summon leviathan */
	summonLeviathan: {
		name: 'SummonLeviathan',
		iconUrl: '/image/icon/skill/skill_029.png',
		target: EnumTargetType.Self,
		scope: EnumTargetMethod.Individual,
		sp: 700,
		hitRate: '100:300',
		magicCircleCost: 4,
		skillType: EnumSkillType.Magic,
		isQuick: true,
		effect: '召唤海兽',
	},
	/** 雷霆一擊 / Thunder bolt */
	thunderBolt: {
		name: 'ThunderBolt',
		iconUrl: '/image/icon/skill/skill_030z.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 30,
		powerPct: 400,
		hits: 1,
		skillType: EnumSkillType.Magic,
		isInvalid: true,
		hitRate: '50:0',
		effect: '施放雷霆一擊',
	},
	/** 召喚木乃伊 / Raise mummy */
	raiseMummy: {
		name: 'RaiseMummy',
		iconUrl: '/image/icon/skill/skill_028.png',
		target: EnumTargetType.Self,
		scope: EnumTargetMethod.Individual,
		sp: 120,
		skillType: EnumSkillType.Magic,
		summon: 1,
		hitRate: '60:0',
		effect: 'マミー',
	},

	// ==================== Priest 系 / Priest family ====================

	/** 全體回復 / Party heal */
	partyHeal: {
		name: 'PartyHeal',
		iconUrl: '/image/icon/skill/skill_013c.png',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.All,
		sp: 30,
		powerPct: 150,
		hits: 1,
		skillType: EnumSkillType.Magic,
		isSupport: true,
		hitRate: '50:0',
		effect: 'HP回復',
	},
	/** SP 回復 / Mana recharge */
	manaRecharge: {
		name: 'ManaRecharge',
		iconUrl: '/image/icon/skill/skill_019.png',
		target: EnumTargetType.Self,
		scope: EnumTargetMethod.Individual,
		sp: 0,
		skillType: EnumSkillType.Magic,
		effect: 'SP回復',
	},
	/** 隊列修正 / Stance restore */
	stanceRestore: {
		name: 'StanceRestore',
		iconUrl: '/image/icon/skill/inst_002.png',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.All,
		sp: 0,
		effect: '隊列修正',
	},
	/** 快速回復 / Quick heal */
	quickHeal: {
		name: 'QuickHeal',
		iconUrl: '/image/icon/skill/skill_013b.png',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.Multi,
		sp: 20,
		powerPct: 180,
		hits: 2,
		skillType: EnumSkillType.Magic,
		isSupport: true,
		effect: 'HP回復',
	},
	/** 聖域 / Sanctuary */
	sanctuary: {
		name: 'Sanctuary',
		iconUrl: '/image/icon/skill/skill_010.png',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.All,
		sp: 150,
		powerPct: 500,
		hits: 1,
		magicCircleCost: 2,
		skillType: EnumSkillType.Magic,
		curePoison: true,
		hitRate: '50:0',
		effect: 'HP,SP回復',
	},
	/** 魅惑 / Charm */
	charm: {
		name: 'Charm',
		iconUrl: '/image/icon/skill/skill_046.png',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.All,
		sp: 60,
		skillType: EnumSkillType.Magic,
		upStats: { INT: 30 },
		hitRate: '30:0',
		effect: '提升友軍智力',
	},
	/** 癒し兎召喚 / Heal rabbit */
	healRabbit: {
		name: 'HealRabbit',
		iconUrl: '/image/icon/skill/skill_038.png',
		target: EnumTargetType.Self,
		scope: EnumTargetMethod.Individual,
		sp: 60,
		skillType: EnumSkillType.Magic,
		isQuick: true,
		effect: '癒し兎召喚',
	},
	/** 神聖護盾 / Holy shield */
	holyShield: {
		name: 'HolyShield',
		iconUrl: '/image/icon/skill/skill_045z.png',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.All,
		sp: 100,
		skillType: EnumSkillType.Magic,
		hitRate: '0:100',
		effect: 'ダメージ1回無効化',
	},
	/** 魔力輔助 / Magic assist */
	magicAsist: {
		name: 'MagicAsist',
		iconUrl: '/image/icon/skill/skill_046.png',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.All,
		sp: 60,
		skillType: EnumSkillType.Magic,
		plusStats: { INT: 30 },
		hitRate: '30:0',
		effect: '提升友軍智力',
	},

	// ==================== Hunter 系 / Hunter family ====================

	/** 射擊 / Shoot */
	shoot: {
		name: 'Shoot',
		iconUrl: '/image/icon/skill/item_042.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 0,
		powerPct: 100,
		hits: 1,
		weaponLimit: 'Bow',
		isInvalid: true,
		priority: EnumSkillPriority.Back,
		effect: '射击',
	},
	/** 強力射擊 / Power shoot */
	powerShoot: {
		name: 'PowerShoot',
		iconUrl: '/image/icon/skill/item_042.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 10,
		powerPct: 200,
		hits: 1,
		weaponLimit: 'Bow',
		isInvalid: true,
		hitRate: '0:30',
		effect: '强力射击',
	},
	/** 箭雨 / Arrow shower */
	arrowShower: {
		name: 'ArrowShower',
		iconUrl: '/image/icon/skill/item_042.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Multi,
		sp: 20,
		powerPct: 60,
		hits: 6,
		weaponLimit: 'Bow',
		isInvalid: true,
		effect: '箭雨',
	},
	/** 颶風射擊 / Hurricane shot */
	hurricaneShot: {
		name: 'HurricaneShot',
		iconUrl: '/image/icon/skill/item_042.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Multi,
		sp: 180,
		powerPct: 70,
		hits: 16,
		weaponLimit: 'Bow',
		isInvalid: true,
		hitRate: '50:80',
		effect: '飓风射击',
	},
	/** 瞄準 / Aiming */
	aiming: {
		name: 'Aiming',
		iconUrl: '/image/icon/skill/item_042.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 0,
		powerPct: 130,
		hits: 1,
		weaponLimit: 'Bow',
		isInvalid: true,
		priority: EnumSkillPriority.Back,
		effect: '瞄准',
	},
	/** 雙重射擊 / Double shot */
	doubleShot: {
		name: 'DoubleShot',
		iconUrl: '/image/icon/skill/item_042.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Multi,
		sp: 28,
		powerPct: 80,
		hits: 2,
		weaponLimit: 'Bow',
		isInvalid: true,
		priority: EnumSkillPriority.Back,
		effect: '雙重射擊',
	},
	/** 召喚飛河馬 / Call fly hippo */
	callFlyHippo: {
		name: 'CallFlyHippo',
		iconUrl: '/image/icon/skill/skill_028.png',
		target: EnumTargetType.Self,
		scope: EnumTargetMethod.Individual,
		sp: 250,
		isQuick: true,
		summon: 1,
		hitRate: '0:300',
		effect: '飛河馬召喚',
	},
	/** 全力輔助 / Full support */
	fullSupport: {
		name: 'FullSupport',
		iconUrl: '/image/icon/skill/we_other007z.png',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.Individual,
		sp: 200,
		upStats: { STR: 100, INT: 100, SPD: 100 },
		hitRate: '0:150',
		weaponLimit: 'Whip',
		effect: '召喚キャラ強化',
	},
	/** 散射匕首 / Scatter knife */
	scatterKnife: {
		name: 'ScatterKnife',
		iconUrl: '/image/icon/skill/we_sword001z.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Multi,
		sp: 30,
		powerPct: 130,
		hits: 4,
		weaponLimit: 'Dagger',
		isInvalid: true,
		effect: '向多個敵人散射匕首進行攻擊',
	},
	/** 毒氣吐息 / Poison breath */
	poisonBreath: {
		name: 'PoisonBreath',
		iconUrl: '/image/icon/skill/skill_005cz.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.All,
		sp: 30,
		poisonPct: 30,
		hitRate: '30:30',
		effect: '前衛化',
	},

	// ==================== JobDetailCard 展示用技能 / JobDetailCard showcase skills ====================

	/** スラッシュ（劍攻撃） / Slash (sword attack) */
	slash: {
		name: 'スラッシュ',
		iconUrl: '/image/icon/skill/skill_073.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 5,
		powerPct: 80,
		hits: 1,
		hitRate: '90',
		weaponLimit: '剣',
		effect: '敵単体に物理ダメージ',
	},
	/** ファイア（杖魔法） / Flame (wand magic) */
	flame: {
		name: 'ファイア',
		iconUrl: '/image/icon/skill/skill_018.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 10,
		powerPct: 80,
		hits: 1,
		hitRate: '85',
		weaponLimit: '杖',
		effect: '敵単体に炎属性ダメージ',
		skillType: EnumSkillType.Magic,
	},
	/** ヒール（杖回復） / Heal (wand heal) */
	healJp: {
		name: 'ヒール',
		iconUrl: '/image/icon/skill/skill_013c.png',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.Individual,
		sp: 15,
		powerPct: 50,
		hits: 1,
		hitRate: '100',
		weaponLimit: '杖',
		effect: '味単体に回復',
		skillType: EnumSkillType.Magic,
		isSupport: true,
	},
	/** マルチショット（弓） / Multi shot (bow) */
	multiShot: {
		name: 'マルチショット',
		iconUrl: '/image/icon/skill/item_042.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Multi,
		sp: 20,
		powerPct: 40,
		hits: 3,
		hitRate: '75',
		weaponLimit: '弓',
		effect: '敵全体に矢属性ダメージ',
		isInvalid: true,
	},
	/** スナイプ（弓） / Snipe (bow) */
	snipe: {
		name: 'スナイプ',
		iconUrl: '/image/icon/skill/item_042.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 25,
		powerPct: 150,
		hits: 1,
		hitRate: '60',
		weaponLimit: '弓',
		effect: '敵単体に超強力な攻撃',
		isInvalid: true,
	},
	/** バインド（弓拘束） / Bind (bow restrain) */
	bind: {
		name: 'バインド',
		iconUrl: '/image/icon/skill/skill_025.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 30,
		powerPct: 0,
		hits: 1,
		hitRate: '80',
		weaponLimit: '弓',
		effect: '敵単体を行動不能にする',
	},
	/** ホーリー（聖劍） / Holy (holy sword) */
	holy: {
		name: 'ホーリー',
		iconUrl: '/image/icon/skill/skill_010.png',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 35,
		powerPct: 120,
		hits: 1,
		hitRate: '70',
		weaponLimit: '聖剣',
		effect: '敵単体に聖属性ダメージ',
	},
	/** プロテクション（聖盾） / Protection (holy shield) */
	protection: {
		name: 'プロテクション',
		iconUrl: '/image/icon/skill/skill_045z.png',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.Multi,
		sp: 25,
		powerPct: 0,
		hits: 1,
		hitRate: '100',
		weaponLimit: '聖盾',
		effect: '味全体の防御力をアップ',
		skillType: EnumSkillType.Magic,
		isSupport: true,
	},

	// ==================== JobDetailTable 展示用技能 / JobDetailTable showcase skills ====================

	/** 箭雨（Ranger） / Arrow rain (Ranger) */
	arrowRain: {
		name: 'ArrowRain',
		iconUrl: '',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Multi,
		sp: 35,
		powerPct: 120,
		hits: 3,
		hitRate: '30:50',
	},
	/** 鷹眼（Ranger） / Eagle eye (Ranger) */
	eagleEye: {
		name: 'EagleEye',
		iconUrl: '',
		target: EnumTargetType.Self,
		scope: EnumTargetMethod.Individual,
		sp: 20,
		effect: '命中率大幅上昇',
	},
	/** 火魔法（MasterOfAll） / Fire magic */
	fire: {
		name: 'Fire',
		iconUrl: '',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 8,
		powerPct: 150,
		hits: 1,
		hitRate: '20:20',
		skillType: EnumSkillType.Magic,
	},
	/** 冰魔法（MasterOfAll） / Ice magic */
	ice: {
		name: 'Ice',
		iconUrl: '',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 8,
		powerPct: 140,
		hits: 1,
		hitRate: '25:25',
		skillType: EnumSkillType.Magic,
	},
	/** 雷魔法（MasterOfAll） / Lightning magic */
	lightning: {
		name: 'Lightning',
		iconUrl: '',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.Individual,
		sp: 8,
		powerPct: 160,
		hits: 1,
		hitRate: '15:30',
		skillType: EnumSkillType.Magic,
	},
	/** HP 回復（MasterOfAll） / Heal (MasterOfAll) */
	heal: {
		name: 'Heal',
		iconUrl: '',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.Individual,
		sp: 10,
		effect: 'HP回復',
		skillType: EnumSkillType.Magic,
		isSupport: true,
	},
	/** 狀態異常回復（MasterOfAll） / Cure (MasterOfAll) */
	cure: {
		name: 'Cure',
		iconUrl: '',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.Individual,
		sp: 6,
		effect: '状態異常回復',
		curePoison: true,
	},
	/** 復活（MasterOfAll） / Revive (MasterOfAll) */
	revive: {
		name: 'Revive',
		iconUrl: '',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.Individual,
		sp: 60,
		effect: '味方一人を復活',
		skillType: EnumSkillType.Magic,
	},
	/** 全能力上昇（MasterOfAll） / Buff (MasterOfAll) */
	buff: {
		name: 'Buff',
		iconUrl: '',
		target: EnumTargetType.Friend,
		scope: EnumTargetMethod.All,
		sp: 40,
		effect: '全能力上昇',
		skillType: EnumSkillType.Magic,
	},
	/** 全能力低下（MasterOfAll） / Debuff (MasterOfAll) */
	debuff: {
		name: 'Debuff',
		iconUrl: '',
		target: EnumTargetType.Enemy,
		scope: EnumTargetMethod.All,
		sp: 40,
		effect: '全能力低下',
		skillType: EnumSkillType.Magic,
	},
} as const satisfies Record<string, ISkillData>;