# 設置頁 · UI/UX 審查與改版設計

> 設計依據：`ui-ux-pro-max` Skill（design-system + UX / icons / react）  
> 現狀代碼：`src/pages/Settings/`  
> 產物：本審查文檔 + `design-system.md` + `ui-flow.mermaid` + **可瀏覽器打開的** `ui-prototype.html`  
> 狀態：**待你確認後再改代碼**  
> **已採納（用戶指定）**：頂部 **Tabs** + **每個需配置的 Tab 獨立保存**

---

## 1. 功能與用戶目標

| 項 | 內容 |
|----|------|
| 頁面名稱 | 設置（側欄）/ 設置（頁內標題） |
| 核心任務 | 配置外觀、AI API、查看版本並更新 |
| 主流程 | 進入某 Tab → 改字段 →（可選）測 API → **僅保存該 Tab** → 持久化對應字段 |
| 用戶 | 桌面端 Electron 用戶；熟練使用工具，不需要 onboarding |
| 技術棧約束 | **antd + styled-components**；light / dark / blue 主題 token |
| 數據 | `useSettingsStore` → electron-store `settings`（仍為同一 store，**按字段子集寫入**） |

### 當前能力清單（改版需保留）

| Tab | 字段 / 能力 | 持久化 Key | 是否有「保存」 |
|-----|-------------|------------|----------------|
| 外觀與語言 | 界面語言 | `language` | **有**（本 Tab 獨立） |
| 外觀與語言 | 界面主題 light / dark / blue | `theme` | 同上 |
| AI 服務 | 提供者 openai / openrouter | `apiProvider` | **有**（本 Tab 獨立） |
| AI 服務 | OpenAI / OpenRouter Key + 測試連接 | `openaiApiKey` / `openrouterApiKey` | 同上 |
| AI 服務 | OpenRouter 模型選擇與詳情 | `selectedModel`、`savedModels` 等 | 同上 |
| 關於與更新 | 當前版本、檢查更新、下載安裝、進度與重試 | `useAppUpdate`（非 form） | **無**（操作型，即點即用） |

### 明確不納入本次設置頁改版

| 項 | 原因 |
|----|------|
| `analysisPrompt` 編輯 | 已在 **LLM 圖片分析** 頁；不搬進設置 |
| 新 API 供應商 | 範圍外 |
| 完整 i18n 切換實現 | 語言 Select 可保留；不擴 scope |
| 全局側欄 / TitleBar 重做 | 僅設置內容區 |
| 頁級「一次保存全部」 | **明確取消**；改為分 Tab 保存 |

---

## 2. 現狀 UI 問題（對照 skill 規則）

| 嚴重度 | 問題 | 對應 UX 規則 | 現狀表現 |
|--------|------|--------------|----------|
| **高** | 分區結構弱、信息過載 | Navigation / Progressive disclosure | 三個 Collapse **默認全開**；基本區重複 Divider |
| **高** | 一次保存耦合過強 | Forms / Progressive disclosure | 改主題也會和 API 字段一起 validate / 提交；OpenRouter required 拖累整表 |
| **高** | 主操作易被捲走 | Sticky CTA / Submit Feedback | 保存在整表底部 |
| **高** | 未保存狀態弱 | Confirmation / Active feedback | 僅條件「重置」；無 Tab 級 dirty |
| **中** | 主題選擇可掃讀性差 | Forms & Feedback | 純文字 Radio.Button |
| **中** | 主題切換體驗硬 | Micro-interactions | 保存後 `window.location.reload()` |
| **中** | API 就緒狀態分散 | Feedback | 無分區級就緒摘要 |
| **中** | 文案語系混用 | Consistency | 繁簡混排 |

---

## 3. ui-ux-pro-max 設計系統摘要

| 維度 | 建議 | 本項目落地 |
|------|------|------------|
| Pattern | 清晰分區 + CTA 可見 | **antd Tabs**；每個可配置 Tab **自帶保存欄** |
| Style | Micro-interactions | hover 150–300ms、按鈕 loading、Alert |
| Color | Skill teal | **映射現有 token**（見 `design-system.md`） |
| Typography | Inter | 系統字體 + antd |
| 禁止 | 複雜 onboarding | Tab 瞬切；無引導輪播 |

---

## 4. 方案決策（已定）

| 方案 | 狀態 |
|------|------|
| A. 左導航 + 右內容 + **全頁一個保存** | 已否決（用戶不要） |
| **B. 頂部 Tabs + 每 Tab 獨立保存** | **已採納** |
| C. 優化 Collapse + 全頁保存 | 已否決 |

### 為何 Tabs + 分 Tab 保存合適

