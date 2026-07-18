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

// 文件打包相關的 IPC 通道（僅服務「文件打包」頁；不含歷史記錄）
export enum ZipIPC {
  // 掃描目錄，找出同名不同擴展名的文件
  SCAN_DIRECTORY = 'zip:scan-directory',

  // 創建ZIP壓縮包
  CREATE_ZIP = 'zip:create',

  // 打開文件或目錄（打包結果/路徑預覽）
  OPEN_ITEM = 'zip:open-item',
}

// 應用更新相關的 IPC 通道（GitHub Release 检查 / 下载安装包）
export enum UpdateIPC {
  /** invoke：检查是否有新版本 */
  CHECK = 'update:check',
  /** invoke：下载安装包并打开安装程序 */
  DOWNLOAD = 'update:download',
  /** invoke：当前版本与平台 */
  GET_VERSION = 'update:get-version',
  /** event：下载进度（主进程 → 渲染进程） */
  PROGRESS = 'update:progress',
  /** event：启动检查发现新版本（主进程 → 渲染进程） */
  AVAILABLE = 'update:available',
}

// 導出所有 IPC 通道
export const IPC = {
  ...FileIPC,
  ...MetadataIPC,
  ...StoreIPC,
  ...NetworkIPC,
  ...ZipIPC,
  ...UpdateIPC,
  SEND_MESSAGE: 'send-message',
  GET_SYSTEM_INFO: 'get-system-info',
  GET_SYSTEM_INFO_SYNC: 'get-system-info-sync',
} as const;

// 導出 IPC 通道的類型
export type IPCChannel = (typeof IPC)[keyof typeof IPC];
