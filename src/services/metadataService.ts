import { BaseService } from './baseService';
import { MetadataIPC } from '../constants/ipc';
import { WriteMetadataResult, CsvMetadataRow } from '../types/metadata';
import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import * as path from 'path';
import exifr from 'exifr';
import { ExifTool } from 'exiftool-vendored';
import { exec } from 'child_process';
import { promisify } from 'util';
import { app } from 'electron';

const execAsync = promisify(exec);

export class MetadataService extends BaseService {
  private static instance: MetadataService;
  private exiftool: ExifTool | null = null;
  private isProcessing: boolean = false;
  private readonly localExiftoolPath: string;

  constructor() {
    super();
    if (MetadataService.instance) {
      return MetadataService.instance;
    }

    // 获取应用资源目录
    const isProduction = process.env.NODE_ENV === 'production' || !process.env.NODE_ENV;
    const appPath = app.getAppPath();
    console.log('应用路径:', appPath);
    console.log('是否生产环境:', isProduction);
    console.log('process.resourcesPath:', process.resourcesPath);

    // 检查多个可能的路径
    const possiblePaths = [
      // 生产环境路径
      path.join(process.resourcesPath || '', 'exiftool-13.12_64', 'exiftool.exe'),
      // 开发环境路径
      path.join(process.cwd(), 'exiftool-13.12_64', 'exiftool.exe'),
      // 额外的备选路径
      path.join(appPath, '..', 'resources', 'exiftool-13.12_64', 'exiftool.exe'),
      path.join(appPath, 'resources', 'exiftool-13.12_64', 'exiftool.exe'),
    ];

    console.log('正在检查以下路径:');
    possiblePaths.forEach((p, i) => console.log(`路径 ${i + 1}:`, p));

    for (const testPath of possiblePaths) {
      try {
        if (fsSync.existsSync(testPath)) {
          this.localExiftoolPath = testPath;
          console.log('找到 ExifTool：', this.localExiftoolPath);
          break;
        } else {
          console.log('路径不存在：', testPath);
        }
      } catch (error) {
        console.log('检查路径时出错：', testPath, error);
      }
    }

    if (!this.localExiftoolPath) {
      console.error('无法找到 ExifTool，已检查的所有路径都无效');
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

  private async initExifTool() {
    if (!this.exiftool && process.platform !== 'win32') {
      console.log('macOS: 初始化 ExifTool...');
      this.exiftool = new ExifTool({
        taskTimeoutMillis: 60000,
        maxTasksPerProcess: 1,
        minDelayBetweenTasks: 100,
      });
    }
  }

  private async checkFileAccess(filePath: string): Promise<boolean> {
    try {
      const normalizedPath = path.resolve(filePath).replace(/\\/g, '/');
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

  private async writeMetadataWindows(imagePath: string, metadata: any): Promise<any> {
    console.log('Windows: 使用本地 ExifTool...');
    console.log('ExifTool 路徑：', this.localExiftoolPath);

    if (!fsSync.existsSync(this.localExiftoolPath)) {
      throw new Error(`ExifTool 不存在：${this.localExiftoolPath}`);
    }

    // 处理关键词：分别写入每个关键词
    const keywordsList = metadata.Keywords.map(k => k.trim()).filter(Boolean);

    // 构建命令行参数
    const args = [
      '-overwrite_original',
      '-codedcharacterset=UTF8',
      '-charset',
      'iptc=UTF8',
      '-m', // 忽略小错误
      `-Title=${metadata.Title}`,
      `-Description=${metadata.Description}`,
      `-IPTC:ObjectName=${metadata.Title}`,
      `-IPTC:Caption-Abstract=${metadata.Description}`,
      `-XMP-dc:Title=${metadata.Title}`,
      `-XMP-dc:Description=${metadata.Description}`,
      // 分别写入每个关键词到 IPTC 和 XMP-dc
      ...keywordsList.flatMap(k => [`-IPTC:Keywords=${k}`, `-XMP-dc:Subject=${k}`]),
      imagePath,
    ];

    // 执行命令
    try {
      const command = `"${this.localExiftoolPath}" ${args.map(arg => `"${arg}"`).join(' ')}`;
      console.log('執行命令：', command);

      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        console.log('ExifTool 警告輸出：', stderr);
        if (
          !stderr.includes('1 image files updated') &&
          !stderr.toLowerCase().includes('warning')
        ) {
          throw new Error(stderr);
        }
      }

      console.log('ExifTool 輸出：', stdout);

      // 验证文件是否被更新
      const stats = await fs.stat(imagePath);
      console.log('文件最後修改時間：', stats.mtime);

      // 读取更新后的元数据
      const { stdout: metadataJson } = await execAsync(
        `"${this.localExiftoolPath}" -json -Title -Description -IPTC:Keywords -XMP-dc:Subject "${imagePath}"`
      );
      const writtenMetadata = JSON.parse(metadataJson)[0];

      // 处理读取到的关键词
      let keywords = writtenMetadata['IPTC:Keywords'] || writtenMetadata['XMP-dc:Subject'] || [];
      if (typeof keywords === 'string') {
        keywords = [keywords];
      } else if (Array.isArray(keywords)) {
        keywords = keywords.filter(Boolean);
      }
      writtenMetadata.Keywords = keywords;

      console.log('讀取到的元數據：', writtenMetadata);
      return writtenMetadata;
    } catch (error) {
      if (error instanceof Error && !error.message.toLowerCase().includes('warning')) {
        console.error('執行 ExifTool 時發生錯誤：', error);
        throw error;
      } else {
        console.log('ExifTool 警告（已忽略）：', error);
      }
    }
  }

  private async writeMetadataMacOS(imagePath: string, metadata: any): Promise<void> {
    if (!this.exiftool) {
      throw new Error('ExifTool 未初始化');
    }

    console.log('macOS: 使用 ExifTool 寫入元數據');
    await this.exiftool.write(imagePath, metadata);
    console.log('macOS: 元數據寫入完成');
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

      if (process.platform !== 'win32') {
        await this.initExifTool();
      } else {
        if (!fsSync.existsSync(this.localExiftoolPath)) {
          throw new Error(`找不到 ExifTool: ${this.localExiftoolPath}`);
        }
      }

      for (const row of csvData) {
        try {
          const imagePath = path.resolve(imageDir, row.Filename).replace(/\\/g, '/');
          console.log('處理圖片：', imagePath);

          const canAccess = await this.checkFileAccess(imagePath);
          if (!canAccess) {
            throw new Error('無法訪問文件，可能被其他程序佔用');
          }

          const ext = path.extname(imagePath).toLowerCase();
          const isVideo = ext === '.mp4';

          const metadata = isVideo
            ? {
                Title: row.Title,
                Description: row.Description,
                Keywords: row.Keywords.split(',').map(k => k.trim()),
                'QuickTime:Title': row.Title,
                'QuickTime:Description': row.Description,
                'XMP-dc:Title': row.Title,
                'XMP-dc:Description': row.Description,
                'XMP-dc:Subject': row.Keywords.split(',').map(k => k.trim()),
              }
            : {
                Title: row.Title,
                Description: row.Description,
                Keywords: row.Keywords.split(',').map(k => k.trim()),
                'XMP:Title': row.Title,
                'XMP:Description': row.Description,
                'IPTC:ObjectName': row.Title,
                'IPTC:Caption-Abstract': row.Description,
              };

          console.log('準備寫入元數據：', metadata);

          let writtenMetadata;
          if (process.platform === 'win32') {
            writtenMetadata = await this.writeMetadataWindows(imagePath, metadata);
          } else {
            await this.writeMetadataMacOS(imagePath, metadata);
            writtenMetadata = await this.exiftool?.read(imagePath);
          }

          results.push({
            filename: row.Filename,
            success: true,
            metadata: {
              Title: writtenMetadata.Title,
              Description: writtenMetadata.Description,
              Keywords: Array.isArray(writtenMetadata.Keywords)
                ? writtenMetadata.Keywords
                : writtenMetadata.Keywords?.split(';')
                    .map(k => k.trim())
                    .filter(k => k) || [],
            },
          });
        } catch (error) {
          console.error('處理圖片時發生錯誤：', error);
          results.push({
            filename: row.Filename,
            success: false,
            error: error instanceof Error ? error.message : '處理失敗',
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
