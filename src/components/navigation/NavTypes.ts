/**
 * 導航型別與共享常數（單一事實來源）
 * Navigation types and shared constants (single source of truth)
 *
 * 供 NavigationBar / GameLayout / HuntSubNav / GDSubNav 等所有導航類元件共用，
 * 避免各檔案各自維護相同的 { label; href; active? } 形狀。
 * Shared by every nav-style component so the { label; href; active? } shape is
 * defined once instead of being re-declared in each file.
 */
import { buildAppUrl } from '#/components/config/AppConfig';

/** 導航連結 / Nav link */
export interface INavLink {
  /** 標籤 / Label */
  label: string;
  /** 連結 / URL */
  href: string;
  /** 是否為當前頁面 / Whether active */
  active?: boolean;
}

/** 預設頁尾連結（單一事實來源）/ Default footer links (single source of truth) */
export const DEFAULT_FOOTER_LINKS: INavLink[] = [
  { label: 'UpDate', href: buildAppUrl('/log/update') },
  { label: 'Manual', href: buildAppUrl('/manual') },
  { label: 'Tutorial', href: buildAppUrl('/manual/tutorial') },
  { label: 'GameData', href: buildAppUrl('/gamedata') },
  { label: 'Top', href: '#top' },
];

/** 版權宣告文字（單一事實來源）/ Copyright text (single source of truth) */
export const COPYRIGHT_TEXT = 'Copy Right Tekito 2007-2008. Fork (c) 2026 bluelovers';
