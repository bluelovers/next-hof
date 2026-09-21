/**
 * 角色型別（單一事實來源）
 * Character types (single source of truth)
 *
 * ICharacterBase 定義所有角色共用欄位，
 * ICharacterData（單選）與 IBattleCharacterData（多選）各自擴充。
 * ICharacterBase holds shared fields; ICharacterData (single-select)
 * and IBattleCharacterData (multi-select) extend it.
 */

/** 角色資料基礎欄位 / Character base fields */
export interface ICharacterBase {
  /** 角色 ID / Character ID */
  id: string;
  /** 角色名稱 / Character name */
  name: string;
  /** 圖像路徑 / Image path */
  imageUrl: string;
  /** 等級 / Level */
  level: number;
  /** 職業 / Class */
  className: string;
  /** 是否有星標記 / Has star marker */
  hasStar?: boolean;
  /** 是否啟用/選取（統一旗標）/ Whether active/selected (unified flag) */
  active?: boolean;
}

/** 角色資料（單選 radio） / Character data (single-select radio) */
export interface ICharacterData extends ICharacterBase {
  /** 是否選取 / Whether selected */
  selected?: boolean;
}

/** 戰鬥編成角色資料（多選 checkbox） / Battle character data (multi-select checkbox) */
export interface IBattleCharacterData extends ICharacterBase {
  /** 是否勾選 / Whether checked */
  checked?: boolean;
}
