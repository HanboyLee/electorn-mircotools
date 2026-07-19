# 更新日志

所有重要变更记录在此。格式参考 [Keep a Changelog](https://keepachangelog.com/)，版本遵循语义化版本思路。

> **维护约定**：推送 Git 前必须根据本次提交涉及的改动更新本文件（见 `AGENTS.md`）。

## [Unreleased]

（暂无）

## [1.3.7] - 2026-07-19

### 变更
- `src/services` 按业务域重组：`_shared` / `platform` / `file-packaging` / `csv-validator`，统一经 `index` 出口；主进程与网络状态相关 import 改为从总出口引用（行为不变）
- `.gitignore` 忽略本地目录 `.compound-engineering/`
- LLM 圖片分析页 UI 改版：就绪检查（OpenAI/OpenRouter）、提示词默认折叠、始终列表队列（限高滚动）、分项进度、结果摘要表格与底部操作栏；**不修改**分析提示词预设内容（`docs/ImageAnalysis/` 设计文档）
- 文件打包页 UI 改版：工作目录（选目录 / 打开打包目录）、只读文件组表、唯一「全部打包」、真实组进度 i/m、结果摘要；去掉重扫/勾选打包/单组打包/行内详情（`docs/FilePackaging/`）

## [1.3.6] - 2026-07-18

### 变更
- 设置页 UI：改为 Tabs（外觀與語言 / AI 服務 / 關於與更新），各配置 Tab 独立保存；主题预览卡；Settings 改为 Context 共享以实现主题热更新
- 设置页「检查更新」不再重复弹出顶部更新横幅（页内已展示版本信息）

### 修复
- 应用内「更新说明」：当 GitHub Release 正文仅为自动生成的 Full Changelog 链接时，回退读取 `CHANGELOG.md` 对应版本段；CD 发版改为用 CHANGELOG 写入 Release body

## [1.3.5] - 2026-07-18

### 新增
- 应用内更新（免费方案）：启动/设置页检查 GitHub Releases；有版本差异且存在本平台安装包时才显示「立即更新」；点击后直接下载并打开安装程序（无打开 Release 页入口）

### 变更
- 更新体验：更新前确认、分平台安装引导（Win 可一键关闭应用 / Mac 说明拖入应用程序）、下载进度显示已传字节、失败可重试、「稍后」同版本 3 天内不再弹横幅；接入 antd `App` 以消除静态 message 上下文警告

## [1.3.4] - 2026-07-18

### 新增
- macOS 发布 **`.dmg` 安装镜像**（`@electron-forge/maker-dmg`）；Releases 同时保留 zip 作为备用

### 变更
- README / 发版说明：Mac 优先下载 dmg，拖入「应用程序」使用

## [1.3.3] - 2026-07-18

### 新增
- CD 同时构建 **Windows** 与 **macOS** 安装/分发产物：Windows 为 `metadata-app-setup.exe`，macOS 为 Forge zip（内含 `.app`），一并挂到同一 GitHub Release

### 变更
- Release 工作流改为矩阵构建 + 汇总发布，避免只出 Windows 包
- 打包放行 `exiftool-vendored.pl` / `.exe`，便于 macOS 使用 vendored ExifTool 写元数据

## [1.3.2] - 2026-07-18

### 修复
- Windows 安装包启动即报 `Cannot find module 'archiver'`：将 `archiver` 改为 ESM import 并由 Vite 打进主进程 bundle；完善 `vite.main.config.ts` 对 Node 内置模块的 external，避免安装目录无 `node_modules` 时主进程崩溃

### 变更
- 重写根目录 `README.md`：突出项目用途与各模块作用，以及用户安装 / 开发者运行步骤

## [1.3.1] - 2026-07-18

### 新增
- GitHub Actions CI（`.github/workflows/ci.yml`）：`pull_request` / `push` 到 `master` 时执行安装依赖、lint（暂不阻断）、test
- GitHub Actions CD（`.github/workflows/release.yml`）：推送 `v*` tag（或手动 workflow_dispatch）时在 Windows 上 `npm run make` 并上传 GitHub Release

### 变更
- 包管理统一为 npm（移除 `yarn.lock`，保留 `package-lock.json`）
- 补齐 ESLint React 插件（`eslint-plugin-react`、`eslint-plugin-react-hooks`）
- `npm test` 增加 `--passWithNoTests`（远程未入库测试时 CI 不因「无测试文件」失败）
- `package.json` 版本对齐为 `1.3.1`（`engines.node >= 20`）

## [1.3.0] - 2026-07-18

### 新增
- 元数据写入页 UI 改版：目录卡片、CSV 上传、匹配统计、就绪检查、底部主操作「开始写入元数据」、写入结果摘要（无 Steps 向导条）
- 元数据写入纯逻辑与会话编排（`logic/metadataWriteLogic`、`metadataWriteSession`），支持就绪门闩与缺失文件跳过
- Vitest 测试脚手架（`npm test`）；单元测试目录规范为模块旁 `__tests__/`（测试文件本地保留、不入库）
- 元数据写入 UI/UX 设计文档与原型（`docs/MetadataWrite/`）

### 变更
- 侧栏/快捷菜单文案对齐功能：系统调试、元数据写入、LLM 图片分析；移除无效「帮助」入口；同步设置页标题
- 全局 changelog 迁至仓库根目录 `CHANGELOG.md`（原 `docs/CHANGELOG.md`）
- `.gitignore` 忽略 `**/__tests__/`、`*.test.ts` / `*.spec.ts` 与 `test-fixtures/`，避免测试与夹具误推

### 修复
- 非法 CSV 不再被当作可写入就绪状态
- PNG 关键字写入：补充 `XMP-dc:Subject` 与 `IPTC:Keywords`，避免仅 JPEG 可见关键字
- 写入进行中正确刷新 loading /「写入中…」状态

### 优化
- 依赖增加 Vitest；`package.json` 增加 `test` / `test:watch` 脚本

## [1.2.0] - 2026-07-16

### 变更
- 清理构建配置：移除过时 Webpack 与重复的 Vite JS 配置，Electron Forge 仅保留 TypeScript Vite 链路
- 修复页面路由：删除 MUI 占位 `Home`/`Settings`，路由统一到 antd 实现
- 移除「打包历史」功能页，保留文件打包相关 IPC
- 本地 AI 工具目录写入 `.gitignore`，避免误推 GitHub

### 优化
- 精简 `zipService` 与相关类型、IPC 常量

## [1.1.0] - 2025-03-25

### 新增
- OpenRouter 图片分析与设置页模型选择
- 图片分析提示词自定义编辑
- 自定义窗口标题栏；侧边菜单可展开/收起
- 打包工具与打包历史记录

### 优化
- 滚动条样式随主题风格变更
- 依赖与锁文件更新

### 修复
- 若干稳定性问题修复

## [1.0.1] - 2025-02-13

### 新增
- 网络状态监控，Google 可访问性实时检测
