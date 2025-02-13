# Electron 應用開發指南

## 目錄
1. [完整開發流程](#完整開發流程)
2. [後端開發](#後端開發)
3. [前端開發](#前端開發)
4. [開發規範](#開發規範)
5. [最佳實踐](#最佳實踐)

## 完整開發流程

### 1. 創建新功能的完整流程

以創建網絡狀態監控功能為例，完整流程如下：

#### 1.1 定義 API 通道
```typescript
// src/constants/channels.ts
export const NetworkChannels = {
  STATUS_UPDATE: 'network:status-update',
  CHECK_CONNECTION: 'network:check-connection'
} as const;
```

#### 1.2 定義類型
```typescript
// src/types/services.ts
export interface NetworkStatus {
  isConnected: boolean;
  lastCheck: number;
  responseTime: number | null;
}

export type APIChannel = typeof NetworkChannels[keyof typeof NetworkChannels];

// API 方法類型定義
export type APIMethodMap = {
  [NetworkChannels.STATUS_UPDATE]: (callback: (status: NetworkStatus) => void) => void;
  [NetworkChannels.CHECK_CONNECTION]: () => Promise<NetworkStatus>;
};
```

#### 1.3 實現後端服務
```typescript
// src/services/networkService.ts
import { dns } from 'dns';
import { BaseService } from './baseService';
import { NetworkChannels } from '../constants/channels';
import { NetworkStatus } from '../types/services';

export class NetworkService extends BaseService {
  private checkInterval: NodeJS.Timer | null = null;

  protected getHandlers() {
    return [
      {
        channel: NetworkChannels.CHECK_CONNECTION,
        handler: this.checkConnection.bind(this)
      }
    ];
  }

  async checkConnection(): Promise<NetworkStatus> {
    const startTime = Date.now();
    try {
      await dns.promises.lookup('www.google.com');
      return {
        isConnected: true,
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        isConnected: false,
        lastCheck: Date.now(),
        responseTime: null
      };
    }
  }
}
```

#### 1.4 在前端定義 Hooks
```typescript
// src/hooks/useNetwork.ts
import { useState, useEffect } from 'react';
import { NetworkStatus } from '../types/services';
import { NetworkChannels } from '../constants/channels';

export const useNetwork = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: false,
    lastCheck: 0,
    responseTime: null
  });

  useEffect(() => {
    const handleStatusUpdate = (newStatus: NetworkStatus) => {
      setStatus(newStatus);
    };

    window.api[NetworkChannels.STATUS_UPDATE](handleStatusUpdate);
    
    // 初始檢測
    window.api[NetworkChannels.CHECK_CONNECTION]()
      .then(setStatus)
      .catch(console.error);

    return () => {
      // 清理監聽器
      window.api[NetworkChannels.STATUS_UPDATE](null);
    };
  }, []);

  return status;
};
```

#### 1.5 實現前端組件
```typescript
// src/components/NetworkStatus/index.tsx
import React from 'react';
import { useNetwork } from '../../hooks/useNetwork';
import { StatusIndicator, Container } from './styles';

export const NetworkStatus: React.FC = () => {
  const status = useNetwork();

  return (
    <Container>
      <StatusIndicator connected={status.isConnected} />
      <span>{status.isConnected ? '網絡正常' : '網絡異常'}</span>
    </Container>
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
    if (error instanceof NetworkError) {
      // 處理網絡錯誤
      console.error('Network error:', error);
    } else if (error instanceof ValidationError) {
      // 處理驗證錯誤
      console.error('Validation error:', error);
    } else {
      // 處理其他錯誤
      console.error('Unknown error:', error);
    }
  };

  return { handleError };
};
```

#### 2.3 狀態管理
```typescript
// src/store/networkSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NetworkStatus } from '../types/services';

const networkSlice = createSlice({
  name: 'network',
  initialState: {
    status: {
      isConnected: false,
      lastCheck: 0,
      responseTime: null
    } as NetworkStatus
  },
  reducers: {
    updateStatus: (state, action: PayloadAction<NetworkStatus>) => {
      state.status = action.payload;
    }
  }
});
```

## 開發規範

### 命名規範

1. **文件命名**
   - 組件文件：PascalCase
   - 工具文件：camelCase
   - 類型文件：PascalCase
   - 樣式文件：camelCase

2. **變量命名**
   - 普通變量：camelCase
   - 常量：UPPER_CASE
   - 類型：PascalCase
   - 接口：以 I 開頭，PascalCase

3. **函數命名**
   - 普通函數：camelCase
   - 組件函數：PascalCase
   - 事件處理函數：handleXxx

### 代碼風格

1. **TypeScript 相關**
   - 優先使用 interface 而不是 type
   - 明確定義返回類型
   - 使用 enum 而不是字符串常量
   - 合理使用泛型

2. **React 相關**
   - 使用函數組件和 Hooks
   - Props 類型明確定義
   - 合理使用 memo
   - 遵循 Hooks 規則

3. **樣式相關**
   - 使用 styled-components
   - 主題統一管理
   - 響應式設計
   - 模塊化 CSS

## 最佳實踐

### 1. 性能優化
- 使用 useMemo 和 useCallback
- 實現虛擬列表
- 圖片懶加載
- 代碼分割

### 2. 錯誤處理
- 全局錯誤邊界
- 異步錯誤處理
- 友好的錯誤提示
- 錯誤日誌記錄

### 3. 測試
- 單元測試覆蓋
- 組件測試
- E2E 測試
- 性能測試

### 4. 安全性
- 輸入驗證
- XSS 防護
- 參數校驗
- 安全的 IPC 通信

## 示例代碼庫

項目目錄結構：
```
src/
├── main/           # 主進程代碼
├── renderer/       # 渲染進程代碼
├── common/         # 共享代碼
├── components/     # React 組件
├── hooks/          # Custom Hooks
├── services/       # 服務層
├── store/          # 狀態管理
├── types/          # TypeScript 類型
├── utils/          # 工具函數
└── styles/         # 全局樣式
