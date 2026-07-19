# LLM 圖片分析 · Design System 摘要

> 來源：`ui-ux-pro-max` Skill（`scripts/search.py`）  
> 查詢：`desktop productivity tool AI image analysis batch workflow professional`  
> Dials：`--density 7` · `--motion 4` · `--variance 4`  
> 補充 domain：`ux`（form / feedback / loading / batch）、`icons`（media/file）、`stack react`（list/loading）

---

## 1. Skill 原始建議（摘要）

| 維度 | Skill 輸出 | 本項目決策 |
|------|------------|------------|
| Pattern | AI / 個性化落地頁傾向 | **改採用批量工具工作台**（與元數據寫入、文件打包一致），非營銷落地頁 |
| Style | Modern Dark / cinematic glass | **不套玻璃拟态深色皮肤**；沿用 App 現有 light / dark / blue 主題 |
| Color | Teal `#0D9488` + Accent 橙 | **不硬套**；Primary → `token.colorPrimary`（藍主題約 `#4B9FE1`） |
| Typography | Inter | 沿用系統 / antd 字體，不強制 Google Fonts |
| Motion | Stagger list 300–450ms | 列表入場 ≤300ms；分析中用 Progress，不用夸张 overshoot |
| Density | 7/10 标准偏工具 | 卡片 12–16px 间距；底部固定操作栏 |
| Anti-pattern | 复杂 onboarding、慢动画 | **无引导轮播**；无 Steps 强制导览（熟练用户） |

### UX Domain 落地（高优先级）

| 规则 | Severity | 落地 |
|------|----------|------|
| Loading Buttons | High | 主 CTA `loading` + `disabled`，防重复提交 |
| Loading States | High | 全局进度条 + 每张图状态徽标（排队/分析中/成功/失败） |
| Submit Feedback | High | 结束后结果摘要 + message；失败可重试（设计预留） |
| Progress Indicators | Medium | `已完成 n / 总数 m` + 当前文件名 |
| Form Labels | High | 提示词 TextArea 有可见标签，不只靠 placeholder |
| Confirmation | Medium | 导出 CSV / 清除队列 有 toast 或二次确认（清除建议 confirm） |

### Icons（映射到 antd icons）

| 用途 | Skill 概念 | 实现 |
|------|------------|------|
| 上传 | upload-simple | `UploadOutlined` / `CloudUploadOutlined` |
| 图片 | image | `FileImageOutlined` |
| 导出 | download-simple | `DownloadOutlined` |
| 设置 / API | gear | `SettingOutlined` |
| 分析运行 | play | `PlayCircleOutlined` / `ThunderboltOutlined` |
| 提示词 | file / edit | `EditOutlined` / `FormOutlined` |

**禁止** emoji 当图标。

### React stack 注意

- **队列始终为列表**（无网格）：见 `ui-ux-review.md` §5.3 / §5.3.1  
  - 队列区固定 `max-height`，区内滚动，禁止整页无限增高  
  - `N ≥ 50`：虚拟列表（`react-window` / `@tanstack/react-virtual` 二选一，实现时再定）  
  - 行内小缩略图 Object URL **懒创建 + 离屏 revoke**  
  - 结果表 `N > 50`：虚拟滚动或分页 50/页  
- 列表 `key` 用稳定 id（文件名 + size + lastModified），避免仅用 index

---

## 2. Token 映射（原型 / 实现共用）

| 语义 | 原型 CSS 变量 | 实现 |
|------|---------------|------|
| Primary | `--primary: #4B9FE1` | `token.colorPrimary` |
| Layout bg | `--layout-bg: #F0F4F8` | 主题 layout 背景 |
| Card | `--card: #FFFFFF` | `token.colorBgContainer` |
| Text | `--text: #1F2937` | `token.colorText` |
| Secondary | `--text-secondary: #6B7280` | `token.colorTextSecondary` |
| Border | `--border: #E5E7EB` | `token.colorBorderSecondary` |
| Success | `--success: #16A34A` | `token.colorSuccess` |
| Warning | `--warning: #D97706` | `token.colorWarning` |
| Error | `--error: #DC2626` | `token.colorError` |
| Radius | `10px` | `token.borderRadiusLG` 或 8–10 |

Dark 主题：组件用 antd token，不在原型里另做一套深色（原型以 light + blue 主色示意）。

---

## 3. 间距与动效

| 项 | 值 |
|----|-----|
| 页面内边距 | 16–24px |
| 卡片间距 | 12–16px |
| 底部操作栏高度 | 56–64px |
| 缩略图 | 72×72 或 88×88，圆角 8 |
| Hover / focus | 150–200ms ease |
| 进度条更新 | 即时，无假动画拖慢 |
| `prefers-reduced-motion` | 关闭非必要 transition |

---

## 4. 无障碍清单（交付前）

- [ ] 正文对比度 ≥ 4.5:1  
- [ ] 主按钮与危险按钮可区分，不只靠颜色  
- [ ] 可点击区域有 `cursor: pointer`  
- [ ] Focus ring 可见（键盘）  
- [ ] 图标按钮有 `aria-label` 或可见文字  
- [ ] 分析中 `aria-busy` / 进度文案可读屏  
- [ ] 缩略图有文件名（alt 或旁注）  

---

## 5. 与现有页面一致性

| 页面 | 对齐点 |
|------|--------|
| 元數據寫入 | 底部固定 CTA 栏、就绪 checklist、结果摘要统计 |
| 設置 | API 配置跳转、Provider 状态徽章 |
| 文件打包 | 队列式文件处理感、成功/失败分态 |

**不**引入新 UI 库；继续 **antd + styled-components**。
