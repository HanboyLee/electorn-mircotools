// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from './types/electron';
import { IPC, StoreIPC } from './constants/ipc';

// 自動創建 API 代理
const createAPIProxy = <T extends Record<string, (...args: any[]) => Promise<any>>>(
  channels: readonly string[]
): T => {
  return channels.reduce((api, channel) => {
    api[channel] = ((...args: any[]) => ipcRenderer.invoke(channel, ...args)) as T[typeof channel];
    return api;
  }, {} as T);
};

// 使用常量定義的 channels
const API_CHANNELS = Object.values(IPC);

// 註冊所有 API
const api = createAPIProxy<ElectronAPI>(API_CHANNELS);

// 暴露 API 給渲染進程
contextBridge.exposeInMainWorld('electronAPI', {
  ...api,
  // 添加系統信息 API
  getSystemInfo: () => ipcRenderer.invoke(IPC.GET_SYSTEM_INFO),
  getSystemInfoSync: () => ipcRenderer.sendSync(IPC.GET_SYSTEM_INFO_SYNC),
  
  // Store API
  storeGet: (key: string) => ipcRenderer.invoke(StoreIPC.GET, key),
  storeSet: (key: string, value: any) => ipcRenderer.invoke(StoreIPC.SET, key, value),
  storeDelete: (key: string) => ipcRenderer.invoke(StoreIPC.DELETE, key),
  
  // Message API
  sendMessage: (message: string) => ipcRenderer.invoke('send-message', message),
  
  // 窗口控制 API
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowRestore: () => ipcRenderer.send('window-restore'),
  windowClose: () => ipcRenderer.send('window-close'),
  windowToggleMaximize: () => ipcRenderer.send('window-toggle-maximize'),
  isWindowMaximized: () => ipcRenderer.invoke('is-window-maximized'),
});

// 暴露事件監聽相關的 API
contextBridge.exposeInMainWorld('electron', {
  env: {
    SHUTTERSTOCK_APPLICATION_ID: process.argv.find(arg => arg.startsWith('--shutterstock-app-id='))?.split('=')[1] || '',
    SHUTTERSTOCK_APPLICATION_SEC: process.argv.find(arg => arg.startsWith('--shutterstock-app-sec='))?.split('=')[1] || '',
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => callback(...args));
  },
  removeListener: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, (_, ...args) => callback(...args) as any);
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});
