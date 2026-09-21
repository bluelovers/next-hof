/**
 * NavList 共享導航列表元件
 * Shared navigation list component
 *
 * 抽取自 NavigationBar / GDSubNav / HuntSubNav / GameLayout / DashboardPage
 * 中重複的 .map() + Fragment + 分隔線 + 連結 渲染邏輯，
 * 統一為單一事實來源。
 *
 * Extracted from the duplicated .map() + Fragment + separator + link
 * rendering logic in NavigationBar / GDSubNav / HuntSubNav / GameLayout /
 * DashboardPage, unified as single source of truth.
 */
import React from 'react';
import type { INavLink } from './NavTypes';

/** NavList 屬性 / NavList props */
export interface INavListProps {
  /** 導航項目列表 / Nav items */
  links: INavLink[];
  /** 分隔元素 / Separator element */
  separator?: React.ReactNode;
  /** 連結基礎 class 名 / Base link class name */
  linkClassName?: string;
  /** 活躍狀態 class 名 / Active state class name */
  activeClassName?: string;
}

/**
 * NavList 共享導航列表元件
 * Shared navigation list component
 */
export const NavList: React.FC<INavListProps> = ({
  links,
  separator = null,
  linkClassName = '',
  activeClassName = '',
}) => {
  return (
    <>
      {links.map((link, i) => (
        <React.Fragment key={i}>
          {i > 0 && separator}
          <a
            href={link.href}
            className={
              link.active && activeClassName
                ? `${linkClassName} ${activeClassName}`.trim()
                : linkClassName || undefined
            }
          >
            {link.label}
          </a>
        </React.Fragment>
      ))}
    </>
  );
};
