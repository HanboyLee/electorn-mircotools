/// <reference types="electron" />
import { ElectronAPI } from '../services';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
