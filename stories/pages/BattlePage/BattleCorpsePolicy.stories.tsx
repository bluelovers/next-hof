/**
 * 屍體政策三級示範（可即時調參，含物件規格）
 * Corpse-policy 3-level demo (interactive controls, object spec included)
 *
 * 以「單一快照、不含戰鬥紀錄」呈現，並用 Storybook Controls 調整戰鬥級／隊伍級／
 * 角色級設定，立即看到「留屍體」或「消失」的差異；上方文字同步顯示解析結果。
 * 每一級可選 custom（物件規格），藉由另外三個 Controls 指定屍體的圖片、CSS class 與
 * inline style，馬上看到三者的效果。
 * Rendered as a single snapshot with no battle log; Storybook Controls tweak the
 * battle/team/character levels and the caption shows the resolved result immediately.
 * Each level can be set to `custom` (object spec), whose three extra Controls choose the
 * corpse's image, CSS class and inline style so all three take effect on screen.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BattleDisplay } from '#/components/pages/BattleDisplay';
import type {
	IBattleDisplayData,
	IBattleSnapshotDisplayUnit,
	IBattleUnit,
} from '#/components/battle/types';
import { SPRITE_LAYOUT_WIDTH, SPRITE_LAYOUT_HEIGHT } from '#/components/battle/types';
import { EnumTeamSideUI, EnumUnitStatus } from '#/components/battle/enums';
import { EnumPosition } from '#/lib/game/constants';
import {
	resolveCorpsePolicy,
	type ICorpsePolicy,
	type ICorpseSpec,
} from '#/lib/game/battle/corpse-policy';
import type { CSSProperties } from 'react';
import {
	groupBattleChars,
	computeBattleSpritePositions,
	type IBattlePositionChar,
} from '#/components/battle/computeSpritePositions';
import { getSpriteImageSize } from '#/components/battle/spriteImageSizes';
import { SPRITE_CORPSE_URL } from '#/components/battle/battleUtils';
import type { IStylePropsRequired } from '#/components/shared/types';
import './BattleCorpsePolicy.css';

/**
 * 屍體設定四態（單一事實來源：選項清單與其值都只在這個 enum 定義）
 * 4-state corpse setting (single source: both the option list and their values are defined
 * in this enum alone)
 *
 * 新增／移除成員時，`CORPSE_OPTIONS`（由 enum 導出）、兩張 `Record<EnumCorpseChoice, …>`
 * 對照表與各 args 欄位同步跟著變；兩張表強制窮舉，漏鍵即編譯錯誤，不會靜默漂移。
 * Adding/removing a member updates `CORPSE_OPTIONS` (derived from the enum), both
 * `Record<EnumCorpseChoice, …>` maps and every args field together; the maps force
 * exhaustiveness, so a missing key fails to compile instead of drifting silently.
 *
 * 值刻意沿用小寫字面，讓 Storybook Controls 的選項文字與序列化後的 args 與改 enum 前
 * 完全一致。
 * Values deliberately keep the lowercase literals so the Storybook Controls labels and the
 * serialized args stay byte-identical to the pre-enum behaviour.
 */
enum EnumCorpseChoice {
	/** 繼承上層（不覆寫）/ inherit from the next level up (no override) */
	Inherit = 'inherit',
	/** 留屍體（政策 `true`）/ leave a corpse (policy `true`) */
	Leave = 'leave',
	/** 消失（政策 `false`）/ vanish (policy `false`) */
	Vanish = 'vanish',
	/** 物件規格（政策 `ICorpseSpec`）/ object spec (policy `ICorpseSpec`) */
	Custom = 'custom',
}

/** 選項清單（由 enum 導出，不重列字面值）/ option list (derived from the enum, literals never restated) */
const CORPSE_OPTIONS: EnumCorpseChoice[] = Object.values(EnumCorpseChoice);

/**
 * 預設屍體圖檔名（從 SPRITE_CORPSE_URL 導出，不在此重寫字面值）
 * Default corpse asset name (derived from SPRITE_CORPSE_URL; the literal is never restated
 * here)
 */
const DEFAULT_CORPSE_ASSET = SPRITE_CORPSE_URL.split('/').pop() ?? SPRITE_CORPSE_URL;

