/**
 * 職業詳細表格組件
 * Job detail table component
 *
 * 負責顯示職業詳細資料的表格容器
 * Handles the container for displaying job detail data
 */
import React from 'react';
import type { IJobData } from './GameDataTypes';
import { JobDetailCard } from './JobDetailCard';

/** 職業詳細表格組件屬性 / Job detail table component properties */
export interface IJobDetailTableProps {
  /** 職業列表 / Job list */
  jobs: IJobData[];
}

/**
 * 職業詳細表格組件
 * Job detail table component
 */
export const JobDetailTable: React.FC<IJobDetailTableProps> = ({ jobs }) => {
  return (
    <table className="job-detail-table" cellSpacing="0">
      <tbody>
        {jobs.map((job, i) => (
          <JobDetailCard
            key={job.id}
            job={job}
            altBg={i % 2 === 1}
          />
        ))}
      </tbody>
    </table>
  );
};