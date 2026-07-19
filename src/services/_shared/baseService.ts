import { ipcMain } from 'electron';
import { ServiceHandler } from '@/types/services';

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
