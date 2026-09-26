/**
 * BattleEventDispatch Storybook 故事
 * BattleEventDispatch Storybook stories
 *
 * 展示上級事件引擎（技能事件 / 一般事件）的輸出。展示資料全數集中於 fixture
 * （單一事實來源），此檔只保留故事定義：輸入資料、單位對照與說明文字。
 * 舊的底層展示（BattleDisplay 七個故事）維持不變，此檔是新增的上級檢視。
 * Shows the output of the upper event engine (skill events / general events). All showcase data
 * lives in the fixture (single source of truth); this file keeps only the story definitions — the
 * input data, the unit name map and the description text. The existing low-level display (the
 * seven BattleDisplay stories) is untouched; this is an added, higher-level view.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { BattleEventDispatch } from '#/components/BattleEventDispatch/BattleEventDispatch';
import {
  dispatchUnitNames,
  mixedLogRecords,
  multiEffectRecords,
  summonEntryRecords,
} from '../../fixture/battleEventDispatchData';

const meta: Meta<typeof BattleEventDispatch> = {
  title: 'Pages/BattlePage/BattleEventDispatch',
  component: BattleEventDispatch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '事件分派檢視：兩類（技能事件 / 一般事件）涵蓋所有戰鬥紀錄，技能事件再依效果偵測分派到各系統，召喚系統衍生入場事件。\nEvent dispatch view: the two classes (skill event / general event) cover every battle record; a skill event then dispatches its records to per-effect systems, and the summon system derives the entry event.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BattleEventDispatch>;

// ==================== 故事 ====================

/** 一個技能不一定只有一種效果 / One skill may carry several effects */
export const MultiEffectSkill: Story = {
  args: {
    records: multiEffectRecords,
    unitNames: dispatchUnitNames,
    title: '複合效果技能 / Multi-effect skill',
  },
  parameters: {
    docs: {
      description: {
        story:
          'PlagueHex 同時具備傷害、施毒與減益，三種效果各自分派到對應系統；緊接著的每回合毒傷屬一般事件，夾在中間也不會切開這次技能執行。Purify 被偵測到回復與毒系統，但解毒沒有產出紀錄，因此只有恢復系統有內容。\nPlagueHex carries damage, poison and debuff at once, each dispatched to its own system. The per-turn poison damage that follows is a general event: interleaved, it still does not split the execution. Purify is detected as heal + poison, but cure produces no record, so only the heal system has content.',
      },
    },
  },
};

/** 召喚系統處理後觸發入場事件 / The summon system triggers the entry event */
export const SummonEntry: Story = {
  args: {
    records: summonEntryRecords,
    unitNames: dispatchUnitNames,
    title: '召喚與入場 / Summon and entry',
  },
  parameters: {
    docs: {
      description: {
        story:
          '召喚技能依序走回復、魔方陣與召喚系統；召喚系統處理完召喚紀錄後衍生「入場事件」（只存在於引擎輸出，不寫回 Battle.log，因此展示層的入場句不會重複渲染）。\nThe summon skill runs through the heal, magic-circle and summon systems in turn; after processing the summon record the summon system derives the entry event — engine output only, never written back to Battle.log, so the display-side entry line is not rendered twice.',
      },
    },
  },
};

/** 兩類涵蓋整段日誌 / The two classes cover the whole log */
export const MixedLog: Story = {
  args: {
    records: mixedLogRecords,
    unitNames: dispatchUnitNames,
    title: '混合日誌 / Mixed log',
  },
  parameters: {
    docs: {
      description: {
        story:
          '技能事件與一般事件（死亡）交錯出現，兩類共同涵蓋整段日誌；查不到技能定義時偵測效果為空，但分派照常進行。\nSkill events interleave with general events (death); together the two classes cover the whole log. When a skill definition is unknown the detected effects are empty, but dispatch still runs.',
      },
    },
  },
};
