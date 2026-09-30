/**
 * 戰鬥相關 enum / Battle-related enums
 * 單一事實來源：陣營、狀態、站位、預期行為、守種類與戰鬥事件相關列舉集中於本檔。
 * Single source of truth: team side, state, row, expectation, guard kind and battle-event
 * enums are grouped here.
 */

/**
 * 陣營側別 / Battle team side
 * 使用數值枚舉取代字串字面量，徹底消除 TEAM_0='0' / TEAM_1='1' 設計。
 * Uses numeric enum instead of string literals.
 */
export enum EnumTeamSide
{
	/** 陣營 0 / Team side 0 */
	Team0 = 0,
	/** 陣營 1 / Team side 1 */
	Team1 = 1,
}

/**
 * 角色狀態列舉 / Character state enumeration
 */
export enum EnumState
{
	/** 存活 / alive */
	Alive = 0,
	/** 死亡 / dead */
	Dead = 1,
	/** 中毒（CurePoison 判定所用狀態）/ poisoned (state checked by CurePoison) */
	Poison = 2,
	/** 二階中毒（目前無任何使用點）/ secondary poison (currently unused anywhere) */
	Poison2 = 3,
	/** 一般狀態（未中毒也未死亡）/ normal (neither poisoned nor dead) */
	Normal = 4,
}

/**
 * 隊伍位置列舉 / Formation position enumeration
 */
export enum EnumPosition
{
	/** 前衛（可守護後衛）/ front row (can guard the back row) */
	Front = 'front',
	/** 後衛（受前衛守護）/ back row (protected by front-row guard) */
	Back = 'back',
}

/**
 * 預期行為列舉 / Expected action enumeration
 */
export enum EnumExpect
{
	/** 蓄力預期 / charge expected */
	Charge = 'charge',
	/** 詠唱預期 / cast expected */
	Cast = 'cast',
}

/**
 * 防禦種類 / Guard kind
 *
 *
 * 決定前排守護者「何時替後排擋傷」（由 guard.ts guardActive() 逐次判定）：
 * Decides when a front-row guardian intercepts damage for the back row (re-evaluated per hit by guard.ts guardActive()):
 * - LifeNN：守護者自身 HP% <= NN 時生效（血量越低越常守）
 *   LifeNN: active while the guardian's own HP% <= N (guards more as HP drops)
 * - ProbNN：每次攻擊獨立擲骰 NN% 機率生效（需具備 rng，否則視為不發動）
 *   ProbNN: rolls an independent NN% chance per attack (requires rng; treated as inactive without it)
 * - Always/Never：恆真／恆假；behavior.guard 省略時預設 Always
 *   Always/Never: always true / always false; defaults to Always when behavior.guard is absent
 */
export enum EnumGuardKind
{
	/** 恆常發動 / Always active */
	Always = 'always',
	/** HP ≤ 25% 時發動 / Active while HP ≤ 25% */
	Life25 = 'life25',
	/** HP ≤ 50% 時發動 / Active while HP ≤ 50% */
	Life50 = 'life50',
	/** HP ≤ 75% 時發動 / Active while HP ≤ 75% */
	Life75 = 'life75',
	/** 25% 機率發動 / 25% chance to activate */
	Prob25 = 'prob25',
	/** 50% 機率發動 / 50% chance to activate */
	Prob50 = 'prob50',
	/** 75% 機率發動 / 75% chance to activate */
	Prob75 = 'prob75',
	/** 從不發動 / Never active */
	Never = 'never',
}

/**
 * 戰鬥事件類型 / Battle event type
 *
 *
 * 生產點（見各成員註解）/ Producers (see each member):
 * - Battle.UseSkill → Act、Cast、Death、MagicCircle、Summon、Info（無目標失敗）
 * - skill/effect（applySkill／statusChanges）→ Damage、Heal、Guard、Buff、Debuff、Poison（施毒成功）、
 *   Move（statusChanges 帶 move／knockback 且站位真的改變時）
 * - skill/SkillEffect（特例分支與 default 的延遲／回復欄位）→ SpDamage、SpHeal、Drain、Revive、
 *   Move、Delay、Quick、CastShort、BarrierGain、EnergyExchange、PoisonResist、Regen、StatChange、
 *   Info（over-cap／multiply／heal-multiply 標記）、Miss（2032 失敗）、Poison（解毒 cured）
 * - Battle.Action → Poison（每回合毒傷，不帶 skill，故屬一般事件）
 * - 無生產點：Charge（蓄力開始以 Cast 記錄）
 * - No producer: Charge (a charge start is recorded as Cast).
 */
