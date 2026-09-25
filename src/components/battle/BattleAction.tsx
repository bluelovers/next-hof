/**
 * 戰鬥行動組件
 * Battle action component
 *
 * 顯示單一技能/攻擊/行動的日誌條目（含召喚 Summon 與魔方陣 MagicCircle）
 * Displays a single skill/attack/action log entry (summon and magic circle included)
 */
import React from 'react';
import type { IBattleAction, IValueChangeRecord } from './types';
import './BattleAction.css';
import '#/components/shared/SharedBase.css';
import { SkillIcon } from '#/components/shared/SkillIcon';
import type { IStyleProps, IStylePropsRequired, ITSRequiredWith2 } from '#/components/shared/types';
import { CharacterSprite } from '#/components/characters/CharacterSprite';
import { EnumSpriteVariant, EnumMagicCircleKind } from './enums';
import { EnumActionType } from './enums';
import {
  getAttrClass,
  getValueChangeClass,
  getEnterBattlefieldText,
  MAGIC_CIRCLE_PHRASE,
  getMagicCircleClass,
  getMessageClass,
  splitNamedMessage,
  buildChargeMessage,
} from './battleUtils';

/** 戰鬥行動屬性 / Battle action props */
export interface IBattleActionProps {
  /** 行動資料 / Action data */
  action: IBattleAction;
}

// ==================== 子組件 / Sub-components ====================

/**
 * 值變化描述（單一事實來源）
 * Value change description (single source of truth)
 *
 * 同時支援「預組好的字串」與「n1→n2」兩種輸入；who 缺省時只印 `(n1 > n2)`，提供時以
 * 粗體名牌呈現（`who(n1 > n2)`），兩者皆無前導空白以對齊原始日誌。括號與數值變化內容
 * 一律由此處組裝，呼叫方無需自行拼接。
 * Supports both a pre-assembled string and an n1→n2 pair; `who` is optional and, when
 * present, is shown as a bold label (`who(n1 > n2)`). Either way has no leading space,
 * mirroring the original log. The parentheses and the change copy are always assembled
 * here so callers never concatenate them by hand.
 */
const ValueChange: React.FC<{
  valueChange?: string;
  from?: number;
  to?: number;
  who?: string;
  type?: EnumActionType;
}> = ({ valueChange, from, to, who, type }) => {
  const text =
    valueChange !== undefined
      ? valueChange
      : from !== undefined && to !== undefined
        ? `${from} > ${to}`
        : undefined;
  if (text === undefined) return null;
  const valClass = getValueChangeClass(type);
  return (
    <span className={valClass}>
      {who && <span className="bold">{who}</span>}
      ({text})
    </span>
  );
};

/**
 * 多重數值變化列表（單一事實來源；內部統一委託 ValueChange）
 * Multi value-change list (single source of truth; delegates to ValueChange internally)
 *
 * 對照 Skill/Effect.php 的 `Drained N HP from 敵人(1500 > 1200)我方(800 > 1100)`：每一筆
 * IValueChangeRecord 委託 ValueChange 渲染，本元件不自行組裝括號或名牌。
 * Mirrors Skill/Effect.php's multi-(who(n1>n2)) drain line; each IValueChangeRecord is
 * delegated to ValueChange, so this component never assembles the parentheses or labels.
 */
const ValueChanges: React.FC<{ changes?: IValueChangeRecord[]; type?: EnumActionType }> = ({
  changes,
  type,
}) => (
  <>
    {changes?.map((vc, i) => (
      <>
        {((i > 0) ? ' ' : null)}
        <ValueChange key={i} from={vc.from} to={vc.to} who={vc.who} type={type} />
      </>
    ))}
  </>
);

/**
 * 入場訊息（單一事實來源）
 * Enter battlefield message (single source of truth)
 */
const EnterMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <ActionLine
    className={`result ${getAttrClass(action.attribute)}`}
    who={action.source}
    message={getEnterBattlefieldText(action.level)}
  />
);

