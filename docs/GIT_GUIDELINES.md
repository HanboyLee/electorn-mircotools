# Git 提交規範指南

## 目錄
1. [分支管理](#分支管理)
2. [提交信息規範](#提交信息規範)
3. [工作流程](#工作流程)
4. [代碼審查](#代碼審查)
5. [版本發布](#版本發布)

## 分支管理

### 主要分支
- `main`: 生產環境主分支  
- `develop`: 開發分支  
- `release/*`: 用於發布前準備  
- `feature/*`: 用於新功能開發  
- `hotfix/*`: 用於緊急修復生產環境問題

### 分支命名規範
- 功能分支：`feature/功能名稱-簡短描述`  
  例：`feature/network-monitor`  
- 修復分支：`hotfix/問題簡述`  
  例：`hotfix/api-key-validation`  
- 發布分支：`release/版本號`  
  例：`release/v1.0.1`

## 提交信息規範

### 格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 類型
- `feat`: 新功能
- `fix`: 錯誤修復
- `docs`: 文檔更改
- `style`: 代碼格式修改
- `refactor`: 代碼重構
- `perf`: 性能優化
- `test`: 測試相關
- `chore`: 構建過程或輔助工具的變動

### Scope 範圍
- `core`: 核心功能
- `ui`: 界面相關
- `api`: API 相關
- `network`: 網絡相關
- `settings`: 設置相關
- `file`: 文件處理
- `deps`: 依賴更新

### Subject 主題
- 使用現在時態
- 不超過 50 個字符
- 首字母不大寫
- 結尾不加句號

### 示例
```
feat(network): add real-time google connectivity check

- Add network service to check google connectivity every 30 seconds
- Create IPC channels for network status transmission
- Implement status indicator in sidebar

Closes #456
```

## 工作流程

### 1. 開始新功能
```bash
# 從 develop 分支創建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/new-feature
```

### 2. 日常提交
```bash
# 添加修改
git add .
# 提交修改
git commit -m "feat(scope): description"
# 定期同步 develop 分支
git fetch origin develop
git rebase origin/develop
```

### 3. 完成功能
```bash
# 合併回 develop 分支
git checkout develop
git merge --no-ff feature/new-feature
git push origin develop
```

## 代碼審查

### 提交 PR 前檢查清單
- [ ] 代碼符合項目規範
- [ ] 所有測試通過
- [ ] 更新相關文檔
- [ ] 添加必要的註釋
- [ ] 移除調試代碼
- [ ] 確認無未使用的導入
- [ ] 確認提交信息規範

### PR 描述模板
```markdown
## 變更說明
簡要描述此次變更的內容

## 測試說明
描述如何測試這些變更

## 相關問題
關聯的 Issue 編號

## 截圖（如果適用）
相關的界面截圖
```

## 版本發布

### 版本號規範
遵循 [Semantic Versioning](https://semver.org/)：
- MAJOR：不兼容的 API 變更
- MINOR：向後兼容的功能新增
- PATCH：向後兼容的問題修復

### 發布流程
1. 從 develop 分支創建 release 分支
   ```bash
   git checkout -b release/v1.2.0 develop
   ```

2. 更新版本號和更新日誌
   ```bash
   # 更新 package.json
   npm version minor
   ```

3. 提交變更
   ```bash
   git commit -m "chore(release): v1.2.0"
   ```

4. 合併到 main 和 develop
   ```bash
   git checkout main
   git merge --no-ff release/v1.2.0
   git tag -a v1.2.0 -m "version 1.2.0"
   
   git checkout develop
   git merge --no-ff release/v1.2.0
   ```

## 最佳實踐

### 1. 提交頻率
- 小步提交，保持提交的原子性
- 相關的改動放在同一個提交
- 不同功能的改動分開提交

### 2. 提交信息
- 清晰描述改動的內容
- 說明改動的原因
- 提供足夠的上下文

### 3. 分支管理
- 及時同步和合併分支
- 解決衝突後測試
- 定期清理過期分支

### 4. 代碼審查
- 認真檢查每個變更
- 提供建設性的反饋
- 確保代碼質量
