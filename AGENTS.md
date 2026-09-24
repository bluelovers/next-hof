# Agent 開發規則 / Agent Development Rules

## 路徑載入規則 / Import Path Rules

### 禁止 Barrel Export 模式

**禁止建立 barrel index.ts 檔案**（例如 `src/components/GameDataPage/index.ts`）來重新導出同一目錄下的多個元件。

**Don't create barrel index.ts files** (e.g., `src/components/GameDataPage/index.ts`) that re-export multiple components from the same directory.

### 強制直接路徑載入

所有元件在使用時必須**直接從原始路徑載入**，不可透過 barrel index.ts 間接載入。

**Always import components directly from their source path.** Never import through barrel index.ts.

```typescript
// ✅ 正確 / Correct: 直接從原始路徑載入
import { JobTree } from '#/components/GameDataPage/JobTree';
import { SkillCard } from '#/components/GameDataPage/SkillCard';

// ❌ 錯誤 / Wrong: 透過 barrel index.ts
import { JobTree } from '#/components/GameDataPage';
import { SkillCard } from '#/components/GameDataPage';
```

### 使用 `#/` 根路徑別名取代相對路徑

**禁止使用 `../` 多層相對路徑**，改使用 `#/` 作為專案根目錄別名。

**Don't use `../` relative paths.** Always use `#/` as the project root alias.

```typescript
// ✅ 正確 / Correct: 使用 #/ 根路徑別名
import { LoginForm } from '#/components/auth/LoginForm';
import { GameLayout } from '#/components/pages/GameLayout';
import type { IJobData } from '#/components/game-data/GameDataTypes';

// ❌ 錯誤 / Wrong: 多層相對路徑（難以維護、搬家易壞）
import { LoginForm } from '../auth/LoginForm';
import { IJobData } from '../../game-data/GameDataTypes';
```

**設定方式 / Configuration:** 詳見 `docs/import-alias-guide.md`

### 檔案路徑對照表 / Component Path Reference

| 組件 | 原始路徑 |
|------|---------|
| GameLayout | `src/components/GameLayout/GameLayout` |
| HomePage | `src/components/HomePage/HomePage` |
| LoginForm | `src/components/HomePage/atoms/LoginForm` |
| RankingTable | `src/components/HomePage/atoms/RankingTable` |
| GameDescription | `src/components/HomePage/atoms/GameDescription` |
| InfoSection | `src/components/HomePage/atoms/InfoSection` |
| DashboardPage | `src/components/DashboardPage/DashboardPage` |
| NavigationBar | `src/components/DashboardPage/atoms/NavigationBar` |
| TeamStatus | `src/components/DashboardPage/atoms/TeamStatus` |
| CharacterCard | `src/components/DashboardPage/atoms/CharacterCard` |
| CharacterList | `src/components/DashboardPage/atoms/CharacterList` |
| HuntPage | `src/components/HuntPage/HuntPage` |
| HuntAreaLink | `src/components/HuntPage/atoms/HuntAreaLink` |
| HuntSubNav | `src/components/HuntPage/atoms/HuntSubNav` |
| TownPage | `src/components/TownPage/TownPage` |
| TownFacility | `src/components/TownPage/atoms/TownFacility` |
| FacilityGroup | `src/components/TownPage/atoms/FacilityGroup` |
| MessageBoard | `src/components/TownPage/atoms/MessageBoard` |
| GameDataPage | `src/components/GameDataPage/GameDataPage` |
| SkillCard | `src/components/GameDataPage/SkillCard` |
| JobDetailCard | `src/components/GameDataPage/JobDetailCard` |
| GDSubNav | `src/components/GameDataPage/GDSubNav` |
| JobTree | `src/components/GameDataPage/JobTree` |
| JobDetailTable | `src/components/GameDataPage/JobDetailTable` |
| CharacterSpriteDisplay | `src/components/GameDataPage/CharacterSpriteDisplay` |
| BattleDisplay | `src/components/pages/BattleDisplay` |
| BattleTeamInfo | `src/components/battle/BattleTeamInfo` |
| BattleUnit | `src/components/battle/BattleUnit` |
| BattleAction | `src/components/battle/BattleAction` |
| BattleLog | `src/components/battle/BattleLog` |
| BattleFieldScene | `src/components/battle/BattleFieldScene` |
| BattleFieldMagicCircle | `src/components/battle/BattleFieldMagicCircle` |
| BattleResult | `src/components/battle/BattleResult` |
| GameDataTypes | `src/components/GameDataPage/GameDataTypes` |
| BattleDisplay/types | `src/components/battle/types` |

