/**
 * 職業詳細卡片組件
 * Job detail card component
 *
 * 顯示職業名稱、精靈、描述、裝備與技能列表
 * Displays job name, sprites, description, equipment, and skill list
 */
import React from 'react';
import type { IJobData } from './GameDataTypes';
import { SkillCard } from './SkillCard';

/** 職業詳細卡片屬性 / Job detail card props */
export interface IJobDetailCardProps {
  /** 職業資料 / Job data */
  job: IJobData;
  /** 是否使用交替背景色 / Whether to use alternating background */
  altBg?: boolean;
}

/**
 * 職業詳細卡片組件
 * Job detail card component
 */
export const JobDetailCard: React.FC<IJobDetailCardProps> = ({
  job,
  altBg = false,
}) => {
  const { id, name, spriteUrls, description, equipment, skills } = job;
  const bgClass = altBg ? 'td-alt' : 'td-base';

  return (
    <>
      {/* 第一行：職業名稱 + 精靈 + 描述 / Row 1: Name + Sprites + Description */}
      <tr>
        <td className={`job-name-cell ${bgClass}`} valign="top">
          <a name={`job-${id}`} />
          <span className="job-name-bold">{name}</span>
        </td>
        <td className={`job-sprite-cell ${bgClass}`}>
          {spriteUrls.map((url, i) => (
            <span
              key={i}
              className="job-sprite"
              style={{
                backgroundImage: `url(${url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
        </td>
        <td className={`job-desc-cell ${bgClass}`}>
          {description.split('<br />').map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </td>
      </tr>

      {/* 第二行：裝備 / Row 2: Equipment */}
      <tr>
        <td className={bgClass} colSpan={3}>
          <div className="equipment-row">
            装備 : {equipment.join(', ')}
          </div>
        </td>
      </tr>

      {/* 第三行：技能列表 / Row 3: Skill list */}
      <tr>
        <td className={bgClass} colSpan={3}>
          <div className="skills-row">
            {skills.map((skill, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                <SkillCard skill={skill} />
              </React.Fragment>
            ))}
          </div>
        </td>
      </tr>
    </>
  );
};
