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

/**
 * GitHub「自动生成 release notes」常只有一行 Full Changelog 对比链接，无实质变更说明。
 * 此类正文应回退到 CHANGELOG.md 对应版本段。
 */
export function isSparseReleaseNotes(body: string | null | undefined): boolean {
  if (body == null) return true;
  const cleaned = body
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\*+/g, '')
    .replace(/Full\s*Changelog\s*:?/gi, '')
    .replace(/[#>\-|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length < 8;
}

/**
 * 从 Keep a Changelog 风格的 CHANGELOG.md 截取指定版本段（含标题行）
 * 匹配 `## [1.3.5]` / `## [1.3.5] - 2026-07-18` 等到下一 `## ` 标题前。
 */
export function extractChangelogSection(markdown: string, version: string): string | null {
  if (!markdown?.trim()) return null;
  const ver = normalizeVersion(version);
  if (!ver) return null;

  const escaped = ver.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headerRe = new RegExp(`^##\\s*\\[${escaped}\\](?:\\s|$)`);
  const lines = markdown.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (headerRe.test(lines[i])) {
      start = i;
      break;
    }
  }
  if (start < 0) return null;

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }

  const section = lines.slice(start, end).join('\n').trim();
  return section || null;
}

/**
 * 优先用有实质内容的 Release body；否则用 CHANGELOG 版本段。
 */
export function resolveReleaseNotes(
  releaseBody: string | null | undefined,
  changelogMarkdown: string | null | undefined,
  version: string
): string | null {
  if (!isSparseReleaseNotes(releaseBody) && releaseBody) {
    return releaseBody.trim();
  }
  if (changelogMarkdown) {
    const section = extractChangelogSection(changelogMarkdown, version);
    if (section) return section;
  }
  const fallback = releaseBody?.trim();
  return fallback || null;
}
