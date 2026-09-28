#!/usr/bin/env node
/**
 * 安全的 `//` → 區塊註解轉換器 (v33)
 *
 * 功能特性:
 *  - 預設為 dry-run（不編輯），需加上 `--write` 才會實際寫入檔案；`--diff` 顯示變更對照
 *  - `--no-recursive`：目錄目標只處理該目錄下的檔案，不下探子目錄
 *  - 安全限制：檔案過多時警告並停止、資料夾搜尋深度上限、檔案過大整檔不處理
 *  - 目標驗證：拒絕 `..`（路徑段）、`//`、`\\`、絕對路徑、根目錄/磁碟根
 *  - `$` 規則：目錄自動掃描的檔名含 `$` 一律拒絕；手動指定允許 `$`，但禁止裸 `$` 開頭（需 `./$`）與無檔名的 `$`
 *  - 同時含 regex、區塊註解標記（不分順序）或指令註解的行，跳過並回報
 *  - 單行過長（>500 字元）不處理並報告；報告文字會剪裁
 *  - 報告上限：普通檔案每種類別最多 5 筆；過大檔案（整檔跳過）最多列出 5 個
 *  - 允許以參數明確指定檔案（不限副檔名，例如 .cjs / .js / .mjs）
 *  - 大小寫驗證：目標檔案僅比對檔名，大小寫不符即跳過並警告
 *  - 開頭為三斜線（///）的行不處理並報告（如 TypeScript /// <reference> 指令）
 *  - 去重：同一檔案可能同時經由目錄掃描與明確參數收集
 *  - 保留原始換行格式（CRLF/LF）；Retained 與 Skipped 分開統計；日誌一律英文
 *  - 以 async/await 與 fs.promises 實作
 *  - 未提供路徑時顯示用法與旗標說明；提供路徑但找不到檔案時逐項說明原因
 *  - 檔案過多警告時列出前 5 個檔案；可用 `--max-files <N>` 放寬上限
 */

const fs = require('fs');
const path = require('path');

/** ==================== 安全限制設定 / Safety Limits ==================== */

/** 資料夾內最大允許處理的檔案數上限（超過則警告並停止） / Max files allowed in a folder (warn & stop when exceeded) */
const MAX_FILES = 20;

/** 預設最大搜尋深度（防止過度深層掃描，0 代表僅目標目錄本身） / Default max search depth (0 = target dir only) */
const MAX_DEPTH = 2;

/** 單一檔案大小上限（超過則整檔不處理） / Max file size (skip whole file when exceeded) */
const MAX_FILE_BYTES = 100 * 1024;

/** 單一來源行長度上限（超過則該行不處理並報告） / Max source line length (skip & report when exceeded) */
const MAX_LINE_LENGTH = 500;

/** 每個類別最多顯示的報告明細筆數（普通檔案） / Max report detail lines per category (normal files) */
const MAX_REPORT_PER_FILE = 5;

/** 報告中單行文字的最大長度（存入 skip 紀錄時即裁切） / Max report text length per line (clipped when stored) */
const MAX_REPORT_TEXT = 70;

/** --diff 預覽最多顯示行數 / Max diff lines shown per file */
const MAX_DIFF_LINES = 60;

/** ====================================================== */

function isSeparator(rest)
{
	if (rest.length < 3) return false;
	return /^([=\-*]{3,})([\s\S]*?)\1$/.test(rest);
}

function esc(s)
{
	return s.replace(/\*\//g, '* /');
}

/**
 * 剪裁過長文字供報告顯示
 * Clip long text for report display
 */
function clip(s, max)
{
	if (s.length <= max) return s;
	return s.slice(0, max - 1) + '…';
}

/**
 * 定位到 `//` 的報告剪裁：以 `//` 為中心，從其前方 lookback 字元處開始裁切，
 * 更早的內容以「…」取代（讓人看到 `//` 前的少量上下文）
 *
 * Report clipping anchored at `//`: start clipping `lookback` chars BEFORE the marker,
 * replacing earlier content with "…" (so the context right before `//` stays visible)
 */
function clipAroundComment(text, max, lookback = 30)
{
	if (text.length <= max) return text;
	const idx = text.indexOf('//');
	if (idx === -1 || idx <= lookback)
	{
		return clip(text, max);
	}
	const start = idx - lookback;
	return `…${clip(text.slice(start), max - 1)}`;
}

const REGEX_START_CHARS = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', ';', '}', '^', '>', '~', '+', '-', '*', '%', '<', '@']);
const REGEX_KEYWORDS = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'do', 'else', 'case', 'await', 'void', 'delete', 'throw', 'yield']);
const identCharRe = /[A-Za-z0-9_$]/;

/**
 * 逐字元掃描一行，維護字串 / 區塊註解 / regex 狀態
 * Scan a line character by character, tracking string / block comment / regex state
 */
