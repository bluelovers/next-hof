# 專案目錄結構分類規則
# Project Directory Structure Classification Rules

## 概述

本文檔定義了 `src/components` 與 `stories` 兩個目錄的結構分類原則，確保元件組織邏輯一致且便於維護。

## 一、目錄結構全景

### src/components 目錄樹

```
src/components/
├── pages/                    # 頁面級組件 (Page-level components)
│   ├── BattlePage.tsx        # 戰鬥編成頁面
│   ├── BattleDisplay.tsx     # 戰鬥展示頁面 (從 battle/ 移入)
│   ├── DashboardPage.tsx     # 儀表板頁面
│   ├── GameDataPage.tsx      # 遊戲數據頁面
│   ├── HomePage.tsx          # 首頁
│   ├── HuntPage.tsx          # 狩獵頁面
│   ├── TownPage.tsx          # 城鎮頁面
│   ├── GameLayout.tsx        # 頁面佈局
│   └── Shared.css            # 跨頁面共享樣式
│
├── battle/                   # 戰鬥子組件 (Battle sub-components)
│   ├── BattleUnit.tsx        # 戰鬥單位
│   ├── BattleAction.tsx      # 戰鬥行動
│   ├── BattleLog.tsx         # 戰鬥日誌
│   ├── BattleResult.tsx      # 戰鬥結果
│   ├── BattleTeamInfo.tsx    # 隊伍資訊
│   ├── BattleFieldScene.tsx  # 戰場場景
│   └── types.ts              # 戰鬥類型定義
│
├── game-data/                # 遊戲數據展示 (Game data display)
│   ├── SkillCard.tsx         # 技能卡片
│   ├── JobDetailCard.tsx     # 職業詳情卡片
│   ├── JobDetailTable.tsx    # 職業詳情表格
│   ├── JobTree.tsx           # 職業樹
│   ├── CharacterSpriteDisplay.tsx  # 角色精靈展示
│   └── GameDataTypes.ts      # 遊戲數據類型
│
├── characters/               # 角色相關 (Character components)
│   ├── CharacterList.tsx     # 角色列表
│   ├── CharacterCard.tsx     # 角色卡片
│   └── BattleCharacterCard.tsx  # 戰鬥角色卡片
│
├── monsters/                 # 怪物相關 (Monster components)
│   └── MonsterCard.tsx       # 怪物卡片
│
├── info/                     # 資訊展示 (Information display)
│   ├── TeamStatus.tsx        # 隊伍狀態
│   ├── InfoSection.tsx       # 資訊分段
│   ├── GameDescription.tsx   # 遊戲說明
│   └── RankingTable.tsx      # 排行榜
│
├── navigation/               # 導航組件 (Navigation)
│   ├── NavigationBar.tsx     # 導航列
│   ├── GDSubNav.tsx          # 遊戲數據子導航
│   └── HuntSubNav.tsx        # 狩獵子導航
│
├── facilities/               # 城鎮設施 (Town facilities)
│   ├── MessageBoard.tsx      # 留言板
│   ├── TownFacility.tsx      # 城鎮設施
│   └── FacilityGroup.tsx     # 設施群組
│
├── auth/                     # 認證 (Authentication)
│   └── LoginForm.tsx         # 登入表單
│
└── areas/                    # 區域 (Areas)
    └── HuntAreaLink.tsx      # 狩獵區域連結
```

### stories 目錄樹

