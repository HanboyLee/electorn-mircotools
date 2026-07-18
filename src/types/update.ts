/** 应用内更新相关类型（主进程 / 渲染进程共用） */

export type UpdateProgressPhase = 'downloading' | 'opening' | 'done' | 'error';

export interface UpdateProgress {
  percent: number;
  transferred: number;
  total: number;
  phase: UpdateProgressPhase;
  message?: string;
}

export interface UpdateCheckResult {
  success: boolean;
  currentVersion: string;
  latestVersion: string | null;
  hasUpdate: boolean;
  releaseNotes: string | null;
  downloadUrl: string | null;
  assetName: string | null;
  error?: string;
}

export interface UpdateDownloadResult {
  success: boolean;
  filePath?: string;
  message?: string;
  error?: string;
}

export interface UpdateVersionInfo {
  currentVersion: string;
  platform: NodeJS.Platform;
}
