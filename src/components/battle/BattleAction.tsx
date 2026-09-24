/**
 * 戰鬥行動組件
 * Battle action component
 *
 * 顯示單一技能/攻擊/行動的日誌條目（含召喚 Summon 與魔方陣 MagicCircle）
 * Displays a single skill/attack/action log entry (summon and magic circle included)
 */
import React from 'react';
import type { IBattleAction } from './types';
import './BattleAction.css';
import '#/components/shared/SharedBase.css';
import { SkillIcon } from '#/components/shared/SkillIcon';
import { CharacterSprite } from '#/components/characters/CharacterSprite';
import { EnumSpriteVariant, EnumMagicCircleKind } from './enums';
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
 */
const ValueChange: React.FC<{ action: IBattleAction }> = ({ action }) => {
  if (!action.valueChange) return null;
  const valClass = getValueChangeClass(action.type);
  return (
    <span className={valClass}>
      ({action.valueChange})
    </span>
  );
};

/**
 * 入場訊息（單一事實來源）
 * Enter battlefield message (single source of truth)
 */
const EnterMessage: React.FC<{ action: IBattleAction }> = ({ action }) => {
  const attrClass = getAttrClass(action.attribute);
  return (
    <span className={`result ${attrClass}`}>
      <span className="bold">{action.source}</span> {getEnterBattlefieldText(action.level)}
    </span>
  );
};

/**
 * 退場訊息（`name Lv.N leave the Battlefield.`，dmg 色；對照 Battle.php）
 * Leave message (`name Lv.N leave the Battlefield.`, dmg colour; mirrors Battle.php)
 */
const LeaveMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <span className="dmg">
    <span className="bold">{action.source}</span> {getEnterBattlefieldText(action.level, true)}
  </span>
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
          <span className={attrClass}>
            <span className="bold">{unit.name}</span> joined to the team.{' '}
            <span className="bold">{unit.name}</span> {getEnterBattlefieldText(unit.level)}
          </span>
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
  const withName = kind !== EnumMagicCircleKind.Fail;
  return (
    <span className={getMagicCircleClass(kind)}>
      {withName && action.source && (
        <>
          <span className="bold">{action.source}</span>{' '}
        </>
      )}
      {MAGIC_CIRCLE_PHRASE[kind]}
      {withName && amount !== undefined && ` x${amount}`}
    </span>
  );
};

/**
 * 通用「粗體名稱 ＋ 其後文字」版面（單一事實來源）
 * Shared "bold name + trailing text" layout (single source of truth)
 *
 * 名稱與文字由 splitNamedMessage 從 message 還原，文案則一律由 battleUtils 的建構器
 * 產生，因此各家族訊息組件只需指定配色。
 * splitNamedMessage recovers the name and the text from `message`, and battleUtils'
 * builders always produce the copy, so each family component only has to pick a colour.
 */
const NamedMessage: React.FC<{ action: IBattleAction; className?: string }> = ({ action, className }) => {
  const { name, text } = splitNamedMessage(action);
  return (
    <span className={className}>
      {action.prefix}
      {name && <span className="bold">{name}</span>}
      {text}
      <ValueChange action={action} />
    </span>
  );
};

/**
 * 「粗體名稱 ＋ 文字 ＋ 粗體數值 ＋ 單位」版面（Recovered／Sacrifice／Auto Regenerate）
 * "bold name + text + bold value + unit" layout (Recovered / Sacrifice / Auto Regenerate)
 *
 * 缺少 value 時退回 NamedMessage（直接輸出 message，保證文案不丟失）。
 * Falls back to NamedMessage when `value` is absent so the copy is never dropped.
 */
