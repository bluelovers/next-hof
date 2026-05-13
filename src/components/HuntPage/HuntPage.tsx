/**
 * HuntPage 狩獵列表頁元件
 * HuntPage component (hunting grounds list)
 *
 * 顯示所有可狩獵區域的列表
 * Displays list of all available hunting grounds
 */
import React from 'react';
import './HuntPage.css';
import type { IHuntSubNavItem } from './atoms/HuntSubNav';
import { HuntSubNav } from './atoms/HuntSubNav';
import type { IHuntAreaData } from './atoms/HuntAreaLink';
import { HuntAreaLink } from './atoms/HuntAreaLink';

/** HuntPage 屬性 / HuntPage props */
export interface IHuntPageProps {
  /** 頁面標題 / Page title */
  title?: string;
  /** 子導航項目 / Sub-nav items */
  subNavItems?: IHuntSubNavItem[];
  /** 區域分類標題 / Area section title */
  sectionTitle?: string;
  /** 獵區列表 / Area list */
  areas?: IHuntAreaData[];
}

/** 預設獵區資料 / Default area data */
const DEFAULT_AREAS: IHuntAreaData[] = [
  { name: 'ヒルズブロウ地区', land: 'blow01', levelRange: 'Lv20-30' },
  { name: '略奪者の砂漠', land: 'des01', levelRange: 'Lv5-10' },
  { name: 'ゴブリンと遊ぶ(最弱)', land: 'gb0', levelRange: 'Lv1' },
  { name: 'ちょっと強いゴブリン', land: 'gb1', levelRange: 'Lv1-5' },
  { name: 'ゴブリンの戦士達', land: 'gb2', levelRange: 'Lv3-8' },
  { name: '火山ふもと', land: 'mt0', levelRange: 'Lv??' },
  { name: '海中', land: 'ocean0', levelRange: 'Lv??' },
  { name: '海中2', land: 'ocean1', levelRange: 'Lv??' },
  { name: '賊の巣窟', land: 'plund01', levelRange: 'Lv10-15' },
  { name: '砂漠', land: 'sand0', levelRange: 'Lv??' },
  { name: '海', land: 'sea0', levelRange: 'Lv??' },
  { name: '海(西海岸)', land: 'sea1', levelRange: 'Lv??' },
  { name: '沼', land: 'swamp0', levelRange: 'Lv??' },
  { name: '集落?', land: 'swamp1', levelRange: 'Lv??' },
  { name: '火山(中腹)', land: 'volc0', levelRange: 'Lv??' },
  { name: '火山(頂上)', land: 'volc1', levelRange: 'Lv??' },
];

/**
 * HuntPage 狩獵列表頁元件
 * HuntPage component
 */
export const HuntPage: React.FC<IHuntPageProps> = ({
  title = 'Hunt',
  subNavItems,
  sectionTitle = 'CommonMonster',
  areas = DEFAULT_AREAS,
}) => {
  return (
    <div className="hunt-page">
      <h4>{title}</h4>
      <HuntSubNav items={subNavItems} />
      <h4>{sectionTitle}</h4>
      <div className="hunt-area-list">
        {areas.map((area) => (
          <HuntAreaLink key={area.land} area={area} />
        ))}
      </div>
    </div>
  );
};
