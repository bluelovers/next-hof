/**
 * BattleDisplay Storybook 故事
 * BattleDisplay Storybook stories
 *
 * 展示戰鬥畫面的各種狀態
 * Showcases battle scene in various states
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleDisplay } from '#/components/pages/BattleDisplay';
import type { IBattleDisplayData, IBattleAction, IBattleSnapshotDisplay, IBattleSprite } from '#/components/battle/types';
import { SPRITE_LAYOUT_WIDTH, SPRITE_LAYOUT_HEIGHT } from '#/components/battle/types';
import { computeBattleSpritePositions, groupBattleChars, type IBattlePositionChar } from '#/components/battle/computeSpritePositions';
import { getSpriteImageSize } from '#/components/battle/spriteImageSizes';
import { EnumPosition } from '#/lib/game/constants';
import { EnumTeamSideUI } from '#/components/battle/enums';
import { EnumAttributeType } from '#/components/battle/enums';
import { EnumUnitStatus } from '#/components/battle/enums';
import { EnumActionType } from '#/components/battle/enums';

const meta: Meta<typeof BattleDisplay> = {
  title: 'Pages/BattlePage/BattleDisplay',
  component: BattleDisplay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '完整戰鬥畫面展示組件，包含隊伍資訊、戰場畫面、HP/SP 狀態、行動日誌與戰鬥結果。\nComplete battle display component with team info, battlefield scene, HP/SP status, action log, and battle result.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BattleDisplay>;

// ==================== 基礎 Mock 資料 ====================

/** 左側隊伍（ゴブリンと遊ぶ）/ Left team (Goblins) */
const leftTeamUnits = [
  { name: 'GoblinWarrior(A)', level: 4, hp: 263, maxHp: 263, sp: 263, maxSp: 174, side: EnumTeamSideUI.Left as const },
  { name: 'GoblinWarrior(B)', level: 4, hp: 263, maxHp: 263, sp: 263, maxSp: 174, side: EnumTeamSideUI.Left as const },
  { name: 'GoblinWarrior(C)', level: 1, hp: 213, maxHp: 213, sp: 213, maxSp: 154, side: EnumTeamSideUI.Left as const },
  { name: 'GoblinAxe', level: 1, hp: 213, maxHp: 213, sp: 213, maxSp: 154, side: EnumTeamSideUI.Left as const },
];

/** 右側隊伍（TestTeam）/ Right team (TestTeam) */
const rightTeamUnits = [
  { name: 'Hero1', level: 3, hp: 349, maxHp: 349, sp: 349, maxSp: 53, side: EnumTeamSideUI.Right as const },
  { name: 'Mage1', level: 3, hp: 159, maxHp: 159, sp: 159, maxSp: 112, side: EnumTeamSideUI.Right as const },
  { name: 'Healer1', level: 3, hp: 213, maxHp: 213, sp: 213, maxSp: 89, side: EnumTeamSideUI.Right as const },
  { name: 'Priest1', level: 3, hp: 213, maxHp: 213, sp: 213, maxSp: 89, side: EnumTeamSideUI.Right as const },
];

/** 戰場精靈排列 / Battlefield sprite arrangement */
const battleSprites = [
  // 左側隊伍（敵人）- 從左到右排列，Y 軸遞增
  { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 164, y: 16, flipped: false, name: 'GoblinWarrior(A)' },
  { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 148, y: 56, flipped: false, name: 'GoblinWarrior(B)' },
  { id: 'mon_053', imageUrl: '/image/char/mon_053.png', x: 124, y: 96, flipped: false, name: 'GoblinAxe' },
  { id: 'mon_052', imageUrl: '/image/char/mon_052.png', x: 116, y: 136, flipped: false, name: 'GoblinWarrior(C)' },
  // 右側隊伍（友方）：char_rev 已預先鏡像（面向左），故 flipped:false 直接置於右側；
  // 不可再加 flipped:true —— 那會把整層 480×200 鏡像，導致右隊被翻到左半場
  // Right team (allies): char_rev is pre-mirrored (faces left), so flipped:false places it
  // directly on the right; never add flipped:true — it mirrors the whole 480×200 layer and
  // throws the right team over to the left half of the field.
  { id: 'mon_018', imageUrl: '/image/char_rev/mon_018.png', x: 352, y: 14, flipped: false, name: 'Hero1' },
  { id: 'mon_214', imageUrl: '/image/char_rev/mon_214.png', x: 388, y: 64, flipped: false, name: 'Mage1' },
  { id: 'mon_214', imageUrl: '/image/char_rev/mon_214.png', x: 408, y: 114, flipped: false, name: 'Healer1' },
  { id: 'mon_079', imageUrl: '/image/char_rev/mon_079.png', x: 288, y: 68, flipped: false, name: 'Priest1' },
];

