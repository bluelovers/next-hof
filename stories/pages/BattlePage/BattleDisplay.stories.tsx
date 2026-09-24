/**
 * BattleDisplay Storybook 故事
 * BattleDisplay Storybook stories
 *
 * 展示戰鬥畫面的各種狀態。展示資料全數集中於 fixture（單一事實來源），
 * 此檔只保留故事定義：顯示開關與說明文字。
 * Showcases the battle scene in various states. All showcase data lives in the fixture
 * (single source of truth); this file keeps only the story definitions — the display
 * toggles and the description text.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { BattleDisplay } from '#/components/pages/BattleDisplay';
import {
  battleOverData,
  casualtyData,
  defaultBattleData,
  logMessagesData,
  magicCircleData,
  midBattleData,
  summonData,
} from '../../fixture/battleDisplayData';

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

// ==================== 故事 ====================

/** 預設戰鬥畫面 / Default battle scene */
export const Default: Story = {
  args: {
    data: defaultBattleData,
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
    data: defaultBattleData,
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
export const MidBattle: Story = {
  args: {
    data: midBattleData,
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
export const WithCasualties: Story = {
  args: {
    data: casualtyData,
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

/** 戰鬥中召喚 / Summoning mid-battle */
export const WithSummon: Story = {
  args: {
    data: summonData,
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

/** 魔方陣紀錄 / Magic-circle records */
export const WithMagicCircle: Story = {
  args: {
    data: magicCircleData,
    showHpBars: true,
    showSpBars: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '魔方陣相關紀錄：draw（描繪己方，support 色）／erased enemy（消除敵方，dmg 色）／use（消耗代價，charge 色）／failed!（魔方陣不足，dmg 色），' +
          '文案與配色取自原始日誌字串。\n' +
          'Magic-circle records: draw (own circles, support colour) / erased enemy (enemy circles, dmg colour) / use (skill cost, charge colour) / ' +
          'failed! (not enough circles, dmg colour), with the copy and colours taken verbatim from the original log.',
      },
    },
  },
};

/** 完整日誌訊息覆蓋 / Full log-message coverage */
export const WithLogMessages: Story = {
  args: {
    data: logMessagesData,
    showHpBars: true,
    showSpBars: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '原始日誌（HOF/Class）的每個訊息族系各示範一次：蓄力 start charging.、SP 傷害、Recovered、Drained、持續回復與 Auto Regenerate、' +
          'revived、增益 quicked/casting shorted/barriered、減益 STR down、中毒四種（施加／傷害／解除／抗毒）、屬性升降與上限升降（含舊值）、' +
          '位移 moved to front/back、knock backed、goes forward、延遲 Delayed(15 >>> 25/100)、sacrifice、施放失敗（武器不符／SP 不足）、' +
          'miss、LevelUp、掉落道具、退場 leave the Battlefield，以及純文字資訊（Damage x6!、No target.Failed!、Attack has disappeared.、' +
          '補正提示、battle turns extended.、Alives get exps.、隊伍 Get 金錢、sunk in thought、exchanged rate of HP and SP.）。' +
          '文案與配色逐字取自原始日誌字串與 basis.css。\n' +
          'One demonstration of every message family in the original log (HOF/Class): charge start, SP damage, Recovered, Drained, regen and ' +
          'Auto Regenerate, revived, the three buffs, a stat debuff, the four poison lines (apply / damage / cure / resist), stat and cap changes ' +
          '(with the old value), movement (front / back / knock backed / goes forward), delay Delayed(15 >>> 25/100), sacrifice, the ' +
          'failed-to-cast lines (weapon mismatch styled, SP shortage unstyled), miss, LevelUp, dropped item, leave the Battlefield, plus plain ' +
          'info text (Damage x6!, No target.Failed!, Attack has disappeared., the over-cap correction note, battle turns extended., Alives get ' +
          'exps., team Get money, sunk in thought, exchanged rate of HP and SP.). Copy and colours are taken verbatim from the original log ' +
          'strings and basis.css.',
      },
    },
  },
};

/** 戰鬥結果 / Battle result */
export const BattleOver: Story = {
  args: {
    data: battleOverData,
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
