/**
 * BattleDisplay 展示資料（單一事實來源）
 * BattleDisplay showcase data (single source of truth)
 *
 * 故事檔只保留顯示開關與說明；展示資料全數集中於此，且每個事實只描述一次：
 * - 單位定義（IShowcaseUnit）派生狀態列單位、快照單位與戰場精靈座標
 * - 行動的 `message` 由欄位導出，不與 source / value / target 重複書寫
 * - 技能圖示、隊名、戰場設定、標題與時間皆為常數
 * The story file keeps only display toggles and docs; all showcase data lives here with
 * every fact stated once: unit definitions derive the status-row units, snapshot units and
 * battlefield sprite coordinates; each action's `message` is derived from its own fields
 * rather than restating them; skill icons, team names, the battlefield config and the
 * header are constants.
 *
 * 精靈座標與翻轉一律由 computeBattleSpritePositions 計算，禁止手工指定
 * （唯一例外：BattleFieldScene 系列及其 sampleData）。
 * Sprite coordinates and flipping are always computed by computeBattleSpritePositions;
 * hand-written positions are forbidden (the only exception is the BattleFieldScene series
 * and its sampleData).
 */
import type {
  IBattleAction,
  IBattleDisplayData,
  IBattleFieldConfig,
  IBattleResult,
  IBattleSnapshotDisplay,
  IBattleSnapshotDisplayUnit,
  IBattleSprite,
  IBattleUnit,
  IMagicCircleRecord,
  ISkillIcon,
} from '#/components/battle/types';
import { SPRITE_LAYOUT_WIDTH, SPRITE_LAYOUT_HEIGHT } from '#/components/battle/types';
import type { IBattlePositionChar } from '#/components/battle/computeSpritePositions';
import { computeBattleSpritePositions, groupBattleChars } from '#/components/battle/computeSpritePositions';
import { getSpriteImageSize } from '#/components/battle/spriteImageSizes';
import {
  EnumActionType,
  EnumAttributeType,
  EnumMagicCircleKind,
  EnumTeamSideUI,
  EnumUnitStatus,
} from '#/components/battle/enums';
import { buildMagicCircleMessage } from '#/components/battle/battleUtils';
import { EnumPosition } from '#/lib/game/constants';

// ==================== 常數 / Constants ====================

/** 左隊隊名 / Left team name */
const LEFT_TEAM_NAME = 'ゴブリンと遊ぶ(最弱)';

/** 右隊隊名 / Right team name */
const RIGHT_TEAM_NAME = 'TestTeam';

/** 戰鬥標題與起始時間 / Battle title and start time */
const BATTLE_TITLE = 'battle log*';
const BATTLE_TIME = '05/13(Wed) 04:39:24';

/** 戰場設定（背景＋角色排版尺寸）/ Battlefield config (background + sprite layout size) */
const BATTLEFIELD: IBattleFieldConfig = {
  backgroundImageUrl: '/image/land/bg_grass.png',
  backgroundType: 'grass',
  width: SPRITE_LAYOUT_WIDTH,
  height: SPRITE_LAYOUT_HEIGHT,
};

/** 精靈定位計算用的戰場尺寸 / Field size used for sprite positioning */
const FIELD_SIZE = { width: SPRITE_LAYOUT_WIDTH, height: SPRITE_LAYOUT_HEIGHT };