/**
 * 退場訊息（`name Lv.N leave the Battlefield.`，dmg 色；對照 Battle.php）
 * Leave message (`name Lv.N leave the Battlefield.`, dmg colour; mirrors Battle.php)
 */
const LeaveMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <ActionLine
    className="dmg"
    who={action.source}
    message={getEnterBattlefieldText(action.level, true)}
  />
);

/**
 * 技能/攻擊訊息（單一事實來源）
 * Skill/attack message (single source of truth)
 */
const SkillMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <div className="u">
    <span className="bold">{action.source}</span>
    <SkillIcon
      iconUrl={action.skill?.iconUrl}
      name={action.skill?.name ?? ''}
      size={18}
      className="skill-icon"
    />
    {action.skill?.name}
  </div>
);

/** 行動訊息行 props（樣式欄位繼承自 IStyleProps）/ Action line props (style fields inherited from IStyleProps) */
type IActionLineProps = IStyleProps & {
  /** 主詞之前的前置內容（與 who 無關，who 缺省時仍輸出）/ Content before the subject (independent of `who`, printed even when `who` is absent) */
  preMessage?: React.ReactNode;
  /** 加粗主詞（名稱等）/ Bold subject (name, etc.) */
  who?: React.ReactNode;
  /** 訊息內容（字串或任意合法節點）/ Message content (string or any valid node) */
  message: React.ReactNode;
  /** 訊息之後的後綴內容 / Suffix rendered after the message */
  children?: React.ReactNode;
}

/**
 * 行動訊息行（單一事實來源）
 * Action log line (single source of truth)
 */
export function ActionLine<R extends keyof IActionLineProps = 'message'>(
  props: ITSRequiredWith2<IActionLineProps, NoInfer<R>>
) {
  const { preMessage, who, message, className, style, children } = props as IActionLineProps;

  return (
    <span className={className} style={style}>
      {preMessage ?? null}
      {who != null ? (
        <>
          <span className="bold">{who}</span>
          {' '}
        </>
      ) : null}
      {message}
      {children ?? null}
    </span>
  );
}

/**
 * 召喚訊息（單一事實來源）
 * Summon message (single source of truth)
 *
 * 仿原始戰鬥日誌：施放者＋技能圖示/名稱，其後每個被召喚單位各列一列——
 * 「圖像 名稱 joined to the team. 名稱 Lv.N enter the Battlefield.」；
 * 無圖像（imageUrl 缺省）時省略圖像，無等級（level 缺省）時省略「Lv.N」。
 * Mirrors the original battle log: caster + skill icon/name, then one row per summoned
 * unit — "image name joined to the team. name Lv.N enter the Battlefield."; the image is
 * dropped when `imageUrl` is absent and "Lv.N" when `level` is absent.
 */
const SummonMessage: React.FC<{ action: IBattleAction }> = ({ action }) => {
  const attrClass = getAttrClass(action.attribute);
  return (
    <>
      <SkillMessage action={action} />
      {action.summoned?.map((unit, i) => (
        <div className="summoned-unit" key={`${unit.name}-${i}`}>
          {unit.imageUrl && (
            <CharacterSprite
              url={unit.imageUrl}
              variant={EnumSpriteVariant.Avatar}
              alt={unit.name}
              className="summoned-unit-sprite"
            />
          )}
          {/* 入隊句由 ActionLine 渲染（who＝名稱、message＝入隊文案），
              後綴 children 接續 EnterMessage 的入場句（單一事實來源）。
              The join clause is rendered by ActionLine (who = name, message = join copy);
              the follow-up enter clause comes from EnterMessage (single source of truth). */}
          <ActionLine who={unit.name} message="joined to the team." className={attrClass}>
            <br />
            <EnterMessage
              action={{ ...action, type: EnumActionType.Enter, source: unit.name, level: unit.level }}
            />
          </ActionLine>
        </div>
      ))}
    </>
  );
};