/** 戰鬥行動日誌 / Battle action log */
const battleActions: IBattleAction[] = [
  // ---- 回合開始 ----
  {
    type: EnumActionType.Enter,
    source: 'GoblinWarrior(A)',
    message: 'GoblinWarrior(A) Lv.4 enter the Battlefield.',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Normal,
  },
  {
    type: EnumActionType.Enter,
    source: 'GoblinWarrior(B)',
    message: 'GoblinWarrior(B) Lv.4 enter the Battlefield.',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Normal,
  },
  {
    type: EnumActionType.Enter,
    source: 'GoblinWarrior(C)',
    message: 'GoblinWarrior(C) Lv.1 enter the Battlefield.',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Normal,
  },
  {
    type: EnumActionType.Enter,
    source: 'GoblinAxe',
    message: 'GoblinAxe Lv.1 enter the Battlefield.',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Normal,
  },
  {
    type: EnumActionType.Enter,
    source: 'Priest1',
    message: 'Priest1 Lv.3 enter the Battlefield.',
    side: EnumTeamSideUI.Right,
    attribute: EnumAttributeType.Normal,
  },
  {
    type: EnumActionType.Enter,
    source: 'Healer1',
    message: 'Healer1 Lv.3 enter the Battlefield.',
    side: EnumTeamSideUI.Right,
    attribute: EnumAttributeType.Normal,
  },
  {
    type: EnumActionType.Enter,
    source: 'Hero1',
    message: 'Hero1 Lv.3 enter the Battlefield.',
    side: EnumTeamSideUI.Right,
    attribute: EnumAttributeType.Normal,
  },
  {
    type: EnumActionType.Enter,
    source: 'Mage1',
    message: 'Mage1 Lv.3 enter the Battlefield.',
    side: EnumTeamSideUI.Right,
    attribute: EnumAttributeType.Normal,
  },

  // ---- 行動：GoblinWarrior(B) FatalStab -> Hero1(保護Priest1) ----
  {
    type: EnumActionType.Skill,
    source: 'GoblinWarrior(B)',
    skill: { name: 'FatalStab', iconUrl: '/image/icon/skill/skill_074z.png' },
    message: 'GoblinWarrior(B) FatalStab',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Dmg,
  },
  {
    type: EnumActionType.Protect,
    source: 'Hero1',
    target: 'Priest1',
    message: 'Hero1 protected Priest1!',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Support,
  },
  {
    type: EnumActionType.Damage,
    source: 'GoblinWarrior(B)',
    target: 'Hero1',
    value: 182,
    valueChange: '349 > 167',
    message: '182 Damage to Hero1',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Dmg,
  },

  // ---- 行動：GoblinWarrior(A) FatalStab -> Hero1(保護Healer1) ----
  {
    type: EnumActionType.Skill,
    source: 'GoblinWarrior(A)',
    skill: { name: 'FatalStab', iconUrl: '/image/icon/skill/skill_074z.png' },
    message: 'GoblinWarrior(A) FatalStab',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Dmg,
  },
  {
    type: EnumActionType.Protect,
    source: 'Hero1',
    target: 'Healer1',
    message: 'Hero1 protected Healer1!',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Support,
  },
  {
    type: EnumActionType.Damage,
    source: 'GoblinWarrior(A)',
    target: 'Hero1',
    value: 166,
    valueChange: '167 > 1',
    message: '166 Damage to Hero1',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Dmg,
  },

  // ---- 行動：GoblinAxe Attack -> Healer1 ----
  {
    type: EnumActionType.Attack,
    source: 'GoblinAxe',
    skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' },
    message: 'GoblinAxe Attack',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Dmg,
  },
  {
    type: EnumActionType.Damage,
    source: 'GoblinAxe',
    target: 'Healer1',
    value: 44,
    valueChange: '213 > 169',
    message: '44 Damage to Healer1',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Dmg,
  },

  // ---- 行動：Mage1 casting ----
  {
    type: EnumActionType.Casting,
    source: 'Mage1',
    message: 'Mage1 start casting.',
    side: EnumTeamSideUI.Right,
    attribute: EnumAttributeType.Charge,
  },

  // ---- 行動：GoblinWarrior(B) Attack -> Mage1 ----
  {
    type: EnumActionType.Attack,
    source: 'GoblinWarrior(B)',
    skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' },
    message: 'GoblinWarrior(B) Attack',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Dmg,
  },
  {
    type: EnumActionType.Damage,
    source: 'GoblinWarrior(B)',
    target: 'Mage1',
    value: 48,
    valueChange: '49 > 1',
    message: '48 Damage to Mage1',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Dmg,
  },

  // ---- 行動：GoblinWarrior(A) Attack -> Mage1 (down) ----
  {
    type: EnumActionType.Attack,
    source: 'GoblinWarrior(A)',
    skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' },
    message: 'GoblinWarrior(A) Attack',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Dmg,
  },
  {
    type: EnumActionType.Damage,
    source: 'GoblinWarrior(A)',
    target: 'Mage1',
    value: 40,
    valueChange: '1 > -39',
    message: '40 Damage to Mage1',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Dmg,
  },
  {
    type: EnumActionType.Down,
    source: 'Mage1',
    message: 'Mage1 down.',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Dmg,
  },
];

