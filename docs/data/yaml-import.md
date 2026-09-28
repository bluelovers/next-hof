# YAML 資源匯入 — 實作與缺漏分析 / YAML resource import — implementation & gap analysis

> 狀態 / Status：✅ 讀取 + 轉換已實作（`src/lib/game/data/yaml-*`）；下列缺漏為「已知限制 / follow-up」。
> 日期 / Date：2026-09-29

## 一、資料來源 / Data source

```
HOF/Resource/Char/char.{no}.yml   (4 檔: 100, 200, 300, 400)
HOF/Resource/Mon/mon.{no}.yml     (145 檔: 1000–1110, 2000–2011, 5000–5017, 5100–5104)
```

原始資料共同特性（依實際檔案掃描）/ Common traits of the raw data (per an actual file scan):

- 數值多為**帶引號字串**（`level: '1'`），少數為真數字（`maxhp: 30400`），偶爾 `null`（pattern `quantity`）。
- `behavior.pattern` 的空物件 `{ }` 代表「無 AI 規則」。
- 怪物（mon）**沒有 `skill` 欄位**——技能完全由 pattern 的 `action` 驅動。
- 角色（char）**沒有 `img`**——圖示來自職業定義（`IJobDef.img`）。

## 二、已實作模組 / Implemented modules

| 模組 | 職責 |
|------|------|
| `src/lib/game/data/yaml-types.ts` | 原始 YAML 的寬鬆型別（string \| number \| null） |
| `src/lib/game/data/yaml-load.ts` | `parseResourceYaml` / `loadCharYaml` / `loadMonYaml` / `loadAllChars` / `loadAllMons`（Node fs） |
| `src/lib/game/data/yaml-convert.ts` | `convertCharYaml` / `convertMonYaml` 及正規化 helpers |
| `src/lib/game/data/yaml-repository.ts` | `createYamlRepository()`：讀取 → 轉換 → 註冊 `InMemoryRepository` |
| `src/lib/game/data/yaml-convert.test.ts` | 以實際 YAML 片段測試（含邊界案例） |

### 轉換正規化 / Normalizations

| 原始資料 | 轉換結果 |
|----------|----------|
| `level: '1'` | `level: 1` |
| pattern `quantity: null` | `quantity: 0` |
| pattern `{ }`（空物件） | `undefined`（引擎以預設收尾補普攻） |
| `guard: pro50`（mon.1055 筆誤） | `EnumGuardKind.Prob50` |
| `SPECIAL: { Undead: true }` | `special: { Undead: 1 }`（布林 → 數值） |
| `special: { }`（小寫，mon.1000） | 忽略（空物件） |
| `reward.itemtable: { 6000: '1000' }` | `{ 6000: 1000 }`（字串鍵 → number 鍵） |
| `equip: { main_hand: '1000' }` | `equip: { [EnumEquipSlot.MainHand]: 1000 }` |
| `atk: [20, 10]` / `def: [10, 3, 5, 0]` | `IMonDef.atk` / `IMonDef.def`（僅資料層保留） |

### 單一事實來源 / Single source of truth

- `IRawCharYaml`／`IRawMonYaml` 共用 `IRawCombatCoreYaml`（no/name/level/六維/HP/SP），**不重覆宣告**基本欄位。
- `GUARD_ALIASES` 由 `EnumGuardKind` 成員值**自動衍生**（新增守護種類即自動涵蓋），僅額外收錄原始檔筆誤別名（`pro50`/`prpb50` → `prob50`）。
- `convertCharYaml`／`convertMonYaml` 共用 `convertCombatCoreYaml()` 轉換核心欄位，hp/sp 缺省＝滿血語意（`undefined`）。

## 三、缺漏分析 / Gap analysis

### A. 原始資料本身缺漏（已在轉換器以預設值補齊）/ Source-data gaps (defaulted in the converter)

| 檔案 | 缺漏 | 轉換結果 | 建議 |
|------|------|----------|------|
| `mon.1010`、`mon.1011`（Bat） | **完全沒有六維與 HP/SP**（只有 no/name/level/img/behavior） | 全部數值 → `0` | 需確認原始行為（可能由產生器公式補值）；目前轉出為 0 戰力的退化單位 |
| `char.400`（Hunter） | **缺 maxhp/hp/maxsp/sp** | maxhp/maxsp → `0`；hp/sp → `undefined`（滿血語意） | HP/SP 依設計由**職業成長係數**在產生角色時推算，資源檔未提供；需接入 Job 資料後補算，為 follow-up |