/**
 * 魔方陣紀錄訊息（單一事實來源）
 * Magic-circle record message (single source of truth)
 *
 * 文案取自 MAGIC_CIRCLE_PHRASE、配色取自 getMagicCircleClass，與轉接層共用同一份
 * 原始日誌字串；名稱加粗（對應 PHP 的 $char->Name('bold')）。
 * Copy comes from MAGIC_CIRCLE_PHRASE and the colour from getMagicCircleClass, sharing one
 * set of original log strings with the adapter layer; the name is bolded to mirror PHP's
 * $char->Name('bold').
 *
 * Fail 種類在原始日誌中沒有施放者名稱、也沒有數量，故只輸出文案本身。
 * The Fail kind has neither a caster name nor an amount in the original log, so only the
 * copy itself is emitted.
 */
const MagicCircleMessage: React.FC<{ action: IBattleAction }> = ({ action }) => {
  const kind = action.magicCircle?.kind ?? EnumMagicCircleKind.Draw;
  const amount = action.magicCircle?.amount;
  const cls = getMagicCircleClass(kind);
  // 原始日誌（`draw`/`erased enemy` 於 Skill/Effect.php、`use` 於 Battle/Skill.php）：
  // 名稱保持預設色，只有動作文案（含 ` xN`）上色；Fail 種類沒有施放者，整段即文案本身。
  // The original log (draw/erased enemy in Skill/Effect.php, use in Battle/Skill.php) keeps
  // the name in the default colour and only the action phrase (including ` xN`) is coloured;
  // the Fail kind has no caster so the whole string is just the phrase itself.
  if (kind === EnumMagicCircleKind.Fail) {
    return <ActionLine className={cls} message={MAGIC_CIRCLE_PHRASE[kind]} />;
  }
  return (
    <ActionLine
      who={action.source}
      message={
        <span className={cls}>
          {amount !== undefined
            ? `${MAGIC_CIRCLE_PHRASE[kind]} x${amount}`
            : MAGIC_CIRCLE_PHRASE[kind]}
        </span>
      }
    />
  );
};

/** 通用「粗體名稱 ＋ 其後文字」版面 props（樣式欄位繼承自 IStyleProps）/ Shared layout props (style fields inherited from IStyleProps) */
interface INamedMessageProps extends IStyleProps {
  action: IBattleAction;
}

/**
 * 通用「粗體名稱 ＋ 其後文字」版面（單一事實來源）
 * Shared "bold name + trailing text" layout (single source of truth)
 *
 * 名稱與文字由 splitNamedMessage 從 message 還原，文案則一律由 battleUtils 的建構器
 * 產生，因此各家族訊息組件只需指定配色；行本身交給 ActionLine 組裝（前置、粗體名稱、
 * 文字、數值變化依序輸出）。
 * splitNamedMessage recovers the name and the text from `message`, and battleUtils'
 * builders always produce the copy, so each family component only has to pick a colour;
 * the line itself is assembled by ActionLine (prefix, bold name, text, value change in order).
 */
const NamedMessage: React.FC<INamedMessageProps> = ({ action, className, style }) => {
  const { name, text } = splitNamedMessage(action);
  return (
    <ActionLine
      className={className}
      style={style}
      preMessage={action.prefix}
      who={name}
      message={
        <>
          {text}
          <ValueChange valueChange={action.valueChange} type={action.type} />
        </>
      }
    />
  );
};

/** 「粗體名稱 ＋ 文字 ＋ 粗體數值 ＋ 單位」版面 props（樣式欄位繼承自 IStyleProps）/ Named-value layout props (style fields inherited from IStyleProps) */
interface INamedValueMessageProps extends IStyleProps {
  action: IBattleAction;
  text: string;
}

