/**
 * 事件分派檢視組件
 * Event dispatch view component
 *
 * 直接渲染上級事件引擎（#/lib/game/battle/event-engine）的輸出：
 * - 技能事件：一張卡片＝一次技能執行，列出「誰 使用了 哪個技能」、由技能定義偵測到的效果，
 *   以及各效果系統實際處理到的紀錄；召喚系統處理後衍生的後續事件（入場）也掛在該系統下。
 * - 一般事件：不依附技能的紀錄（死亡、每回合毒傷、Info…）單獨成列。
 *
 * 本組件只做渲染：分類、偵測、分派、後續事件全數由引擎決定（單一事實來源），
 * 這裡不自行拼接 actor/target/skill 等底層欄位的判定邏輯。
 * Renders the output of the upper event engine:
 * - Skill event: one card = one skill execution — who used which skill, the effects detected from
 *   the skill definition, and the records each effect system actually processed; the follow-up
 *   (entry) events derived by the summon system hang under that system.
 * - General event: records not attached to a skill (death, per-turn poison damage, Info …) get
 *   their own row.
 *
 * This component only renders: classification, detection, dispatch and follow-ups are all decided
 * by the engine (single source of truth); no actor / target / skill field logic is stitched here.
 */
import React from 'react';
import type { IBattleEvent } from '#/lib/types/battle-types';
import {
	EnumEventClass,
	EnumFollowUpType,
	EnumSkillEffect,
	EVENT_TYPE_LABEL,
} from '#/lib/game/battle/event-engine';
import type {
	IBattleEventRecord,
	ISkillDispatch,
	ISkillEvent,
} from '#/lib/game/battle/event-engine';
import './BattleEventDispatch.css';

/** 事件分派檢視屬性 / Event dispatch view props */
export interface IBattleEventDispatchProps
{
	/** 上級事件引擎輸出（兩類涵蓋所有戰鬥紀錄）/ upper event engine output (two classes cover every record) */
	records: readonly IBattleEventRecord[];
	/** 標題（省略＝預設）/ title (falls back to the default when omitted) */
	title?: string;
	/**
	 * 單位對照：事件的 actor／target 為 def no 時提供顯示名稱
	 * Unit name map: supplies display names when an event's actor / target is a def no
	 */
	unitNames?: Readonly<Record<string, string>>;
}

/** 兩類分類標籤（單一事實來源）/ Class labels (single source of truth) */
const CLASS_LABEL: Record<EnumEventClass, string> = {
	[EnumEventClass.Skill]: '技能事件 / Skill',
	[EnumEventClass.General]: '一般事件 / General',
};

/** 效果系統標籤 / Effect system labels */
const EFFECT_LABEL: Record<EnumSkillEffect, string> = {
	[EnumSkillEffect.Damage]: '傷害系統 / Damage',
	[EnumSkillEffect.Heal]: '恢復系統 / Heal',
	[EnumSkillEffect.Poison]: '毒系統 / Poison',
	[EnumSkillEffect.Buff]: '增益系統 / Buff',
	[EnumSkillEffect.Debuff]: '減益系統 / Debuff',
	[EnumSkillEffect.Summon]: '召喚系統 / Summon',
	[EnumSkillEffect.MagicCircle]: '魔方陣系統 / MagicCircle',
	[EnumSkillEffect.Guard]: '守護系統 / Guard',
	[EnumSkillEffect.Miss]: '命中系統 / Miss',
};

/** 後續事件標籤 / Follow-up labels */
const FOLLOW_UP_LABEL: Record<EnumFollowUpType, string> = {
	[EnumFollowUpType.Enter]: '入場事件 Enter',
};

/**
 * 一筆紀錄的摘要（路線、數值、前後 HP、原文）
 * One record's summary (route, value, before/after HP, copy)
 *
 * 名稱先經 unitNames 對照（沒有對照就原樣顯示），其餘欄位有才顯示。
 * Names pass through unitNames first (kept as-is without a match); every other field shows only
 * when present.
 */
function summarize(ev: IBattleEvent, nameOf: (key: string) => string): string
{
	const from = ev.actor !== undefined ? nameOf(ev.actor) : undefined;
	const to = ev.target !== undefined ? nameOf(ev.target) : undefined;
	const route = from !== undefined && to !== undefined && from !== to ? `${from} → ${to}` : (to ?? from);

	const parts: string[] = [];
	if (route !== undefined && route !== '') parts.push(route);
	if (ev.value !== undefined) parts.push(String(ev.value));
	if (ev.hpBefore !== undefined && ev.hpAfter !== undefined) parts.push(`[${ev.hpBefore} → ${ev.hpAfter}]`);
	if (ev.text !== undefined) parts.push(`“${ev.text}”`);
	return parts.join(' ') || '—';
}

