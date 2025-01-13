import { promises as fs } from 'fs';
import { BaseService } from './index';
import { ServiceHandler } from '../types/services';
import { FileIPC } from '../constants/ipc';

export class FileService extends BaseService {
  protected getHandlers(): ServiceHandler[] {
    console.log('Getting FileService handlers...');
    return [
      {
        channel: FileIPC.READ,
        handler: this.readFile.bind(this)
      },
      {
        channel: FileIPC.WRITE,
        handler: this.writeFile.bind(this)
      },
      {
        channel: FileIPC.EXISTS,
        handler: this.fileExists.bind(this)
      }
    ];
  }

  private async readFile(filePath: string): Promise<string> {
    console.log('Reading file:', filePath);
    return await fs.readFile(filePath, 'utf8');
  }

  private async writeFile(filePath: string, content: string): Promise<void> {
    console.log('Writing file:', filePath);
    await fs.writeFile(filePath, content, 'utf8');
  }

  private async fileExists(filePath: string): Promise<boolean> {
    console.log('Checking if file exists:', filePath);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