```
stories/
├── pages/                    # 頁面級故事 (對應 src/pages/)
│   ├── BattlePage/
│   │   ├── BattlePage.stories.tsx
│   │   ├── BattleCharacterCard.stories.tsx
│   │   ├── MonsterCard.stories.tsx
│   │   └── BattleDisplay.stories.tsx    # ← 從 battle/ 移入
│   ├── HuntPage/
│   │   ├── HuntPage.stories.tsx
│   │   ├── HuntAreaLink.stories.tsx
│   │   └── HuntSubNav.stories.tsx
│   ├── HomePage.stories.tsx
│   ├── GameDataPage.stories.tsx
│   ├── TownPage.stories.tsx
│   ├── DashboardPage.stories.tsx
│   └── GameLayout.stories.tsx
│
├── battle/                   # 戰鬥子組件故事 (獨立展示用)
│   ├── BattleAction.stories.tsx
│   ├── BattleFieldScene.stories.tsx
│   ├── BattleResult.stories.tsx
│   ├── BattleTeamInfo.stories.tsx
│   └── BattleUnit.stories.tsx
│
├── game-data/                # 遊戲數據組件故事
│   ├── CharacterSpriteDisplay.stories.tsx
│   ├── JobDetailTable.stories.tsx
│   ├── JobTree.stories.tsx
│   ├── JobDetailCard.stories.tsx
│   └── SkillCard.stories.tsx
│
├── characters/               # 角色組件故事
│   ├── CharacterList.stories.tsx
│   └── CharacterCard.stories.tsx
│
├── info/                     # 資訊組件故事
│   ├── TeamStatus.stories.tsx
│   ├── GameDescription.stories.tsx
│   ├── InfoSection.stories.tsx
│   └── RankingTable.stories.tsx
│
├── navigation/               # 導航組件故事
│   ├── GDSubNav.stories.tsx
│   └── NavigationBar.stories.tsx
│
├── auth/                     # 認證組件故事
│   └── LoginForm.stories.tsx
│
└── assets/                   # Storybook 靜態資源
    ├── accessibility.svg
    ├── addon-library.png
    └── ... (其他圖片資源)
```

## 二、分類原則

### 2.1 src/components 分類標準

| 目錄 | 定義 | 特徵 | 範例 |
|------|------|------|------|
| `pages/` | **頁面級組件** | 完整畫面佈局、組合多個子組件、包含頁面級 CSS | BattlePage, DashboardPage, GameLayout |
| `battle/` | **戰鬥子系統組件** | 戰鬥顯示的組成部分、不包含頁面佈局 | BattleUnit, BattleLog, BattleResult |
| `game-data/` | **遊戲數據展示** | 卡片、表格、樹狀結構等數據可視化 | JobTree, SkillCard, CharacterSpriteDisplay |
| `characters/` | **角色相關** | 角色列表、卡片、角色選擇器 | CharacterList, CharacterCard |
| `monsters/` | **怪物相關** | 怪物展示、怪物卡片 | MonsterCard |
| `info/` | **資訊展示** | 狀態顯示、說明、排行榜 | TeamStatus, RankingTable, InfoSection |
| `navigation/` | **導航組件** | 選單、子導航、頁籤 | NavigationBar, GDSubNav, HuntSubNav |
| `facilities/` | **城鎮設施** | 城市內的建築與功能 | MessageBoard, TownFacility |
| `auth/` | **認證組件** | 登入、註冊、身份驗證 | LoginForm |
| `areas/` | **區域選擇** | 地圖區域選擇 | HuntAreaLink |

#### 頁面級 vs 子組件判斷標準

**頁面級組件（pages/）**：
- ✅ 使用 `GameLayout` 作為外層容器
- ✅ 整合多個不同分類的子組件
- ✅ 擁有獨立的頁面級 CSS 文件
- ✅ 直接對應路由頁面

**子組件（其他分類）**：
- ✅ 專注於單一功能或單一數據展示
- ✅ 不包含頁面佈局邏輯
- ✅ 可由頁面級組件組合使用

### 2.2 stories 分類標準

stories 目錄的結構原則上與 src/components 保持同步，但允許微調以優化展示體驗：

| 分類原则 | src/components 路径 | stories 路径 | 说明 |
|---------|-------------------|-------------|------|
| **完全同步** | `pages/BattlePage` | `pages/BattlePage/` | 页面级组件独立目录 |
| **功能聚合** | `battle/BattleDisplay` | `pages/BattlePage/BattleDisplay` | BattleDisplay 是页面级聚合组件 |
| **组件独立** | `battle/BattleUnit` | `battle/BattleUnit` | 子组件保持独立展示 |

#### Story title 命名規則

```
<分類>/<組件名>            # 一般組件
pages/<頁面名>/<組件名>    # 頁面下的組件
```

**範例：**
- `Battle/BattleDisplay` → `Pages/BattlePage/BattleDisplay` (页面级)
- `Battle/BattleUnit` → `Battle/BattleUnit` (子组件)
- `Info/TeamStatus` → `Info/TeamStatus` (子组件)

## 三、移動與重構指南