function processLine(line, inBlock, inStr)
{
	let j = 0;
	let regex = false;
	let charClass = false;
	let regexOnLine = false;
	let lastSig = '';
	let lastWord = '';
	let wordBuf = '';
	const reasons = [];
	const n = line.length;

	while (j < n)
	{
		const c = line[j];

		/** 1. 字串／模板字面量內部 / Inside a string or template literal */
		if (inStr)
		{
			if (c === '\\') { j += 2; continue; }
			if (c === inStr) inStr = null;
			j++;
			continue;
		}

		/** 2. 位於區塊註解 (Block Comment) 內部 / Inside a block comment */
		if (inBlock)
		{
			/**
			 * 檢測區塊註解內部是否含有 `//`（即 `//` 位於區塊「之中」）
			 * Detect `//` inside a block comment (i.e. `//` is inside the block)
			 */
			if (c === '/' && line[j + 1] === '/')
			{
				reasons.push('line may contain block comment (// inside block), skipped for safety');
			}
			if (c === '*' && line[j + 1] === '/')
			{
				inBlock = false;
				j += 2;
				continue;
			}
			j++;
			continue;
		}

		/**
		 * 3. 字串進入點。
		 * 單引號僅在前一字元非識別字元時視為字串開頭，避免 `don't`、`12''` 等撇號誤判。
		 *
		 * String entry point. A single quote only opens a string when the previous
		 * character is not an identifier char, to avoid misreading apostrophes.
		 */
		if (c === '"' || c === '`' || (c === "'" && !identCharRe.test(line[j - 1] || '')))
		{
			inStr = c;
			lastSig = c;
			regex = false;
			charClass = false;
			wordBuf = '';
			lastWord = '';
			j++;
			continue;
		}

		/** 4. 跳過空白 / Skip whitespace */
		if (c === ' ' || c === '\t' || c === '\r')
		{
			j++;
			continue;
		}

		/** 5. 區塊註解起始點 / Block comment start */
		if (c === '/' && line[j + 1] === '*')
		{
			inBlock = true;
			j += 2;
			continue;
		}

		/** 6. `//`（雙斜線）處理 / Handle // (double slash) */
		if (c === '/')
		{
			if (regex)
			{
				if (charClass) { j++; continue; }
				regex = false;
				charClass = false;
				lastSig = '/';
				wordBuf = '';
				lastWord = '';
				j++;
				continue;
			}

			if (line[j + 1] === '/')
			{
				const prev = j > 0 ? line[j - 1] : '';
				if (prev === '' || prev === ' ' || prev === '\t' || prev === '\r')
				{
					return { index: j, inBlock, inStr, regexOnLine, reasons };
				}
				reasons.push('\'//\' after non-space (maybe regex/division)');
				j += 2;
				continue;
			}

			if (lastSig === '' || REGEX_START_CHARS.has(lastSig) || REGEX_KEYWORDS.has(lastWord))
			{
				regex = true;
				charClass = false;
				regexOnLine = true;
			}
			lastSig = '/';
			wordBuf = '';
			lastWord = '';
			j++;
			continue;
		}

		/** 7. 其他字元 / Other characters */
		lastSig = c;
		if (regex)
		{
			if (c === '\\') { j += 2; continue; }
			else if (c === '[') charClass = true;
			else if (c === ']') charClass = false;
		}

		if (identCharRe.test(c))
		{
			wordBuf += c;
			lastWord = wordBuf;
		} else
		{
			wordBuf = '';
			lastWord = '';
		}
		j++;
	}

	if (regex) regexOnLine = true;
	return { index: -1, inBlock, inStr, regexOnLine, reasons };
}

/**
 * 分類已偵測到 `//` 的行，回傳處理決策（抽離自 convertFile 主迴圈）
 * Classify a line containing a detected `//` comment (extracted from the convertFile loop)
 *
 * @returns {Object} 決策物件 / decision object
 *   - skip  ：跳過並報告（reason / kind）
 *   - inline：行尾註解 → 內嵌區塊註解（before / comment）
 *   - group ：純註解行 → 進入連續合併流程
 */
