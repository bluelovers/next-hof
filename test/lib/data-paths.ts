import { join } from 'node:path';
import { __ROOT } from '#/src/root-paths.ts';
import { __RESOURCE_YAML as SHARED_RESOURCE_ROOT } from '#/src/paths-for-ssr';

export const __TEST_ROOT = join(__ROOT, 'test');

export const __TEST_FIXTURES = join(__TEST_ROOT, 'fixtures');

/**
 * 測試 fixtures 資源根目錄（test/fixtures/Resource）/ test fixtures resource root
 * 結構與正式 HOF Resource 相同：{root}/Char、{root}/Mon。
 * Mirrors the real HOF Resource layout: {root}/Char and {root}/Mon.
 */
export const __TEST_FIXTURES_RESOURCE = join(__TEST_FIXTURES, 'Resource');

/**
 * HOF Resource 根目錄，解析邏輯集中於 #/src/lib/game/data/resource-root / HOF resource root, resolved by #/src/lib/game/data/resource-root
 */
export const __RESOURCE_YAML = SHARED_RESOURCE_ROOT;
