/**
 * 更新流程的文案与本地策略（纯函数，便于单测）
 */

/** 「稍后」后同一版本横幅静默天数 */
export const UPDATE_DISMISS_DAYS = 3;

const DISMISS_STORAGE_KEY = 'update.dismissState';

export interface UpdateDismissState {
  version: string;
  /** 此时间戳之前不再自动弹出横幅 */
  until: number;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  const digits = i === 0 ? 0 : n >= 10 ? 1 : 2;
  return `${n.toFixed(digits)} ${units[i]}`;
}

/** 下载中进度副文案 */
export function formatDownloadProgressLine(
  transferred: number,
  total: number,
  phaseMessage?: string
): string {
  if (phaseMessage && phaseMessage !== '开始下载…' && phaseMessage !== '准备下载…') {
    if (total > 0 && transferred > 0) {
      return `${phaseMessage}（${formatBytes(transferred)} / ${formatBytes(total)}）`;
    }
    return phaseMessage;
  }
  if (total > 0) {
    return `正在下载安装包… ${formatBytes(transferred)} / ${formatBytes(total)}`;
  }
  if (transferred > 0) {
    return `正在下载安装包… 已下载 ${formatBytes(transferred)}`;
  }
  return phaseMessage || '正在下载安装包…';
}

export function readDismissState(): UpdateDismissState | null {
  try {
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) {
      // 兼容旧版只存版本号
      const legacy = localStorage.getItem('update.dismissedVersion');
      if (legacy) {
        return { version: legacy, until: Date.now() + UPDATE_DISMISS_DAYS * 86400000 };
      }
      return null;
    }
    const parsed = JSON.parse(raw) as UpdateDismissState;
    if (!parsed?.version || typeof parsed.until !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDismissState(version: string, days = UPDATE_DISMISS_DAYS): void {
  try {
    const state: UpdateDismissState = {
      version,
      until: Date.now() + days * 86400000,
    };
    localStorage.setItem(DISMISS_STORAGE_KEY, JSON.stringify(state));
    localStorage.removeItem('update.dismissedVersion');
  } catch {
    // ignore
  }
}

/** 该版本在「稍后」有效期内则不应自动弹横幅 */
export function isDismissedForVersion(latestVersion: string | null | undefined): boolean {
  if (!latestVersion) return false;
  const state = readDismissState();
  if (!state) return false;
  if (state.version !== latestVersion) return false;
  return Date.now() < state.until;
}

export function getBannerIntro(currentVersion: string, latestVersion: string): string {
  return `有新版本 v${latestVersion}（当前 v${currentVersion}），建议更新。下载后将打开系统安装程序，完成后请重新打开本应用。`;
}

export function getSettingsIntro(): string {
  return '检查是否有新版本。有更新时将下载安装包并打开安装程序；安装完成后请关闭并重新打开本应用。';
}

/** 点「立即更新」前的确认说明 */
export function getPreUpdateConfirm(platform: NodeJS.Platform | string): {
  title: string;
  content: string;
} {
  if (platform === 'win32') {
    return {
      title: '开始更新？',
      content:
        '将下载安装包并打开安装程序。安装时建议先关闭本应用，以免文件被占用。安装完成后请重新打开应用。',
    };
  }
  if (platform === 'darwin') {
    return {
      title: '开始更新？',
      content:
        '将下载安装镜像（.dmg）并打开。请在窗口中将应用拖到「应用程序」以覆盖旧版，完成后关闭本应用再重新打开。',
    };
  }
  return {
    title: '开始更新？',
    content: '将下载安装包并打开安装程序。完成后请关闭并重新打开本应用。',
  };
}

/** 安装程序已打开后的分步说明 */
export function getPostInstallSteps(platform: NodeJS.Platform | string): string[] {
  if (platform === 'win32') {
    return [
      '在弹出的安装向导中完成安装（通常为覆盖升级）。',
      '安装过程中如提示关闭应用，请关闭本窗口。',
      '安装结束后，重新打开 metadata-app 即可使用新版本。',
    ];
  }
  if (platform === 'darwin') {
    return [
      '在打开的磁盘映像中，将 metadata-app 拖到「应用程序」文件夹以覆盖旧版。',
      '如系统提示替换，请选择替换。',
      '关闭本应用后，从「应用程序」重新打开，即可使用新版本。',
    ];
  }
  return ['完成系统安装程序中的步骤。', '关闭本应用后重新打开，以使用新版本。'];
}

export function getPostInstallTitle(): string {
  return '安装程序已打开';
}

export function getPostInstallHint(): string {
  return '请按下列步骤完成安装。本应用不会自动替换进程，需你完成安装后手动重启。';
}