/**
 * 物件規格的三個控制項（任一層級選 custom 時，以此組成 ICorpseSpec）
 * The three controls behind the object spec (used to build ICorpseSpec whenever a level
 * is set to `custom`)
 *
 * 控制項的 className / style 一律由 Storybook Controls 給值，故以 IStylePropsRequired
 * （底層為 ITSPickExtra）把這兩欄升級為必填，其餘與樣式無關的欄位仍補在本介面。
 * The controls always receive a className / style from the Storybook Controls, so
 * IStylePropsRequired (backed by ITSPickExtra) promotes those two to required while the
 * non-style fields stay declared in this interface.
 */
interface ICorpseSpecControls extends IStylePropsRequired<'className' | 'style'> {
	/** 屍體圖路徑（空白＝自動）/ corpse image path (blank = auto) */
	imageUrl: string;
}

/**
 * 由控制項組成物件規格：略過空白字串與空 style，維持規格內容單純
 * Build the object spec from the controls, skipping blank strings and an empty style so
 * the spec stays clean
 */
function buildSpec(controls: ICorpseSpecControls): ICorpseSpec {
	const spec: ICorpseSpec = {};
	const imageUrl = controls.imageUrl.trim();
	const className = controls.className.trim();
	if (imageUrl) spec.imageUrl = imageUrl;
	if (className) spec.className = className;
	if (controls.style && Object.keys(controls.style).length > 0) spec.style = controls.style;
	return spec;
}

/** 由 args 取出物件規格的三個控制項（組裝只發生在這裡一次）/ Pull the three object-spec controls from args (built in exactly one place) */
function buildControls(args: ICorpsePolicyDemoArgs): ICorpseSpecControls {
	return {
		imageUrl: args.corpseImageUrl,
		className: args.corpseClassName,
		style: args.corpseStyle,
	};
}

/**
 * 物件規格 → 單行 caption 文字（空白欄位顯示為「自動／無」）
 * Object spec → one-line caption text (blank fields shown as auto / none)
 *
 * 以函式組字串而非 JSX 文字節點，避免 JSX 在換行處自動插入空白而把分隔符拆壞。
 * Builds the string in a function instead of JSX text nodes, because JSX inserts a space at
 * line breaks and would split the separators.
 */
function describeSpec(controls: ICorpseSpecControls): string {
	const image = controls.imageUrl.trim() || `自動（${DEFAULT_CORPSE_ASSET}）`;
	const cssClass = controls.className.trim() || '無';
	const style =
		controls.style && Object.keys(controls.style).length > 0
			? JSON.stringify(controls.style)
			: '無';
	return `圖=${image}／class=${cssClass}／style=${style}`;
}

/**
 * 選項 → 政策值的處理器對照表（Record 強制窮舉：選項新增而此處漏鍵即編譯錯誤）
 * Choice → policy-value handler map (Record forces exhaustiveness: a new option missing
 * here fails to compile)
 *
 * `custom` 直接沿用 buildSpec；其餘選項不使用控制項參數。
 * `custom` reuses buildSpec as-is; the other choices ignore the controls.
 */
const POLICY_BY_CHOICE: Record<
	EnumCorpseChoice,
	(controls: ICorpseSpecControls) => ICorpsePolicy | undefined
> = {
	[EnumCorpseChoice.Inherit]: () => undefined,
	[EnumCorpseChoice.Leave]: () => true,
	[EnumCorpseChoice.Vanish]: () => false,
	[EnumCorpseChoice.Custom]: buildSpec,
};

/**
 * 四態 → 政策值（undefined＝繼承上層）/ 4-state → policy value (undefined = inherit)
 *
 * 與引擎共用 resolveCorpsePolicy，因此這裡只負責「選項 → 政策值」的翻譯。
 * Only this translates the choice into a policy value; the shared resolveCorpsePolicy
 * performs the actual level inheritance.
 */
function toPolicy(choice: EnumCorpseChoice, controls: ICorpseSpecControls): ICorpsePolicy | undefined {
	return POLICY_BY_CHOICE[choice](controls);
}

/**
 * 選項 → 顯示文字（Record 強制窮舉，理由同 POLICY_BY_CHOICE）
 * Choice → label (Record forces exhaustiveness, same reasoning as POLICY_BY_CHOICE)
 */
const CORPSE_LABEL: Record<EnumCorpseChoice, string> = {
	[EnumCorpseChoice.Inherit]: '繼承',
	[EnumCorpseChoice.Leave]: '留屍體',
	[EnumCorpseChoice.Vanish]: '消失',
	[EnumCorpseChoice.Custom]: '物件規格',
};

