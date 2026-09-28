/**
 * 路徑定義檔 / Path definitions
 * 集中定義本模組相依的目錄路徑（repo 根、測試 fixtures 根），
 * 所有消費者以具名常數引用，不在各檔案內手寫多層相對路徑（../）。
 * Central path definitions for this module's directories (repo root, test fixtures root);
 * consumers reference named constants instead of hand-written multi-level relative paths.
 */

import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * repo 根目錄 / repository root
 * 以本檔位置（src/）向上 1 層推算，不依賴 process.cwd()。
 * Derived from this file's location (src/), 1 level up; independent of process.cwd().
 */
export const REPO_ROOT = fileURLToPath(new URL('../', import.meta.url));

/**
 * 測試 fixtures 資源根目錄（test/fixtures/Resource）/ test fixtures resource root
 * 結構與正式 HOF Resource 相同：{root}/Char、{root}/Mon。
 * Mirrors the real HOF Resource layout: {root}/Char and {root}/Mon.
 */
export const TEST_FIXTURES_ROOT = join(REPO_ROOT, 'test', 'fixtures', 'Resource');
