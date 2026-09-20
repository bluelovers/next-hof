/**
 * HomePage 首頁組件
 * HomePage component
 *
 * 仿製 Hall of Rumor 首頁：
 * 左側：遊戲簡介
 * 右側：登入表單 + Ranking
 * Contains game description, login form, and ranking table
 */
import React, { useState } from 'react';
import './HomePage.css';
import { LoginForm } from '#/components/auth/LoginForm';
import { RankingTable } from '#/components/info/RankingTable';
import type { IRankingEntry } from '#/components/info/RankingTable';
import { GameDescription } from '#/components/info/GameDescription';
import { InfoSection } from '#/components/info/InfoSection';
import { buildAppUrl } from '#/components/config/AppConfig';

/** HomePage 屬性 / HomePage props */
export interface IHomePageProps {
  /** 排行榜資料 / Ranking data */
  ranking?: IRankingEntry[];
  /** 線上使用者數 / Online users */
  onlineUsers?: number;
  /** 最大容納數 / Max users */
  maxUsers?: number;
  /** 資料保留天數 / Data retention days */
  retentionDays?: number;
  /** 登入按鈕回調 / Login callback */
  onLogin?: (id: string, password: string) => void;
  /** 新遊戲連結 / New game link */
  newGameUrl?: string;
}

/**
 * HomePage 首頁組件
 * HomePage component
 */
export const HomePage: React.FC<IHomePageProps> = ({
  ranking = [],
  onlineUsers = 1,
  maxUsers = 500,
  retentionDays = 14,
  onLogin,
  newGameUrl = buildAppUrl('/game/newgame'),
}) => {
  return (
    <div className="home-page">
      <div className="hp-container">
        {/* 右欄：登入 + Ranking / Right column: Login + Ranking */}
        <div className="hp-right">
          {/* 登入表單 / Login form */}
          <LoginForm 
            onLogin={onLogin}
            newGameUrl={newGameUrl}
          />

          {/* Ranking / Ranking table */}
          <RankingTable 
            ranking={ranking}
          />
        </div>

        {/* 左欄：遊戲簡介 / Left column: Game description */}
        <div className="hp-left">
          <GameDescription />
        </div>

        <div className="c-both" />
      </div>

      {/* 資訊 / Info section */}
      <InfoSection 
        onlineUsers={onlineUsers}
        maxUsers={maxUsers}
        retentionDays={retentionDays}
      />
    </div>
  );
};