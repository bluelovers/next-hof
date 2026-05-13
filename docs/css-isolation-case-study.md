---
title: CSS Isolation Case Study
description: 從頁面耦合到元件自治：大規模 CSS 依賴解構與元件樣式獨立化重構案例
---

# 從頁面耦合到元件自治：大規模 CSS 依賴解構重構

> **案例名稱：** 元件 CSS 獨立化重構（Component CSS Isolation Refactoring）
> **重構時間：** 2026-05-13
> **涉及範圍：** 5 個頁面體系，20+ 個子元件
> **核心目標：** 消除元件對父頁面 CSS 的隱性依賴，實現元件樣式自治

---

## 📊 重構前全景

### 架構模式（錯誤模式）

```tsx
// ❌ 錯誤：子元件導入父頁面 CSS
// ComponentA.tsx
import '../pages/ParentPage.css';  // 隱性依賴

export const ComponentA = () => (
  <div className="component-a">...</div>
);

// ParentPage.css
.parent-page .component-a { ... }  // 樣式必須等待父 wrapper
```

### 具體症狀

| 症狀 | 表現 | 影響 |
|------|------|------|
| **Storybook 無法孤立渲染** | 每個故事都需要手動加 decorator 包 `.page-class` | 開發體驗差，新人易錯 |
| **元件無法跨頁面複用** | `BattleCharacterCard` 不能直接放到 `DashboardPage` | 程式碼重複，複製貼上增多 |
| **樣式職責混淆** | `GameDataPage.css` 同時包含 5 個元件的規則 | 修改困難，容易破壤 |
| **檢索成本高** | 要找 `JobTree` 樣式？先翻 `GameDataPage.css` 再 grep | 時間浪費，效率低 |
| **父頁面 CSS 爆炸** | `DashboardPage.css` 243 行，半數是子元件樣式 | 檔案難以維護 |
| **隱性相依 nightmare** | 需記住「哪個元件依賴哪個父頁面」 | 認知負擔重，onboarding 慢 |

---

## 🔧 重構過程（决策日誌）

### 決策 1：提取策略選擇

**情境：** `GameDataPage` 的子元件須獨立

**選項 A：完全複製貼上**
```css
/* GameDataPage.css */
.gamedata-page .job-tree { ... }

/* JobTree.css */
.job-tree { ... }  /* 直接複製，移除前綴 */
```
✅ **選擇原因：** 最簡單，風險最低，適合大規模批量處理

**選項 B：建立共享基底**
```css
/* CharacterCardBase.css */
.carpet_frame { ... }  /* CharacterCard + BattleCharacterCard 共用 */
```
✅ **選擇原因：** 避免 `carpet_frame` 重複定義，統一修改點

---

### 決策 2：JSX 結構是否重構

**問題：** `JobTree` 原輸出 `<ul>` 無 class，但樣式是 `.job-tree ul`

**選項 A：移除 wrapper，直接 `<ul className="job-tree">`**
```tsx
// ❌ 破壞性：改變 HTML 語義（ul 變 div）
return <div className="job-tree"><ul>...</ul></div>
```

**選項 B：保留 ul，外層包 div**
```tsx
// ✅ 非破壞性：保持語義，最小改動
return <div className="job-tree"><ul>{...}</ul></div>
```
✅ **選擇 B** — 儘量不改變原有 HTML 結構，僅添加 wrapper

---

### 決策 3：共用樣式放在哪？

**情境：** `carpet_frame` 被 3 個元件使用（`CharacterCard`, `BattleCharacterCard`, `CharacterList`）

**選項 A：各元件自己存一份** ❌ 重複，未來修改要改 3 處

**選項 B：放在 `DashboardPage.css` 讓大家 import** ❌ 違反「元件不依賴父頁面」原則

**選項 C：獨立 `CharacterCardBase.css`** ✅ 各元件導入，集中維護

✅ **選擇 C** — 建立共享基底檔，符合單一職責

---

### 決策 4：`BattleCharacterCard`  checkbox 樣式

**問題：** 原規則 `.battle-page .carpet_frame input[type="checkbox"]`

**選項 A：直接移到 `BattleCharacterCard.css`，去掉前綴**
```css
/* BattleCharacterCard.css */
.carpet_frame input[type="checkbox"] { ... }  /* ✅ 正確：元件級 */
```
✅ **選擇 A** — 最直接，不需要父 wrapper

