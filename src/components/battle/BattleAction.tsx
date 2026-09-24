/**
 * 戰鬥行動組件
 * Battle action component
 *
 * 顯示單一技能/攻擊/行動的日誌條目（含召喚 Summon）
 * Displays a single skill/attack/action log entry (summon included)
 */
import React from 'react';
import type { IBattleAction } from './types';
import './BattleAction.css';
import '#/components/shared/SharedBase.css';
import { SkillIcon } from '#/components/shared/SkillIcon';
import { CharacterSprite } from '#/components/characters/CharacterSprite';
import { EnumSpriteVariant } from './enums';
import { getAttrClass, getValueChangeClass, getEnterBattlefieldText } from './battleUtils';

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
    <>
      {' '}
      <span className={valClass}>
        ({action.valueChange})
      </span>
    </>
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
      <span className="bold">{action.source}</span> {getEnterBattlefieldText()}
    </span>
  );
};

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
      return <StatusMessage action={action} className="charge" suffix="start casting." />;
    case 'down':
      return <StatusMessage action={action} className="dmg" suffix="down." />;
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
