/**
 * 戰鬥行動組件
 * Battle action component
 *
 * 顯示單一技能/攻擊/行動的日誌條目
 * Displays a single skill/attack/action log entry
 */
import React from 'react';
import type { IBattleAction } from './types';
import './BattleAction.css';
import '#/components/shared/SharedBase.css';
import { getAttrClass, getValueChangeClass, getEnterBattlefieldText } from './battleUtils';

/** 戰鬥行動屬性 / Battle action props */
export interface IBattleActionProps {
  /** 行動資料 / Action data */
  action: IBattleAction;
}

/**
 * 格式化數值變化描述
 * Format value change description
 *
 * 例如 "349 > 167", "213 > 169", "1 > -39"
 * e.g. "349 > 167", "213 > 169", "1 > -39"
 */
function formatValueChange(action: IBattleAction): React.ReactNode {
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
}

/**
 * 渲染技能圖示
 * Render skill icon
 */
function renderSkillIcon(action: IBattleAction): React.ReactNode {
  if (!action.skill) return null;

  return (
    <>
      {action.skill.iconUrl ? (
        <img
          className="skill-icon"
          src={action.skill.iconUrl}
          alt={action.skill.name}
          title={action.skill.name}
        />
      ) : (
        <span className="skill-placeholder" title={action.skill.name}>
          {action.skill.name.charAt(0)}
        </span>
      )}
    </>
  );
}

/**
 * 根據行動類型渲染內容
 * Render content based on action type
 */
function renderActionContent(action: IBattleAction): React.ReactNode {
  const attrClass = getAttrClass(action.attribute);

  switch (action.type) {
    case 'enter': {
      const spanClass = `result ${attrClass}`;
      return (
        <span className={spanClass}>
          <span className="bold">{action.source}</span> {getEnterBattlefieldText()}
        </span>
      );
    }

    case 'skill':
    case 'attack': {
      return (
        <div className="u">
          <span className="bold">{action.source}</span>
          {renderSkillIcon(action)}
          {action.skill?.name}
        </div>
      );
    }

    case 'damage': {
      return (
        <span className={`dmg ${attrClass}`}>
          <span className="bold">{action.value}</span> Damage
          {action.target && <> to <span className="bold">{action.target}</span></>}
          {formatValueChange(action)}
        </span>
      );
    }

    case 'heal': {
      return (
        <span className={`recover ${attrClass}`}>
          <span className="bold">{action.value}</span> Heal
          {action.target && <> to <span className="bold">{action.target}</span></>}
          {formatValueChange(action)}
        </span>
      );
    }

    case 'protect': {
      // Example: "Hero1 protected Priest1!"
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
    }

    case 'casting': {
      return (
        <span className="charge">
          <span className="bold">{action.source}</span> start casting.
        </span>
      );
    }

    case 'down': {
      return (
        <span className="dmg">
          <span className="bold">{action.source}</span> down.
        </span>
      );
    }

    default: {
      return <span className={attrClass}>{action.message}</span>;
    }
  }
}

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
