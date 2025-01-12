import { ElectronAPI } from './services';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
