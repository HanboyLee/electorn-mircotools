const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: './src/main',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['electron'],
      output: {
        entryFileNames: '[name].js',
      },
    },
    outDir: '.vite/build',
    emptyOutDir: true,
    // 启用源映射以便于调试
    sourcemap: true,
    // 在开发模式下启用监视模式
    watch: process.env.NODE_ENV === 'development' ? {} : null,
  },
  define: {
    MAIN_WINDOW_VITE_PRELOAD: `"${path.resolve(__dirname, '.vite/build/preload.js')}"`,
    MAIN_WINDOW_VITE_ENTRY: `"${path.resolve(__dirname, '.vite/renderer/index.html')}"`,
  },
};