### 3.1 何時應該移動到 pages 目錄？

判斷步驟：
1. 該組件是否使用 `GameLayout`？
2. 該組件是否組合 3 個以上不同分類的子組件？
3. 該組件是否對應一個完整頁面？

**如果以上任何一項為是 → 放入 `pages/`**

### 3.2 BattleDisplay 移動案例研究

**移動前：**
```
src/components/battle/BattleDisplay.tsx     # ❌ 不該在此
stories/battle/BattleDisplay.stories.tsx    # ❌ 分類不一致
```

**移動後：**
```
src/components/pages/BattleDisplay.tsx      # ✅ 頁面級組件
stories/pages/BattlePage/BattleDisplay.stories.tsx  # ✅ 放在頁面目錄下展示
```

**移動原因：**
- BattleDisplay 是完整戰鬥畫面，使用 GameLayout（隱含）
- 組合了 BattleTeamInfo、BattleFieldScene、BattleUnit、BattleLog、BattleResult 5 個子組件
- 對應實際的戰鬥展示頁面

### 3.3 移動操作步驟 checklist

- [ ] **分析目標組件用途** - 確認是否為頁面級組件
- [ ] **複製文件到 pages/** - 移動 `.tsx` 與 `.css`
- [ ] **更新導入路徑** - 使用 `#/` 別名指向子組件
- [ ] **刪除原位置文件** - 移除 `battle/` 目錄的原始文件
- [ ] **更新 stories 位置** - 移動 `.stories.tsx` 並調整 title
- [ ] **更新故事導入路徑** - 改用 `#/` 別名
- [ ] **更新 AGENTS.md** - 修正元件路徑對照表
- [ ] **運行 Storybook** - 驗證故事正常運作
- [ ] **提交變更** - 如使用 Git，創建有意義的 commit message

## 四、目錄同步策略

### 4.1 雙目錄對應關係

```
src/components/
├── pages/[PageName]/         ↔  stories/pages/[PageName]/
│   └── *.tsx, *.css          ↔  *.stories.tsx, *.css  (獨立展示)
│
├── [Category]/[Component]    ↔  stories/[Category]/
│   └── *.tsx, *.css          ↔  *.stories.tsx        (1:1 對應)
│
└── categories/               (無對應) - 僅 src 有 types.ts 等工具文件
```

### 4.2 stories 目錄特殊規則

**允許微調分類的情況：**

1. **頁面聚合組件** - 如 BattleDisplay 實際上是 BattlePage 的一部分，放入 pages/ 更合適
2. **跨頁面共享組件** - 如 Shared.css 無對應故事
3. **類型定義文件** - `*.types.ts` 通常不需要單獨故事
4. **工具函數** - 放在 `stories/utils/` 或無需故事

**不允許移動的情況：**

1. 單一組件已獨立分類，不得随意合併
2. 破壞現有 Storybook 導航結構
3. 與 src 層級完全不對應

## 五、最佳實踐

### 5.1 新建組件路徑選擇

```
新建戰鬥單位 → src/components/battle/BattleUnit.tsx
新建頁面組件 → src/components/pages/NewPage.tsx
新建技能卡片 → src/components/game-data/SkillCard.tsx
```

### 5.2 Storybook 目錄結構檢查

定期檢查 stories 目錄是否符合分類原則：
- 頁面級組件應放入 `stories/pages/[PageName]/`
- 子組件應放入 `stories/[Category]/`
- 不應出現混亂分類（如 battle 目錄下有頁面級故事）

### 5.3 團隊協作規範

1. **移動組件時** - 同步移動 src 與 stories
2. **新建組件時** - 同時創建 `.stories.tsx` 文件
3. **重構目錄時** - 更新 AGENTS.md 與本文檔
4. **命名不一致時** - 以本文檔為準，調整路徑

## 六、參考資源

- **AGENTS.md** - 元件路徑對照表 (第 65-83 行)
- **import-alias-guide.md** - `#/` 別名使用方式
- **CSS 隔離規則** - 每個 components 資料夾應包含自有 CSS 檔案

---

> **最後更新：** 2026-05-13
> **負責：** Shadow Monarch (opencode-arise)
> **變更：** BattleDisplay 從 `battle/` 移動到 `pages/`
