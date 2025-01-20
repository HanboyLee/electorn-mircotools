export interface ElectronAPI {
  sendMessage: (message: string) => Promise<string>;
  getSystemInfo: () => Promise<{
    platform: string;
    version: string;
    electronVersion: string;
  }>;
  getSystemInfoSync: () => {
    platform: string;
    version: string;
    electronVersion: string;
  };
  // Store API
  storeGet: (key: string) => Promise<any>;
  storeSet: (key: string, value: any) => Promise<void>;
  storeDelete: (key: string) => Promise<void>;
  // ... 其他已有的 API
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
