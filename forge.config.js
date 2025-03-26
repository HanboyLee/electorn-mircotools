const { VitePlugin } = require('@electron-forge/plugin-vite');
const path = require('path');

module.exports = {
  packagerConfig: {
    asar: {
      unpack: ['**/node_modules/electron-squirrel-startup/**/*', '**/node_modules/adm-zip/**/*'],
    },
    icon: path.join(__dirname, 'src', 'assets', 'icon'),
    extraResource: ['./exiftool-13.12_64', './node_modules/adm-zip'],
    ignore: [
      /src/,
      /out/,
      /forge\.config\.js/,
      /\.git/,
      function (filePath) {
        // 始终包含这些文件
        if (filePath.includes('exiftool-13.12_64')) {
          return false;
        }
        if (filePath.includes('node_modules/electron-squirrel-startup')) {
          return false;
        }
        if (filePath.includes('node_modules/adm-zip')) {
          return false;
        }
        if (filePath.includes('.vite/build')) {
          return false;
        }
        return filePath.includes('node_modules');
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
        skipUpdateIcon: true,
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
          outDir: '.vite/build',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          outDir: '.vite/build',
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
