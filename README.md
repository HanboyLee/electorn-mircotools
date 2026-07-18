# Metadata Desktop（electorn-mircotools）

基于 **Electron + React + TypeScript** 的桌面小工具集合，面向图片/媒体 **元数据写入与校验**、文件打包与 LLM 辅助分析。

当前版本：**1.3.1**  
仓库：https://github.com/HanboyLee/electorn-mircotools  
安装包：https://github.com/HanboyLee/electorn-mircotools/releases

---

## 功能概览

| 模块 | 说明 |
|------|------|
| **元数据写入**（CsvValidator） | 选择目录、上传 CSV、匹配统计与就绪检查，批量写入关键字等元数据（含 JPEG / PNG 等） |
| **LLM 图片分析**（AnalyzeByImage） | 结合配置的 API，对图片做分析辅助 |
| **文件打包**（FilePackaging） | 本地文件打包相关能力 |
| **设置** | 主题与 OpenAI / OpenRouter 等 API 配置 |
| **网络状态** | 侧栏网络连通性指示 |

主流程依赖本机资源（如打包进应用的 ExifTool），**以 Windows 为主发布目标**。

---

## 技术栈

- **桌面**：Electron 33 + Electron Forge  
- **前端**：React 18、TypeScript、antd、styled-components  
- **构建**：Vite（主进程 / preload / 渲染进程）  
- **测试**：Vitest  
- **元数据**：exiftool-vendored、exifr 等  

> 旧文档中的 Material-UI / Webpack 已移除，请以本 README 为准。

---

## 环境要求

- **Node.js** ≥ 20  
- **包管理**：仅使用 **npm**（`package-lock.json`；请勿再引入 `yarn.lock`）  
- 开发机：macOS / Windows 均可；正式安装包由 CI 在 **Windows** 上构建  

---

## 本地开发

```bash
# 安装依赖
npm ci
# 或首次 / 无 lock 同步时
npm install

# 启动（按系统）
npm run start:mac    # macOS
npm run start:win    # Windows（UTF-8 控制台）

# 质量检查
npm test             # Vitest
npm run lint         # ESLint
npm run format:check # Prettier（可选）
```

### 本地打包

```bash
npm run package   # 打包未安装目录
npm run make      # 生成安装产物（Windows 上为 Squirrel 等）
```

产物目录：`out/`（已在 `.gitignore`，不要提交）。

---

## 下载安装包（用户）

1. 打开 [Releases](https://github.com/HanboyLee/electorn-mircotools/releases)  
2. 选择版本（例如 [v1.3.1](https://github.com/HanboyLee/electorn-mircotools/releases/tag/v1.3.1)）  
3. 下载 **`metadata-app-setup.exe`** 并安装  

说明：当前发布包**未做代码签名**，Windows 可能出现 SmartScreen 提示，属预期；内测可选择「仍要运行」。

---

## Git 与协作（一人主干）

默认分支：**`master`**（仅长期保留此分支）。

| 场景 | 做法 |
|------|------|
| 小改（文案、极小 fix） | 可直推 `master` |
| 功能 / 重构 / 打包 / CI | `feature/<短名>` → PR → CI 绿后自己合并 |
| 发版 | 见下文；**不要**用 merge 代替打 tag |

`master` 已开启 **Branch protection**：

- 合并 PR 前需通过 status check **`Lint & test`**  
- 禁止 force-push / 删除 `master`  
- **不要求** Reviewer 审批（单人开发）  

更细的触发约定见仓库内 agent skill（本地）：`solo-trunk-cicd`。

---

## CI / CD

| 流水线 | 触发 | 做什么 |
|--------|------|--------|
| **CI** | `pull_request` / `push` → `master` | `npm ci` → lint（暂不阻断合并）→ test |
| **CD** | 推送 tag **`v*`**（如 `v1.3.1`） | Windows 上 `npm run make` → 上传 [GitHub Release](https://github.com/HanboyLee/electorn-mircotools/releases) |

工作流文件：

- `.github/workflows/ci.yml`  
- `.github/workflows/release.yml`  

**合并到 `master` ≠ 发版**；只有推送符合 `v*` 的 tag 才会构建并挂安装包。

### 发版步骤（维护者）

```bash
git checkout master && git pull origin master

# 1. 更新 package.json 的 version
# 2. 更新 CHANGELOG.md（将 [Unreleased] 收成正式版本段）
git add package.json CHANGELOG.md
git commit -m "chore(release): vX.Y.Z"
git push origin master

# 3. 打 tag 并推送（触发 CD）
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
```

然后在 Actions 查看 **Release** 任务，在 Releases 页确认 `metadata-app-setup.exe` 等资源。

---

## 目录结构（简要）

```text
src/
  main/           # Electron 主进程
  preload.ts      # 预加载 / IPC 桥
  pages/          # 业务页面（元数据写入、分析、打包、设置…）
  services/       # 主进程侧服务能力
  components/     # 布局与通用 UI
forge.config.js   # Electron Forge + Vite + makers
.github/workflows # CI / CD
CHANGELOG.md      # 全局变更日志（推送前请维护）
```

---

## 文档与变更记录

- 变更日志：[CHANGELOG.md](./CHANGELOG.md)  
- 架构与其它说明：`docs/`  
- 许可证说明：`docs/LICENSE.md`  

---

## 许可证

见仓库内 `docs/LICENSE.md` 与 `package.json` 的 `license` 字段（MIT）。
