const { VitePlugin } = require('@electron-forge/plugin-vite');
const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    ignore: [
      // /^\/src/,
      // /^\/out/,
      // /^\/\.env/,
      // /^\/\.[^/]+/,
      // /^\/vite\.config\.(js|ts)/,
      // /^\/forge\.config\.js/,
      // /^\/package(-lock)?\.json/,
      // /^\/tsconfig\.json/,
      (filePath) => {
        // 不忽略 electron-squirrel-startup
        if (filePath.includes('node_modules/electron-squirrel-startup')) {
          return false;
        }
        // 不忽略 .vite/build 目录及其内容
        if (filePath.includes('.vite/build')) {
          return false;
        }
        // 默认不忽略其他文件
        return filePath.includes('node_modules') && !filePath.includes('electron-squirrel-startup');
      },
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'metadata-app',
        authors: 'hanboy',
        description: 'Metadata Desktop Application',
        setupIcon: './src/assets/icon.ico',
        loadingGif: './src/assets/installing.gif',
        noMsi: true,
        remoteReleases: '',
        setupExe: 'metadata-app-setup.exe',
        skipUpdateIcon: true
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new VitePlugin({
      build: [
        {
          entry: 'src/main/index.ts',
          config: 'vite.main.config.ts',
          outDir: '.vite/build'
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          outDir: '.vite/build'
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.config.ts',
          entry: 'index.html',
        },
      ],
    }),
  ],
};
