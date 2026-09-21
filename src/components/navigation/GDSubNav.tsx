/**
 * GameDataPage 子導航組件
 * GameDataPage sub-navigation component
 *
 * 負責顯示子頁面連結的導航區塊
 * Handles the display of sub-page links navigation
 */
import React from 'react';
import './GDSubNav.css';
import type { INavLink } from './NavTypes';
import { NavList } from './NavList';
import { buildAppUrl } from '#/components/config/AppConfig';

/** 預設子頁面連結 / Default sub-page links */
export const DEFAULT_SUB_LINKS: INavLink[] = [
  { label: '職(Job)', href: buildAppUrl('/gamedata/job') },
  { label: 'アイテム(item)', href: buildAppUrl('/gamedata/item') },
  { label: '判定', href: buildAppUrl('/gamedata/judge') },
  { label: 'モンスター', href: buildAppUrl('/gamedata/monster') },
];

/** 子導航組件屬性 / Sub-navigation component properties */
export interface IGDSubNavProps {
  /** 子頁面連結 / Sub-page links */
  subLinks?: INavLink[];
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
      <div className="gd-subnav-links">
        {'| '}
        <NavList
          links={subLinks}
          separator={<span className="subnav-divide"> | </span>}
        />
        {' |'}
      </div>
    </div>
  );
};