/**
 * 建立完整戰鬥資料
 * Build complete battle display data
 */
function createBattleData(overrides?: Partial<IBattleDisplayData>): IBattleDisplayData {
  return {
    title: 'battle log*',
    time: '05/13(Wed) 04:39:24',
    leftTeam: {
      name: 'ゴブリンと遊ぶ(最弱)',
      units: leftTeamUnits,
      side: EnumTeamSideUI.Left,
    },
    rightTeam: {
      name: 'TestTeam',
      units: rightTeamUnits,
      side: EnumTeamSideUI.Right,
    },
    battlefield: {
      backgroundImageUrl: '/image/land/bg_grass.png',
      backgroundType: 'grass',
      width: SPRITE_LAYOUT_WIDTH,
      height: SPRITE_LAYOUT_HEIGHT,
    },
    sprites: battleSprites,
    actions: battleActions,
    result: {
      winner: 'ゴブリンと遊ぶ(最弱)',
      leftTeam: {
        hpRemain: 573,
        alive: 4,
        totalUnits: 4,
        totalDamage: 1384,
        totalExp: 4,
        funds: '4',
      },
      rightTeam: {
        hpRemain: 0,
        alive: 0,
        totalUnits: 4,
        totalDamage: 379,
      },
    },
    ...overrides,
  };
}

// ==================== 故事 ====================

/** 預設戰鬥畫面 / Default battle scene */
export const Default: Story = {
  args: {
    data: createBattleData(),
    showSpriteLabels: false,
    showHpBars: true,
    showSpBars: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '完整的戰鬥記錄，展示兩支隊伍交戰的完整過程。\nComplete battle record showing the full engagement between two teams.',
      },
    },
  },
};

/** 顯示角色名稱 / With sprite labels */
export const WithSpriteLabels: Story = {
  args: {
    data: createBattleData(),
    showSpriteLabels: true,
    showHpBars: true,
    showSpBars: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '在戰場畫面中顯示角色名稱標籤，方便識別每個單位。\nShow character name labels on the battlefield for easy unit identification.',
      },
    },
  },
};

/** 戰鬥中 / Mid-battle state */
const midBattleUnits = leftTeamUnits.map((u, i) => ({
  ...u,
  hp: i === 0 ? 180 : i === 1 ? 200 : u.hp,
}));

export const MidBattle: Story = {
  args: {
    data: createBattleData({
      leftTeam: {
        name: 'ゴブリンと遊ぶ(最弱)',
        units: midBattleUnits,
        side: EnumTeamSideUI.Left,
      },
      actions: battleActions.slice(0, 6),
    }),
    showHpBars: true,
    showSpBars: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '戰鬥進行中的狀態，部分單位已受損。\nMid-battle state showing some units with reduced HP.',
      },
    },
  },
};

