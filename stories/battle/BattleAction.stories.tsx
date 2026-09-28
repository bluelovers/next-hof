/**
 * BattleAction 個別展示
 * BattleAction individual showcase
 *
 * 各種戰鬥行動/技能的日誌條目
 * Various battle action/skill log entry types
 *
 * 所有枚舉欄位（type／attribute）一律使用 EnumActionType／EnumAttributeType，
 * 不寫裸字串，確保與生產層 IBattleAction 的單一事實來源一致。
 * Every enumerated field (type / attribute) uses EnumActionType / EnumAttributeType rather than
 * bare strings, keeping the story in lock-step with the production IBattleAction source of truth.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleActionDarkDecorator } from '../decorators';
import { BattleAction } from '../../src/components/battle/BattleAction';
import type { IBattleAction } from '../../src/components/battle/types';
import { EnumActionType, EnumAttributeType, EnumStatDirection } from '#/components/battle/enums';
import { EnumValueWho } from '#/lib/game/types';
import { EnumStatusAttr } from '#/lib/game/character/status-enum';
import {
	buildActionMessage,
	buildDamageCountMessage,
	buildDamageMessage,
	buildDrainMessage,
	buildHealCountMessage,
	buildHealMessage,
	buildPoisonDamageText,
	buildPoisonResistText,
	buildPossessiveText,
	buildRecoveredText,
	buildRegenText,
	buildSpDamageMessage,
	buildStatToText,
	buildValueChangeFromDelay,
	EnumLogCopy,
} from '#/components/battle/battleUtils';

const meta: Meta<typeof BattleAction> = {
	title: 'Battle/Atoms/BattleAction',
	component: BattleAction,
	parameters: {
		layout: 'centered',
		docs: { description: { component: '單一戰鬥行動的日誌條目，支援多種行動類型。\nSingle battle action log entry supporting multiple action types.' } },
	},
	tags: ['autodocs'],
	decorators: [BattleActionDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof BattleAction>;

/** 技能攻擊：FatalStab / Skill attack: FatalStab */
export const SkillAttack: Story = {
	args: {
		action: {
			type: EnumActionType.Skill,
			source: 'GoblinWarrior(B)',
			skill: { name: 'FatalStab', iconUrl: '/image/icon/skill/skill_074z.png' },
			message: 'GoblinWarrior(B) FatalStab',
			attribute: EnumAttributeType.Dmg,
		},
	},
};

/** 普通攻擊 / Normal attack */
export const NormalAttack: Story = {
	args: {
		action: {
			type: EnumActionType.Attack,
			source: 'GoblinAxe',
			skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' },
			message: 'GoblinAxe Attack',
			attribute: EnumAttributeType.Dmg,
		},
	},
};

/** 傷害 / Damage */
export const DamageDealt: Story = {
	args: {
		action: {
			type: EnumActionType.Damage,
			source: 'GoblinWarrior(B)',
			target: 'Hero1',
			value: 182,
			/**
			 * 前後值只寫數字，兩端之間的符號（↘ 下降）由渲染端唯一組出；message 是同一件事的純文字鏡像
			 * Only the numbers are written: the renderer builds the symbol between them (↘ falling)
			 * once, and `message` is the plain-text mirror of the same fact
			 */
			valueChange: { from: 349, to: 167 },
			message: buildDamageMessage(182, 'Hero1'),
			attribute: EnumAttributeType.Dmg,
		},
	},
};

/** 保護 / Protect */
export const ProtectAction: Story = {
	args: {
		action: {
			type: EnumActionType.Protect,
			source: 'Hero1',
			target: 'Priest1',
			message: 'Hero1 protected Priest1!',
			attribute: EnumAttributeType.Support,
		},
	},
};

/** 單位入場 / Unit entrance */
export const UnitEntrance: Story = {
	args: {
		action: {
			type: EnumActionType.Enter,
			source: 'GoblinWarrior(A)',
			message: 'GoblinWarrior(A) Lv.4 enter the Battlefield.',
			attribute: EnumAttributeType.Normal,
		},
	},
};

