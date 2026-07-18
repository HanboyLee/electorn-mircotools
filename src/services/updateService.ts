import { app, BrowserWindow, shell } from 'electron';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import { URL } from 'url';

import { BaseService } from './baseService';
import { UpdateIPC } from '../constants/ipc';
import { ServiceHandler } from '@/types/services';
import {
  UpdateCheckResult,
  UpdateDownloadResult,
  UpdateProgress,
  UpdateVersionInfo,
} from '@/types/update';
import { isVersionNewer, pickReleaseAsset, normalizeVersion, GitHubReleaseAsset } from './updateVersion';

/** 与 solo-trunk-cicd / 远程 origin 一致 */
const GITHUB_OWNER = 'HanboyLee';
const GITHUB_REPO = 'electorn-mircotools';
const RELEASES_LATEST_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
const USER_AGENT = 'metadata-app-updater';
const STARTUP_CHECK_DELAY_MS = 5000;
const REQUEST_TIMEOUT_MS = 20000;
const MAX_REDIRECTS = 8;

interface GitHubReleaseResponse {
  tag_name?: string;
  body?: string | null;
  html_url?: string;
  assets?: GitHubReleaseAsset[];
  message?: string;
}

/**
 * 应用更新服务：查询 GitHub Release、下载安装包并打开
 * 不做静默替换；用户完成系统安装向导后自行重启
 */
export class UpdateService extends BaseService {
  private downloading = false;
  private startupTimer: ReturnType<typeof setTimeout> | null = null;
  private lastCheck: UpdateCheckResult | null = null;

  constructor() {
    super();
    this.scheduleStartupCheck();
  }

  protected getHandlers(): ServiceHandler[] {
    return [
      {
        channel: UpdateIPC.CHECK,
        handler: this.checkForUpdates.bind(this),
      },
      {
        channel: UpdateIPC.DOWNLOAD,
        handler: this.downloadAndOpen.bind(this),
      },
      {
        channel: UpdateIPC.GET_VERSION,
        handler: this.getVersionInfo.bind(this),
      },
    ];
  }

  private scheduleStartupCheck(): void {
    if (this.startupTimer) {
      clearTimeout(this.startupTimer);
    }
    this.startupTimer = setTimeout(() => {
      this.startupTimer = null;
      this.checkForUpdates()
        .then(result => {
          if (result.success && result.hasUpdate) {
            this.broadcast(UpdateIPC.AVAILABLE, result);
          }
        })
        .catch(err => {
          console.warn('[UpdateService] startup check failed:', err);
        });
    }, STARTUP_CHECK_DELAY_MS);
  }

  private getVersionInfo(): Promise<UpdateVersionInfo> {
    return Promise.resolve({
      currentVersion: app.getVersion(),
      platform: process.platform,
    });
  }

  private async checkForUpdates(): Promise<UpdateCheckResult> {
    const currentVersion = app.getVersion();
    const base: UpdateCheckResult = {
      success: false,
      currentVersion,
      latestVersion: null,
      hasUpdate: false,
      releaseNotes: null,
      downloadUrl: null,
      assetName: null,
    };

    try {
      const release = await this.fetchLatestRelease();
      if (!release.tag_name) {
        const result = {
          ...base,
          error: release.message || '无法解析最新版本信息',
        };
        this.lastCheck = result;
        return result;
      }

      const latestVersion = normalizeVersion(release.tag_name);
      const hasUpdate = isVersionNewer(latestVersion, currentVersion);
      const assets = release.assets ?? [];
      const asset = hasUpdate ? pickReleaseAsset(assets, process.platform) : null;

      const result: UpdateCheckResult = {
        success: true,
        currentVersion,
        latestVersion,
        hasUpdate,
        releaseNotes: release.body ?? null,
        downloadUrl: asset?.browser_download_url ?? null,
        assetName: asset?.name ?? null,
        // 有新版本但没有本平台包时，检查仍成功，但不可更新
        error:
          hasUpdate && !asset
            ? '发现新版本，但暂无当前平台的安装包，请稍后再试'
            : undefined,
      };

      this.lastCheck = result;
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[UpdateService] checkForUpdates failed:', message);
      const result = { ...base, error: message };
      this.lastCheck = result;
      return result;
    }
  }

