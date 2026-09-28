/**
 * YAML 資源讀取器 / YAML resource loader
 * 從 HOF Resource/{Char,Mon} 目錄讀取 char.*.yml / mon.*.yml 原始資料。
 * Reads the raw char.*.yml / mon.*.yml files from the HOF Resource/{Char,Mon} dirs.
 *
 * 本模組依賴 Node fs，僅供伺服器端／匯入腳本使用；瀏覽器端請以預轉換的 JSON 或 seed-data 餵入。
 * This module depends on Node fs and is server-side / import-script only; browsers should consume
 * pre-converted JSON or seed-data instead.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { IRawCharYaml, IRawMonYaml } from './yaml-types';

/**
 * 資源種類 / Resource kind
 * 對應 Resource 目錄下的子目錄名（Char / Mon）。
 * Sub-directory names under Resource (Char / Mon).
 */
export type IResourceKind = 'Char' | 'Mon';

/** 資源檔名模式：`{kind}.{no}.yml` / resource file name pattern: `{kind}.{no}.yml` */
const FILE_PATTERN = /^[a-z]+\.(\d+)\.yml$/i;

/**
 * 解析 YAML 文字 / Parse YAML text
 * @param text 原始 YAML 內容 / raw YAML content
 * @returns 解析結果（raw 型別）/ parsed result (raw shape)
 */
export function parseResourceYaml<T>(text: string): T
{
	return parse(text) as T;
}

/**
 * 組出資源目錄路徑 / Build the resource directory path for a kind
 * @param kind 資源種類 / resource kind
 * @param root 資源根目錄（含 Char／Mon 子目錄之上層）/ resource root (the parent that holds the Char/Mon subdirectories)
 */
export function resourceDir(kind: IResourceKind, root: string): string
{
	return join(root, kind);
}

/**
 * 依編號讀取單一資源檔 / Load a single resource file by number
 * @param kind 資源種類 / resource kind
 * @param no 編號 / number
 * @param root 資源根目錄 / resource root
 * @returns 原始資料；檔案不存在時回 undefined / raw data; undefined when the file is absent
 */
export function loadResourceYaml<T>(kind: IResourceKind, no: number, root: string): T | undefined
{
	const file = join(resourceDir(kind, root), `${kind.toLowerCase()}.${no}.yml`);
	if (!existsSync(file)) return undefined;
	const text = readFileSync(file, 'utf8');
	return parseResourceYaml<T>(text);
}

/**
 * 依編號讀取角色 / Load a player-character resource by number
 */
export function loadCharYaml(no: number, root: string): IRawCharYaml | undefined
{
	return loadResourceYaml<IRawCharYaml>('Char', no, root);
}

/**
 * 依編號讀取怪物 / Load a monster resource by number
 */
export function loadMonYaml(no: number, root: string): IRawMonYaml | undefined
{
	return loadResourceYaml<IRawMonYaml>('Mon', no, root);
}

/**
 * 讀取某種類的全部資源／依編號排序 / Load every resource of a kind, sorted by number
 * @param kind 資源種類 / resource kind
 * @param root 資源根目錄 / resource root
 * @returns 依 no 遞增排序的原始資料陣列 / raw records sorted by ascending `no`
 */
export function loadAllResourceYaml<T>(kind: IResourceKind, root: string): T[]
{
	const dir = resourceDir(kind, root);
	const records: { no: number; data: T }[] = [];

	for (const file of readdirSync(dir))
	{
		const m = FILE_PATTERN.exec(file);
		if (!m) continue;
		const no = Number(m[1]);
		if (!Number.isFinite(no)) continue;
		const text = readFileSync(join(dir, file), 'utf8');
		records.push({ no, data: parseResourceYaml<T>(text) });
	}

	records.sort((a, b) => a.no - b.no);

	return records.map((r) => r.data);
}

/**
 * 讀取全部角色資源 / Load all player-character resources
 */
export function loadAllChars(root: string): IRawCharYaml[]
{
	return loadAllResourceYaml<IRawCharYaml>('Char', root);
}

/**
 * 讀取全部怪物資源 / Load all monster resources
 */
export function loadAllMons(root: string): IRawMonYaml[]
{
	return loadAllResourceYaml<IRawMonYaml>('Mon', root);
}