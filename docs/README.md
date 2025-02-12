# Electron 應用開發指南

## 目錄
1. [完整開發流程](#完整開發流程)
2. [後端開發](#後端開發)
3. [前端開發](#前端開發)
4. [開發規範](#開發規範)
5. [最佳實踐](#最佳實踐)

## 完整開發流程

### 1. 創建新功能的完整流程

以創建文件處理功能為例，完整流程如下：

#### 1.1 定義 API 通道
```typescript
// src/constants/channels.ts
export const FileChannels = {
  READ: 'file:read',
  WRITE: 'file:write',
  EXISTS: 'file:exists'
} as const;
```

#### 1.2 定義類型
```typescript
// src/types/services.ts
export type APIChannel = typeof FileChannels[keyof typeof FileChannels];

// API 方法類型定義
export type APIMethodMap = {
  [FileChannels.READ]: (filePath: string) => Promise<string>;
  [FileChannels.WRITE]: (filePath: string, content: string) => Promise<void>;
  [FileChannels.EXISTS]: (filePath: string) => Promise<boolean>;
};

// 導出給前端使用的 API 類型
export type ElectronAPI = APIMethodMap;
```

#### 1.3 實現後端服務
```typescript
// src/services/fileService.ts
import { promises as fs } from 'fs';
import { BaseService } from './baseService';
import { FileChannels } from '../constants/channels';

export class FileService extends BaseService {
  protected getHandlers() {
    return [
      {
        channel: FileChannels.READ,
        handler: this.readFile.bind(this)
      },
      {
        channel: FileChannels.WRITE,
        handler: this.writeFile.bind(this)
      },
      {
        channel: FileChannels.EXISTS,
        handler: this.fileExists.bind(this)
      }
    ];
  }

  private async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf8');
  }

  private async writeFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content, 'utf8');
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
```

#### 1.4 在前端定義 Hooks
```typescript
// src/hooks/useFileService.ts
import { useState } from 'react';
import { FileChannels } from '../constants/channels';

export const useFileService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const readFile = async (filePath: string) => {
    setLoading(true);
    setError(null);
    try {
      const content = await window.electronAPI[FileChannels.READ](filePath);
      return content;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const writeFile = async (filePath: string, content: string) => {
    setLoading(true);
    setError(null);
    try {
      await window.electronAPI[FileChannels.WRITE](filePath, content);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    readFile,
    writeFile,
    loading,
    error
  };
};
```

#### 1.5 在前端組件中使用
```typescript
// src/components/FileEditor.tsx
import React, { useState } from 'react';
import { useFileService } from '../hooks/useFileService';

export const FileEditor: React.FC = () => {
  const [content, setContent] = useState('');
  const { readFile, writeFile, loading, error } = useFileService();

  const handleFileRead = async () => {
    try {
      const filePath = '/path/to/file.txt';
      const fileContent = await readFile(filePath);
      setContent(fileContent);
    } catch (err) {
      console.error('Failed to read file:', err);
    }
  };

  const handleFileSave = async () => {
    try {
      const filePath = '/path/to/file.txt';
      await writeFile(filePath, content);
      console.log('File saved successfully');
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={handleFileRead}>讀取文件</button>
      <button onClick={handleFileSave}>保存文件</button>
    </div>
  );
};
```

### 2. API 使用最佳實踐

#### 2.1 使用 Custom Hooks
- 將 API 調用邏輯封裝在 hooks 中
- 統一處理 loading 和 error 狀態
- 提供類型安全的接口

#### 2.2 錯誤處理
```typescript
// src/hooks/useErrorHandler.ts
export const useErrorHandler = () => {
  const handleError = (error: Error) => {
    if (error instanceof ServiceError) {
      // 處理特定的服務錯誤
      switch (error.code) {
        case 'FILE_NOT_FOUND':
          // 處理文件不存在錯誤
          break;
        case 'PERMISSION_DENIED':
          // 處理權限錯誤
          break;
        default:
          // 處理其他錯誤
      }
    } else {
      // 處理一般錯誤
      console.error('Unexpected error:', error);
    }
  };

  return { handleError };
};
```

#### 2.3 狀態管理
```typescript
// src/store/fileSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FileState {
  content: string;
  path: string | null;
  isDirty: boolean;
}

const fileSlice = createSlice({
  name: 'file',
  initialState: {
    content: '',
    path: null,
    isDirty: false
  } as FileState,
  reducers: {
    setContent: (state, action: PayloadAction<string>) => {
      state.content = action.payload;
      state.isDirty = true;
    },
    setPath: (state, action: PayloadAction<string>) => {
      state.path = action.payload;
    },
    clearDirty: (state) => {
      state.isDirty = false;
    }
  }
});
```

### 3. 開發流程檢查清單

#### 3.1 後端開發
- [ ] 在 channels.ts 定義新的通道常量
- [ ] 在 types/services.ts 定義 API 類型
- [ ] 創建或更新服務類
- [ ] 實現錯誤處理
- [ ] 添加日誌記錄
- [ ] 編寫單元測試

#### 3.2 前端開發
- [ ] 創建 Custom Hook 封裝 API 調用
- [ ] 實現錯誤處理
- [ ] 添加 loading 狀態處理
- [ ] 在組件中使用 Hook
- [ ] 添加必要的 UI 反饋
- [ ] 編寫單元測試

## 開發規範

### 命名規範

1. **文件命名**：
   - 使用 camelCase：`fileService.ts`
   - 類型定義文件：`types.ts`
   - 常量文件：`constants.ts`

2. **類命名**：
   - 使用 PascalCase：`class FileService`
   - 服務類添加 Service 後綴：`MetadataService`

3. **接口命名**：
   - 使用 I 前綴：`interface IFileAPI`
   - 類型使用 T 前綴：`type TServiceHandler`

4. **常量命名**：
   - 使用大寫蛇形：`FILE_READ`
   - 分組使用對象：`FileChannels.READ`

### 代碼風格

1. **縮進**：
   - 使用 2 空格縮進
   - 不使用 Tab

2. **分號**：
   - 語句結尾必須使用分號

3. **引號**：
   - 優先使用單引號
   - JSX 中使用雙引號

4. **註釋**：
   - 使用 JSDoc 風格
   - 每個服務類和重要方法都要有註釋

## 最佳實踐

### 1. API 調用
- 使用 Custom Hooks 封裝 API 邏輯
- 統一處理 loading 和 error 狀態
- 使用 TypeScript 類型檢查
- 實現適當的錯誤處理

### 2. 狀態管理
- 使用 Redux/Zustand 等狀態管理工具
- 將 API 狀態與 UI 狀態分開管理
- 實現數據緩存機制

### 3. 用戶體驗
- 添加適當的 loading 指示器
- 提供清晰的錯誤提示
- 實現操作的取消機制
- 添加適當的確認對話框

### 4. 性能優化
- 實現數據緩存
- 避免不必要的 API 調用
- 使用防抖和節流
- 實現分頁加載

## 示例代碼庫

[提供一個完整的示例代碼庫鏈接或位置，包含所有最佳實踐的實現]
