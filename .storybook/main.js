

/** @type { import('@storybook/nextjs-vite').StorybookConfig } */
const config = {

viteFinal: async (config) => {
config.resolve = config.resolve || {};
config.resolve.alias = {
...config.resolve.alias,
'next/image': await import('next/image.js').then(m => m.default ?? m),
};
return config;
},

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