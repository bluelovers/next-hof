/**
 * 技能卡片組件
 * Skill card component
 *
 * 顯示單個技能的完整資訊：
 * 圖示、名稱、目標、範圍、SP 消耗、倍率、命中率、限制
 * Displays complete skill info: icon, name, target, scope, SP, power, hit rate, limits
 *
 * 子邏輯可選用：各區塊皆可透過 render prop 覆寫或禁用。
 * Sub-renderers are optional: each section can be overridden or disabled via render props.
 */
import React from 'react';
import type {
  ISkillData,
  ISkillTarget,
  ISkillScope,
  ISkillStatChanges,
  ISkillFlags,
  ISkillCharge,
  ISkillEffects,
} from './GameDataTypes';
import './SkillCard.css';

// ==================== Render Props / 子邏輯覆寫 ====================

/** 技能卡片覆寫選項 / Skill card override options */
export interface ISkillCardRenderProps {
  /** 覆寫整個技能名稱區塊 / Override name section */
  renderName?: (skill: ISkillData) => React.ReactNode;
  /** 覆寫目標顯示 / Override target display */
  renderTarget?: (target: ISkillTarget) => React.ReactNode;
  /** 覆寫範圍顯示 / Override scope display */
  renderScope?: (scope: ISkillScope) => React.ReactNode;
  /** 覆寫消費區塊 / Override cost section */
  renderCost?: (skill: ISkillData) => React.ReactNode;
  /** 覆寫威力區塊 / Override power section */
  renderPower?: (skill: ISkillData) => React.ReactNode;
  /** 覆寫戰鬥標誌區塊 / Override flags section */
  renderFlags?: (flags: ISkillFlags) => React.ReactNode;
  /** 覆寫能力變動區塊 / Override stat changes section */
  renderStatChanges?: (stats: ISkillStatChanges) => React.ReactNode;
  /** 覆寫詠唱區塊 / Override charge section */
  renderCharge?: (charge: ISkillCharge) => React.ReactNode;
  /** 覆寫效果區塊 / Override effects section */
  renderEffects?: (effects: ISkillEffects) => React.ReactNode;
  /** 覆寫武器限制區塊 / Override weapon limit section */
  renderWeaponLimit?: (limit: string) => React.ReactNode;
  /** 覆寫整個卡片 / Override entire card */
  renderCard?: (skill: ISkillData, defaultContent: React.ReactNode) => React.ReactNode;
}

/** 技能卡片屬性 / Skill card props */
export interface ISkillCardProps extends ISkillCardRenderProps {
  /** 技能資料 / Skill data */
  skill: ISkillData;
}

// ==================== CSS 類別映射 / CSS class mappings ====================

/**
 * 根據目標類型取得 CSS 類別（與 PHP 頁面 dmg / recover / support 一致）
 * Get CSS class based on target type (matches PHP dmg / recover / support)
 */
function targetClass(target: ISkillTarget): string {
  switch (target) {
    case 'enemy': return 'dmg';
    case 'friend': return 'recover';
    case 'self': return 'support';
    case 'all': return 'support';
    // 防禦性預設：EnumTargetType 為 lib re-export 別名，TS 在 isolatedModules
    // 下無法對 re-export 列舉做 switch 窮盡推論，故顯式補 default。
    // Defensive default: EnumTargetType is a lib re-export alias; TS cannot
    // prove switch exhaustiveness for re-exported enums under isolatedModules.
    default: return 'support';
  }
}

/**
 * 根據範圍取得 CSS 類別（與 PHP 頁面 spdmg / charge 一致）
 * Get CSS class based on scope (matches PHP spdmg / charge)
 */
function scopeClass(scope: ISkillScope): string {
  switch (scope) {
    case 'multi': return 'spdmg';
    case 'all': return 'charge';
    default: return 'recover';
  }
}

// ==================== 子渲染器 / Sub-renderers ====================

