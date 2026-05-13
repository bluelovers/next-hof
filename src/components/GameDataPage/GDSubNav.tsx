/**
 * GameDataPage 子導航組件
 * GameDataPage sub-navigation component
 *
 * 負責顯示子頁面連結的導航區塊
 * Handles the display of sub-page links navigation
 */
import React from 'react';

/** 預設子頁面連結 / Default sub-page links */
export const DEFAULT_SUB_LINKS = [
  { label: '職(Job)', href: 'http://127.0.0.1:8085/gamedata/job' },
  { label: 'アイテム(item)', href: 'http://127.0.0.1:8085/gamedata/item' },
  { label: '判定', href: 'http://127.0.0.1:8085/gamedata/judge' },
  { label: 'モンスター', href: 'http://127.0.0.1:8085/gamedata/monster' },
];

/** 子導航組件屬性 / Sub-navigation component properties */
export interface IGDSubNavProps {
  /** 子頁面連結 / Sub-page links */
  subLinks?: Array<{ label: string; href: string }>;
}

/**
 * GameDataPage 子導航組件
 * GameDataPage sub-navigation component
 */
export const GDSubNav: React.FC<IGDSubNavProps> = ({
  subLinks = DEFAULT_SUB_LINKS,
}) => {
  return (
    <div className="gd-subnav">
      <h4>GameData</h4>
      <div style={{ margin: '0 20px' }}>
        {'| '}
        {subLinks.map((link, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="subnav-divide"> | </span>}
            <a href={link.href}>{link.label}</a>
          </React.Fragment>
        ))}
        {' |'}
      </div>
    </div>
  );
};