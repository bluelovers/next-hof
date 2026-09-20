/**
 * HuntAreaLink 獵區卡片元件
 * HuntAreaLink component
 *
 * 以 land_frame 底座形式顯示獵場
 * Displays hunting ground area as a land_frame card
 *
 * 原始結構 / Original structure:
 * <div class="land_frame">
 *   <div class="land land_xxx"></div>
 *   <span class="g_name"><a href="...">AreaName</a></span>
 *   <span>(LvXX-XX)</span>
 * </div>
 */
import React from 'react';
import type { ILandType } from './landTypes';
import { buildLandClass } from './landTypes';

/** 獵區資料 / Hunting area data */
export interface IHuntAreaData {
  /** 獵區名稱 / Area name */
  name: string;
  /** 連結參數 land 值 / Land parameter value (e.g. "gb0") */
  land: string;
  /** 等級範圍 / Level range (e.g. "Lv1", "Lv20-30") */
  levelRange?: string;
  /** 地形背景類型（對應 land_*.png）/ Land background type (maps to land_*.png) */
  landType?: ILandType;
}

/** HuntAreaLink 屬性 / HuntAreaLink props */
export interface IHuntAreaLinkProps {
  /** 獵區資料 / Area data */
  area: IHuntAreaData;
}

/**
 * HuntAreaLink 獵區卡片元件
 * HuntAreaLink component
 */
export const HuntAreaLink: React.FC<IHuntAreaLinkProps> = ({ area }) => {
  const landClass = buildLandClass(area.landType);

  return (
    <div className="land_frame">
      {/** 地形背景底座（空 div，僅顯示背景圖） */}
      <div className={landClass} />
      {/** 區域名稱連結 */}
      <span className="g_name">
        <a href={`/battle/common?land=${area.land}`}>
          {area.name}
        </a>
      </span>
      {/** 等級範圍 */}
      {area.levelRange && (
        <span className="hunt-level-range">
          （{area.levelRange}）
        </span>
      )}
    </div>
  );
};
