# LLM 圖片分析 · 設計資料夾

> 狀態：**已確認並實現**（UI 改版）  
> 依據：`ui-ux-pro-max` Skill  
> 現狀代碼：`src/pages/AnalyzeByImage/`  
> 菜單文案：LLM 圖片分析  
> **約束**：分析提示詞的**預設字串與用戶已保存內容**不因本設計改版而修改（僅 UI 摺疊/編輯殼層）

本資料夾彙整「LLM 圖片分析」頁重新設計的全部產物。請依下列順序閱讀，並在瀏覽器打開原型確認視覺與交互。

---

## 文件索引

| 文件 | 說明 | 建議 |
|------|------|------|
| [ui-ux-review.md](./ui-ux-review.md) | **主設計文檔**：現狀問題、信息架構、交互規格、就緒檢查 | 必讀 |
| [design-system.md](./design-system.md) | ui-ux-pro-max 輸出摘要 + 本項目 token 映射 | 必讀 |
| [ui-flow.mermaid](./ui-flow.mermaid) | 信息架構與用戶流程圖 | 可選 |
| [ui-prototype.html](./ui-prototype.html) | **可交互 HTML 原型**（場景切換） | 必看 |
| [implementation-plan.md](./implementation-plan.md) | 確認後的實現分階段計劃（尚未執行） | 確認後參考 |

---

## 快速預覽

```bash
open docs/ImageAnalysis/ui-prototype.html
```

原型場景：

1. 未配置 API  
2. 就緒（少量 · **列表**）  
3. 分析中（分項進度 · **列表**）  
4. 結果（成功 + 失敗混合）  
5. 提示詞展開編輯  
6. **就緒 · 大量圖片**（始終列表 + 限高滾動 + 搜尋 / 虛擬列表示意）  

---

## 設計結論（一句話）

將現有「提示詞 + 按鈕 + 文本上傳列表 + 全局 Spin + 結果卡片堆疊」改為 **就緒狀態清晰、隊列始終列表（限高/可虛擬化）、逐圖進度、結果可掃讀** 的批量分析工作台；**不硬套 Skill teal 色板**，映射現有主題 token；提示詞改為 **默認可折疊**，主 CTA 固定在底部操作欄。

---

## 確認後下一步

你回覆「確認 / OK / 可以改代碼」後，按 `implementation-plan.md` 開始改 `src/pages/AnalyzeByImage/`，**在此之前不會改應用代碼**。
