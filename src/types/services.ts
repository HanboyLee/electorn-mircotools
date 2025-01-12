// 服務處理器類型定義
export type ServiceHandler = {
  channel: string;
  handler: (...args: any[]) => Promise<any>;
};

// 定義所有可能的 channel 名稱
export type APIChannel = 
  | 'file:read'
  | 'file:write'
  | 'file:exists'
  | 'metadata:read'
  | 'metadata:write';

// API 方法類型定義
export interface APIMethodMap {
  'file:read': (filePath: string) => Promise<string>;
  'file:write': (filePath: string, content: string) => Promise<void>;
  'file:exists': (filePath: string) => Promise<boolean>;
  'metadata:read': (filePath: string) => Promise<any>;
  'metadata:write': (filePath: string, metadata: any) => Promise<void>;
}

// 合併所有 API 接口
export type ElectronAPI = APIMethodMap;
