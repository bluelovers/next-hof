# YAML 資源匯入 — 實作與缺漏分析 / YAML resource import — implementation & gap analysis

> 狀態 / Status：✅ 讀取 + 轉換已實作（`src/lib/game/data/yaml-*`）；下列缺漏為「已知限制 / follow-up」。
> 日期 / Date：2026-09-29

## 一、資料來源 / Data source

```
HOF/Resource/{kind}/{kind}.{id}.yml   （10 類資源 / 10 resource kinds）
```

| 種類 | 檔案數 | id 型態 | 轉換目標 |
|------|-------|---------|----------|
| Char | 4 | 數字 | `ICharDef` |
| Mon | 145 | 數字 | `IMonDef` |
| Item | 181 | 數字 | `IItemDef` |
| Job | 17 | 數字 | `IJobDef` |
| Skill | 266 | 數字 | `ISkillDef` |
| Guard | 8 | 文字（always/life25/…） | 純資料層 |
| Judge | 128 | 數字 | 純資料層 |
| Land | 25 | 文字（ac0/blow01/…） | 純資料層 |
| Skilltree | 163 | 數字 | 純資料層 |
| Union | 12 | 補零字串（'0000'） | 純資料層 |

原始資料共同特性（依實際檔案掃描）/ Common traits of the raw data (per an actual file scan):

- 數值多為**帶引號字串**（`level: '1'`），少數為真數字（`maxhp: 30400`），偶爾 `null`（pattern `quantity`）。
- **yaml-load 在讀取後統一收斂數值字串為 number**（`'1'` → 1），且 `quantity: null`（0 的同義）→ `0`——raw 層不再有 null，數值欄位一律 `number`。
- `behavior.pattern` 的空物件 `{ }` 代表「無 AI 規則」。
- 怪物（mon）**沒有 `skill` 欄位**——技能完全由 pattern 的 `action` 驅動。
- 角色（char）**沒有 `img`**——圖示來自職業定義（`IJobDef.img`）。
- 守護（Guard）、土地（Land）id 為文字；獨特怪物（Union）id 為補零字串（'0000'）——**不**做數值收斂。

## 二、已實作模組 / Implemented modules

| 模組 | 職責 |
|------|------|
| `src/lib/game/data/yaml-types.ts` | 原始 YAML 的寬鬆型別（10 類資源） |
| `src/lib/game/data/yaml-load.ts` | `parseResourceYaml`、各 `load{Kind}Yaml` / `loadAll{Kind}s`（Node fs；id 支援數字／文字／補零） |
| `src/lib/game/data/yaml-convert.ts` | `convertCharYaml` / `convertMonYaml` / `convertItemYaml` / `convertJobYaml` / `convertSkillYaml` 及正規化 helpers |
| `src/lib/game/data/yaml-repository.ts` | `createYamlRepository()`：讀取 → 轉換 → 註冊 `InMemoryRepository`（Skill/Item/Job/Char/Mon） |
| `src/lib/game/data/yaml-convert.test.ts` | Char/Mon 轉換測試（fixtures） |
| `src/lib/game/data/yaml-convert-other.test.ts` | Item/Job/Skill 轉換 + 文字 id loader 測試（fixtures） |
| `src/yaml-paths.ts` | 路徑定義（`REPO_ROOT`、`TEST_FIXTURES_ROOT`） |

### 轉換正規化 / Normalizations

數值字串的收斂由 **yaml-load 讀取時**完成（`COERCE_SPECS` 依資源種類描述數值欄位），
轉換器以已正規化的 `number` 直接承接。其餘對應：

| 原始資料 | 轉換結果 |
|----------|----------|
| pattern `quantity: null` | 於載入時 → `0`（raw 層無 null） |
| pattern `{ }`（空物件） | `undefined`（引擎以預設收尾補普攻） |
| `guard: pro50`（mon.1055 筆誤） | 於載入時 → `EnumGuardKind.Prob50` |
| `SPECIAL: { Undead: true }` | `special: { Undead: 1 }`（布林 → 數值） |
| `special: { }`（小寫，mon.1000） | 忽略（空物件） |
| `reward.itemtable: { 6000: '1000' }` | `{ 6000: 1000 }`（值於讀取時收斂、鍵於轉換時數值化） |
| `equip: { main_hand: '1000' }` | `equip: { [EnumEquipSlot.MainHand]: 1000 }` |
| `atk: [20, 10]` / `def: [10, 3, 5, 0]` | `atk: [phys, mag]` / `def: [phys%, phys定值, mag%, mag定值]`（語意化 tuple） |
| `item type: Key/Map/Special` | `EnumWeaponType.Other`（無對應成員，收斂保本體資料） |
| `item type2: GUARD` | `EnumItemCategory.Armor`（防具類別，無對應成員） |
| `job gender: 1/2` | `EnumGender.Male/Female`（原始鍵 1=男、2=女；Enum 值 0/1） |
| `skill.type: '0'/'1'` | `EnumSkillDamageType.Physical/Magic` |
| `skill support/quick/passive: true` | `1`（旗標 boolean → number） |
| `skill target: [enemy, individual, 1]` | `ITargetSpec [Enemy, Individual, 1]`（enum 值直接對應） |

