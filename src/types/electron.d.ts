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
    };
    electron: {
      on: (channel: string, callback: (...args: any[]) => void) => void;
      removeListener: (channel: string, callback: (...args: any[]) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
