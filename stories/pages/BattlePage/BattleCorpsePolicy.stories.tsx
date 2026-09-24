/**
 * 屍體政策三級示範（可即時調參）
 * Corpse-policy 3-level demo (interactive controls)
 *
 * 以「單一快照、不含戰鬥紀錄」呈現，並用 Storybook Controls 調整戰鬥級／隊伍級／
 * 角色級設定，立即看到「留屍體（mon_145）」或「消失」的差異；上方文字同步顯示解析結果。
 * Rendered as a single snapshot with no battle log; Storybook Controls tweak the
 * battle/team/character levels and the caption shows the resolved result immediately.
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
import { resolveCorpsePolicy } from '#/lib/game/battle/corpse-policy';
import {
	groupBattleChars,
	computeBattleSpritePositions,
	type IBattlePositionChar,
} from '#/components/battle/computeSpritePositions';
import { getSpriteImageSize } from '#/components/battle/spriteImageSizes';

/** 三態屍體設定（未設定＝繼承上層）/ tri-state corpse setting (unset = inherit) */
type CorpseTri = 'inherit' | 'leave' | 'vanish';

/** 三態選項 / tri-state options */
const CORPSE_TRI_OPTIONS: CorpseTri[] = ['inherit', 'leave', 'vanish'];

/** 三態 → boolean | undefined / tri-state to boolean | undefined */
function triToBool(value: CorpseTri): boolean | undefined {
	if (value === 'inherit') return undefined;
	return value === 'leave';
}

/** 三態顯示文字 / tri-state label */
function triLabel(value: CorpseTri): string {
	return value === 'inherit' ? '繼承' : value === 'leave' ? '留屍體' : '消失';
}

/** 示範參數 / demo args */
interface ICorpsePolicyDemoArgs {
	/** 戰鬥級：全場預設 corpse / battle-level default */
	battleCorpse: boolean;
	/** 隊伍級（左＝敵方）/ team-level (left = enemies) */
	teamCorpseLeft: CorpseTri;
	/** 隊伍級（右＝我方）/ team-level (right = allies) */
	teamCorpseRight: CorpseTri;
	/** 角色級（左單位）/ character-level (left unit) */
	leftUnitCorpse: CorpseTri;
	/** 角色級（右單位）/ character-level (right unit) */
	rightUnitCorpse: CorpseTri;
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
function buildDemoData(args: ICorpsePolicyDemoArgs): IBattleDisplayData {
	// 以共用的 resolveCorpsePolicy 解析，與引擎同一套規則（單一事實來源）
	// Resolve with the shared resolveCorpsePolicy so the story and the engine share one rule
	const leftCorpse = resolveCorpsePolicy(
		triToBool(args.leftUnitCorpse),
		triToBool(args.teamCorpseLeft),
		args.battleCorpse,
	);
	const rightCorpse = resolveCorpsePolicy(
		triToBool(args.rightUnitCorpse),
		triToBool(args.teamCorpseRight),
		args.battleCorpse,
	);

	const roster: IBattlePositionChar[] = [
		{
			unitUid: 'demo-left',
			name: LEFT_NAME,
			imageUrl: LEFT_IMAGE,
			imageSize: getSpriteImageSize(LEFT_IMAGE),
			position: EnumPosition.Front,
			side: EnumTeamSideUI.Left,
		},
		{
			unitUid: 'demo-right',
			name: RIGHT_NAME,
			imageUrl: RIGHT_IMAGE,
			imageSize: getSpriteImageSize(RIGHT_IMAGE),
			position: EnumPosition.Front,
			side: EnumTeamSideUI.Right,
		},
	];

	const deadUnit = (
		unitUid: string,
		name: string,
		side: EnumTeamSideUI,
		corpse: boolean,
	): IBattleSnapshotDisplayUnit => ({
		unitUid,
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
	const data = buildDemoData(args);
	const [leftUnit, rightUnit] = data.snapshots![0].units;

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
				<div>戰鬥級 corpse：{String(args.battleCorpse)}</div>
				<div>
					隊伍級 左/右：{triLabel(args.teamCorpseLeft)} / {triLabel(args.teamCorpseRight)}
				</div>
				<div>
					角色級 左/右：{triLabel(args.leftUnitCorpse)} / {triLabel(args.rightUnitCorpse)}
				</div>
				<div>
					→ 解析結果：{LEFT_NAME}＝{leftUnit.corpse ? '留屍體（mon_145）' : '消失'}；{' '}
					{RIGHT_NAME}＝{rightUnit.corpse ? '留屍體（mon_145）' : '消失'}
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
					'僅用單一快照、無戰鬥紀錄。\nInteractive battle → team → character corpse-policy demo: tweak the ' +
					'Controls to see leave-corpse vs vanish, using a single snapshot and no battle log.',
			},
		},
	},
	tags: ['autodocs'],
	args: {
		battleCorpse: false,
		teamCorpseLeft: 'inherit',
		teamCorpseRight: 'inherit',
		leftUnitCorpse: 'inherit',
		rightUnitCorpse: 'inherit',
	},
	argTypes: {
		battleCorpse: { control: 'boolean', description: '戰鬥級：全場預設 corpse' },
		teamCorpseLeft: {
			control: 'inline-radio',
			options: CORPSE_TRI_OPTIONS,
			description: '隊伍級（左＝敵方）',
		},
		teamCorpseRight: {
			control: 'inline-radio',
			options: CORPSE_TRI_OPTIONS,
			description: '隊伍級（右＝我方）',
		},
		leftUnitCorpse: {
			control: 'inline-radio',
			options: CORPSE_TRI_OPTIONS,
			description: '角色級（左單位）',
		},
		rightUnitCorpse: {
			control: 'inline-radio',
			options: CORPSE_TRI_OPTIONS,
			description: '角色級（右單位）',
		},
	},
};

export default meta;
type Story = StoryObj<ICorpsePolicyDemoArgs>;

/** 全部繼承、戰鬥級 false → 兩側皆消失 / all inherit, battle-level false → both vanish */
export const Default: Story = {};

/** 戰鬥級 true → 兩側皆留屍體（隊伍／角色皆繼承）/ battle-level true → both leave a corpse */
export const BattleLevelLeavesCorpse: Story = {
	args: { battleCorpse: true },
	parameters: {
		docs: {
			description: { story: '戰鬥級 true → 兩側皆留屍體（隊伍級／角色級未設定＝繼承）。' },
		},
	},
};

/** 隊伍級覆寫戰鬥級：左側消失 / team-level overrides battle-level: left vanishes */
export const TeamLevelOverridesBattle: Story = {
	args: { battleCorpse: true, teamCorpseLeft: 'vanish' },
	parameters: {
		docs: {
			description: { story: '戰鬥級 true，但隊伍級左（敵方）vanish → 只有左側消失。' },
		},
	},
};

/** 角色級覆寫隊伍級：左側仍留屍體 / character-level overrides team-level: left keeps a corpse */
export const CharacterLevelOverridesTeam: Story = {
	args: { battleCorpse: true, teamCorpseLeft: 'vanish', leftUnitCorpse: 'leave' },
	parameters: {
		docs: {
			description: {
				story: '隊伍級左 vanish，但角色級左 leave → 左單位仍留屍體（角色級最優先）。',
			},
		},
	},
};
