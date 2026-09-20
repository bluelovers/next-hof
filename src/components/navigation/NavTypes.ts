/**
 * 導航型別（單一事實來源）
 * Navigation types (single source of truth)
 *
 * 供 NavigationBar / GameLayout / HuntSubNav / GDSubNav 等所有導航類元件共用，
 * 避免各檔案各自維護相同的 { label; href; active? } 形狀。
 * Shared by every nav-style component so the { label; href; active? } shape is
 * defined once instead of being re-declared in each file.
 */

/** 導航連結 / Nav link */
export interface INavLink {
  /** 標籤 / Label */
  label: string;
  /** 連結 / URL */
  href: string;
  /** 是否為當前頁面 / Whether active */
  active?: boolean;
}
