/**
 * SkillIcon 共享技能圖示元件（單一事實來源）
 * Shared skill icon component (single source of truth)
 *
 * 抽取自 BattleAction.tsx 與 SkillCard.tsx 中重複的
 * {iconUrl ? <img> : <span placeholder>} 渲染邏輯。
 *
 * Extracted from the duplicated icon/placeholder rendering
 * logic in BattleAction.tsx and SkillCard.tsx.
 */
import React from 'react';
import type { IStyleProps } from '#/components/shared/types';

/** SkillIcon 屬性 / SkillIcon props */
export interface ISkillIconProps extends IStyleProps {
  /** 圖示 URL / Icon URL */
  iconUrl?: string | null;
  /** 技能名稱（用於 alt 和佔位符首字）/ Skill name (for alt and placeholder initial) */
  name: string;
  /** 圖示尺寸（px）/ Icon size in pixels */
  size?: number;
}

/**
 * SkillIcon 共享技能圖示元件
 * Shared skill icon component
 */
export const SkillIcon: React.FC<ISkillIconProps> = ({
  iconUrl,
  name,
  size = 18,
  className = '',
  style,
}) => {
  if (iconUrl) {
    return (
      <img
        className={className || 'skill-icon'}
        src={iconUrl}
        alt={name}
        title={name}
        style={{ width: size, height: size, ...style }}
      />
    );
  }

  return (
    <span
      className={className || 'skill-placeholder'}
      title={name}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        width: size,
        height: size,
        margin: '0 5px',
        background: 'var(--color-bg-mid)',
        border: '1px solid var(--color-border-mid)',
        borderRadius: 3,
        textAlign: 'center',
        lineHeight: `${size}px`,
        fontSize: size * 0.55,
        ...style,
      }}
    >
      {name.charAt(0)}
    </span>
  );
};
