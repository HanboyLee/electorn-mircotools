const fs = require('fs-extra');
const path = require('path');

// 要複製的模組列表
const modulesToCopy = ['archiver'];

// 源目錄和目標目錄
const sourceDir = path.join(__dirname, '..', 'node_modules');
const targetDir = path.join(__dirname, '..', '.vite', 'build', 'node_modules');

// 確保目標目錄存在
fs.ensureDirSync(targetDir);

// 複製每個模組
modulesToCopy.forEach(moduleName => {
  const source = path.join(sourceDir, moduleName);
  const target = path.join(targetDir, moduleName);
  
  console.log(`Copying ${moduleName} from ${source} to ${target}...`);
  
  try {
    // 刪除目標目錄中的現有模組（如果存在）
    if (fs.existsSync(target)) {
      fs.removeSync(target);
    }
    
    // 複製模組
    fs.copySync(source, target, { overwrite: true });
    
    console.log(`Successfully copied ${moduleName}`);
  } catch (error) {
    console.error(`Error copying ${moduleName}:`, error);
  }
});

console.log('Module copying completed');