const NamedValueMessage: React.FC<{ action: IBattleAction; className?: string; text: string }> = ({
  action,
  className,
  text,
}) => {
  if (action.value === undefined) return <NamedMessage action={action} className={className} />;
  return (
    <span className={className}>
      {action.prefix}
      <span className="bold">{action.source}</span> {text}{' '}
      <span className="bold">{action.value}</span>
      {action.valueUnit && ` ${action.valueUnit}`}
      <ValueChange action={action} />
    </span>
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
const SpDamageMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <span className={getMessageClass(action)}>
    <span className="bold">{action.value}</span>SP Damage
    {action.target && (
      <>
        {' '}to <span className="bold">{action.target}</span>
      </>
    )}
    <ValueChange action={action} />
  </span>
);

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
const DrainMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <span className={getMessageClass(action)}>
    Drained{' '}
    <span className="bold">{action.value ?? 0}</span>
    {action.valueUnit && ` ${action.valueUnit}`}
    {action.target && (
      <>
        {' '}from <span className="bold">{action.target}</span>
      </>
    )}
    {action.valueChanges?.map((vc, i) => (
      <span key={i}>
        {vc.who && <span className="bold">{vc.who}</span>}
        ({vc.from} &gt; {vc.to})
      </span>
    ))}
  </span>
);

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
  if (action.prefix !== undefined && action.value !== undefined) {
    return <NamedValueMessage action={action} className={getMessageClass(action)} text="Auto Regenerate" />;
  }
  return <NamedMessage action={action} className={getMessageClass(action)} />;
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
    <span>
      {action.source && <span className="bold">{action.source}</span>}{' '}
      {parts[0]}
      <span className="recover">{action.emphasis ?? 'revived'}</span>
      {parts[1]}
    </span>
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
      <span>
        {action.source && <span className="bold">{action.source}</span>}{' '}
        {parts[0]}
        <span className="spdmg">{action.emphasis}</span>
        {parts[1]}
      </span>
    );
  }
  // 每回合中毒傷害（4.7）：整行 spdmg，數值加粗，並附 `(前 > 後)`。
  // Per-turn poison damage (4.7): the whole line is spdmg, the value is bold, and the
  // `(from > to)` is appended.
  if (action.value !== undefined) {
    return (
      <span className={getMessageClass(action)}>
        {action.source && <span className="bold">{action.source}</span>} got{' '}
        <span className="bold">{action.value}</span> damage by poison.
        <ValueChange action={action} />
      </span>
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

/** 犧牲訊息（`name sacrifice N HP`）/ Sacrifice message (`name sacrifice N HP`) */
const SacrificeMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <NamedValueMessage action={action} className={getMessageClass(action)} text="sacrifice" />
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
    <span className="u">
      <span className="bold">{action.source}</span>
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
    </span>
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
  <span>
    {action.source && <span className="bold">{action.source}</span>}
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
  </span>
);

/** 純文字資訊（`Failed!`、`Damage x6!`、`heal x2!`）/ Plain info text */
const InfoMessage: React.FC<{ action: IBattleAction }> = ({ action }) => (
  <span className={getMessageClass(action)}>{action.message}</span>
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
    <span>
      {action.source && <span className="bold">{action.source}</span>}{' '}
      exchanged rate of HP and SP.
      <br />
      HP: {r.hpFrom}({r.hpFromRate}%) to {r.hpTo}({r.hpToRate}%)
      <br />
      SP: {r.spFrom}({r.spFromRate}%) to {r.spTo}({r.spToRate}%)
    </span>
  );
};

/**
 * 傷害/治療訊息（單一事實來源）
 * Damage/heal message (single source of truth)
 */
const ValueMessage: React.FC<{
  action: IBattleAction;
  typeClass: string;
  label: string;
}> = ({ action, typeClass, label }) => {
  const attrClass = getAttrClass(action.attribute);
  return (
    <span className={`${typeClass} ${attrClass}`}>
      <span className="bold">{action.value}</span> {label}
      {action.target && <> to <span className="bold">{action.target}</span></>}
      <ValueChange action={action} />
    </span>
  );
};

/**
 * 保護訊息（單一事實來源）
 * Protect message (single source of truth)
 */
const ProtectMessage: React.FC<{ action: IBattleAction }> = ({ action }) => {
  const attrClass = getAttrClass(action.attribute);
  const parts = action.message.split('protected');
  if (parts.length === 2) {
    return (
      <span className={attrClass}>
        <span className="bold">{parts[0].trim()}</span> protected{' '}
        <span className="bold">{parts[1].trim().replace('!', '')}</span>!
      </span>
    );
  }
  return <span className={attrClass}>{action.message}</span>;
};

/**
 * 蓄力/倒下/預設訊息（單一事實來源）
 * Casting/down/default message (single source of truth)
 */
const StatusMessage: React.FC<{
  action: IBattleAction;
  className: string;
  suffix: string;
}> = ({ action, className, suffix }) => (
  <span className={className}>
    <span className="bold">{action.source}</span> {suffix}
  </span>
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
      return <ValueMessage action={action} typeClass="recover" label="Heal" />;
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
      return <span className={getAttrClass(action.attribute)}>{action.message}</span>;
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
