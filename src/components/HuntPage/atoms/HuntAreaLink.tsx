/**
 * HuntAreaLink 獵區連結元件
 * HuntAreaLink component
 *
 * 顯示獵場連結區域的名稱與等級範圍
 * Displays hunting ground link with area name and level range
 */
import React from 'react';

/** 獵區資料 / Hunting area data */
export interface IHuntAreaData {
  /** 獵區名稱 / Area name */
  name: string;
  /** 連結參數 land 值 / Land parameter value */
  land: string;
  /** 等級範圍 / Level range (e.g. "Lv1", "Lv20-30") */
  levelRange?: string;
}

/** HuntAreaLink 屬性 / HuntAreaLink props */
export interface IHuntAreaLinkProps {
  /** 獵區資料 / Area data */
  area: IHuntAreaData;
}

/**
 * HuntAreaLink 獵區連結元件
 * HuntAreaLink component
 */
export const HuntAreaLink: React.FC<IHuntAreaLinkProps> = ({ area }) => {
  return (
    <>
      <a
        className="hunt-area-link"
        href={`http://127.0.0.1:8085/battle/common?land=${area.land}`}
      >
        {area.name}
      </a>
      {area.levelRange && <span className="hunt-level-range">( {area.levelRange} )</span>}
      <br />
    </>
  );
};
