// 確保 archiver 模組在打包時被正確安裝
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('正在檢查 archiver 依賴...');

try {
  // 檢查 node_modules 目錄是否存在
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('node_modules 目錄不存在，正在創建...');
    fs.mkdirSync(nodeModulesPath, { recursive: true });
  }

  // 檢查 archiver 是否已安裝
  const archiverPath = path.join(nodeModulesPath, 'archiver');
  if (!fs.existsSync(archiverPath)) {
    console.log('archiver 模組不存在，正在安裝...');
    // 安裝 archiver
    execSync('npm install archiver --save', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('archiver 安裝完成');
  } else {
    console.log('archiver 模組已存在');
  }

  // 確保 archiver 的依賴也被安裝
  const fsExtraPath = path.join(nodeModulesPath, 'fs-extra');
  if (!fs.existsSync(fsExtraPath)) {
    console.log('fs-extra 模組不存在，正在安裝...');
    execSync('npm install fs-extra --save', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
  }

  const readableStreamPath = path.join(nodeModulesPath, 'readable-stream');
  if (!fs.existsSync(readableStreamPath)) {
    console.log('readable-stream 模組不存在，正在安裝...');
    execSync('npm install readable-stream --save', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
  }

  console.log('所有依賴檢查完成');
} catch (error) {
  console.error('安裝依賴時出錯:', error);
  process.exit(1);
}
