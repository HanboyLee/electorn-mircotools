import { BaseService } from './baseService';
import { IPC } from '../constants/ipc';
import { ServiceHandler } from '@/types/services';
import { BrowserWindow, net } from 'electron';

export interface NetworkStatus {
  isConnected: boolean;
  responseTime: number | null;
  timestamp: number;
  checking: boolean;
}

export class NetworkService extends BaseService {
  private checkInterval: NodeJS.Timer | null = null;
  private readonly CHECK_INTERVAL = 5000; // 5秒
  private isChecking: boolean = false;
  private readonly CHECK_URL = 'https://www.google.com';
  private readonly TIMEOUT = 5000; // 5秒超時

  constructor() {
    super();
    this.init();
  }

  protected getHandlers(): ServiceHandler[] {
    return [
      {
        channel: IPC.CHECK_CONNECTION,
        handler: this.checkConnection.bind(this),
      },
      {
        channel: IPC.START_AUTO_CHECK,
        handler: this.startAutoCheck.bind(this),
      },
      {
        channel: IPC.STOP_AUTO_CHECK,
        handler: this.stopAutoCheck.bind(this),
      },
    ];
  }

  private init() {
    // 初始化時執行一次檢查並開始自動檢查
    this.startAutoCheck();
  }

  private async checkConnection(): Promise<NetworkStatus> {
    if (this.isChecking) {
      return {
        isConnected: false,
        responseTime: null,
        timestamp: Date.now(),
        checking: true,
      };
    }

    try {
      this.isChecking = true;
      const startTime = Date.now();

      const isConnected = await new Promise<boolean>(resolve => {
        let isResolved = false;
        const timeoutId = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            resolve(false);
          }
        }, this.TIMEOUT);

        const request = net.request({
          method: 'HEAD',
          url: this.CHECK_URL,
        });

        request.on('response', () => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeoutId);
            resolve(true);
          }
        });

        request.on('error', () => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeoutId);
            resolve(false);
          }
        });

        request.on('abort', () => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeoutId);
            resolve(false);
          }
        });

        request.end();
      });

      const responseTime = Date.now() - startTime;
      const status: NetworkStatus = {
        isConnected,
        responseTime,
        timestamp: Date.now(),
        checking: false,
      };

      this.broadcastStatus(status);
      return status;
    } catch (error) {
      console.error('Network check failed:', error);
      const status: NetworkStatus = {
        isConnected: false,
        responseTime: null,
        timestamp: Date.now(),
        checking: false,
      };

      this.broadcastStatus(status);
      return status;
    } finally {
      this.isChecking = false;
    }
  }

  private startAutoCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval as any);
    }

    // 立即執行一次檢查
    this.checkConnection();

    this.checkInterval = setInterval(() => {
      this.checkConnection();
    }, this.CHECK_INTERVAL);
  }

  private stopAutoCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval as any);
      this.checkInterval = null;
    }
  }

  private broadcastStatus(status: NetworkStatus): void {
    // 發送狀態到所有打開的窗口
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send(IPC.NETWORK_STATUS_UPDATE, status);
    });
  }

  // 清理資源
  public dispose(): void {
    this.stopAutoCheck();
  }
}

export const networkService = new NetworkService();

// 導出實例
export default networkService;
