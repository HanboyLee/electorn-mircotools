/**
 * 文件打包相關類型定義
 */

// 文件信息類型定義
export interface FileInfo {
  path: string;             // 完整路徑
  name: string;             // 文件名（含擴展名）
  extension: string;        // 擴展名
  size: number;             // 文件大小
  type?: string;            // 文件類型（可選）
}

// 文件組類型定義
export interface FileGroup {
  id?: string;              // 唯一標識
  name: string;             // 文件基本名稱（不含擴展名）
  files: FileInfo[];        // 文件信息數組
  count?: number;           // 文件數量
  basePath: string;         // 源目錄路徑
  selected?: boolean;       // 是否被選中（用於UI顯示）
  timestamp?: number;       // 創建時間戳
}

// 壓縮結果類型定義
export interface ZipResult {
  success: boolean;         // 是否成功
  outputPath?: string;      // 輸出路徑
  fileCount?: number;       // 文件數量
  message: string;          // 結果消息
  groupName?: string;       // 文件組名稱
  sourceDirectory?: string; // 源目錄
  originalFiles?: string[]; // 原始文件名列表
}

// 壓縮進度類型定義
export interface ZipProgress {
  percentage: number;       // 進度百分比
  currentFile?: string;     // 當前處理的文件
  status: 'idle' | 'processing' | 'success' | 'error'; // 狀態
  message?: string;         // 消息
}
