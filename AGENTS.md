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
import { JobTree } from 'src/components/GameDataPage/JobTree';
import { SkillCard } from 'src/components/GameDataPage/SkillCard';

// ❌ 錯誤 / Wrong: 透過 barrel index.ts
import { JobTree } from 'src/components/GameDataPage';
import { SkillCard } from 'src/components/GameDataPage';
```

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
| BattleDisplay | `src/components/BattleDisplay/BattleDisplay` |
| BattleTeamInfo | `src/components/BattleDisplay/BattleTeamInfo` |
| BattleUnit | `src/components/BattleDisplay/BattleUnit` |
| BattleAction | `src/components/BattleDisplay/BattleAction` |
| BattleLog | `src/components/BattleDisplay/BattleLog` |
| BattleFieldScene | `src/components/BattleDisplay/BattleFieldScene` |
| BattleResult | `src/components/BattleDisplay/BattleResult` |
| GameDataTypes | `src/components/GameDataPage/GameDataTypes` |
| BattleDisplay/types | `src/components/BattleDisplay/types` |

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
