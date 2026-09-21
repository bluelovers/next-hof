/**
 * 戰場角色圖像尺寸索引建置腳本（可重複使用，非臨時腳本）
 * Battlefield sprite image-size index builder (reusable, not ad-hoc)
 *
 * 設計 / Design:
 *   - 快取建立在「各圖檔資料夾內」：每個被掃描的資料夾各自產生一份
 *     .sprite-sizes.json，且只包含「該資料夾」的檔案（不含子資料夾以外的）。
 *     Cache lives INSIDE each image folder: every scanned folder gets its own
 *     .sprite-sizes.json containing ONLY that folder's files.
 *   - 快取條目僅以「檔名」為鍵（不含路徑），並記錄尺寸變更時間戳 ts（圖檔 mtime）。
 *     Cache entries key by FILENAME only (no path) and record a size-change
 *     timestamp ts (file mtime) for staleness detection.
 *   - 本腳本「僅」產出資料檔 spriteImageIndex.generated.ts（import 各資料夾快取 →
 *     補回資料夾前綴成 URL 鍵），不含任何固定邏輯；固定邏輯（型別 / 預設尺寸 / 查詢
 *     函式）集中在手寫、非生成的 src/components/battle/spriteImageSizes.ts。
 *     This script emits ONLY a DATA file (spriteImageIndex.generated.ts): it imports
 *     the per-folder caches and prefixes them back to URL keys. No fixed logic is
 *     included. Fixed logic (types / default size / lookup) lives in the hand-written,
 *     non-generated src/components/battle/spriteImageSizes.ts.
 *
 * 用途 / Purpose:
 *   1. 預先掃描角色圖像目錄，緩存每張圖的寬高到「各資料夾內」的索引（build）
 *   2. 針對缺漏或新增的單一圖檔，單獨讀取其尺寸（read one）
 *   3. 可選擇是否把單次讀取結果追加寫入所屬資料夾的索引（append）
 *
 * 對照原始 PHP：HOF_Class_Battle_Style::CopyRow() 中 getimagesize($img_file)
 * Mirrors PHP CopyRow(): getimagesize() reads image size for centering.
 *
 * 使用 / Usage:
 *   npm run sprite:index                                       # 完整重建（每資料夾一份快取 + 彙總 TS）
 *   npm run sprite:index -- --append image/char/xxx.png        # 單檔讀取並寫入所屬資料夾快取
 *   npm run sprite:index -- --append image/char/xxx.png --no-append  # 只讀取不寫入
 *
 * 注意：CLI 的圖檔引數請用「public 相對路徑」（無開頭斜線），因為在 msys/MinGW
 * bash 下，以 / 開頭的引數會被改寫為 Windows 路徑（如 D:/msys64/image/...）。
 * Note: pass the image arg as a public-relative path (no leading slash); under
 * msys/MinGW bash a leading-slash arg is rewritten to a Windows path.
 */

import {
  readFileSync,
  readdirSync,
  existsSync,
  writeFileSync,
  statSync,
  rmSync,
} from 'fs';
import { join, relative, resolve, dirname, basename } from 'path';

/** 圖像尺寸 / Image size */
export interface IImageSize {
  /** 寬度 / Width */
  width: number;
  /** 高度 / Height */
  height: number;
}

/** 快取條目：尺寸 + 尺寸變更時間戳（圖檔 mtime，毫秒） / Cache entry: size + timestamp of last size change (file mtime, ms) */
export type ICacheEntry = IImageSize & { timestamp: number };

/** 索引表型別：檔名 → 快取條目（每個資料夾各自一份） / Index type: filename → cache entry (one per folder) */
export type ISpriteSizeIndex = Record<string, ICacheEntry>;

// ============================================================================
// 路徑設定 / Path configuration
// ============================================================================

/** 專案根目錄下的 public（圖檔來源） / public dir under project root */
const PUBLIC_DIR = resolve(process.cwd(), 'public');

/** 預設掃描的精靈目錄（相對 public） / Default sprite dirs to scan (relative to public)
 *  含 char / char_rev（角色精靈）與 other（魔法陣 mc 圖）
 *  Includes char / char_rev (character sprites) and other (magic-circle mc images) */
const DEFAULT_SCAN_DIRS = [
  'image/char',
  'image/char_rev',
  'image/other',
];

/** 各資料夾內的快取檔名（點檔，避免與圖檔混淆） / Per-folder cache filename (dotfile) */
const CACHE_FILE_NAME = '.sprite-sizes.json';

