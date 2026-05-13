/**
 * DashboardPage 登入後首頁元件
 * DashboardPage component (post-login home)
 *
 * 仿製 Hall of Rumor 登入後的主頁面
 * 包含：導航列、隊伍狀態、角色列表、頁尾
 * Mimics the Hall of Rumor post-login home page
 * Includes: navigation bar, team status, character list, footer
 */
import React, { useState } from 'react';
import './DashboardPage.css';
import { NavigationBar } from './atoms/NavigationBar';
import type { INavItem } from './atoms/NavigationBar';
import { TeamStatus } from './atoms/TeamStatus';
import type { ITeamStatusProps } from './atoms/TeamStatus';
import { CharacterList } from './atoms/CharacterList';
import type { ICharacterData } from './atoms/CharacterCard';

/** DashboardPage 屬性 / DashboardPage props */
export interface IDashboardPageProps {
  /** 導航項目 / Navigation items */
  navItems?: INavItem[];
  /** 隊伍狀態 / Team status */
  teamStatus?: ITeamStatusProps;
  /** 角色列表 / Character list */
  characters?: ICharacterData[];
  /** 角色選取回調 / Character select callback */
  onCharacterSelect?: (id: string) => void;
  /** 頁尾連結 / Footer links */
  footerLinks?: Array<{ label: string; href: string }>;
  /** 版權文字 / Copyright text */
  copyright?: string;
}

/** 預設角色資料 / Default character data */
const DEFAULT_CHARACTERS: ICharacterData[] = [
  {
    id: '2f4954e7348fff17f92b46e8d72005d1',
    name: 'Mage1',
    imageUrl: 'static/image/char/mon_018.png',
    level: 3,
    className: 'Sorceress',
    hasStar: true,
    selected: false,
  },
  {
    id: '6ece402a38eab57ef07afff56535d6e1',
    name: 'Healer1',
    imageUrl: 'static/image/char/mon_214.png',
    level: 3,
    className: 'Priestess',
    hasStar: true,
    selected: true,
  },
  {
    id: 'b3e304903f09e14b8386a49a1e1e01e3',
    name: 'Hero1',
    imageUrl: 'static/image/char/mon_079.png',
    level: 3,
    className: 'Warrior',
    hasStar: true,
    selected: false,
  },
  {
    id: 'de979500692a963857ea9d68868f2958',
    name: 'Priest1',
    imageUrl: 'static/image/char/mon_214.png',
    level: 3,
    className: 'Priestess',
    hasStar: true,
    selected: false,
  },
];

/** 預設頁尾連結 / Default footer links */
const DEFAULT_FOOTER_LINKS = [
  { label: 'UpDate', href: 'http://127.0.0.1:8085/log/update' },
  { label: 'Manual', href: 'http://127.0.0.1:8085/manual' },
  { label: 'Tutorial', href: 'http://127.0.0.1:8085/manual/tutorial' },
  { label: 'GameData', href: 'http://127.0.0.1:8085/gamedata' },
  { label: 'Top', href: '#top' },
];

/**
 * DashboardPage 登入後首頁元件
 * DashboardPage component
 */
export const DashboardPage: React.FC<IDashboardPageProps> = ({
  navItems,
  teamStatus,
  characters = DEFAULT_CHARACTERS,
  onCharacterSelect,
  footerLinks = DEFAULT_FOOTER_LINKS,
  copyright = 'Copy Right Tekito 2007-2008. Fork (c) 2026 bluelovers',
}) => {
  const [selectedChar, setSelectedChar] = useState<string>(
    characters.find((c) => c.selected)?.id ?? '',
  );

  /** 處理角色選取 / Handle character selection */
  const handleSelect = (id: string) => {
    setSelectedChar(id);
    onCharacterSelect?.(id);
  };

  return (
    <div className="dashboard-page">
      {/* 導航列 / Navigation bar */}
      <NavigationBar items={navItems} />

      {/* 隊伍狀態 / Team status */}
      <TeamStatus
        teamName={teamStatus?.teamName}
        funds={teamStatus?.funds}
        timeCurrent={teamStatus?.timeCurrent}
        timeMax={teamStatus?.timeMax}
      />

      {/* 角色列表 / Character list */}
      <CharacterList
        characters={characters.map((c) => ({
          ...c,
          selected: c.id === selectedChar,
        }))}
        onSelect={handleSelect}
      />

      {/* 頁尾 / Footer */}
      <div className="dashboard-footer">
        {footerLinks.map((link, i) => (
          <React.Fragment key={i}>
            {i > 0 && ' - '}
            <a href={link.href} className="footer-link">
              {link.label}
            </a>
          </React.Fragment>
        ))}
        <br />
        <span className="footer-copyright">{copyright}</span>
      </div>
    </div>
  );
};