1. 三個分區穩定、名稱短，Tabs 掃讀成本低。  
2. **外觀**與 **API** 變更頻率、風險不同：分保存可避免「只想改 Key 卻被迫處理主題 / 整表校驗」。  
3. **關於與更新**是命令型 UI，本來就不該和表單共用「保存設置」。  
4. 與 skill「Submit Feedback / 錯誤就近」一致：校驗與成功 toast 都落在當前 Tab。

---

## 5. 改版信息架構

```
┌──────────────────────────────────────────────────────────────────┐
│ 頁頭：設置（無冗餘副標題）                                        │
├──────────────────────────────────────────────────────────────────┤
│ [ 外觀與語言 ]  [ AI 服務 ]  [ 關於與更新 ]     ← antd Tabs       │
│   （可有 · 未保存小點）                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   當前 Tab 內容區（卡片 + 字段 / 操作）                            │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  ※ 僅「外觀」「AI」顯示：                                         │
│  [重置本頁更改]（本 Tab dirty 時）     [保存本頁設置]（主 CTA）    │
│  ※ 「關於與更新」：無此欄，僅有檢查更新 / 立即更新                 │
└──────────────────────────────────────────────────────────────────┘
```

### 5.1 Tab「外觀與語言」

| 元素 | 規格 |
|------|------|
| 語言 | Select：繁中 / 简中 / English / 日本語 |
| 主題 | **三張預覽卡**；選中 2px primary 邊框 + 勾選 |
| 保存範圍 | **僅** `language`、`theme` |
| 重置範圍 | 僅回滾本 Tab 字段到 store 已存值 |
| dirty | 僅比較本 Tab 字段子集 |

### 5.2 Tab「AI 服務」

| 元素 | 規格 |
|------|------|
| 就緒摘要 | Badge：`未配置` / `已填寫未測試` / `連接正常` / `連接失敗` |
| 提供者 | Segmented：OpenAI \| OpenRouter |
| Key | Password + 測試連接；結果就近 Alert |
| 模型 | 僅 OpenRouter；Select + 詳情卡 |
| 保存範圍 | **僅** `apiProvider`、`openaiApiKey`、`openrouterApiKey`、`selectedModel`，以及測試成功後需要持久化的 `savedModels` / `lastModelUpdateTime`（若現有邏輯已寫 store，保持在本 Tab 保存或測試成功時寫入，見實現計劃） |
| 校驗 | **只 validate 本 Tab 字段**；不再被外觀字段連帶 |
| 重置 | 僅回滾本 Tab 字段 |

### 5.3 Tab「關於與更新」

| 元素 | 規格 |
|------|------|
| 信息行 | 當前版本 / 最新版本 |
| 更新說明 | 有更新時展示 |
| 進度 | `UpdateProgressBlock` |
| 操作 | 檢查更新、立即更新（`canUpdate` 時） |
| 保存 | **不展示**保存 / 重置；無 form dirty |

### 5.4 文案

設置頁內統一 **繁體中文**：「關於與更新」等。

---

## 6. 交互規格 · 分 Tab 獨立保存（核心）

### 6.1 數據模型（概念）

```
store.settings = { language, theme, apiProvider, keys, model, ... }

Tab 外觀 form  ←→  subset A = { language, theme }
Tab AI form    ←→  subset B = { apiProvider, openaiApiKey, openrouterApiKey, selectedModel, ... }
Tab 關於       ←→  無 form subset
```

- 持久化仍調用 `updateSettings(partial)`，**每次只傳當前 Tab 的 partial**。  
- **禁止**一次提交三個 Tab 的全部 values。  
- 實現上推薦：**每個可配置 Tab 使用獨立 `Form` 實例**（或獨立受控 state），避免 antd 單 Form 跨 Tab 耦合。

### 6.2 Dirty 狀態

| 規則 | 說明 |
|------|------|
| 粒度 | `dirtyAppearance` / `dirtyApi` **分開** |
| Tab 標籤 | 該 Tab dirty 時，標籤旁顯示小圓點或「未保存」角標 |
| 保存欄 | 僅當前 Tab 的重置按鈕隨 **該 Tab** dirty 顯示 |
| 互不影響 | 在外觀改了主題未保存，切到 AI 並保存 API → **只寫 API 字段**，外觀草稿仍保留在外觀 Form 內，且外觀 Tab 仍顯示 dirty |

### 6.3 切換 Tab

| 策略 | 規格 |
|------|------|
| 默認（首版） | **允許自由切換**；未保存草稿保留在各 Tab 的 Form 內存中 |
| 可選增強 | 切走時若當前 Tab dirty，`Modal.confirm`：繼續切換 / 先保存 / 取消（二期或首版若你要求可上） |
| 銷毀策略 | Tab 內容 **`destroyInactiveTabPane={false}`**（或等效保持掛載），避免切走丟草稿 |

### 6.4 保存本 Tab