function classifyCommentLine(line, r)
{
	/**
	 * 單一來源行過長：不處理並報告（可能為壓縮/產生碼，轉換風險高）
	 * Source line too long: skip & report (likely minified/generated code)
	 */
	if (line.length > MAX_LINE_LENGTH)
	{
		return { action: 'skip', kind: 'review', reason: `line too long (${line.length} chars > ${MAX_LINE_LENGTH}), skipped for safety` };
	}

	/**
	 * 同時含有區塊註解標記（`/*` 或 `* /`）與 `//`：不分先後位置一律跳過並回報
	 * If the line also contains block comment markers alongside `//`, skip regardless of order
	 */
	if (/\/\*|\*\//.test(line))
	{
		return { action: 'skip', kind: 'review', reason: 'line may contain block comment, skipped for safety' };
	}

	const rest = line.slice(r.index + 2);

	/**
	 * 開頭為三斜線（///）的行：不處理並報告（例如 TypeScript 的 `/// <reference>` 指令）
	 * Triple-slash (///) lines: kept as-is and reported (e.g. TypeScript `/// <reference>`)
	 */
	if (rest.startsWith('/'))
	{
		return { action: 'skip', kind: 'retained', reason: 'triple-slash comment (///), kept as-is' };
	}

	const before = line.slice(0, r.index);
	const text0 = rest.startsWith(' ') ? rest.slice(1) : rest;

	/** 分隔線（isSeparator）原樣保留並回報 / Separator lines kept as-is and reported */
	if (before.trim() === '' && isSeparator(text0))
	{
		return { action: 'skip', kind: 'retained', reason: 'separator line (isSeparator), kept as-is' };
	}

	/**
	 * 指令註解（如 `// @ts-ignore`）保留原樣並回報
	 * Directive comments (e.g. `// @ts-ignore`) kept as-is and reported
	 */
	if (/^\s*@/.test(rest))
	{
		return { action: 'skip', kind: 'retained', reason: 'directive comment (// @...) kept as-is' };
	}

	/** 行內含有 regex literal，跳過並回報 / Lines with a regex literal are skipped & reported */
	if (r.regexOnLine)
	{
		return { action: 'skip', kind: 'review', reason: 'has regex literal, skipped for safety' };
	}

	/** 行尾註解：轉成內嵌區塊註解 / Trailing comment: convert to an inline block comment */
	if (before.trim() !== '')
	{
		return { action: 'inline', before, comment: text0 };
	}

	/** 純註解行：進入連續合併流程 / Pure comment line: go through the group merge flow */
	return { action: 'group' };
}

/**
 * 將一組連續註解行渲染為單一多行區塊註解
 * Render a group of consecutive comment lines as a single multi-line block comment
 */
function renderGroup(group)
{
	const indent = group[0].indent;
	const lines = [`${indent}/**`];
	for (const g of group)
	{
		lines.push(g.text === '' ? `${g.indent} *` : `${g.indent} * ${esc(g.text)}`);
	}
	lines.push(`${indent} */`);
	return lines;
}

/**
 * 產生簡單的行級變更對照（用於 --diff 預覽）
 * 使用具前瞻視窗的貪婪對齊，插入/刪除行時仍能找到後續錨點行
 *
 * Produce a simple line-level diff for the --diff preview
 * (greedy alignment with a look-ahead window so anchors survive insertions/deletions)
 */
function makeLineDiff(oldLines, newLines)
{
	const WINDOW = 20;
	const diff = [];
	let i = 0;
	let j = 0;
	while (i < oldLines.length || j < newLines.length)
	{
		if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j])
		{
			i++;
			j++;
			continue;
		}

		if (i >= oldLines.length)
		{
			diff.push(`+ ${newLines[j]}`);
			j++;
			continue;
		}
		if (j >= newLines.length)
		{
			diff.push(`- ${oldLines[i]}`);
			i++;
			continue;
		}

		let foundNew = -1;
		for (let k = j + 1; k < newLines.length && k <= j + WINDOW; k++)
		{
			if (oldLines[i] === newLines[k]) { foundNew = k; break; }
		}
		let foundOld = -1;
		for (let k = i + 1; k < oldLines.length && k <= i + WINDOW; k++)
		{
			if (oldLines[k] === newLines[j]) { foundOld = k; break; }
		}

		const useNew = foundNew !== -1 && (foundOld === -1 || foundNew - j <= foundOld - i);
		if (useNew)
		{
			for (let k = j; k < foundNew; k++) diff.push(`+ ${newLines[k]}`);
			j = foundNew;
			continue;
		}
		if (foundOld !== -1)
		{
			for (let k = i; k < foundOld; k++) diff.push(`- ${oldLines[k]}`);
			i = foundOld;
			continue;
		}

		diff.push(`- ${oldLines[i]}`);
		diff.push(`+ ${newLines[j]}`);
		i++;
		j++;
	}
	return diff;
}

/**
 * 依 reason 字串推導報告類別（用於每類上限）
 * Derive a report category from the reason string (used for per-category caps)
 */
function reasonCategory(reason)
{
	if (reason.startsWith('directive comment')) return 'directive';
	if (reason.startsWith('triple-slash')) return 'triple-slash';
	if (reason.startsWith('separator line')) return 'separator';
	if (reason.startsWith('line may contain block comment')) return 'block-comment';
	if (reason.startsWith('has regex')) return 'regex';
	if (reason.startsWith('line too long')) return 'long-line';
	return 'other';
}

/**
 * 讀取並轉換單一檔案；僅在 --write 模式下寫入
 * Read and convert a single file; write only in --write mode
 */
