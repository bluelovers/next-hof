/**
 * GameData 展示用職業資料（單一事實來源）
 * GameData fixture job data (single source of truth)
 *
 * 所有 GameData 相關故事共用此資料，避免重複定義。
 * All GameData-related stories share this data to avoid duplication.
 *
 * 資料來源：PHP 頁面 http://localhost:8085/gamedata 實際輸出
 * Source: Actual output from PHP page http://localhost:8085/gamedata
 */
import type { IJobData, IGameDataPageData } from '../../src/components/game-data/GameDataTypes';

// ==================== 完整職業資料 / Complete job data ====================

/** 所有職業（PHP 頁面の實際データと一致） / All jobs (matches actual PHP page) */
export const allJobs: IJobData[] = [
  // === Warrior 系 ===
  {
    id: 100,
    name: 'Warrior',
    parentId: 0,
    description: '戦士系基本職。<br />そこそこ耐えて、攻撃もそこそこ。',
    spriteUrls: ['/image/char/mon_079.png', '/image/char/mon_080r.png'],
    equipment: ['Sword', 'TwoHandSword', 'Shield', 'Armor', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'DoubleAttack', iconUrl: '/image/icon/skill/skill_073.png', target: 'enemy', scope: 'normal', sp: 15, powerPct: 90, hits: 2, effect: '连续发动两次攻击' },
      { name: 'Stab', iconUrl: '/image/icon/skill/skill_074.png', target: 'enemy', scope: 'normal', sp: 15, powerPct: 190, hits: 1, hitRate: '0:40', effect: '瞄準要害進行致命一擊' },
      { name: 'FatalStab', iconUrl: '/image/icon/skill/skill_074z.png', target: 'enemy', scope: 'normal', sp: 50, powerPct: 360, hits: 1, hitRate: '0:50', effect: '致命一擊，造成大量傷害' },
    ],
  },
  {
    id: 101,
    name: 'RoyalGuard',
    parentId: 100,
    description: '戦士系上級職。<br />防御も攻撃も一回り強くなる。',
    spriteUrls: ['/image/char/mon_199r.png', '/image/char/mon_234r.png'],
    equipment: ['Sword', 'TwoHandSword', 'Shield', 'Armor', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'FatalStab', iconUrl: '/image/icon/skill/skill_074z.png', target: 'enemy', scope: 'normal', sp: 50, powerPct: 360, hits: 1, hitRate: '0:50', effect: '致命一擊，造成大量傷害' },
      { name: 'RagingBlow', iconUrl: '/image/icon/skill/skill_031.png', target: 'enemy', scope: 'multi', sp: 40, powerPct: 100, hits: 5, hitRate: '40:60', effect: '狂怒之擊，對多個敵人造成範圍傷害' },
      { name: 'ChargeAttack', iconUrl: '/image/icon/skill/skill_033.png', target: 'enemy', scope: 'normal', sp: 10, powerPct: 100, hits: 1, hitRate: '0:30', effect: '後列の時威力4倍+前進', move: 'front' },
    ],
  },
  {
    id: 102,
    name: 'Sacrier',
    parentId: 100,
    description: '戦士系上級職。<br />攻撃に特化した戦士。<br />自分の体力を犠牲に強力な技が使える。',
    spriteUrls: ['/image/char/mon_100r.png', '/image/char/mon_012.png'],
    equipment: ['Sword', 'TwoHandSword', 'Shield', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'ObtainMind', iconUrl: '/image/icon/skill/skill_057.png', target: 'self', scope: 'normal', sp: 0, sacrificePct: 15, upStats: { INT: 100 }, effect: '知力上昇' },
      { name: 'Rush', iconUrl: '/image/icon/skill/skill_057.png', target: 'enemy', scope: 'multi', sp: 0, powerPct: 100, hits: 4, sacrificePct: 15, effect: '向敌人发起冲锋，造成伤害' },
      { name: 'illness', iconUrl: '/image/icon/skill/skill_057.png', target: 'enemy', scope: 'all', sp: 32, hitRate: '0:50', sacrificePct: 20, effect: '毒化' },
    ],
  },
  {
    id: 103,
    name: 'WitchHunt',
    parentId: 100,
    description: '戦士系上級職。<br />相手の魔力を奪ったりする、やや変則的な戦士。',
    spriteUrls: ['/image/char/mon_150.png', '/image/char/mon_234.png'],
    equipment: ['Sword', 'Dagger', 'Shield', 'Armor', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'WeaponBreak', iconUrl: '/image/icon/skill/skill_072.png', target: 'enemy', scope: 'normal', sp: 30, powerPct: 100, hits: 1, downStats: { ATK: 50, MATK: 50 }, effect: '攻撃力低下' },
      { name: 'ManaBreak', iconUrl: '/image/icon/skill/skill_073z.png', target: 'enemy', scope: 'normal', sp: 20, powerPct: 120, hits: 1, effect: 'SPダメージ' },
      { name: 'MindBreak', iconUrl: '/image/icon/skill/skill_050.png', target: 'enemy', scope: 'all', sp: 60, skillType: 'magic', downStats: { INT: 40 }, hitRate: '30:0', effect: '降低敵人智力' },
    ],
  },

  // === Sorcerer 系 ===
  {
    id: 200,
    name: 'Sorcerer',
    parentId: 0,
    description: '魔法系基本職。<br />撃たれ弱いが強い魔法が使える。',
    spriteUrls: ['/image/char/mon_106.png', '/image/char/mon_018.png'],
    equipment: ['Wand', 'Staff', 'Book', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'FireBall', iconUrl: '/image/icon/skill/skill_018.png', target: 'enemy', scope: 'multi', sp: 20, powerPct: 100, hits: 4, skillType: 'magic', isInvalid: true, hitRate: '60:0', effect: '施放一個火球對多個敵人造成範圍傷害' },
      { name: 'FirePillar', iconUrl: '/image/icon/skill/skill_007a.png', target: 'enemy', scope: 'multi', sp: 40, powerPct: 140, hits: 2, skillType: 'magic', isInvalid: true, downStats: { STR: 40 }, hitRate: '50:0', effect: '力DOWN' },
      { name: 'HiManaRecharge', iconUrl: '/image/icon/skill/skill_019z.png', target: 'self', scope: 'normal', sp: 0, skillType: 'magic', hitRate: '30:0', effect: 'SP回復' },
    ],
  },
  {
    id: 201,
    name: 'Warlock',
    parentId: 200,
    description: '魔法系上級職。<br />さらに強力な魔法が使えるようになる。',
    spriteUrls: ['/image/char/mon_196z.png', '/image/char/mon_246r.png'],
    equipment: ['Wand', 'Staff', 'Book', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'Blizzard', iconUrl: '/image/icon/skill/skill_006b.png', target: 'enemy', scope: 'multi', sp: 240, powerPct: 90, hits: 10, skillType: 'magic', hitRate: '90:0', effect: '对多个敌人造成冰霜伤害' },
      { name: 'IcePrison', iconUrl: '/image/icon/skill/skill_055.png', target: 'enemy', scope: 'normal', sp: 40, powerPct: 180, hits: 1, skillType: 'magic', isInvalid: true, downStats: { DEF: 30, MDEF: 30 }, hitRate: '40:0', effect: '防御DOWN' },
      { name: 'Paralysis', iconUrl: '/image/icon/skill/skill_025.png', target: 'enemy', scope: 'normal', sp: 15, powerPct: 50, hits: 1, skillType: 'magic', delayPct: 120, hitRate: '30:0', effect: '行動遅延' },
    ],
  },
  {
    id: 202,
    name: 'Summoner',
    parentId: 200,
    description: '魔法系上級職。<br />時間はかかるが強力な召喚獣を呼べる。',
    spriteUrls: ['/image/char/mon_196y.png', '/image/char/mon_246z.png'],
    equipment: ['Wand', 'Staff', 'Book', 'Robe', 'Item'],
    skills: [
      { name: 'FireStorm', iconUrl: '/image/icon/skill/skill_004a.png', target: 'enemy', scope: 'multi', sp: 70, powerPct: 100, hits: 6, skillType: 'magic', isInvalid: true, hitRate: '70:0', effect: '施展火焰风暴，对多个敌人造成伤害' },
      { name: 'Paralysis', iconUrl: '/image/icon/skill/skill_025.png', target: 'enemy', scope: 'normal', sp: 15, powerPct: 50, hits: 1, skillType: 'magic', delayPct: 120, hitRate: '30:0', effect: '行動遅延' },
      { name: 'SummonLeviathan', iconUrl: '/image/icon/skill/skill_029.png', target: 'self', scope: 'normal', sp: 700, hitRate: '100:300', magicCircleCost: 4, skillType: 'magic', isQuick: true, effect: '召唤海兽' },
    ],
  },
  {
    id: 203,
    name: 'Necromancer',
    parentId: 200,
    description: '魔法系上級職。<br />相手の能力を下げたり、ゾンビを作ったり出来る。<br />毒も扱える。',
    spriteUrls: ['/image/char/mon_196x.png', '/image/char/mon_246y.png'],
    equipment: ['Wand', 'Staff', 'Book', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'IcePrison', iconUrl: '/image/icon/skill/skill_055.png', target: 'enemy', scope: 'normal', sp: 40, powerPct: 180, hits: 1, skillType: 'magic', isInvalid: true, downStats: { DEF: 30, MDEF: 30 }, hitRate: '40:0', effect: '防御DOWN' },
      { name: 'ThunderBolt', iconUrl: '/image/icon/skill/skill_030z.png', target: 'enemy', scope: 'normal', sp: 30, powerPct: 400, hits: 1, skillType: 'magic', isInvalid: true, hitRate: '50:0', effect: '施放雷霆一擊' },
      { name: 'RaiseMummy', iconUrl: '/image/icon/skill/skill_028.png', target: 'self', scope: 'normal', sp: 120, skillType: 'magic', summon: 1, hitRate: '60:0', effect: 'マミー' },
    ],
  },

  // === Priest 系 ===
  {
    id: 300,
    name: 'Priest',
    parentId: 0,
    description: '聖職基本職。<br />味方のHP,SPの回復ができる。',
    spriteUrls: ['/image/char/mon_213.png', '/image/char/mon_214.png'],
    equipment: ['Wand', 'Book', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'PartyHeal', iconUrl: '/image/icon/skill/skill_013c.png', target: 'friend', scope: 'all', sp: 30, powerPct: 150, hits: 1, skillType: 'magic', isSupport: true, hitRate: '50:0', effect: 'HP回復' },
      { name: 'ManaRecharge', iconUrl: '/image/icon/skill/skill_019.png', target: 'self', scope: 'normal', sp: 0, skillType: 'magic', effect: 'SP回復' },
      { name: 'StanceRestore', iconUrl: '/image/icon/skill/inst_002.png', target: 'friend', scope: 'all', sp: 0, effect: '隊列修正' },
    ],
  },
  {
    id: 301,
    name: 'Bishop',
    parentId: 300,
    description: '聖職上級職。<br />味方の能力値も上げれるようになる。',
    spriteUrls: ['/image/char/mon_213r.png', '/image/char/mon_214r.png'],
    equipment: ['Wand', 'Book', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'QuickHeal', iconUrl: '/image/icon/skill/skill_013b.png', target: 'friend', scope: 'multi', sp: 20, powerPct: 180, hits: 2, skillType: 'magic', isSupport: true, effect: 'HP回復' },
      { name: 'Sanctuary', iconUrl: '/image/icon/skill/skill_010.png', target: 'friend', scope: 'all', sp: 150, powerPct: 500, hits: 1, magicCircleCost: 2, skillType: 'magic', curePoison: true, hitRate: '50:0', effect: 'HP,SP回復' },
      { name: 'Charm', iconUrl: '/image/icon/skill/skill_046.png', target: 'friend', scope: 'all', sp: 60, skillType: 'magic', upStats: { INT: 30 }, hitRate: '30:0', effect: '提升友軍智力' },
    ],
  },
  {
    id: 302,
    name: 'Druid',
    parentId: 300,
    description: '聖職上級職。<br />特殊な支援能力を持っている。',
    spriteUrls: ['/image/char/mon_213rz.png', '/image/char/mon_214rz.png'],
    equipment: ['Wand', 'Book', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'HealRabbit', iconUrl: '/image/icon/skill/skill_038.png', target: 'self', scope: 'normal', sp: 60, skillType: 'magic', isQuick: true, effect: '癒し兎召喚' },
      { name: 'HolyShield', iconUrl: '/image/icon/skill/skill_045z.png', target: 'friend', scope: 'all', sp: 100, skillType: 'magic', hitRate: '0:100', effect: 'ダメージ1回無効化' },
      { name: 'MagicAsist', iconUrl: '/image/icon/skill/skill_046.png', target: 'friend', scope: 'all', sp: 60, skillType: 'magic', plusStats: { INT: 30 }, hitRate: '30:0', effect: '提升友軍智力' },
    ],
  },

  // === Hunter 系 ===
  {
    id: 400,
    name: 'Hunter',
    parentId: 0,
    description: '弓系基本職。<br />相手の前衛に影響されずに攻撃できる。',
    spriteUrls: ['/image/char/mon_219rr.png', '/image/char/mon_219r.png'],
    equipment: ['Bow', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'Shoot', iconUrl: '/image/icon/skill/item_042.png', target: 'enemy', scope: 'normal', sp: 0, powerPct: 100, hits: 1, weaponLimit: 'Bow', isInvalid: true, priority: 'Back', effect: '射击' },
      { name: 'PowerShoot', iconUrl: '/image/icon/skill/item_042.png', target: 'enemy', scope: 'normal', sp: 10, powerPct: 200, hits: 1, weaponLimit: 'Bow', isInvalid: true, hitRate: '0:30', effect: '强力射击' },
      { name: 'ArrowShower', iconUrl: '/image/icon/skill/item_042.png', target: 'enemy', scope: 'multi', sp: 20, powerPct: 60, hits: 6, weaponLimit: 'Bow', isInvalid: true, effect: '箭雨' },
    ],
  },
  {
    id: 401,
    name: 'Sniper',
    parentId: 400,
    description: '弓系上級職。<br />さらに強力な攻撃が可能。',
    spriteUrls: ['/image/char/mon_076z.png', '/image/char/mon_042z.png'],
    equipment: ['Bow', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'HurricaneShot', iconUrl: '/image/icon/skill/item_042.png', target: 'enemy', scope: 'multi', sp: 180, powerPct: 70, hits: 16, weaponLimit: 'Bow', isInvalid: true, hitRate: '50:80', effect: '飓风射击' },
      { name: 'Aiming', iconUrl: '/image/icon/skill/item_042.png', target: 'enemy', scope: 'normal', sp: 0, powerPct: 130, hits: 1, weaponLimit: 'Bow', isInvalid: true, priority: 'Back', effect: '瞄准' },
      { name: 'DoubleShot', iconUrl: '/image/icon/skill/item_042.png', target: 'enemy', scope: 'multi', sp: 28, powerPct: 80, hits: 2, weaponLimit: 'Bow', isInvalid: true, priority: 'Back', effect: '雙重射擊' },
    ],
  },
  {
    id: 402,
    name: 'BeastTamer',
    parentId: 400,
    description: '弓系上級職。<br />素早い召喚と召喚獣の強化が得意。',
    spriteUrls: ['/image/char/mon_216z.png', '/image/char/mon_217z.png'],
    equipment: ['Bow', 'Whip', 'Cloth', 'Robe', 'Item'],
    skills: [
      { name: 'PowerShoot', iconUrl: '/image/icon/skill/item_042.png', target: 'enemy', scope: 'normal', sp: 10, powerPct: 200, hits: 1, weaponLimit: 'Bow', isInvalid: true, hitRate: '0:30', effect: '强力射击' },
      { name: 'CallFlyHippo', iconUrl: '/image/icon/skill/skill_028.png', target: 'self', scope: 'normal', sp: 250, isQuick: true, summon: 1, hitRate: '0:300', effect: '飛河馬召喚' },
      { name: 'FullSupport', iconUrl: '/image/icon/skill/we_other007z.png', target: 'friend', scope: 'normal', sp: 200, upStats: { STR: 100, INT: 100, SPD: 100 }, hitRate: '0:150', weaponLimit: 'Whip', effect: '召喚キャラ強化' },
    ],
  },
  {
    id: 403,
    name: 'Murderer',
    parentId: 400,
    description: '弓系上級職。<br />毒の扱いに長けた職業。',
    spriteUrls: ['/image/char/mon_216y.png', '/image/char/mon_217rz.png'],
    equipment: ['Dagger', 'Bow', 'Armor', 'Cloth', 'Item'],
    skills: [
      { name: 'ScatterKnife', iconUrl: '/image/icon/skill/we_sword001z.png', target: 'enemy', scope: 'multi', sp: 30, powerPct: 130, hits: 4, weaponLimit: 'Dagger', isInvalid: true, effect: '向多個敵人散射匕首進行攻擊' },
      { name: 'PoisonBreath', iconUrl: '/image/icon/skill/skill_005cz.png', target: 'enemy', scope: 'all', sp: 30, poisonPct: 30, hitRate: '30:30', effect: '前衛化' },
      { name: 'ArrowShower', iconUrl: '/image/icon/skill/item_042.png', target: 'enemy', scope: 'multi', sp: 20, powerPct: 60, hits: 6, weaponLimit: 'Bow', isInvalid: true, effect: '箭雨' },
    ],
  },
];

// ==================== 衍生資料 / Derived data ====================

/** 完整職業頁面資料 / Complete job page data */
export const fullJobData: IGameDataPageData = { jobs: allJobs };

/** 基礎職業（parentId === 0） / Base jobs (parentId === 0) */
export const baseJobs: IJobData[] = allJobs.filter(j => j.parentId === 0);

/** 上級職業（parentId !== 0） / Advanced jobs (parentId !== 0) */
export const advancedJobs: IJobData[] = allJobs.filter(j => j.parentId !== 0);

/** Warrior 系職業 / Warrior job tree */
export const warriorJobs: IJobData[] = allJobs.filter(j => j.id >= 100 && j.id < 200);

/** Sorcerer 系職業 / Sorcerer job tree */
export const sorcererJobs: IJobData[] = allJobs.filter(j => j.id >= 200 && j.id < 300);

/** Priest 系職業 / Priest job tree */
export const priestJobs: IJobData[] = allJobs.filter(j => j.id >= 300 && j.id < 400);

/** Hunter 系職業 / Hunter job tree */
export const hunterJobs: IJobData[] = allJobs.filter(j => j.id >= 400 && j.id < 500);
