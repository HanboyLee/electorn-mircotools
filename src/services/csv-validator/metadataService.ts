import { BaseService } from '../_shared';
import { MetadataIPC } from '../../constants/ipc';
import { WriteMetadataResult, CsvMetadataRow } from '../../types/metadata';
import * as fsSync from 'fs';
import * as path from 'path';
import { ExifTool } from 'exiftool-vendored';
import { app } from 'electron';
import {
  buildWriteTags,
  formatWriteError,
  normalizeKeywordsFromRead,
  resolveWindowsExiftoolPath,
} from './metadataWriteHelpers';

export class MetadataService extends BaseService {
  private static instance: MetadataService;
  private exiftool: ExifTool | null = null;
  private isProcessing: boolean = false;
  private readonly localExiftoolPath: string | null;

  constructor() {
    super();
    if (MetadataService.instance) {
      return MetadataService.instance;
    }

    const appPath = app.getAppPath();
    console.log('应用路径:', appPath);
    console.log('process.resourcesPath:', process.resourcesPath);
    console.log('运行平台:', process.platform);

    if (process.platform === 'win32') {
      this.localExiftoolPath = resolveWindowsExiftoolPath(
        process.resourcesPath,
        process.cwd(),
        appPath
      );
      if (this.localExiftoolPath) {
        console.log('找到 Windows ExifTool：', this.localExiftoolPath);
      } else {
        console.error('无法找到 Windows ExifTool（exiftool-13.12_64/exiftool.exe）');
      }
    } else {
      this.localExiftoolPath = null;
    }

    MetadataService.instance = this;
  }

  protected getHandlers() {
    return [
      {
        channel: MetadataIPC.METADATA_WRITE,
        handler: this.writeMetadata.bind(this),
      },
    ];
  }

  /**
   * Both platforms use exiftool-vendored.
   * Windows: point at bundled Oliver Betz exiftool.exe (no fragile shell cmdline).
   * macOS/Linux: default vendored perl binary.
   *
   * Why not shell `exec` on Windows:
   * - Title/Description with spaces/quotes/%/& break cmd quoting
   * - Long AI descriptions × multiple tags hit Windows cmdline length limits
   * - Error surfaces as opaque "Command failed: <entire command>"
   */
  private async initExifTool() {
    if (this.exiftool) return;

    if (process.platform === 'win32') {
      if (!this.localExiftoolPath || !fsSync.existsSync(this.localExiftoolPath)) {
        throw new Error(
          `找不到 ExifTool: ${this.localExiftoolPath || '(未解析到路径)'}。请确认安装包含 resources/exiftool-13.12_64。`
        );
      }
      console.log('Windows: 初始化 ExifTool（vendored + 本地 exe）...', this.localExiftoolPath);
      this.exiftool = new ExifTool({
        exiftoolPath: this.localExiftoolPath,
        taskTimeoutMillis: 60000,
        maxTasksPerProcess: 1,
        minDelayBetweenTasks: 100,
        // stay_open args go via stdin — no Windows CreateProcess length issues
      });
    } else {
      console.log('macOS/Linux: 初始化 ExifTool（vendored）...');
      this.exiftool = new ExifTool({
        taskTimeoutMillis: 60000,
        maxTasksPerProcess: 1,
        minDelayBetweenTasks: 100,
      });
    }
  }

  private async checkFileAccess(filePath: string): Promise<boolean> {
    try {
      const normalizedPath = path.resolve(filePath);
      console.log('檢查文件訪問權限：', normalizedPath);

      if (!fsSync.existsSync(normalizedPath)) {
        throw new Error('文件不存在');
      }

      let fd: number | null = null;
      try {
        fd = fsSync.openSync(normalizedPath, 'r+');
        return true;
      } catch (error) {
        console.error('文件訪問錯誤：', error);
        return false;
      } finally {
        if (fd !== null) {
          fsSync.closeSync(fd);
        }
      }
    } catch (error) {
      console.error('文件檢查錯誤：', error);
      return false;
    }
  }

  private async writeOneFile(imagePath: string, tags: Record<string, any>): Promise<any> {
    if (!this.exiftool) {
      throw new Error('ExifTool 未初始化');
    }

    // In-place write (no *_original backup). Special chars / long text are
    // HTML-entity encoded by exiftool-vendored WriteTask — safe on Windows.
    await this.exiftool.write(imagePath, tags, ['-overwrite_original']);
    return this.exiftool.read(imagePath);
  }

  private async writeMetadata(
    imageDir: string,
    csvData: CsvMetadataRow[]
  ): Promise<WriteMetadataResult[]> {
    if (this.isProcessing) {
      throw new Error('另一個處理程序正在運行');
    }

    this.isProcessing = true;
    const results: WriteMetadataResult[] = [];

    try {
      console.log('開始處理圖片');
      console.log('圖片目錄：', imageDir);
      console.log('運行平台：', process.platform);

      await this.initExifTool();

      for (const row of csvData) {
        try {
          // Keep native path separators — do not force POSIX slashes on Windows.
          const imagePath = path.resolve(imageDir, row.Filename);
          console.log('處理圖片：', imagePath);

          const canAccess = await this.checkFileAccess(imagePath);
          if (!canAccess) {
            throw new Error('無法訪問文件，可能被其他程序佔用');
          }

          const ext = path.extname(imagePath).toLowerCase();
          const isVideo = ext === '.mp4';
          const { keywordList, tags } = buildWriteTags(row, isVideo);

          console.log('準備寫入元數據：', tags);

          const writtenMetadata = await this.writeOneFile(imagePath, tags);

          results.push({
            filename: row.Filename,
            success: true,
            metadata: {
              Title: writtenMetadata?.Title ?? writtenMetadata?.['XMP-dc:Title'] ?? row.Title,
              Description:
                writtenMetadata?.Description ??
                writtenMetadata?.['XMP-dc:Description'] ??
                row.Description,
              Keywords: normalizeKeywordsFromRead(writtenMetadata, keywordList),
            },
          });
        } catch (error) {
          console.error('處理圖片時發生錯誤：', error);
          results.push({
            filename: row.Filename,
            success: false,
            error: formatWriteError(error),
          });
        }
      }
    } finally {
      this.isProcessing = false;
    }

    console.log('處理完成，結果：', results);
    return results;
  }

  public async destroy() {
    if (this.exiftool) {
      try {
        console.log('關閉 ExifTool...');
        await this.exiftool.end();
        this.exiftool = null;
      } catch (error) {
        console.error('關閉 ExifTool 時發生錯誤：', error);
      }
    }
  }
}