/** 召喚：GraveYard 召喚 3 隻木乃伊 / Summon: GraveYard summons 3 mummies */
export const SummonAction: Story = {
	args: {
		action: {
			type: EnumActionType.Summon,
			source: 'Mage1',
			skill: { name: 'GraveYard', iconUrl: '/image/icon/skill/skill_028.png' },
			summoned: [
				{ name: 'Mummy', level: 10, imageUrl: '/image/char/mon_146.png' },
				{ name: 'MummyPrisoner', level: 10, imageUrl: '/image/char/mon_146r.png' },
				{ name: 'Mummy', level: 10, imageUrl: '/image/char/mon_146.png' },
			],
			message: 'Mage1 GraveYard: Mummy joined to the team.',
			attribute: EnumAttributeType.Normal,
		},
	},
};

/** 詠唱 / Casting */
export const CastingAction: Story = {
	args: {
		action: {
			type: EnumActionType.Casting,
			source: 'Mage1',
			message: 'Mage1 start casting.',
			attribute: EnumAttributeType.Charge,
		},
	},
};

/** 單位陣亡 / Unit down */
export const UnitDown: Story = {
	args: {
		action: {
			type: EnumActionType.Down,
			source: 'Mage1',
			message: 'Mage1 down.',
			attribute: EnumAttributeType.Dmg,
		},
	},
};

/** 回復 / Heal */
export const HealAction: Story = {
	args: {
		action: {
			type: EnumActionType.Heal,
			source: 'Priest1',
			target: 'Hero1',
			value: 120,
			valueChange: { from: 1, to: 121 },
			message: buildHealMessage(120, 'Hero1'),
			attribute: EnumAttributeType.Recover,
		},
	},
};

// ==================== SkillEffect 移植帶來的行動型別 ====================
/**
 * 對應 #/lib/game/skill/SkillEffect.ts 生產、由 battle-adapter 轉接的事件；
 * 文案一律引用 battleUtils 的建構器，不在此重打字串（與 fixture 同源）。
 * Action types brought by the SkillEffect port: events produced by
 * #/lib/game/skill/SkillEffect.ts and adapted by battle-adapter; the copy always comes from
 * battleUtils' builders and is never retyped here (same source as the fixture).
 */

/** SP 傷害（`40SP Damage to GoblinAxe`，行首無施放者名稱）/ SP damage (`40SP Damage to GoblinAxe`, no caster name at the head) */
export const SpDamageAction: Story = {
	args: {
		action: {
			type: EnumActionType.SpDamage,
			source: undefined,
			target: 'GoblinAxe',
			value: 40,
			valueUnit: 'SP',
			message: buildSpDamageMessage(40, 'GoblinAxe'),
			attribute: EnumAttributeType.Spdmg,
		},
	},
};

/** 吸取（`Drained 40 HP from GoblinAxe(1000 ↘ 960)Warrior(200 ↗ 240)`）/ Drain */
export const DrainAction: Story = {
	args: {
		action: {
			type: EnumActionType.Drain,
			source: undefined,
			target: 'GoblinAxe',
			value: 40,
			valueUnit: 'HP',
			message: buildDrainMessage(40, 'HP', 'GoblinAxe'),
			valueChanges: [{ from: 1000, to: 960 }, { who: EnumValueWho.Actor, from: 200, to: 240 }],
			attribute: EnumAttributeType.Recover,
		},
	},
};

/** SP 回復（`Warrior Recovered 30 SP`；與 HP 回復共用版面，依 valueUnit 配 support 色）/ SP heal */
export const RecoverSpAction: Story = {
	args: {
		action: {
			type: EnumActionType.Recover,
			source: 'Warrior',
			value: 30,
			valueUnit: 'SP',
			valueChange: { from: 60, to: 90 },
			text: buildRecoveredText(30, 'SP'),
			message: buildActionMessage({ source: 'Warrior', text: buildRecoveredText(30, 'SP') }),
			attribute: EnumAttributeType.Support,
		},
	},
};

/** 持續回復（`gained SP regeneration +15%`）/ Regeneration (`gained SP regeneration +15%`) */
export const RegenAction: Story = {
	args: {
		action: {
			type: EnumActionType.Regen,
			source: 'Mage1',
			valueUnit: 'SP',
			text: buildRegenText('SP', 15),
			message: buildActionMessage({ source: 'Mage1', text: buildRegenText('SP', 15) }),
			attribute: EnumAttributeType.Support,
		},
	},
};

/** 復活（`Hero1 revived!`，只有 revived 上 recover 色）/ Revive (`Hero1 revived!`) */
export const ReviveAction: Story = {
	args: {
		action: {
			type: EnumActionType.Revive,
			source: 'Hero1',
			text: EnumLogCopy.Revived,
			message: buildActionMessage({ source: 'Hero1', text: EnumLogCopy.Revived }),
			emphasis: 'revived',
			attribute: EnumAttributeType.Recover,
		},
	},
};

