// Battle UI enums — UI/rendering-layer enums only.
// 本檔只包含 battle scene 渲染層專用 enum（sprite / layout / CSS class / 顯示分類），
// 無對應 domain 概念。Domain enum（EnumPosition / EnumTargetType 等）由各消費者
// 直接從 #/lib/game 匯入，不在這裡 re-export，以免混淆原始來源。
//
// Battle UI enums — UI/rendering-layer enums only. This file holds only scene
// rendering enums (sprite/layout/CSS class/display categories) with no domain
// equivalent. Domain enums are imported directly from #/lib/game by their
// consumers and are NEVER re-exported here, to keep the original source unambiguous.

/** 隊伍側別（UI 顯示層：left/right）/ Team side (UI display layer) */
export enum EnumTeamSideUI {
	Left = 'left',
	Right = 'right',
}

/** 隊伍側 → CSS class（單一事實來源）/ Team side → CSS class */
export enum EnumTeamSideClass {
	Ttd1 = 'ttd1',
	Ttd2 = 'ttd2',
}

/**
 * 單位顯示狀態（對應 lib EnumState）
 * Display unit status (maps to lib EnumState: Alive/Dead/Poison/...).
 */
export enum EnumUnitStatus {
	Alive = 'alive',
	Down = 'down',
	Casting = 'casting',
}

/** 屬性數值顯示分類（UI 專用，無 domain 對應）/ Attribute display category (UI-only) */
export enum EnumAttributeType {
	Dmg = 'dmg',
	Recover = 'recover',
	Support = 'support',
	Charge = 'charge',
	Normal = 'normal',
	/** SP 傷害與中毒（原始 basis.css 的 .spdmg）/ SP damage and poison (the .spdmg of the original basis.css) */
	Spdmg = 'spdmg',
}

/** 標籤演算法位置（UI-only）/ Label placement (UI-only) */
export enum EnumSpriteLabelPlacement {
	Above = 'above',
	Below = 'below',
}

/** 戰場精靈框垂直對齊方式（UI-only）/ Sprite frame vertical alignment (UI-only) */
export enum EnumBattleFieldVAlign {
	Top = 'top',
	Middle = 'middle',
	Bottom = 'bottom',
}

/** 背景圖縮放模式（UI-only）/ Background image scale mode (UI-only) */
export enum EnumBattleFieldBgScale {
	Natural = 'natural',
	Cover = 'cover',
	Contain = 'contain',
	Stretch = 'stretch',
	Repeat = 'repeat',
}

/**
 * 戰鬥動作顯示分類（對應 lib EnumBattleEventType 顯示子集）
 * Action display category (maps to lib EnumBattleEventType).
 */
