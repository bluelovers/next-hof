/**
 * CharacterList Storybook 故事
 * CharacterList Storybook stories
 *
 * 展示角色列表容器（自動 carpet0/carpet1 交替）
 * Showcases character list (auto carpet0/carpet1 alternation)
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CharacterListDarkDecorator } from '../decorators';
import { CharacterList } from '../../src/components/characters/CharacterList';
import {
	mageChar,
	healerChar,
	heroChar,
	priestChar,
	berserkerChar,
	archerChar,
	novice1Char,
	novice2Char,
	shortChar,
	tallChar,
} from '../fixture/characterCards';

/** 背景裝飾器 / Background decorator */
const meta: Meta<typeof CharacterList> = {
	title: 'Characters/CharacterList',
	component: CharacterList,
	parameters: {
		docs: {
			description: {
				component:
					'角色列表容器。自動傳遞 index 給每個 CharacterCard 實現 carpet0/carpet1 交替。\nCharacter list container. Auto-passes index to each CharacterCard for carpet0/carpet1 alternation.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		onSelect: { action: 'selected' },
	},
	decorators: [CharacterListDarkDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ==================== 故事 ====================

/** 四人隊伍（carpet0,1,0,1 交替）/ Four members */
export const FourMemberTeam: Story = {
	args: {
		characters: [mageChar, healerChar, heroChar, priestChar],
	},
	parameters: {
		docs: {
			description: {
				story:
					'4 人隊伍：carpet0 → Mage1, carpet1 → Healer1, carpet0 → Hero1, carpet1 → Priest1 交替展示。\n4 members: carpet0→Mage1, carpet1→Healer1, carpet0→Hero1, carpet1→Priest1 alternation.',
			},
		},
	},
};

/** 五人滿編 / Five members full team */
export const FiveMemberTeam: Story = {
	args: {
		characters: [mageChar, healerChar, heroChar, priestChar, berserkerChar],
	},
	parameters: {
		docs: {
			description: {
				story:
					'5 人完整隊伍（carpet0,1,0,1,0 交替）。\nComplete team of 5 (carpet0,1,0,1,0 alternation).',
			},
		},
	},
};

/** 已選取第三位 / Third character selected */
export const ThirdSelected: Story = {
	args: {
		characters: [mageChar, healerChar, heroChar, priestChar].map((c, i) => ({
			...c,
			selected: i === 2,
		})),
	},
	parameters: {
		docs: {
			description: {
				story:
					'第三位角色 Hero1 為選取狀態（高亮文字）。\nThird character Hero1 selected (highlighted text).',
			},
		},
	},
};

/** 只有一人 / Solo member */
export const SoloMember: Story = {
	args: {
		characters: [heroChar],
	},
	parameters: {
		docs: {
			description: {
				story:
					'只有一名角色（carpet0）。\nSolo character (carpet0).',
			},
		},
	},
};

/** 空隊伍 / Empty team */
export const EmptyTeam: Story = {
	args: {
		characters: [],
	},
	parameters: {
		docs: {
			description: {
				story:
					'空隊伍。\nEmpty team.',
			},
		},
	},
};

/** 無星標隊伍 / No star markers */
export const NoStarTeam: Story = {
	args: {
		characters: [
			{ ...archerChar },
			novice1Char,
			novice2Char,
		],
	},
	parameters: {
		docs: {
			description: {
				story:
					'全部無星標的新手角色（carpet0,1,0 交替）。\nNovices without star markers (carpet0,1,0 alternation).',
			},
		},
	},
};

/** 矮與高角色並排 / Short & tall characters side by side */
export const ShortAndTall: Story = {
	args: {
		characters: [shortChar, mageChar, tallChar],
	},
	parameters: {
		docs: {
			description: {
				story:
					'矮個子（32px）與高個子（128px）角色並排展示，對照一般高度角色，'
					+ '驗證所有角色的腳底都貼齊地毯底部。\n'
					+ 'Short (32px) and tall (128px) characters lined up with a normal-height one '
					+ 'to verify every character feet align to the carpet bottom.',
			},
		},
	},
};