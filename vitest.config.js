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
		// fake-timer 的 ESM 建置以無副檔名的子路徑載入 dayjs 插件
		// （`import 'dayjs/plugin/duration'`），Node 原生 ESM 會直接拒絕該解析；
		// 強制由 Vite 內聯處理，Vite 的解析器會補上副檔名。
		// fake-timer's ESM build imports dayjs plugins by extension-less subpath
		// (`import 'dayjs/plugin/duration'`), which native Node ESM rejects; inline
		// the package so Vite resolves it (Vite's resolver appends the extension).
		server: {
			deps: {
				inline: ['fake-timer'],
			},
		},
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
