/**
 * 技能卡片組件
 * Skill card component
 *
 * 顯示單個技能的完整資訊：
 * 圖示、名稱、目標、範圍、SP 消耗、倍率、命中率、限制
 * Displays complete skill info: icon, name, target, scope, SP, power, hit rate, limits
 */
import React from 'react';
import type { ISkillData, ISkillTarget, ISkillScope } from './GameDataTypes';

/** 技能卡片屬性 / Skill card props */
export interface ISkillCardProps {
  /** 技能資料 / Skill data */
  skill: ISkillData;
}

/** 根據目標類型取得 CSS 類別 / Get CSS class based on target type */
function targetClass(target: ISkillTarget): string {
  switch (target) {
    case 'enemy': return 'tgt-enemy';
    case 'friend': return 'tgt-friend';
    case 'self': return 'tgt-self';
  }
}

/** 根據範圍取得 CSS 類別 / Get CSS class based on scope */
function scopeClass(scope: ISkillScope): string {
  switch (scope) {
    case 'multi': return 'scp-multi';
    default: return 'scp-normal';
  }
}

/**
 * 技能卡片組件
 * Skill card component
 */
export const SkillCard: React.FC<ISkillCardProps> = ({ skill }) => {
  const { name, iconUrl, target, scope, spCost, powerPct, hits, hitRate, weaponLimit, effect, extraAttrs } = skill;

  return (
    <div className="g-skill">
      {/* 技能名稱行 / Skill name row */}
      <span className="g-name" title={name}>
        {/* 圖示 / Icon */}
        {iconUrl ? (
          <img src={iconUrl} className="skill-icon-img" alt={name} />
        ) : (
          <span className="skill-icon-placeholder">{name.charAt(0)}</span>
        )}
        {name}
      </span>

      {/* 目標 / Target */}
      {' / '}
      <span className={targetClass(target)}>{target}</span>

      {/* 範圍 / Scope */}
      {' - '}
      <span className={scopeClass(scope)}>{scope}</span>

      {/* SP 消耗 / SP cost */}
      {' / '}
      <span className="sp-cost">{spCost}sp</span>

      {/* 威力 / Power */}
      {powerPct !== undefined && (
        <>
          {' / '}
          <span className="power-pct">{powerPct}%</span>
          {hits !== undefined && hits > 1 && <span>x{hits}</span>}
        </>
      )}

      {/* 命中率 / Hit rate */}
      {hitRate && (
        <>
          {' / '}
          <span className="hit-rate">({hitRate})</span>
        </>
      )}

      {/* 武器限制 / Weapon limit */}
      {weaponLimit && (
        <>
          {' / '}
          <span className="weapon-limit">{weaponLimit}</span>
        </>
      )}

      {/* 額外屬性 / Extra attributes */}
      {extraAttrs?.map((attr, i) => (
        <React.Fragment key={i}>
          {' / '}
          <span className="extra-attr">{attr}</span>
        </React.Fragment>
      ))}

      {/* 特殊效果 / Special effect */}
      {effect && (
        <>
          {' / '}
          <span className="skill-effect">{effect}</span>
        </>
      )}
    </div>
  );
};
