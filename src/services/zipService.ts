import { BaseService } from './baseService';
import { ZipIPC } from '../constants/ipc';
import * as fs from 'fs';
import * as path from 'path';
import { shell } from 'electron';
import { ServiceHandler } from '@/types/services';
import { FileGroup, FileInfo, ZipResult } from '../types/zip';
import { v4 as uuidv4 } from 'uuid';
// 必须用 ESM import，才能被 Vite 打进主进程 bundle；
// require('archiver') 会保留为运行时外部依赖，而 Forge 又忽略了 node_modules → 安装包启动即崩。
import archiver from 'archiver';

/**
 * 文件打包服務（僅服務「文件打包」頁）
 * - 掃描同名多擴展名文件組
 * - 創建 ZIP
 * - 打開文件/目錄
 * 不包含打包歷史（歷史頁面已移除，避免與打包主流程耦合）
 */
export class ZipService extends BaseService {
  constructor() {
    super();
    console.log('ZipService initialized');
  }

  protected getHandlers(): ServiceHandler[] {
    console.log('Getting ZipService handlers...');
    return [
      {
        channel: ZipIPC.SCAN_DIRECTORY,
        handler: this.scanDirectory.bind(this),
      },
      {
        channel: ZipIPC.CREATE_ZIP,
        handler: this.createZip.bind(this),
      },
      {
        channel: ZipIPC.OPEN_ITEM,
        handler: this.openItem.bind(this),
      },
    ];
  }

  /**
   * 掃描目錄，找出同名不同擴展名的文件
   * @param directoryPath 目錄路徑
   * @returns 文件組數組
   */
  public async scanDirectory(directoryPath: string): Promise<FileGroup[]> {
    try {
      // 讀取目錄中的所有文件
      const files = await fs.promises.readdir(directoryPath);

      // 用於存儲文件組的映射表
      const fileGroupMap: Record<string, FileInfo[]> = {};

      // 遍歷所有文件
      for (const file of files) {
        // 獲取文件的完整路徑
        const filePath = path.join(directoryPath, file);

        // 獲取文件的狀態信息
        const stats = await fs.promises.stat(filePath);

        // 只處理文件，忽略目錄
        if (stats.isFile()) {
          // 獲取文件名和擴展名
          const ext = path.extname(file).toLowerCase();
          const baseName = path.basename(file, ext);

          // 檢查文件擴展名是否為目標類型
          if (['.ai', '.eps', '.jpg', '.png'].includes(ext)) {
            // 如果映射表中還沒有這個基本名稱的條目，創建一個
            if (!fileGroupMap[baseName]) {
              fileGroupMap[baseName] = [];
            }

            // 將文件信息添加到對應的組中
            fileGroupMap[baseName].push({
              name: file,
              path: filePath,
              extension: ext,
              size: stats.size,
            });
          }
        }
      }

      // 將映射表轉換為文件組數組
      const result: FileGroup[] = [];

      for (const [name, files] of Object.entries(fileGroupMap)) {
        // 只有當文件組中有文件時才添加
        if (files.length > 0) {
          result.push({
            id: uuidv4(),
            name,
            basePath: directoryPath,
            files,
            timestamp: Date.now(),
          });
          console.log(`找到文件組: ${name}, 文件數量: ${files.length}`);
        }
      }

      return result;
    } catch (error) {
      console.error('掃描目錄時出錯:', error);
      throw error;
    }
  }

  /**
   * 創建 ZIP 壓縮包
   * @param fileGroup 文件組
   * @param outputPath 輸出路徑（可選，默認為源目錄）
   * @returns 壓縮結果
   */
  public async createZip(fileGroup: FileGroup, outputPath?: string): Promise<ZipResult> {
    return new Promise((resolve, reject) => {
      try {
        // 如果沒有指定輸出路徑，使用源目錄
        const targetDir = outputPath || fileGroup.basePath;

        // 創建輸出文件路徑
        const zipFilePath = path.join(targetDir, `${fileGroup.name}.zip`);

        // 創建輸出流
        const output = fs.createWriteStream(zipFilePath);

        // 創建壓縮器
        console.log('創建壓縮器...');
        const archive = archiver('zip', {
          zlib: { level: 9 }, // 最高壓縮等級
        });
        console.log('壓縮器創建成功:', !!archive);

        // 監聽輸出流的關閉事件
        output.on('close', () => {
          // 創建壓縮結果（供「文件打包」頁展示；不再寫入任何歷史存儲）
          const result: ZipResult = {
            success: true,
            outputPath: zipFilePath,
            fileCount: fileGroup.files.length,
            message: `成功創建 ZIP 文件: ${zipFilePath}`,
            groupName: fileGroup.name,
            sourceDirectory: fileGroup.basePath,
            originalFiles: fileGroup.files.map(file => file.name),
          };

          resolve(result);
        });

        // 監聽錯誤事件
        archive.on('error', (err: Error) => {
          reject({
            success: false,
            message: `創建 ZIP 文件時出錯: ${err.message}`,
          });
        });

        // 將壓縮器管道連接到輸出流
        archive.pipe(output);

        // 添加文件到壓縮包 - 直接以文件名作為路徑
        console.log(`添加 ${fileGroup.files.length} 個文件到壓縮包...`);
        for (const file of fileGroup.files) {
          // 直接使用文件名，不包含任何路徑
          console.log(`添加文件: ${file.name}`);
          archive.file(file.path, { name: file.name });
        }
        console.log('所有文件已添加到壓縮包');

        // 完成壓縮
        archive.finalize();
      } catch (error) {
        console.error('創建 ZIP 文件時出錯:', error);
        reject({
          success: false,
          message: `創建 ZIP 文件時出錯: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    });
  }

  /**
   * 打開文件或目錄
   * @param itemPath 文件或目錄路徑
   * @param _isDirectory 是否為目錄（保留參數兼容現有調用，當前統一 openPath）
   * @returns 是否成功
   */
  public async openItem(itemPath: string, _isDirectory: boolean = false): Promise<boolean> {
    try {
      // 檢查文件或目錄是否存在
      await fs.promises.access(itemPath, fs.constants.F_OK);

      // 使用 shell.openPath 打開文件或目錄
      await shell.openPath(itemPath);

      return true;
    } catch (error) {
      console.error('打開文件或目錄時出錯:', error);
      return false;
    }
  }
}

// 導出單例實例
export const zipService = new ZipService();
