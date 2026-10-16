# Storybook args 持久化設計指南 / Storybook Args Persistence Design Guide

## 概述 / Overview

在 Storybook 的裝飾器或 story `render` 內，同樣是「改一個值」，有兩條**語意完全不同**的路徑：

| 路徑 | 寫入目標 | 重新整理 | 切換故事 | 分享連結 |
|------|---------|---------|---------|---------|
| `updateArgs(...)` | args store **＋網址列 `?args=...`** | ❌ 舊值被套回 | ❌ 舊值被套回 | ✅ 帶著變動 |
| 本地 state ＋ `<Story args={...}>` | 無（僅當次 render） | ✅ 復原 | ✅ 復原 | ❌ 不帶變動 |

選錯路徑的典型症狀是：**「我只不過點了一下，之後怎麼樣都回不去了」**——
切換故事、重新整理，甚至把網址的 `?args=` 手動刪掉重來，變動依然黏著。

這不是 bug。`updateArgs` 的持久化是 Storybook **刻意設計**的「可分享狀態」功能；
問題在於它被用在了**預覽工具**上。本文件說明如何判斷、以及各自該怎麼設計。

---

## 一、機制真相

### 1.1 `updateArgs` 會寫進網址列

```
updateArgs(patch)
  → channel.emit(STORY_ARGS_UPDATED)
  → manager: updateArgsParam()
      → buildArgsParam(initialArgs, args)     ← diff：只有與 initialArgs 不同的欄位
      → navigateTo(..., { args: argsString })  ← 寫進網址列 ?args=...
```

載入時反向套用：

```
iframe.html?id=...&args=...
  → parseArgsParam(query.args)   ← 從網址解析
  → 蓋在 story 的 initialArgs 上
```

**關鍵事實 / Key facts**：

- 序列化的是 **diff**（`buildArgsParam(initialArgs, args)`），不是全量。
  所以「只改了一個欄位」也會持久化——URL 裡只會出現那一個欄位，但效果一樣黏。
- 變動會經 Storybook 的 channel **非同步**送達，`updateArgs` 後立刻讀 args 可能是舊值。
- 網址列的 `?args=` 是「可分享連結」的一部分——它的存在**就是**為了讓別人打开同一個網址時看到同樣的狀態。

### 1.2 `<Story args={...}>` 只影響當次 render

裝飾器收到的 `Story` 元件，其 props 會被合併進 Storybook 的 context store：

```tsx
// Storybook 內部（簡化）
contextStore.value = { ...contextStore.value, ...sanitizeStoryContextUpdate(update) }
```

而這個 store **每次 render 都以新的 context 重置**，且**不回寫 args store、不發 `STORY_ARGS_UPDATED`**。
所以它是一層「渲染期覆寫」，不具持久性。

### 1.3 Hook 來源必須一致

在同一個 render 內同時使用 `useArgs` 與框架 hook（`useState` 等）時，
**框架 hook 必須改用 `storybook/preview-api` 的同名版本**，否則與 Storybook 渲染器的 hook 來源不一致：

```tsx
// ✅ 正確
import { useArgs, useState, useEffect, useRef } from 'storybook/preview-api';

// ❌ 錯誤：與 useArgs 混用 React hook
import React from 'react';
import { useArgs } from 'storybook/preview-api';
React.useState(...);
```

可用的同名 hook：`useState` `useEffect` `useRef` `useMemo` `useCallback` `useReducer`。

> 注意：`storybook/preview-api` 的 `useRef` 只有單一簽章 `useRef<T>(initialValue: T)`，
> **沒有** React 的 `null` overload。要 ref 可空需明確寫型別：
>
> ```tsx
> const el = useRef<HTMLSpanElement | null>(null);   // ✅
> const el = useRef<HTMLSpanElement>(null);          // ❌ TS2345
> ```

---

## 二、決策：要持久化嗎？

### 2.1 三個問題

動手前先回答這三題，答案直接決定路徑：

1. **「使用者期待重新整理後這個變動還在嗎？」**
   期待在 → 持久化。期待不在（或根本沒想過）→ 不持久化。

2. **「這個變動該不該被分享到連結裡？」**
   該（要給人看同一個狀態）→ 持久化。不該（工具操作、暫時探索）→ 不持久化。

