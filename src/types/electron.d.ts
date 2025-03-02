import { IPC, StoreIPC } from '../constants/ipc';

export type ElectronAPI = {
  [K in typeof IPC[keyof typeof IPC]]: (...args: any[]) => Promise<any>;
};

declare global {
  interface Window {
    electronAPI: ElectronAPI & {
      getSystemInfo: () => Promise<any>;
      getSystemInfoSync: () => any;
      storeGet: (key: string) => Promise<any>;
      storeSet: (key: string, value: any) => Promise<void>;
      storeDelete: (key: string) => Promise<void>;
      sendMessage: (message: string) => Promise<void>;
      // 窗口控制 API
      windowMinimize: () => void;
      windowMaximize: () => void;
      windowRestore: () => void;
      windowClose: () => void;
      windowToggleMaximize: () => void;
      isWindowMaximized: () => Promise<boolean>;
    };
    electron: {
      env: {
        SHUTTERSTOCK_APPLICATION_ID: string;
        SHUTTERSTOCK_APPLICATION_SEC: string;
      };
      on: (channel: string, callback: (...args: any[]) => void) => void;
      removeListener: (channel: string, callback: (...args: any[]) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