/** 四態顯示文字 / 4-state label */
function choiceLabel(value: EnumCorpseChoice): string {
	return CORPSE_LABEL[value];
}

/**
 * 解析結果 → 可讀文字（同時說明物件規格帶了哪些欄位）
 * Resolved result → readable text (also listing which spec fields the object carries)
 */
function describeCorpse(policy: ICorpsePolicy | undefined): string {
	if (!policy) return '消失';
	if (policy === true) return `留屍體（預設圖 ${DEFAULT_CORPSE_ASSET}）`;
	const styleText =
		policy.style && Object.keys(policy.style).length > 0 ? JSON.stringify(policy.style) : '無';
	return [
		'留屍體（物件規格）',
		`圖=${policy.imageUrl || '自動'}`,
		`class=${policy.className || '無'}`,
		`style=${styleText}`,
	].join('／');
}

/** 示範參數 / demo args */
interface ICorpsePolicyDemoArgs {
	/** 戰鬥級：全場預設 corpse / battle-level default */
	battleCorpse: EnumCorpseChoice;
	/** 隊伍級（左＝敵方）/ team-level (left = enemies) */
	teamCorpseLeft: EnumCorpseChoice;
	/** 隊伍級（右＝我方）/ team-level (right = allies) */
	teamCorpseRight: EnumCorpseChoice;
	/** 角色級（左單位）/ character-level (left unit) */
	leftUnitCorpse: EnumCorpseChoice;
	/** 角色級（右單位）/ character-level (right unit) */
	rightUnitCorpse: EnumCorpseChoice;
	/** 物件規格：屍體圖路徑（空白＝依原圖目錄自動挑正向／鏡像的預設屍體圖） */
	corpseImageUrl: string;
	/** 物件規格：附加 CSS class（樣式定義於同名 .css，未定義時無視覺效果） */
	corpseClassName: string;
	/** 物件規格：inline style（與 class 同名屬性時，inline 勝出） */
	corpseStyle: CSSProperties;
}

/** 示範單位 / demo units */
const LEFT_NAME = 'GoblinAxe';
const RIGHT_NAME = 'Hero1';
const LEFT_IMAGE = '/image/char/mon_053.png';
const RIGHT_IMAGE = '/image/char_rev/mon_018.png';

/**
 * 建立「單一快照、無戰鬥紀錄」的展示資料
 * Build a single-snapshot, log-free display data
 */
function buildDemoData(
	args: ICorpsePolicyDemoArgs,
	controls: ICorpseSpecControls,
): IBattleDisplayData {
	// 以共用的 resolveCorpsePolicy 解析，與引擎同一套規則（單一事實來源）
	// Resolve with the shared resolveCorpsePolicy so the story and the engine share one rule
	const leftCorpse = resolveCorpsePolicy(
		toPolicy(args.leftUnitCorpse, controls),
		toPolicy(args.teamCorpseLeft, controls),
		toPolicy(args.battleCorpse, controls),
	);
	const rightCorpse = resolveCorpsePolicy(
		toPolicy(args.rightUnitCorpse, controls),
		toPolicy(args.teamCorpseRight, controls),
		toPolicy(args.battleCorpse, controls),
	);

	const roster: IBattlePositionChar[] = [
		{
			unitUuid: 'demo-left',
			name: LEFT_NAME,
			imageUrl: LEFT_IMAGE,
			imageSize: getSpriteImageSize(LEFT_IMAGE),
			position: EnumPosition.Front,
			side: EnumTeamSideUI.Left,
		},
		{
			unitUuid: 'demo-right',
			name: RIGHT_NAME,
			imageUrl: RIGHT_IMAGE,
			imageSize: getSpriteImageSize(RIGHT_IMAGE),
			position: EnumPosition.Front,
			side: EnumTeamSideUI.Right,
		},
	];

	const deadUnit = (
		unitUuid: string,
		name: string,
		side: EnumTeamSideUI,
		corpse: ICorpsePolicy,
	): IBattleSnapshotDisplayUnit => ({
		unitUuid,
		name,
		side,
		hp: 0,
		maxHp: 100,
		sp: 0,
		maxSp: 10,
		dead: true,
		corpse,
	});

	const teamUnit = (name: string, side: EnumTeamSideUI): IBattleUnit => ({
		name,
		level: 1,
		hp: 0,
		maxHp: 100,
		sp: 0,
		maxSp: 10,
		status: EnumUnitStatus.Down,
		side,
	});

	return {
		title: 'corpse policy demo',
		leftTeam: {
			name: 'Enemies',
			units: [teamUnit(LEFT_NAME, EnumTeamSideUI.Left)],
			side: EnumTeamSideUI.Left,
		},
		rightTeam: {
			name: 'Allies',
			units: [teamUnit(RIGHT_NAME, EnumTeamSideUI.Right)],
			side: EnumTeamSideUI.Right,
		},
		battlefield: {
			backgroundImageUrl: '/image/land/bg_grass.png',
			backgroundType: 'grass',
			width: SPRITE_LAYOUT_WIDTH,
			height: SPRITE_LAYOUT_HEIGHT,
		},
		sprites: computeBattleSpritePositions(groupBattleChars(roster), {
			width: SPRITE_LAYOUT_WIDTH,
			height: SPRITE_LAYOUT_HEIGHT,
		}),
		// 單一快照、無行動 → 只有一段、無日誌
		// Single snapshot, no actions → one segment, no log
		actions: [],
		snapshots: [
			{
				at: 0,
				units: [
					deadUnit('demo-left', LEFT_NAME, EnumTeamSideUI.Left, leftCorpse),
					deadUnit('demo-right', RIGHT_NAME, EnumTeamSideUI.Right, rightCorpse),
				],
			},
		],
	};
}

