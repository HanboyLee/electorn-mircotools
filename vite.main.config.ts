import { defineConfig } from 'vite';
import { resolve } from 'path';
import { builtinModules } from 'module';

// 主进程是 Node/Electron，不是浏览器。内置模块必须 external；
// 业务 npm 依赖（如 archiver）应打进 bundle，因为 Forge 打包时会忽略 node_modules。
const nodeBuiltins = [
  ...builtinModules.filter((m) => m !== 'electron'),
  ...builtinModules.map((m) => `node:${m}`),
];

// https://vitejs.dev/config
export default defineConfig({
  build: {
    outDir: '.vite/build',
    target: 'node20',
    lib: {
      entry: resolve(__dirname, 'src/main/index.ts'),
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'electron',
        'electron-squirrel-startup',
        // 仅开发依赖，生产启动路径不会走到
        'electron-reloader',
        ...nodeBuiltins,
      ],
      output: {
        format: 'cjs',
        entryFileNames: '[name].js',
        dir: '.vite/build',
      },
    },
    minify: false,
    sourcemap: true,
    emptyOutDir: false,
  },
});
