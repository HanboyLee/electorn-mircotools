# 設置頁面 · 設計資料夾

> 狀態：**待確認** — 確認設計後再進入代碼改版  
> 依據：`ui-ux-pro-max` Skill  
> 現狀代碼：`src/pages/Settings/`  
> **已採納**：頂部 **Tabs** + **每個 Tab 獨立保存**

本資料夾彙整「設置」頁重新設計的全部產物。請依下列順序閱讀，並在瀏覽器打開原型確認視覺與交互。

---

## 文件索引

| 文件 | 說明 | 建議 |
|------|------|------|
| [ui-ux-review.md](./ui-ux-review.md) | **主設計文檔**：現狀問題、Tabs 架構、**分 Tab 獨立保存**、交互規格 | 必讀 |
| [design-system.md](./design-system.md) | ui-ux-pro-max 輸出摘要 + 本項目 token 映射 | 必讀 |
| [ui-flow.mermaid](./ui-flow.mermaid) | 信息架構與用戶流程圖 | 可選 |
| [ui-prototype.html](./ui-prototype.html) | **可交互 HTML 原型**（場景切換） | 必看 |
| [implementation-plan.md](./implementation-plan.md) | 確認後的實現分階段計劃（尚未執行） | 確認後參考 |

---

## 快速預覽

```bash
open docs/Settings/ui-prototype.html
```

原型場景：

1. Tab · 外觀與語言  
2. Tab · AI 服務（未配置）  
3. Tab · AI 服務（已連通）  
4. Tab · 關於與更新（無保存欄，僅操作）  
5. 當前 Tab 有未保存更改  

---

## 設計結論（一句話）

將現有「單 Card + 全開 Collapse + 頁底一次保存」改為 **antd Tabs 三分區**，且 **「外觀與語言」「AI 服務」各自擁有獨立的重置 / 保存**；「關於與更新」為操作型分頁（檢查更新 / 安裝），**不提供保存按鈕**。頁頭**僅標題「設置」**，不加「分頁管理…單獨保存」類說明。不硬套 Skill teal 色板，映射現有主題 token。

---

## 確認後下一步

你回覆「確認 / OK / 可以改代碼」後，按 `implementation-plan.md` 開始改 `src/pages/Settings/`，**在此之前不會改應用代碼**。