/** 產出的「資料」TS（僅 import 各資料夾快取 + spread 合併；不含任何固定邏輯）
 *  Generated DATA TS (only imports per-folder caches + spread-merge; NO fixed logic).
 *  固定邏輯（型別 / 預設尺寸 / 查詢函式）位於手寫、非生成的 spriteImageSizes.ts。 */
const INDEX_TS = resolve(process.cwd(), 'src/components/battle/spriteImageIndex.generated.ts');

/** 舊版合併 JSON（若仍存在則重建時刪除，避免重複來源） / Legacy combined JSON (removed on rebuild) */
const OLD_COMBINED_INDEX = resolve(process.cwd(), 'src/components/battle/spriteImageSizes.json');

/** 支援的圖像副檔名 / Supported image extensions */
const IMAGE_EXT = ['.png', '.gif', '.jpg', '.jpeg', '.bmp', '.webp'];

// ============================================================================
// 單一圖檔尺寸讀取（純標頭解析，無外部依賴）
// Single-file size reader (pure header parsing, zero dependencies)
// ============================================================================

/**
 * 讀取單一圖檔尺寸（不依賴外部套件，直接解析檔頭）
 * Read a single image file's size (no external deps; parse header directly)
 *
 * @returns 尺寸；讀取失敗或格式不支援時回傳 null / size, or null if unreadable/unsupported
 */
export function readImageSize(filePath: string): IImageSize | null {
  let buf: Buffer;
  try {
    buf = readFileSync(filePath);
  } catch {
    return null;
  }
  return parseImageSize(buf);
}

/** 解析圖像緩衝區的寬高（支援 PNG / GIF / JPEG / BMP） / Parse width/height (PNG/GIF/JPEG/BMP) */
function parseImageSize(buf: Buffer): IImageSize | null {
  // PNG: 8-byte signature + IHDR(width@16, height@20, big-endian)
  if (
    buf.length >= 24 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  ) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // GIF: "GIF87a"/"GIF89a" + logical screen size (LE @6/@8)
  if (buf.length >= 10 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }

  // JPEG: 0xFFD8 ... SOF marker (0xFFC0–0xFFCF, 不含 0xC4/0xC8/0xCC)
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buf[offset + 1];
      if (
        marker >= 0xc0 && marker <= 0xcf &&
        marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
      ) {
        const height = buf.readUInt16BE(offset + 5);
        const width = buf.readUInt16BE(offset + 7);
        return { width, height };
      }
      const segLen = buf.readUInt16BE(offset + 2);
      if (segLen <= 0) break;
      offset += 2 + segLen;
    }
  }

  // BMP: "BM" + width@18 / height@22 (LE, signed)
  if (buf.length >= 26 && buf[0] === 0x42 && buf[1] === 0x4d) {
    return { width: buf.readInt32LE(18), height: buf.readInt32LE(22) };
  }

  return null;
}

// ============================================================================
// 各資料夾快取讀寫 / Per-folder cache read/write
// ============================================================================

/** 取得某掃描目錄的快取檔絕對路徑 / Absolute path of a dir's cache file */
function cacheFilePath(dir: string): string {
  return join(PUBLIC_DIR, dir, CACHE_FILE_NAME);
}

/**
 * 由 URL 推回所屬掃描目錄（取最長相符者）
 * Resolve which scan dir a URL belongs to (longest prefix match)
 */
function dirForUrl(url: string): string | null {
  const rel = url.replace(/^\/+/, '');
  let matched: string | null = null;
  for (const dir of DEFAULT_SCAN_DIRS) {
    if (rel === dir || rel.startsWith(dir + '/')) {
      if (!matched || dir.length > matched.length) {
        matched = dir;
      }
    }
  }
  return matched;
}

/** 讀取單一資料夾的快取（不存在或損壞時回傳空物件） / Load a folder's cache (empty if missing/broken) */
export function loadDirCache(dir: string): ISpriteSizeIndex {
  const file = cacheFilePath(dir);
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(readFileSync(file, 'utf-8')) as ISpriteSizeIndex;
  } catch {
    console.warn(`[warn] 快取解析失敗，視為空：${file}`);
    return {};
  }
}

/** 寫入單一資料夾的快取（只包含該資料夾的檔案） / Persist a folder's cache (only that folder's files) */
export function saveDirCache(dir: string, index: ISpriteSizeIndex): void {
  const file = cacheFilePath(dir);
  writeFileSync(file, JSON.stringify(index, null, 2) + '\n', 'utf-8');
}

