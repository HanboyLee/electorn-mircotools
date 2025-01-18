const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const { VitePlugin } = require('@electron-forge/plugin-vite');
const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'metadata-app',
        authors: 'Your Name',
        description: 'Metadata Desktop Application',
        setupIcon: path.join(__dirname, 'assets', 'icon.ico'), // 安裝程序圖標
        iconUrl: path.join(__dirname, 'assets', 'icon.ico'), // 應用程序圖標
        loadingGif: path.join(__dirname, 'assets', 'loading.gif'), // 安裝時的加載動畫
        setupExe: 'MetadataDesktop-Setup.exe', // 安裝程序文件名
        noMsi: true, // 不創建 MSI 安裝包
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32'],
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
      // 开发服务器选项
      devServer: {
        hmr: true,
        watch: true,
      },
      // 构建选项
      build: [
        {
          entry: path.join(__dirname, 'src', 'index.ts'),
          config: 'vite.main.config.js',
        },
        {
          entry: path.join(__dirname, 'src', 'preload.ts'),
          config: 'vite.preload.config.js',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.js',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
