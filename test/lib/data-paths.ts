import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { __ROOT } from '#/root-paths.ts';

export const __TEST_ROOT = join(__ROOT, 'test');

export const __TEST_FIXTURES = join(__TEST_ROOT, 'fixtures');

/**
 * 測試 fixtures 資源根目錄（test/fixtures/Resource）/ test fixtures resource root
 * 結構與正式 HOF Resource 相同：{root}/Char、{root}/Mon。
 * Mirrors the real HOF Resource layout: {root}/Char and {root}/Mon.
 */
export const __TEST_FIXTURES_RESOURCE = join(__TEST_FIXTURES, 'Resource');

/**
 * PHP HOF Resource 根目錄
 */
const __PHP_RESOURCE = 'D:\\Users\\WebstormProjects\\game\\Hall-of-Fame\\.codenomad\\worktrees\\develop5\\hof\\trust_path\\HOF\\Resource';

/**
 * HOF Resource 根目錄（{@link __PHP_RESOURCE} 不存在時退回 {@link __TEST_FIXTURES_RESOURCE}）
 */
export const __RESOURCE_YAML = existsSync(__PHP_RESOURCE)
  ? __PHP_RESOURCE
  : __TEST_FIXTURES_RESOURCE;
