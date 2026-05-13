/**
 * TownFacility 城鎮設施項目元件
 * TownFacility component
 *
 * 單一設施連結，包含圖示與名稱
 * Single facility link with icon and name
 */
import React from 'react';
import '../TownPage.css';

/** 設施資料 / Facility data */
export interface IFacilityData {
  /** 設施名稱 / Facility name */
  name: string;
  /** 連結 / URL */
  href: string;
  /** 英文名稱（可選）/ English name (optional) */
  nameEn?: string;
  /** 分類圖示（可選）/ Category icon (optional) */
  icon?: string;
}

/** TownFacility 屬性 / TownFacility props */
export interface ITownFacilityProps {
  /** 設施資料 / Facility data */
  facility: IFacilityData;
}

/**
 * TownFacility 城鎮設施項目元件
 * TownFacility component
 */
export const TownFacility: React.FC<ITownFacilityProps> = ({ facility }) => {
  return (
    <a href={facility.href} className="town-facility-link">
      {facility.icon && (
        <span className="town-facility-icon">{facility.icon}</span>
      )}
      <span className="town-facility-name">
        {facility.name}
        {facility.nameEn && (
          <span className="town-facility-name-en">({facility.nameEn})</span>
        )}
      </span>
    </a>
  );
};
