# 設置頁 · Design System（ui-ux-pro-max）

> 生成命令（摘要）：  
> `search.py "desktop utility productivity tool settings preferences API configuration dark mode" --design-system -p "MicroTools Settings" --density 7 --motion 3`  
> 補充：`ux`（form / navigation / feedback）、`icons`、`stack react`

---

## 1. Design Dials

| Dial | 取值 | 含義 |
|------|------|------|
| Density | **7** | 桌面工具偏緊湊，間距用 8–24px，避免大面積空白 |
| Motion | **3** | 克制微交互；150–300ms；無複雜 onboarding / scroll 動畫 |
| Variance | 默認 | 對稱、清晰層級，不走 Brutalism / 非對稱實驗風 |

---

## 2. Skill 原始建議 vs 本項目落地

| 維度 | Skill 建議 | 本項目落地 |
|------|------------|------------|
| Pattern | Feature-rich / CTA 靠前 | 設置頁：**antd Tabs**；可配置 Tab **各自固定保存 CTA**，無行銷 Hero |
| Style | Micro-interactions | hover / loading / success Alert 150–300ms |
| Color | Teal `#0D9488` + 橙 Accent | **不硬套**；用 antd `token.colorPrimary` / success / error / warning |
| Typography | Inter | 沿用系統字體 + antd 默認；不強制引入 Google Fonts |
| Icons | Phosphor Gear | 使用現有 `@ant-design/icons`（`SettingOutlined` 等） |
| Mode | Light + Dark full | 已有 light / dark / blue 三主題 |
| Anti-pattern | 複雜 onboarding、慢動畫 | 無引導輪播；切分區無整頁閃爍 |

---

## 3. 色板映射（Semantic → antd token）

| 語義 | 用途 | Token / 行為 |
|------|------|----------------|
| Primary | 主按鈕、激活導航、焦點環 | `token.colorPrimary` |
| On Primary | 主按鈕文字 | `#fff` / token 默認 |
| Background | 頁面底 | `token.colorBgLayout` |
| Card / Surface | 內容卡片 | `token.colorBgContainer` |
| Border | 分割線、卡片邊框 | `token.colorBorderSecondary` |
| Text | 主文案 | `token.colorText` |
| Text Secondary | 說明、extra | `token.colorTextSecondary` |
| Success | 連接成功、已是最新 | `token.colorSuccess` |
| Warning | 有更新、未保存 | `token.colorWarning` |
| Error / Destructive | 連接失敗、校驗錯誤 | `token.colorError` |
| Fill muted | 次級背景、主題預覽底 | `token.colorFillAlter` |

**禁止**：在組件內寫死 Skill 的 `#0D9488` / `#EA580C`，以免破壞 dark / blue 主題一致性。

---

## 4. 間距與密度

| Token | 值 | 用途 |
|-------|-----|------|
| `--space-1` | 4px | 微間距 |
| `--space-2` | 8px | 圖標與文字、表單字段內 |
| `--space-3` | 12px | 卡片內區塊 |
| `--space-4` | 16px | 卡片 padding、分區間 |
| `--space-5` | 24px | 頁頭與內容、字段組 |
| `--space-6` | 32px | 少用；僅大區塊分隔 |

表單：`layout="vertical"`，`Form.Item` 間距保持 antd 默認偏緊即可。

---

## 5. 字體層級

| 層級 | 規格 | 用途 |
|------|------|------|
| Page title | 18–20px / 600 | 「設置」 |
| Section title | 15–16px / 600 | 右側當前分區標題 |
| Body | 14px / 400，line-height 1.5 | 表單標籤、說明 |
| Helper | 12–13px / secondary | extra、狀態說明 |
| Mono (可選) | 12px | API Key 遮罩預覽、版本號 |

---

## 6. 圓角與陰影

| 元素 | 圓角 | 陰影 |
|------|------|------|
| 卡片 | 10px | `0 1px 3px rgba(0,0,0,.06)` 或 token |
| 導航項 | 8px | 無；active 用 fill + primary 文字 |
| 主題預覽卡 | 8–10px | 選中時 2px primary 邊框 |
| 底部操作欄 | 頂部 0；可 sticky | 頂部分割線 + 輕陰影上浮 |

---

## 7. 動效規範

| 交互 | 時長 | 說明 |
|------|------|------|
| Hover 背景 / 邊框 | 150ms | 導航、按鈕、主題卡 |
| 按鈕 loading | 即時 | 禁用雙擊 |
| 分區切換 | ≤200ms 或瞬切 | 無整頁 slide |
| Alert 出現 | 200ms fade | success / error |
| Theme 切換 | 見交互規格 | 目標：保存後無整頁 reload（實現階段評估） |

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. UX 規則落地清單（設置頁）

| 規則 | 嚴重度 | 落地 |
|------|--------|------|
| Submit Feedback | High | 保存 → loading → toast 成功/失敗 |
| Loading Buttons | High | 保存 / 測試連接 / 檢查更新 均 loading + disabled |
| Form Labels | High | 所有字段可見 label，不只 placeholder |
| Password Visibility | Medium | API Key 使用 Password 可顯示切換 |
| Inline Validation | Medium | Key 格式 blur / 提交時校驗；錯誤就近顯示 |
| Active State (nav) | Medium | 左側當前分區高亮 |
| Confirmation Messages | Medium | 保存成功 toast；連接結果 Alert |
| Keyboard Navigation | High | Tab 順序：導航 → 字段 → 測試 → 保存 |
| Reduced Motion | High | 見上 |
| No emoji icons | High | 僅 `@ant-design/icons` |
| Touch target | Medium | 桌面優先，可點區域 ≥ 32px 高，理想 36–40px |

---

## 9. React / antd 約束

- 技術棧：React + antd + styled-components（與全站一致）
- 表單：antd `Form` 受控；設置仍走 `useSettingsStore` + electron-store
- 狀態：頁內 `activeSection`、`hasUnsavedChanges`；API 測試沿用現有 hooks
- 勿為設置頁引入新 UI 庫
