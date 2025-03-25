const { VitePlugin } = require('@electron-forge/plugin-vite');
const path = require('path');

module.exports = {
  packagerConfig: {
    asar: {
      unpack: "**/node_modules/electron-squirrel-startup/**/*"
    },
    icon: path.join(__dirname, 'src', 'assets', 'icon'),  
    extraResource: ['./exiftool-13.12_64'],
    // 確保所有依賴都被正確打包
    derefSymlinks: true,
    ignore: [
      /node_modules/,
      /src/,
      /out/,
      /forge\.config\.js/,
      /\.git/,
      function(filePath) {
        // 始终包含这些文件
        if (filePath.includes('exiftool-13.12_64')) {
          return false;
        }
        if (filePath.includes('node_modules/electron-squirrel-startup')) {
          return false;
        }
        if (filePath.includes('node_modules/archiver')) {
          return false;
        }
        if (filePath.includes('.vite/build')) {
          return false;
        }
        return filePath.includes('node_modules');
      }
    ]
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