/**
 * 「粗體名稱 ＋ 文字 ＋ 粗體數值 ＋ 單位」版面（Recovered／Heal／Auto Regenerate）
 * "bold name + text + bold value + unit" layout (Recovered / Heal / Auto Regenerate)
 *
 * 對照原始日誌：名稱保持預設色，只有「text 數值 單位」上色（`name Recovered N HP`、
 * `* name Auto Regenerate N HP`），故名稱在色塊之外。heal 類型的名稱取受療者（target）
 * 而非施療者（source），與 `name Recovered N HP` 的語意一致。
 * Mirrors the original log: the name keeps the default colour and only "text value unit" is
 * coloured (`name Recovered N HP`, `* name Auto Regenerate N HP`), so the name sits outside
 * the colour span. For `heal` the name is the healed unit (`target`), not the healer
 * (`source`), matching `name Recovered N HP`.
 *
 * 缺少 value 時退回 NamedMessage（直接輸出 message，保證文案不丟失）。
 * Falls back to NamedMessage when `value` is absent so the copy is never dropped.
 *
 * 行由 ActionLine 組裝，但 className/style 只掛在「前綴」與「數值區」兩個色塊上：
 * ActionLine 的外層 span 刻意不帶 class，才能維持名稱在色塊之外的配色。
 * ActionLine assembles the line, but className/style stay on the prefix and value colour
 * spans: the outer span deliberately carries no class, which is what keeps the name outside
 * the colour block.
 */
const NamedValueMessage: React.FC<INamedValueMessageProps> = ({
  action,
  className,
  style,
  text,
}) => {
  if (action.value === undefined) return <NamedMessage action={action} className={className} style={style} />;
  const name = action.type === EnumActionType.Heal ? action.target : action.source;
  return (
    <ActionLine
      who={name}
      preMessage={
        action.prefix ? (
          <span className={className} style={style}>
            {action.prefix}
          </span>
        ) : undefined
      }
      message={
        <>
          <span className={className} style={style}>
            {text}{' '}
            <span className="bold">{action.value}</span>
            {action.valueUnit && ` ${action.valueUnit}`}
          </span>
          <ValueChange valueChange={action.valueChange} type={action.type} />
        </>
      }
    />
  );
};

/**
 * SP 傷害訊息（單一事實來源）
 * SP damage message (single source of truth)
 *
 * 原始日誌：`<b>N</b>SP Damage to <b>target</b>`，數值與「SP Damage」之間無空格。
 * Original log: `<b>N</b>SP Damage to <b>target</b>` with no space between the value and
 * "SP Damage".
 */
const SpDamageMessage: React.FC<{ action: IBattleAction }> = ({ action }) => {
  const cls = getMessageClass(action);
  // 原始日誌：`<b>N</b>SP Damage to <b>target</b>`，僅數值與「SP Damage」上 spdmg 色，
  // `to target` 與 `(前 > 後)` 維持預設色（色塊在 `to` 之前結束）。
  // Original log: `<b>N</b>SP Damage to <b>target</b>` — only the value and "SP Damage" are
  // spdmg, while `to target` and `(from > to)` stay default (the colour span ends before "to").
  return (
    <>
      <span className={cls}>
        <span className="bold">{action.value}</span>SP Damage
      </span>
      {action.target && <> to <span className="bold">{action.target}</span></>}
      <ValueChange valueChange={action.valueChange} type={action.type} />
    </>
  );
};

/**
 * 吸取訊息（單事實來源）
 * Drain message (single source of truth)
 *
 * 原始日誌：`Drained <b>N</b> HP from <b>target</b>`（行首無施放者名稱）。
 * Original log: `Drained <b>N</b> HP from <b>target</b>` (no caster name at the head).
 */
/**
 * 吸取訊息（單一事實來源）
 * Drain message (single source of truth)
 *
 * 原始日誌：`Drained <b>N</b> HP from <b>target</b>(targetFrom > targetTo)<b>who</b>(whoFrom > whoTo)`，
 * 支援任意數量的 `who(n1->n2)` 數值變化；who 缺省時只印 `(n1 > n2)`。
 * Original log: `Drained <b>N</b> HP from <b>target</b>(tFrom > tTo)<b>who</b>(wFrom > wTo)`,
 * supporting any number of `who(n1->n2)` value changes; when `who` is absent only `(n1 > n2)` prints.
 */
