# 網絡狀態監控功能實施方案

## 功能概述

實現一個簡單的 Google 可訪問性監控功能，通過狀態指示器的方式在側邊欄菜單下方展示當前連接狀態。

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
    // 發送到渲染進程
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('network-status-update', status);
    });
  }
}
```

### 狀態存儲

```typescript
// index.ts
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

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

### 樣式設置

```typescript
// styles.ts
import styled from 'styled-components';

export const StatusContainer = styled.div`
  position: relative;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.sidebar};
`;

export const StatusDot = styled.div<{ status: 'connected' | 'disconnected' | 'checking' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${({ status, theme }) => {
    switch (status) {
      case 'connected':
        return theme.colors.success;
      case 'disconnected':
        return theme.colors.error;
      case 'checking':
        return theme.colors.warning;
      default:
        return theme.colors.disabled;
    }
  }};
`;

export const StatusText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.tooltip};
  border-radius: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.tooltipText};
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;

  ${StatusContainer}:hover & {
    opacity: 1;
  }
`;
```

### 狀態指示器組件

```typescript
// StatusIndicator.tsx
import React from 'react';
import { StatusContainer, StatusDot, StatusText, Tooltip } from './styles';
import useNetworkStatus from '../store/hooks/network';

interface Props {
}

const StatusIndicator: React.FC<Props> = () => {
  const status = useNetworkStatus();

  const getStatusType = () => {
    if (status.checking) return 'checking';
    return status.isConnected ? 'connected' : 'disconnected';
  };

  const getStatusText = () => {
    if (status.checking) return '檢測中...';
    return status.isConnected ? '已連接' : '未連接';
  };

  return (
    <StatusContainer>
      <StatusDot status={getStatusType()} />
      <StatusText>{getStatusText()}</StatusText>
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

### 主組件整合

```typescript
// index.tsx
import React from 'react';
import StatusIndicator from './StatusIndicator';

const NetworkStatus: React.FC = () => {
  return (
    <div>
      <StatusIndicator />
    </div>
  );
};

export default NetworkStatus;
```

## 四、用戶交互

1. **基本顯示**

   - 狀態指示燈顏色直觀反映連接狀態
   - 顯示"已連接"或"未連接"的文字提示

2. **懸停效果**

   - 顯示最後檢測時間
   - 顯示具體響應時間（如果有）
   - 提供手動檢測的提示

3. **點擊操作**
   - 支持點擊手動觸發檢測
   - 檢測過程中顯示加載動畫

## 五、注意事項

1. 主進程和渲染進程職責分離
2. 使用 IPC 進行安全的進程間通信
3. 最小化資源佔用
4. 避免頻繁的狀態更新

## 六、預期效果

- 用戶可以一眼看出 Google 的可訪問狀態
- 交互簡單直觀
- 不佔用過多界面空間
- 運行穩定可靠
