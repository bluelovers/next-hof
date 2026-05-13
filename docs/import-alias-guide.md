# Import 路徑別名設定 / Import Path Alias Setup

## 概述 / Overview

使用 `#/` 作為根目錄路徑別名，取代傳統的 `../` 相對路徑寫法，提升程式碼可讀性與可維護性。

Uses `#/` as the root directory path alias, replacing traditional `../` relative path imports for better code readability and maintainability.

---

## 設定方式 / Configuration

採用 **雙設定（Dual Configuration）** 策略，各自服務不同的解析器：

### 1. `package.json` — 給 Vite / Storybook / Node.js 使用

```json
{
  "imports": {
    "#/*": "./src/*"
  }
}
```

### 2. `tsconfig.json` — 給 TypeScript Compiler / Language Server 使用

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "#/*": ["./src/*"]
    }
  }
}
```

### 為何需要兩邊都設？/ Why Both?

| 解析器 | 使用來源 | 原因 |
|--------|---------|------|
| **Vite / Storybook** | `package.json` `imports` | Vite 原生支援 Node.js ESM `imports` 欄位解析 |
| **Node.js (ESM)** | `package.json` `imports` | `#` 開頭的 subpath imports 是 Node.js 官方標準 |
| **TypeScript < 6.0** | `tsconfig.json` `paths` | TS 5.x 不支援 `"#/*"` 萬用字元模式（見下方限制說明） |
| **TypeScript >= 6.0** | `package.json` `imports` | TS 6.0+ 完整支援 `#/` subpath imports，可省略 `paths` |

---

## 使用範例 / Usage Examples

```typescript
// ✅ 推薦：使用 #/ 根路徑別名
import { LoginForm } from '#/components/auth/LoginForm';
import { GameLayout } from '#/components/pages/GameLayout';
import type { IJobData } from '#/components/game-data/GameDataTypes';

// ❌ 避免：多層相對路徑
import { LoginForm } from '../auth/LoginForm';        // 可讀性差
import { IJobData } from '../../../game-data/GameDataTypes'; // 難以維護
```

---

## TypeScript 版本限制 / TypeScript Version Limitation

### 已知問題 / Known Issue

**TypeScript 5.x** 對 `package.json` `imports` 的 `"#/*"` 萬用字元模式支援有限。

| TypeScript 版本 | `package.json` `imports` | `tsconfig.json` `paths` |
|----------------|-------------------------|------------------------|
| 4.7+ | ✅ 支援具名 subpath（如 `"#utils/*"`） | ✅ 支援 |
| 5.0 - 5.9 | ⚠️ 不支援 `"#/*"` 通配 | ✅ 支援 |
| 6.0+ | ✅ 完整支援 `"#/*"`（PR [#62844](https://github.com/microsoft/TypeScript/pull/62844)） | ✅ 支援 |

**解決方案：** 同時設定 `paths` 作為 TypeScript 的解析來源。等到升級 TypeScript 6.0+ 後，可以考慮移除 `paths`，完全依賴 `package.json` `imports`。

---

## 優缺點分析 / Pros & Cons

### 優點 / Pros

| 優點 | 說明 |
|------|------|
| **可讀性提升** | `#/components/auth/LoginForm` 比 `../../../auth/LoginForm` 直觀許多 |
| **重構友善** | 移動檔案時不需修改 import 路徑，檔案搬家不再連鎖崩潰 |
| **標準化** | `#` 是 Node.js ESM 的官方 subpath imports 符號，非 TypeScript 自訂擴充 |
| **與 bundler 相容** | Vite / webpack / esbuild 均支援 `package.json` `imports` 解析 |
| **無 runtime 開銷** | 編譯／bundling 時就解析完畢，不影響執行效能 |

### 缺點 / Cons

| 缺點 | 說明 |
|------|------|
| **雙重設定** | 目前需要同時維護 `package.json` `imports` 和 `tsconfig.json` `paths`（TS 6.0+ 可簡化） |
| **ESM 副檔名限制** | Node.js ESM 需要 import 時加 `.js` 副檔名（若直接用 Node.js 執行而非 bundler） |
| **TS 版本依賴** | 低版本 TypeScript 對 `#/` 萬用字元支援有限 |
| **學習曲線** | 團隊成員需要了解 `imports` 與 `paths` 的差異 |

---

## 未來的方向 / Future Direction

升級到 **TypeScript 6.0+** 後，可以簡化為僅保留 `package.json` `imports`：

```json
// package.json（未來 TS 6.0+ 可只保留這個）
{
  "imports": {
    "#/*": "./src/*"
  }
}
```

```json
// tsconfig.json（可移除 paths，moduleResolution 仍保留 bundler）
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

---

## 參考資料 / References

- [Node.js 官方文件 — Package imports](https://nodejs.org/api/packages.html#subpath-imports)
- [TypeScript PR #62844 — Allow subpath imports that start with `#/`](https://github.com/microsoft/TypeScript/pull/62844)
- [TypeScript Issue #62841 — Module Resolution: allow subpath imports that start with `#/`](https://github.com/microsoft/typescript/issues/62841)
