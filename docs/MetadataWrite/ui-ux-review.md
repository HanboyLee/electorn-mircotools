# 元數據寫入 · UI/UX 審查與改版方向

> 設計依據：`ui-ux-pro-max` Skill（design-system + UX domain）  
> 現狀代碼：`src/pages/CsvValidator/`  
> 產物：本審查文檔 + `ui-flow.mermaid` + **可瀏覽器打開的** `ui-prototype.html`

---

## 1. 功能與用戶目標

| 項 | 內容 |
|----|------|
| 頁面名稱 | 元數據寫入（菜單）/ 元數據寫入圖片（頁內標題） |
| 核心任務 | 將 CSV 中的 Title / Description / Keywords **批量寫入** 目錄內對應圖片（ExifTool） |
| 主流程 | 選目錄 → 上傳 CSV → 校驗對齊 → 寫入 → 查看結果 |
| 用戶 | 處理批量圖庫元數據的桌面用戶（Electron） |
| 技術棧約束 | **antd + styled-components**；沿用現有 light/dark/blue 主題 token |

---

## 2. 現狀 UI 問題（對照 skill 規則）

| 嚴重度 | 問題 | 對應 UX 規則 | 現狀表現 |
|--------|------|--------------|----------|
| **—** | ~~無步驟感~~ | — | **用戶確認不需要 Steps**；熟練用戶已知流程 |
| **高** | 主操作反饋弱 | Submit Feedback / Success Feedback | 寫入成功幾乎無結果摘要；失敗只堆 Alert |
| **高** | Loading 不明確 | Loading Buttons / Loading States | `processing` 時 Progress 百分比幾乎不推進 |
| **高** | 禁用原因不可見 | Disabled state clarity | 「開始處理」灰掉，但不知缺目錄還是 CSV 無效 |
| **中** | 格式說明常駐占位 | Progressive disclosure | `CsvRequirements` 永久展開，擠壓主操作區 |
| **中** | 目錄選擇信息密度低 | Forms & Feedback | 路徑純文本，無卡片/狀態/文件數徽章 |
| **中** | 缺少匹配摘要 | Feedback | 不展示「CSV 行數 / 目錄圖片 / 可匹配 / 缺失」 |
| **中** | CSV 預覽難發現 | Progressive disclosure | `onPreview` 未接入；預覽藏在條件組件裡 |
| **中** | 錯誤列表扁平 | Error clarity | 全部 error Alert，不區分目錄/CSV/文件/寫入失敗 |
| **低** | 容器 `height: 100vh` | Layout | 與 MainLayout 內邊距疊加，易出現多餘滾動 |

另有邏輯層問題（改 UI 時應一併修）：`handleCsvUpload` 在有校驗錯誤時仍設 `isValid: true`。

---

## 3. ui-ux-pro-max 設計系統摘要

查詢：`desktop utility productivity tool batch metadata image processing workflow`  
Dials：`density=7`、`motion=3`（桌面工具偏緊湊、動效克制）

| 維度 | 建議 | 本項目落地方式 |
|------|------|----------------|
| Pattern | 批量工具 + 明確 CTA | **不展示 Steps**（熟練用戶無需導航提示）+ 底部 **固定操作欄** |
| Style | Micro-interactions | hover 150–300ms、按鈕 loading、成功勾選動畫 |
| Typography | Inter / 技術向無襯線 | 沿用系統/antd 字體即可，不強制引入 Google Fonts |
| Color | Skill 給出 teal 板 | **不硬套新色板**；映射到現有 `token.colorPrimary` / success / error |
| 禁止 | 複雜 onboarding、慢動畫 | 無引導輪播；motion ≤ 300ms |
| Checklist | 無 emoji 圖標、可點區域有 cursor、對比度 ≥4.5:1 | 使用 `@ant-design/icons` |

### UX 規則落地清單

- [x] ~~多步驟進度指示~~ **已否決**：用戶已知流程，不顯示 Steps 條
- [x] 主按鈕 loading + disable，防重複提交
- [x] 操作後成功/失敗明確反饋
- [x] 錯誤就近分組展示
- [x] 格式要求可折疊（默認收起或次要）
- [x] 結果表/統計卡片可掃讀
- [x] 桌面寬度優先，表格可橫向滾動

---

## 4. 改版信息架構

