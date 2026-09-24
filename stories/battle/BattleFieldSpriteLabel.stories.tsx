/**
 * BattleFieldSpriteLabel 個別展示（搭配 BattleFieldSpriteFrame）
 * BattleFieldSpriteLabel showcase (composed with BattleFieldSpriteFrame)
 *
 * 標籤本身不會單獨排版，它依附在 BattleFieldSpriteFrame 的角色精靈圖層內；
 * 因此本故事把標籤放進真正的 BattleFieldSpriteFrame 中（以一張真實精靈圖為底），
 * 才能看見標籤相對角色與 frame 顯示範圍的實際排版是否正確。
 * The label is never laid out on its own — it lives inside a character sprite layer of
 * BattleFieldSpriteFrame. So this story composes the label inside the REAL
 * BattleFieldSpriteFrame (backed by a real sprite image), making its actual positioning
 * relative to the character and the frame display range visible and verifiable.
 *
 * 角色的 x / y / flipped 不由故事寫死，而是由 computeBattleSpritePositions（搭配
 * groupBattleChars）依名冊的 side / position / 圖檔目錄自動計算，frame 尺寸則取自
 * 共用的 createSampleConfig（真實戰場 480×200），不在此處魔術指定。
 * The character's x / y / flipped are NOT hardcoded here — they are auto-computed by
 * computeBattleSpritePositions (with groupBattleChars) from the roster's side / position
 * and image directory, and the frame size comes from the shared createSampleConfig
 * (real battlefield 480×200), never a magic number in this file.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeStageDecorator, STAGE_BG_COLOR } from '../decorators';
import {
  sampleFieldSize,
} from './sampleData';
import { EnumBattleFieldVAlign } from '../../src/components/battle/enums';
import {
  BattleFieldSpriteLabel,
  type IBattleFieldSpriteLabelProps,
} from '../../src/components/battle/BattleFieldSpriteLabel';
import { BattleFieldSpriteFrame } from '../../src/components/battle/BattleFieldSpriteFrame';
import type { IBattleSprite } from '../../src/components/battle/types';
import { EnumTeamSideUI, EnumSpriteLabelPlacement } from '../../src/components/battle/enums';
import { EnumPosition } from '../../src/lib/game/constants';
import { getSpriteImageSize } from '../../src/components/battle/spriteImageSizes';
import {
  groupBattleChars,
  computeBattleSpritePositions,
  type IBattlePositionChar,
} from '../../src/components/battle/computeSpritePositions';

/** 名冊角色（不含尺寸；位置與翻轉交由計算邏輯得出） / Roster char (no size; position & flip come from the compute logic) */
interface IStoryRosterChar {
  /** 戰鬥單位實例 uid / Battle-unit instance uid */
  unitUid: string;
  /** 角色名稱 / Name */
  name?: string;
  /** 精靈圖片路徑 / Sprite image path */
  imageUrl: string;
  /** 站位：前衛 / 後衛 / Position: front / back */
  position: EnumPosition;
  /** 隊伍側：左 / 右 / Team side: left / right */
  side: EnumTeamSideUI;
}

/** 真實戰場尺寸（480×200），frame 尺寸由此而來（單一事實來源，不在故事中魔術指定） / Real battlefield size (480×200); frame size derives from this (SoT, no magic number here) */
const fieldSize = sampleFieldSize;

/**
 * 用定位邏輯把「一張名冊角色」轉成真實定位的精靈（x, y, flipped 由計算得來，不寫死）
 * Turn a single roster char into a real sprite via the positioning logic; x, y, flipped
 * are computed, never hardcoded.
 */
function buildSprite(char: IStoryRosterChar): IBattleSprite {
  const size = getSpriteImageSize(char.imageUrl);
  const positioned: IBattlePositionChar = {
    ...char,
    imageSize: size,
  };
  const teams = groupBattleChars([positioned]);
  return computeBattleSpritePositions(teams, fieldSize)[0];
}

/**
 * 建立渲染函式：以邏輯計算出的精靈 + 真實 frame 呈現標籤排版
 * Build the render: show the logic-computed sprite inside the real frame.
 */
const makeRender = (char: IStoryRosterChar) => (args: IBattleFieldSpriteLabelProps) => {
  const sprite = buildSprite(char);
  sprite.name = char.name;
  sprite.placement = args.placement;
  sprite.labelStyle = args.style;

  return (
    <BattleFieldSpriteFrame
      sprites={[sprite]}
      width={fieldSize.width}
      height={fieldSize.height}
      showLabels
      valign={EnumBattleFieldVAlign.Bottom}
      // 為 frame 加上可視邊框與底色，才能看見「顯示範圍」是否把標籤收納在內
      // Give the frame a visible border + tint so we can see whether the label stays inside the display range.
      style={{ border: '1px dashed #5a6b7e', background: 'rgba(255,255,255,0.04)' }}
    />
  );
};