/**
 * 預設技能名稱渲染 / Default skill name renderer
 * 對應 PHP: g_name span + img + name
 */
function DefaultNameRenderer({ skill }: { skill: ISkillData }) {
  return (
    <span className="g-name" title={skill.name}>
      {skill.iconUrl ? (
        <img src={skill.iconUrl} className="skill-icon-img" alt={skill.name} />
      ) : (
        <span className="skill-icon-placeholder">{skill.name.charAt(0)}</span>
      )}
      {skill.name}
    </span>
  );
}

/**
 * 預設目標渲染 / Default target renderer
 * 對應 PHP: target[0] — charge/dmg/recover/support
 */
function DefaultTargetRenderer({ target }: { target: ISkillTarget }) {
  return <span className={targetClass(target)}>{target}</span>;
}

/**
 * 預設範圍渲染 / Default scope renderer
 * 對應 PHP: target[1] — charge/recover/spdmg
 */
function DefaultScopeRenderer({ scope }: { scope: ISkillScope }) {
  return <span className={scopeClass(scope)}>{scope}</span>;
}

/**
 * 預設消費渲染 / Default cost renderer
 * 對應 PHP: sp, sacrifice, MagicCircleDeleteTeam
 */
function DefaultCostRenderer({ skill }: { skill: ISkillData }) {
  const sp = skill.sp ?? skill.spCost;
  return (
    <>
      {sp !== undefined && (
        <> / <span className="support">{sp}sp</span></>
      )}
      {skill.sacrificePct !== undefined && (
        <> / <span className="dmg">Sacrifice:{skill.sacrificePct}%</span></>
      )}
      {skill.magicCircleCost !== undefined && (
        <> / <span className="support">MagicCircle x{skill.magicCircleCost}</span></>
      )}
    </>
  );
}

/**
 * 預設威力渲染 / Default power renderer
 * 對應 PHP: pow%, support 決定 CSS 類別, target[2] = hits
 */
function DefaultPowerRenderer({ skill }: { skill: ISkillData }) {
  if (skill.powerPct === undefined) return null;
  const powClass = skill.isSupport ? 'recover' : 'dmg';
  const hits = skill.hits ?? 1;
  return (
    <>
      {' / '}
      <span className={powClass}>{skill.powerPct}%</span>
      {hits > 1 && <span>x{hits}</span>}
    </>
  );
}

/**
 * 預設戰鬥標誌渲染 / Default flags renderer
 * 對應 PHP: type=1→Magic, quick, invalid, priority=Back→BackAttack, CurePoison
 */
function DefaultFlagsRenderer({ flags }: { flags: ISkillFlags }) {
  const tags: React.ReactNode[] = [];
  if (flags.skillType === 'magic') {
    tags.push(<span key="magic" className="spdmg">Magic</span>);
  }
  if (flags.isQuick) {
    tags.push(<span key="quick" className="charge">Quick</span>);
  }
  if (flags.isInvalid) {
    tags.push(<span key="invalid" className="charge">invalid</span>);
  }
  if (flags.priority === 'Back') {
    tags.push(<span key="back" className="support">BackAttack</span>);
  }
  if (flags.curePoison) {
    tags.push(<span key="cure" className="support">CurePoison</span>);
  }
  if (tags.length === 0) return null;
  return <>{tags.map((t, i) => <React.Fragment key={i}>{' / '}{t}</React.Fragment>)}</>;
}

/**
 * 預設能力變動渲染 / Default stat changes renderer
 * 對應 PHP: Up*→charge, Down*→dmg, Plus*→charge（無%）
 */
