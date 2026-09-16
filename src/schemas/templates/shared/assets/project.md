# Sparrow 项目：{projectName}

> 本文件由 Sparrow 自动生成和维护，作为项目的文档向导索引。
>
> 最后更新：{now}
> Sparrow 版本：{sparrowVersion}

---

## 项目信息

| 属性 | 值 |
|------|-----|
| 项目名称 | `{projectName}` |
| 创建时间 | {now} |
| Sparrow 版本 | {sparrowVersion} |
| 配置工具 | {toolList} |
| 规格布局 | `master/` + `change/current/{change-id}/` |
| 代码基路径 | `backend/` |

---

## 文档索引

### 1. 产品需求

#### 1.1 业务需求

- [ ] [功能需求文档](./requirement/business/prd-business.md) — *待生成 (sparrow-requirement)*

#### 1.2 质量属性

- [ ] [系统质量属性](./requirement/quality/prd-quality.md) — *待生成 (sparrow-requirement)*

#### 1.3 UI 需求（可选）

> 如果项目需要前端界面，请在执行 `/sparrow-requirement` 时选择继续 UI 设计探索。
> UI 规格在变更工作区 `change/current/{activeChangeId}/requirement/ui/`。

- [ ] [UI 规格](./requirement/ui/ui-spec.md) — *待生成 (sparrow-requirement)*
- [ ] [设计令牌](./requirement/ui/design-tokens.md) — *待生成 (sparrow-requirement)*
- [ ] [组件库](./requirement/ui/components/component-library.md) — *待生成 (sparrow-requirement)*
- [ ] [主页面原型](./requirement/ui/prototypes/index.html) — *待生成 (sparrow-requirement)*

### 2. 系统架构

- [ ] [业务架构](./architecture/business.md) — *待生成 (sparrow-arch)*
- [ ] [应用架构](./architecture/application.md) — *待生成 (sparrow-arch)*
- [ ] [前端架构](./architecture/frontend.md) — *待生成 (sparrow-arch)*

> 前端架构仅在项目有 UI 开发需求时提供。若无 UI 需求，该文档不会生成。

### 3. 限界上下文设计

> 每个限界上下文的设计文档将在此列出。执行 `sparrow-arch` 后自动添加。

---

### 4. API 目录

- [ ] [API 总目录](./architecture/api.md) — *待生成 (sparrow-design)*

> 每完成一个限界上下文的 sparrow-design 后更新此文件。

---

### 5. 产品代码

- [`backend/`](../backend/) — 产品代码根目录

---

## 下一步

1. 执行 **/sparrow-requirement** — 从原始需求中识别业务服务（如有需要，在技能中继续 UI 设计探索）
2. 执行 **/sparrow-arch** — 划分子领域，定义业务架构、应用架构（如有 UI 则同时生成前端架构）
3. 对每个限界上下文依次执行：**design → model → plan → apply → verify**；完成后 **archive** promote 至 `master/`
