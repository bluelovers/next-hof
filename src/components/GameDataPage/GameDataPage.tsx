/**
 * GameDataPage 組件
 * GameDataPage component
 *
 * 仿製 Hall of Rumor ゲームデータ頁面：
 * 職業樹 + 職業詳細表格（技能卡片）
 * Replicates the Hall of Rumor game data page with job tree and job detail tables
 */
import React from 'react';
import type { IGameDataPageData } from './GameDataTypes';
import { JobDetailCard } from './JobDetailCard';
import { GDSubNav } from './GDSubNav';
import { JobTree } from './JobTree';
import { JobDetailTable } from './JobDetailTable';
import './GameDataPage.css';

/** GameDataPage 屬性 / GameDataPage props */
export interface IGameDataPageProps {
  /** 頁面資料 / Page data */
  data: IGameDataPageData;
  /** 子頁面連結 / Sub-page links */
  subLinks?: Array<{ label: string; href: string }>;
}

/**
 * GameDataPage 組件
 * GameDataPage component
 */
export const GameDataPage: React.FC<IGameDataPageProps> = ({
  data,
  subLinks,
}) => {
  return (
    <div className="gamedata-page">
      {/* 子頁面導航 / Sub-page navigation */}
      <GDSubNav subLinks={subLinks} />

      {/* 職業樹 / Job tree */}
      <div className="job-tree">
        <h4>職業(Job)</h4>
        <JobTree jobs={data.jobs} />

        {/* 職業詳細 / Job details */}
        <h4>Variety</h4>
        <JobDetailTable jobs={data.jobs} />
      </div>
    </div>
  );
};
