/**
 * HuntSubNav Storybook stories
 *
 * Showcases hunting sub-navigation component
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HuntSubNavDarkDecorator } from '../../decorators';
import { HuntSubNav } from '../../../src/components/navigation/HuntSubNav';
import { singleNavItems, threeNavItems, manyNavItems } from '../../fixture/huntData';

/** Dark game background decorator */
const meta: Meta<typeof HuntSubNav> = {
	title: 'Pages/HuntPage/HuntSubNav',
	component: HuntSubNav,
	decorators: [HuntSubNavDarkDecorator],
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Default sub-nav with CommonMonster and UnionMonster */
export const Default: Story = {
	args: {},
};

/** Single item */
export const SingleItem: Story = {
	args: {
		items: singleNavItems,
	},
};

/** Three items with second active */
export const ThreeItems: Story = {
	args: {
		items: threeNavItems,
	},
};

/** Many items */
export const ManyItems: Story = {
	args: {
		items: manyNavItems,
	},
};

/** Empty (no items) */
export const Empty: Story = {
	args: {
		items: [],
	},
};