/** 單位陣亡 / With casualties */
const casualtiesUnits = rightTeamUnits.map((u) => {
  if (u.name === 'Mage1') return { ...u, hp: 0, status: EnumUnitStatus.Down as const };
  if (u.name === 'Priest1') return { ...u, hp: 0, status: EnumUnitStatus.Down as const };
  if (u.name === 'Healer1') return { ...u, hp: 0, status: EnumUnitStatus.Down as const };
  if (u.name === 'Hero1') return { ...u, hp: 1, status: EnumUnitStatus.Alive as const };
  return u;
});

export const WithCasualties: Story = {
  args: {
    data: createBattleData({
      rightTeam: {
        name: 'TestTeam',
        units: casualtiesUnits,
        side: EnumTeamSideUI.Right,
      },
      actions: battleActions.slice(9, 18),
    }),
    showHpBars: true,
    showSpBars: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '單位陣亡狀態，部分角色 HP 歸零。\nCasualty state showing some characters with 0 HP.',
      },
    },
  },
};

// ==================== 召喚（Summon）演示 / Summon demo ====================

/**
 * 召喚演示：開場單位
 * Summon demo: opening units
 *
 * unitUuid 同時串起快照與戰場精靈（sprite.unitUuid ↔ snapshot unitUuid），
 * 召喚單位只存在於第二個快照，因此不會出現在開場入場列。
 * `unitUuid` links the snapshots and battlefield sprites (sprite.unitUuid ↔ snapshot
 * unitUuid); the summoned units exist only in the second snapshot, so they never appear
 * in the opening entrance rows.
 */
const summonOpeningUnits = [
  { unitUuid: 'u-goblin-axe', name: 'GoblinAxe', level: 1, hp: 213, maxHp: 213, sp: 154, maxSp: 154, side: EnumTeamSideUI.Left as const, imageUrl: '/image/char/mon_053.png' },
  { unitUuid: 'u-hero1', name: 'Hero1', level: 3, hp: 349, maxHp: 349, sp: 53, maxSp: 53, side: EnumTeamSideUI.Right as const, imageUrl: '/image/char_rev/mon_018.png' },
  { unitUuid: 'u-mage1', name: 'Mage1', level: 3, hp: 159, maxHp: 159, sp: 112, maxSp: 112, side: EnumTeamSideUI.Right as const, imageUrl: '/image/char_rev/mon_214.png' },
];

/** GraveYard 召喚出來的木乃伊（skill.2464：3 體召喚）/ Mummies summoned by GraveYard (skill.2464: summon 3) */
const summonUnits = [
  { unitUuid: 'u-mummy-1', name: 'Mummy', level: 10, hp: 472, maxHp: 472, sp: 179, maxSp: 179, side: EnumTeamSideUI.Right as const, imageUrl: '/image/char_rev/mon_146.png' },
  { unitUuid: 'u-mummy-prisoner', name: 'MummyPrisoner', level: 10, hp: 682, maxHp: 682, sp: 179, maxSp: 179, side: EnumTeamSideUI.Right as const, imageUrl: '/image/char_rev/mon_146r.png' },
  { unitUuid: 'u-mummy-2', name: 'Mummy', level: 10, hp: 472, maxHp: 472, sp: 179, maxSp: 179, side: EnumTeamSideUI.Right as const, imageUrl: '/image/char_rev/mon_146.png' },
];

/**
 * 召喚條目內的單位圖（原始日誌字串引用 char 目錄的 mon_146 / mon_146r）
 * Unit images inside the summon log entry (the original log text references the
 * char-directory mon_146 / mon_146r assets)
 */
const mummyImages = ['/image/char/mon_146.png', '/image/char/mon_146r.png', '/image/char/mon_146.png'];

/**
 * 召喚演示快照：at 0＝開場（無木乃伊）、at 6＝召喚發生之後（3 隻木乃伊入場）
 * Summon demo snapshots: at 0 = opening (no mummies), at 6 = after the summon (3 mummies on the field)
 */
const summonSnapshots: IBattleSnapshotDisplay[] = [
  {
    at: 0,
    units: summonOpeningUnits.map((unit) => ({ ...unit, dead: false })),
  },
  {
    at: 6,
    units: [
      { ...summonOpeningUnits[0], hp: 124, dead: false },
      { ...summonOpeningUnits[1], hp: 201, dead: false },
      { ...summonOpeningUnits[2], dead: false },
      ...summonUnits.map((unit) => ({ ...unit, dead: false })),
    ],
  },
];

