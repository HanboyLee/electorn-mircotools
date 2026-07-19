# LLM 圖片分析 · 實現計劃（待設計確認後執行）

> 狀態：**已執行（UI 改版）**  
> 前置：用戶已確認設計；**不修改** `initialSettings.analysisPrompt` 預設內容  
> 範圍：`src/pages/AnalyzeByImage/`（不改設置頁 UI；提示詞僅 UI 摺疊）

---

## 階段 0 · 準備

- [ ] 對照 `ui-ux-review.md` 驗收標準再確認無產品分歧  
- [ ] 固定文案語言：頁內 **繁體**（與菜單「LLM 圖片分析」一致）  
- [ ] Provider 就緒工具函數抽到可測模塊（如 `logic/apiReady.ts`）

---

## 階段 1 · 就緒與頁面骨架

- [ ] 頁眉：標題 + 副標題 + Provider 徽章  
- [ ] API 未就緒 Alert（區分 OpenAI / OpenRouter / 缺模型）  
- [ ] 主 CTA `disabled` 條件與 `handleAnalyze` 校驗對齊  
- [ ] 底部固定操作欄容器（清除 / 導出 / 開始分析）

---

## 階段 2 · 提示詞摺疊

- [ ] 重構 `PromptEditor`：默認摺疊一行摘要  
- [ ] 展開編輯：保存 / 取消 / 恢復默認  
- [ ] 分析中只讀  
- [ ] 沿用 `useSettingsStore.analysisPrompt`

---

## 階段 3 · 圖片隊列

- [ ] 拖放上傳區 + **始終列表**（行：小縮略圖 + 文件名 + 狀態 + 移除；無網格）  
- [ ] 隊列容器 **max-height + 區內滾動**（大量圖不撐爆頁面）  
- [ ] `N ≥ 25` 文件名搜尋；`N ≥ 50` 虛擬列表 + 懶縮略圖  
- [ ] 單項狀態 Tag（待分析 / 分析中 / 成功 / 失敗）  
- [ ] 去重策略與 warning  
- [ ] 清除二次確認（Modal）  
- [ ] 合併入隊策略（按設計 §5.4；若暫緩須明示清空結果）

---

## 階段 4 · 分析進度與結果

- [ ] 逐張更新進度 `completed/total` + 當前文件名  
- [ ] 結束摘要統計卡  
- [ ] 結果 `Table`（預覽 / 標題 / 描述 / 關鍵詞 / 狀態 / 錯誤）  
- [ ] 導出 CSV 僅統計成功項；toast 反饋  
- [ ] 清理多餘 `console.log`

---

## 階段 5 · 打磨與驗證

- [ ] 主題 token（light/dark/blue）目測  
- [ ] 鍵盤 Tab 順序與 focus  
- [ ] Windows 路徑/文件名邊界（長文件名省略）  
- [ ] 本地手動：OpenAI 路徑、OpenRouter 路徑、無網提示（若有）  
- [ ] 單元測試：就緒判斷、進度計數、CSV 導出過濾（`__tests__/`，不入庫）

---

## 非目標（本計劃不寫）

- 頁內配置 API 密鑰  
- 自動寫入 Exif  
- 文件夾樹 / 磁碟遞歸掃描入隊  
- 「僅分析當前篩選結果」勾選（二期）  
- 失敗單項重試（可列二期）

---

## 建議提交信息（實現完成後）

```text
feat(image-analysis): redesign LLM image analysis workspace UI
```