export enum EnumBattleEventType
{
	/** 造成傷害 / damage dealt */
	Damage = 'damage',
	/** 回復 HP / HP heal */
	Heal = 'heal',
	/** 守護攔截（前衛替後衛擋傷）/ guard interception (front row shields back row) */
	Guard = 'guard',
	/**
	 * 增益（Up* 與 Plus* 能力變化）/ buff (Up* and Plus* stat change)
	 * statusChanges 生產（任一 Up*／Plus* 生效時，每次施放對同一目標記一筆；事件不帶原文）
	 * produced by statusChanges (one record per target per cast when any Up* / Plus* applied; carries no copy)
	 */
	Buff = 'buff',
	/**
	 * 減益（Down* 能力變化）/ debuff (Down* stat change)
	 * statusChanges 生產（任一 Down* 生效時，每次施放對同一目標記一筆；事件不帶原文）
	 * produced by statusChanges (one record per target per cast when any Down* applied; carries no copy)
	 */
	Debuff = 'debuff',
	/**
	 * 中毒狀態 / poison state
	 * 三個生產點：statusChanges（施毒成功，帶 skill）、SkillEffect（解毒成功，text='cured' token、
	 * 帶 skill）與 Battle.Action（每回合毒傷，帶 value 與前後 HP、不帶 skill）
	 * three producers: statusChanges (poison applied; carries the skill), SkillEffect (poison cured;
	 * text = the 'cured' token and the skill) and Battle.Action (per-turn poison damage; carries
	 * the value plus before/after HP and no skill)
	 */
	Poison = 'poison',
	/** 死亡 / death */
	Death = 'death',
	/** 施放技能 / skill cast */
	Cast = 'cast',
	/** 實際行動（技能施放成功，非蓄力開始） / actual action (skill executed, not charge start) */
	Act = 'act',
	/**
	 * 詠唱／蓄力開始 / charge (cast time) started
	 * 目前無生產點：蓄力開始改以 Cast 記錄（chargeKindOf 決定 casting／charging）
	 * no producer yet: a charge start is recorded as Cast instead (chargeKindOf picks the kind)
	 */
	Charge = 'charge',
	/**
	 * 魔方陣增減 / magic circle change
	 * Battle.UseSkill 生產（技能帶任一 MagicCircle* 欄位時，每次施放一筆；value 省略，
	 * 數量與種類由展示層依技能定義回推）
	 * produced by Battle.UseSkill (one record per cast when the skill carries any MagicCircle*
	 * field; no `value` — the display derives amount and kind from the skill definition)
	 */
	MagicCircle = 'magiccircle',
	/**
	 * 召喚 / summon
	 * Battle.UseSkill 生產（target＝被召喚單位 def no、value＝等級，單位加入施放者隊伍）
	 * produced by Battle.UseSkill (target = the summoned unit's def no, value = its level; the unit
	 * joins the caster's team)
	 */
	Summon = 'summon',
	/**
	 * 未命中 / miss
	 * SkillEffect 生產（2032 判定失敗時；無 actor 的裸失敗經展示層印成 `Failed!`）
	 * produced by SkillEffect (when the 2032 judgement fails; a bare failure without an actor is
	 * printed by the display as `Failed!`)
	 */
	Miss = 'miss',
	/**
	 * 一般資訊訊息 / informational message
	 * 兩個生產點：Battle.UseSkill（選不到目標時的 no-target 失敗）與 SkillEffect（over-cap 補正、
	 * Damage xN!、heal xN!），`text` 為結構化 token，文案由展示層 EnumLogCopy 解析
	 * two producers: Battle.UseSkill (the no-target failure when no unit can be selected) and
	 * SkillEffect (over-cap correction, Damage xN!, heal xN!); `text` is a structured token and
	 * the display layer resolves it through EnumLogCopy
	 */
	Info = 'info',
	/**
	 * SP 傷害 / SP damage
	 * SkillEffect 生產（2030／2031 踏破、3012 LifeConvert 等扣 SP 特例；value＝傷害量、
	 * hpBefore/hpAfter 帶 SP 前後值、unit='sp'）
	 * produced by SkillEffect (the SP-deducting specials 2030 / 2031 / 3012 etc.; `value` is the
	 * damage, hpBefore/hpAfter carry the SP before/after and unit = 'sp')
	 */
	SpDamage = 'spdamage',
	/**
	 * SP 回復 / SP heal
	 * SkillEffect 生產（2090／2091、3010／3011 等回復 SP 特例；unit='sp'）
	 * produced by SkillEffect (the SP-healing specials 2090 / 2091 / 3010 / 3011; unit = 'sp')
	 */
	SpHeal = 'spheal',
	/**
	 * 吸取（HP 吸收）/ drain (HP absorb)
	 * SkillEffect 生產（1200／3901／5002 等 AbsorbHP；valueChanges 依序帶 target 與 actor 的
	 * HP 前後值，展示層印成 `from 目標(targetFrom => targetTo)行動者(actorFrom => actorTo)`）
	 * produced by SkillEffect (AbsorbHP in 1200 / 3901 / 5002; `valueChanges` carries the target's
	 * then the actor's HP before/after, which the display prints as
	 * `from target(tFrom => tTo)actor(aFrom => aTo)`)
	 */
	Drain = 'drain',
	/**
	 * 復活 / revive
	 * SkillEffect 生產（3040／5030／5063 蘇生特例、2056 對死亡目標的 GetNormal，以及 heal 前
	 * 偵測到目標為 Dead 的一般回復；actor＝target＝復活者）
	 * produced by SkillEffect (the revive specials 3040 / 5030 / 5063, 2056's GetNormal on a dead
	 * target, and a plain heal that found its target Dead; actor = target = the revived unit)
	 */
	Revive = 'revive',
	/**
	 * 位移（前後衛）/ row movement (front/back)
	 * SkillEffect 生產：statusChanges 帶 move／knockback 欄位且站位真的改變時，
	 * `text` 為 token（front/back/knockback/forward），僅在改變當下記一筆
	 * produced by SkillEffect: when statusChanges carries a move / knockback field and the row
	 * actually changes; `text` is a token (front/back/knockback/forward) and one record is kept
	 * only for a real change
	 */
	Move = 'move',
	/**
	 * 行動延遲 / action delayed
	 * SkillEffect 生產（skill.delay 的 DelayChar、2110／2111 延遲技、3050／3055 的 DelayCut）；
	 * value＝速率（rate%），valueChanges 帶 delay 前後值（引擎累積制分數）
	 * produced by SkillEffect (DelayChar for skill.delay, the delay skills 2110 / 2111, and
	 * 3050 / 3055's DelayCut); `value` is the rate (%) and valueChanges carries the delay
	 * before/after (the engine's accumulated score)
	 */
	Delay = 'delay',
	/**
	 * 加速（立即行動）/ quick (act now)
	 * SkillEffect 生產（3050 Quick、召喚技能帶 quick 時讓召喚物立即行動）
	 * produced by SkillEffect (3050 Quick, and a summon skill's `quick` flag letting the summoned
	 * unit act immediately)
	 */
	Quick = 'quick',
	/**
	 * 施法縮短 / cast time shortened
	 * SkillEffect 生產（3055 CastAsist：目標在詠唱中才生效）
	 * produced by SkillEffect (3055 CastAsist: only fires while the target is casting)
	 */
	CastShort = 'castshort',
	/**
	 * 取得障壁 / barrier gained
	 * SkillEffect 生產（3060 HolyShield／5067 BananaProtection：無障壁時取得）
	 * produced by SkillEffect (3060 HolyShield / 5067 BananaProtection: gained only when the
	 * target has no barrier yet)
	 */
	BarrierGain = 'barriergain',
	/**
	 * HP/SP 比率交換 / HP and SP rate exchange
	 * SkillEffect 生產（3013 EnergyExchange；valueChanges 帶 hp 與 sp 兩組前後值，
	 * 展示層以交換前比率計算 8 欄紀錄）
	 * produced by SkillEffect (3013 EnergyExchange; valueChanges carries the hp and sp before/after
	 * pairs and the display builds its 8-field record from the pre-exchange rates)
	 */
	EnergyExchange = 'energyexchange',
	/**
	 * 取得中毒抗性 / poison resistance gained
	 * SkillEffect 生產（1220 AntiPoisoning；value＝取得後的總 PoisonResist%）
	 * produced by SkillEffect (1220 AntiPoisoning; `value` is the total PoisonResist % after gain)
	 */
	PoisonResist = 'poisonresist',
	/**
	 * 設定持續回復 / regeneration configured
	 * SkillEffect 生產（技能帶 HpRegen／SpRegen 欄位；unit＝資源、value＝%）
	 * produced by SkillEffect (the skill carries HpRegen / SpRegen; unit is the resource and value
	 * is the %)
	 */
	Regen = 'regen',
	/**
	 * 上限能力變化 / cap stat changed
	 * SkillEffect 生產（3020 ManaExtend 等 MAX* 上限的特例變動）
	 * produced by SkillEffect (the MAX-cap specials such as 3020 ManaExtend)
	 */
	StatChange = 'statchange',
}