function DefaultStatChangesRenderer({ stats }: { stats: ISkillStatChanges }) {
  const parts: React.ReactNode[] = [];

  // Up* — 臨時增益（charge 金色 + %）
  if (stats.upStats) {
    for (const [key, val] of Object.entries(stats.upStats)) {
      if (val !== undefined) {
        const label = key.replace('MAX', 'Max');
        parts.push(
          <span key={`up-${key}`} className="charge">
            {label}+{val}%
          </span>
        );
      }
    }
  }

  // Down* — 臨時減益（dmg 紅色 + %）
  if (stats.downStats) {
    for (const [key, val] of Object.entries(stats.downStats)) {
      if (val !== undefined) {
        const label = key.replace('MAX', 'Max');
        parts.push(
          <span key={`down-${key}`} className="dmg">
            {label}-{val}%
          </span>
        );
      }
    }
  }

  // Plus* — 永久加算（charge 金色，無%）
  if (stats.plusStats) {
    for (const [key, val] of Object.entries(stats.plusStats)) {
      if (val !== undefined) {
        const label = key.charAt(0) + key.slice(1).toLowerCase();
        parts.push(
          <span key={`plus-${key}`} className="charge">
            {label}+{val}
          </span>
        );
      }
    }
  }

  if (parts.length === 0) return null;
  return <>{parts.map((p, i) => <React.Fragment key={i}>{' / '}{p}</React.Fragment>)}</>;
}

/**
 * 預設詠唱渲染 / Default charge renderer
 * 對應 PHP: charge[0]:charge[1], delay, stiff
 */
function DefaultChargeRenderer({ charge }: { charge: ISkillCharge }) {
  const parts: React.ReactNode[] = [];
  const hasCharge = (charge.chargeTime ?? 0) > 0 || (charge.cooldownTime ?? 0) > 0;
  if (hasCharge) {
    parts.push(
      <span key="charge" className="charge">
        ({charge.chargeTime ?? 0}:{charge.cooldownTime ?? 0})
      </span>
    );
  }
  if (charge.delayPct !== undefined) {
    parts.push(
      <span key="delay" className="support">
        Delay-{charge.delayPct}%
      </span>
    );
  }
  if (parts.length === 0) return null;
  return <>{parts.map((p, i) => <React.Fragment key={i}>{' / '}{p}</React.Fragment>)}</>;
}

/**
 * 預設效果渲染 / Default effects renderer
 * 對應 PHP: poison, knockback, HpRegen, SpRegen, SpRecoveryRate,
 *          summon, move, umove, pierce, MagicCircleAdd/Delete/DeleteEnemy
 */
function DefaultEffectsRenderer({ effects }: { effects: ISkillEffects }) {
  const parts: React.ReactNode[] = [];

  if (effects.poisonPct !== undefined) {
    parts.push(<span key="poison" className="dmg">Poison:{effects.poisonPct}%</span>);
  }
  if (effects.knockbackPct !== undefined) {
    parts.push(<span key="kb" className="dmg">Knockback:{effects.knockbackPct}%</span>);
  }
  if (effects.hpRegen) {
    parts.push(<span key="hpregen" className="support">HpRegen</span>);
  }
  if (effects.spRegen) {
    parts.push(<span key="spregen" className="support">SpRegen</span>);
  }
  if (effects.spRecoveryRate !== undefined) {
    parts.push(<span key="sprate" className="support">SpRecovery:{effects.spRecoveryRate}</span>);
  }
  if (effects.pierce !== undefined) {
    parts.push(<span key="pierce" className="dmg">Pierce:{effects.pierce}</span>);
  }
  if (effects.move) {
    parts.push(<span key="move" className="support">Move:{effects.move}</span>);
  }
  if (effects.summon !== undefined) {
    parts.push(<span key="summon" className="support">Summon</span>);
  }
  if (effects.magicCircleAdd !== undefined) {
    parts.push(<span key="mca" className="charge">MagicCircleAdd x{effects.magicCircleAdd}</span>);
  }
  if (effects.magicCircleDelete !== undefined) {
    parts.push(<span key="mcd" className="support">MagicCircleDelete x{effects.magicCircleDelete}</span>);
  }
  if (effects.magicCircleDeleteEnemy !== undefined) {
    parts.push(<span key="mcde" className="dmg">MagicCircleDeleteEnemy x{effects.magicCircleDeleteEnemy}</span>);
  }

  if (parts.length === 0) return null;
  return <>{parts.map((p, i) => <React.Fragment key={i}>{' / '}{p}</React.Fragment>)}</>;
}

