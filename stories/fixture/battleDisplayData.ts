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
  EnumChargeKind,
  EnumMagicCircleKind,
  EnumTeamSideUI,
  EnumUnitStatus,
} from '#/components/battle/enums';
import {
  buildAutoRegenMessage,
  buildChargeMessage,
  buildDelayMessage,
  buildDrainMessage,
  buildLevelUpMessage,
  buildMagicCircleMessage,
  buildNamedMessage,
  buildPossessiveMessage,
  buildRecoveredMessage,
  buildRegenMessage,
  buildSacrificeMessage,
  buildSpDamageMessage,
  buildStatChangeMessage,
  buildStatToMessage,
} from '#/components/battle/battleUtils';
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
    level: unit.level,
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

// ==================== 完整日誌訊息覆蓋 / Full log-message coverage ====================

/**
 * 通用日誌行動（文案一律由 battleUtils 的建構器產生）
 * Generic log action (the copy always comes from the battleUtils builders)
 *
 * 型別決定版面與配色；只有要覆寫家族預設色時才傳 attribute，例如中毒解除在原始日誌
 * 沒有 span（Normal）、抗毒為 support。
 * The type decides the layout and the colour; `attribute` is passed only to override the
 * family default, e.g. a poison cure carries no span in the original log (Normal) while a
 * resist is support.
 */
function logAction(
  type: EnumActionType,
  source: IShowcaseUnit | undefined,
  message: string,
  side: EnumTeamSideUI,
  extra: Partial<IBattleAction> = {}
): IBattleAction {
  return { type, source: source?.name, message, side, ...extra };
}

/**
 * 完整日誌訊息覆蓋：原始日誌每一個訊息族系各示範一次
 * Full log-message coverage: one demonstration of every message family in the original log
 *
 * 對照 HOF/Class/Battle/Skill.php、HOF/Class/Skill/Effect.php 與 HOF/Class/Char/Battle/Effect.php
 * 的列印字串；配色由 battleUtils.getMessageClass 對應原始 basis.css 的 span class。
 * Mirrors the printed strings of HOF/Class/Battle/Skill.php, HOF/Class/Skill/Effect.php and
 * HOF/Class/Char/Battle/Effect.php; battleUtils.getMessageClass maps each family to the span
 * class of the original basis.css.
 */