const DrainMessage: React.FC<{ action: IBattleAction }> = ({ action }) => {
  const cls = getMessageClass(action);
  // 原始日誌：`Drained <b>N</b> HP from <b>target</b>(…)`——僅吸取數值與單位上色，
  // `Drained`／`from target`／`(n1 > n2)` 維持預設色。
  // Original log: `Drained <b>N</b> HP from <b>target</b>(…)` — only the drained value and
  // unit are coloured; `Drained`, `from target` and `(n1 > n2)` stay default.
  return (
    <>
      Drained{' '}
      <span className={cls}>
        <span className="bold">{action.value ?? 0}</span>
        {action.valueUnit && ` ${action.valueUnit}`}
      </span>
      {action.target && <> from <span className="bold">{action.target}</span></>}
      <ValueChanges changes={action.valueChanges} type={action.type} />
    </>
  );
};

/** 回復訊息（`name Recovered N HP`）/ Recovery message (`name Recovered N HP`) */
const RecoverMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <NamedValueMessage action={action} className={getMessageClass(action)} text="Recovered" />
);

/**
 * 持續回復訊息（單一事實來源）
 * Regeneration message (single source of truth)
 *
 * 兩種原始版面：`name gained HP regeneration +N%` 與每回合的
 * `* name Auto Regenerate N HP`（prefix 帶出行首星號、數值加粗）。
 * Two original layouts: `name gained HP regeneration +N%` and the per-turn
 * `* name Auto Regenerate N HP` (the prefix carries the leading asterisk and the value is
 * bold).
 */
const RegenMessage: React.FC<{ action: IBattleAction }> = ({ action }) => {
  const cls = getMessageClass(action);
  if (action.prefix !== undefined && action.value !== undefined) {
    // `* name Auto Regenerate N HP`：行首星號與「Auto Regenerate N HP」上色，名稱預設色。
    // `* name Auto Regenerate N HP`: the leading asterisk and "Auto Regenerate N HP" are
    // coloured while the name stays default.
    return <NamedValueMessage action={action} className={cls} text="Auto Regenerate" />;
  }
  // `name gained HP/SP regeneration +N%`：名稱預設色，僅「gained … +N%」上色。
  // `name gained HP/SP regeneration +N%`: the name stays default and only "gained … +N%" is
  // coloured.
  const { name, text } = splitNamedMessage(action);
  return (
    <ActionLine
      who={name}
      message={
        <>
          <span className={cls}>{text}</span>
          <ValueChange valueChange={action.valueChange} type={action.type} />
        </>
      }
    />
  );
};

/**
 * 復活訊息（單一事實來源）
 * Revive message (single source of truth)
 *
 * 對照 Char/Battle/Effect.php：`name` 保持預設色，只有 `revived!` 上 recover 色。
 * Mirrors Char/Battle/Effect.php: the name keeps the default colour and only `revived!`
 * is wrapped in the recover colour.
 */
const ReviveMessage: React.FC<{ action: IBattleAction }> = ({ action }) => {
  const parts = action.message.split(action.emphasis ?? 'revived');
  return (
    <ActionLine
      who={action.source}
      message={
        <>
          {parts[0]}
          <span className="recover">{action.emphasis ?? 'revived'}</span>
          {parts[1]}
        </>
      }
    />
  );
};

/** 增益訊息（`got quicked!`／`casting shorted!`／`got barriered!`）/ Buff message */
const BuffMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <NamedMessage action={action} className={getMessageClass(action)} />
);

/** 減益訊息（能力下降；原始日誌無 span，沿用預設色）/ Debuff message (no span in the original log) */
const DebuffMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <NamedMessage action={action} className={getMessageClass(action)} />
);

/**
 * 中毒訊息（單一事實來源）
 * Poison message (single source of truth)
 *
 * 施加行（`get poisoned!`）對照 Char/Battle/Effect.php：名稱保持預設色，只有 `poisoned`
 * 上 spdmg 色；其餘（每回合傷害／解除／抗毒）整行依 getMessageClass 上色。
 * The apply line (`get poisoned!`) mirrors Char/Battle/Effect.php: the name keeps the
 * default colour and only `poisoned` is wrapped in spdmg, while the others (per-turn
 * damage / cure / resist) are coloured as a whole by getMessageClass.
 */
