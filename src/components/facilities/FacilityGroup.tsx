/**
 * FacilityGroup 設施群組元件
 * FacilityGroup component
 *
 * 將同一類別的設施組織成群組顯示
 * Groups facilities of the same category together
 */
import React from 'react';
import { TownFacility } from './TownFacility';
import type { IFacilityData } from './TownFacility';
import './FacilityGroup.css';

/** FacilityGroup 屬性 / FacilityGroup props */
export interface IFacilityGroupProps {
  /** 群組標題 / Group title */
  title: string;
  /** 設施列表 / Facility list */
  facilities: IFacilityData[];
}

/**
 * FacilityGroup 設施群組元件
 * FacilityGroup component
 */
export const FacilityGroup: React.FC<IFacilityGroupProps> = ({
  title,
  facilities,
}) => {
  return (
    <div className="town-facility-group">
      <h4 className="town-facility-group-title">{title}</h4>
      <div className="town-facility-group-items">
        {facilities.map((facility, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="town-facility-divide"> / </span>}
            <TownFacility facility={facility} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
