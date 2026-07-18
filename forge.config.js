const { VitePlugin } = require('@electron-forge/plugin-vite');
const path = require('path');

module.exports = {
  packagerConfig: {
    asar: {
      unpack: "**/node_modules/electron-squirrel-startup/**/*"
    },
    icon: path.join(__dirname, 'src', 'assets', 'icon'),  
    extraResource: ['./exiftool-13.12_64'],
    // 主进程依赖应尽量由 Vite 打进 .vite/build（见 vite.main.config.ts）。
    // 此处只额外放行必须落在磁盘上的路径；不要再依赖 node_modules 里的业务包。
    ignore: [
      /node_modules/,
      /src/,
      /out/,
      /forge\.config\.js/,
      /\.git/,
      function (filePath) {
        // ignore: true = 排除；false = 打进安装包
        if (!filePath) return false;
        if (filePath.includes('exiftool-13.12_64')) {
          return false;
        }
        if (filePath.includes('node_modules/electron-squirrel-startup')) {
          return false;
        }
        // macOS / 部分 Windows：exiftool-vendored 运行时要找平台二进制（不在 JS bundle 内）
        if (
          filePath.includes('node_modules/exiftool-vendored.pl') ||
          filePath.includes('node_modules/exiftool-vendored.exe')
        ) {
          return false;
        }
        if (filePath.includes('.vite/build')) {
          return false;
        }
        // 其余 node_modules 一律不进包（避免体积膨胀；业务代码须已 bundle）
        if (filePath.includes('node_modules')) {
          return true;
        }
        return false;
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
