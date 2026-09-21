/**
 * Storybook 共用裝飾器（單一事實來源）
 * Shared Storybook decorators (single source of truth)
 *
 * 所有故事原本各自維護深色背景 / 置中 / 縮放 / 舞台等裝飾器，
 * 現統一收斂到此處，避免重複定義與魔術值散落。
 * Stories previously maintained dark-background / centering / scale / stage
 * decorators individually. They are now consolidated here to avoid duplicated
 * definitions and scattered magic values.
 */
import React from 'react';

/** 遊戲深色背景色（原各處硬編碼 #10151b） / Dark game background color */
export const DARK_BG_COLOR = '#10151b';

/** 舞台上相對定位容器的背景色（battle 舞台） / Stage container background */
export const STAGE_BG_COLOR = '#1a2230';

/** 淺色文字（Arial 變體使用） / Light text color (Arial variants) */
export const LIGHT_TEXT_COLOR = '#e0e0e0';

/** 遊戲字型（メイリオ / Meiryo） / Game font family */
export const GAME_FONT = "'メイリオ', Meiryo, 'MS PGothic', Verdana, sans-serif";

/* ==================== 裝飾器預設值（單一事實來源） / Decorator defaults (SoT) ==================== */

/** 深色裝飾器預設 padding / Default padding for dark decorator */
export const DARK_PADDING = '20px';

/** 置中裝飾器預設最大寬度 / Default max-width for centered decorator */
export const CENTERED_MAX_WIDTH = 800;

/** 縮放裝飾器預設倍率 / Default scale for scale decorator */
export const DEFAULT_SCALE = 1;

/** 舞台裝飾器預設 padding / Default padding for stage decorator */
export const STAGE_PADDING = '12px';

/** 舞台裝飾器預設圓角 / Default border radius for stage decorator */
export const STAGE_BORDER_RADIUS = '4px';

/** 首頁風格外層 className（home-page 版型，多個故事共用） / Home-page outer className */
export const HOME_PAGE_CLASS = 'home-page';

/** 暗色裝飾器內文靜音色文字（battle 日誌/導覽等，多故事共用） / Muted text color for dark decorators */
export const MUTED_TEXT_COLOR = '#bdc8d7';

/** 暗色裝飾器預設字型大小（多故事共用） / Default font size for dark decorators */
export const DARK_FONT_SIZE = '12px';

/* ==================== 裝飾器簽章與參數型別 / Decorator signature & param types ==================== */

/**
 * 裝飾器函式簽章（單一事實來源）
 * Decorator function signature (single source of truth)
 *
 * 所有 make* 工廠共用此簽章，避免各工廠重複定義回傳型別。
 * All make* factories share this signature instead of re-declaring their return type.
 */
export type Decorator = (
  Story: React.FC,
  context?: { args: Record<string, unknown> }
) => React.ReactElement;

/** 裝飾器接受的樣式選項 / Decorator style options */
export interface DarkDecoratorOptions extends React.CSSProperties {
  /** 是否以 <table> 包裝（渲染 <td> 的元件如 battle 表格需要） / Wrap with <table> */
  table?: boolean;
  /** 內層 <table> 的額外樣式 / Extra style for the inner <table> */
  tableStyle?: React.CSSProperties;
  /** 外層 div 的 className（如 'home-page'） / Outer div className */
  className?: string;
}

/** 置中裝飾器選項 / Centered decorator options */
export interface CenteredDecoratorOptions {
  /** 最大寬度（px），預設 CENTERED_MAX_WIDTH / Max width in px */
  maxWidth?: number;
}

/** 縮放裝飾器選項 / Scale decorator options */
export interface ScaleDecoratorOptions {
  /** 縮放倍率，預設 DEFAULT_SCALE / Scale factor */
  scale?: number;
}

/** 彈性排列裝飾器選項（直接以 CSSProperties 作為選項，與 DarkDecoratorOptions 同構） / Flex decorator options (CSSProperties) */
export type FlexDecoratorOptions = React.CSSProperties;

/**
 * 深色背景裝飾器工廠（單一事實來源）
 * Dark-background decorator factory (single source of truth)
 *
 * 基底為深色背景 + 遊戲字型 + 20px padding，其餘樣式由呼叫方帶入。
 * Base is dark background + game font + 20px padding; remaining styles are
 * supplied by the caller.
 */
export const makeDarkDecorator = (
  options: DarkDecoratorOptions = {}
): Decorator => {
  const { table, tableStyle, className, ...rest } = options;
  const base: React.CSSProperties = {
    backgroundColor: DARK_BG_COLOR,
    fontFamily: GAME_FONT,
    padding: DARK_PADDING,
  };
  const style = { ...base, ...rest };

  return (Story: React.FC) => {
    const content = table ? (
      <table style={{ borderCollapse: 'collapse', ...tableStyle }}>
        <tbody>
          <tr>
            <Story />
          </tr>
        </tbody>
      </table>
    ) : (
      <Story />
    );
    return <div className={className} style={style}>{content}</div>;
  };
};

