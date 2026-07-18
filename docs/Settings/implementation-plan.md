# 設置頁 · 實現計劃（確認設計後執行）

> **現在不要執行。** 等你對 `ui-ux-review.md` + 原型確認後，再按本計劃改代碼。  
> **已定**：antd **Tabs** + **每配置 Tab 獨立保存**。

---

## 階段 0 · 準備

- [ ] 用戶確認設計文檔與原型
- [ ] 通讀：`index.tsx`、`APISettings`、`BasicSettings`、`AboutUpdateSettings`、`SettingsStore`
- [ ] 明確字段子集：
  - Appearance: `language`, `theme`
  - API: `apiProvider`, `openaiApiKey`, `openrouterApiKey`, `selectedModel`（+ 可選 `savedModels`, `lastModelUpdateTime`）

---

## 階段 1 · Tabs 殼層

**目標**：用 antd `Tabs` 替換 Collapse；無統一大 Form。

1. 重寫 `Settings/index.tsx`：頁頭 + `Tabs`（`items` 或 `TabPane`）
2. `destroyInactiveTabPane={false}`，保留各 Tab 草稿
3. Tab 標籤支持 dirty 小圓點（由子 Tab 回調 `onDirtyChange`）
4. 暫接舊內容組件，先跑通切換

**驗收**：三 Tab 可切；切走再回來字段不丟。

---

## 階段 2 · 外觀 Tab 獨立 Form + 保存

1. `AppearanceSettingsTab`：自有 `Form.useForm()`
2. 初始值從 `settings` 的 subset A 灌入
3. `ThemePreviewCards`
4. 底部 `TabSaveBar`：重置 / 保存
5. 保存：`validateFields` → `updateSettings({ language, theme })` → 清 dirty
6. 重置：回填 store subset A
7. 統一繁體文案；去掉重複 Divider

**驗收**：只保存外觀時 API 字段不變。

---

## 階段 3 · AI Tab 獨立 Form + 保存

1. `APISettingsTab`：自有 Form + 現有測試 hooks
2. Segmented 提供者、就緒 Badge、Password + 測試
3. 保存：僅 subset B；`validateFields` 只含 API 字段
4. OpenRouter required 只在本 Tab 保存時生效
5. 放寬 OpenAI key 校驗
6. 測試成功（T1）：可寫 `savedModels`；若自動選模型 → 標 dirty 提示保存
7. 自有 `TabSaveBar`

**驗收**：

- 只保存 API 時 theme/language 不變  
- 外觀有草稿時，保存 API 不清除外觀 dirty  

---

## 階段 4 · 關於 Tab

1. 無 Form、無保存欄
2. 文案「關於與更新」
3. 回歸 `useAppUpdate` / `runUpdateFlow`

---

## 階段 5 · Dirty 指示與路由攔截

1. 父級收集 `dirtyAppearance` / `dirtyApi`，畫在 Tab label 上
2. （建議）離開 `/settings` 時若任一 dirty → Modal
3. 清理多餘 `console.log`

---

## 階段 6 · 主題熱更新

1. 確認 `ConfigProvider` 訂閱 `settings.theme`
2. 外觀 Tab 保存後優先去掉 `window.location.reload()`
3. 三主題驗收

---

## 階段 7 · 驗收與收尾

- [ ] 對照 `ui-ux-review.md` §9，尤其「分 Tab 保存」用例
- [ ] 手動：交錯改兩 Tab、分別保存/重置
- [ ] `npm test`
- [ ] 文檔狀態改為已落地（可選）

---

## 風險與注意

| 風險 | 緩解 |
|------|------|
| 單 Form 導致保存串味 | **每 Tab 獨立 Form** |
| `updateSettings` 合併 partial 是否正確 | 確認 store 是 merge 而非整對象覆蓋 |
| 測試寫 models 與保存 Key 不同步 | T1 文檔化；選中模型未保存時 dirty 提示 |
| Tab 卸載丟草稿 | `destroyInactiveTabPane={false}` |
| 更新流程回歸 | 不改更新協議 |

---

## 明確不改

- 分析提示詞搬遷
- 新 UI 庫
- 全頁統一保存
- Skill teal 硬編碼色