/**
 * 數值變化的資源維度 / Resource dimension of a value change
 *
 *
 * IBattleValueChange.unit 與 IBattleEvent.unit 共用，取代裸字串 'hp' / 'sp' / 'delay'。
 * Shared by IBattleValueChange.unit and IBattleEvent.unit, replacing the bare
 * strings 'hp' / 'sp' / 'delay'.
 */
export enum EnumResource
{
	/** 生命值 / HP */
	Hp = 'hp',
	/** 技能值 / SP */
	Sp = 'sp',
	/** 延遲分數 / delay score */
	Delay = 'delay',
}

/**
 * 數值變化的歸屬 / Owner of a value change
 *
 *
 * 取代裸字串 'actor' / 'target'，指明這段變化是行動者還是目標的。
 * Replaces the bare strings 'actor' / 'target'; says whether the change is
 * on the actor or the target.
 */
export enum EnumValueWho
{
	/** 行動者自身 / the actor itself */
	Actor = 'actor',
	/** 目標 / the target */
	Target = 'target',
}

/**
 * 資訊事件的結構化 token / Structured token of an Info event
 *
 *
 * 「文字類」事件（Damage x6!／heal x2!／over-cap 等）的 text 不是可顯示字串，而是一個 token，
 * 展示層依 token 選 EnumLogCopy 成員或 buildXxx 建構器；SkillEffect 生產、battle-adapter
 * 消費雙方共用，取代裸字串。
 * An Info event's `text` is not display copy but a token that the display maps to an EnumLogCopy
 * member or a buildXxx builder, shared by the producer (SkillEffect) and the consumer
 * (battle-adapter) instead of bare strings.
 */
export enum EnumInfoText
{
	/** 超過上限 / over capacity */
	OverCap = 'over-cap',
	/** 傷害倍數 / damage multiplier */
	Multiply = 'multiply',
	/** 回復倍數 / heal multiplier */
	HealMultiply = 'heal-multiply',
	/** 無目標 / no target */
	NoTarget = 'no-target',
}

/**
 * 位移事件的結構化 token / Structured token of a Move event
 *
 *
 * 取代裸字串 'front' / 'back' / 'knockback' / 'forward'。
 * Replaces the bare strings 'front' / 'back' / 'knockback' / 'forward'.
 */
export enum EnumMoveText
{
	/** 前方 / front */
	Front = 'front',
	/** 後方 / back */
	Back = 'back',
	/** 擊退 / knockback */
	Knockback = 'knockback',
	/** 前進 / forward */
	Forward = 'forward',
}