---

## 指令執行限制

請參閱 `agent-operation-restrictions` 技能

---

## 測試執行 / Test Execution

**一次執行 `pnpm run test` 即可，不需分兩次執行。**
**Run a single command `pnpm run test`; no need to run the two checks separately.**

`pnpm run test` 依序執行 / `pnpm run test` runs, in order:

1. `pretest` → `test:tsc` — TypeScript 型別檢查（`tsc --noEmit`）/ TypeScript type check
2. `test` → `test:vitest:unit` — 單元測試（`vitest run --project unit`）/ unit tests

```bash
pnpm run test   # 型別檢查 + 單元測試 / type check + unit tests
```

> **注意 / Note：** `test:tsc` 採**非阻斷式設計**（`&` 分隔符，刻意為之）：型別錯誤會印出
> `error TS` 訊息，但**不中止**後續的 `test:vitest:unit`，整體 exit code 亦可能為 0。
> 驗證時除 exit code 外，須一併檢查輸出中是否出現 `error TS`。
>
> `test:tsc` is intentionally non-blocking (`&` separator): type errors print `error TS`
> but do **not** stop `test:vitest:unit`, and the overall exit code may still be 0.
> When verifying, also scan the output for `error TS` instead of relying on exit code alone.

- [ ] 修改程式碼後執行 `pnpm run test` 即完成完整驗證
- [ ] After code changes, run `pnpm run test` once for full verification

---

## 元件製作檢查清單 / Component Creation Checklist

製作或修改元件時，必須仔細檢查以下項目：

### CSS 檢查 / CSS Checks

- [ ] 所有 CSS class 名稱是否與元件邏輯一致
- [ ] 是否存在硬編碼的 localhost URL（如 `http://127.0.0.1:8085/...`）
- [ ] 顏色值是否使用專案一致的主題色
- [ ] 字型設定是否與專案一致（メイリオ / Meiryo / MS PGothic）

### 背景設定檢查 / Background Checks

- [ ] `background-image` 的 URL 是否正確（非 localhost、使用正確的資源路徑）
- [ ] `background` 簡寫屬性是否覆蓋了不該覆蓋的設定
- [ ] 背景色／背景圖是否真的有實際顯示效果
- [ ] 背景重複 (`background-repeat`) 與定位 (`background-position`) 是否正確

### 圖片設定檢查 / Image Checks

- [ ] `<img>` 與 `background-image` 的 URL 是否有效
- [ ] 圖片尺寸 (`width`/`height`) 是否明確定義
- [ ] 精靈（sprite）圖片是否確實有設定 `background-image` 屬性（而非只有 key）
- [ ] 圖片缺少時是否有佔位符號或 fallback 樣式
- [ ] `object-fit` / `background-size` 是否恰當

### 型別檢查 / Type Checks

- [ ] 所有 props 是否有明確的 interface 定義
- [ ] interface 是否以 `I` 開頭（如 `IJobData`）
- [ ] enum 是否以 `Enum` 開頭（如 `EnumResultType`）

---

## 已知問題 / Known Issues

### ~DashboardPage.css — 硬編碼 localhost URL~（✅ 已修正）

`src/components/DashboardPage/DashboardPage.css` 第 126 與 142 行的 carpet localhost URL 已改為相對路徑 `/image/carpet0*.png`。

### ~JobDetailCard.tsx — spriteUrls 未實際渲染~（✅ 已修正）

`src/components/GameDataPage/JobDetailCard.tsx` 的 sprite span 已補上 `backgroundImage` 樣式。

---

## 元件 CSS 獨立性規則 / Component CSS Independence Rules

### 禁止行爲 / Prohibited Practices

**以下模式一律禁止：**

- ❌ **禁止導入父頁面 CSS**
  元件中不得導入任何 `../pages/XXX.css` 檔案
  Components must not import any `../pages/XXX.css` file

  ```typescript
  // ❌ 錯誤
  import '../pages/GameDataPage.css';

  // ✅ 正確
  import './ComponentName.css';
  ```