/** 掃描單一目錄（遞迴，跳過點檔/非圖檔）並回傳該資料夾的索引 / Scan a dir recursively, return its index */
function buildDirIndex(dir: string): ISpriteSizeIndex {
  // 讀取既有快取，用於尺寸變更偵測（ts 不舊於檔案 mtime 時沿用）
  // Load existing cache for staleness detection (reuse when ts is not older than file mtime)
  const existing = loadDirCache(dir);
  const index: ISpriteSizeIndex = {};
  const abs = join(PUBLIC_DIR, dir);
  if (!existsSync(abs)) {
    console.warn(`[warn] 目錄不存在，已跳過 / dir not found, skipped: ${dir}`);
    return index;
  }

  const walk = (current: string): void => {
    for (const entry of readdirSync(current)) {
      if (entry.startsWith('.')) continue; // 跳過快取/隱藏檔（如 .sprite-sizes.json） / skip cache & hidden
      const full = join(current, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        walk(full);
        continue;
      }
      const ext = entry.toLowerCase().slice(entry.lastIndexOf('.'));
      if (!IMAGE_EXT.includes(ext)) continue;
      const name = basename(full); // 快取只用檔名（不含路徑） / cache uses filename only (no path)
      const ts = Math.round(st.mtimeMs); // 圖檔最後修改時間＝尺寸變更時間戳 / file mtime = size-change timestamp
      const cached = existing[name];
      if (cached && cached.timestamp >= ts) {
        index[name] = cached; // 未變更：沿用舊條目 / unchanged: reuse cached entry
        continue;
      }
      const size = readImageSize(full);
      if (size) {
        index[name] = { width: size.width, height: size.height, timestamp: ts };
      }
    }
  };

  walk(abs);
  return index;
}

// ============================================================================
// 完整重建 / Full rebuild
// ============================================================================

/**
 * 完整重建：對每個掃描目錄各自產生一份快取，並回傳合併索引
 * Full rebuild: generate a cache per scanned dir, return the combined index
 */
export function generateIndex(scanDirs: string[] = DEFAULT_SCAN_DIRS): ISpriteSizeIndex {
  const combined: ISpriteSizeIndex = {};
  for (const dir of scanDirs) {
    const dirIndex = buildDirIndex(dir);
    saveDirCache(dir, dirIndex);
    Object.assign(combined, dirIndex);
  }
  return combined;
}

/**
 * 產出彙總 TS：import 各資料夾快取並 spread 合併（不含任何資料字面量）
 * Generate the aggregator TS: import per-folder caches and spread-merge (no data literals)
 */
function saveAggregatorTs(scanDirs: string[] = DEFAULT_SCAN_DIRS): void {
  const indexDir = dirname(INDEX_TS);

  const importLines = scanDirs
    .map((dir) => {
      const spec = relative(indexDir, cacheFilePath(dir)).split('\\').join('/');
      const name = dir.replace(/[^a-zA-Z0-9]/g, '_');
      return `import ${name} from '${spec}';`;
    })
    .join('\n');

  const spreadLines = scanDirs
    .map((dir) => {
      const name = dir.replace(/[^a-zA-Z0-9]/g, '_');
      const prefix = '/' + dir + '/';
      // 各資料夾快取以「檔名」為鍵，彙總時補回資料夾路徑前綴成為完整 URL 鍵
      // Per-folder caches key by filename; prefix the folder path back to form full-URL keys
      return `  ...Object.fromEntries(Object.entries(${name}).map(([k, v]) => [${JSON.stringify(prefix)} + k, v])),`;
    })
    .join('\n');

  const content = `/**
 * AUTO-GENERATED by scripts/sprite-size-index.ts — DO NOT EDIT MANUALLY.
 * 戰場角色圖像尺寸索引「資料」（僅彙總各資料夾快取；不含任何固定邏輯）
 * Battlefield sprite size index DATA (aggregates per-folder caches; NO fixed logic).
 *
 * 各資料夾快取（.sprite-sizes.json）僅以「檔名」為鍵，並記錄尺寸變更時間戳 ts（圖檔 mtime）；
 * 此處彙總時補回資料夾前綴，還原成以完整 URL 為鍵的索引。
 * Each per-folder cache (.sprite-sizes.json) keys by FILENAME only and records a
 * size-change timestamp (ts = file mtime); this aggregator restores full-URL keys
 * by prefixing the folder path.
 *
 * 固定邏輯（型別 / 預設尺寸 / 查詢函式）位於手寫、非生成的 spriteImageSizes.ts。
 * Fixed logic (types / default / lookup) lives in the hand-written, non-generated
 * spriteImageSizes.ts.
 *
 * 重建：npm run sprite:index
 * 單檔補充：npm run sprite:index -- --append image/char/xxx.png
 *
 * 對照 PHP：CopyRow() 中 getimagesize() 讀取圖檔尺寸用於中心對齊
 * Mirrors PHP CopyRow(): getimagesize() reads size for centering.
 */
import type { ISpriteImageSize } from './spriteImageSizes';

${importLines}

/** 圖像尺寸索引：URL → 尺寸（由各資料夾快取彙總） / Size index: URL → size (aggregated from per-folder caches) */
export const spriteImageSizes: Record<string, ISpriteImageSize> = {
${spreadLines}
};
`;

  writeFileSync(INDEX_TS, content, 'utf-8');
}

