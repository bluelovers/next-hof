/**
 * 地形型別與工具（單一事實來源）
 * Land types and utilities (single source of truth)
 *
 * 地形的字串列舉與 land CSS class 組合邏輯原本散見於 MonsterCard / HuntAreaLink /
 * HuntPage / BattlePage，各自維護容易漂移。集中於此，作為地形相關定義的唯一來源。
 * The land string union and the `land land_*` CSS class builder were scattered across
 * MonsterCard / HuntAreaLink / HuntPage / BattlePage; centralizing them here prevents drift.
 */

/** 地形類型 / Land type */
export type ILandType =
  | 'aband'
  | 'grass'
  | 'grass01'
  | 'sea'
  | 'cave'
  | 'snow'
  | 'swamp'
  | 'ocean0'
  | 'sand'
  | 'sand1'
  | 'mount'
  | 'lava'
  | 'pavement01'
  | 'build01'
  | 'jungle'
  | 'nest'
  | 'noimage';

/**
 * 組合地形 CSS class（land land_<type>，無類型時僅 land）
 * Build land CSS class (land land_<type>; falls back to just `land`)
 *
 * @param landType - 地形類型 / Land type
 * @returns CSS class 字串 / CSS class string
 */
export function buildLandClass(landType?: string): string {
  return landType ? `land land_${landType}` : 'land';
}
