/**
 * HuntSubNav 狩獵子導航元件
 * HuntSubNav component
 *
 * 顯示 CommonMonster / UnionMonster 等狩獵分類連結
 * Displays hunting category links like CommonMonster / UnionMonster
 */
import React from 'react';
import type { INavLink } from './NavTypes';
import { NavList } from './NavList';
import { buildAppUrl } from '#/components/config/AppConfig';
import './HuntSubNav.css';

/** HuntSubNav 屬性 / HuntSubNav props */
export interface IHuntSubNavProps {
  /** 導航項目列表 / Nav items */
  items?: INavLink[];
}

/** 預設子導航項目 / Default sub-nav items */
const DEFAULT_ITEMS: INavLink[] = [
  { label: 'CommonMonster', href: buildAppUrl('/battle/list_common'), active: true },
  { label: 'UnionMonster', href: buildAppUrl('/battle/list_union') },
];

/**
 * HuntSubNav 狩獵子導航元件
 * HuntSubNav component
 */
export const HuntSubNav: React.FC<IHuntSubNavProps> = ({
  items = DEFAULT_ITEMS,
}) => {
  return (
    <div className="hunt-subnav">
      <NavList
        links={items}
        separator={<span className="subnav-separator"> / </span>}
        linkClassName="hunt-subnav-link"
      />
    </div>
  );
};