/** 技能圖示（行動日誌共用）/ Skill icons (shared by the action log) */
const SKILL_FATAL_STAB: ISkillIcon = { name: 'FatalStab', iconUrl: '/image/icon/skill/skill_074z.png' };
const SKILL_ATTACK: ISkillIcon = { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' };
const SKILL_GRAVEYARD: ISkillIcon = { name: 'GraveYard', iconUrl: '/image/icon/skill/skill_028.png' };
const SKILL_MAGIC_CIRCLE: ISkillIcon = { name: 'MagicCircle', iconUrl: '/image/icon/skill/ms_01.png' };
const SKILL_DOUBLE_MAGIC_CIRCLE: ISkillIcon = { name: 'DoubleMagicCircle', iconUrl: '/image/icon/skill/ms_01.png' };
const SKILL_CIRCLE_ERASE: ISkillIcon = { name: 'CircleErase', iconUrl: '/image/icon/skill/ms_02.png' };
const SKILL_SUMMON_LEVIATHAN: ISkillIcon = { name: 'SummonLeviathan', iconUrl: '/image/icon/skill/skill_029.png' };

/** 戰鬥結果（預設與戰鬥結束共用）/ Battle result (shared by Default and BattleOver) */
const BATTLE_RESULT: IBattleResult = {
  winner: LEFT_TEAM_NAME,
  isDraw: false,
  leftTeam: { hpRemain: 573, alive: 4, totalUnits: 4, totalDamage: 1384, totalExp: 4, funds: '4' },
  rightTeam: { hpRemain: 0, alive: 0, totalUnits: 4, totalDamage: 379 },
};

// ==================== 單位定義（唯一事實來源）/ Unit definitions (single source of truth) ====================

/**
 * 展示用單位定義：一個單位只在這裡描述一次
 * Showcase unit definition: each unit is described exactly once
 *
 * 狀態列、快照、戰場精靈與入場訊息的等級皆由此派生。
 * Status rows, snapshots, battlefield sprites and the enter-message level all derive from it.
 */
interface IShowcaseUnit {
  /** 戰鬥單位實例 uid（sprite.unitUuid ↔ snapshot unitUuid）/ battle-unit instance uid */
  unitUuid: string;
  /** 單位名稱 / Unit name */
  name: string;
  /** 等級 / Level */
  level: number;
  /** 目前 HP / Current HP */
  hp: number;
  /** 最大 HP / Max HP */
  maxHp: number;
  /** 目前 SP / Current SP */
  sp: number;
  /** 最大 SP / Max SP */
  maxSp: number;
  /** 隊伍側 / Team side */
  side: EnumTeamSideUI;
  /** 站位：前衛 / 後衛 / Position: front / back */
  position: EnumPosition;
  /** 場上精靈圖：char＝向右、char_rev＝預先鏡像向左 / Field sprite image: char = faces right, char_rev = pre-mirrored facing left */
  imageUrl: string;
}

// ---- 預設戰鬥：左隊（ゴブリン）/ Default battle: left team (goblins) ----

const goblinWarriorA: IShowcaseUnit = { unitUuid: 'goblin-a', name: 'GoblinWarrior(A)', level: 4, hp: 263, maxHp: 263, sp: 263, maxSp: 174, side: EnumTeamSideUI.Left, position: EnumPosition.Front, imageUrl: '/image/char/mon_052.png' };
const goblinWarriorB: IShowcaseUnit = { unitUuid: 'goblin-b', name: 'GoblinWarrior(B)', level: 4, hp: 263, maxHp: 263, sp: 263, maxSp: 174, side: EnumTeamSideUI.Left, position: EnumPosition.Front, imageUrl: '/image/char/mon_052.png' };
const goblinWarriorC: IShowcaseUnit = { unitUuid: 'goblin-c', name: 'GoblinWarrior(C)', level: 1, hp: 213, maxHp: 213, sp: 213, maxSp: 154, side: EnumTeamSideUI.Left, position: EnumPosition.Front, imageUrl: '/image/char/mon_052.png' };
const goblinAxe: IShowcaseUnit = { unitUuid: 'goblin-axe', name: 'GoblinAxe', level: 1, hp: 213, maxHp: 213, sp: 213, maxSp: 154, side: EnumTeamSideUI.Left, position: EnumPosition.Back, imageUrl: '/image/char/mon_053.png' };

// ---- 預設戰鬥：右隊（TestTeam）/ Default battle: right team (TestTeam) ----

const hero1: IShowcaseUnit = { unitUuid: 'hero1', name: 'Hero1', level: 3, hp: 349, maxHp: 349, sp: 349, maxSp: 53, side: EnumTeamSideUI.Right, position: EnumPosition.Front, imageUrl: '/image/char_rev/mon_018.png' };
const mage1: IShowcaseUnit = { unitUuid: 'mage1', name: 'Mage1', level: 3, hp: 159, maxHp: 159, sp: 159, maxSp: 112, side: EnumTeamSideUI.Right, position: EnumPosition.Back, imageUrl: '/image/char_rev/mon_214.png' };
const healer1: IShowcaseUnit = { unitUuid: 'healer1', name: 'Healer1', level: 3, hp: 213, maxHp: 213, sp: 213, maxSp: 89, side: EnumTeamSideUI.Right, position: EnumPosition.Back, imageUrl: '/image/char_rev/mon_214.png' };
const priest1: IShowcaseUnit = { unitUuid: 'priest1', name: 'Priest1', level: 3, hp: 213, maxHp: 213, sp: 213, maxSp: 89, side: EnumTeamSideUI.Right, position: EnumPosition.Front, imageUrl: '/image/char_rev/mon_079.png' };

/**
 * 預設戰鬥全體（狀態列順序；同一順序亦決定精靈的分組與前後疊放）
 * All default-battle units (status-column order; the same order also fixes sprite grouping and stacking)
 */
const defaultUnits: IShowcaseUnit[] = [
  goblinWarriorA,
  goblinWarriorB,
  goblinWarriorC,
  goblinAxe,
  hero1,
  mage1,
  healer1,
  priest1,
];

// ---- 召喚演示：GraveYard（skill 2464，3 體召喚）/ Summon demo: GraveYard (skill 2464, summon 3) ----

const summonGoblinAxe: IShowcaseUnit = { unitUuid: 'u-goblin-axe', name: 'GoblinAxe', level: 1, hp: 213, maxHp: 213, sp: 154, maxSp: 154, side: EnumTeamSideUI.Left, position: EnumPosition.Front, imageUrl: '/image/char/mon_053.png' };
const summonHero1: IShowcaseUnit = { unitUuid: 'u-hero1', name: 'Hero1', level: 3, hp: 349, maxHp: 349, sp: 53, maxSp: 53, side: EnumTeamSideUI.Right, position: EnumPosition.Back, imageUrl: '/image/char_rev/mon_018.png' };
const summonMage1: IShowcaseUnit = { unitUuid: 'u-mage1', name: 'Mage1', level: 3, hp: 159, maxHp: 159, sp: 112, maxSp: 112, side: EnumTeamSideUI.Right, position: EnumPosition.Back, imageUrl: '/image/char_rev/mon_214.png' };
const mummy1: IShowcaseUnit = { unitUuid: 'u-mummy-1', name: 'Mummy', level: 10, hp: 472, maxHp: 472, sp: 179, maxSp: 179, side: EnumTeamSideUI.Right, position: EnumPosition.Front, imageUrl: '/image/char_rev/mon_146.png' };
const mummyPrisoner: IShowcaseUnit = { unitUuid: 'u-mummy-prisoner', name: 'MummyPrisoner', level: 10, hp: 682, maxHp: 682, sp: 179, maxSp: 179, side: EnumTeamSideUI.Right, position: EnumPosition.Front, imageUrl: '/image/char_rev/mon_146r.png' };
const mummy2: IShowcaseUnit = { unitUuid: 'u-mummy-2', name: 'Mummy', level: 10, hp: 472, maxHp: 472, sp: 179, maxSp: 179, side: EnumTeamSideUI.Right, position: EnumPosition.Front, imageUrl: '/image/char_rev/mon_146.png' };

/** 開場單位（首段快照；召喚者不在其中）/ Opening units (first snapshot; the summoned are not in it) */
const summonOpeningUnits: IShowcaseUnit[] = [summonGoblinAxe, summonHero1, summonMage1];

/** 被召喚單位（GraveYard 召喚的木乃伊）/ Summoned units (mummies summoned by GraveYard) */
const summonedUnits: IShowcaseUnit[] = [mummy1, mummyPrisoner, mummy2];

/** 召喚演示全體 / All summon-demo units */
const summonUnits: IShowcaseUnit[] = [...summonOpeningUnits, ...summonedUnits];

// ==================== 派生 / Derivations ====================

/** 某一側的單位 / Units of one side */
function unitsOfSide(units: IShowcaseUnit[], side: EnumTeamSideUI): IShowcaseUnit[] {
  return units.filter((unit) => unit.side === side);
}

/** 依名稱覆寫 HP（狀態變體用）/ Override HP by name (for state variants) */
function withHp(units: IShowcaseUnit[], patch: Record<string, number>): IShowcaseUnit[] {
  return units.map((unit) => (patch[unit.name] === undefined ? unit : { ...unit, hp: patch[unit.name] }));
}

/**
 * 狀態列單位：只取狀態列需要的欄位
 * Status-row unit: only the fields the status row needs
 *
 * 精靈座標、快照與 uid 不進狀態列，避免同一單位在多處各寫一份。
 * Sprite coordinates, snapshots and the uid stay out of the status row so a unit is not
 * restated in several shapes.
 */
function statusUnit(unit: IShowcaseUnit): IBattleUnit {
  const { name, level, hp, maxHp, sp, maxSp, side } = unit;
  return { name, level, hp, maxHp, sp, maxSp, side };
}

function statusUnits(units: IShowcaseUnit[]): IBattleUnit[] {
  return units.map(statusUnit);
}

/**
 * 定位名冊角色：補上真實圖像尺寸
 * Roster char: inject the real image size
 *
 * 座標與翻轉全由 computeBattleSpritePositions 推導，此處不寫 x / y / flipped。
 * Coordinates and flipping are computed by computeBattleSpritePositions; no x / y / flipped here.
 */
function rosterChar(unit: IShowcaseUnit): IBattlePositionChar {
  const { unitUuid, name, imageUrl, position, side } = unit;
  return { unitUuid, name, imageUrl, position, side, imageSize: getSpriteImageSize(imageUrl) };
}

/** 場戰精靈（位置自動計算）/ Battlefield sprites (positions auto-computed) */
function battleSprites(units: IShowcaseUnit[]): IBattleSprite[] {
  return computeBattleSpritePositions(groupBattleChars(units.map(rosterChar)), FIELD_SIZE);
}

/** 快照單位（預設為開場狀態，可覆寫個別欄位）/ Snapshot unit (opening state by default; fields overridable) */
function snapshotUnit(unit: IShowcaseUnit, overrides: Partial<IBattleSnapshotDisplayUnit> = {}): IBattleSnapshotDisplayUnit {
  const { unitUuid, name, level, hp, maxHp, sp, maxSp, side, imageUrl } = unit;
  return { unitUuid, name, level, hp, maxHp, sp, maxSp, side, imageUrl, dead: false, ...overrides };
}

function snapshotUnits(units: IShowcaseUnit[]): IBattleSnapshotDisplayUnit[] {
  return units.map((unit) => snapshotUnit(unit));
}

/**
 * 召喚日誌頭像圖（原始日誌引用 char 目錄，場上精靈則用 char_rev）
 * Summon-log avatar (the original log references the char directory; the field sprite uses char_rev)
 */
function logAvatarUrl(imageUrl: string): string {
  return imageUrl.replace('/image/char_rev/', '/image/char/');
}

// ==================== 行動建構器（message 由欄位導出）/ Action builders (message derived) ====================

function enterAction(unit: IShowcaseUnit): IBattleAction {
  return {
    type: EnumActionType.Enter,
    source: unit.name,
    message: `${unit.name} Lv.${unit.level} enter the Battlefield.`,
    side: unit.side,
    attribute: EnumAttributeType.Normal,
  };
}

function skillAction(source: IShowcaseUnit, skill: ISkillIcon, side: EnumTeamSideUI): IBattleAction {
  return {
    type: EnumActionType.Skill,
    source: source.name,
    skill,
    message: `${source.name} ${skill.name}`,
    side,
    attribute: EnumAttributeType.Dmg,
  };
}

function attackAction(source: IShowcaseUnit, side: EnumTeamSideUI): IBattleAction {
  return {
    type: EnumActionType.Attack,
    source: source.name,
    skill: SKILL_ATTACK,
    message: `${source.name} ${SKILL_ATTACK.name}`,
    side,
    attribute: EnumAttributeType.Dmg,
  };
}

function damageAction(
  source: IShowcaseUnit,
  target: IShowcaseUnit,
  value: number,
  valueChange: string,
  side: EnumTeamSideUI
): IBattleAction {
  return {
    type: EnumActionType.Damage,
    source: source.name,
    target: target.name,
    value,
    valueChange,
    message: `${value} Damage to ${target.name}`,
    side,
    attribute: EnumAttributeType.Dmg,
  };
}

function protectAction(source: IShowcaseUnit, target: IShowcaseUnit, side: EnumTeamSideUI): IBattleAction {
  return {
    type: EnumActionType.Protect,
    source: source.name,
    target: target.name,
    message: `${source.name} protected ${target.name}!`,
    side,
    attribute: EnumAttributeType.Support,
  };
}

function castingAction(source: IShowcaseUnit, side: EnumTeamSideUI): IBattleAction {
  return {
    type: EnumActionType.Casting,
    source: source.name,
    message: `${source.name} start casting.`,
    side,
    attribute: EnumAttributeType.Charge,
  };
}

function downAction(source: IShowcaseUnit, side: EnumTeamSideUI): IBattleAction {
  return {
    type: EnumActionType.Down,
    source: source.name,
    message: `${source.name} down.`,
    side,
    attribute: EnumAttributeType.Dmg,
  };
}

/**
 * 魔方陣紀錄（文案與配色皆由 battleUtils 的單一事實來源導出）
 * Magic-circle record (both copy and colour derive from the single source in battleUtils)
 *
 * 種類決定「draw／erased enemy／use／failed」文案與顏色，數量決定「 xN」尾碼。
 * The kind decides the draw / erased enemy / use / failed copy and colour, and the amount
 * decides the trailing " xN".
 */
function magicCircleAction(
  source: IShowcaseUnit,
  skill: ISkillIcon,
  kind: EnumMagicCircleKind,
  amount: number | undefined,
  side: EnumTeamSideUI
): IBattleAction {
  const magicCircle: IMagicCircleRecord = { kind, amount };
  return {
    type: EnumActionType.MagicCircle,
    source: source.name,
    skill,
    magicCircle,
    message: buildMagicCircleMessage(source.name, magicCircle),
    side,
    attribute: EnumAttributeType.Normal,
  };
}

// ==================== 行動日誌 / Action logs ====================

/**
 * 預設戰鬥日誌（分段切片供各故事取用）
 * Default battle log (sliced by the individual stories)
 *
 * 入場順序是日誌敘事順序，與狀態列順序不同，故逐一列出。
 * Enter order is the log's narrative order, which differs from the status-column order,
 * so the units are listed explicitly.
 */
const battleActions: IBattleAction[] = [
  enterAction(goblinWarriorA),
  enterAction(goblinWarriorB),
  enterAction(goblinWarriorC),
  enterAction(goblinAxe),
  enterAction(priest1),
  enterAction(healer1),
  enterAction(hero1),
  enterAction(mage1),

  // ---- GoblinWarrior(B) FatalStab -> Hero1（保護 Priest1）/ protects Priest1 ----
  skillAction(goblinWarriorB, SKILL_FATAL_STAB, EnumTeamSideUI.Left),
  protectAction(hero1, priest1, EnumTeamSideUI.Left),
  damageAction(goblinWarriorB, hero1, 182, '349 > 167', EnumTeamSideUI.Left),

  // ---- GoblinWarrior(A) FatalStab -> Hero1（保護 Healer1）/ protects Healer1 ----
  skillAction(goblinWarriorA, SKILL_FATAL_STAB, EnumTeamSideUI.Left),
  protectAction(hero1, healer1, EnumTeamSideUI.Left),
  damageAction(goblinWarriorA, hero1, 166, '167 > 1', EnumTeamSideUI.Left),

  // ---- GoblinAxe Attack -> Healer1 ----
  attackAction(goblinAxe, EnumTeamSideUI.Left),
  damageAction(goblinAxe, healer1, 44, '213 > 169', EnumTeamSideUI.Left),

  // ---- Mage1 詠唱後被擊倒 / Mage1 casts, then falls ----
  castingAction(mage1, EnumTeamSideUI.Right),
  attackAction(goblinWarriorB, EnumTeamSideUI.Left),
  damageAction(goblinWarriorB, mage1, 48, '49 > 1', EnumTeamSideUI.Left),
  attackAction(goblinWarriorA, EnumTeamSideUI.Left),
  damageAction(goblinWarriorA, mage1, 40, '1 > -39', EnumTeamSideUI.Left),
  downAction(mage1, EnumTeamSideUI.Left),
];

/**
 * 召喚日誌（索引 5＝召喚；第二段自索引 6 起）
 * Summon log (index 5 = the summon; segment 2 starts at index 6)
 */
const summonActions: IBattleAction[] = [
  enterAction(summonGoblinAxe),
  enterAction(summonHero1),
  enterAction(summonMage1),
  attackAction(summonGoblinAxe, EnumTeamSideUI.Left),
  damageAction(summonGoblinAxe, summonHero1, 148, '349 > 201', EnumTeamSideUI.Left),
  {
    type: EnumActionType.Summon,
    source: summonMage1.name,
    skill: SKILL_GRAVEYARD,
    summoned: summonedUnits.map((unit) => ({
      name: unit.name,
      level: unit.level,
      imageUrl: logAvatarUrl(unit.imageUrl),
    })),
    message: `${summonMage1.name} ${SKILL_GRAVEYARD.name}: ${summonedUnits[0].name} joined to the team.`,
    side: EnumTeamSideUI.Right,
    attribute: EnumAttributeType.Normal,
  },
  attackAction(summonedUnits[0], EnumTeamSideUI.Right),
  damageAction(summonedUnits[0], summonGoblinAxe, 89, '213 > 124', EnumTeamSideUI.Right),
];

// ==================== 魔方陣紀錄日誌 / Magic-circle record log ====================

/**
 * 魔方陣紀錄日誌：四種種類各示範一次
 * Magic-circle record log: one demonstration of each of the four kinds
 *
 * 每組皆為「技能行 → 魔方陣紀錄行」，與原始日誌的列印順序一致
 * （Skill.php 先印技能行，再印成本行；Effect.php 的 draw／erased enemy 為獨立行）。
 * Each pair is skill line → magic-circle record line, matching the original log's print
 * order (Skill.php prints the skill line before the cost line; Effect.php's draw /
 * erased enemy are their own lines).
 */
const magicCircleActions: IBattleAction[] = [
  // ---- 描繪己方魔方陣（skill 3410，魔法陣+1）/ draw one own magic circle ----
  skillAction(mage1, SKILL_MAGIC_CIRCLE, EnumTeamSideUI.Right),
  magicCircleAction(mage1, SKILL_MAGIC_CIRCLE, EnumMagicCircleKind.Draw, 1, EnumTeamSideUI.Right),

  // ---- 描繪己方魔方陣（skill 3411，魔法陣+2）/ draw two own magic circles ----
  skillAction(mage1, SKILL_DOUBLE_MAGIC_CIRCLE, EnumTeamSideUI.Right),
  magicCircleAction(mage1, SKILL_DOUBLE_MAGIC_CIRCLE, EnumMagicCircleKind.Draw, 2, EnumTeamSideUI.Right),

  // ---- 消除敵方魔方陣（skill 3420，相手魔法陣-1）/ erase one enemy magic circle ----
  skillAction(hero1, SKILL_CIRCLE_ERASE, EnumTeamSideUI.Right),
  magicCircleAction(hero1, SKILL_CIRCLE_ERASE, EnumMagicCircleKind.EraseEnemy, 1, EnumTeamSideUI.Right),

  // ---- 消耗己方魔方陣作為代價（skill 2501，消費 4）/ spend four circles as skill cost ----
  skillAction(hero1, SKILL_SUMMON_LEVIATHAN, EnumTeamSideUI.Right),
  magicCircleAction(hero1, SKILL_SUMMON_LEVIATHAN, EnumMagicCircleKind.Use, 4, EnumTeamSideUI.Right),

  // ---- 魔方陣不足而失敗（無名稱、無數量）/ failed for lack of circles (no name, no amount) ----
  skillAction(hero1, SKILL_SUMMON_LEVIATHAN, EnumTeamSideUI.Right),
  magicCircleAction(hero1, SKILL_SUMMON_LEVIATHAN, EnumMagicCircleKind.Fail, undefined, EnumTeamSideUI.Right),
];

// ==================== 召喚快照 / Summon snapshots ====================

/**
 * 召喚演示快照：at 0＝開場（無木乃伊）、at 6＝召喚發生之後（3 隻木乃伊入場）
 * Summon demo snapshots: at 0 = opening (no mummies), at 6 = after the summon (3 mummies on the field)
 */
const summonSnapshots: IBattleSnapshotDisplay[] = [
  { at: 0, units: snapshotUnits(summonOpeningUnits) },
  {
    at: 6,
    units: [
      snapshotUnit(summonGoblinAxe, { hp: 124 }),
      snapshotUnit(summonHero1, { hp: 201 }),
      snapshotUnit(summonMage1),
      ...snapshotUnits(summonedUnits),
    ],
  },
];

// ==================== 狀態變體 / State variants ====================

/** 中途戰鬥的左隊（前兩名受損）/ Left team mid-battle (first two units damaged) */
function midBattleLeftUnits(): IBattleUnit[] {
  return statusUnits(
    withHp(unitsOfSide(defaultUnits, EnumTeamSideUI.Left), { 'GoblinWarrior(A)': 180, 'GoblinWarrior(B)': 200 })
  );
}

/** 受創的左隊（結果畫面）/ Damaged left team (result screen) */
function battleOverLeftUnits(): IBattleUnit[] {
  return statusUnits(
    withHp(unitsOfSide(defaultUnits, EnumTeamSideUI.Left), { 'GoblinWarrior(A)': 140, 'GoblinWarrior(B)': 130 })
  );
}

/** 陣亡中的右隊（三人倒下、Hero1 僅剩 1 HP）/ Right team with casualties (three down, Hero1 at 1 HP) */
function casualtyRightUnits(): IBattleUnit[] {
  return statusUnits(unitsOfSide(defaultUnits, EnumTeamSideUI.Right)).map((unit) => {
    if (unit.name === 'Mage1' || unit.name === 'Priest1' || unit.name === 'Healer1') {
      return { ...unit, hp: 0, status: EnumUnitStatus.Down };
    }
    if (unit.name === 'Hero1') {
      return { ...unit, hp: 1, status: EnumUnitStatus.Alive };
    }
    return unit;
  });
}

/** 全滅的右隊（結果畫面）/ Wiped-out right team (result screen) */
function defeatedRightUnits(): IBattleUnit[] {
  return statusUnits(unitsOfSide(defaultUnits, EnumTeamSideUI.Right)).map((unit) => ({
    ...unit,
    hp: 0,
    status: EnumUnitStatus.Down,
  }));
}

// ==================== 資料組裝 / Data assembly ====================

/** 資料覆寫（只覆寫與預設不同的部分）/ Data overrides (only what differs from the default) */
interface IBattleDataOverrides {
  /** 左隊單位（預設取自 units 的左側）/ Left-team units (defaults to the left side of units) */
  leftUnits?: IBattleUnit[];
  /** 右隊單位（預設取自 units 的右側）/ Right-team units (defaults to the right side of units) */
  rightUnits?: IBattleUnit[];
  /** 戰場精靈（預設由 units 計算）/ Battlefield sprites (computed from units by default) */
  sprites?: IBattleSprite[];
  /** 行動日誌（預設為完整預設日誌）/ Action log (the full default log by default) */
  actions?: IBattleAction[];
  /** 快照（預設無）/ Snapshots (none by default) */
  snapshots?: IBattleSnapshotDisplay[];
  /** 戰鬥結果（傳 undefined 表示不顯示結果）/ Battle result (undefined = no result panel) */
  result?: IBattleResult;
}

/**
 * 組裝完整戰鬥資料（隊伍與精靈由單位定義派生）
 * Assemble complete battle display data (teams and sprites derive from the unit definitions)
 */
function createBattleData(units: IShowcaseUnit[], overrides: IBattleDataOverrides = {}): IBattleDisplayData {
  const { leftUnits, rightUnits, sprites, actions, snapshots } = overrides;
  return {
    title: BATTLE_TITLE,
    time: BATTLE_TIME,
    leftTeam: {
      name: LEFT_TEAM_NAME,
      units: leftUnits ?? statusUnits(unitsOfSide(units, EnumTeamSideUI.Left)),
      side: EnumTeamSideUI.Left,
    },
    rightTeam: {
      name: RIGHT_TEAM_NAME,
      units: rightUnits ?? statusUnits(unitsOfSide(units, EnumTeamSideUI.Right)),
      side: EnumTeamSideUI.Right,
    },
    battlefield: BATTLEFIELD,
    sprites: sprites ?? battleSprites(units),
    actions: actions ?? battleActions,
    snapshots,
    // 顯式傳入 undefined 時沿用覆寫值（解構預設值吃不到 undefined）
    // Honour an explicitly-passed undefined (destructuring defaults swallow it)
    result: 'result' in overrides ? overrides.result : BATTLE_RESULT,
  };
}

// ==================== 匯出 / Exports ====================

/** 預設戰鬥畫面（Default 與 WithSpriteLabels 共用）/ Default battle scene (shared by Default and WithSpriteLabels) */
export const defaultBattleData: IBattleDisplayData = createBattleData(defaultUnits);

/** 戰鬥中（左隊前兩名受損、日誌取前 6 筆）/ Mid-battle (first two left units damaged; first 6 log entries) */
export const midBattleData: IBattleDisplayData = createBattleData(defaultUnits, {
  leftUnits: midBattleLeftUnits(),
  actions: battleActions.slice(0, 6),
});

/** 單位陣亡（右隊三人倒下；日誌取第 9–18 筆）/ Casualties (three right units down; log entries 9–18) */
export const casualtyData: IBattleDisplayData = createBattleData(defaultUnits, {
  rightUnits: casualtyRightUnits(),
  actions: battleActions.slice(9, 18),
});

/** 召喚演示（GraveYard 三體召喚、兩段快照、無結果畫面）/ Summon demo (GraveYard summon 3, two snapshots, no result) */
export const summonData: IBattleDisplayData = createBattleData(summonUnits, {
  actions: summonActions,
  snapshots: summonSnapshots,
  result: undefined,
});

/** 戰鬥結果（日誌取第 15 筆起）/ Battle result (log entries from 15 on) */
export const battleOverData: IBattleDisplayData = createBattleData(defaultUnits, {
  leftUnits: battleOverLeftUnits(),
  rightUnits: defeatedRightUnits(),
  actions: battleActions.slice(15),
});

/** 魔方陣紀錄（四種種類各一次、無結果畫面）/ Magic-circle records (each kind once, no result panel) */
export const magicCircleData: IBattleDisplayData = createBattleData(defaultUnits, {
  actions: magicCircleActions,
  result: undefined,
});