const PoisonMessage: React.FC<{ action: IBattleAction }> = ({ action }) => {
  if (action.emphasis) {
    const parts = action.message.split(action.emphasis);
    return (
      <ActionLine
        who={action.source}
        message={
          <>
            {parts[0]}
            <span className="spdmg">{action.emphasis}</span>
            {parts[1]}
          </>
        }
      />
    );
  }
  // 每回合中毒傷害（4.7）：整行 spdmg，數值加粗，並附 `(前 > 後)`。
  // Per-turn poison damage (4.7): the whole line is spdmg, the value is bold, and the
  // `(from > to)` is appended.
  if (action.value !== undefined) {
    return (
      <ActionLine
        className={getMessageClass(action)}
        who={action.source}
        message={
          <>
            got{' '}
            <span className="bold">{action.value}</span> damage by poison.
            <ValueChange valueChange={action.valueChange} type={action.type} />
          </>
        }
      />
    );
  }
  return <NamedMessage action={action} className={getMessageClass(action)} />;
};

/** 屬性升降訊息（`STR rise 10%`、`MAXHP extended to 999`）/ Stat-change message */
const StatChangeMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <NamedMessage action={action} className={getMessageClass(action)} />
);

/** 位移訊息（`moved to front.`、`knock backed!`）/ Movement message */
const MoveMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <NamedMessage action={action} className={getMessageClass(action)} />
);

/** 延遲訊息（`name delayed N.`）/ Delay message (`name delayed N.`) */
const DelayMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <NamedMessage action={action} className={getMessageClass(action)} />
);

/**
 * 犧牲訊息（`name sacrifice N HP`，整行 dmg 色）
 * Sacrifice message (`name sacrifice N HP`, the whole line is dmg)
 *
 * 對照 Skill/Effect.php：`<span class="dmg"><b>角色名</b> sacrifice <b>N</b> HP</span>`，
 * 名稱位於色塊「之內」，故整行上色（與 Recover／Drain 名稱在色塊「之外」不同）。
 * Mirrors Skill/Effect.php's `<span class="dmg"><b>name</b> sacrifice <b>N</b> HP</span>`:
 * the name sits INSIDE the colour span, so the whole line is coloured (unlike Recover/Drain
 * where the name stays outside the span).
 */
const SacrificeMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <ActionLine
    className={getMessageClass(action)}
    who={action.source}
    message={
      <>
        sacrifice{' '}
        <span className="bold">{action.value}</span>
        {action.valueUnit && ` ${action.valueUnit}`}
        <ValueChange valueChange={action.valueChange} type={action.type} />
      </>
    }
  />
);

/**
 * 武器不符失敗訊息（單一事實來源）
 * Weapon-mismatch failure message (single source of truth)
 *
 * 對照 Battle/Skill.php：名稱與技能圖示以 `.u` 底線呈現，失敗字樣 ` Failed ` 以 `.dmg`
 * 強調，其後另起一行印出無樣式的原因（如 `(Weapon type doesnt match)`）。
 * Mirrors Battle/Skill.php: the name and the skill icon are underlined with `.u`, the
 * ` Failed ` word is emphasised with `.dmg`, and on a new line the unstyled reason (e.g.
 * `(Weapon type doesnt match)`) is printed.
 */
const FailMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <>
    <ActionLine
      className="u"
      who={action.source}
      message={
        <>
          <span className="dmg"> Failed </span>
          to{' '}
          {action.skill && (
            <SkillIcon
              iconUrl={action.skill.iconUrl}
              name={action.skill.name}
              size={18}
              className="skill-icon"
            />
          )}
          {action.skill?.name}
        </>
      }
    />
    {action.message && (
      <>
        <br />
        {action.message}
      </>
    )}
  </>
);

/** 未命中訊息（`Failed!`；原始日誌無 span，沿用預設色）/ Miss message (`Failed!`, no span in the original log) */
const MissMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <NamedMessage action={action} className={getMessageClass(action)} />
);

/** 升級訊息（`name LevelUp!`）/ Level-up message (`name LevelUp!`) */
const LevelUpMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <NamedMessage action={action} className={getMessageClass(action)} />
);

