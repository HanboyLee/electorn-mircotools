// 服務處理器類型定義
export type ServiceHandler = {
  channel: APIChannel;
  handler: (...args: any[]) => Promise<any>;
};

import { FileIPC, MetadataIPC } from '../constants/ipc';
import { CsvMetadataRow, WriteMetadataResult } from './metadata';

// 定義所有可能的 channel 名稱
export type APIChannel = FileIPC | MetadataIPC;

// API 方法類型定義
export interface APIMethodMap {
  [FileIPC.READ]: (path: string) => Promise<string>;
  [FileIPC.WRITE]: (path: string, content: string) => Promise<void>;
  [FileIPC.EXISTS]: (path: string) => Promise<boolean>;
  [FileIPC.SELECT_DIRECTORY]: () => Promise<string | undefined>;
  [FileIPC.VALIDATE_IMAGE_DIRECTORY]: (path: string) => Promise<string[]>;
  [MetadataIPC.METADATA_READ]: (path: string) => Promise<CsvMetadataRow[]>;
  [MetadataIPC.METADATA_WRITE]: (
    imagePath: string,
    metadata: CsvMetadataRow[]
  ) => Promise<WriteMetadataResult>;
}

// 合併所有 API 接口
export type ElectronAPI = APIMethodMap;