// ==================== 主組件 / Main component ====================

/**
 * 技能卡片組件
 * Skill card component
 *
 * 預設渲染所有 PHP 對應欄位，可透過 render props 覆寫個別區塊。
 * Renders all PHP-equivalent fields by default; individual sections
 * can be overridden via render props.
 */
export const SkillCard: React.FC<ISkillCardProps> = ({
  skill,
  renderName,
  renderTarget,
  renderScope,
  renderCost,
  renderPower,
  renderFlags,
  renderStatChanges,
  renderCharge,
  renderEffects,
  renderWeaponLimit,
  renderCard,
}) => {
  /** 預設內容 / Default content */
  const defaultContent = (
    <div className="g-skill" data-no={skill.skillNo}>
      {/* 名稱 / Name */}
      {renderName
        ? renderName(skill)
        : <DefaultNameRenderer skill={skill} />
      }

      {/* 目標 / Target */}
      {' / '}
      {renderTarget
        ? renderTarget(skill.target)
        : <DefaultTargetRenderer target={skill.target} />
      }

      {/* 範圍 / Scope */}
      {' - '}
      {renderScope
        ? renderScope(skill.scope)
        : <DefaultScopeRenderer scope={skill.scope} />
      }

      {/* 消費（SP / 犧牲 / 魔方陣）/ Cost */}
      {renderCost
        ? renderCost(skill)
        : <DefaultCostRenderer skill={skill} />
      }

      {/* 威力 / Power */}
      {renderPower
        ? renderPower(skill)
        : <DefaultPowerRenderer skill={skill} />
      }

      {/* 戰鬥標誌（Magic / Quick / invalid / Back / CurePoison）/ Flags */}
      {renderFlags
        ? renderFlags(skill)
        : <DefaultFlagsRenderer flags={skill} />
      }

      {/* 能力變動（Up/Down/Plus）/ Stat changes */}
      {renderStatChanges
        ? renderStatChanges(skill)
        : <DefaultStatChangesRenderer stats={skill} />
      }

      {/* 詠唱與延遲 / Charge & delay */}
      {renderCharge
        ? renderCharge(skill)
        : <DefaultChargeRenderer charge={skill} />
      }

      {/* 命中率 / Hit rate */}
      {skill.hitRate && (
        <>
          {' / '}
          <span className="hit-rate">({skill.hitRate})</span>
        </>
      )}

      {/* 武器限制 / Weapon limit */}
      {skill.weaponLimit && (
        renderWeaponLimit
          ? renderWeaponLimit(skill.weaponLimit)
          : (
            <>
              {' / '}
              <span className="weapon-limit">Limit:{skill.weaponLimit}</span>
            </>
          )
      )}

      {/* 其他效果 / Other effects */}
      {renderEffects
        ? renderEffects(skill)
        : <DefaultEffectsRenderer effects={skill} />
      }

      {/* 技能說明 / Effect description */}
      {skill.effect && (
        <>
          {' / '}
          <span className="skill-effect">{skill.effect}</span>
        </>
      )}

      {/* 學習點數（radio 模式）/ Learn points (radio mode) */}
      {skill.learn !== undefined && skill.learn > 0 && (
        <>
          {' / '}
          <span className="bold">{skill.learn}</span>pt
        </>
      )}
    </div>
  );

  // 允許完全覆寫整個卡片 / Allow full card override
  if (renderCard) {
    return <>{renderCard(skill, defaultContent)}</>;
  }

  return defaultContent;
};
