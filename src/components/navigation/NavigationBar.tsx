/**
 * NavigationBar 導航欄元件（登入後）
 * NavigationBar component (post-login)
 *
 * 顯示 Top / Hunt / Item / Town / Setting / Log 導航連結
 * Displays Top / Hunt / Item / Town / Setting / Log nav links
 */
import React from 'react';
import './NavigationBar.css';

/** 導航項目 / Nav item */
export interface INavItem {
  /** 標籤 / Label */
  label: string;
  /** 連結 / URL */
  href: string;
  /** 是否啟用中 / Whether it's the current page */
  active?: boolean;
}

/** NavigationBar 屬性 / NavigationBar props */
export interface INavigationBarProps {
  /** 導航項目列表 / Nav items */
  items?: INavItem[];
}

/** 預設導航項目 / Default nav items */
const DEFAULT_NAV_ITEMS: INavItem[] = [
  { label: 'Top', href: 'http://127.0.0.1:8085/', active: true },
  { label: 'Hunt', href: 'http://127.0.0.1:8085/battle/hunt' },
  { label: 'Item', href: 'http://127.0.0.1:8085/item' },
  { label: 'Town', href: 'http://127.0.0.1:8085/town' },
  { label: 'Setting', href: 'http://127.0.0.1:8085/game/setting' },
  { label: 'Log', href: 'http://127.0.0.1:8085/log' },
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