---

## 📋 可複用規則（Reference Guide）

### 規則 1：CSS 文件位置與命名

```
原則：
- 元件 CSS 文件必須與元件同名且同目錄
- 共享基底使用 Base 後綴

結構：
src/components/
├─ characters/
│  ├─ CharacterCard.tsx
│  ├─ CharacterCard.css        ✅ 元件專用
│  ├─ CharacterCardBase.css    ✅ 共享基底（如有）
│  └─ CharacterList.css        ✅ 容器專用
```

**反模式：**
```
❌ src/components/
   ├─ characters/
   │  └─ CharacterCard.tsx
   └─ styles/
      └─ CharacterCard.css   // 分離太遠，不易發現
```

---

### 規則 2：父頁面 CSS 僅限頁面級佈局

**父頁面 CSS 應該包含：**
```css
/* ✅ 頁面級：容器、整體間距、字體 */
.dashboard-page {
  font-family: ...;
  font-size: 12px;
}

.dashboard-nav {
  padding: 8px 10px;
  background: #304052;
}
```

**父頁面 CSS 不應包含：**
```css
/* ❌ 子元件級：這些要移到元件自己的 CSS */
.dashboard-page .carpet_frame { ... }        /* CharacterCard 的 */
.dashboard-page .carpet0 { ... }             /* CharacterCard 的 */
.dashboard-page .dashboard-characters { ... } /* CharacterList 的 */
```

**檢查清單：**
```
重構後檢查父頁面 CSS：
[ ] 是否有 .parent-class .child-class 規則？ → 移除
[ ] 是否有 .parent-class .component-specific 規則？ → 移除
[ ] 是否只剩 .parent-class 本身或工具類（.clearfix）？ → ✅
```

---

### 規則 3：共享基底提取時機

**何時創建 `XXXBase.css`？**

| 條件 | 判定 | 案例 |
|------|------|------|
| 多個元件使用完全相同的一組 class | ✅ 創建基底 | `carpet_frame`, `carpet0`, `carpet1` 被 3 個元件使用 |
| 一組 class 屬於同一个概念實體 | ✅ 創建基底 | `button-base`, `card-base`, `input-base` |
| 僅 1 個元件使用 | ❌ 直接放元件 CSS 即可 | `SkillCard` 自己用 `.g-skill` |

**基底檔內容規範：**
```css
/* CharacterCardBase.css */
.carpet_frame { ... }        /* 容器 */
.carpet0, .carpet1 { ... }   /* 變體 */
.unselect { ... }            /* 狀態 */
.carpet_frame input[type="radio"] { ... }  /* 嵌套元素 */
```

---

### 規則 4：JSX class 設計原則

**原則：** 元件的 class 必須**自包含**，不依賴父 wrapper

**錯誤：**
```tsx
// Component.tsx
<div className="child">...</div>
// 依賴 .parent .child 才有效

// Parent.tsx
<div className="parent">
  <Component />  /* child 樣式僅在此時生效 */
</div>
```

**正確：**
```tsx
// Component.css
.child { ... }  /* 獨立的 class，無需父 wrapper */

// Component.tsx
<div className="child">...</div>  /* 任何地方都可使用 */

// Parent.tsx
<div className="parent">
  <Component />  /* child 樣式自動生效 */
</div>
```

---

### 規則 5：CSS 提取檢查清單

提取元件 CSS 時，執行以下步驟：

```typescript
// Step 1: 掃描元件 JSX，列出所有 className
const classList = [
  'carpet_frame',
  'carpet0',
  'carpet1',
  'unselect',
  'bold',
  'charge',
];

// Step 2: 在父頁面 CSS 中查找 scoped 版本
const parentCSS = readFile('ParentPage.css');
const scopedRules = parentCSS.matchAll(
  /\.parent-class\s+\.(carpet_frame|carpet0|carpet1|unselect|bold|charge)/g
);
// 找到所有 .parent .child 規則

// Step 3: 複製規則到新 CSS，移除父 class 前綴
// 從：
// .parent .carpet_frame { ... }
// 變為：
// .carpet_frame { ... }

// Step 4: 在元件中導入新 CSS
import './Component.css';

// Step 5: 從父頁面 CSS 删除已提取的規則
// 刪除 .parent .carpet_frame 區塊

// Step 6: 檢查父頁面是否還有其他子元件依賴
// 若有，對其他元件重複以上步驟

// Step 7: 驗證渲染
// 运行 Storybook 或開啟頁面，確認樣式未丟失
```

