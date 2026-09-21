/**
 * HuntAreaLink Storybook stories
 *
 * Showcases hunting area cards with various terrain backgrounds
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { makeFlexDecorator, HuntAreaDarkDecorator } from '../../decorators';
import { HuntAreaLink } from '../../../src/components/areas/HuntAreaLink';

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
    area: { name: 'GoblinField', land: 'gb0', levelRange: 'Lv1-5', landType: 'grass' },
  },
};

/** Cave terrain */
export const Cave: Story = {
  args: {
    area: { name: 'DarkCave', land: 'cave01', levelRange: 'Lv10-20', landType: 'cave' },
  },
};

/** Snow terrain */
export const Snow: Story = {
  args: {
    area: { name: 'FrozenTundra', land: 'snow01', levelRange: 'Lv30-40', landType: 'snow' },
  },
};

/** Desert terrain */
export const Desert: Story = {
  args: {
    area: { name: 'ScorchedDesert', land: 'des01', levelRange: 'Lv5-10', landType: 'sand' },
  },
};

/** Lava terrain */
export const Lava: Story = {
  args: {
    area: { name: 'VolcanoCore', land: 'volc01', levelRange: 'Lv50-70', landType: 'lava' },
  },
};

/** Swamp terrain */
export const Swamp: Story = {
  args: {
    area: { name: 'PoisonMarsh', land: 'swamp01', levelRange: 'Lv15-25', landType: 'swamp' },
  },
};

/** Ocean terrain */
export const Ocean: Story = {
  args: {
    area: { name: 'DeepSea', land: 'ocean01', levelRange: 'Lv35-55', landType: 'ocean0' },
  },
};

/** Abandoned terrain */
export const Abandoned: Story = {
  args: {
    area: { name: 'RuinedCity', land: 'blow01', levelRange: 'Lv20-30', landType: 'aband' },
  },
};

/** Mountain terrain */
export const Mountain: Story = {
  args: {
    area: { name: 'RockyPeak', land: 'mt01', levelRange: 'Lv25-35', landType: 'mount' },
  },
};

/** No background (fallback) */
export const NoBackground: Story = {
  args: {
    area: { name: 'UnknownArea', land: 'unknown01', levelRange: 'Lv??' },
  },
};

/** Horizontal row showcase */
export const RowShowcase: Story = {
  decorators: [makeFlexDecorator({ gap: '10px', flexWrap: 'wrap' })],
  render: () => (
    <>
      <HuntAreaLink area={{ name: 'Grass', land: 'g', levelRange: 'Lv1', landType: 'grass' }} />
      <HuntAreaLink area={{ name: 'Cave', land: 'c', levelRange: 'Lv5', landType: 'cave' }} />
      <HuntAreaLink area={{ name: 'Lava', land: 'l', levelRange: 'Lv50', landType: 'lava' }} />
      <HuntAreaLink area={{ name: 'Sea', land: 's', levelRange: 'Lv10', landType: 'sea' }} />
    </>
  ),
};
