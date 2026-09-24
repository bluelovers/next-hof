import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
	typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	// 單元測試專案：純邏輯（src/lib 遊戲系統）以 node 環境執行，可確定性重現。
	// 執行：node_modules/.bin/vitest run --project unit src/lib/game
	test: {
		projects: [
			{
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.test.ts'],
				},
			},
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({ configDir: path.join(dirname, '.storybook') }),
				],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [{ browser: 'chromium' }],
					},
				},
			},
		],
	},
});
