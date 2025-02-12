# 系統架構設計文檔

## 技術棧

- Electron
- React
- TypeScript
- Styled-components
- ExifTool
- antd
- antdesign/pro-components
-

## 系統架構

### 主要模塊

1. **主進程 (Main Process)**

   - 負責與操作系統交互
   - 管理應用程序生命週期
   - 處理文件系統操作

2. **渲染進程 (Renderer Process)**

   - 使用 React 構建用戶界面
   - 處理用戶交互
   - 顯示數據和結果

3. **IPC 通信層**
   - 主進程和渲染進程之間的通信橋樑
   - 處理異步操作和事件

### 核心功能模塊

1. **EXIF 解析器**

   - 位置：`/src/core/exif/`
   - 功能：解析圖片元數據
   - 使用 ExifTool 進行底層操作

2. **CSV 生成器**

   - 位置：`/src/core/csv/`
   - 功能：生成和導出 CSV 文件
   - 支持自定義字段映射

3. **設置管理**
   - 位置：`/src/hooks/SettingsStore/`
   - 功能：管理用戶偏好和應用配置
   - 使用持久化存儲

## 數據流

1. 用戶選擇圖片文件
2. 通過 IPC 發送到主進程
3. ExifTool 解析元數據
4. 返回解析結果到渲染進程
5. 顯示結果或生成 CSV

## 設計決策

1. 使用 TypeScript 確保類型安全
2. 採用 React Hooks 管理狀態
3. 使用 Styled-components 實現主題化
4. 實現模塊化設計，提高代碼復用性
