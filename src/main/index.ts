import { app, BrowserWindow, ipcMain } from 'electron';
import { FileService } from '../services/fileService';

import { MetadataService } from '../services/metadataService';

import * as path from 'path';

import Store from 'electron-store';

import { StoreIPC } from '../constants/ipc';



const store = new Store();



// Handle creating/removing shortcuts on Windows when installing/uninstalling

if (process.platform === 'win32') {

  const squirrelEvents = {

    handleSquirrelEvent: function() {

      if (process.argv[1] === '--squirrel-install' ||

          process.argv[1] === '--squirrel-updated') {

        // 创建桌面快捷方式

        const updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');

        require('child_process').spawn(updateExe, ['--createShortcut', process.execPath], { detached: true });

        app.quit();

        return true;

      }

      if (process.argv[1] === '--squirrel-uninstall') {

        // 删除桌面快捷方式

        const updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');

        require('child_process').spawn(updateExe, ['--removeShortcut', process.execPath], { detached: true });

        app.quit();

        return true;

      }

      if (process.argv[1] === '--squirrel-obsolete') {

        app.quit();

        return true;

      }

      return false;

    }

  };



  if (squirrelEvents.handleSquirrelEvent()) {

    app.quit();

  }

}



// 在開發環境中啟用熱重載

if (process.env.NODE_ENV === 'development') {

  // 使用 require 而不是 import 來避免 TS 錯誤

  const electronReloader = require('electron-reloader');

  try {

    console.log('Development mode detected, enabling hot reload...');

    electronReloader(module, {

      debug: true,

      watchRenderer: false, // 由 Vite 处理渲染进程的热重载

      ignore: ['node_modules/**/*', 'release/**/*', 'dist/**/*', '.vite/**/*', '.git/**/*'],

      // 指定要监听的文件

      paths: [

        path.join(__dirname, '**', '*.ts'),

        path.join(__dirname, '**', '*.js'),

      ],

    });

  } catch (err) {

    console.log('Error enabling hot reload:', err);

  }

}



// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack

// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on

// whether you're running in development or production).

declare const MAIN_WINDOW_VITE_ENTRY: string;

declare const MAIN_WINDOW_VITE_PRELOAD: string;



// 處理來自渲染進程的消息

ipcMain.handle('send-message', async (event, message) => {

  console.log('Received message from renderer:', message);

  return `Server received: ${message}`;

});



// 處理系統信息請求

ipcMain.handle('get-system-info', async () => {

  console.log('Getting systeminfo...');

  return {

    platform: process.platform,

    version: app.getVersion(),

    electronVersion: process.versions.electron,

  };

});



// 註冊 store 相關的 IPC 處理程序

ipcMain.handle(StoreIPC.GET, async (_, key: string) => {

  return store.get(key);

});



ipcMain.handle(StoreIPC.SET, async (_, key: string, value: any) => {

  store.set(key, value);

  return true;

});



ipcMain.handle(StoreIPC.DELETE, async (_, key: string) => {

  store.delete(key);

  return true;

});



// 初始化所有服務

const initializeServices = () => {

  console.log('Initializing services...');

  const services = [

    new FileService(),

    new MetadataService(),

    // 添加更多服務...

  ];



  // 註冊所有服務的處理器

  services.forEach(service => {

    console.log('Registering handlers for service:', service.constructor.name);

    service.registerHandlers();

  });

  console.log('Services initialized successfully');

};



const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';



const createWindow = async (): Promise<void> => {

  try {

    console.log('Starting createWindow...');

    console.log('Current directory:', process.cwd());

    console.log('Is packaged:', app.isPackaged);

    console.log('Process env:', process.env);



    // Create the browser window.

    const mainWindow = new BrowserWindow({

      width: 1200,

      height: 800,

      icon: path.join(__dirname, '..', 'assets', process.platform === 'darwin' ? 'icon.icns' : 'icon.ico'),

      webPreferences: {

        nodeIntegration: true,

        contextIsolation: true,

        preload: path.join(__dirname, 'preload.js'),

      },

    });



    // and load the index.html of the app.

    if (process.env.NODE_ENV === 'development') {

      console.log('Running in development mode');

      mainWindow.loadURL(VITE_DEV_SERVER_URL)

        .catch((err) => {

          console.error('Error creating window:', err);

        });

      mainWindow.webContents.openDevTools();

    } else {

      // Load the index.html when not in development

      mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'))

        .catch((err) => {

          console.error('Error loading index.html:', err);

        });

    }

  } catch (err) {

    console.error('Error creating window:', err);

    app.quit();

  }

};



// This method will be called when Electron has finished

// initialization and is ready to create browser windows.

// Some APIs can only be used after this event occurs.

app.on('ready', () => {

  console.log('App is ready, initializing...');

  createWindow();

  initializeServices();

  console.log('App initialization completed');

});



// Quit when all windows are closed, except on macOS. There, it's common

// for applications and their menu bar to stay active until the user quits

// explicitly with Cmd + Q.

app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {

    app.quit();

  }

});



app.on('activate', () => {

  // On OS X it's common to re-create a window in the app when the

  // dock icon is clicked and there are no other windows open.

  if (BrowserWindow.getAllWindows().length === 0) {

    createWindow();

  }

});



// In this file you can include the rest of your app's specific main process

// code. You can also put them in separate files and import them here.