async function convertFile(filePath, writeMode, wantDiff)
{
	const st = await fs.promises.stat(filePath);
	if (st.size > MAX_FILE_BYTES)
	{
		/**
		 * 檔案過大：整檔不處理（回傳 fileSkip）
		 * File too large: do not process the whole file (return fileSkip)
		 */
		return { changed: false, skipped: [], fileSkip: `file too large (${st.size} bytes > ${MAX_FILE_BYTES})` };
	}

	const rawContent = await fs.promises.readFile(filePath, 'utf8');

	/** 去除 UTF-8 BOM（若存在） / Strip UTF-8 BOM if present */
	const content = rawContent.charCodeAt(0) === 0xFEFF ? rawContent.slice(1) : rawContent;

	/**
	 * 保留原始換行格式：以第一個換行為準，join 時使用相同 EOL，
	 * 讓新產生的行也帶原始 `\r`（CRLF 檔案不會變成 LF）
	 *
	 * Preserve the original EOL: use the first newline as the join separator,
	 * so generated lines keep the original `\r` (CRLF files stay CRLF).
	 */
	const eolMatch = content.match(/\r?\n/);
	const eol = eolMatch ? eolMatch[0] : '\n';
	const lines = content.split(/\r?\n/);
	const N = lines.length;
	const skipped = [];
	const out = [];
	let i = 0;
	let inBlock = false;
	let inStr = null;

	while (i < N)
	{
		const line = lines[i];
		const r = processLine(line, inBlock, inStr);

		inBlock = r.inBlock;
		inStr = r.inStr;

		if (r.index === -1)
		{
			if (r.reasons.length > 0)
			{
				skipped.push({ lineNo: i + 1, text: clipAroundComment(line.trim(), MAX_REPORT_TEXT), reason: r.reasons.join('; '), kind: 'review' });
			}
			out.push(line);
			i++;
			continue;
		}

		const decision = classifyCommentLine(line, r);

		/** 跳過並報告（過長行 / 區塊標記 / 三斜線 / 分隔線 / 指令 / regex） */
		if (decision.action === 'skip')
		{
			skipped.push({ lineNo: i + 1, text: clipAroundComment(line.trim(), MAX_REPORT_TEXT), reason: decision.reason, kind: decision.kind });
			out.push(line);
			i++;
			continue;
		}

		/** 行尾註解 → 內嵌區塊註解（保留縮排） */
		if (decision.action === 'inline')
		{
			const indent = decision.before.slice(0, decision.before.length - decision.before.trimStart().length);
			const codePart = decision.before.trimEnd();
			out.push(`${indent}/** ${esc(decision.comment)} */`);
			out.push(codePart);
			i++;
			continue;
		}

		/** 純註解行 → 收集連續註解行合併為一個區塊 */
		const group = [];
		let j = i;
		while (j < N)
		{
			const l = lines[j];
			if (l.trim() === '') break;

			const rr = processLine(l, false, inStr);
			if (rr.index === -1 || rr.regexOnLine) break;

			const bb = l.slice(0, rr.index);
			if (bb.trim() !== '') break;

			const tt = l.slice(rr.index + 2);
			const tx = tt.startsWith(' ') ? tt.slice(1) : tt;
			if (isSeparator(tx)) break;
			if (/\/\*|\*\//.test(l)) break;
			if (/^\s*@/.test(tx)) break;
			if (tx.startsWith('/')) break;

			group.push({ indent: bb, text: tx });
			j++;
		}

		if (group.length === 0)
		{
			out.push(line);
			i++;
			continue;
		}

		out.push(...renderGroup(group));
		i = j;
	}

	const result = out.join(eol);
	let changed = false;
	if (result !== content)
	{
		/**
		 * 僅在 --write 模式下才實際寫入檔案，否則為 dry-run（預設）
		 * Only write the file in --write mode; otherwise dry-run (default)
		 */
		if (writeMode)
		{
			await fs.promises.writeFile(filePath, result);
		}
		changed = true;
	}

	/** 需要 --diff 預覽且內容有變時，計算行級對照 / Build diff when requested and changed */
	let diff = null;
	if (wantDiff && changed)
	{
		diff = makeLineDiff(lines, out);
	}
	return { changed, skipped, fileSkip: null, diff };
}

/**
 * 遞迴搜尋檔案，包含最大深度限制；`--no-recursive` 時不下探子目錄；
 * 檔名含 `$` 的檔案不收集（記錄到 dollarSkips）
 *
 * Recursively search for files with a maximum depth limit; skip subdirs with `--no-recursive`;
 * files whose name contains `$` are not collected (recorded into dollarSkips)
 */
async function walk(dir, collected, currentDepth = 0, recursive = true, dollarSkips = null)
{
	if (currentDepth > MAX_DEPTH)
	{
		/** 超過最大允許深度，不再深入掃描 / Exceeded max depth, stop deeper scanning */
		return;
	}

	const entries = await fs.promises.readdir(dir);
	for (const f of entries)
	{
		const fp = path.join(dir, f);
		let st;
		try
		{
			st = await fs.promises.stat(fp);
		}
		catch
		{
			/** 無法存取項目（權限不足等）時跳過，不讓整個掃描失敗 / Skip unreadable entries so one failure does not abort the walk */
			continue;
		}
		if (st.isDirectory())
		{
			/** 僅收集該目錄下的檔案時，不下探子目錄 / With --no-recursive, do not descend into subdirectories */
			if (!recursive) continue;
			if (/node_modules/.test(f) || f.startsWith('.')) continue;
			await walk(fp, collected, currentDepth + 1, recursive, dollarSkips);
		}
		else if (/\.(ts|tsx)$/.test(f) && !f.endsWith('.d.ts'))
		{
			/** 目錄自動掃描：檔名含 `$` 一律拒絕並記錄 / Directory scans reject filenames containing `$` */
			if (/\$/.test(f))
			{
				if (dollarSkips) dollarSkips.push(fp);
				continue;
			}
			collected.push(fp);
		}
	}
}

/**
 * 目錄項目快取：同一目錄只查詢一次，避免重複呼叫 readdir
 * Directory listing cache: query each directory only once
 */
const dirListingCache = new Map();

/**
 * 取得目錄項目清單（已快取；回傳 Promise）
 * Get a directory listing (cached; returns a Promise)
 */
function listDir(dir)
{
	const key = path.normalize(dir);
	if (!dirListingCache.has(key))
	{
		const listing = fs.promises.readdir(dir);
		/** 失敗時移除快取，避免永久快取 rejected promise / Drop cached promise on failure */
		listing.catch(() => dirListingCache.delete(key));
		dirListingCache.set(key, listing);
	}
	return dirListingCache.get(key);
}

/**
 * 判斷目標路徑是否不安全（禁止模式）
 * Judge whether a target path is unsafe (forbidden patterns)
 */
function isUnsafeTarget(t)
{
	/**
	 * 禁止：`..` 作為路徑段（父目錄越界）、雙斜線 `//` 或 `\\`（UNC / 合併路徑）
	 * Forbid: `..` as a path segment (parent traversal), double slashes `//` / `\\` (UNC / joined paths)
	 */
	if (t.split(/[\\/]/).includes('..') || t.includes('//') || t.includes('\\\\'))
	{
		return true;
	}

	/**
	 * 手動指定的 `$` 規則（manual targets）：
	 *  - 允許 `$` 存在於路徑中，但：
	 *    a) 禁止「無路徑的 `$` 開頭」：以 `$` 開頭且非 `./$` 形式（如 `$foo.ts`）→ 拒絕；`./$foo.ts` 允許
	 *    b) 禁止「無檔名的 `$`」：任一 path 段恰為 `$`（如 `dir/$`、`$`）→ 拒絕
	 *
	 * Manual `$` rules: `$` is allowed in manual targets, except
	 * a) a bare `$`-leading path without a `./` prefix (e.g. `$foo.ts`); `./$foo.ts` is allowed
	 * b) a `$` segment with no filename (e.g. `dir/$`, `$`)
	 */
	if (/^\$/.test(t) && !/^\.\//.test(t))
	{
		return true;
	}
	if (t.split(/[\\/]/).some((seg) => seg === '$'))
	{
		return true;
	}

	/**
	 * 禁止：以 `/` 或 `\` 開頭（絕對路徑）
	 * Forbid: paths starting with `/` or `\` (absolute paths)
	 */
	if (/^[/\\]/.test(t))
	{
		return true;
	}

	/**
	 * 禁止：根目錄或磁碟根（如 `/`、`\`、`C:`、`C:\`、`C:/`）
	 * Forbid: root or drive root (e.g. `/`, `\`, `C:`, `C:\`, `C:/`)
	 */
	if (t === '/' || t === '\\' || /^[A-Za-z]:[\\/]?$/.test(t))
	{
		return true;
	}

	return false;
}

/**
 * 解析命令列旗標與目標
 * Parse command-line flags and targets
 */
function parseArgs(rawArgs)
{
	let writeMode = false;
	let showDiff = false;
	let recursive = true;

	/** 放寬後的上限（未指定時使用 MAX_FILES）/ overridden file limit (null → MAX_FILES) */
	let maxFiles = null;

	const targets = [];
	for (let idx = 0; idx < rawArgs.length; idx++)
	{
		const a = rawArgs[idx];
		if (a === '--write')
		{
			writeMode = true;
		}
		else if (a === '--diff')
		{
			showDiff = true;
		}
		else if (a === '--no-recursive')
		{
			recursive = false;
		}
		else if (a === '--max-files')
		{
			/** --max-files 需接一個正整數值 / requires a positive integer value */
			const next = rawArgs[idx + 1];
			const parsed = parseInt(next, 10);
			if (next === undefined || !Number.isInteger(parsed) || parsed <= 0)
			{
				throw new Error(`--max-files requires a positive integer, got: ${next === undefined ? '(missing)' : next}`);
			}
			maxFiles = parsed;
			idx++; // 消耗該值 / consume the value
		}
		else
		{
			targets.push(a);
		}
	}
	return { writeMode, showDiff, recursive, maxFiles, targets };
}

/**
 * 收集所有符合條件的檔案（含大小寫驗證與目錄掃描）
 * Collect all matching files (with case validation and directory walk)
 */
async function collectFiles(targets, filesToProcess, caseMismatch, recursive = true, dollarSkips = null, missingTargets = null)
{
	for (const t of targets)
	{
		let stat;
		try
		{
			stat = await fs.promises.stat(t);
		}
		catch
		{
			/** 路徑不存在或無法存取：記錄後跳過 / Record missing paths and skip */
			if (missingTargets) missingTargets.push(t);
			continue;
		}

		if (stat.isDirectory())
		{
			await walk(t, filesToProcess, 0, recursive, dollarSkips);
		}
		else
		{
			/**
			 * 大小寫驗證（僅比對檔名 / basename）：
			 * 在大小寫不敏感的系統上，大小寫錯誤的路徑仍可存取，
			 * 故比對父目錄的實際項目；檔名大小寫不符的目標檔案直接跳過並警告。
			 *
			 * Case validation (basename only): on case-insensitive systems a wrong-case
			 * path still resolves, so compare against the parent dir listing and skip
			 * targets whose filename case does not match the actual entry.
			 */
			const base = path.basename(t);
			const parentDir = path.dirname(t);
			let actualNames;
			try
			{
				actualNames = await listDir(parentDir);
			}
			catch
			{
				/** 無法列出父目錄時跳過 / Cannot list the parent dir, skip */
				continue;
			}
			if (actualNames.indexOf(base) === -1)
			{
				caseMismatch.push(t);
				continue;
			}

			/**
			 * 明確指定的檔案一律接受（不限副檔名，例如 .cjs / .js / .mjs）
			 * Explicitly specified files are always accepted regardless of extension
			 */
			filesToProcess.push(t);
		}
	}
}

/**
 * 正規化、去重並排序待處理檔案
 * Normalize, deduplicate and sort the files to process
 */
function dedupeFiles(files)
{
	const unique = [];
	const seen = new Set();
	for (const fp of files)
	{
		const norm = path.normalize(fp);
		const key = process.platform === 'win32' ? norm.toLowerCase() : norm;
		if (!seen.has(key))
		{
			seen.add(key);
			unique.push(norm);
		}
	}
	unique.sort();
	return unique;
}

/**
 * 輸出大小寫不符警告（列出目標與實際檔名）
 * Print case-mismatch warnings (requested target vs actual entry name)
 */
async function printCaseMismatch(caseMismatch)
{
	if (caseMismatch.length === 0) return;

	console.warn(`\n[WARNING] ${caseMismatch.length} target file(s) skipped: filename case does not match the actual file.`);
	for (const cm of caseMismatch)
	{
		let actualName = null;
		try
		{
			const listing = await listDir(path.dirname(cm));
			actualName = listing.find((e) => e.toLowerCase() === path.basename(cm).toLowerCase());
		}
		catch
		{
			/** 目錄無法列出時略過實際檔名 / Skip actual-name lookup when the dir cannot be listed */
		}
		console.warn(`  - ${cm}` + (actualName ? `  (actual: ${actualName})` : ''));
	}
	console.warn('');
}

/**
 * 輸出 --diff 變更對照（上限 MAX_DIFF_LINES 行）
 * Print the --diff change preview (capped at MAX_DIFF_LINES)
 */
function printDiff(fp, diff)
{
	console.log(`\n[DIFF] ${fp}`);
	for (let d = 0; d < Math.min(diff.length, MAX_DIFF_LINES); d++)
	{
		console.log(diff[d]);
	}
	if (diff.length > MAX_DIFF_LINES)
	{
		console.log(`  ... and ${diff.length - MAX_DIFF_LINES} more diff line(s) (capped).`);
	}
}

/**
 * 輸出目前的目標路徑（依最頂層共同父路徑分組，子目錄目標以相對路徑顯示）
 * Print the current target paths (grouped by top-level common parent; subdir targets shown with relative paths)
 */
function printTargets(targets)
{
	if (targets.length === 0)
	{
		console.log('[TARGETS] (none)');
		return;
	}

	/** 目標清單 / raw target paths */
	const parents = targets.map((t) => path.normalize(path.dirname(t)));

	/**
	 * 找出 p 在集合內的最頂層祖先（沒有集合內祖先則為自己）
	 * Find the top-level ancestor of p within the parent set (itself if none)
	 */
	const topAncestor = (p) =>
	{
		let cur = p;
		while (true)
		{
			const up = path.normalize(path.dirname(cur));
			if (up === cur) break; // 已到檔案系統根 / reached a filesystem root
			if (parents.indexOf(up) !== -1) { cur = up; continue; }
			break;
		}
		return cur;
	};

	/**
	 * 目標從群組根算起的顯示名稱（子目錄用相對路徑，如 other\same）
	 * Display name of a target relative to the group root (e.g. other\same)
	 */
	const displayName = (root, t) =>
	{
		const parent = path.normalize(path.dirname(t));
		const base = path.basename(t);
		if (parent === root) return base;
		return path.join(path.relative(root, parent), base);
	};

	/** 群組根 → 顯示名稱清單 / group root -> display names */
	const groups = new Map();
	for (const t of targets)
	{
		const root = topAncestor(path.normalize(path.dirname(t)));
		if (!groups.has(root)) groups.set(root, []);
		groups.get(root).push(displayName(root, t));
	}

	console.log('[TARGETS]');
	const roots = [...groups.keys()].sort();
	for (const root of roots)
	{
		/** 以 `.` 表示目前工作目錄並標示 / Mark `.` as the current working directory */
		const label = root === '.' ? `${root} (current cwd)` : root;
		console.log(`  ${label}`);
		for (const name of groups.get(root))
		{
			console.log(`    - ${name}`);
		}
	}
}

/**
 * 處理所有檔案並累計報告資料
 * Process all files and aggregate report data
 */
async function processAll(filesToProcess, writeMode, showDiff)
{
	let changed = 0;
	let retainedCount = 0;
	let reviewCount = 0;
	const fileReports = [];
	const fileSkips = [];
	const report = [];

	for (const fp of filesToProcess)
	{
		const { changed: ch, skipped, fileSkip, diff } = await convertFile(fp, writeMode, showDiff);

		if (fileSkip)
		{
			fileSkips.push({ file: fp, reason: fileSkip });
			continue;
		}

		if (ch) changed++;

		fileReports.push({ file: fp, changed: ch, skippedCount: skipped.length });

		for (const s of skipped)
		{
			if (s.kind === 'retained')
			{
				retainedCount++;
			}
			else
			{
				reviewCount++;
			}
			report.push({ file: fp, lineNo: s.lineNo, text: s.text, reason: s.reason });
		}

		if (showDiff && diff && diff.length > 0)
		{
			printDiff(fp, diff);
		}
	}
	return { changed, retainedCount, reviewCount, fileReports, fileSkips, report };
}

/**
 * 輸出總覽摘要
 * Print the summary line
 */
function printSummary(count, writeMode, changed, retainedCount, reviewCount, skippedFiles)
{
	const verb = writeMode ? 'Changed' : 'Would change';
	console.log(`\nProcessed ${count} file(s). ${verb} ${changed} file(s).`);
	console.log(`Retained ${retainedCount} line(s) (kept as-is). Skipped ${reviewCount} line(s) for manual review. Skipped files: ${skippedFiles}.`);
}

/**
 * 輸出處理檔案清單（是否修改 + 跳過行數）
 * Print the processed-files report (changed flag + skipped line count)
 */
function printProcessedFiles(fileReports, writeMode)
{
	console.log('\n[Processed files]');
	for (const fr of fileReports)
	{
		const mark = fr.changed ? (writeMode ? '[MODIFIED]' : '[WOULD CHANGE]') : '[UNCHANGED]';
		console.log(`  ${mark}  ${fr.file}  (skipped ${fr.skippedCount})`);
	}
}

/**
 * 輸出整檔被跳過的檔案；大檔案（過大）上限 MAX_REPORT_PER_FILE 筆
 * Print files skipped entirely; large files (too large) capped at MAX_REPORT_PER_FILE
 */
function printFileSkips(fileSkips)
{
	if (fileSkips.length === 0) return;

	console.log('\n[Skipped files (not processed)]');
	const shown = Math.min(fileSkips.length, MAX_REPORT_PER_FILE);
	for (let idx = 0; idx < shown; idx++)
	{
		const f = fileSkips[idx];
		console.log(`  [SKIPPED]  ${f.file}  (${f.reason})`);
	}
	if (fileSkips.length > shown)
	{
		console.log(`  ... and ${fileSkips.length - shown} more file(s) (capped at ${MAX_REPORT_PER_FILE}).`);
	}
}

/**
 * 輸出跳過明細（普通檔案：每個類別最多 MAX_REPORT_PER_FILE 筆）
 * 文字已在存入 skip 紀錄時裁切（clipAroundComment + MAX_REPORT_TEXT）
 *
 * Print skip details for normal files (at most MAX_REPORT_PER_FILE per category).
 * Text was already clipped when the skip record was stored.
 */
function printSkipDetails(report)
{
	if (report.length === 0) return;

	const byFile = new Map();
	for (const r of report)
	{
		if (!byFile.has(r.file)) byFile.set(r.file, []);
		byFile.get(r.file).push(r);
	}

	console.log('\n[Skip details]');
	for (const [file, items] of byFile)
	{
		console.log(`\n  ${file}`);

		const byCat = new Map();
		for (const r of items)
		{
			const cat = reasonCategory(r.reason);
			if (!byCat.has(cat)) byCat.set(cat, []);
			byCat.get(cat).push(r);
		}

		for (const [cat, catItems] of byCat)
		{
			const shown = Math.min(catItems.length, MAX_REPORT_PER_FILE);
			for (let idx = 0; idx < shown; idx++)
			{
				const r = catItems[idx];
				console.log(`    [${cat}] L${r.lineNo}  (${r.reason})`);
				console.log(`        ${r.text}`);
			}
			if (catItems.length > shown)
			{
				console.log(`    ... ${catItems.length - shown} more ${cat} issue(s) (capped at ${MAX_REPORT_PER_FILE} per category).`);
			}
		}
	}
}

/**
 * 主程式進入點：組合各步驟
 * Main entry point: orchestrate the steps
 */
async function main()
{
	/** 輸出目前工作目錄（除錯／診斷用） / Print the current working directory */
	console.log(`\n[CWD] ${process.cwd()}`);

	const { writeMode, showDiff, recursive, maxFiles, targets } = parseArgs(process.argv.slice(2));

	/** 輸出目前的目標路徑（診斷用） / Print the current target paths */
	printTargets(targets);

	/**
	 * 未提供任何目標路徑：顯示用法並結束
	 * No target path: print usage and exit
	 */
	if (targets.length === 0)
	{
		const selfName = path.basename(__filename);

		console.error('\n[ERROR] No target path provided.');
		console.error(`[script] ${__filename}`);

		console.error('');

		console.error(`Usage: node ${selfName} [options] <path> [<path> ...]`);
		console.error('');
		console.error('Options:');
		console.error('  --write           edit files (default: dry-run, no changes are written)');
		console.error('  --diff            show a preview of the changes');
		console.error('  --no-recursive    only scan the given directory itself (no subdirectories)');
		console.error('  --max-files <N>   raise the per-run file count limit (default: 20)');
		console.error('');
		console.error('<path> can be a file (any extension) or a directory of .ts/.tsx files.');
		process.exitCode = 1;
		return;
	}

	const filesToProcess = [];

	/** 因檔名大小寫不符而被跳過的目標檔案 / Target files skipped due to filename case mismatch */
	const caseMismatch = [];

	/** 無法找到或存取的目標路徑 / Target paths that could not be found or accessed */
	const missingTargets = [];

	/** 目錄掃描時因檔名含 `$` 而被拒絕的檔案 / Files rejected during scans because their name contains `$` */
	const walkDollarSkips = [];

	/**
	 * 1. 目標路徑安全檢查：出現任何可疑路徑立即中止
	 * 1. Target path safety check: abort on any suspicious path
	 */
	const unsafeTargets = targets.filter(isUnsafeTarget);
	if (unsafeTargets.length > 0)
	{
		console.error(`\n[WARNING] Unsafe target path(s) detected. Task aborted:`);
		for (const u of unsafeTargets)
		{
			console.error(`  - ${u}`);
		}
		console.error('Forbidden target patterns: `..` (parent traversal path segment), `$` (manual: bare `$`-leading paths or `$` with no filename), `//` or `\\` (double slashes), leading `/` or `\\` (absolute paths), root or drive root.\n');
		process.exitCode = 1;
		return;
	}

	/** 2. 收集所有符合條件的檔案 / Collect all matching files */
	await collectFiles(targets, filesToProcess, caseMismatch, recursive, walkDollarSkips, missingTargets);

	/** 大小寫不符警告 / Case-mismatch warnings */
	await printCaseMismatch(caseMismatch);

	/**
	 * 目錄掃描的 `$` 拒絕警告
	 * Directory-scan `$` rejection warning
	 */
	if (walkDollarSkips.length > 0)
	{
		console.warn(`\n[WARNING] ${walkDollarSkips.length} file(s) skipped from directory scan: filename contains \`$\`.`);
		for (const wd of walkDollarSkips)
		{
			console.warn(`  - ${wd}`);
		}
		console.warn('');
	}

	/** 去重 + 排序 / Deduplicate and sort */
	const uniqueFiles = dedupeFiles(filesToProcess);
	filesToProcess.length = 0;
	filesToProcess.push(...uniqueFiles);

	/**
	 * 提供了路徑但完全沒有收集到檔案：逐項說明原因
	 * Targets given but nothing collected: explain per-target status
	 */
	if (filesToProcess.length === 0)
	{
		console.warn('\n[WARNING] No files were collected from the specified target(s):');
		for (const t of targets)
		{
			const missing = missingTargets.indexOf(t) !== -1;
			const badCase = caseMismatch.indexOf(t) !== -1;
			let status = '  (no matching .ts/.tsx files)';
			if (missing) status = '  (not found or inaccessible)';
			else if (badCase) status = '  (filename case mismatch)';
			console.warn(`  - ${t}${status}`);
		}
		console.warn('\nPossible causes: path missing, no .ts/.tsx files under a directory, filename case mismatch, or all files rejected by safety rules.');
		if (missingTargets.length > 0)
		{
			process.exitCode = 1;
		}
		return;
	}

	/**
	 * 3. 安全檢查：檔案總數過多時警告並終止（可 --max-files 放寬）
	 * 3. Safety check: warn and stop when too many files (relaxable via --max-files)
	 */
	const fileLimit = maxFiles === null ? MAX_FILES : maxFiles;
	if (filesToProcess.length > fileLimit)
	{
		console.error(`\n[WARNING] Found ${filesToProcess.length} file(s) to process, exceeding the safety limit (${fileLimit})!`);
		console.error(`Task aborted for safety. Use --max-files <N> to raise the limit, or specify a more precise subdirectory.`);

		/** 顯示前 5 個檔案 / Show the first 5 files */
		console.error('\nFirst 5 file(s):');
		for (let k = 0; k < Math.min(filesToProcess.length, 5); k++)
		{
			console.error(`  - ${filesToProcess[k]}`);
		}
		console.error('');
		process.exitCode = 1;
		return;
	}

	/**
	 * 4. 開始轉換處理並收集報告資料
	 * 4. Process files and collect report data
	 */
	const { changed, retainedCount, reviewCount, fileReports, fileSkips, report } = await processAll(filesToProcess, writeMode, showDiff);

	printSummary(filesToProcess.length, writeMode, changed, retainedCount, reviewCount, fileSkips.length);
	printProcessedFiles(fileReports, writeMode);
	printFileSkips(fileSkips);

	/**
	 * dry-run 提示：檔案未被修改，需 --write 才套用
	 * Dry-run hint: files were not modified; use --write to apply
	 */
	if (!writeMode)
	{
		console.log('\n(Dry-run: no files were modified. Run again with --write to apply changes.)');
	}

	printSkipDetails(report);
}

main().catch((err) =>
{
	console.error(`\n[ERROR] ${err && err.message ? err.message : err}`);
	process.exitCode = 1;
});