/** 增益：障壁／加速／施法縮短（三句皆 support 色）/ Buff: barrier / quick / cast shortened */
export const BuffAction: Story = {
	args: {
		action: {
			type: EnumActionType.Buff,
			source: 'Mage1',
			text: EnumLogCopy.Barriered,
			message: buildActionMessage({ source: 'Mage1', text: EnumLogCopy.Barriered }),
			attribute: EnumAttributeType.Support,
		},
	},
};

/** 施法縮短（`casting shorted!`）/ Cast shortened (`casting shorted!`) */
export const CastShortAction: Story = {
	args: {
		action: {
			type: EnumActionType.Buff,
			source: 'Mage1',
			text: EnumLogCopy.CastingShorted,
			message: buildActionMessage({ source: 'Mage1', text: EnumLogCopy.CastingShorted }),
			attribute: EnumAttributeType.Support,
		},
	},
};

/** 加速（`got quicked!`）/ Quick (`got quicked!`) */
export const QuickAction: Story = {
	args: {
		action: {
			type: EnumActionType.Buff,
			source: 'Hero1',
			text: EnumLogCopy.Quicked,
			message: buildActionMessage({ source: 'Hero1', text: EnumLogCopy.Quicked }),
			attribute: EnumAttributeType.Support,
		},
	},
};

/** 上限變化（`MAXSP extended to 400`，原始日誌無 span）/ Cap change (`MAXSP extended to 400`, no span) */
export const StatChangeAction: Story = {
	args: {
		action: {
			type: EnumActionType.StatChange,
			source: 'Mage1',
			text: buildStatToText(EnumStatusAttr.MAXSP, EnumStatDirection.Extended, 400),
			message: buildActionMessage({ source: 'Mage1', text: buildStatToText(EnumStatusAttr.MAXSP, EnumStatDirection.Extended, 400) }),
			attribute: EnumAttributeType.Normal,
		},
	},
};

/** 位移（`moved to front.`，原始日誌無 span）/ Move (`moved to front.`, no span) */
export const MoveAction: Story = {
	args: {
		action: {
			type: EnumActionType.Move,
			source: 'Hero1',
			text: EnumLogCopy.MoveToFront,
			message: buildActionMessage({ source: 'Hero1', text: EnumLogCopy.MoveToFront }),
			attribute: EnumAttributeType.Normal,
		},
	},
};

/** 延遲（`Mage1 Delayed（15 ⏳↘ 25/100）`；符號 `⏳↘` 由版面依型別決定）/ Delay */
export const DelayAction: Story = {
	args: {
		action: {
			type: EnumActionType.Delay,
			source: 'Mage1',
			text: EnumLogCopy.Delay,
			message: buildActionMessage({ source: 'Mage1', text: EnumLogCopy.Delay }),
			valueChange: buildValueChangeFromDelay(15, 25, 100),
			attribute: EnumAttributeType.Normal,
		},
	},
};

/** 中毒施加（`get poisoned!`，只有 poisoned 上 spdmg 色）/ Poison applied (`get poisoned!`) */
export const PoisonAction: Story = {
	args: {
		action: {
			type: EnumActionType.Poison,
			source: 'GoblinAxe',
			text: EnumLogCopy.PoisonApplied,
			message: buildActionMessage({ source: 'GoblinAxe', text: EnumLogCopy.PoisonApplied }),
			emphasis: 'poisoned',
			attribute: EnumAttributeType.Spdmg,
		},
	},
};

/** 每回合毒傷（`got 12 damage by poison.`，帶前後 HP）/ Per-turn poison damage */
export const PoisonDamageAction: Story = {
	args: {
		action: {
			type: EnumActionType.Poison,
			source: 'GoblinAxe',
			value: 12,
			valueChange: { from: 1200, to: 1050 },
			text: buildPoisonDamageText(12),
			message: buildActionMessage({ source: 'GoblinAxe', text: buildPoisonDamageText(12) }),
			attribute: EnumAttributeType.Spdmg,
		},
	},
};

/** 解毒（`GoblinAxe's poison has cured.`；所有格片段不加空格、無 span）/ Cure (`GoblinAxe's poison has cured.`) */
export const PoisonCureAction: Story = {
	args: {
		action: {
			type: EnumActionType.Poison,
			source: 'GoblinAxe',
			text: buildPossessiveText(EnumLogCopy.PoisonCured),
			message: buildActionMessage({ source: 'GoblinAxe', text: buildPossessiveText(EnumLogCopy.PoisonCured) }),
			attribute: EnumAttributeType.Normal,
		},
	},
};

