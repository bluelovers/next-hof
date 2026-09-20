/**
 * 角色型別（單一事實來源）
 * Character types (single source of truth)
 *
 * CharacterCard 與 BattleCharacterCard 的資料形狀幾乎相同，僅選取旗標不同
 * （單選 selected / 多選 checked）。以 ICharacterBase 定義共用欄位，
 * 再由兩者各自擴充，避免重複維護同一組欄位。
 * CharacterCard and BattleCharacterCard share an almost identical shape, differing
 * only in the selection flag (single-select `selected` / multi-select `checked`).
 * ICharacterBase holds the shared fields; each card extends it, so the field set is
 * maintained in one place.
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
}

/** 角色資料（單選） / Character data (single-select) */
export interface ICharacterData extends ICharacterBase {
  /** 是否選取 / Whether selected */
  selected?: boolean;
}

/** 戰鬥編成角色資料（多選） / Battle formation character data (multi-select) */
export interface IBattleCharacterData extends ICharacterBase {
  /** 是否勾選 / Whether checked */
  checked?: boolean;
}
