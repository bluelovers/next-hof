/**
 * InfoSection 資訊區域元件
 * InfoSection component
 *
 * Hall of Rumor 風格的系統資訊區域
 * Hall of Rumor styled system info section
 */
import React from 'react';
import './InfoSection.css';

/** InfoSection 屬性 / InfoSection props */
export interface IInfoSectionProps {
  /** 線上使用者數 / Online users */
  onlineUsers?: number;
  /** 最大容納數 / Max users */
  maxUsers?: number;
  /** 資料保留天數 / Data retention days */
  retentionDays?: number;
}

/**
 * InfoSection 資訊區域元件
 * InfoSection component
 */
export const InfoSection: React.FC<IInfoSectionProps> = ({
  onlineUsers = 1,
  maxUsers = 500,
  retentionDays = 14,
}) => {
   return (
     <div className="info-section-wrapper">
       <h4>info.</h4>
       <div className="info-text">
         Users : {onlineUsers} / {maxUsers}
       </div>
       <div className="info-text">
         {retentionDays} 日データに変化無しでデータ消える。
       </div>
     </div>
   );
};
