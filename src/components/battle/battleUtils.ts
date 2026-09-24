/**
 * 戰鬥顯示工具函式（單一事實來源）
 * Battle display utilities (single source of truth)
 *
 * 集中維護百分比計算、條狀顏色與狀與狀態/屬性→CSS class 的對應邏輯，
 * 供 BattleUnit 與 BattleAction 共用，避免各自實作導致行為漂移。
 * Centralizes percentage math, bar colors, and status/attribute → CSS class mappings
 * so BattleUnit and BattleAction share one implementation instead of diverging.
 */
import { EnumUnitStatus, EnumAttributeType, EnumTeamSideUI, EnumTeamSideClass, EnumActionType } from './enums';
import { TEAM_SIDE_CLASS } from './types';
import { computeSpriteFlipped } from './spriteFlip';
import { corpseSpecOf } from '#/lib/game/battle/corpse-policy';
import type {
  IBattleAction,
  IBattleSegment,
  IBattleSnapshotDisplay,
  IBattleSnapshotDisplayUnit,
  IBattleSprite,
  IBattleUnit,
} from './types';

/** 條狀顏色高閾值（> 此值為高血量色） / Bar high threshold */
const BAR_HIGH_THRESHOLD = 60;
/** 條狀顏色中閾值（> 此值為中血量色，否則為低血量色） / Bar mid threshold */
const BAR_MID_THRESHOLD = 30;
/** 中/低血量共用色 / Shared mid/low bar color */
const BAR_WARN_COLOR = '#ffcc33';
/** 低血量色 / Low bar color */
const BAR_LOW_COLOR = '#cc3300';

/**
 * 計算百分比並限制在 0–100
 * Calculate a percentage clamped to 0–100
 *
 * @param value - 當前值 / Current value
 * @param max - 最大值 / Maximum value
 * @returns 0–100 的百分比 / Percentage in 0–100
 */