1. 點擊「保存本頁設置」（文案也可「保存設置」，但語境是當前 Tab）  
2. 按鈕 loading + disabled  
3. **僅** `validateFields` 本 Tab 字段  
4. `updateSettings(subset)`  
5. 成功：toast「外觀設置已保存」/「AI 設置已保存」；清除 **該 Tab** dirty  
6. 失敗：toast 錯誤；保持 dirty  
7. 主題：若本 Tab 保存了 `theme` 且與 store 不同 → **優先熱更新**；否則提示後 reload  

### 6.5 重置本 Tab

- 僅 `setFieldsValue` 回 store 中對應 subset  
- 清除該 Tab dirty  
- **不影響**其他 Tab 的草稿  

### 6.6 API 測試

- 測試是 **即時操作**，不替代「保存」  
- 建議：測試成功可 toast；是否把 models 寫入 store：  
  - **方案 T1（推薦）**：測試成功即可寫入 `savedModels`（方便分析頁用），Key / provider / selectedModel 仍以用戶點「保存」為準  
  - **方案 T2**：一切 API 相關（含 models）都等保存  
- 默認文檔採用 **T1**：測通即緩存模型列表；密鑰與選中模型仍以保存為準（若測通後自動選了模型，應標記 AI Tab dirty，提醒用戶保存）

### 6.7 離開設置頁（路由）

- 若任一 Tab dirty：可選 `Modal` 提示「有未保存的設置」  
- 首版建議：**有任一 dirty 即攔截**，文案列出哪些 Tab 未保存  

### 6.8 關於 Tab

- 無保存欄  
- 檢查更新 / 立即更新行為保持現有 `useAppUpdate` + `runUpdateFlow`  

---

## 7. 組件拆分建議（實現時）

```
src/pages/Settings/
  index.tsx                      # 頁頭 + Tabs 殼；不統一大 Form
  components/
    AppearanceSettingsTab.tsx    # 自有 Form + 保存/重置 + 主題卡
    APISettingsTab.tsx           # 自有 Form + 保存/重置 + 測試
    AboutUpdateSettings.tsx      # 無 Form 保存（沿用/微調）
    ThemePreviewCards.tsx
    TabSaveBar.tsx               # 可複用：重置 + 保存（接收 dirty/loading/onSave/onReset）
    StyledComponents.tsx
  hooks/
  services/
```

每個可配置 Tab 對外可暴露：`onDirtyChange?: (dirty: boolean) => void`，供父級畫 Tab 角標。

---

## 8. 無障礙與桌面適配

- [ ] Tabs 可用鍵盤切換（antd 默認）  
- [ ] 每 Tab 內字段有可見 label  
- [ ] 保存 / 重置 / 測試 焦點順序合理  
- [ ] 保存欄不遮擋字段（內容區 `padding-bottom`）  
- [ ] 三主題對比度合格  
- [ ] 無 emoji 當圖標  

---

## 9. 驗收清單

### 信息架構

- [ ] 三個 Tabs：外觀與語言 / AI 服務 / 關於與更新  
- [ ] 外觀、AI 各自有保存（與重置）  
- [ ] 關於 Tab **沒有**保存按鈕  
- [ ] 主題為預覽卡  
- [ ] 文案繁簡統一  

### 分 Tab 保存（關鍵）

- [ ] 只改外觀並保存 → store 中 API 字段不變  
- [ ] 只改 API 並保存 → store 中 theme/language 不變  
- [ ] 外觀 dirty + 在 AI Tab 保存 → 外觀草稿仍在，外觀 Tab 仍 dirty  
- [ ] 重置外觀不影響 AI 草稿  
- [ ] AI 校驗失敗不影響外觀 Tab  
- [ ] Tab 標籤在對應 dirty 時有未保存指示  

### 交互回歸

- [ ] API 測試 loading / Alert  
- [ ] OpenRouter 模型列表與詳情  
- [ ] 檢查更新 / 立即更新不回歸  
- [ ] 保存 loading → 成功/失敗 toast  

---

## 10. 待你拍板的決策

| # | 決策 | 當前採納 |
|---|------|----------|
| 1 | 布局 | **Tabs（已定）** |
| 2 | 保存模型 | **每 Tab 獨立保存（已定）** |
| 3 | 文案語系 | **繁體中文統一** |
| 4 | 分析提示詞 | **不放進設置頁** |
| 5 | 主題保存後 | **優先熱更新、避免 reload** |
| 6 | 測通後 models | **T1：測通可寫 savedModels；Key/模型選擇仍要保存** |
| 7 | 切 Tab 時 dirty 攔截 | **首版允許自由切換並保留草稿**；路由離開可攔截 |
| 8 | 關於 Tab | **無保存欄** |

其餘無異議即可回覆「確認」開始改代碼。