### 單一事實來源 / Single source of truth

- 六維／HP/SP：`types.ts` 新增 **`ICombatStats`**（全欄位可缺省），`ICharCore` 與 raw 的 `IRawCombatCoreYaml` 皆引用之。
- **身分／圖示成員 `{no, name, img}`：`INamedIconDef` 定義一次**——`IItemDef`、`ISkillDef`、`IMonDef` 與 raw 的 item/skill/mon 皆 extends；`ICharCore`／`IRawCombatCoreYaml` 以 `Omit<INamedIconDef, 'img'>` 取 no/name（char 無圖示）——no/name 全專案只有一份。
- 有語意 tuple／表型：`IAtkTuple`／`IDefTuple`／`IWeightPair`、`IEncounterTable`（servant／land.monster 遭遇表）、`INumberTable`（itemtable／need）、`IEquipTable`（equip 表）、`IDescInfo`（info 區塊）、`IGrowthCoefficients`（coe）皆定義於 `types.ts`，raw 與 target 共用。
- 特殊能力：raw `SPECIAL`／`special` 型別為 `Partial<Record<keyof ISpecial, ISpecialRawValue>>`。
- `IRawBehaviorYaml` 與 `IBehavior` **同形**（`Omit<IBehavior, 'pattern'> & { pattern?: IRawPatternItemYaml[] }`）：position 值即 `EnumPosition`、guard 值即 `EnumGuardKind`——來源筆誤（`pro50`/`prpb50`）於**載入時修正**（`GUARD_ALIASES`），空物件 pattern `{ }` 於載入時視為 undefined（`?:`）。`IRawPatternItemYaml` ＝ `Partial<IPatternItem>`（quantity 亦選填；引擎以 `?? 0` 視省略同 0）；`IRawRewardYaml` derive 自 `IMonReward`（僅 itemtable 鍵改為字串）；`IRawEquipYaml` ＝ `IEquipTable`；char/mon 的 `behavior` 收斂進 `IRawCombatCoreYaml`。
- `IRawItemYaml`／`IRawSkillYaml` 的補正欄位（P_* / M_*）由 **`ICompBonuses`** 提供；yaml-load ／yaml-convert 的補正確率表由 **`COMP_FIELDS`**（status-attrs）衍生。
- **`data_ex` 禁止 `Record<string, unknown>`**：各 kind 基底 `ICharDataEx`（recruit_money）／`IJobDataEx`（job_base＋job_conditions.job_from）／`IUnionDataEx`（name/level/img/land/cycle）各定義一次，共用的 **`IDataEx extends ICharDataEx, IJobDataEx, IUnionDataEx`** 只做組合；`ICharDef` 與 raw 的 char/job/union 全部指向 `IDataEx`。數值欄位於載入時收斂（union `level: '250'` → 250、job_from `lv`、char `recruit_money`）。
- 技能 Plus*／Up*／Down* 鍵集中於 **`yaml-skill-keys.ts`**（Up/Down 由 `STATUS_UP_KEYS`／`STATUS_DOWN_KEYS` 衍生，`as const` 保留 29 鍵字面聯集）；raw 型別（mapped record）、讀取正規化、轉換器三處共用。
- `GUARD_ALIASES`／`ITEM_TYPE_ALIASES`／`ITEM_TYPE2_ALIASES` 等由對應 enum 成員值自動衍生。
- `convertCharYaml`／`convertMonYaml`／`convertItemYaml`／`convertSkillYaml` 共用 `convertCombatCoreYaml()`／`convertBonuses()` 等 helper。
- 缺省數值：converter **不補 0**（保持 undefined）；`Character` 建構為實例層次（`?? 0`）即已定案，與既有 `hp: init.hp ?? maxhp` 模式一致。

## 三、缺漏分析 / Gap analysis

### A. 原始資料本身缺漏（保持 undefined，不補 0）/ Source-data gaps (kept undefined)

