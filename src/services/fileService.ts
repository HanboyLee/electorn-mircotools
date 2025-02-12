import { BaseService } from './baseService';
import { FileIPC } from '../constants/ipc';
import { dialog } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ServiceHandler } from '@/types/services';

export class FileService extends BaseService {
  protected getHandlers(): ServiceHandler[] {
    console.log('Getting FileService handlers...');
    return [
      {
        channel: FileIPC.READ,
        handler: this.readFile.bind(this),
      },
      {
        channel: FileIPC.WRITE,
        handler: this.writeFile.bind(this),
      },
      {
        channel: FileIPC.EXISTS,
        handler: this.exists.bind(this),
      },
      {
        channel: FileIPC.SELECT_DIRECTORY,
        handler: this.selectDirectory.bind(this),
      },
      {
        channel: FileIPC.VALIDATE_IMAGE_DIRECTORY,
        handler: this.validateImageDirectory.bind(this),
      },
    ];
  }

  private async readFile(filePath: string): Promise<string> {
    console.log('Reading file113:', filePath);
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`讀取文件失敗：${error.message}`);
    }
  }

  private async writeFile(filePath: string, content: string): Promise<void> {
    console.log('Writing file:', filePath);
    try {
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`寫入文件失敗：${error.message}`);
    }
  }

  private async exists(filePath: string): Promise<boolean> {
    console.log('Checking if file exists:', filePath);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 打開目錄選擇對話框
   */
  private async selectDirectory(): Promise<string | undefined> {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (result.canceled) {
      return undefined;
    }

    return result.filePaths[0];
  }

  /**
   * 驗證目錄中的圖片文件
   * @param directoryPath 目錄路徑
   * @returns 圖片文件名列表
   */
  private async validateImageDirectory(directoryPath: string): Promise<string[]> {
    try {
      const files = await fs.readdir(directoryPath);
      const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.mp4']);

      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return supportedExtensions.has(ext);
      });

      if (imageFiles.length === 0) {
        throw new Error('所選目錄中沒有支持的圖片文件');
      }

      return imageFiles;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('目錄不存在');
      }
      if (error.code === 'EACCES') {
        throw new Error('沒有訪問目錄的權限');
      }
      throw error;
    }
  }
}
