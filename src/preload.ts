// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI, APIChannel } from './types/services';
import { IPC } from './constants/ipc';

// 自動創建 API 代理
const createAPIProxy = <T extends Record<APIChannel, (...args: any[]) => Promise<any>>>(
  channels: readonly APIChannel[]
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
contextBridge.exposeInMainWorld('electronAPI', api);
