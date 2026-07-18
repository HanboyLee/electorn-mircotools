import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { UpdateIPC } from '@/constants/ipc';
import type {
  UpdateCheckResult,
  UpdateDownloadResult,
  UpdateProgress,
  UpdateVersionInfo,
} from '@/types/update';
import { isDismissedForVersion, writeDismissState } from '@/utils/updateUx';

export interface AppUpdateContextValue {
  currentVersion: string;
  platform: NodeJS.Platform | string;
  checkResult: UpdateCheckResult | null;
  checking: boolean;
  downloading: boolean;
  progress: UpdateProgress | null;
  bannerVisible: boolean;
  /** 最近一次下载/打开失败文案（用于重试） */
  lastError: string | null;
  /** 是否可「立即更新」（有新版本且有本平台安装包地址） */
  canUpdate: boolean;
  checkForUpdates: () => Promise<UpdateCheckResult | null>;
  downloadAndInstall: () => Promise<UpdateDownloadResult | null>;
  dismissBanner: () => void;
  clearLastError: () => void;
  setLastError: (error: string | null) => void;
}

const AppUpdateContext = createContext<AppUpdateContextValue | null>(null);

export const AppUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [platform, setPlatform] = useState<NodeJS.Platform | string>('darwin');
  const [checkResult, setCheckResult] = useState<UpdateCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const canUpdate = Boolean(
    checkResult?.success && checkResult.hasUpdate && checkResult.downloadUrl && checkResult.assetName
  );

  const applyCheckResult = useCallback((result: UpdateCheckResult) => {
    setCheckResult(result);
    const can =
      result.success && result.hasUpdate && Boolean(result.downloadUrl && result.assetName);
    if (!can || !result.latestVersion) {
      setBannerVisible(false);
      return;
    }
    if (isDismissedForVersion(result.latestVersion)) {
      setBannerVisible(false);
      return;
    }
    setBannerVisible(true);
  }, []);

  const clearLastError = useCallback(() => setLastError(null), []);

  const checkForUpdates = useCallback(async (): Promise<UpdateCheckResult | null> => {
    setChecking(true);
    setProgress(null);
    setLastError(null);
    try {
      const result = (await window.electronAPI[UpdateIPC.CHECK]()) as UpdateCheckResult;
      applyCheckResult(result);
      return result;
    } catch (error) {
      console.error('检查更新失败:', error);
      const fallback: UpdateCheckResult = {
        success: false,
        currentVersion: currentVersion || '',
        latestVersion: null,
        hasUpdate: false,
        releaseNotes: null,
        downloadUrl: null,
        assetName: null,
        error: error instanceof Error ? error.message : String(error),
      };
      setCheckResult(fallback);
      setBannerVisible(false);
      return fallback;
    } finally {
      setChecking(false);
    }
  }, [applyCheckResult, currentVersion]);

  const downloadAndInstall = useCallback(async (): Promise<UpdateDownloadResult | null> => {
    if (downloading) {
      return { success: false, error: '已有更新正在下载，请稍候' };
    }
    setDownloading(true);
    setLastError(null);
    setProgress({
      percent: 0,
      transferred: 0,
      total: 0,
      phase: 'downloading',
      message: '准备下载…',
    });
    try {
      const latest = checkResult;
      const result = (await window.electronAPI[UpdateIPC.DOWNLOAD](
        latest?.downloadUrl ?? undefined,
        latest?.assetName ?? undefined
      )) as UpdateDownloadResult;
      if (!result?.success) {
        setLastError(result?.error || result?.message || '更新失败');
      } else {
        setLastError(null);
      }
      return result;
    } catch (error) {
      console.error('下载更新失败:', error);
      const err = error instanceof Error ? error.message : String(error);
      setLastError(err);
      return { success: false, error: err };
    } finally {
      setDownloading(false);
    }
  }, [checkResult, downloading]);

  const dismissBanner = useCallback(() => {
    if (checkResult?.latestVersion) {
      writeDismissState(checkResult.latestVersion);
    }
    setBannerVisible(false);
  }, [checkResult?.latestVersion]);

  useEffect(() => {
    let mounted = true;

    const loadVersion = async () => {
      try {
        const info = (await window.electronAPI[UpdateIPC.GET_VERSION]()) as UpdateVersionInfo;
        if (mounted) {
          setCurrentVersion(info.currentVersion);
          setPlatform(info.platform);
        }
      } catch (error) {
        console.error('获取版本失败:', error);
      }
    };

    const handleProgress = (payload: UpdateProgress) => {
      setProgress(payload);
      if (payload.phase === 'downloading' || payload.phase === 'opening') {
        setDownloading(true);
      }
      if (payload.phase === 'done' || payload.phase === 'error') {
        setDownloading(false);
        if (payload.phase === 'error' && payload.message) {
          setLastError(payload.message);
        }
      }
    };

    const handleAvailable = (result: UpdateCheckResult) => {
      applyCheckResult(result);
    };

    loadVersion();
    window.electron.on(UpdateIPC.PROGRESS, handleProgress);
    window.electron.on(UpdateIPC.AVAILABLE, handleAvailable);

    return () => {
      mounted = false;
      window.electron.removeListener(UpdateIPC.PROGRESS, handleProgress);
      window.electron.removeListener(UpdateIPC.AVAILABLE, handleAvailable);
    };
  }, [applyCheckResult]);

  const value = useMemo<AppUpdateContextValue>(
    () => ({
      currentVersion,
      platform,
      checkResult,
      checking,
      downloading,
      progress,
      bannerVisible,
      lastError,
      canUpdate,
      checkForUpdates,
      downloadAndInstall,
      dismissBanner,
      clearLastError,
      setLastError,
    }),
    [
      currentVersion,
      platform,
      checkResult,
      checking,
      downloading,
      progress,
      bannerVisible,
      lastError,
      canUpdate,
      checkForUpdates,
      downloadAndInstall,
      dismissBanner,
      clearLastError,
    ]
  );

  return <AppUpdateContext.Provider value={value}>{children}</AppUpdateContext.Provider>;
};

export function useAppUpdate(): AppUpdateContextValue {
  const ctx = useContext(AppUpdateContext);
  if (!ctx) {
    throw new Error('useAppUpdate 必须在 AppUpdateProvider 内使用');
  }
  return ctx;
}
