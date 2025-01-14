# CsvValidator 功能執行步驟文檔

## 一、功能概述
CsvValidator 是一個用於將 CSV 文件中的元數據寫入到指定目錄下對應圖片的組件。

## 二、狀態管理
使用 CsvValidatorState 管理以下狀態：
- `isValid`: CSV 內容是否有效
- `fileName`: CSV 文件名
- `imageDirectory`: 圖片目錄路徑
- `validationErrors`: 驗證錯誤信息
- `uploadProgress`: CSV 上傳進度
- `csvData`: CSV 數據內容
- `headers`: CSV 表頭
- `processing`: 是否正在處理
- `progress`: 處理進度

## 三、功能流程

### 1. 目錄選擇
- 用戶選擇包含圖片的目錄
- 驗證目錄是否存在
- 掃描目錄中的圖片文件（支持 .jpg、.jpeg、.png）

### 2. CSV 文件處理
- 上傳 CSV 文件
- 解析 CSV 內容
- 驗證 CSV 格式和必需字段（filename、title、description、keywords）
- 驗證 CSV 中的 filename 是否在選定目錄中存在
- 更新驗證狀態和錯誤信息

### 3. 元數據處理
- 驗證所有必要條件（目錄已選、CSV 有效）
- 批量處理元數據寫入
- 在原目錄中修改圖片文件

## 四、需要實現的接口

### 1. 前端接口
```typescript
// 1. 目錄選擇
handleDirectorySelect()

// 2. CSV 相關
handleCsvUpload(data: string[][], headers: string[])
handleError(error: Error)
handleProgress(progress: number)

// 3. 處理控制
handleStartProcessing()
handleReset()
```

### 2. 後端接口（IPC）
```typescript
// FileService
selectDirectory(): Promise<string>
validateImageDirectory(dir: string): Promise<string[]>

// MetadataService
writeMetadata(imageDir: string, csvData: CsvMetadataRow[]): Promise<WriteMetadataResult[]>
```

## 五、執行順序

1. **準備階段**
   - 選擇圖片目錄
   - 掃描目錄中的圖片
   - 上傳 CSV 文件
   - 驗證 CSV 內容

2. **驗證階段**
   - 檢查 CSV 數據有效性
   - 檢查 filename 是否與目錄中的圖片對應
   - 驗證圖片格式

3. **處理階段**
   - 整理 CSV 數據
   - 調用 writeMetadata 接口
   - 處理返回結果
   - 更新處理進度
   - 顯示處理結果

4. **完成階段**
   - 顯示成功/失敗信息
   - 提供重置選項

## 六、錯誤處理
- 目錄不存在或無訪問權限
- 目錄中無圖片文件
- CSV 格式錯誤
- CSV 中的 filename 在目錄中找不到對應圖片
- 圖片格式不支持
- 元數據寫入失敗

## 七、UI 交互
1. 目錄選擇按鈕和路徑顯示
2. CSV 上傳區域
3. 驗證錯誤顯示
4. 進度顯示
5. 操作按鈕（開始處理、重置）
6. 處理結果顯示

## 八、注意事項
1. 確保目錄有讀寫權限
2. CSV 文件中的 filename 必須與目錄中的圖片文件名完全匹配
3. 批量處理時要顯示進度
4. 提供清晰的錯誤提示
5. 支持中斷和重置操作
6. 處理前進行完整性驗證