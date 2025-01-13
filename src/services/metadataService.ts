import { BaseService } from './index';
import { MetadataIPC } from '../constants/ipc';
import { ImageMetadata, WriteMetadataResult, CsvMetadataRow } from '../types/metadata';
import { promises as fs } from 'fs';
import * as path from 'path';
import exifr from 'exifr';
import { ExifTool } from 'exiftool-vendored';

export class MetadataService extends BaseService {
  private exiftool: ExifTool;

  constructor() {
    super();
    // 初始化 ExifTool
    this.exiftool = new ExifTool();
  }

  protected getHandlers() {
    return [
      {
        channel: MetadataIPC.METADATA_WRITE,
        handler: this.writeMetadata.bind(this)
      }
    ];
  }

  /**
   * 批量寫入元數據到圖片
   * @param imageDir 圖片目錄路徑
   * @param csvData CSV數據行數組
   * @returns 處理結果數組
   */
  private async writeMetadata(imageDir: string, csvData: CsvMetadataRow[]): Promise<WriteMetadataResult[]> {
    const results: WriteMetadataResult[] = [];

    for (const row of csvData) {
      try {
        // 構建完整的圖片路徑
        const imagePath = path.join(imageDir, row.Filename);

        // 檢查文件是否存在
        try {
          await fs.access(imagePath);
        } catch {
          results.push({
            filename: row.Filename,
            success: false,
            error: '圖片文件不存在'
          });
          continue;
        }

        // 準備元數據
        const metadata = {
          'Title': row.Title,
          'Description': row.Description,
          'Keywords': row.Keywords.split(',').map(k => k.trim()),
          'Subject': row.Keywords.split(',').map(k => k.trim()), // 某些查看器使用 Subject
          'XMP:Title': row.Title,
          'XMP:Description': row.Description,
          'XMP:Subject': row.Keywords.split(',').map(k => k.trim()),
          'IPTC:ObjectName': row.Title,
          'IPTC:Caption-Abstract': row.Description,
          'IPTC:Keywords': row.Keywords.split(',').map(k => k.trim())
        };

        // 寫入元數據
        await this.exiftool.write(imagePath, metadata);

        results.push({
          filename: row.Filename,
          success: true
        });
      } catch (error) {
        results.push({
          filename: row.Filename,
          success: false,
          error: error instanceof Error ? error.message : '寫入元數據時發生錯誤'
        });
      }
    }

    return results;
  }

  // 當服務被銷毀時關閉 ExifTool
  public async destroy() {
    await this.exiftool.end();
  }
}