const logMessagesActions: IBattleAction[] = [
  // ---- 蓄力開始（`start charging.`；文案由 castType 決定，不再硬編碼成 casting）----
  // Charge start (`start charging.`; the copy follows castType and is no longer hardcoded to casting)
  logAction(EnumActionType.Casting, mage1, buildChargeMessage(EnumChargeKind.Charging), EnumTeamSideUI.Right, {
    castType: EnumChargeKind.Charging,
    attribute: EnumAttributeType.Charge,
  }),

  // ---- SP 傷害（`NSP Damage to target`，數值與 SP 之間無空格）----
  // SP damage (`NSP Damage to target`, no space between the value and "SP Damage")
  logAction(
    EnumActionType.SpDamage,
    undefined,
    buildSpDamageMessage(96, goblinWarriorA.name),
    EnumTeamSideUI.Right,
    { value: 96, valueUnit: 'SP', target: goblinWarriorA.name, attribute: EnumAttributeType.Spdmg }
  ),

  // ---- 回復 HP／SP（`name Recovered N HP`；HP→recover、SP→support）----
  // Recover HP / SP (`name Recovered N HP`; HP → recover, SP → support)
  logAction(EnumActionType.Recover, healer1, buildRecoveredMessage(healer1.name, 84, 'HP'), EnumTeamSideUI.Left, {
    value: 84,
    valueUnit: 'HP',
    valueChange: '129 > 213',
    attribute: EnumAttributeType.Recover,
  }),
  logAction(EnumActionType.Recover, priest1, buildRecoveredMessage(priest1.name, 30, 'SP'), EnumTeamSideUI.Left, {
    value: 30,
    valueUnit: 'SP',
    valueChange: '60 > 90',
    attribute: EnumAttributeType.Support,
  }),

  // ---- 吸取（`Drained N HP from target`，行首無施放者）----
  // Drain (`Drained N HP from target`, no caster name at the head)
  logAction(
    EnumActionType.Drain,
    undefined,
    buildDrainMessage(40, 'HP', hero1.name),
    EnumTeamSideUI.Left,
    {
      value: 40,
      valueUnit: 'HP',
      target: hero1.name,
      attribute: EnumAttributeType.Recover,
      valueChanges: [{ from: 1000, to: 960 }, { who: '我方', from: 200, to: 240 }],
    }
  ),
  logAction(
    EnumActionType.Drain,
    undefined,
    buildDrainMessage(25, 'SP', hero1.name),
    EnumTeamSideUI.Left,
    {
      value: 25,
      valueUnit: 'SP',
      target: hero1.name,
      attribute: EnumAttributeType.Support,
      valueChanges: [{ from: 100, to: 75 }, { who: '我方', from: 50, to: 75 }],
    }
  ),

  // ---- 持續回復（`gained SP regeneration +15%`）----
  // Regen (`gained SP regeneration +15%`)
  logAction(
    EnumActionType.Regen,
    mage1,
    buildRegenMessage(mage1.name, 'SP', 15),
    EnumTeamSideUI.Right,
    { valueUnit: 'SP', attribute: EnumAttributeType.Support }
  ),

  // ---- 自動回復（行首 `* `、數值加粗）/ Auto regenerate (leading `* `, bold value) ----
  logAction(
    EnumActionType.Regen,
    hero1,
    buildAutoRegenMessage(hero1.name, 'HP', 32),
    EnumTeamSideUI.Left,
    { value: 32, valueUnit: 'HP', prefix: '* ', attribute: EnumAttributeType.Recover }
  ),

  // ---- 復活（`name <recover>revived</recover>!`；名稱預設色、只有 revived 上色）----
  // Revive (`name <recover>revived</recover>!`; the name keeps the default colour, only revived is coloured)
  logAction(EnumActionType.Revive, hero1, 'revived!', EnumTeamSideUI.Right, {
    emphasis: 'revived',
    attribute: EnumAttributeType.Recover,
  }),

  // ---- 增益（quicked／casting shorted／barriered，support 色）----
  // Buff (quicked / casting shorted / barriered, support colour)
  logAction(EnumActionType.Buff, mage1, buildNamedMessage(mage1.name, 'got barriered!'), EnumTeamSideUI.Right),
  logAction(EnumActionType.Buff, hero1, buildNamedMessage(hero1.name, 'got quicked!'), EnumTeamSideUI.Right),
  logAction(EnumActionType.Buff, mage1, buildNamedMessage(mage1.name, 'casting shorted!'), EnumTeamSideUI.Right),

  // ---- 減益（能力下降，原始日誌無 span）/ Debuff (stat down, no span in the original log) ----
  logAction(
    EnumActionType.Debuff,
    goblinAxe,
    buildNamedMessage(goblinAxe.name, 'STR down 10%'),
    EnumTeamSideUI.Left
  ),

  // ---- 中毒：施加（spdmg）／每回合傷害（spdmg）／解除（無 span）／抗毒（support）----
  // Poison: apply (spdmg) / per-turn damage (spdmg) / cure (no span) / resist (support)
  // ---- 中毒施加（`get <spdmg>poisoned</spdmg>!`；名稱預設色、只有 poisoned 上色）----
  // Poison apply (`get <spdmg>poisoned</spdmg>!`; the name keeps the default colour, only poisoned is coloured)
  logAction(
    EnumActionType.Poison,
    goblinAxe,
    'get poisoned\u00a0!',
    EnumTeamSideUI.Left,
    { emphasis: 'poisoned', attribute: EnumAttributeType.Spdmg }
  ),
  logAction(
    EnumActionType.Poison,
    goblinAxe,
    buildNamedMessage(goblinAxe.name, 'got 12 damage by poison.'),
    EnumTeamSideUI.Left,
    { value: 12, valueChange: '1200 > 1050' }
  ),
  logAction(
    EnumActionType.Poison,
    goblinAxe,
    buildNamedMessage(goblinAxe.name, 'blocked poison.'),
    EnumTeamSideUI.Left,
    { attribute: EnumAttributeType.Normal }
  ),
  logAction(
    EnumActionType.Poison,
    goblinAxe,
    buildPossessiveMessage(goblinAxe.name, 'poison has cured.'),
    EnumTeamSideUI.Left,
    { attribute: EnumAttributeType.Normal }
  ),
  logAction(
    EnumActionType.Poison,
    goblinWarriorA,
    buildNamedMessage(goblinWarriorA.name, 'got PoisonResist!(50%)'),
    EnumTeamSideUI.Left,
    { attribute: EnumAttributeType.Support }
  ),
  // ---- 自我中毒（無名稱、無 span；對照 5.4 `Got poisoned`）----
  // Self-poison (no name, no span; mirrors 5.4 `Got poisoned`)
  logAction(EnumActionType.Poison, undefined, 'Got poisoned', EnumTeamSideUI.Left, {
    attribute: EnumAttributeType.Normal,
  }),

  // ---- 屬性升降（`STR rise 10%`、上限升降，原始日誌無 span）----
  // Stat change (`STR rise 10%`, cap changes; no span in the original log)
  logAction(
    EnumActionType.StatChange,
    hero1,
    buildStatChangeMessage(hero1.name, 'STR', 'rise', 10),
    EnumTeamSideUI.Right
  ),
  logAction(
    EnumActionType.StatChange,
    hero1,
    buildStatChangeMessage(hero1.name, 'ATK', 'rise', 100, '%', true),
    EnumTeamSideUI.Right
  ),
  logAction(
    EnumActionType.StatChange,
    mage1,
    buildStatToMessage(mage1.name, 'MAXSP', 'extended', 400),
    EnumTeamSideUI.Right
  ),
  logAction(
    EnumActionType.StatChange,
    goblinAxe,
    buildStatToMessage(goblinAxe.name, 'MAXHP', 'down to', 150),
    EnumTeamSideUI.Left
  ),

  // ---- 位移（`moved to front.`、`moved to back.`、`knock backed!`、`goes forward.`）/ Movement ----
  logAction(
    EnumActionType.Move,
    hero1,
    buildNamedMessage(hero1.name, 'moved to front.'),
    EnumTeamSideUI.Right
  ),
  logAction(
    EnumActionType.Move,
    goblinAxe,
    buildNamedMessage(goblinAxe.name, 'moved to back.'),
    EnumTeamSideUI.Left
  ),
  logAction(
    EnumActionType.Move,
    goblinAxe,
    buildNamedMessage(goblinAxe.name, 'knock backed!'),
    EnumTeamSideUI.Left
  ),
  logAction(
    EnumActionType.Move,
    goblinWarriorA,
    buildNamedMessage(goblinWarriorA.name, 'goes forward.'),
    EnumTeamSideUI.Left
  ),

  // ---- 延遲（`name Delayed(15 >>> 25/100)`，對照 DelayByRate 括號輸出）----
  // Delay (`name Delayed(15 >>> 25/100)`, mirroring DelayByRate's parenthesised output)
  logAction(EnumActionType.Delay, mage1, buildDelayMessage(mage1.name, 15, 25, 100), EnumTeamSideUI.Right),

  // ---- 犧牲（`name sacrifice 50 HP`）/ Sacrifice ----
  logAction(
    EnumActionType.Sacrifice,
    hero1,
    buildSacrificeMessage(hero1.name, 50),
    EnumTeamSideUI.Right,
    { value: 50, valueUnit: 'HP', attribute: EnumAttributeType.Dmg }
  ),

  // ---- 施放失敗：武器不符 / Failed to cast: weapon mismatch ----
  // 首行 `.u` 底線名稱＋技能圖示，失敗字樣 `.dmg`；次行無樣式原因。
  // First line: `.u` underlined name + skill icon, the ` Failed ` word in `.dmg`; second line: unstyled reason.
  logAction(
    EnumActionType.Fail,
    goblinAxe,
    '(Weapon type doesnt match)',
    EnumTeamSideUI.Left,
    { skill: SKILL_FATAL_STAB, attribute: EnumAttributeType.Dmg }
  ),
  logAction(
    EnumActionType.Info,
    mage1,
    buildNamedMessage(mage1.name, `failed to ${SKILL_SUMMON_LEVIATHAN.name}(SP shortage)`),
    EnumTeamSideUI.Right,
    { attribute: EnumAttributeType.Normal }
  ),

  // ---- 未命中（原始日誌 `Failed!`，無 span）/ Miss (the original `Failed!`, no span) ----
  logAction(
    EnumActionType.Miss,
    goblinWarriorA,
    buildNamedMessage(goblinWarriorA.name, 'Failed!'),
    EnumTeamSideUI.Left
  ),

  // ---- 升級（`name LevelUp!`）/ Level up ----
  logAction(EnumActionType.LevelUp, hero1, buildLevelUpMessage(hero1.name), EnumTeamSideUI.Right),

  // ---- 掉落道具（`name dropped` 後接道具圖示＋`<b class="u">道具名</b>.`）----
  // Dropped item (`name dropped` followed by the item icon + `<b class="u">item name</b>.`)
  logAction(EnumActionType.ItemDrop, goblinWarriorA, 'Magic Scroll', EnumTeamSideUI.Left, {
    itemIconUrl: '/image/icon/item/item_018.png',
  }),

  // ---- 退場（`name Lv.N leave the Battlefield.`，dmg 色）/ Leave the battlefield (dmg colour) ----
  logAction(
    EnumActionType.Leave,
    goblinAxe,
    '',
    EnumTeamSideUI.Left,
    { level: goblinAxe.level }
  ),

  // ---- 純文字資訊（無名稱、無 span；對照 4.8 / 6.7 / 3.3 / 7.4 / 7.5 / 3.2 等）----
  // Plain info text (no name, no span; mirrors 4.8 / 6.7 / 3.3 / 7.4 / 7.5 / 3.2, …)
  logAction(EnumActionType.Info, undefined, 'Damage x6!', EnumTeamSideUI.Left),
  logAction(EnumActionType.Info, undefined, 'No target.Failed!', EnumTeamSideUI.Left),
  logAction(EnumActionType.Info, undefined, 'Attack has disappeared.', EnumTeamSideUI.Left),
  logAction(EnumActionType.Info, undefined, '※値が大きすぎて補正されました。', EnumTeamSideUI.Left),
  logAction(EnumActionType.Info, undefined, 'battle turns extended.', EnumTeamSideUI.Left),
  logAction(EnumActionType.Info, undefined, 'Alives get 250exps.', EnumTeamSideUI.Left),
  logAction(EnumActionType.Info, undefined, 'TestTeam Get 1,500.', EnumTeamSideUI.Left),
  logAction(
    EnumActionType.Info,
    goblinWarriorA,
    buildNamedMessage(goblinWarriorA.name, "sunk in thought and couldn't act."),
    EnumTeamSideUI.Left
  ),
  logAction(EnumActionType.Info, undefined, '(No more patterns)', EnumTeamSideUI.Left),
  // ---- HP/SP 交換（3 行區塊：exchanged rate of HP and SP. ＋ HP 行 ＋ SP 行）----
  // HP/SP exchange (3-line block: exchanged rate of HP and SP. + HP line + SP line)
  logAction(EnumActionType.EnergyExchange, hero1, '', EnumTeamSideUI.Right, {
    energyExchange: {
      hpFrom: 500,
      hpFromRate: 50,
      hpTo: 800,
      hpToRate: 80,
      spFrom: 80,
      spFromRate: 80,
      spTo: 50,
      spToRate: 50,
    },
  }),
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

/** 完整日誌訊息覆蓋（原始日誌每個訊息族系各一次、無結果畫面）/ Full log-message coverage (one entry per original message family, no result panel) */
export const logMessagesData: IBattleDisplayData = createBattleData(defaultUnits, {
  actions: logMessagesActions,
  result: undefined,
});