### B. 現有型別原無欄位（已擴充，多為「資料層保留」）/ Fields absent from the existing types (added; mostly data-layer)

| YAML 欄位 | 加至 | 引擎狀態 |
|-----------|------|----------|
| `img`（monster 圖示） | `IMonDef.img` | 資料層；精靈對應需由展示層讀取 |
| `atk` / `def`（怪物基礎攻擊／減傷） | `IMonDef.atk` / `IMonDef.def` | ⚠️ **資料層僅保留**：`CalcEquips` 開戰時以裝備重建 atk/def，怪物無裝備故歸零（見 C） |
| `SPECIAL` | `IMonDef.special`（Partial\<ISpecial\>） | ✅ 已由 `factory.newMon` 併入 `Character.SPECIAL`（Undead／PoisonResist 生效） |
| `info` | `IMonDef.info` | 資料層／UI |
| `cycle` / `land` / `lv_limit` | `IMonDef.cycle` / `land` / `lv_limit` | 資料層（工會怪出現週期／土地／等級限制） |
| `servant` / `servantAmount` / `servantSpecify` | `IMonDef.servant` / `servantAmount` / `servantSpecify` | 資料層（工會怪隨行雜魚表） |
| `isUnion`（工會怪標記） | `IMonDef.isUnion` | 已存在；工會怪由 `factory.newUnion()` 疊加 `EnumCharType.Union` |

> 注意：`IMonDef.atk/def` 與 `IMonDef.special` 是**選填**且不影響 `ICharCore`，
> 因此不會波及角色／`Character` 建構流程。

### C. 引擎接入缺口（不屬本次「讀取＋轉換」範圍）/ Engine-wiring gaps (beyond read+convert)

1. **怪物 atk/def 未接入戰鬥。** `setBattleVariable → CalcEquips` 將 `char.atk/def` 重置為 `[0,0]`／`[0,0,0,0]` 後僅由裝備累加。轉出的 `IMonDef.atk/def` 目前是死資料。
   - 建議：`CalcEquips` 對「無裝備單位」保留其 def.atk/def（或於 factory 把 def.atk/def 寫入實例後、由 CalcEquips 以實例既有值為基底）。⚠️ 這會改變現有 seed 怪物的傷害行為，須獨立變更。
2. **char.400 的 HP/SP 需要職業係數公式**（見 A），需 Job 資源與 `level-fix` 以外的 hp 推導。
3. **job／skill／item YAML 尚未匯入**（本任務僅 Char/Mon）；`Job/`、`Skill/`、`Item/`、`Skilltree/`、`Judge/`、`Land/`、`Union/`、`Guard/` 另案處理。

### D. 原始資料品質 / Source-data quality issues

| 問題 | 位置 | 處理 |
|------|------|------|
| guard 筆誤 `pro50` | `mon.1055.yml` | 轉換器別名改正（記錄於 `GUARD_ALIASES`） |
| guard 檔案名筆誤 `guard.prpb50.yml` | `Resource/Guard/` | Guard 另案匯入時需同名別名 |
| `special`（全小寫）vs `SPECIAL` | `mon.1000.yml`（小寫且為空物件） | 兩者合併、大寫優先 |
| pattern `quantity: null` | 多檔 | 轉換為 `0` |
| 部分欄位字串／數字混用 | `maxhp: 30400` vs `maxhp: '700'` | `toNumber` 一律收斂 |

## 四、使用方式 / Usage

root 由呼叫方提供（不硬編碼路徑）：/ The resource root is supplied by the caller (no hardcoded path):

```ts
import { createYamlRepository } from '#/lib/game/data/yaml-repository';

// root 是「含 Char／Mon 子目錄」的上層目錄 / root is the parent holding the Char/Mon subdirectories
const resourceRoot = 'D:/path/to/HOF/Resource';
const { repo, chars, mons } = createYamlRepository(resourceRoot);

repo.getMon(1000)?.name;    // 'GoblinAxe'
repo.getCharBase(100)?.name; // 'Warrior'
```

```ts
import { loadAllMons } from '#/lib/game/data/yaml-load';
import { convertMonYaml } from '#/lib/game/data/yaml-convert';

const mons = loadAllMons(resourceRoot).map(convertMonYaml); // IMonDef[]
```