/** 召喚演示行動日誌（索引 5 = 召喚，第二段從索引 6 開始）/ Summon demo log (index 5 = the summon; segment 2 starts at index 6) */
const summonActions: IBattleAction[] = [
  {
    type: EnumActionType.Enter,
    source: 'GoblinAxe',
    message: 'GoblinAxe Lv.1 enter the Battlefield.',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Normal,
  },
  {
    type: EnumActionType.Enter,
    source: 'Hero1',
    message: 'Hero1 Lv.3 enter the Battlefield.',
    side: EnumTeamSideUI.Right,
    attribute: EnumAttributeType.Normal,
  },
  {
    type: EnumActionType.Enter,
    source: 'Mage1',
    message: 'Mage1 Lv.3 enter the Battlefield.',
    side: EnumTeamSideUI.Right,
    attribute: EnumAttributeType.Normal,
  },
  {
    type: EnumActionType.Attack,
    source: 'GoblinAxe',
    skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' },
    message: 'GoblinAxe Attack',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Dmg,
  },
  {
    type: EnumActionType.Damage,
    source: 'GoblinAxe',
    target: 'Hero1',
    value: 148,
    valueChange: '349 > 201',
    message: '148 Damage to Hero1',
    side: EnumTeamSideUI.Left,
    attribute: EnumAttributeType.Dmg,
  },
  // ---- 召喚：Mage1 施放 GraveYard（skill 2464，3 體召喚）/ Summon: Mage1 casts GraveYard (skill 2464, summon 3) ----
  {
    type: EnumActionType.Summon,
    source: 'Mage1',
    skill: { name: 'GraveYard', iconUrl: '/image/icon/skill/skill_028.png' },
    summoned: [
      { name: 'Mummy', level: 10, imageUrl: mummyImages[0] },
      { name: 'MummyPrisoner', level: 10, imageUrl: mummyImages[1] },
      { name: 'Mummy', level: 10, imageUrl: mummyImages[2] },
    ],
    message: 'Mage1 GraveYard: Mummy joined to the team.',
    side: EnumTeamSideUI.Right,
    attribute: EnumAttributeType.Normal,
  },
  {
    type: EnumActionType.Attack,
    source: 'Mummy',
    skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' },
    message: 'Mummy Attack',
    side: EnumTeamSideUI.Right,
    attribute: EnumAttributeType.Dmg,
  },
  {
    type: EnumActionType.Damage,
    source: 'Mummy',
    target: 'GoblinAxe',
    value: 89,
    valueChange: '213 > 124',
    message: '89 Damage to GoblinAxe',
    side: EnumTeamSideUI.Right,
    attribute: EnumAttributeType.Dmg,
  },
];

/**
 * 召喚演示戰場精靈（位置自動計算）
 * Summon demo battlefield sprites (positions auto-computed)
 *
 * 仿 stories/battle/sampleData.ts 的作法：只給名冊（side / position / 真實圖像尺寸），
 * x、y 與 flipped 全部交給 computeBattleSpritePositions 推導——左隊 char 圖直接放左側、
 * 右隊 char_rev 圖直接放右側（翻轉由「圖檔目錄＋隊伍側」自動判定），
 * 不手工指定座標，因此不會重演「flipped 鏡像整層 → 右隊被翻到左半場」的錯位。
 * Follows stories/battle/sampleData.ts: supply only the roster (side / position / real
 * image size) and let computeBattleSpritePositions derive x, y and flipped — left team
 * (char images) placed directly on the left, right team (char_rev images) directly on the
 * right, with flipping derived from directory + team side. No hand-written coordinates, so
 * the "flip mirrors the whole layer → right team lands on the left half" bug cannot recur.
 *
 * 木乃伊只在含他們的快照分段出現（resolveSegmentSprites 依 unitUuid 過濾）。
 * The mummies only appear in segments whose snapshot contains them
 * (resolveSegmentSprites filters by unitUuid).
 */