  private async downloadAndOpen(downloadUrl?: string, assetName?: string): Promise<UpdateDownloadResult> {
    if (this.downloading) {
      return { success: false, error: '已有更新正在下载，请稍候' };
    }

    const url = downloadUrl || this.lastCheck?.downloadUrl;
    const name = assetName || this.lastCheck?.assetName;

    if (!url || !name) {
      return { success: false, error: '没有可下载的安装包，请先检查更新' };
    }

    this.downloading = true;
    try {
      const destDir = path.join(app.getPath('temp'), 'metadata-app-updates');
      await fs.promises.mkdir(destDir, { recursive: true });
      const destPath = path.join(destDir, name);

      this.broadcastProgress({
        percent: 0,
        transferred: 0,
        total: 0,
        phase: 'downloading',
        message: '正在下载安装包…',
      });

      await this.downloadFile(url, destPath, (transferred, total) => {
        const percent = total > 0 ? Math.min(100, Math.round((transferred / total) * 100)) : 0;
        this.broadcastProgress({
          percent,
          transferred,
          total,
          phase: 'downloading',
          message: '正在下载安装包…',
        });
      });

      this.broadcastProgress({
        percent: 100,
        transferred: 0,
        total: 0,
        phase: 'opening',
        message: '正在打开安装程序…',
      });

      const openError = await shell.openPath(destPath);
      if (openError) {
        this.broadcastProgress({
          percent: 100,
          transferred: 0,
          total: 0,
          phase: 'error',
          message: openError,
        });
        return {
          success: false,
          filePath: destPath,
          error: `安装包已下载，但无法自动打开：${openError}`,
        };
      }

      this.broadcastProgress({
        percent: 100,
        transferred: 0,
        total: 0,
        phase: 'done',
        message: '安装程序已打开，请完成安装后重启应用',
      });

      return {
        success: true,
        filePath: destPath,
        message: '安装程序已打开，请完成安装后重启应用',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[UpdateService] downloadAndOpen failed:', message);
      this.broadcastProgress({
        percent: 0,
        transferred: 0,
        total: 0,
        phase: 'error',
        message,
      });
      return { success: false, error: message };
    } finally {
      this.downloading = false;
    }
  }

  private async fetchLatestRelease(): Promise<GitHubReleaseResponse> {
    const body = await this.httpGetText(RELEASES_LATEST_API, {
      Accept: 'application/vnd.github+json',
      'User-Agent': USER_AGENT,
      'X-GitHub-Api-Version': '2022-11-28',
    });
    return JSON.parse(body) as GitHubReleaseResponse;
  }

  private httpGetText(
    url: string,
    headers: Record<string, string>,
    redirectCount = 0
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (redirectCount > MAX_REDIRECTS) {
        reject(new Error('请求重定向次数过多'));
        return;
      }

      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        reject(new Error(`无效的 URL: ${url}`));
        return;
      }

      const lib = parsed.protocol === 'http:' ? http : https;
      const req = lib.request(
        {
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          port: parsed.port || undefined,
          path: `${parsed.pathname}${parsed.search}`,
          method: 'GET',
          headers,
          timeout: REQUEST_TIMEOUT_MS,
        },
        res => {
          const status = res.statusCode ?? 0;
          if (status >= 300 && status < 400 && res.headers.location) {
            const next = new URL(res.headers.location, url).toString();
            res.resume();
            this.httpGetText(next, headers, redirectCount + 1).then(resolve, reject);
            return;
          }

          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => {
            const text = Buffer.concat(chunks).toString('utf8');
            if (status < 200 || status >= 300) {
              reject(new Error(`GitHub API 错误 HTTP ${status}: ${text.slice(0, 200)}`));
              return;
            }
            resolve(text);
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('检查更新超时，请稍后重试'));
      });
      req.on('error', reject);
      req.end();
    });
  }

  private downloadFile(
    url: string,
    destPath: string,
    onProgress: (transferred: number, total: number) => void,
    redirectCount = 0
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (redirectCount > MAX_REDIRECTS) {
        reject(new Error('下载重定向次数过多'));
        return;
      }

      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        reject(new Error(`无效的下载地址: ${url}`));
        return;
      }

      const lib = parsed.protocol === 'http:' ? http : https;
      const req = lib.request(
        {
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          port: parsed.port || undefined,
          path: `${parsed.pathname}${parsed.search}`,
          method: 'GET',
          headers: {
            'User-Agent': USER_AGENT,
            Accept: 'application/octet-stream',
          },
          timeout: 0,
        },
        res => {
          const status = res.statusCode ?? 0;
          if (status >= 300 && status < 400 && res.headers.location) {
            const next = new URL(res.headers.location, url).toString();
            res.resume();
            this.downloadFile(next, destPath, onProgress, redirectCount + 1).then(resolve, reject);
            return;
          }

          if (status < 200 || status >= 300) {
            res.resume();
            reject(new Error(`下载失败 HTTP ${status}`));
            return;
          }

          const total = parseInt(res.headers['content-length'] || '0', 10) || 0;
          let transferred = 0;
          const file = fs.createWriteStream(destPath);

          res.on('data', (chunk: Buffer) => {
            transferred += chunk.length;
            onProgress(transferred, total);
          });

          res.pipe(file);

          file.on('finish', () => {
            file.close(err => {
              if (err) {
                reject(err);
                return;
              }
              onProgress(total || transferred, total || transferred);
              resolve();
            });
          });

          file.on('error', err => {
            file.close(() => {
              fs.unlink(destPath, () => undefined);
            });
            reject(err);
          });

          res.on('error', err => {
            file.close(() => {
              fs.unlink(destPath, () => undefined);
            });
            reject(err);
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('下载超时'));
      });
      req.on('error', reject);
      req.end();
    });
  }

  private broadcastProgress(progress: UpdateProgress): void {
    this.broadcast(UpdateIPC.PROGRESS, progress);
  }

  private broadcast(channel: string, payload: unknown): void {
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, payload);
      }
    });
  }

  public dispose(): void {
    if (this.startupTimer) {
      clearTimeout(this.startupTimer);
      this.startupTimer = null;
    }
  }
}
