// 文件操作相關的 IPC 通道
export enum FileIPC {
  READ = 'file:read',
  WRITE = 'file:write',
  EXISTS = 'file:exists',
  SELECT_DIRECTORY = 'file:select-directory',
  VALIDATE_IMAGE_DIRECTORY = 'file:validate-image-directory',
}

// Metadata 操作相關的 IPC 通道
export enum MetadataIPC {
  METADATA_READ = 'metadata:read',
  METADATA_WRITE = 'metadata:write',
}

// Store 相關的 IPC 通道
export enum StoreIPC {
  GET = 'store:get',
  SET = 'store:set',
  DELETE = 'store:delete',
}

// 網絡相關的 IPC 通道
export enum NetworkIPC {
  CHECK_CONNECTION = 'network:check-connection',
  START_AUTO_CHECK = 'network:start-auto-check',
  STOP_AUTO_CHECK = 'network:stop-auto-check',
  NETWORK_STATUS_UPDATE = 'network:status:update',
  CHECK_INTERVAL_TIME = 'network:check-interval-time',
  CHECK_URL = 'network:check-url',
}

// 文件打包相關的 IPC 通道
export enum ZipIPC {
  // 掃描目錄，找出同名不同擴展名的文件
  SCAN_DIRECTORY = 'zip:scan-directory',
  
  // 創建ZIP壓縮包
  CREATE_ZIP = 'zip:create',
  
  // 獲取打包歷史記錄
  GET_PACKAGE_HISTORY = 'zip:get-history',
  
  // 清空歷史記錄
  CLEAR_HISTORY = 'zip:clear-history',
  
  // 打開文件或目錄
  OPEN_ITEM = 'zip:open-item',
}

// 導出所有 IPC 通道
export const IPC = {
  ...FileIPC,
  ...MetadataIPC,
  ...StoreIPC,
  ...NetworkIPC,
  ...ZipIPC,
  SEND_MESSAGE: 'send-message',
  GET_SYSTEM_INFO: 'get-system-info',
  GET_SYSTEM_INFO_SYNC: 'get-system-info-sync',
} as const;

// 導出 IPC 通道的類型
export type IPCChannel = (typeof IPC)[keyof typeof IPC];
