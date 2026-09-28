/**
 * HuntAreaLink Storybook stories
 *
 * Showcases hunting area cards with various terrain backgrounds
 * （展示資料集中於 fixture / showcase data lives in the fixture）
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeFlexDecorator, HuntAreaDarkDecorator } from '../../decorators';
import { HuntAreaLink } from '../../../src/components/areas/HuntAreaLink';
import {
	grassArea,
	caveArea,
	snowArea,
	desertArea,
	lavaArea,
	swampArea,
	oceanArea,
	abandonedArea,
	mountainArea,
	unknownArea,
	rowMiniAreas,
} from '../../fixture/huntData';

/** Dark game background decorator */
const meta: Meta<typeof HuntAreaLink> = {
	title: 'Pages/HuntPage/HuntAreaLink',
	component: HuntAreaLink,
	decorators: [HuntAreaDarkDecorator],
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Grass terrain */
export const Grass: Story = {
	args: {
		area: grassArea,
	},
};

/** Cave terrain */
export const Cave: Story = {
	args: {
		area: caveArea,
	},
};

/** Snow terrain */
export const Snow: Story = {
	args: {
		area: snowArea,
	},
};

/** Desert terrain */
export const Desert: Story = {
	args: {
		area: desertArea,
	},
};

/** Lava terrain */
export const Lava: Story = {
	args: {
		area: lavaArea,
	},
};

/** Swamp terrain */
export const Swamp: Story = {
	args: {
		area: swampArea,
	},
};

/** Ocean terrain */
export const Ocean: Story = {
	args: {
		area: oceanArea,
	},
};

/** Abandoned terrain */
export const Abandoned: Story = {
	args: {
		area: abandonedArea,
	},
};

/** Mountain terrain */
export const Mountain: Story = {
	args: {
		area: mountainArea,
	},
};

/** No background (fallback) */
export const NoBackground: Story = {
	args: {
		area: unknownArea,
	},
};

/** Horizontal row showcase */
export const RowShowcase: Story = {
	decorators: [makeFlexDecorator({ gap: '10px', flexWrap: 'wrap' })],
	render: () => (
		<>
			{rowMiniAreas.map((area) => (
				<HuntAreaLink key={area.land} area={area} />
			))}
		</>
	),
};