/**
 * RankingTable 排行榜表格元件
 * RankingTable component
 *
 * Hall of Rumor 風格的排行榜表格
 * Hall of Rumor styled ranking table
 */
import React from 'react';
import './RankingTable.css';

/** 排行条目 / Ranking entry */
export interface IRankingEntry {
  /** 排名 / Rank */
  rank: number;
  /** 隊伍名稱 / Team name */
  teamName: string;
}

/** RankingTable 屬性 / RankingTable props */
export interface IRankingTableProps {
  /** 排行榜資料 / Ranking data */
  ranking?: IRankingEntry[];
  /** 是否顯示標題 / Whether to show title */
  showTitle?: boolean;
  /** 表格標題 / Table title */
  title?: string;
}

/**
 * RankingTable 排行榜表格元件
 * RankingTable component
 */
export const RankingTable: React.FC<IRankingTableProps> = ({
  ranking = [],
  showTitle = true,
  title = 'Ranking',
}) => {
   return (
     <div className="ranking-table-wrapper">
       {showTitle && <h4>{title}</h4>}
       <table className="ranking-table" cellSpacing="0">
        <thead>
          <tr>
            <td className="td-header" style={{ width: 40 }}>順位</td>
            <td className="td-header">チーム</td>
          </tr>
        </thead>
        <tbody>
          {ranking.length === 0 ? (
            <tr>
              <td colSpan={2} style={{ padding: 10, textAlign: 'center', color: '#5a708f' }}>
                No data
              </td>
            </tr>
          ) : (
            ranking.map((entry, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'center', padding: 3 }}>{entry.rank}</td>
                <td style={{ padding: 3 }}>{entry.teamName}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
