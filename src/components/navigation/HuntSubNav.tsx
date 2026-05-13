/**
 * HuntSubNav 狩獵子導航元件
 * HuntSubNav component
 *
 * 顯示 CommonMonster / UnionMonster 等狩獵分類連結
 * Displays hunting category links like CommonMonster / UnionMonster
 */
import React from 'react';

/** 子導航項目 / Sub-navigation item */
export interface IHuntSubNavItem {
  /** 標籤 / Label */
  label: string;
  /** 連結 / URL */
  href: string;
  /** 是否為當前頁面 / Whether active */
  active?: boolean;
}

/** HuntSubNav 屬性 / HuntSubNav props */
export interface IHuntSubNavProps {
  /** 導航項目列表 / Nav items */
  items?: IHuntSubNavItem[];
}

/** 預設子導航項目 / Default sub-nav items */
const DEFAULT_ITEMS: IHuntSubNavItem[] = [
  { label: 'CommonMonster', href: 'http://127.0.0.1:8085/battle/list_common', active: true },
  { label: 'UnionMonster', href: 'http://127.0.0.1:8085/battle/list_union' },
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
