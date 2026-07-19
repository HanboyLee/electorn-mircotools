# 文件打包 · Design System 摘要

> 來源：`ui-ux-pro-max` Skill（`scripts/search.py`）  
> 查詢：`desktop productivity batch file packaging zip archive workflow tool`  
> Dials：`--density 7` · `--motion 3` · `--variance 4`  
> 補充：`ux`（progress / empty / loading / disabled）、`icons`（folder/file/archive）、`stack react`（list）

---

## 1. Skill 原始建議 → 本項目決策

| 維度 | Skill 輸出 | 本項目決策 |
|------|------------|------------|
| Pattern | 功能演示 / Feature-rich | **批量桌面工具工作台**（對齊元數據寫入 / LLM 分析） |
| Style | Modern Dark / glass | **不套玻璃深色皮膚**；沿用 light / dark / blue |
| Color | 藍 `#2563EB` + 琥珀 CTA | **不硬套**；Primary → `token.colorPrimary`（藍主題約 `#4B9FE1`） |
| Typography | Plus Jakarta Sans | 系統 / antd 字體，不強制 Google Fonts |
| Motion | Subtle 300–400ms | 按鈕 loading、進度條；無 onboarding 輪播 |
| Density | 7/10 | 表格 + 底欄；適中間距 |
| Anti-pattern | 复杂 onboarding、慢动画 | 无 Steps 导览；无假长动画 |

### UX Domain 落地

| 规则 | Severity | 落地 |
|------|----------|------|
| Loading Buttons | High | 扫描 / 打包 CTA `loading` + `disabled` |
| Loading States | High | 扫描 Table loading；打包显示 **组进度 n/total**（禁止假 10% 递增糊弄） |
| Submit Feedback | High | 结束后结果摘要 + toast；失败可打开错误信息 |
| Progress Indicators | Medium | `已打包 i / 总数 m · 当前组名` |
| Empty States | Medium | 未选目录 / 无匹配组 两套空态与主操作 |
| Disabled clarity | Medium | 未选目录、无文件组、打包中 禁用「全部打包」原因可见（就绪检查） |

### Icons → antd

| 用途 | 概念 | 实现 |
|------|------|------|
| 选目录 | folder-open | `FolderOpenOutlined` |
| 重扫 | reload | `ReloadOutlined` |
| 打包 | archive / zip | `FileZipOutlined` |
| 打开打包目录（唯一） | folder-open | `FolderOpenOutlined` |

禁止 emoji 图标。

### React

- 文件组表 `rowKey` 用稳定 `id`（或 name+basePath），避免仅用 index  
- 组数很多时 Table 分页或虚拟（首版分页 20–50 即可）  

---

## 2. Token 映射

| 语义 | 原型 | 实现 |
|------|------|------|
| Primary | `#4B9FE1` | `token.colorPrimary` |
| Layout bg | `#F0F4F8` | 主题 layout |
| Card | `#FFFFFF` | `token.colorBgContainer` |
| Text | `#1F2937` | `token.colorText` |
| Secondary | `#6B7280` | `token.colorTextSecondary` |
| Border | `#E5E7EB` | `token.colorBorderSecondary` |
| Success / Warning / Error | 绿 / 橙 / 红 | antd token |
| Radius | 10px | `borderRadiusLG` |

---

## 3. 间距与动效

| 项 | 值 |
|----|-----|
| 页内边距 | 16–20px |
| 卡片间距 | 12px |
| 底栏高度 | 56–64px |
| Hover / focus | 150–200ms |
| prefers-reduced-motion | 关闭非必要 transition |

---

## 4. 与现有改版页一致性

| 页 | 对齐 |
|----|------|
| 元數據寫入 | 目录卡、就绪检查、底栏主 CTA |
| LLM 圖片分析 | 摘要统计、结果表、限高列表思维 |
| 設置 | 主题 token，不新开色板 |
