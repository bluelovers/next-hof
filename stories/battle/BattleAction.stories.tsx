/**
 * BattleAction 個別展示
 * BattleAction individual showcase
 *
 * 各種戰鬥行動/技能的日誌條目（展示資料集中於 fixture）
 * Various battle action/skill log entry types (showcase data lives in the fixture)
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleActionDarkDecorator } from '../decorators';
import { BattleAction } from '../../src/components/battle/BattleAction';
import {
	skillAttackAction,
	normalAttackAction,
	damageDealtAction,
	protectAction,
	unitEntranceAction,
	summonAction,
	castingAction,
	unitDownAction,
	healAction,
	spDamageAction,
	drainAction,
	recoverSpAction,
	regenAction,
	reviveAction,
	buffAction,
	castShortAction,
	quickAction,
	statChangeAction,
	moveAction,
	delayAction,
	poisonAction,
	poisonDamageAction,
	poisonCureAction,
	poisonResistAction,
	poisonSelfAction,
	missAction,
	infoAction,
	healCountInfoAction,
	energyExchangeAction,
	logSequenceActions,
} from '../fixture/battleActions';

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
	args: { action: skillAttackAction },
};

/** 普通攻擊 / Normal attack */
export const NormalAttack: Story = {
	args: { action: normalAttackAction },
};

/** 傷害 / Damage */
export const DamageDealt: Story = {
	args: { action: damageDealtAction },
};

/** 保護 / Protect */
export const ProtectAction: Story = {
	args: { action: protectAction },
};

/** 單位入場 / Unit entrance */
export const UnitEntrance: Story = {
	args: { action: unitEntranceAction },
};

/** 召喚：GraveYard 召喚 3 隻木乃伊 / Summon: GraveYard summons 3 mummies */
export const SummonAction: Story = {
	args: { action: summonAction },
};

/** 詠唱 / Casting */
export const CastingAction: Story = {
	args: { action: castingAction },
};

/** 單位陣亡 / Unit down */
export const UnitDown: Story = {
	args: { action: unitDownAction },
};

/** 回復 / Heal */
export const HealAction: Story = {
	args: { action: healAction },
};

// ==================== SkillEffect 移植帶來的行動型別 ====================

/** SP 傷害（行首無施放者名稱）/ SP damage (no caster name at the head) */
export const SpDamageAction: Story = {
	args: { action: spDamageAction },
};

/** 吸取 / Drain */
export const DrainAction: Story = {
	args: { action: drainAction },
};

/** SP 回復 / SP heal */
export const RecoverSpAction: Story = {
	args: { action: recoverSpAction },
};

/** 持續回復 / Regeneration */
export const RegenAction: Story = {
	args: { action: regenAction },
};

/** 復活（`Hero1 revived!`，只有 revived 上 recover 色）/ Revive (`Hero1 revived!`) */
export const ReviveAction: Story = {
	args: { action: reviveAction },
};

/** 增益：障壁（三句皆 support 色）/ Buff: barrier */
export const BuffAction: Story = {
	args: { action: buffAction },
};

/** 施法縮短 / Cast shortened */
export const CastShortAction: Story = {
	args: { action: castShortAction },
};

/** 加速 / Quick */
export const QuickAction: Story = {
	args: { action: quickAction },
};

/** 上限變化（`MAXSP extended to 400`，原始日誌無 span）/ Cap change */
export const StatChangeAction: Story = {
	args: { action: statChangeAction },
};

/** 位移（`moved to front.`，原始日誌無 span）/ Move */
export const MoveAction: Story = {
	args: { action: moveAction },
};

/** 延遲 / Delay */
export const DelayAction: Story = {
	args: { action: delayAction },
};

/** 中毒施加（`get poisoned!`，只有 poisoned 上 spdmg 色）/ Poison applied */
export const PoisonAction: Story = {
	args: { action: poisonAction },
};

/** 每回合毒傷（帶前後 HP）/ Per-turn poison damage */
export const PoisonDamageAction: Story = {
	args: { action: poisonDamageAction },
};

/** 解毒（所有格片段不加空格、無 span）/ Cure */
export const PoisonCureAction: Story = {
	args: { action: poisonCureAction },
};

/** 抗毒（support 色）/ Poison resist */
export const PoisonResistAction: Story = {
	args: { action: poisonResistAction },
};

/** 自我中毒（無主詞無 span）/ Self-poison */
export const PoisonSelfAction: Story = {
	args: { action: poisonSelfAction },
};

/** 未命中（無施放者時整段即 `Failed!`）/ Miss without an actor */
export const MissAction: Story = {
	args: { action: missAction },
};

/** 純文字資訊（`Damage x6!`，無主詞無 span）/ Plain info */
export const InfoAction: Story = {
	args: { action: infoAction },
};

/** 回復倍數資訊（`heal x2!`）/ Heal multiplier info */
export const HealCountInfoAction: Story = {
	args: { action: healCountInfoAction },
};

/** HP/SP 交換（3 行區塊）/ HP/SP exchange (3-line block) */
export const EnergyExchangeAction: Story = {
	args: { action: energyExchangeAction },
};

/** 多行日誌範例展示 / Multiple log entries example */
export const LogSequence: Story = {
	render: () => (
		<div>
			{logSequenceActions.map((action, index) => (
				<BattleAction key={index} action={action} />
			))}
		</div>
	),
};