export function clampPercent(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

/**
 * 依百分比取得條狀顏色
 * Get bar color from percentage
 *
 * @param pct - 百分比（0–100） / Percentage (0–100)
 * @param highColor - 高血量時的顏色 / Color when above the high threshold
 * @returns CSS 顏色字串 / CSS color string
 */
export function getBarColor(pct: number, highColor: string): string {
  if (pct > BAR_HIGH_THRESHOLD) return highColor;
  if (pct > BAR_MID_THRESHOLD) return BAR_WARN_COLOR;
  return BAR_LOW_COLOR;
}

/** HP 條顏色（高血量為藍） / HP bar color (blue when high) */
export function getHpBarColor(pct: number): string {
  return getBarColor(pct, '#3366ff');
}

/** SP 條顏色（高血量為綠） / SP bar color (green when high) */
export function getSpBarColor(pct: number): string {
  return getBarColor(pct, '#66cc66');
}

/**
 * 依單位狀態取得 CSS 類別
 * Get CSS class from unit status
 */
export function getStatusClass(status?: EnumUnitStatus): string {
  switch (status) {
    case EnumUnitStatus.Down:
      return 'dmg';
    case EnumUnitStatus.Casting:
      return 'charge';
    default:
      return '';
  }
}

/**
 * 依屬性類型取得 CSS 類別
 * Get CSS class from attribute type
 */
export function getAttrClass(attr?: EnumAttributeType): string {
  switch (attr) {
    case EnumAttributeType.Dmg:
      return 'dmg';
    case EnumAttributeType.Recover:
      return 'recover';
    case EnumAttributeType.Support:
      return 'support';
    case EnumAttributeType.Charge:
      return 'charge';
    default:
      return '';
  }
}

/**
 * 依隊伍側取得 CSS 欄位 class（left → ttd2, right → ttd1）
 * Get the CSS column class for a team side (left → ttd2, right → ttd1)
 *
 * @param side - 隊伍側 / Team side
 * @returns CSS class 字串 / CSS class string
 */
export function getSideClass(side: EnumTeamSideUI): EnumTeamSideClass {
  return TEAM_SIDE_CLASS[side];
}

/**
 * 依單位狀態取得 HP/SP 文字 CSS 類別
 * Get the CSS class for HP/SP text from unit status
 *
 * 倒下時統一為 'dmg'；否則依欄位採用 fallback（HP 用 'recover'、SP 用 'support'）。
 * Down → 'dmg'; otherwise the field-specific fallback (HP: 'recover', SP: 'support').
 *
 * @param status - 單位狀態 / Unit status
 * @param fallback - 非倒下時的類別 / Class when not down
 * @returns CSS class 字串 / CSS class string
 */
export function getStateTextClass(
  status?: EnumUnitStatus,
  fallback: EnumAttributeType = EnumAttributeType.Recover
): string {
  return status === EnumUnitStatus.Down ? 'dmg' : fallback;
}

/**
 * 依戰鬥行動類型取得數值變化 CSS 類別
 * Get the CSS class for a value-change from an action type
 *
 * 傷害/倒下 → 'dmg'，治療 → 'recover'，其餘 → ''。
 * Damage/down → 'dmg', heal → 'recover', others → ''.
 *
 * @param type - 行動類型 / Action type
 * @returns CSS class 字串 / CSS class string
 */
export function getValueChangeClass(type?: EnumActionType): string {
  if (type === EnumActionType.Damage || type === EnumActionType.Down) return 'dmg';
  if (type === EnumActionType.Heal) return 'recover';
  return '';
}

/**
 * 入場訊息的後綴文字（單一事實來源）
 * Trailing text for the "enter the Battlefield" message (single source of truth)
 *
 * @param level - 單位等級（提供時顯示 "Lv.x"） / Unit level (shows "Lv.x" when given)
 * @returns 訊息後綴 / Message suffix
 */
export function getEnterBattlefieldText(level?: number): string {
  return level != null ? `Lv.${level} enter the Battlefield.` : 'enter the Battlefield.';
}

/**
 * 計算隊伍總等級（單一事實來源）
 * Calculate total team level (single source of truth)
 *
 * 從 BattleTeamInfo.tsx 提取，供多處共用。
 * Extracted from BattleTeamInfo.tsx for shared use.
 *
 * @param units - 單位列表 / Unit list
 * @returns 總等級 / Total level
 */
export function calcTotalLevel(units: { level: number }[]): number {
  return units.reduce((sum, u) => sum + u.level, 0);
}

/**
 * 計算隊伍總 HP（單一事實來源）
 * Calculate total team HP (single source of truth)
 *
 * 從 BattleTeamInfo.tsx 提取，供多處共用。
 * Extracted from BattleTeamInfo.tsx for shared use.
 *
 * @param units - 單位列表 / Unit list
 * @returns 當前 HP 總和與最大 HP 總和 / Current and max HP totals
 */
export function calcTotalHp(units: { hp: number; maxHp: number }[]): { current: number; max: number } {
  return units.reduce(
    (acc, u) => ({
      current: acc.current + u.hp,
      max: acc.max + u.maxHp,
    }),
    { current: 0, max: 0 }
  );
}

/**
 * 將行動依快照切分為多個分段（單一事實來源）
 * Split actions into segments using snapshots (single source of truth)
 *
 * 規則 / rules:
 * - 無快照（或空陣列）→ 單一分段，snapshot undefined，包含全部行動。
 * - 有快照 → 以快照的 `at` 為界，分段 i 涵蓋
 *   `actions[snapshots[i].at, snapshots[i+1].at)`（最後一段到結尾）。
 *   末端快照（`at === actions.length`）保留為「最終狀態頁」（無行動）。
 * - `at` 會先複製並穩定排序，超出範圍或負值會被夾限（防禦上游資料異常）。
 * No snapshots → a single segment (snapshot undefined) holding every action.
 * With snapshots → segment i spans `actions[at_i, at_{i+1})`; `at` values are
 * copied, stably sorted and clamped to guard against bad upstream data.
 *
 * @param actions - 依時間序的行動列表 / actions in chronological order
 * @param snapshots - 快照列表（可省略）/ snapshots (optional)
 * @returns 分段列表 / segment list
 */
export function splitActionsBySnapshots(
  actions: IBattleAction[],
  snapshots?: IBattleSnapshotDisplay[]
): IBattleSegment[] {
  if (!snapshots || snapshots.length === 0) {
    return [{ index: 0, actions }];
  }

  // 複製 + 依 at 穩定排序 + 夾限到 [0, actions.length]
  // Copy, stable-sort by `at`, then clamp into [0, actions.length]
  const bounds = snapshots
    .map((snapshot, order) => ({ snapshot, order, at: Math.max(0, Math.min(actions.length, snapshot.at)) }))
    .sort((a, b) => a.at - b.at || a.order - b.order);

  const segments: IBattleSegment[] = [];
  // 防禦：若首個界線晚於 0，先補一段「無快照」涵蓋開頭行動，避免遺失
  // Guard: if the first bound is past 0, prepend a snapshot-less segment so no action is lost
  if (bounds[0].at > 0) {
    segments.push({ index: 0, actions: actions.slice(0, bounds[0].at) });
  }
  for (let i = 0; i < bounds.length; i++) {
    const start = bounds[i].at;
    const end = i + 1 < bounds.length ? bounds[i + 1].at : actions.length;
    const isLast = i === bounds.length - 1;
    // 跳過中間的空分段；最後一段保留（末端快照＝最終狀態頁，即使沒有行動）
    // Skip empty intermediate spans; keep the last one (the trailing snapshot is the
    // final-state page even when it carries no actions).
    if (end <= start && !isLast && segments.length > 0) continue;
    segments.push({
      index: segments.length,
      snapshot: bounds[i].snapshot,
      actions: actions.slice(start, end),
    });
  }
  return segments.length > 0 ? segments : [{ index: 0, actions }];
}

/**
 * 快照單位 → 顯示用 IBattleUnit（單一事實來源）
 * Snapshot unit → display IBattleUnit (single source of truth)
 *
 * level 於快照資料中不存在，顯示層不使用故固定為 0。
 * `level` is absent from snapshots and unused by the display layer, so it is fixed at 0.
 */
export function snapshotUnitToBattleUnit(unit: IBattleSnapshotDisplayUnit): IBattleUnit {
  const status = unit.dead
    ? EnumUnitStatus.Down
    : unit.chargeKind
      ? EnumUnitStatus.Casting
      : EnumUnitStatus.Alive;
  return {
    name: unit.name,
    level: 0,
    hp: unit.hp,
    maxHp: unit.maxHp,
    sp: unit.sp,
    maxSp: unit.maxSp,
    status,
    side: unit.side,
  };
}

/**
 * 取得分段中某一側的顯示單位
 * Get the display units of one side for a segment
 *
 * 有快照時以快照為準（該時間點狀態）；無快照時回退到最終單位。
 * Uses the snapshot when present (state at that time); otherwise falls back to the final units.
 *
 * @param segment - 分段 / segment
 * @param side - 隊伍側 / team side
 * @param fallback - 無快照時使用的單位 / units used when the segment has no snapshot
 * @returns 該側顯示單位 / display units of that side
 */
export function segmentUnitsForSide(
  segment: IBattleSegment,
  side: EnumTeamSideUI,
  fallback: IBattleUnit[]
): IBattleUnit[] {
  if (!segment.snapshot) {
    return fallback.filter((unit) => unit.side === side || unit.side === undefined);
  }
  return segment.snapshot.units
    .filter((unit) => unit.side === side)
    .map(snapshotUnitToBattleUnit);
}

/**
 * 屍體精靈圖（死亡後留下屍體；依原圖目錄選擇正向／鏡像版本）
 * Corpse sprite (left behind on death; picks the forward / mirrored asset by the
 * original image's directory so facing stays consistent).
 */
export const SPRITE_CORPSE_URL = '/image/char/mon_145.png';
export const SPRITE_CORPSE_URL_REV = '/image/char_rev/mon_145.png';

/** 依原精靈圖所屬目錄選擇對應的屍體圖 / Pick the corpse asset matching the original image's directory */
function corpseUrlFor(imageUrl: string): string {
  return imageUrl.includes('/char_rev/') ? SPRITE_CORPSE_URL_REV : SPRITE_CORPSE_URL;
}

/**
 * 併合精靈與屍體規格的 CSS class（去除空白段後以空白連接）
 * Join the sprite's and the corpse spec's CSS class names (blank segments dropped)
 *
 * @param base - 精靈既有 class / the sprite's own class
 * @param extra - 屍體規格附加的 class / extra class from the corpse spec
 * @returns 併合後的 class（兩者皆空時為 undefined，避免多餘空白）
 * the joined class (undefined when both are empty, to avoid stray whitespace)
 */
function joinClassNames(base?: string, extra?: string): string | undefined {
  const joined = [base, extra]
    .map((part) => part?.trim())
    .filter((part) => part)
    .join(' ');
  return joined || undefined;
}

/**
 * 依快照解析某一段要顯示的戰場精靈（單一事實來源）
 * Resolve the battlefield sprites to show for one segment from its snapshot
 * (single source of truth)
 *
 * 以「戰鬥單位實例 unitUuid」精確比對（sprite.unitUuid ↔ snapshotUnit.unitUuid），
 * 完全不以物種 `no` 判定，因此可正確處理真實遊戲的各種情況：
 * Matches by battle-unit instance unitUuid (sprite.unitUuid ↔ snapshotUnit.unitUuid) and never
 * by species `no`, so it handles the real-game cases correctly:
 *
 * - 中途加入（召喚）：此快照尚未出現的 unitUuid 不顯示；一旦出現在快照就開始顯示。
 *   Joins (summon): a unitUuid absent from the snapshot is hidden; it appears once present.
 * - 死亡：依單位政策呈現——`corpse` 為真時改用屍體圖（SPRITE_CORPSE_URL）留在場上；
 *   `!corpse`（含未設定）時直接消失（不留屍體）。
 *   `corpse` 寫成物件時為「留下屍體」並可指定屍體圖路徑、附加 CSS class 與 inline style
 *   （見 ICorpseSpec）；未指定圖路徑時仍依原圖目錄自動挑選。
 *   Death: follows the unit's policy — when `corpse` is truthy the unit stays as a corpse
 *   (SPRITE_CORPSE_URL); when `!corpse` (including unset) it vanishes (no corpse). An object-valued
 *   `corpse` still means "leave a corpse" and additionally picks the corpse image path, an
 *   extra CSS class and an inline style (see ICorpseSpec); with no image path given the
 *   original image's directory still decides the corpse asset.
 * - 復活：快照中 dead=false 即恢復原圖（同一 unitUuid）。
 *   Revive: once the snapshot shows dead=false the original image returns (same unitUuid).
 * - 型態變化：快照提供 `imageUrl` 時以外觀覆寫呈現。
 *   Form change: when the snapshot supplies `imageUrl`, that appearance override is used.
 *
 * 無 snapshot（退化為單段）時原樣回傳。
 * Returns the input unchanged when there is no snapshot (single-segment fallback).
 *
 * @param sprites - 全部戰場精靈（含中途加入者）/ all battlefield sprites (including later joins)
 * @param snapshot - 該段對應快照（可省略）/ the segment's snapshot (optional)
 * @returns 該段要顯示的精靈（保留原圖層順序）/ sprites to show, preserving layer order
 */
export function resolveSegmentSprites(
  sprites: IBattleSprite[],
  snapshot?: IBattleSnapshotDisplay
): IBattleSprite[] {
  if (!snapshot) return sprites;

  const unitById = new Map<string, IBattleSnapshotDisplayUnit>();
  for (const unit of snapshot.units) {
    if (unit.unitUuid) unitById.set(unit.unitUuid, unit);
  }

  return sprites
    .map((sprite) => {
      const unit = sprite.unitUuid ? unitById.get(sprite.unitUuid) : undefined;
      // 此快照中不存在（尚未加入／已離場）→ 不顯示
      // Not present at this moment (not yet joined / already gone) → hidden
      if (!unit) return undefined;
      if (unit.dead) {
        // 不留屍體（corpse 為 falsy，含未設定）：死亡即消失
        // No corpse (corpse falsy, including unset): vanish on death
        if (!unit.corpse) return undefined;
        const baseImage = unit.imageUrl ?? sprite.imageUrl;
        // 物件規格（可為空物件）→ 可指定屍體圖／class／style；布林 → 走預設屍體圖
        // Object spec (may be empty) → may choose the corpse image/class/style; boolean → default corpse asset
        const spec = corpseSpecOf(unit.corpse);
        // 未指定圖路徑（或只有空白）＝沿用自動挑圖與原朝向；指定路徑則原樣採用
        // No path (or a blank one) = auto-pick the asset and keep the original facing;
        // a given path is used verbatim
        const customImage = spec?.imageUrl?.trim();
        const corpseImage = customImage || corpseUrlFor(baseImage);
        // 自訂屍體圖會換掉圖檔目錄，故以「新圖 + 隊伍側」重新推導朝向，
        // 維持兩隊皆面向場地中心（未指定圖時沿用原精靈朝向，行為不變）
        // A custom corpse image changes the image directory, so re-derive facing from
        // "new image + team side" to keep both teams facing the centre; without one the
        // sprite keeps its original facing (unchanged behaviour)
        const flipped = customImage
          ? computeSpriteFlipped(corpseImage, unit.side, { flipped: sprite.flipped })
          : sprite.flipped;
        return {
          ...sprite,
          imageUrl: corpseImage,
          flipped,
          name: unit.name,
          className: spec?.className
            ? joinClassNames(sprite.className, spec.className)
            : sprite.className,
          style: spec?.style ? { ...sprite.style, ...spec.style } : sprite.style,
        };
      }
      // 存活（含復活）；型態變化以外觀覆寫呈現
      // Alive (incl. revived); a form change is expressed via the appearance override
      return unit.imageUrl
        ? { ...sprite, imageUrl: unit.imageUrl, name: unit.name }
        : sprite;
    })
    .filter((sprite): sprite is IBattleSprite => sprite !== undefined);
}