const summonSpriteRoster: IBattlePositionChar[] = [
  { unitUuid: 'u-goblin-axe', name: 'GoblinAxe', imageUrl: '/image/char/mon_053.png', position: EnumPosition.Front, side: EnumTeamSideUI.Left, imageSize: getSpriteImageSize('/image/char/mon_053.png') },
  { unitUuid: 'u-hero1', name: 'Hero1', imageUrl: '/image/char_rev/mon_018.png', position: EnumPosition.Back, side: EnumTeamSideUI.Right, imageSize: getSpriteImageSize('/image/char_rev/mon_018.png') },
  { unitUuid: 'u-mage1', name: 'Mage1', imageUrl: '/image/char_rev/mon_214.png', position: EnumPosition.Back, side: EnumTeamSideUI.Right, imageSize: getSpriteImageSize('/image/char_rev/mon_214.png') },
  { unitUuid: 'u-mummy-1', name: 'Mummy', imageUrl: '/image/char_rev/mon_146.png', position: EnumPosition.Front, side: EnumTeamSideUI.Right, imageSize: getSpriteImageSize('/image/char_rev/mon_146.png') },
  { unitUuid: 'u-mummy-prisoner', name: 'MummyPrisoner', imageUrl: '/image/char_rev/mon_146r.png', position: EnumPosition.Front, side: EnumTeamSideUI.Right, imageSize: getSpriteImageSize('/image/char_rev/mon_146r.png') },
  { unitUuid: 'u-mummy-2', name: 'Mummy', imageUrl: '/image/char_rev/mon_146.png', position: EnumPosition.Front, side: EnumTeamSideUI.Right, imageSize: getSpriteImageSize('/image/char_rev/mon_146.png') },
];

const summonSprites: IBattleSprite[] = computeBattleSpritePositions(
  groupBattleChars(summonSpriteRoster),
  { width: SPRITE_LAYOUT_WIDTH, height: SPRITE_LAYOUT_HEIGHT },
);

/** 戰鬥中召喚 / Summoning mid-battle */
export const WithSummon: Story = {
  args: {
    data: createBattleData({
      leftTeam: {
        name: 'ゴブリンと遊ぶ(最弱)',
        units: summonOpeningUnits.filter((u) => u.side === EnumTeamSideUI.Left),
        side: EnumTeamSideUI.Left,
      },
      rightTeam: {
        name: 'TestTeam',
        units: [...summonOpeningUnits.filter((u) => u.side === EnumTeamSideUI.Right), ...summonUnits],
        side: EnumTeamSideUI.Right,
      },
      sprites: summonSprites,
      actions: summonActions,
      snapshots: summonSnapshots,
      result: undefined,
    }),
    showSpriteLabels: false,
    showHpBars: true,
    showSpBars: true,
    showUnitSprites: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Mage1 施放 GraveYard（skill 2464，3 體召喚）：召喚條目顯示施放者＋技能與每隻木乃伊的「joined to the team / enter the Battlefield」，' +
          '木乃伊不在開場入場列，第二段快照起才出現在 HP/SP 狀態與戰場上。\n' +
          'Mage1 casts GraveYard (skill 2464, summon 3): the log entry shows the caster, the skill and each mummy\'s "joined to the team / enter the Battlefield", ' +
          'while the mummies stay out of the opening entrance rows and appear in the HP/SP status and on the field from the second snapshot onward.',
      },
    },
  },
};

/** 戰鬥結果 / Battle result */
const resultUnits = leftTeamUnits.map((u) => ({
  ...u,
  hp: u.name === 'GoblinWarrior(A)' ? 140 : u.name === 'GoblinWarrior(B)' ? 130 : u.hp,
}));

const defeatedUnits = rightTeamUnits.map((u) => ({
  ...u,
  hp: 0,
  status: EnumUnitStatus.Down as const,
}));

export const BattleOver: Story = {
  args: {
    data: createBattleData({
      leftTeam: {
        name: 'ゴブリンと遊ぶ(最弱)',
        units: resultUnits,
        side: EnumTeamSideUI.Left,
      },
      rightTeam: {
        name: 'TestTeam',
        units: defeatedUnits,
        side: EnumTeamSideUI.Right,
      },
      actions: battleActions.slice(15),
      result: {
        winner: 'ゴブリンと遊ぶ(最弱)',
        isDraw: false,
        leftTeam: {
          hpRemain: 573,
          alive: 4,
          totalUnits: 4,
          totalDamage: 1384,
          totalExp: 4,
          funds: '4',
        },
        rightTeam: {
          hpRemain: 0,
          alive: 0,
          totalUnits: 4,
          totalDamage: 379,
        },
      },
    }),
    showHpBars: true,
    showSpBars: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '戰鬥結束後的結果畫面，包含最終統計數據。\nPost-battle result screen with final statistics.',
      },
    },
  },
};