/**
 * 掉落道具訊息（單一事實來源）
 * Dropped-item message (single source of truth)
 *
 * 原始日誌為 `<b>名</b> dropped<img/>` 後接 `<span class="bold u">道具名</span>.`；
 * message 即道具名稱，source 為掉落者。
 * The original log is `<b>name</b> dropped<img/>` followed by
 * `<span class="bold u">item name</span>.`; `message` holds the item name and `source` the dropper.
 */
const ItemDropMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <ActionLine
    who={action.source}
    message={
      <>
        {action.source && ' dropped'}
        {action.itemIconUrl && (
          <SkillIcon
            iconUrl={action.itemIconUrl}
            name={action.message}
            size={18}
            className="skill-icon"
          />
        )}
        <span className="u">
          <span className="bold">{action.message}</span>
        </span>
        .
      </>
    }
  />
);

/** 純文字資訊（`Failed!`、`Damage x6!`、`heal x2!`）/ Plain info text */
const InfoMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <ActionLine className={getMessageClass(action)} message={action.message} />
);

/**
 * HP/SP 交換訊息（單一事實來源）
 * HP/SP exchange message (single source of truth)
 *
 * 對照 Char/Battle/Effect.php 的 EnergyExchange：首行 `{名} exchanged rate of HP and SP.`，
 * 次行 `HP: from(rate%) to to(rate%)`、第三行 `SP: from(rate%) to to(rate%)`。
 * Mirrors Char/Battle/Effect.php's EnergyExchange: a first line
 * `{name} exchanged rate of HP and SP.`, then `HP: from(rate%) to to(rate%)` and
 * `SP: from(rate%) to to(rate%)`.
 */
const EnergyExchangeMessage: React.FC<{ action: IBattleAction }> = ({ action }) => {
  const r = action.energyExchange;
  if (!r) return <span className="bold">{action.source}</span>;
  return (
    <ActionLine
      who={action.source}
      message={
        <>
          exchanged rate of HP and SP.
          <br />
          HP: {r.hpFrom}({r.hpFromRate}%) to {r.hpTo}({r.hpToRate}%)
          <br />
          SP: {r.spFrom}({r.spFromRate}%) to {r.spTo}({r.spToRate}%)
        </>
      }
    />
  );
};

/**
 * 傷害訊息（單一事實來源）
 * Damage message (single source of truth)
 *
 * 原始日誌：`<b>N</b> Damage to <b>target</b>`——僅數值與「Damage」上 dmg 色，`to target`
 * 與 `(前 > 後)` 維持預設色（色塊在 `to` 之前結束）。
 * Original log: `<b>N</b> Damage to <b>target</b>` — only the value and "Damage" are dmg, while
 * `to target` and `(from > to)` stay default (the colour span ends before "to").
 */
const ValueMessage: React.FC<{
  action: IBattleAction;
  typeClass: string;
  label: string;
}> = ({ action, typeClass, label }) => {
  const attrClass = getAttrClass(action.attribute);
  const cls = `${typeClass} ${attrClass}`.trim();
  return (
    <>
      <span className={cls}>
        <span className="bold">{action.value}</span> {label}
      </span>
      {action.target && <> to <span className="bold">{action.target}</span></>}
      <ValueChange valueChange={action.valueChange} type={action.type} />
    </>
  );
};

/**
 * 保護訊息（單一事實來源）
 * Protect message (single source of truth)
 *
 * 對照 Battle.php：`printf('%s protected %s!')` 無任何 span，故維持預設色（不依 attribute 上色）。
 * Mirrors Battle.php's `printf('%s protected %s!')`, which has no span at all, so the line stays
 * the default colour (it is NOT coloured by `attribute`).
 */
const ProtectMessage: React.FC<{ action: IBattleAction }> = ({ action }) => {
  const parts = action.message.split('protected');
  if (parts.length === 2) {
    return (
      <ActionLine
        who={parts[0].trim()}
        message={
          <>
            protected{' '}
            <span className="bold">{parts[1].trim().replace('!', '')}</span>!
          </>
        }
      />
    );
  }
  return <ActionLine message={action.message} />;
};

