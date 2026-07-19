# 文件打包 · 設計資料夾

> 狀態：**已確認並實現**（UI 改版）  
> 依據：`ui-ux-pro-max` Skill  
> 現狀代碼：`src/pages/FilePackaging/`  
> 主進程服務：`src/services/file-packaging/`（經 `src/services` 總出口）  
> 歷史需求文檔（舊）：`docs/ZipPackaging/`（本資料夾為 **UI 改版** 準繩；產品規則衝突時以本夾 + 現網 ZipService 行為為準）

本資料夾彙整「文件打包」頁重新設計的全部產物。

---

## 文件索引

| 文件 | 說明 | 建議 |
|------|------|------|
| [ui-ux-review.md](./ui-ux-review.md) | **主設計文檔**：現狀問題、信息架構、交互規格 | 必讀 |
| [design-system.md](./design-system.md) | ui-ux-pro-max 輸出摘要 + 本項目 token 映射 | 必讀 |
| [ui-flow.mermaid](./ui-flow.mermaid) | 用戶流程圖 | 可選 |
| [ui-prototype.html](./ui-prototype.html) | **可交互 HTML 原型**（場景切換） | 必看 |
| [implementation-plan.md](./implementation-plan.md) | 確認後的實現分階段計劃 | 確認後參考 |

---

## 快速預覽

```bash
open docs/FilePackaging/ui-prototype.html
```

原型場景：

1. 空狀態（未選目錄）  
2. 已掃描 · 就緒（一覽表 + 唯一主 CTA「全部打包」）  
3. 打包中（n/total 真實進度）  
4. 結果摘要（成功 + 失敗；打開目錄在**工作目錄**區塊）  
5. 掃描無匹配（空結果引導）  

---

## 設計結論（一句話）

將現有「頂部多個主按鈕並排 + 假進度條 + 結果僅 Modal」改為 **目錄卡片 + 就緒檢查 + 文件組一覽表（只讀預覽）+ 真實分組進度 + 結果面板 + 底部固定操作欄**。

**已採納（用戶反饋）**：工作流為 **統一選目錄 → 統一全部打包**；**不做**單組打包、**不做**勾選後「打包已選」。表僅用於掃讀與詳情，不承擔選擇打包範圍。

打包規則不變（同名多擴展名 → 源目錄下 `{name}.zip`）；**不恢復**打包歷史頁；色板映射現有主題 token。

### 業務規則（改版不改）

- 掃描擴展名：`.ai` / `.eps` / `.jpg` / `.png`（與 `ZipService.scanDirectory` 一致）  
- 按**基本名**分組；ZIP 輸出在**已選目錄**，檔名 `{組名}.zip`  
- IPC：`FileIPC.SELECT_DIRECTORY`、`ZipIPC.SCAN_DIRECTORY` / `CREATE_ZIP` / `OPEN_ITEM`  

---

## 實現說明

已按本資料夾設計改版 `src/pages/FilePackaging/`：

- 工作目錄：選擇目錄 + 打開打包目錄（無重新掃描）  
- 唯一打包入口：全部打包 + 真實組進度  
- 結果區僅摘要列表；ZIP 輸出在源目錄  
