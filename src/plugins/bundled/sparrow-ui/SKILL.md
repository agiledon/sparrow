# Sparrow UI Exploration — UI 设计探索引擎

> 本引擎为 sparrow-requirement 的阶段三（UI 设计探索）提供增强的 UI 设计能力。

## 输出目录

所有 UI 相关产出统一存放于：

\`\`\`
docs/sparrow/requirement/ui/
├── ui-spec.md                    # 统一的 UI 规格文档（按角色分章节）
├── design-tokens.md              # 设计令牌（色彩、字体、间距）
├── components/
│   └── component-library.md      # 共享组件库
└── prototypes/
    ├── index.html                # 主页面原型
    └── {page-name}.html          # 各页面原型
\`\`\`

---

## UI 需求分析

根据 prd-business.md 中的业务服务定义和阶段三 Grill Me 探索结果，分析和生成前端 UI 设计内容。

---

以下内容委托给 UI/UX Pro Max (ui-ux-pro-max) 引擎：

使用 UI/UX Pro Max 的设计系统生成 UI 规格和原型。UI/UX Pro Max 提供 84 种 UI 风格、192 套配色方案、74 组字体搭配、98 条 UX 指南和 22 个技术栈的设计系统。

### 操作步骤

1. 根据 UI 需求分析结果和阶段三 Grill Me 探索中确认的内容，使用 UI/UX Pro Max 生成 UI 设计规格
2. 为每个页面生成原型 HTML（保存到 docs/sparrow/requirement/ui/prototypes/）
3. 生成设计令牌（design-tokens.md）
4. 生成组件库文档（components/component-library.md）

### 技术栈选择

优先检查以下约束源：
1. 项目级 harness（docs/sparrow/harness/）中的 UI 设计约束
2. 全局级 harness（~/.config/sparrow/harness/）中的 UI 设计约束
3. 若无 harness 约束，询问用户选择前端技术栈

### UI 设计 Harness 约束

如果项目级或全局级 harness 中存在 UI 设计相关约束规则，则严格遵循；否则按 UI 规格自由设计。
