/**
 * 怪物資料型別（單一事實來源）
 * Monster data types (single source of truth)
 *
 * 將怪物領域的型別集中於此，避免定義散落於元件檔案內。
 * Centralizes monster-domain types instead of defining them inside a component file.
 */
import type { ILandType } from '#/components/areas/landTypes';

/** 怪物資料 / Monster data */
export interface IMonsterData {
  /** 怪物名稱 / Monster name */
  name: string;
  /** 怪物圖片 URL / Monster image URL */
  imageUrl: string;
  /** 等級 / Level */
  level: number;
  /** 地形類型（影響背景圖）/ Land type (affects background image) */
  landType?: ILandType;
}
