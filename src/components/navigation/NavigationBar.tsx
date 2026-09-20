/**
 * NavigationBar 導航欄元件（登入後）
 * NavigationBar component (post-login)
 *
 * 顯示 Top / Hunt / Item / Town / Setting / Log 導航連結
 * Displays Top / Hunt / Item / Town / Setting / Log nav links
 */
import React from 'react';
import './NavigationBar.css';
import type { INavLink } from './NavTypes';
import { buildAppUrl } from '#/components/config/AppConfig';

/** NavigationBar 屬性 / NavigationBar props */
export interface INavigationBarProps {
  /** 導航項目列表 / Nav items */
  items?: INavLink[];
}

/** 預設導航項目 / Default nav items */
const DEFAULT_NAV_ITEMS: INavLink[] = [
  { label: 'Top', href: buildAppUrl('/'), active: true },
  { label: 'Hunt', href: buildAppUrl('/battle/hunt') },
  { label: 'Item', href: buildAppUrl('/item') },
  { label: 'Town', href: buildAppUrl('/town') },
  { label: 'Setting', href: buildAppUrl('/game/setting') },
  { label: 'Log', href: buildAppUrl('/log') },
];

/**
 * NavigationBar 導航欄元件
 * NavigationBar component
 */
export const NavigationBar: React.FC<INavigationBarProps> = ({
  items = DEFAULT_NAV_ITEMS,
}) => {
  return (
    <div className="dashboard-nav">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="nav-divide" />}
          <a
            href={item.href}
            className={
              item.active
                ? 'dashboard-nav-link dashboard-nav-link-active'
                : 'dashboard-nav-link'
            }
          >
            {item.label}
          </a>
        </React.Fragment>
      ))}
    </div>
  );
};
