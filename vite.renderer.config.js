const path = require('path');
const react = require('@vitejs/plugin-react');

module.exports = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: '.vite/renderer',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
  root: '.',
  publicDir: 'public',
};