/** 示範元件：顯示各級設定與解析結果，再渲染單段 BattleDisplay / Demo component */
const CorpsePolicyDemo: React.FC<ICorpsePolicyDemoArgs> = (args) => {
	const controls = buildControls(args);
	const data = buildDemoData(args, controls);
	const [leftUnit, rightUnit] = data.snapshots![0].units;
	// 只要任一層級選 custom，才顯示物件規格控制項的現況（避免多餘雜訊）
	// Show the object-spec controls only when some level is `custom` (keeps the caption tidy)
	const anyCustom = [
		args.battleCorpse,
		args.teamCorpseLeft,
		args.teamCorpseRight,
		args.leftUnitCorpse,
		args.rightUnitCorpse,
	].includes(EnumCorpseChoice.Custom);

	return (
		<div>
			<div
				style={{
					fontFamily: 'monospace',
					fontSize: 12,
					lineHeight: 1.7,
					padding: '8px 12px',
					marginBottom: 8,
					background: '#1b222c',
					borderRadius: 4,
				}}
			>
				<div>戰鬥級 corpse：{choiceLabel(args.battleCorpse)}</div>
				<div>
					隊伍級 左/右：{choiceLabel(args.teamCorpseLeft)} /{' '}
					{choiceLabel(args.teamCorpseRight)}
				</div>
				<div>
					角色級 左/右：{choiceLabel(args.leftUnitCorpse)} /{' '}
					{choiceLabel(args.rightUnitCorpse)}
				</div>
				{anyCustom && <div>物件規格：{describeSpec(controls)}</div>}
				<div>
					→ 解析結果：{describeCorpse(leftUnit.corpse)}／{describeCorpse(rightUnit.corpse)}
					（左={LEFT_NAME}、右={RIGHT_NAME}）
				</div>
			</div>
			<BattleDisplay data={data} showSpriteLabels />
		</div>
	);
};