- ❌ **禁止樣式依賴父 wrapper class**
  元件樣式不得寫成 `.parent .child` 形式，必須自包含
  Component styles must not depend on parent wrapper class

  ```css
  /* ❌ 錯誤：依賴父頁面 class */
  .gamedata-page .job-tree { ... }

  /* ✅ 正確：元件自包含 */
  .job-tree { ... }
  ```

- ❌ **禁止在父頁面 CSS 中定義子元件樣式**
  父頁面 CSS 僅限頁面級佈局，不得包含子元件專用規則
  Parent page CSS must only contain page-level layout, never child-component styles

  ```css
  /* ❌ 錯誤：子元件規則寫在父頁面 */
  .dashboard-page .carpet_frame { ... }  /* CharacterCard 的樣式 */

  /* ✅ 正確：移到 CharacterCard.css */
  .carpet_frame { ... }
  ```

### 强制要求 / Mandatory Requirements

**所有元件必須遵守：**

1. **自有 CSS 文件**
   每個元件必須在相同目錄下擁有對應的 CSS 文件，並在元件中導入
   Every component must have a same-directory CSS file and import it

2. **父頁面 CSS 僅供頁面級使用**
   父頁面 CSS 只能包含頁面容器、整體字體、區域 padding/margin 等佈局規則
   Parent page CSS is for layout only (container, spacing, fonts)

3. **共享樣式提取爲基底文件**
   多個元件共用的一組 class 應提取爲 `XXXBase.css`，統一導入
   Shared styles must be extracted to `XXXBase.css`

4. **自包含驗證**
   元件必須能在 Storybook 或其他孤立環境中渲染，**無需**手動添加父 wrapper 或手動導入父 CSS
   Components must render in isolation without manual wrapper or parent CSS import

---

## 元件 CSS 提取檢查清單 / Component CSS Extraction Checklist

當重構或新增元件時，請逐項確認：

### 提取階段
- [ ] 掃描元件 JSX，列出所有 `className`
- [ ] 在父頁面 CSS 中搜索 scoped 版本（`.parent .child`）
- [ ] 將所有 scoped 規則複製到新 CSS 文件，**移除父 class 前綴**
- [ ] 為新 CSS 文件撰寫適當的註解（雙語）
- [ ] 在元件中添加 `import './ComponentName.css'`
- [ ] 從父頁面 CSS **删除**已提取的完整規則區塊（包括註解）

### 清理階段
- [ ] 檢查父頁面 CSS 是否仍有 `.parent .child` 模式的規則
- [ ] 確認父頁面 CSS 只保留頁面級樣式（`.page-container`, `h4`, `padding` 等）
- [ ] 運行 Storybook，確認所有故事**不需要** decorator wrapper 也能正常渲染
- [ ] 執行 `pnpm run check:css-deps`（如有）确认無 `../pages/*.css` 導入

### 共享樣式
- [ ] 若多個元件共享樣式，是否已提取爲 `Base.css`？
- [ ] 所有共享元件是否都導入了 `Base.css`？
- [ ] `Base.css` 是否不包含任何頁面特定 class？

---

## 技術債務監控 / Technical Debt Monitoring

### 檢測腳本 / Detection Script

定期運行以下腳本，檢測是否有人重新引入父 CSS 依賴：

```typescript
// scripts/check-parent-css-deps.ts
import { readdirSync } from 'fs';
import { join } from 'path';

const PARENT_PAGES = ['HomePage', 'GameDataPage', 'BattlePage', 'TownPage', 'DashboardPage'];

for (const page of PARENT_PAGES) {
  const regex = new RegExp(`import.*\\.\\.\\/pages\\/${page}\\.css`);
  // 掃描 src/components/**/*.tsx
  // 輸出違規文件列表
}
```

**加入 package.json：**
```json
{
  "scripts": {
    "check:css-deps": "tsx scripts/check-parent-css-deps.ts"
  }
}
```

---

## 相關文檔 / Related Documentation

- **案例研究：** `docs/css-isolation-case-study.md` — 本次重構完整分析
- **路徑載入規則：** 本文件上方 — 使用 `#/` 別名取代 `../`
- **元件製作檢查清單：** 本文件第 87–118 行 — CSS/型別檢查

---

> **重構日期：** 2026-05-13
> **負責：** Shadow Monarch (opencode-arise)
> **範圍：** HomePage, GameDataPage, BattlePage, TownPage, DashboardPage 所有子元件
> **状态：** ✅ 完成，已建立預防機制

