# 網絡狀態監控功能實施方案

## 功能概述

實現一個簡單且直觀的 Google 可訪問性監控功能，並在側邊欄下方展示實時連接狀態。

## 一、文件結構規劃

```
src/
  ├── services/
  │   └── network/
  │       ├── networkService.ts     // 主進程網絡監控服務
  │       └── ipc.ts               // IPC 通信定義
  ├── store/
  │   └── hooks/
  │       └── network/
  │           └── index.ts         // 網絡狀態管理 hook
  └── components/
      └── NetworkStatus/
          ├── index.tsx            // 主組件
          ├── StatusIndicator.tsx  // 狀態指示器組件
          └── styles.ts           // styled-components 樣式
```

## 二、界面設計

1. **狀態指示器設計**
   - 圓形指示燈設計
   - 三種狀態顏色：
     - 綠色：Google 可以正常訪問
     - 紅色：無法訪問
     - 黃色：正在檢測中
   - 指示燈旁顯示最後檢測時間
   - 懸停顯示具體響應時間

2. **布局位置**
   - 位於側邊欄菜單列表下方
   - 固定在側邊欄底部
   - 寬度與側邊欄一致
   - 高度保持在 30-40px
   - 背景顏色與側邊欄保持一致
   - 上方添加細線分隔

3. **視覺設計**
   - 保持與側邊欄整體視覺風格一致
   - 狀態指示燈靠左對齊，與菜單項對齊
   - 文字說明居中顯示
   - 使用與側邊欄相同的字體和顏色

## 三、技術實現細節

### 主進程實現

```typescript
// networkService.ts
import { dns } from 'dns';
import { ipcMain } from 'electron';

class NetworkService {
  private checkInterval: NodeJS.Timer | null = null;
  private readonly CHECK_INTERVAL = 30000; // 30秒

  start() {
    this.checkInterval = setInterval(() => {
      this.checkConnection();
    }, this.CHECK_INTERVAL);
  }

  private checkConnection() {
    const startTime = Date.now();
    dns.lookup('www.google.com', err => {
      const status = {
        isConnected: !err,
        responseTime: err ? null : Date.now() - startTime,
        timestamp: Date.now(),
      };
      this.broadcastStatus(status);
    });
  }

  private broadcastStatus(status: any) {
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('network-status-update', status);
    });
  }
}
```

### 狀態管理

```typescript
// hooks/network/index.ts
import { useState, useEffect } from 'react';

interface NetworkStatus {
  isConnected: boolean;
  lastCheck: number;
  responseTime: number | null;
}

const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: false,
    lastCheck: 0,
    responseTime: null,
  });

  useEffect(() => {
    const handleStatusUpdate = (event, status) => {
      setStatus(status);
    };

    window.api.on('network-status-update', handleStatusUpdate);
    return () => {
      window.api.off('network-status-update', handleStatusUpdate);
    };
  }, []);

  return status;
};

export default useNetworkStatus;
```

### 組件設計

```typescript
// StatusIndicator.tsx
import React from 'react';
import { StatusContainer, StatusDot, Tooltip } from './styles';
import useNetworkStatus from '../store/hooks/network';

const StatusIndicator: React.FC = () => {
  const status = useNetworkStatus();

  return (
    <StatusContainer>
      <StatusDot status={status.isConnected ? 'connected' : 'disconnected'} />
      <span>{status.isConnected ? '已連接' : '未連接'}</span>
      {status.responseTime && (
        <Tooltip>
          響應時間: {status.responseTime}ms
          <br />
          最後檢測: {new Date(status.lastCheck).toLocaleTimeString()}
        </Tooltip>
      )}
    </StatusContainer>
  );
};

export default StatusIndicator;
```

## 四、錯誤處理機制

1. **網絡檢測錯誤**
   - DNS 解析失敗處理
   - 超時處理（設置 5 秒超時）
   - 錯誤重試機制（最多 3 次）

2. **狀態更新錯誤**
   - IPC 通信異常處理
   - 組件卸載時清理監聽器
   - 狀態更新失敗後的重試機制

## 五、性能優化考慮

1. **檢測頻率優化**
   - 正常狀態：30 秒檢測一次
   - 異常狀態：10 秒檢測一次
   - 可配置的檢測間隔

2. **資源佔用優化**
   - 使用輕量級的 DNS 查詢
   - 避免過度的狀態更新
   - 及時清理定時器和事件監聽器

3. **渲染性能優化**
   - 使用 React.memo 優化組件
   - 狀態變化防抖處理
   - 最小化不必要的重渲染

## 六、測試計劃

1. **單元測試**
   - 網絡服務測試
   - Hook 邏輯測試
   - 組件渲染測試

2. **集成測試**
   - IPC 通信測試
   - 狀態管理流程測試
   - 錯誤處理測試

3. **端到端測試**
   - 實際網絡環境測試
   - 各種狀態切換測試
   - 長期穩定性測試

## 七、後續優化方向

1. **功能擴展**
   - 添加更多檢測目標
   - 支持自定義檢測間隔
   - 添加網絡統計信息

2. **用戶體驗改進**
   - 添加手動刷新按鈕
   - 提供更詳細的狀態信息
   - 支持系統通知提醒

3. **性能提升**
   - 優化檢測算法
   - 改進狀態更新機制
   - 減少資源佔用