export enum EnumActionType {
	Skill = 'skill',
	Attack = 'attack',
	Damage = 'damage',
	Heal = 'heal',
	Protect = 'protect',
	Enter = 'enter',
	/** 召喚（施放者＋被召喚單位清單）/ summon (caster + summoned-unit list) */
	Summon = 'summon',
	/** 魔方陣紀錄（施放者＋魔方陣數量）/ magic-circle record (caster + circle amount) */
	MagicCircle = 'magiccircle',
	Casting = 'casting',
	Down = 'down',
	Result = 'result',
	/** SP 傷害（`N SP Damage to target`）/ SP damage (`N SP Damage to target`) */
	SpDamage = 'spdamage',
	/** 回復（`name Recovered N HP/SP`）/ recovery (`name Recovered N HP/SP`) */
	Recover = 'recover',
	/** 吸取（`Drained N HP from target`）/ drain (`Drained N HP from target`) */
	Drain = 'drain',
	/** 持續回復（`gained HP regeneration +N%`、`Auto Regenerate N HP`）/ regeneration */
	Regen = 'regen',
	/** 復活（`name revived!`）/ revive (`name revived!`) */
	Revive = 'revive',
	/** 增益（quicked／casting shorted／barriered）/ buff (quicked / casting shorted / barriered) */
	Buff = 'buff',
	/** 減益（能力下降）/ debuff (stat down) */
	Debuff = 'debuff',
	/** 中毒：施加／每回合傷害／解除 / poison: apply / damage / cure */
	Poison = 'poison',
	/** 屬性升降（`STR rise 10%`、`MAXHP extended to N`）/ stat change */
	StatChange = 'statchange',
	/** 位移（`moved to front.`、`knock backed!`）/ movement (`moved to front.` / `knock backed!`) */
	Move = 'move',
	/** 延遲（`name delayed N.`）/ delay (`name delayed N.`) */
	Delay = 'delay',
	/** 犧牲（`name sacrifice N HP`）/ sacrifice (`name sacrifice N HP`) */
	Sacrifice = 'sacrifice',
	/** 施放失敗（武器不符／SP 不足）/ failed to cast (weapon mismatch / SP shortage) */
	Fail = 'fail',
	/** 未命中（原始日誌的 `Failed!`）/ miss (the original log's `Failed!`) */
	Miss = 'miss',
	/** 升級（`name LevelUp!`）/ level up (`name LevelUp!`) */
	LevelUp = 'levelup',
	/** 掉落道具 / dropped item */
	ItemDrop = 'itemdrop',
	/** 純文字資訊（`Failed!`、`Damage x6!`、`heal x2!`）/ plain info text */
	Info = 'info',
}

/**
 * 魔方陣紀錄種類（對應原始日誌的四種輸出）
 * Magic-circle record kind (mirrors the four outputs of the original log)
 *
 * 來源：HOF/Class/Skill/Effect.php 的「draw／erased enemy」與
 * HOF/Class/Battle/Skill.php 的「use／failed!」。
 * Sources: "draw" / "erased enemy" from HOF/Class/Skill/Effect.php and
 * "use" / "failed!" from HOF/Class/Battle/Skill.php.
 */
export enum EnumMagicCircleKind {
	/** 描繪己方魔方陣（draw MagicCircle xN）/ draw own magic circles */
	Draw = 'draw',
	/** 消除敵方魔方陣（erased enemy MagicCircle xN）/ erase enemy magic circles */
	EraseEnemy = 'eraseEnemy',
	/** 消耗己方魔方陣作為技能代價（use MagicCircle xN）/ consume own magic circles as skill cost */
	Use = 'use',
	/** 魔方陣不足而失敗（failed!）/ failed for lack of magic circles */
	Fail = 'fail',
}

/**
 * 蓄力種類（對應 lib EnumExpect Charge/Cast）
 * Charge kind (maps to lib EnumExpect: Charge/Cast).
 */
export enum EnumChargeKind {
	Charging = 'charging',
	Casting = 'casting',
}

/**
 * 技能類型（UI 顯示層；lib 以 EnumSkillDamageType 表示：Physical=0／Magic=1）
 * Skill type (UI layer; lib uses EnumSkillDamageType: Physical = 0 / Magic = 1).
 */
export enum EnumSkillType {
	Physical = 'physical',
	Magic = 'magic',
}

/** 精靈圖資料夾（UI-only）/ Sprite image directory (UI-only) */
export enum EnumSpriteImageDir {
	Char = 'char',
	CharRev = 'char_rev',
	Other = 'other',
}

/** 精靈顯示模式（UI-only）/ Sprite display variant (UI-only) */
export enum EnumSpriteVariant {
	Boxed = 'boxed',
	Raw = 'raw',
	Original = 'original',
	Avatar = 'avatar',
}

/** 精靈尺寸（UI-only）/ Sprite size (UI-only) */
export enum EnumSpriteSize {
	Small = 'small',
	Normal = 'normal',
	Large = 'large',
}

/** 展示頁流程階段（UI-only）/ Showcase flow phase (UI-only) */
export enum EnumShowcasePhase {
	Setup = 'setup',
	Result = 'result',
}


