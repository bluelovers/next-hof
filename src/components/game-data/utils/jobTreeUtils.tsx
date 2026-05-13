/**
 * 職業樹工具函數
 * Job tree utility functions
 *
 * 提供職業樹的建立和渲染功能
 * Provides job tree building and rendering functionality
 */
import type { IJobData } from '#/components/game-data/GameDataTypes';

/** 職業樹節點 / Job tree node */
export interface IJobTreeNode {
  /** 職業 / Job */
  job: IJobData;
  /** 子職業 / Child jobs */
  children: IJobTreeNode[];
}

/**
 * 建立職業樹 / Build job tree from flat job list
 *
 * 將扁平的職業列表轉換為樹狀結構，建立父子關係
 * Converts flat job list to tree structure, building parent-child relationships
 *
 * @param jobs - 扁平的職業列表 / Flat job list
 * @returns 樹狀結構的職業列表 / Tree-structured job list
 */
export function buildJobTree(jobs: IJobData[]): IJobTreeNode[] {
  const tree: IJobTreeNode[] = [];
  const map = new Map<number, IJobTreeNode>();

  // 建立所有節點 / Create all nodes
  for (const job of jobs) {
    map.set(job.id, { job, children: [] });
  }

  // 建立父子關係 / Build parent-child relationships
  for (const job of jobs) {
    const node = map.get(job.id)!;
    if (job.parentId === 0) {
      tree.push(node);
    } else {
      const parent = map.get(job.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        tree.push(node);
      }
    }
  }

  return tree;
}

/**
 * 渲染職業樹節點 / Render job tree node
 *
 * 遞迴渲染職業樹的每個節點，包含嵌套的子節點
 * Recursively renders each job tree node, including nested child nodes
 *
 * @param node - 職業樹節點 / Job tree node
 * @param depth - 當前深度（用於縮排） / Current depth (for indentation)
 * @returns React 節點 / React node
 */
export function renderJobTreeNode(node: IJobTreeNode, depth: number = 0): React.ReactNode {
  return (
    <li key={node.job.id} style={{ marginLeft: depth === 0 ? 0 : 40 }}>
      <a href={`#job-${node.job.id}`}>{node.job.name}</a>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => renderJobTreeNode(child, depth + 1))}
        </ul>
      )}
    </li>
  );
}