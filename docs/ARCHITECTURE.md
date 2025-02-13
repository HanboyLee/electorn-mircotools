# 系統架構設計文檔

## 技術棧

- Electron
- React
- TypeScript
- Styled-components
- ExifTool
- antd / antdesign/pro-components
- Redux (用於全局狀態管理)
- OpenAI SDK (僅作為設置頁面 API 測試功能)
- Node.js 核心 API

## 系統架構

### 主要模塊

1. **主進程 (Main Process)**  
   - 負責與操作系統交互（例如：文件系統、網絡檢測）  
   - 管理應用程序生命週期  
   - 處理核心服務（如 EXIF 元數據提取、CSV 生成、文件操作等）  
   - 初始化 IPC 通信服務

2. **渲染進程 (Renderer Process)**  
   - 使用 React 構建現代化用戶界面  
   - 處理用戶交互及反饋  
   - 根據狀態顯示數據（包括文件操作結果、網絡狀態、OpenAI API 測試結果等）

3. **預加載/IPC 層 (Preload / IPC)**  
   - 安全地暴露核心 API 給渲染進程  
   - 定義 IPC 通信規範和數據傳遞橋樑

### 核心功能模塊

1. **EXIF 解析器**
   - 位置：`/src/core/exif/`
   - 功能：利用 ExifTool 解析圖片元數據
   - 封裝底層調用，輸出標準化數據

2. **CSV 生成器**
   - 位置：`/src/core/csv/`
   - 功能：匯出及生成 CSV 文件
   - 支持自定義字段映射與批量處理

3. **設定管理與 API 測試**
   - 位置：`/src/hooks/SettingsStore/` 與 `src/services/openai.ts`
   - 功能：管理用戶偏好配置，包括 OpenAI API 測試功能
   - 通過設置頁面進行 API 連接測試，並返回錯誤提示

4. **網絡狀態監控**
   - 位置：`/src/services/networkService.ts` 與 `/src/components/NetworkStatus/`
   - 功能：通過定時檢測 Google 可訪問性狀態，並在側邊欄展示實時連接狀態
   - 提供詳細的響應時間和錯誤提示

## 數據流與交互流程

1. 用戶在渲染進程中執行操作（如選擇圖片、點擊測試 API 連接或觸發網絡檢測）  
2. 通過 IPC 將信息傳送至主進程  
3. 主進程調用對應核心服務（ExifTool、文件操作、網絡檢測、OpenAI 測試等）  
4. 處理結果反饋至渲染進程  
5. 渲染進程更新界面展示最新狀態與反饋

## 設計決策

- 採用 TypeScript 保證類型安全與代碼提示
- 使用 React Hooks 與 Redux 分離 UI 狀態和業務邏輯
- 使用 Styled-components 完成主題化和動態樣式設置
- 模塊化設計，確保各核心功能清晰分離且易於擴展
