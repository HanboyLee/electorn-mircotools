import { ipcMain } from 'electron';

// 服務註冊器類型定義
type ServiceHandler = {
  channel: string;
  handler: (...args: any[]) => Promise<any>;
};

// 服務註冊器基類
export abstract class BaseService {
  protected abstract getHandlers(): ServiceHandler[];

  // 註冊所有處理器
  public registerHandlers(): void {
    this.getHandlers().forEach(({ channel, handler }) => {
      ipcMain.handle(channel, async (event, ...args) => {
        try {
          return await handler(...args);
        } catch (error) {
          console.error(`Error in channel ${channel}:`, error);
          throw error;
        }
      });
    });
  }
}

// 導出所有服務
export * from './fileService';
export * from './metadataService';