3. **「有沒有明確的『還原』出口？」**
   持久化的狀態**必須**配一個還原機制（reset 鈕、Controls 面板的重設、或文件說明）。
   沒有出口的持久化，就是使用者遇到的「永久破壞」。

### 2.2 決策表

| 場景 | 該用 | 理由 |
|------|------|------|
| Controls 面板調整（Storybook 內建） | `updateArgs` | 面板自帶重設鈕；且這是 args 的正規用途 |
| 分享「這個確切狀態」的連結（協作、回報 bug、QA 複現） | `updateArgs` | 這正是 `?args=` 的設計目的 |
| 要求 QA／協作者打開即見同一配置 | `updateArgs` | 持久化就是需求本身 |
| **預覽工具面板**（背景選擇器、輔助工具列） | `<Story args>` | 工具的操作不該污染展示狀態 |
| 探索性調整（調完就走、不打算記住） | `<Story args>` | 使用者心智模型是「暫時」 |
| 任何**預設該復原**的操作 | `<Story args>` | 切走再回來就該是乾淨的 |
| 拖曳／手勢的**中間值** | 本地 state（連 `<Story args>` 都不必） | 見 `interaction-dataflow-best-practices.md` 通道 A |
| 讀值顯示（座標、百分比） | 本地 state ＋ ref 直更 DOM | 讀值不該有寫入副作用 |
| 希望「重置」語意明確的編輯面板 | `updateArgs` ＋ `resetArgs` | 持久化＋顯式還原，配對成立 |

> **一句話判斷**：「這是**工具**還是**狀態**？」
> 工具 → 不持久化。狀態 → 持久化＋配還原出口。

---

## 三、設計一：要持久化

### 3.1 標準做法

```tsx
import { useArgs } from 'storybook/preview-api';

export const makeEditModeDecorator = (): Decorator =>
{
	return (Story) =>
	{
		const [args, updateArgs, resetArgs, initialArgs] = useArgs();
		const config = (args.config ?? {}) as IBattleFieldConfig;

		/** 寫回：明確、單次、可復原 / Write back: explicit, one-shot, reversible */
		const patchConfig = (patch: Partial<IBattleFieldConfig>) =>
		{
			updateArgs({ config: { ...config, ...patch } });
		};

		return (
			<>
				<div>
					<button onClick={() => patchConfig({ bgScale: 'cover' })}>覆蓋</button>
					{/* ✅ 持久化必須配還原出口 / Persistence must ship an exit */}
					<button onClick={() => resetArgs()}>重設</button>
				</div>
				<Story />
			</>
		);
	};
};
```

### 3.2 必做事項

- [ ] **提供重設出口**：`resetArgs()`（全部）或 `resetArgs(['config'])`（指定欄位）。
- [ ] **在文件／面板上寫明**「此面板的變動會寫入網址並在重新整理後保留」。
- [ ] **合併基底用 ref**：`updateArgs` 非同步，閉包直接抓 `args` 會拿到舊值。
      詳見 `interaction-dataflow-best-practices.md` 原則 2。
- [ ] **不在每幀路徑呼叫**：args 管線非同步且每次 rerender 有地板成本。
      詳見 `root-cause-debugging-guide.md` Step 4。

### 3.3 `useArgs` 回傳值

```tsx
const [args, updateArgs, resetArgs, initialArgs] = useArgs();
```

| 位置 | 值 | 用途 |
|------|-----|------|
| 0 | `args` | 目前 args（**可能滯後**，合併時以 ref 為底） |
| 1 | `updateArgs` | 變更（**會持久化到 URL**） |
| 2 | `resetArgs` | 還原（`(argNames?: string[]) => void`） |
| 3 | `initialArgs` | story 定義的初始值（判斷「有沒有被改過」） |

---

## 四、設計二：不要持久化

### 4.1 標準做法

把覆寫放進本地 state，經 `<Story args={...}>` 注入當次 render：

