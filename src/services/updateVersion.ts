/**
 * 纯函数：版本比较与 GitHub asset 选择（无 Electron 依赖，便于单测）
 */

export function normalizeVersion(version: string): string {
  return version.trim().replace(/^v/i, '');
}

/** 将 semver 风格字符串解析为数字段（非法段当 0） */
export function parseVersionParts(version: string): number[] {
  return normalizeVersion(version)
    .split(/[.+-]/)
    .filter(Boolean)
    .map(part => {
      const n = parseInt(part, 10);
      return Number.isFinite(n) ? n : 0;
    });
}

/**
 * 比较两个版本：latest > current 返回 true
 * 仅做数字段比较，足够覆盖 x.y.z 发版约定
 */
export function isVersionNewer(latest: string, current: string): boolean {
  const a = parseVersionParts(latest);
  const b = parseVersionParts(current);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}

export interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  size?: number;
}

/**
 * 按平台从 Release assets 中挑选安装包
 * - win32: 优先 metadata-app-setup.exe，其次任意 .exe
 * - darwin: 优先 .dmg，其次 .zip
 * - 其它平台: null
 */
export function pickReleaseAsset(
  assets: GitHubReleaseAsset[],
  platform: NodeJS.Platform
): GitHubReleaseAsset | null {
  if (!assets?.length) return null;

  const byName = (predicate: (name: string) => boolean) =>
    assets.find(a => predicate(a.name.toLowerCase())) ?? null;

  if (platform === 'win32') {
    return (
      byName(n => n === 'metadata-app-setup.exe') ||
      byName(n => n.endsWith('.exe') && !n.includes('uninstall')) ||
      null
    );
  }

  if (platform === 'darwin') {
    return byName(n => n.endsWith('.dmg')) || byName(n => n.endsWith('.zip')) || null;
  }

  return null;
}