/** 左隊（前/後衛由 position 決定） / Left team (front/back by position) */
const heroLeft = {
  unitUid: 'mon_018',
  name: 'Hero1',
  imageUrl: '/image/char/mon_018.png',
  position: EnumPosition.Back,
  side: EnumTeamSideUI.Left,
};
/** 右隊 char_rev（直接定位於右側，flipped:false） / Right team char_rev (directly on the right, not flipped) */
const mageRight = {
  unitUid: 'mon_018b',
  name: 'Mage1',
  imageUrl: '/image/char_rev/mon_018.png',
  position: EnumPosition.Front,
  side: EnumTeamSideUI.Right,
};
/** 右隊 char（由邏輯推導為 flipped:true，標籤會反向抵消鏡像） / Right team char (logic derives flipped:true; label cancels the mirror) */
const goblinRight = {
  unitUid: 'mon_052',
  name: 'Goblin',
  imageUrl: '/image/char/mon_052.png',
  position: EnumPosition.Front,
  side: EnumTeamSideUI.Right,
};

const meta: Meta<typeof BattleFieldSpriteLabel> = {
  title: 'BattleField/BattleFieldSpriteLabel',
  component: BattleFieldSpriteLabel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '戰場精靈名稱標籤：置於 BattleFieldSpriteFrame 內，依角色圖像中心自動對齊，' +
          '支援 above/below 兩種垂直定位演算法，並收斂在 frame 顯示範圍內。' +
          '角色的 x / y / flipped 由 computeBattleSpritePositions 依名冊自動計算，不在故事中寫死。\n' +
          'Battlefield sprite name label: rendered inside BattleFieldSpriteFrame; centers on the ' +
          'character and supports above/below placement, clamped within the frame display range. ' +
          'The character x / y / flipped are auto-computed by computeBattleSpritePositions from the ' +
          'roster, never hardcoded in the story.',
      },
    },
  },
  tags: ['autodocs'],
  // 舞台尺寸取自真實戰場尺寸（480×200），使絕對定位的 frame 有正確原點與可視範圍
  // Stage size comes from the real battlefield size (480×200), giving the absolutely-positioned
  // frame a correct origin and visible range.
  decorators: [
    makeStageDecorator({ width: fieldSize.width, height: fieldSize.height, background: STAGE_BG_COLOR }),
  ],
  args: {
    name: 'Demo',
    placement: EnumSpriteLabelPlacement.Below,
  },
};

export default meta;
type Story = StoryObj<typeof BattleFieldSpriteLabel>;

/** 預設標籤（左隊角色，角色下方） / Default label (left-team character, below) */
export const Default: Story = {
  args: { name: 'Hero1', placement: EnumSpriteLabelPlacement.Below },
  render: makeRender(heroLeft),
};

/** 左側角色（x 由左隊定位邏輯得出） / Left-side character (x from left-team positioning) */
export const LeftSideCharacter: Story = {
  args: { name: 'Hero1', placement: EnumSpriteLabelPlacement.Below },
  render: makeRender(heroLeft),
};

/** 右側角色（右隊 char_rev 直接定位於右側） / Right-side character (right-team char_rev placed directly on the right) */
export const RightSideCharacter: Story = {
  args: { name: 'Mage1', placement: EnumSpriteLabelPlacement.Below },
  render: makeRender(mageRight),
};

/** 翻轉角色（右隊 char，flipped 由邏輯推導為 true；標籤反向抵消鏡像保持正向） / Flipped character (right-team char; flipped auto-derived true, label cancels mirror) */
export const FlippedCharacter: Story = {
  args: { name: 'Goblin', placement: EnumSpriteLabelPlacement.Below },
  render: makeRender(goblinRight),
};

/** 複寫樣式（紅色、加大字體） / Overridden style (red, larger font) */
export const OverrideStyle: Story = {
  args: {
    name: 'Hero1',
    placement: EnumSpriteLabelPlacement.Below,
    style: { color: '#ff6b6b', fontSize: 16, textShadow: '0 0 6px #000' },
  },
  render: makeRender(heroLeft),
};

/** 演算法 1：標籤置於角色上方 / Algorithm 1: label above the character */
export const AboveCharacter: Story = {
  args: { name: 'Hero1', placement: EnumSpriteLabelPlacement.Above },
  render: makeRender(heroLeft),
};

/** 演算法 2：標籤置於角色下方 / Algorithm 2: label below the character */
export const BelowCharacter: Story = {
  args: { name: 'Hero1', placement: EnumSpriteLabelPlacement.Below },
  render: makeRender(heroLeft),
};
