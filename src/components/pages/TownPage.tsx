/**
 * TownPage 城鎮頁面元件
 * TownPage component
 *
 * 仿製 Hall of Rumor 的城鎮頁面
 * 包含：商店、人材斡旋所、鍛冶屋、拍賣場、鬥技場、廣場留言板
 * Mimics the Hall of Rumor town page
 * Includes: shops, recruit, smithy, auction, colosseum, plaza message board
 */
import React from 'react';
import './TownPage.css';
import { FacilityGroup } from '#/components/facilities/FacilityGroup';
import type { IFacilityData } from '#/components/facilities/TownFacility';
import { MessageBoard } from '#/components/facilities/MessageBoard';
import type { IMessageBoardProps } from '#/components/facilities/MessageBoard';
import { buildAppUrl } from '#/components/config/AppConfig';

/** TownPage 屬性 / TownPage props */
export interface ITownPageProps {
  /** 商店設施 / Shop facilities */
  shopFacilities?: IFacilityData[];
  /** 人材設施 / Recruit facilities */
  recruitFacilities?: IFacilityData[];
  /** 鍛造設施 / Smithy facilities */
  smithyFacilities?: IFacilityData[];
  /** 拍賣設施 / Auction facilities */
  auctionFacilities?: IFacilityData[];
  /** 鬥技設施 / Colosseum facilities */
  colosseumFacilities?: IFacilityData[];
  /** 留言板屬性 / Message board props */
  messageBoard?: IMessageBoardProps;
}

/** 預設商店設施 / Default shop facilities */
const DEFAULT_SHOP: IFacilityData[] = [
  { name: '店', nameEn: 'Shop', href: buildAppUrl('/shop') },
  { name: '買う', nameEn: 'Buy', href: buildAppUrl('/shop/buy') },
  { name: '売る', nameEn: 'Sell', href: buildAppUrl('/shop/sell') },
  { name: 'アルバイト', href: buildAppUrl('/shop/work') },
];

/** 預設人材設施 / Default recruit facilities */
const DEFAULT_RECRUIT: IFacilityData[] = [
  {
    name: '人材斡旋所',
    nameEn: 'Recruit',
    href: buildAppUrl('/recruit'),
  },
];

/** 預設鍛造設施 / Default smithy facilities */
const DEFAULT_SMITHY: IFacilityData[] = [
  {
    name: '鍛冶屋',
    nameEn: 'Smithy',
    href: buildAppUrl('/smithy'),
  },
  {
    name: '精錬工房',
    nameEn: 'Refine',
    href: buildAppUrl('/smithy/refine'),
  },
  {
    name: '製作工房',
    nameEn: 'Create',
    href: buildAppUrl('/smithy/create'),
  },
];

/** 預設拍賣設施 / Default auction facilities */
const DEFAULT_AUCTION: IFacilityData[] = [
  {
    name: 'オークション会場',
    nameEn: 'Auction',
    href: buildAppUrl('/auction'),
  },
];

/** 預設鬥技設施 / Default colosseum facilities */
const DEFAULT_COLOSSEUM: IFacilityData[] = [
  {
    name: 'コロシアム',
    nameEn: 'Colosseum',
    href: buildAppUrl('/rank'),
  },
];

/**
 * TownPage 城鎮頁面元件
 * TownPage component
 */
export const TownPage: React.FC<ITownPageProps> = ({
  shopFacilities = DEFAULT_SHOP,
  recruitFacilities = DEFAULT_RECRUIT,
  smithyFacilities = DEFAULT_SMITHY,
  auctionFacilities = DEFAULT_AUCTION,
  colosseumFacilities = DEFAULT_COLOSSEUM,
  messageBoard,
}) => {
  return (
    <div className="town-page">
      {/* 城鎮標題 / Town title */}
      <h4 className="town-page-title">街</h4>

      {/* 設施群組 / Facility groups */}
      <div className="town-facilities">
        <FacilityGroup title="店" facilities={shopFacilities} />
        <FacilityGroup title="人材" facilities={recruitFacilities} />
        <FacilityGroup title="鍛冶" facilities={smithyFacilities} />
        <FacilityGroup title="オークション" facilities={auctionFacilities} />
        <FacilityGroup title="闘技" facilities={colosseumFacilities} />
      </div>

      {/* 留言板 / Message board */}
      <MessageBoard
        title={messageBoard?.title}
        placeholder={messageBoard?.placeholder}
        buttonText={messageBoard?.buttonText}
        onPost={messageBoard?.onPost}
        messages={messageBoard?.messages}
      />
    </div>
  );
};