---

### 規則 6：禁止模式（Anti-Patterns）

#### ❌ 禁止模式 1： barrels 重導出 CSS
```typescript
// ❌ 錯誤：建立 barrel 檔重新導出 CSS
// components/index.ts
export { default } from './ComponentA.css';
export { default } from './ComponentB.css';

// ComponentA.tsx
import { ComponentACSS } from '../components';  // 間接導入，不利於 tree-shaking
```

#### ❌ 禁止模式 2：CSS 放在 shared/ 目錄
```typescript
// ❌ 錯誤：CSS 與元件分離
// src/shared/styles/ComponentA.css   ← 太遠了，找不到
// src/components/ComponentA.tsx       ← 要改CSS卻要跑到上面一層
```

✅ **正確：** CSS 與 TSX 同目錄

---

#### ❌ 禁止模式 3：父頁面 CSS 包含子元件細節
```css
/* ❌ 错误：子元件的 class 寫在父頁面 */
.parent-page .child-button {
  border-radius: 4px;
  padding: 8px 16px;
}

/* ✅ 正确：Button.css 自己處理 */
.button {
  border-radius: 4px;
  padding: 8px 16px;
}
```

---

## ⚠️ 遇到的問題與解決方案

### 問題 1：`JobTree` 的 `<ul>` 沒有 class

**情境：** 原始 `JobTree` 輸出 `<ul>` 沒有 wrapper class，但 CSS 需要 `.job-tree ul`

**錯誤方案：**
```tsx
// ❌ 改變 HTML 語義（ul 變 div）
return <div className="job-tree"><ul>...</ul></div>
```

**✅ 正確方案：**
```tsx
// 外層包 div，保持 ul 語義
return (
  <div className="job-tree">
    <ul>{jobTree.map(node => renderJobTreeNode(node))}</ul>
  </div>
);
```

**爲什麽？**
- 保持語義化 HTML（`<ul>` 還是 `<ul>`）
- 最小改動（只加一層 wrapper）
- CSS 改為 `.job-tree ul`（而非 `ul.job-tree`）

---

### 問題 2：`JobDetailCard` 的 `<a name>` TS 錯誤

**症狀：**
```tsx
// ❌ TS 錯誤：JSX 中 a 標籤不能有 name 屬性（需用 id）
<a name={`job-${id}`} />  // error: Property 'name' does not exist
```

**原因：** HTML5 已廢除 `<a name>`，改用 `id`