```
┌─────────────────────────────────────────────────────────────┐
│ 頁眉：標題 + 一句話說明 + （可折疊）CSV 格式提示              │
│ （不顯示 Steps 步驟條 —— 用戶已知操作，避免多餘引導）          │
├──────────────────────────────┬──────────────────────────────┤
│ 左：主操作區                  │ 右：就緒狀態 / 匹配統計         │
│ （目錄卡片 / 上傳區 / 預覽表） │ （完成條件 checklist）         │
├──────────────────────────────┴──────────────────────────────┤
│ 錯誤面板（按類型分組，可折疊詳情）                            │
├─────────────────────────────────────────────────────────────┤
│ 底部固定欄：[重置]              主 CTA「開始寫入元數據」      │
└─────────────────────────────────────────────────────────────┘
```

### 內部流程（僅狀態機，不渲染為 UI）

| 階段 | 完成條件 | 主 UI |
|------|----------|-------|
| 選擇目錄 | 已選路徑且媒體數 > 0 | 目錄卡片 + 選擇按鈕 + 文件數 Tag |
| 上傳 CSV | 解析成功且表頭合法 | 拖放上傳區 + 文件名 + 移除 |
| 校驗預覽 | 無阻塞錯誤（缺失文件可警告） | 統計卡 + 表格預覽 + 錯誤分組 |
| 寫入結果 | 處理結束 | 成功/失敗計數 + 失敗列表 + 可再處理 |

> **決策（用戶反饋）**：不展示頂部 Steps。頁面一次展示目錄 + CSV + 預覽/統計，用就緒檢查與主 CTA 狀態表達可否寫入。

---

## 5. 關鍵界面元素

### 5.1 就緒檢查（Ready Checklist）

右側或底部展示：

- ✓ / ○ 已選擇圖片目錄（N 個媒體）
- ✓ / ○ 已上傳合法 CSV（M 行）
- ✓ / ○ 無阻塞錯誤（缺失文件數 = 0 或用戶確認跳過）

主 CTA 僅在就緒時可點；未就緒時 Tooltip 說明差哪一項。

### 5.2 匹配統計（Summary Stats）

| 指標 | 含義 |
|------|------|
| 目錄媒體 | 掃描到的圖片數 |
| CSV 行數 | 有效數據行 |
| 可匹配 | Filename 在目錄中存在 |
| 缺失 | CSV 有、目錄無 |
| 多餘（可選） | 目錄有、CSV 無 |

用 4 個小 Statistic / 色塊：成功綠、警告橙、錯誤紅。

### 5.3 結果頁

- 成功：`Result` 成功態 + 「成功 X / 失敗 Y」
- 失敗行可表格列出 Filename + error
- 提供「再寫一次」「重置全部」

### 5.4 空狀態

首次進入：居中插畫/圖標 + 「從選擇圖片目錄開始」主按鈕 + 次要「查看 CSV 格式」。

---

## 6. 狀態機（摘要）

詳見 `ui-flow.mermaid`。

主要狀態：`idle` → `dir_ready` → `csv_ready` → `validated` → `writing` → `done | partial_fail | fail`  
任意非 writing 可 `reset` 回 idle。

---

## 7. 與現有組件映射（實作時）

| 原型區塊 | 現有/新建 |
|----------|-----------|
| PageHeader（無 Steps） | 調整 `CsvValidator.tsx` |
| DirectoryCard | 替換裸 Button + 路徑文本 |
| CsvDropzone | 重構 `CsvUpload` |
| FormatHelp Collapse | 重構 `CsvRequirements` |
| StatsRow + PreviewTable | 新建；預覽不再只靠 Modal |
| ErrorPanel | 重構 `ValidationErrorsDisplay` 分組 |
| StickyActionBar | 新建 |
| ResultPanel | 新建（寫入後） |

**不改**：IPC、ExifTool 寫入邏輯、路由 path。

---

## 8. 原型如何查看

1. 用瀏覽器打開：  
   `docs/MetadataWrite/ui-prototype.html`
2. 頁內可切換 **空狀態 / 就緒可寫入 / 寫入中 / 結果** 四種場景，對比布局。
3. 本原型為 **靜態示意**（HTML/CSS），實作仍用 antd + styled-components。

---

## 9. 建議實作優先級

| P0 | 底部主 CTA + 就緒條件提示（無 Steps） |
|----|-----------------------------------|
| P0 | 目錄卡片 + 匹配統計 |
| P0 | 寫入結果摘要（成功/失敗） |
| P1 | CSV 行內預覽表 + 格式 Collapse |
| P1 | 錯誤按類型分組 |
| P2 | 空狀態插圖、微動效 |
| P2 | 修復 `isValid` 在有錯時仍為 true |

---

## 10. 待你確認

1. ~~步驟交互~~ **已定**：不顯示 Steps。  
2. CSV 中「缺失文件」是 **阻塞不可寫** 還是 **警告可跳過**？  
3. 是否需要「僅寫入匹配成功的行」選項？  
4. 原型視覺 OK 後，是否進入正式頁面實作？