缺漏數值**不補 0**——def 保持 `undefined`（未定），由實例化（Character 建構 `?? 0`）或後續推導（職業係數）解析。
Missing stats stay `undefined` in the defs; instantiation (Character construction `?? 0`) or later derivation resolves them.

| 檔案 | 缺漏 | def 結果 | 建議 |
|------|------|----------|------|
| `mon.1010`、`mon.1011`（Bat） | **完全沒有六維與 HP/SP**（只有 no/name/level/img/behavior） | 六維／HP/SP → `undefined`（實例化時為 0） | 需確認原始行為（可能由產生器公式補值）；目前轉出為退化單位 |
| `char.400`（Hunter） | **缺 maxhp/hp/maxsp/sp** | maxhp/maxsp → `undefined`；hp/sp 保持省略 | HP/SP 依設計由**職業成長係數**推算；需接入 Job 資料後另案補算 |

### B. 現有型別原無欄位（已擴充，多為「資料層保留」）/ Fields absent from the existing types (added; mostly data-layer)

| YAML 欄位 | 加至 | 引擎狀態 |
|-----------|------|----------|
| `img`（monster 圖示） | `IMonDef.img` | 資料層；精靈對應需由展示層讀取 |
| `atk` / `def`（怪物基礎攻擊／減傷） | `IMonDef.atk` / `IMonDef.def` | ⚠️ **資料層僅保留**：`CalcEquips` 開戰時以裝備重建 atk/def，怪物無裝備故歸零（見 C） |
| `SPECIAL` | `IMonDef.special`（Partial\<ISpecial\>） | ✅ 已由 `factory.newMon` 併入 `Character.SPECIAL`（Undead／PoisonResist 生效） |
| `info` | `IMonDef.info` | 資料層／UI |
| `cycle` / `land` / `lv_limit` | `IMonDef.cycle` / `land` / `lv_limit` | 資料層（獨特怪物出現週期／土地／等級限制） |
| `servant` / `servantAmount` / `servantSpecify` | `IMonDef.servant` / `servantAmount` / `servantSpecify` | 資料層（獨特怪物隨行僕從表） |
| `isUnion`（獨特怪物標記） | `IMonDef.isUnion` | 已存在；獨特怪物由 `factory.newUnion()` 疊加 `EnumCharType.Union` |

> 注意：`IMonDef.atk/def` 與 `IMonDef.special` 是**選填**且不影響 `ICharCore`，
> 因此不會波及角色／`Character` 建構流程。

### C. 引擎接入缺口（不屬本次「讀取＋轉換」範圍）/ Engine-wiring gaps (beyond read+convert)

1. **怪物 atk/def 未接入戰鬥。** `setBattleVariable → CalcEquips` 將 `char.atk/def` 重置為 `[0,0]`／`[0,0,0,0]` 後僅由裝備累加。轉出的 `IMonDef.atk/def` 目前是死資料。
   - 建議：`CalcEquips` 對「無裝備單位」保留其 def.atk/def（或於 factory 把 def.atk/def 寫入實例後、由 CalcEquips 以實例既有值為基底）。⚠️ 這會改變現有 seed 怪物的傷害行為，須獨立變更。
2. **char.400 的 HP/SP 需要職業係數公式**（見 A），需 Job 資源與 `level-fix` 以外的 hp 推導。
3. **Guard／Judge／Land／Skilltree／Union 僅提供 raw 讀取**（無目標型別）；如要進入引擎，需為各類別建立資料層型別與消耗者。

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

// root 是「含各資源子目錄」的上層目錄 / root is the parent holding the resource subdirectories
const resourceRoot = 'D:/path/to/HOF/Resource';
const { repo, skills, items, jobs, chars, mons } = createYamlRepository(resourceRoot);

repo.getSkill(1000)?.name;   // 'Attack'
repo.getItem(1000)?.name;    // 'ShortSword'
repo.getJob(100)?.job_name;  // 'Warrior'
repo.getMon(1000)?.name;     // 'GoblinAxe'
repo.getCharBase(100)?.name; // 'Warrior'
```

各類 raw 讀取（含文字 id，如 Guard/Land）/ per-kind raw reads (textual ids for Guard/Land):

```ts
import { loadAllMons, loadGuardYaml, loadAllUnions } from '#/lib/game/data/yaml-load';
import { convertMonYaml } from '#/lib/game/data/yaml-convert';

const mons = loadAllMons(resourceRoot).map(convertMonYaml); // IMonDef[]
loadGuardYaml('always', resourceRoot);   // Guard/guard.always.yml
loadAllUnions(resourceRoot);             // Union/*.yml（id 為 '0000' 等補零字串）
```