

/** @type { import('@storybook/nextjs-vite').StorybookConfig } */
const config = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
		{
			name: '@storybook/addon-mcp',
			options: {
				toolsets: {},
			},
		},
		"storybook-addon-pseudo-states",
		'@storybook/addon-links',
  ],
  "framework": "@storybook/nextjs-vite"
};
export default config;