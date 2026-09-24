/**
 * 分段導覽組件
 * Segment navigation component
 *
 * 多分段時顯示「上一段 / 目前進度 / 下一段」的錨點導覽
 * （以 `#battle-seg-N` 錨點跳轉，無 JS）；單一分段時不輸出任何內容。
 * When there are several segments, shows a "prev / current progress / next" anchor
 * navigation (jumps via `#battle-seg-N` anchors, no JS); renders nothing for a single
 * segment.
 *
 * 原始來源：src/components/pages/BattleDisplay.tsx 的分段導覽區塊
 * Source: the segment-navigation block of src/components/pages/BattleDisplay.tsx
 */
import React from 'react';
import './BattleSegmentNav.css';

/** 分段導覽屬性 / Segment navigation props */
export interface IBattleSegmentNavProps {
  /** 目前分段索引（0 起）/ Current segment index (0-based) */
  index: number;
  /** 分段總數 / Total number of segments */
  total: number;
}

/**
 * 分段導覽組件
 * Segment navigation component
 */
export const BattleSegmentNav: React.FC<IBattleSegmentNavProps> = ({ index, total }) => {
  // 單一分段不需導覽 / No navigation needed for a single segment
  if (total <= 1) return null;

  const hasPrev = index > 0;
  const hasNext = index < total - 1;

  return (
    <nav className="battle-segment-nav" aria-label="segment navigation">
      {hasPrev ? (
        <a className="battle-segment-link" href={`#battle-seg-${index - 1}`}>
          &lt;&lt;
        </a>
      ) : (
        <span className="battle-segment-link battle-segment-link--disabled" aria-hidden="true">
          &lt;&lt;
        </span>
      )}
      <span className="battle-segment-counter">
        {index + 1} / {total}
      </span>
      {hasNext ? (
        <a className="battle-segment-link" href={`#battle-seg-${index + 1}`}>
          &gt;&gt;
        </a>
      ) : (
        <span className="battle-segment-link battle-segment-link--disabled" aria-hidden="true">
          &gt;&gt;
        </span>
      )}
    </nav>
  );
};