```tsx
import { useArgs, useState } from 'storybook/preview-api';

/** 接受 args 覆寫的 Story 型別（Decorator 簽章的 Story 是 React.FC，需收窄） */
type IStoryWithArgs = React.FC<{ args?: Record<string, unknown> }>;

export const makeBackgroundPickerDecorator = (): Decorator =>
{
	return (Story) =>
	{
		const StoryWithArgs = Story as unknown as IStoryWithArgs;
		/** args 僅供讀取基準值 */
		const [args] = useArgs();
		const baseArgs = (args ?? {}) as Record<string, unknown>;
		const baseConfig = (baseArgs.config ?? {}) as IBattleFieldConfig;

		/** 覆寫只存在於本地 state（remount 即清空）*/
		const [scaleOverride, setScaleOverride] = useState<string | undefined>(undefined);

		/** 合成注入 Story 的 args：基準 + 覆寫 */
		const mergedArgs: Record<string, unknown> = {
			...baseArgs,
			config: { ...baseConfig, bgScale: scaleOverride ?? baseConfig.bgScale },
		};

		return (
			<>
				<div>
					<button onClick={() => setScaleOverride('cover')}>覆蓋</button>
				</div>
				{/* ✅ 純渲染期覆寫，不碰 args store、不進 URL */}
				<StoryWithArgs args={mergedArgs} />
			</>
		);
	};
};
```

### 4.2 設計要點 / Design Points

- **`useArgs` 只解構第 0 個**（`const [args] = useArgs()`）。
  不解構 `updateArgs`——沒有呼叫點，就不會有持久化副作用。
- **`Story` 需收窄型別**：Decorator 簽章把 `Story` 型別標為 `React.FC`（props 為空），
  傳 `args` 前要轉成接受 args 的型別。
- **清除 ≠ 未設定**時，用 `null` 與 `undefined` 區分：

  ```tsx
  const [bgSizeOverride, setBgSizeOverride] = useState<IBattleFieldBgSize | null | undefined>(undefined);
  // undefined = 未覆寫（用基準值）
  // null     = 明確清除
  // {...}    = 指定值
  const current = bgSizeOverride === undefined ? storeBgSize : (bgSizeOverride ?? undefined);
  ```

- **同一個值被兩種元件讀時，兩處都要寫**：
  When one value is read by two components, write both places:

  ```tsx
  // BattleFieldLayers 讀 prop、BattleFieldScene 讀 config.bgSize
  const mergedArgs = {
      ...baseArgs,
      bgSize: currentBgSize,                        // prop
      config: { ...baseConfig, bgSize: currentBgSize },  // config
  };
  ```

- **草稿輸入框要跟著生效值同步**（用 ref 比對避免無謂 setState）：

  ```tsx
  const effectiveRef = useRef(currentBgSize);
  const [draft, setDraft] = useState(() => toDraft(currentBgSize));
  useEffect(() =>
  {
      if (effectiveRef.current === currentBgSize) return;
      effectiveRef.current = currentBgSize;
      setDraft(toDraft(currentBgSize));
  }, [currentBgSize]);
  ```

### 4.3 為什麼這樣就夠了

`<Story args={...}>` 的覆寫走 Storybook 的 context store，該 store：

1. **每次 render 重置** → 切故事、重新整理天然復原。
2. **不回寫 args store** → 不觸發 `STORY_ARGS_UPDATED`，URL 保持乾淨。
3. **仍在 Storybook hook context 內** → 裝飾器的 `useState` 變更會正常觸發重繪。

---

## 五、絕對不該用 `updateArgs` 的狀況

| 狀況 | 為什麼 | 正確做法 |
|------|--------|---------|
| **預覽／輔助工具面板** | 使用者心智模型是「暫時」，持久化等於破壞 | 本地 state ＋ `<Story args>` |
| **每幀／每事件呼叫** | 非同步管線 + 每次 rerender 地板成本 → 卡頓 | 本地 state；收尾才單次寫（若需持久化） |
| **拖曳中回報座標** | 滯後中間值回流成回聲 → 放開後框繼續動 | 通道 A（內部 state）＋ B（live store）；C 只在 pointerup |
| **純讀值顯示** | 讀值不該有寫入副作用 | `ref` 直更 DOM，或訂閱輕量 store |
| **希望「重新整理＝復原」的操作** | `updateArgs` 就是為「重新整理＝保留」設計的 | 本地 state |
| **尚未決定要不要持久化時** | 事後把 `updateArgs` 換掉容易漏（每個呼叫點都要改） | 先用本地 state，確定要持久化再換 |
| **裝飾器層級的全域預覽值** | meta 層裝飾器套用到所有故事，污染範圍最大 | 本地 state；或改用 globals（另有其持久化語意） |

