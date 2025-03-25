import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    outDir: '.vite/build',
    lib: {
      entry: resolve(__dirname, 'src/main/index.ts'),
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'electron',
        'electron-squirrel-startup',
        'fs',
        'path',
        'os',
        'child_process',
        'archiver'
      ],
      output: {
        format: 'cjs',
        entryFileNames: '[name].js',
        dir: '.vite/build'
      },
    },
    minify: false,
    sourcemap: true,
    emptyOutDir: false,
  },
});