const meta: Meta<ICorpsePolicyDemoArgs> = {
	title: 'Pages/BattlePage/BattleCorpsePolicy',
	component: CorpsePolicyDemo,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'屍體政策三級繼承（戰鬥級 → 隊伍級 → 角色級）互動示範：調整 Controls 立即看到留屍體或消失。' +
					'任一層級選 custom（物件規格）後，可用另外三個 Controls 指定屍體的圖片、CSS class 與 inline style。' +
					'僅用單一快照、無戰鬥紀錄。\n' +
					'Interactive battle → team → character corpse-policy demo: tweak the Controls to see ' +
					'leave-corpse vs vanish. Choosing `custom` (object spec) at any level enables three ' +
					'extra Controls for the corpse image, CSS class and inline style. Uses a single ' +
					'snapshot with no battle log.',
			},
		},
	},
	tags: ['autodocs'],
	args: {
		battleCorpse: EnumCorpseChoice.Custom,
		teamCorpseLeft: EnumCorpseChoice.Inherit,
		teamCorpseRight: EnumCorpseChoice.Inherit,
		leftUnitCorpse: EnumCorpseChoice.Inherit,
		rightUnitCorpse: EnumCorpseChoice.Inherit,
		// 墓碑圖一眼可辨（不同於預設屍體圖），證明 imageUrl 控制真的生效
		// The tombstone is instantly distinguishable from the default corpse asset,
		// proving the imageUrl control actually takes effect
		corpseImageUrl: '/image/char/mon_146.png',
		corpseClassName: 'corpse-ghost',
		corpseStyle: { filter: 'brightness(0.65) saturate(0.4)' },
	},
	argTypes: {
		battleCorpse: {
			control: 'inline-radio',
			options: CORPSE_OPTIONS,
			description: '戰鬥級：全場預設 corpse（custom＝物件規格）',
		},
		teamCorpseLeft: {
			control: 'inline-radio',
			options: CORPSE_OPTIONS,
			description: '隊伍級（左＝敵方）',
		},
		teamCorpseRight: {
			control: 'inline-radio',
			options: CORPSE_OPTIONS,
			description: '隊伍級（右＝我方）',
		},
		leftUnitCorpse: {
			control: 'inline-radio',
			options: CORPSE_OPTIONS,
			description: '角色級（左單位）',
		},
		rightUnitCorpse: {
			control: 'inline-radio',
			options: CORPSE_OPTIONS,
			description: '角色級（右單位）',
		},
		corpseImageUrl: {
			control: 'text',
			description:
				`物件規格 imageUrl：屍體圖路徑（空白＝依原圖目錄自動挑正向／鏡像的預設屍體圖 ` +
				`${DEFAULT_CORPSE_ASSET}）。` + '僅在任一層級選 custom 時生效。',
		},
		corpseClassName: {
			control: 'text',
			description:
				'物件規格 className：附加到屍體圖層的 CSS class（定義見同名 .css）。' +
				'僅在任一層級選 custom 時生效。',
		},
		corpseStyle: {
			control: 'object',
			description:
				'物件規格 style：併入屍體圖層的 inline style（同名屬性會蓋過 class）。' +
				'僅在任一層級選 custom 時生效。',
		},
	},
};

export default meta;
type Story = StoryObj<ICorpsePolicyDemoArgs>;

/**
 * 預設：戰鬥級物件規格 → 墓碑圖 + corpse-ghost class + 調暗樣式，三種規格同時生效
 * Default: battle-level object spec → tombstone image + corpse-ghost class + dimming
 * style, all three spec fields taking effect at once
 */
export const Default: Story = {};

/** 全部繼承、戰鬥級未設定 → 兩側皆消失 / all inherit, battle-level unset → both vanish */
export const VanishNoCorpse: Story = {
	args: { battleCorpse: EnumCorpseChoice.Inherit },
	parameters: {
		docs: {
			description: { story: '全部繼承且戰鬥級未設定 → 預設 false，兩側皆消失。' },
		},
	},
};

/** 戰鬥級布林 true → 兩側留預設屍體圖 / battle-level boolean true → default corpse asset */
export const BattleLevelBooleanCorpse: Story = {
	args: { battleCorpse: EnumCorpseChoice.Leave },
	parameters: {
		docs: {
			description: {
				story: '戰鬥級 leave（布林 true）→ 兩側皆留預設屍體圖（隊伍／角色皆繼承）。',
			},
		},
	},
};

/** 隊伍級覆寫戰鬥級：左側消失 / team-level overrides battle-level: left vanishes */
export const TeamLevelOverridesBattle: Story = {
	args: {
		battleCorpse: EnumCorpseChoice.Leave,
		teamCorpseLeft: EnumCorpseChoice.Vanish,
	},
	parameters: {
		docs: {
			description: { story: '戰鬥級 leave，但隊伍級左（敵方）vanish → 只有左側消失。' },
		},
	},
};

/** 角色級覆寫隊伍級：左側用物件規格 / character-level overrides team-level: left uses the object spec */
export const CharacterLevelOverridesTeam: Story = {
	args: {
		battleCorpse: EnumCorpseChoice.Leave,
		teamCorpseLeft: EnumCorpseChoice.Vanish,
		leftUnitCorpse: EnumCorpseChoice.Custom,
	},
	parameters: {
		docs: {
			description: {
				story:
					'隊伍級左 vanish，但角色級左選 custom（物件規格）→ 左單位仍留屍體且採用' +
					'上面三個控制項的圖片／class／style；右單位仍繼承戰鬥級布林 true（預設屍體圖）。',
			},
		},
	},
};
