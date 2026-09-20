/**
 * HuntSubNav 狩獵子導航元件
 * HuntSubNav component
 *
 * 顯示 CommonMonster / UnionMonster 等狩獵分類連結
 * Displays hunting category links like CommonMonster / UnionMonster
 */
import React from 'react';
import type { INavLink } from './NavTypes';
import { buildAppUrl } from '#/components/config/AppConfig';

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
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="subnav-separator"> / </span>}
          <a
            className="hunt-subnav-link"
            href={item.href}
          >
            {item.label}
          </a>
        </React.Fragment>
      ))}
    </div>
  );
};
