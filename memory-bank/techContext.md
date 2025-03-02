# 技術背景

本文檔詳細說明了專案的技術棧、開發環境和技術限制。

## 技術棧

### 核心框架
- **Electron**: 桌面應用程序框架
- **React**: UI 框架
- **TypeScript**: 編程語言
- **Node.js**: 運行時環境

### UI/UX
- **Ant Design (antd)**: UI 組件庫
- **antdesign/pro-components**: 增強型 UI 組件
- **Styled-components**: CSS-in-JS 樣式
- **Redux**: 全局狀態管理

### 核心工具
- **ExifTool**: 圖片元數據操作
- **OpenAI SDK**: API 測試功能
- **Node.js Core APIs**: 系統級操作

## 開發環境

### 構建工具
- **Vite**: 構建和開發工具
- **ESLint**: 代碼檢查
- **Prettier**: 代碼格式化

### 包管理
- **Yarn**: 依賴管理
- **npm**: 包註冊表

## 技術限制

### 安全性
- 安全的 IPC 通信
- 安全的文件系統操作
- 受保護的 API 密鑰管理
- 網絡狀態監控

### 性能
- 高效的批量處理
- 優化的元數據操作
- 響應式 UI 更新

### 兼容性
- 跨平台支持
- 文件格式兼容性
- 網絡連接處理

## 依賴項

### 核心依賴
- electron
- react
- typescript
- styled-components
- antd
- @ant-design/pro-components
- redux

### 開發依賴
- vite
- eslint
- prettier
- typescript compiler
