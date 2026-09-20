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

/** 裝飾器接受的樣式選項 / Decorator style options */
export interface DarkDecoratorOptions extends React.CSSProperties {
  /** 是否以 <table> 包裝（渲染 <td> 的元件如 battle 表格需要） / Wrap with <table> */
  table?: boolean;
  /** 內層 <table> 的額外樣式 / Extra style for the inner <table> */
  tableStyle?: React.CSSProperties;
  /** 外層 div 的 className（如 'home-page'） / Outer div className */
  className?: string;
}

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
): ((Story: React.FC) => React.ReactElement) => {
  const { table, tableStyle, className, ...rest } = options;
  const base: React.CSSProperties = {
    backgroundColor: DARK_BG_COLOR,
    fontFamily: GAME_FONT,
    padding: '20px',
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

/**
 * 置中（限制最大寬度）裝飾器工廠 / Centering (max-width) decorator factory
 */
export const makeCenteredDecorator = (
  maxWidth = 800
): ((Story: React.FC) => React.ReactElement) => {
  return (Story: React.FC) => (
    <div style={{ maxWidth: `${maxWidth}px`, margin: '0 auto' }}>
      <Story />
    </div>
  );
};

/**
 * 縮放裝飾器工廠（CharacterSpriteDisplay 放大/縮小預覽）
 * Scale decorator factory (CharacterSpriteDisplay zoom preview)
 */
export const makeScaleDecorator = (
  scale = 1
): ((Story: React.FC) => React.ReactElement) => {
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
  style: React.CSSProperties = {}
): ((Story: React.FC) => React.ReactElement) => {
  return (Story: React.FC) => (
    <div style={{ display: 'flex', ...style }}>
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
): ((
  Story: React.FC,
  context?: { args: Record<string, unknown> }
) => React.ReactElement) => {
  return (Story: React.FC, context) => {
    const resolved =
      typeof config === 'function' ? config(context?.args ?? {}) : config;
    const { background = STAGE_BG_COLOR, overflowHidden, ...size } = resolved;
    return (
      <div style={{ background: DARK_BG_COLOR, padding: '12px', borderRadius: '4px' }}>
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
