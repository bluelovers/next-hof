/**
 * GameLayout 共用佈局組件
 * GameLayout shared layout component
 *
 * 提供 Hall of Rumor 風格的共用頁面佈局
 * Provides Hall of Rumor-style shared page layout
 */
import React from 'react';
import './GameLayout.css';
import type { INavLink } from '#/components/navigation/NavTypes';
import { buildAppUrl } from '#/components/config/AppConfig';

/** GameLayout 屬性 / GameLayout props */
export interface IGameLayoutProps {
  /** 子內容 / Child content */
  children: React.ReactNode;
  /** 導航連結列表 / Nav link list */
  navLinks?: INavLink[];
  /** 副標題 / Subtitle */
  subtitle?: string;
  /** 頁尾連結列表 / Footer link list */
  footerLinks?: INavLink[];
  /** 版權文字 / Copyright text */
  copyright?: string;
}

/** 預設導航連結 / Default nav links */
const DEFAULT_NAV_LINKS: INavLink[] = [
  { label: 'トップ', href: buildAppUrl() },
  { label: '新規', href: buildAppUrl('/game/newgame') },
  { label: 'ルールとマニュアル', href: buildAppUrl('/manual') },
  { label: 'ゲームデータ', href: buildAppUrl('/gamedata') },
  { label: '戦闘ログ', href: buildAppUrl('/log') },
];

/** 預設頁尾連結 / Default footer links */
const DEFAULT_FOOTER_LINKS: INavLink[] = [
  { label: 'UpDate', href: buildAppUrl('/log/update') },
  { label: 'Manual', href: buildAppUrl('/manual') },
  { label: 'Tutorial', href: buildAppUrl('/manual/tutorial') },
  { label: 'GameData', href: buildAppUrl('/gamedata') },
  { label: 'Top', href: '#top' },
];

/**
 * GameLayout 共用佈局組件
 * GameLayout shared layout component
 */
export const GameLayout: React.FC<IGameLayoutProps> = ({
  children,
  navLinks = DEFAULT_NAV_LINKS,
  subtitle = 'Welcome to [ Hall of Rumor 噂のホール ]',
  footerLinks = DEFAULT_FOOTER_LINKS,
  copyright = 'Copy Right Tekito 2007-2008. Fork (c) 2026 bluelovers',
}) => {
  return (
    <div className="game-layout">
      <a name="top" />

      {/* 標題區 / Title */}
      <div className="game-title">
        <img
          src="/image/title03.png"
          alt="Hall of Rumor 噂のホール"
        />
      </div>

      {/* 導航欄 / Navigation */}
      <div className="game-nav">
        {navLinks.map((link, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="nav-divide" />}
            <a
              href={link.href}
              className={link.active ? 'nav-link-active' : undefined}
            >
              {link.label}
            </a>
          </React.Fragment>
        ))}
      </div>

      {/* 副標題 / Subtitle */}
      <div className="game-subtitle">{subtitle}</div>

      {/* 內容區 / Content */}
      <div className="game-content">{children}</div>

      {/* 頁尾 / Footer */}
      <div className="game-footer">
        {footerLinks.map((link, i) => (
          <React.Fragment key={i}>
            {i > 0 && ' - '}
            <a href={link.href}>{link.label}</a>
          </React.Fragment>
        ))}
        <br />
        {copyright}
      </div>
    </div>
  );
};