/** 預設深色背景裝飾器（padding 20px / 遊戲字型） / Default dark decorator */
export const DarkDecorator = makeDarkDecorator();

/** 首頁風格深色裝飾器（home-page className + 淺色文字，單一事實來源） / Home-page dark decorator */
export const HomePageDarkDecorator = makeDarkDecorator({
  className: HOME_PAGE_CLASS,
  color: LIGHT_TEXT_COLOR,
});

/** 表格型深色裝飾器（battle 表格用，單一事實來源） / Table-style dark decorator for battle tables */
export const TableDarkDecorator = makeDarkDecorator({
  table: true,
  padding: '10px',
  borderRadius: STAGE_BORDER_RADIUS,
});

/* ==================== 深色裝飾器選項預設（單一事實來源） / Dark decorator presets (SoT) ==================== */

/** 戰鬥行動日誌深色裝飾器（整包設定收斂為單一來源） / BattleAction log dark decorator */
export const BattleActionDarkDecorator = makeDarkDecorator({
  padding: '10px',
  borderRadius: STAGE_BORDER_RADIUS,
  width: '450px',
  color: MUTED_TEXT_COLOR,
  fontSize: DARK_FONT_SIZE,
});

/** 表格型結果深色裝飾器（單一事實來源） / Battle result table dark decorator */
export const BattleResultDarkDecorator = makeDarkDecorator({
  table: true,
  borderRadius: STAGE_BORDER_RADIUS,
  width: '600px',
  tableStyle: { width: '100%' },
});

/** 戰鬥單位深色裝飾器（單一事實來源） / Battle unit dark decorator */
export const BattleUnitDarkDecorator = makeDarkDecorator({
  padding: DARK_PADDING,
  borderRadius: STAGE_BORDER_RADIUS,
  width: '300px',
});

/** 戰場圖層深色裝飾器（單一事實來源） / Battle field layers dark decorator */
export const BattleFieldLayersDarkDecorator = makeDarkDecorator({
  padding: STAGE_PADDING,
  borderRadius: STAGE_BORDER_RADIUS,
});

/** 角色列表深色裝飾器（單一事實來源） / Character list dark decorator */
export const CharacterListDarkDecorator = makeDarkDecorator({
  padding: DARK_PADDING,
  minHeight: '300px',
});