> **補充**：`updateArgs` 的**非同步滯後**本身就是另一類 bug 的來源。
> 即使你確定要持久化，也**不要**在即時路徑上呼叫它。

---

## 六、反模式清單

| 反模式 | 症狀 | 修正 |
|--------|------|------|
| 預覽工具呼叫 `updateArgs` | 切走再回來、重新整理都回不去 | 本地 state ＋ `<Story args>` |
| 持久化面板沒有重設出口 | 使用者被困在改過的狀態 | 加 `resetArgs()` 鈕或文件說明 |
| 在同一 render 混用 React hook 與 `useArgs` | hook 來源不一致，行為不可預期 | 改用 `storybook/preview-api` 的同名 hook |
| `useRef<HTMLSpanElement>(null)` | TS2345（preview-api 無 null overload） | `useRef<HTMLSpanElement \| null>(null)` |
| 閉包直接抓 `args` 當合併基底 | 管線滯後 → 合併到舊值 → 跨物件回歸 | `latestRef.current` 每次 render 刷新 |
| 假設 `updateArgs` 後立刻能讀到新值 | 讀到舊值 | 以 `args` 為唯讀基準；覆寫走本地 state |
| 傳空物件給 `<Story args>` 想「只覆寫一個欄位」 | 其餘 args 全部消失 | `{ ...baseArgs, 你要的欄位 }` |
| 用 `updateArgs` 做「預覽嘗試」 | URL 被污染，難以分享乾淨連結 | 本地 state；確定要才轉持久化 |

---

## 七、設計時檢查清單

動工前逐項確認：

- [ ] 我要改的這個值，**重新整理後該不該還在**？（答案決定路徑）
- [ ] 它是**工具**還是**狀態**？工具→不持久化；狀態→持久化＋還原出口。
- [ ] 若持久化：有 `resetArgs()` 出口，且文件寫明會保留。
- [ ] 若不持久化：**沒有任何** `updateArgs` 呼叫點（只解構 `const [args] = useArgs()`）。
- [ ] 同一 render 內的 hook 全部來自 `storybook/preview-api`。
- [ ] 合併 args 用 `{ ...baseArgs, ... }`，不傳空物件。
- [ ] 「清除」與「未設定」有明確區分（`null` vs `undefined`）。
- [ ] 草稿輸入框有跟著生效值同步（ref 比對，避免無謂 setState）。
- [ ] 已用 Playwright 驗證三場景：**點擊生效**、**重新整理復原／保留**（依需求）、**切故事復原／保留**（依需求）。

### 驗證腳本參考

```bash
# 啟動 Storybook 後，以 Playwright 逐場景驗證 / After starting Storybook, verify each scenario with Playwright
# 1. 點擊 → 讀 computed style 應改變，且 location.href 無 ?args=
# 2. 重新整理 → computed style 應復原（不持久化）或保留（持久化）
# 3. 導覽到別的故事再回來 → 同上
```

---

## 相關文件

- `docs/interaction-dataflow-best-practices.md` — 頻率分層三通道；`updateArgs` 屬通道 C（收尾單次）。
- `docs/root-cause-debugging-guide.md` — 靜態讀 `updateArgs` 管線成本的方法。
- `stories/battle/backgroundPicker.tsx` — 設計二（不持久化）的實作範例。
- `stories/battle/editModePanel.tsx` — 設計一（持久化＋自訂重設出口）的實作範例：
  用 `updateArgs` 寫回，「重置」以遞增 `resetToken` ＋ 顯式還原 `frameOffsets` 作為還原出口
  （元件端在 `resetToken` 變動時清掉內部拖曳狀態）。

---

> **總結**：`updateArgs` 不是「改變量」的同義詞，它是「**把變動寫進可分享連結**」。
> 先問「重新整理後該不該還在」，答案決定走 args store 還是本地 state。
> 工具不污染展示狀態，狀態必須有出路——這兩句記住，就不會再遇到「永久破壞」。