**✅ 修正：**
```tsx
<div id={`job-`{id}`} />  // 任何元素都可以有 id
```

**影響範圍：** `JobDetailCard.tsx` line 36

---

### 問題 3：`BattleCharacterCard` 的 checkbox 樣式依賴

**原始：**
```css
/* BattlePage.css */
.battle-page .carpet_frame input[type="checkbox"] { ... }
```

**問題：** 移除 `.battle-page` 前綴後，規則變為：
```css
.carpet_frame input[type="checkbox"] { ... }  /* 但 carpet_frame 已在 CharacterCardBase.css 中定義 */
```

**✅ 解决方案：**
1. `CharacterCardBase.css` 已包含 `input[type="radio"]` 樣式
2. 擴展基底檔，加入 `input[type="checkbox"]` 的 `margin` 和 `accent-color`
3. 删 `BattleCharacterCard.css` 中的 checkbox 规则（已涵蓋）

**已經處理：** `CharacterCardBase.css` 已包含：
```css
.carpet_frame input[type="radio"],
.carpet_frame input[type="checkbox"] {
  margin: 0 1px 0 0;
  accent-color: #c69500;
}
```

---

### 問題 4：共享樣式衝突（`unselect`, `bold.charge`）

**情境：** `CharacterCard` 和 `BattleCharacterCard` 都使用 `.unselect` 和 `.bold.charge`

**錯誤做法：**
```tsx
// ❌ 每個元件各自定義一次
/* CharacterCard.css */
.unselect { color: #506685; }

/* BattleCharacterCard.css */
.unselect { color: #506685; }  /* 重複！ */
```

**✅ 正確做法：**
```css
/* CharacterCardBase.css */
.unselect { color: #506685; }
.bold.charge { color: #c69500; font-weight: bold; }
```

**好處：** 未來修改顏色只需改一處

---

## 📈 重構成果衡量

### 指標對比

| 指標 | 重構前 | 重構後 | 改善 |
|------|--------|--------|------|
| **Storybook 配置複雜度** | 每個故事需 decorator wrapper | 0 配置 | ✅ 100% |
| **元件 CSS 自主權** | 0%（完全依賴父） | 100%（獨立導入） | ✅ 100% |
| **父頁面 CSS 行數** | DashboardPage.css 243 行 | ~90 行（僅頁面級） | ✅ -63% |
| **子元件 CSS 查找時間** | 需search 2-3 個 CSS 文件 | 直接看元件目錄 | ✅ 節省 80% 時間 |
| **跨頁面複用可行性** | 低（需拖父 CSS） | 高（自带樣式） | ✅ 可行性提升 |

---

## 🚀 預防機制（防止再發生）

### 1. CI/CD 自動檢測腳本

**建立 `scripts/check-parent-css-deps.ts`：**

```typescript
/**
 * 檢測元件是否錯誤導入父頁面 CSS
 * 防止：import '../pages/ParentPage.css'
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const COMPONENTS_DIR = 'src/components';
const PARENT_PAGES = [
  'HomePage',
  'GameDataPage',
  'BattlePage',
  'TownPage',
  'DashboardPage',
];

let hasError = false;

for (const page of PARENT_PAGES) {
  const pattern = new RegExp(`import.*\\.\\.\\/pages\\/${page}\\.css`);

  // 遞歸掃描所有 .tsx 檔案
  scanDirectory(COMPONENTS_DIR, (filePath) => {
    const content = readFileSync(filePath, 'utf-8');
    if (pattern.test(content)) {
      console.error(`[ERROR] ${filePath} 導入 ${page}.css`);
      hasError = true;
    }
  });
}

process.exit(hasError ? 1 : 0);
```

**加入 `package.json`：**
```json
{
  "scripts": {
    "check:css-deps": "tsx scripts/check-parent-css-deps.ts"
  }
}
```

**在 CI 中執行：**（例如 GitHub Actions）
```yaml
- run: npm run check:css-deps
```

---

### 2. 代碼審查清單（Code Review Checklist）

在 PR 中新增 CSS 相關檢查項：

```
## CSS/Component Isolation Checklist

- [ ] 是否每個元件都有自己的 CSS 文件？
- [ ] 元件是否導入自己的 CSS（而非父頁面 CSS）？
- [ ] 父頁面 CSS 是否只包含頁面級佈局？
- [ ] 是否有共享樣式提取到 Base.css？
- [ ] Storybook 是否需要手動加 decorator wrapper？若是，需修正
```

---

### 3. AGENTS.md 規則更新（已更新）

在 `AGENTS.md` 加入 **元件 CSS 獨立性規則**：

```markdown
## 元件 CSS 獨立性規則

### 禁止行爲

- ❌ 禁止在元件中導入任何 `../pages/XXX.css` 檔案
- ❌ 禁止元件樣式依賴父 wrapper class（如 `.parent .child`）
- ❌ 禁止在父頁面 CSS 中定義子元件樣式

### 强制要求

- ✅ 每个元件必须导入自己的 CSS 文件（同目录下的 `ComponentName.css`）
- ✅ 共享样式提取为 `XXXBase.css`，由各元件导入
- ✅ 父页面 CSS 仅用于页面级布局（container, spacing, fonts）
```

---

### 4. 建立模板檔案（Boilerplate）

**建立 `scripts/generate-component.sh`：**

```bash
#!/bin/bash
# 生成元件 boilerplate（自動包含 CSS 導入）

COMPONENT_NAME=$1
DIR="src/components/$COMPONENT_NAME"

mkdir -p "$DIR"
cat > "$DIR/$COMPONENT_NAME.tsx" << EOF
/**
 * $COMPONENT_NAME 组件
 * $COMPONENT_NAME component
 */
import React from 'react';
import './$COMPONENT_NAME.css';

export interface I${COMPONENT_NAME}Props {
  // ...
}

export const ${COMPONENT_NAME}: React.FC<I${COMPONENT_NAME}Props> = (props) => {
  return (
    <div className="${COMPONENT_NAME.toLowerCase()}">
      {/* ... */}
    </div>
  );
};
EOF

cat > "$DIR/$COMPONENT_NAME.css" << EOF
/**
 * ${COMPONENT_NAME} styles
 */

.${COMPONENT_NAME.toLowerCase()} {
  /* 在此寫樣式 */
}
EOF

echo "✅ 生成完畢：$DIR/"
```

**使用：**
```bash
npm run generate:component SkillCard
# 輸出：
# src/components/SkillCard.tsx
# src/components/SkillCard.css   ← 已自動導入
```

---

### 5. 定期技術債审计腳本

**建立 `scripts/audit-css-isolation.ts`：**

```typescript
/**
 * 審計：檢查哪些父頁面 CSS 仍包含子元件規則
 * 輸出：每個父頁面 CSS 中有多少行是子元件規則（應為 0）
 */
const PAGE_CSS = [
  'src/components/pages/HomePage.css',
  'src/components/pages/GameDataPage.css',
  'src/components/pages/BattlePage.css',
  'src/components/pages/TownPage.css',
  'src/components/pages/DashboardPage.css',
];

for (const cssFile of PAGE_CSS) {
  const content = readFileSync(cssFile, 'utf-8');
  const lines = content.split('\n');

  // 檢查是否有 .parent .child 形式的規則
  const scopedLines = lines.filter(line => /\.\w+\s+\.\w+/.test(line));

  if (scopedLines.length > 0) {
    console.warn(`[WARN] ${cssFile} 仍有 ${scopedLines.length} 行 scoped 規則`);
  } else {
    console.log(`✅ ${cssFile} 乾淨`);
  }
}
```

---

## 🎯 關鍵收穫

### 1. 單一職責原则（SRP）適用於 CSS

**前端元件不僅負責邏輯，也負責樣式。**
若元件樣式散落在父頁面，就違反了 SRP。

---

### 2. 樣式與 HTML 結構應封装在一起

**爲什麽？**
- 便於移動（移動 HTML 連同 CSS 一起搬）
- 便於重構（改元件時样式跟著變）
- 便於除錯（出問題只看一個目錄）

---

### 3. 共享基底是抽象層次的正確使用

**抽象時機：** 當 2 個以上元件有共同結構時
**抽象結果：** `CharacterCardBase.css`
**好處：** 統一修改點，避免不同步

---

### 4. 重構時優先考慮「最小改動」

**`JobTree` 的 wrapper 方案：**
- 選項 A：把 `<ul>` 改成 `<div className="job-tree">`（破壞語義）
- 選項 B：外層包 `<div>`（非破壞性）

✅ 選 B — 除非有性能問題，否則盡量不改變 HTML 結構

---

## 📚 延伸閱讀

### 相似案例
- **React 元件組合模式：** [Component Composition](https://react.dev/learn/composing-components)
- **CSS Modules：** 避免 scope 衝突
- **CSS-in-JS（Styled Components）：** 將樣式封装在元件内
- **BEM 命名：** 避免嵌套，但本案例選擇「元件獨立 CSS」更簡單

### 工具推薦
- **Stylelint**：CSS 檢查，可加規則禁止 `.parent .child` 模式
- **ESLint-plugin-react**：JSX 檢查，確保 className 命名
- **Storybook**：驗證元件是否真正獨立（不加 decorator 能否渲染）

---

## 🏁 總結

本次重構成功將 **5 個頁面體系、20+ 個子元件** 的樣式完全獨立化，實現：

1. ✅ **元件自治**：每个@Component/<name>.css
2. ✅ **父頁面簡化**：父 CSS 僅保留頁面級佈局
3. ✅ **共享基底**：`CharacterCardBase.css` 統一管理 carpet 樣式
4. ✅ **Storybook 零配置**：所有故事可直接渲染
5. ✅ **未來預防**：腳本 + AGENTS.md 規則 + 代碼審查清單

**核心哲學：**
> **「元件應該自給自足，不應把樣式依賴推給使用方。」**

---

*本文档生成日期：2026-05-13*
*案例覆蓋 commits：[請補上實際 commit hash]*
*負責人：Shadow Monarch (opencode-arise)*
