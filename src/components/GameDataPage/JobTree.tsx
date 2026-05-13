/**
 * 職業樹組件
 * Job tree component
 *
 * 負責將扁平的職業列表轉換為樹狀結構並渲染
 * Converts flat job list to tree structure and renders it
 */
import React from 'react';
import type { IJobData } from './GameDataTypes';
import { buildJobTree, renderJobTreeNode } from './utils/jobTreeUtils';

/** 職業樹組件屬性 / Job tree component properties */
export interface IJobTreeProps {
  /** 職業列表 / Job list */
  jobs: IJobData[];
}

/**
 * 職業樹組件
 * Job tree component
 */
export const JobTree: React.FC<IJobTreeProps> = ({ jobs }) => {
  const jobTree = buildJobTree(jobs);

  return (
    <ul>
      {jobTree.map((node) => renderJobTreeNode(node))}
    </ul>
  );
};