// ============================================================================
// 單一圖檔讀取 / Single-file read (+ optional append)
// ============================================================================

/**
 * 單一圖檔讀取，並可選擇是否追加寫入所屬資料夾的快取
 * Read a single image and optionally append it to its folder's cache
 *
 * @param url 圖檔 URL（如 /image/char/mon_052.png） / Image URL
 * @param opts.append 是否寫入所屬資料夾快取（預設 true） / whether to persist (default true)
 * @returns 尺寸；失敗回傳 null / size, or null on failure
 */
export function readAndCache(
  url: string,
  opts: { append?: boolean } = {}
): IImageSize | null {
  const append = opts.append ?? true;
  const filePath = join(PUBLIC_DIR, url.replace(/^\/+/, ''));
  const size = readImageSize(filePath);
  if (!size) return null;

  if (append) {
    const dir = dirForUrl(url);
    if (dir) {
      const st = statSync(filePath);
      const index = loadDirCache(dir);
      // 快取只用檔名（不含路徑），並記錄尺寸變更時間戳（檔案 mtime）
      // Cache uses filename only (no path) and records the size-change timestamp (file mtime)
      index[basename(url)] = {
        width: size.width,
        height: size.height,
        timestamp: Math.round(st.mtimeMs),
      };
      saveDirCache(dir, index);
      saveAggregatorTs(DEFAULT_SCAN_DIRS);
    } else {
      console.warn(`[warn] 無法對應到掃描目錄，未寫入快取 / no matching scan dir, not cached: ${url}`);
    }
  }

  return size;
}

// ============================================================================
// CLI
// ============================================================================

/** 正規化 CLI 傳入的圖檔引數為 URL / Normalize a CLI image argument into a URL */
function normalizeImageArg(arg: string): string | null {
  if (!arg) return null;
  if (arg.startsWith('/')) return arg;
  if (/^[A-Za-z]:[\\/]/.test(arg)) {
    const rel = relative(PUBLIC_DIR, arg);
    if (!rel.startsWith('..')) {
      return '/' + rel.split('\\').join('/');
    }
    return null;
  }
  if (!arg.includes(':')) {
    return '/' + arg.replace(/\\/g, '/').replace(/^\/+/, '');
  }
  return null;
}

function main(): void {
  const args = process.argv.slice(2);

  const appendIdx = args.indexOf('--append');
  if (appendIdx !== -1) {
    const url = normalizeImageArg(args[appendIdx + 1]);
    const noAppend = args.includes('--no-append');
    if (!url) {
      console.error('請提供圖檔（URL 或 public 相對路徑），例如：--append image/char/xxx.png');
      process.exit(1);
    }
    const size = readAndCache(url, { append: !noAppend });
    if (!size) {
      console.error(`讀取失敗 / read failed: ${url}`);
      process.exit(1);
    }
    console.log(
      `${url} => ${size.width}x${size.height}` +
      (noAppend ? ' (未寫入索引 / not appended)' : ' (已寫入所屬資料夾快取 / appended to folder cache)')
    );
    return;
  }

  // 完整重建 / full rebuild
  // 刪除舊版合併 JSON（若仍存在），避免重複來源 / remove legacy combined JSON if present
  if (existsSync(OLD_COMBINED_INDEX)) {
    rmSync(OLD_COMBINED_INDEX, { force: true });
  }
  const combined = generateIndex(DEFAULT_SCAN_DIRS);
  saveAggregatorTs(DEFAULT_SCAN_DIRS);
  // 各資料夾快取以檔名為鍵，跨資料夾會重名（如 mon_052.png），故分別計數再累加
  // Per-folder caches key by filename, which collide across folders; count per folder then sum
  const total = DEFAULT_SCAN_DIRS.reduce(
    (sum, dir) => sum + Object.keys(loadDirCache(dir)).length,
    0
  );
  console.log(
    `已重建快取 / caches rebuilt: ${DEFAULT_SCAN_DIRS.length} 個資料夾, ` +
    `合計 ${total} 筆 (來源 / source: ${DEFAULT_SCAN_DIRS.join(', ')})`
  );
}

main();
