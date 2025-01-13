// 文件操作相關的 IPC 通道
export const FileIPC = {
  READ: 'file:read' as const,
  WRITE: 'file:write' as const,
  EXISTS: 'file:exists' as const,
} as const;

// Metadata 操作相關的 IPC 通道
export const MetadataIPC = {
  METADATA_READ: 'metadata:read' as const,
  METADATA_WRITE: 'metadata:write' as const,
} as const;

// 導出所有 IPC 通道
export const IPC = {
  ...FileIPC,
  ...MetadataIPC,
} as const;

// 導出 IPC 通道的類型
export type IPCChannel = typeof IPC[keyof typeof IPC];