/** 導覽列深色裝飾器（單一事實來源） / Nav subnav dark decorator */
export const GDSubNavDarkDecorator = makeDarkDecorator({
  padding: DARK_PADDING,
  minHeight: '100px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

/** 狩獵區連結 / 狩獵頁深色裝飾器（兩者共用，單一事實來源） / Hunt area/link dark decorator */
export const HuntAreaDarkDecorator = makeDarkDecorator({
  padding: DARK_PADDING,
  minHeight: '200px',
  fontSize: DARK_FONT_SIZE,
  color: MUTED_TEXT_COLOR,
});

/** 狩獵子導覽深色裝飾器（單一事實來源） / Hunt subnav dark decorator */
export const HuntSubNavDarkDecorator = makeDarkDecorator({
  padding: DARK_PADDING,
  minHeight: '100px',
  fontSize: DARK_FONT_SIZE,
  color: MUTED_TEXT_COLOR,
});

/** 戰鬥頁角色卡深色裝飾器（單一事實來源） / Battle page character card dark decorator */
export const BattlePageCharDarkDecorator = makeDarkDecorator({
  padding: DARK_PADDING,
  minHeight: '400px',
  fontSize: DARK_FONT_SIZE,
  color: MUTED_TEXT_COLOR,
});

/** 首頁風格（Arial 字型）深色裝飾器基礎選項（單一事實來源） / Home-page Arial dark base options */
export const HomePageArialDarkOptions = {
  className: HOME_PAGE_CLASS,
  color: LIGHT_TEXT_COLOR,
  fontFamily: 'Arial, sans-serif',
};

/** GameDescription 深色裝飾器（單一事實來源） / GameDescription dark decorator */
export const GameDescriptionDarkDecorator = makeDarkDecorator({
  ...HomePageArialDarkOptions,
  width: '400px',
});

/** InfoSection 深色裝飾器（單一事實來源） / InfoSection dark decorator */
export const InfoSectionDarkDecorator = makeDarkDecorator(HomePageArialDarkOptions);

/** SkillCard 深色裝飾器（單一事實來源） / SkillCard dark decorator */
export const SkillCardDarkDecorator = makeDarkDecorator({
  ...HomePageArialDarkOptions,
  padding: DARK_PADDING,
});

/** JobDetailCard 深色裝飾器（單一事實來源） / JobDetailCard dark decorator */
export const JobDetailCardDarkDecorator = makeDarkDecorator({
  ...HomePageArialDarkOptions,
  table: true,
  tableStyle: { border: '1px solid #1a232d', width: '100%' },
});

/** 角色 / 怪物卡片深色裝飾器（padding 30px / minHeight 200px，單一事實來源，三處共用） / Card (character/monster) dark decorator */
export const CardDarkDecorator = makeDarkDecorator({
  padding: '30px',
  minHeight: '200px',
});

/** 無內距深色裝飾器（單一事實來源，NavigationBar / TeamStatus 共用） / Flush (no padding) dark decorator */
export const FlushDarkDecorator = makeDarkDecorator({ padding: 0 });

/** 戰隊資訊表格深色裝飾器（單一事實來源） / Battle team info table dark decorator */
export const BattleTeamInfoDarkDecorator = makeDarkDecorator({
  table: true,
  tableStyle: { width: '400px' },
});

/** 角色精靈顯示深色裝飾器（單一事實來源） / Character sprite display dark decorator */
export const CharacterSpriteDisplayDarkDecorator = makeDarkDecorator({
  padding: '30px',
  minHeight: '300px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

/** 職業詳細表格深色裝飾器（單一事實來源） / Job detail table dark decorator */
export const JobDetailTableDarkDecorator = makeDarkDecorator({
  padding: '30px',
  minHeight: '500px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
});

/** 職業樹深色裝飾器（單一事實來源） / Job tree dark decorator */
export const JobTreeDarkDecorator = makeDarkDecorator({
  padding: '30px',
  minHeight: '400px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
});

/**
 * 置中（限制最大寬度）裝飾器工廠 / Centering (max-width) decorator factory
 */
export const makeCenteredDecorator = (
  options: CenteredDecoratorOptions = {}
): Decorator => {
  const { maxWidth = CENTERED_MAX_WIDTH } = options;
  return (Story: React.FC) => (
    <div style={{ maxWidth: `${maxWidth}px`, margin: '0 auto' }}>
      <Story />
    </div>
  );
};

/**
 * 縮放裝飾器工廠（放大/縮小預覽）
 * Scale decorator factory (zoom preview)
 */
export const makeScaleDecorator = (
  options: ScaleDecoratorOptions = {}
): Decorator => {
  const { scale = DEFAULT_SCALE } = options;
  return (Story: React.FC) => (
    <div style={{ transform: `scale(${scale})` }}>
      <Story />
    </div>
  );
};

/** 舞台裝飾器設定 / Stage decorator config */
export interface StageDecoratorConfig {
  width?: number;
  height?: number;
  background?: string;
  overflowHidden?: boolean;
  /** 舞台外框（如 BattleFieldSpriteFrame 的虛線框） / Stage border (e.g. dashed frame) */
  border?: string;
}

/**
 * 彈性排列裝飾器工廠（如 HuntAreaLink 的橫排展示）
 * Flex layout decorator factory (e.g. HuntAreaLink horizontal row showcase)
 */
export const makeFlexDecorator = (
  options: FlexDecoratorOptions = {}
): Decorator => {
  return (Story: React.FC) => (
    <div style={{ display: 'flex', ...options }}>
      <Story />
    </div>
  );
};

/** 由 args 推導舞台尺寸的函式 / Resolver deriving stage size from args */
export type StageSizeResolver = (
  args: Record<string, unknown>
) => StageDecoratorConfig;

/**
 * 相對定位舞台裝飾器工廠（battle 絕對定位元件需要相對原點）
 * Relatively-positioned stage decorator factory (battle absolutely-positioned
 * components need a relative origin)
 *
 * config 可為靜態尺寸，或由 args 動態推導（如 BattleFieldSpriteLayers）。
 * config may be a static size or resolved dynamically from args.
 */
export const makeStageDecorator = (
  config: StageDecoratorConfig | StageSizeResolver = {}
): Decorator => {
  return (Story: React.FC, context) => {
    const resolved =
      typeof config === 'function' ? config(context?.args ?? {}) : config;
    const { background = STAGE_BG_COLOR, overflowHidden, ...size } = resolved;
    return (
      <div style={{ background: DARK_BG_COLOR, padding: STAGE_PADDING, borderRadius: STAGE_BORDER_RADIUS }}>
        <div
          style={{
            position: 'relative',
            background,
            overflow: overflowHidden ? 'hidden' : undefined,
            border: size.border,
            width: size.width,
            height: size.height,
          }}
        >
          <Story />
        </div>
      </div>
    );
  };
};
