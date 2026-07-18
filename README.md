# Metadata Desktop

Windows 优先的 **Electron 桌面工具**，用来批量处理图片元数据、用 AI 生成描述关键词，并把相关文件打成 ZIP。

适合：需要给大量图片写 **标题 / 描述 / 关键词**（例如素材库、投稿、归档），又不想一张张用 Exif 工具手改的人。

发布安装包：**Windows**（setup.exe）与 **macOS**（**.dmg** 为主，并附 zip）均由 CI 构建；元数据写入在 Windows 上验证最充分。

---

## 这个项目是干什么的？

手动给几百张图写元数据又慢又容易错。本应用把常见流程收成几个页面：

1. **用 CSV 批量写入**图片元数据（核心）  
2. **用 LLM 看图**，生成标题/描述/关键词，并可导出成 CSV，再拿去写入  
3. **按规则把文件打成 ZIP**，方便交付或归档  
4. 在 **设置** 里配置 AI API；侧栏可看网络状态  

底层通过 **ExifTool** 读写图片元数据（安装包内已带 Windows 用资源）。

---

## 具体能做什么？

### 1. 元数据写入（侧栏：元数据写入）

把表格里的信息写进目录中的对应图片。

**典型流程：**

1. 选择放图片的文件夹（支持 `.jpg` / `.jpeg` / `.png`）  
2. 上传 CSV（内容与文件名对应）  
3. 应用检查：CSV 是否合法、文件名是否在目录中都能匹配  
4. 确认后点 **开始写入元数据**，在原目录改图片文件  
5. 查看写入结果摘要（成功 / 跳过 / 失败）  

**CSV 必需列（顺序）：**

```text
FileName,Title,Description,Keywords
```

- `FileName`：与目录中图片文件名对应  
- `Title` / `Description` / `Keywords`：写入图片的标题、描述、关键词  

非法 CSV 或未匹配到的文件不会当成「可写入就绪」状态。

---

### 2. LLM 图片分析（侧栏：LLM 图片分析）

上传图片，调用你在设置里配置的 AI 服务，为每张图生成分析结果（标题、描述、关键词等），可导出 CSV，便于再走「元数据写入」。

使用前需在 **设置** 中配置可用的 API Key（如 OpenAI / OpenRouter）并测通。

---

### 3. 文件打包（侧栏：文件打包）

选择目录 → 扫描并分组文件 → 勾选需要的组 → 打成 ZIP，适合批量交付或备份相关素材。

---

### 4. 设置 / 系统调试

| 页面 | 作用 |
|------|------|
| **设置** | API Key、模型、分析提示词、主题等 |
| **系统调试** | 本地文件读写、系统信息等调试能力（开发/排查用） |

---

## 普通用户：安装与使用（推荐）

不需要装 Node，直接用安装包。

### 安装

1. 打开发布页：  
   https://github.com/HanboyLee/electorn-mircotools/releases  
2. 进入最新版本（例如 [v1.3.4](https://github.com/HanboyLee/electorn-mircotools/releases/tag/v1.3.4)）  
3. 按系统下载：

| 系统 | 下载文件 | 怎么用 |
|------|----------|--------|
| **Windows** | `metadata-app-setup.exe` | 双击安装向导完成安装 |
| **macOS（推荐）** | `metadata-app.dmg`（或类似 `.dmg` 名） | 打开 dmg → 将 `.app` 拖到「应用程序」→ 从启动台打开 |
| **macOS（备用）** | `metadata-app-darwin-*-*.zip` | 解压得到 `.app`，拖到「应用程序」或直接打开 |

> **签名说明（未签名时的正常现象）**  
> - Windows：SmartScreen 可能拦截，选「仍要运行 / 更多信息」。  
> - macOS：可能提示「无法验证开发者」：系统设置 → 隐私与安全性 → 仍要打开；或首次在 App 上右键 → 打开。

### 使用（元数据写入示例）

1. 打开应用，进入 **元数据写入**  
2. 选图片目录 → 上传符合格式的 CSV  
3. 看匹配统计与就绪检查是否通过  
4. 点击 **开始写入元数据**  
5. 在结果区确认是否写完  

若要用 AI 分析，先到 **设置** 配好 Key，再到 **LLM 图片分析**。

---

## 开发者：从源码安装与运行

### 环境

- Node.js **≥ 20**  
- 仅使用 **npm**（仓库使用 `package-lock.json`）  

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/HanboyLee/electorn-mircotools.git
cd electorn-mircotools

# 安装依赖（推荐，与 lock 一致）
npm ci
```

若本地没有 lock 或需要更新依赖，再用 `npm install`。

### 启动应用

```bash
# macOS
npm run start:mac

# Windows
npm run start:win
```

会启动 Electron 开发窗口（Forge + Vite）。

### 常用命令

```bash
npm test              # 单元测试
npm run lint          # 代码检查
npm run format:check  # 格式检查

npm run package       # 打出未安装的应用目录
npm run make          # 生成安装包（Windows 上为 setup.exe 等）
```

- 本地打包产物在 **`out/`**，不要提交到 Git。  
- 正式给别人的安装包，以 GitHub Actions 在 Windows 上 `make` 后传到 Releases 为准。

---

## 项目结构（简要）

```text
src/
  main/          # Electron 主进程
  preload.ts     # 预加载 / 与页面通信
  pages/         # 各功能页
    CsvValidator/    # 元数据写入
    AnalyzeByImage/  # LLM 图片分析
    FilePackaging/   # 文件打包
    Settings/        # 设置
    Home/            # 系统调试
  services/      # 文件、元数据、压缩等服务
  components/    # 布局、侧栏等
forge.config.js  # 打包配置（含 ExifTool 等资源）
```

更细的变更见 [CHANGELOG.md](./CHANGELOG.md)。

---

## 版本与反馈

- 当前应用版本见 `package.json` 的 `version`（现为 **1.3.4**）  
- 问题与需求：在 GitHub 仓库提 Issue  
- 仓库：https://github.com/HanboyLee/electorn-mircotools  