/** 抗毒（`got PoisonResist!(50%)`，support 色）/ Poison resist (`got PoisonResist!(50%)`) */
export const PoisonResistAction: Story = {
	args: {
		action: {
			type: EnumActionType.Poison,
			source: 'GoblinWarrior(A)',
			text: buildPoisonResistText(50),
			message: buildActionMessage({ source: 'GoblinWarrior(A)', text: buildPoisonResistText(50) }),
			attribute: EnumAttributeType.Support,
		},
	},
};

/** 自我中毒（`Got poisoned`，無主詞無 span）/ Self-poison (`Got poisoned`, unnamed) */
export const PoisonSelfAction: Story = {
	args: {
		action: {
			type: EnumActionType.Poison,
			source: undefined,
			text: EnumLogCopy.PoisonSelf,
			message: EnumLogCopy.PoisonSelf,
			attribute: EnumAttributeType.Normal,
		},
	},
};

/** 未命中（無施放者時整段即 `Failed!`）/ Miss without an actor (the whole line is `Failed!`) */
export const MissAction: Story = {
	args: {
		action: {
			type: EnumActionType.Miss,
			source: undefined,
			text: EnumLogCopy.Miss,
			message: EnumLogCopy.Miss,
			attribute: EnumAttributeType.Normal,
		},
	},
};

/** 純文字資訊（`Damage x6!`／`heal x2!`，無主詞無 span）/ Plain info (`Damage x6!` / `heal x2!`) */
export const InfoAction: Story = {
	args: {
		action: {
			type: EnumActionType.Info,
			source: undefined,
			message: buildDamageCountMessage(6),
			attribute: EnumAttributeType.Normal,
		},
	},
};

/** 回復倍數資訊（`heal x2!`；對照 SkillEffect 的 3005）/ Heal multiplier info (`heal x2!`) */
export const HealCountInfoAction: Story = {
	args: {
		action: {
			type: EnumActionType.Info,
			source: undefined,
			message: buildHealCountMessage(2),
			attribute: EnumAttributeType.Normal,
		},
	},
};

/** HP/SP 交換（3 行區塊：交換句＋HP 行＋SP 行）/ HP/SP exchange (3-line block) */
export const EnergyExchangeAction: Story = {
	args: {
		action: {
			type: EnumActionType.EnergyExchange,
			source: 'Hero1',
			text: EnumLogCopy.EnergyExchange,
			message: buildActionMessage({ source: 'Hero1', text: EnumLogCopy.EnergyExchange }),
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
			attribute: EnumAttributeType.Normal,
		},
	},
};

/** 多行日誌範例展示 / Multiple log entries example */
export const LogSequence: Story = {
	render: () => (
		<div>
			<BattleAction action={{
				type: EnumActionType.Skill,
				source: 'GoblinWarrior(B)',
				skill: { name: 'FatalStab', iconUrl: '/image/icon/skill/skill_074z.png' },
				message: 'GoblinWarrior(B) FatalStab',
				attribute: EnumAttributeType.Dmg,
			}} />
			<BattleAction action={{
				type: EnumActionType.Protect,
				source: 'Hero1',
				target: 'Priest1',
				message: 'Hero1 protected Priest1!',
				attribute: EnumAttributeType.Support,
			}} />
			<BattleAction action={{
				type: EnumActionType.Damage,
				source: 'GoblinWarrior(B)',
				target: 'Hero1',
				value: 182,
				valueChange: { from: 349, to: 167 },
				message: buildDamageMessage(182, 'Hero1'),
				attribute: EnumAttributeType.Dmg,
			}} />
			<BattleAction action={{
				type: EnumActionType.Attack,
				source: 'GoblinAxe',
				skill: { name: 'Attack', iconUrl: '/image/icon/skill/skill_042.png' },
				message: 'GoblinAxe Attack',
				attribute: EnumAttributeType.Dmg,
			}} />
			<BattleAction action={{
				type: EnumActionType.Damage,
				source: 'GoblinAxe',
				target: 'Healer1',
				value: 44,
				valueChange: { from: 213, to: 169 },
				message: buildDamageMessage(44, 'Healer1'),
				attribute: EnumAttributeType.Dmg,
			}} />
		</div>
	),
};
