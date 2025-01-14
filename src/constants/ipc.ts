// 文件操作相關的 IPC 通道
export enum FileIPC {
  READ = 'file:read',
  WRITE = 'file:write',
  EXISTS = 'file:exists',
  SELECT_DIRECTORY = 'file:select-directory',
  VALIDATE_IMAGE_DIRECTORY = 'file:validate-image-directory'
}

// Metadata 操作相關的 IPC 通道
export enum MetadataIPC {
  METADATA_READ = 'metadata:read',
  METADATA_WRITE = 'metadata:write'
}

// 導出所有 IPC 通道
export const IPC = {
  ...FileIPC,
  ...MetadataIPC
} as const;

// 導出 IPC 通道的類型
export type IPCChannel = typeof IPC[keyof typeof IPC];