/** 效果系統區塊：該系統處理到的紀錄與衍生事件 / One effect system's records and derived events */
const DispatchSection: React.FC<{ dispatch: ISkillDispatch; nameOf: (key: string) => string }> = ({
	dispatch,
	nameOf,
}) => (
	<section className={`dispatch dispatch--${dispatch.effect}`}>
		<h4 className="dispatch__label">{EFFECT_LABEL[dispatch.effect]}</h4>
		<ul className="dispatch__records">
			{dispatch.records.map((ev, index) => (
				<li className="dispatch__record" key={`${ev.type}-${index}`}>
					<span className="dispatch__type">{EVENT_TYPE_LABEL[ev.type]}</span>
					<span className="dispatch__detail">{summarize(ev, nameOf)}</span>
				</li>
			))}
		</ul>
		{dispatch.followUps.length > 0 && (
			<ul className="dispatch__followups">
				{dispatch.followUps.map((followUp, index) => (
					<li className="followup" key={`${followUp.type}-${index}`}>
						<span className="followup__label">後續 / follow-up</span>
						<span className="followup__type">{FOLLOW_UP_LABEL[followUp.type]}</span>
						<span className="followup__detail">
              {followUp.unit !== undefined ? nameOf(followUp.unit) : ''}
							{followUp.level !== undefined ? ` Lv.${followUp.level}` : ''}
            </span>
					</li>
				))}
			</ul>
		)}
	</section>
);

/** 技能事件卡片 / Skill event card */
const SkillEventCard: React.FC<{ event: ISkillEvent; nameOf: (key: string) => string }> = ({
	event,
	nameOf,
}) => (
	<li className="event-card event-card--skill">
		<div className="event-card__head">
			<span className="event-badge event-badge--skill">{CLASS_LABEL[EnumEventClass.Skill]}</span>
			<span className="event-card__sentence">
        <b className="event-card__actor">
          {event.source.actor !== undefined ? nameOf(event.source.actor) : '未知'}
        </b>{' '}
				使用了 <b className="event-card__skill">{event.skillName ?? `技能 #${event.skill}`}</b>
      </span>
		</div>

		{event.effects.length > 0 && (
			<ul className="event-card__effects">
				{event.effects.map((effect) => (
					<li className={`effect-chip effect-chip--${effect}`} key={effect}>
						{EFFECT_LABEL[effect]}
					</li>
				))}
			</ul>
		)}

		<div className="event-card__dispatch">
			{event.dispatch.map((dispatch) => (
				<DispatchSection dispatch={dispatch} nameOf={nameOf} key={dispatch.effect} />
			))}
			{event.dispatch.length === 0 && (
				<p className="event-card__empty">沒有可分派的效果紀錄 / no effect records to dispatch</p>
			)}
		</div>
	</li>
);

/** 一般事件列 / General event row */
const GeneralEventRow: React.FC<{ event: IBattleEvent; nameOf: (key: string) => string }> = ({
	event,
	nameOf,
}) => (
	<li className="event-card event-card--general">
		<span className="event-badge event-badge--general">{CLASS_LABEL[EnumEventClass.General]}</span>
		<span className="event-card__type">{EVENT_TYPE_LABEL[event.type]}</span>
		<span className="event-card__detail">{summarize(event, nameOf)}</span>
	</li>
);

/**
 * 事件分派檢視 / Event dispatch view
 *
 * @param records - 上級事件引擎輸出 / upper event engine output
 * @param title - 標題（省略＝預設）/ title (defaults when omitted)
 * @param unitNames - 單位對照（def no → 顯示名稱）/ unit name map (def no → display name)
 */
export const BattleEventDispatch: React.FC<IBattleEventDispatchProps> = ({
	records,
	title,
	unitNames,
}) =>
{
	const nameOf = (key: string): string => unitNames?.[key] ?? key;
	const skillCount = records.filter((record) => record.class === EnumEventClass.Skill).length;
	const generalCount = records.length - skillCount;

	return (
		<div className="event-dispatch">
			<header className="event-dispatch__head">
				<h2 className="event-dispatch__title">{title ?? '事件分派檢視 / Event Dispatch'}</h2>
				<p className="event-dispatch__summary">
          <span className="event-dispatch__count event-dispatch__count--skill">
            技能事件 {skillCount}
          </span>
					<span className="event-dispatch__count event-dispatch__count--general">
            一般事件 {generalCount}
          </span>
				</p>
			</header>

			<ol className="event-dispatch__list">
				{records.map((record, index) =>
					record.class === EnumEventClass.Skill ? (
						<SkillEventCard event={record} nameOf={nameOf} key={`skill-${record.skill}-${index}`} />
					) : (
						<GeneralEventRow event={record.event} nameOf={nameOf} key={`general-${index}`} />
					),
				)}
			</ol>
		</div>
	);
};
