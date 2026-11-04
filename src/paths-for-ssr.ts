/**
 * 定位依賴伺服器 runtime 的 cwd 為專案根，只供伺服器端使用；
 * 瀏覽器端不得 import 此模組。
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** PHP HOF Resource 根目錄（PHP 工作樹，無法由 cwd 推算） */
const __PHP_RESOURCE = 'D:\\Users\\WebstormProjects\\game\\Hall-of-Fame\\.codenomad\\worktrees\\develop5\\hof\\trust_path\\HOF\\Resource';

/** 測試 fixtures 的 Resource 根目錄 */
const __FIXTURES_RESOURCE = join(process.cwd(), 'test', 'fixtures', 'Resource');

/**
 * YAML 資源根目錄：PHP Resource 存在時採用，否則退回 test fixtures
 */
export const __RESOURCE_YAML = existsSync(__PHP_RESOURCE) ? __PHP_RESOURCE : __FIXTURES_RESOURCE;