/**
 * 蓄力/倒下/預設訊息 props（className 必填、style 選填，見 IStylePropsRequired）
 * Status message props (className required, style optional; see IStylePropsRequired)
 */
interface IStatusMessageProps extends IStylePropsRequired<'className'> {
  action: IBattleAction;
  suffix: string;
}

/**
 * 蓄力/倒下/預設訊息（單一事實來源）
 * Casting/down/default message (single source of truth)
 */
const StatusMessage: React.FC<IStatusMessageProps> = ({ action, className, suffix, style }) => (
  <ActionLine className={className} style={style} who={action.source} message={suffix} />
);

/**
 * 蓄力/詠唱訊息（單一事實來源）
 * Charge/casting message (single source of truth)
 *
 * 文案由 buildChargeMessage 依 castType 決定，修正過去硬編碼「start casting.」
 * 導致物理蓄力（start charging.）誤顯示為詠唱的缺陷；castType 缺省時維持詠唱，
 * 既有展示資料行為不變。
 * The copy comes from buildChargeMessage keyed on castType, fixing the defect where the
 * hardcoded "start casting." showed a physical charge (start charging.) as a cast. An absent
 * castType still reads as casting, so existing showcase data behaves as before.
 */
const CastingMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <StatusMessage action={action} className="charge" suffix={buildChargeMessage(action.castType)} />
);

// ==================== 行動內容路由 / Action content router ====================

/**
 * 根據行動類型渲染內容（單一事實來源）
 * Render content based on action type (single source of truth)
 */
function renderActionContent(action: IBattleAction): React.ReactNode {
  switch (action.type) {
    case 'enter':
      return <EnterMessage action={action} />;
    case 'summon':
      return <SummonMessage action={action} />;
    case 'magiccircle':
      return <MagicCircleMessage action={action} />;
    case 'skill':
    case 'attack':
      return <SkillMessage action={action} />;
    case 'damage':
      return <ValueMessage action={action} typeClass="dmg" label="Damage" />;
    case 'heal':
      // 原始回復文案為 "Recovered N HP/SP"，與 'recover' 共用 Partial 上色版面。
      // The original recovery copy is "Recovered N HP/SP", so heals share the Recover layout.
      return <RecoverMessage action={action} />;
    case 'protect':
      return <ProtectMessage action={action} />;
    case 'casting':
      return <CastingMessage action={action} />;
    case 'down':
      return <StatusMessage action={action} className="dmg" suffix="down." />;
    case 'spdamage':
      return <SpDamageMessage action={action} />;
    case 'recover':
      return <RecoverMessage action={action} />;
    case 'drain':
      return <DrainMessage action={action} />;
    case 'regen':
      return <RegenMessage action={action} />;
    case 'revive':
      return <ReviveMessage action={action} />;
    case 'buff':
      return <BuffMessage action={action} />;
    case 'debuff':
      return <DebuffMessage action={action} />;
    case 'poison':
      return <PoisonMessage action={action} />;
    case 'statchange':
      return <StatChangeMessage action={action} />;
    case 'move':
      return <MoveMessage action={action} />;
    case 'delay':
      return <DelayMessage action={action} />;
    case 'sacrifice':
      return <SacrificeMessage action={action} />;
    case 'fail':
      return <FailMessage action={action} />;
    case 'miss':
      return <MissMessage action={action} />;
    case 'levelup':
      return <LevelUpMessage action={action} />;
    case 'itemdrop':
      return <ItemDropMessage action={action} />;
    case 'energyexchange':
      return <EnergyExchangeMessage action={action} />;
    case 'leave':
      return <LeaveMessage action={action} />;
    case 'info':
      return <InfoMessage action={action} />;
    default:
      return <ActionLine className={getAttrClass(action.attribute)} message={action.message} />;
  }
}

// ==================== 主組件 / Main component ====================

/**
 * 戰鬥行動組件
 * Battle action component
 */
export const BattleAction: React.FC<IBattleActionProps> = ({ action }) => {
  return (
    <div className="action-entry">
      {renderActionContent(action)}
    </div>
  );
};
