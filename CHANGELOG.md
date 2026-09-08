# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.4.0] - 2026-09-08

### Added

- **`kind` field** on skills: `core` (DDD pipeline) and `supporting` (auxiliary). Supporting skills use the `sparrow-supporting-` prefix.
  - 新增 skill 分类字段 `kind`：`core`（核心工作流）与 `supporting`（辅助工作流）；辅助 skill 统一使用 `sparrow-supporting-` 前缀。
- **`/sparrow-supporting-reconcile`** — reconcile existing spec docs and harness constraints with current code and conversation history after vibe coding or bugfixes. Does not change architecture or create new spec files.
  - 新增 **`/sparrow-supporting-reconcile`**（规格对账）：vibe coding 或 bugfix 后，将已有规格文档与 harness 约束对齐到代码实现；不修改架构、不创建新规格文件。
- **`/sparrow-verify`** (core step 7) — verify bounded context code against spec.md, api.md, tech.md, and model.md; outputs `verify_report.md` with severity-classified findings.
  - 新增 **`/sparrow-verify`**（核心流程第 7 步）：验证代码与规格文档的一致性，输出分级问题报告。
- Core pipeline expanded from 6 to **8 steps**: explore → arch → design → model → plan → apply → **verify** → **archive**.
  - 核心流程由 6 步扩展为 **8 步**，apply 之后新增 verify，verify 通过后进入 archive。

### Changed

- **Breaking**: `/sparrow-harness` → `/sparrow-supporting-harness`. Re-run `sparrow init` to regenerate skill files; deprecated skill directories are cleaned up automatically.
  - **破坏性变更**：harness 辅助命令更名；重新执行 `sparrow init` 以更新 skill 文件。
- **`sparrow-archive`** is now a **core** pipeline step (step 8). Command is `/sparrow-archive` (replaces `sparrow-supporting-archive`).
  - **`sparrow-archive`** 移入 **core** 第 8 步，命令名为 `/sparrow-archive`。
- `sparrow-apply` next step is now **sparrow-verify**; after verify passes, next is **sparrow-archive** (revise mode).
  - apply 完成后提示执行 verify；verify 通过后提示 archive。

---

## [0.3.2] - 2026-09-05

## [0.3.1] - 2026-08-11

> **This release introduces Interaction Context**, solving the fundamental mismatch between DDD's bounded-context-driven pipeline and UI/frontend development. Frontend design and implementation are no longer fragmented by BC boundaries. Instead, the Interaction Context serves as a BC peer — sharing the same `design → model → plan → apply` pipeline — while remaining fully orthogonal, enabling UI+frontend and backend BCs to evolve independently and in parallel.

### Added

- **Interaction Context** — a first-class architecture concept parallel to Bounded Contexts. Each product has exactly one Interaction Context encompassing all client UIs and BFF aggregation. It shares the same `design → model → plan → apply` pipeline as backend BCs, yet is fully orthogonal (no mutual dependencies, capable of parallel execution).
  - 新增**交互上下文（Interaction Context）**：与后端限界上下文同级的架构概念。每个产品有且仅有一个交互上下文，涵盖全部客户端 UI + BFF 聚合层。共享同一套 `design → model → plan → apply` 命令体系，但与其他 BC 完全正交——无相互依赖，可以并行执行。
- **UI design exploration** integrated into `/sparrow-explore` as an optional phase 3. Uses Grill Me to explore personas, user journeys, page concepts, visual preferences, and device types. Pure UX exploration — no bounded context association.
  - UI 设计探索合并入 `/sparrow-explore` 的可选阶段三。使用 Grill Me 模式探索用户画像、旅程、页面概念、视觉偏好和客户端类型。纯 UX 探索，不关联 BC。
- **BFF aggregation layer** explicitly modeled in the frontend architecture. BFF endpoints aggregate multiple BC APIs per UI page, with formal degradation strategies. BFF code generated to `edge/bff/`.
  - **BFF 聚合层**在前端架构中显式建模。BFF 端点按 UI 页面聚合多个 BC API，定义正式降级策略。BFF 代码生成到 `edge/bff/`。
- **API contract binding tables** generated in `sparrow-arch` as the sole synchronization point between Interaction Context and backend BCs. Contract consistency guaranteed by both sides deriving from the same business service definitions — no mutual file reading required.
  - **API 契约绑定表**在 `sparrow-arch` 中生成，作为交互上下文与后端 BC 之间的唯一同步点。双方从同一业务服务定义推导，契约天然一致——无需互读对方产物。
- **Technology selection dialogues** in `sparrow-arch` frontend architecture phase: interactive client framework selection (Web/Mobile/QT/Electron) and BFF selection (RESTful/GraphQL/same-process), each with recommended+alternative options.
  - `sparrow-arch` 前端架构阶段新增**交互式技术选型**：客户端方案（Web/移动端/QT/Electron）和 BFF 方案（RESTful/GraphQL/同进程），每种方案提供推荐+备选。

### Changed

- **`/sparrow-ui` removed** as a standalone command. UI design exploration is now an optional phase in `/sparrow-explore`, and frontend architecture design is an optional phase in `/sparrow-arch`.
  - **移除 `/sparrow-ui` 独立命令**。UI 设计探索作为 `/sparrow-explore` 的可选阶段，前端架构设计作为 `/sparrow-arch` 的可选阶段。
- **Frontend code organization**: changed from `frontend/{bc-slug}/` to `frontend/features/{feature-name}/`, reflecting that frontend pages span multiple BCs, not mirror BC boundaries.
  - **前端代码组织**：从 `frontend/{bc-slug}/` 改为 `frontend/features/{feature-name}/`，反映前端页面跨 BC 的现实，而非镜像 BC 边界。
- All team-level commands (`design`, `model`, `plan`, `apply`) now detect slug type from `project.md` and branch accordingly: backend BC logic (unchanged) vs. Interaction Context logic (new).
  - 所有团队级命令（`design`, `model`, `plan`, `apply`）现在从 `project.md` 检测 slug 类型并分支处理：后端 BC 逻辑（不变）vs. 交互上下文逻辑（新增）。
- **UI output path** changed from `docs/sparrow/ui/` to `docs/sparrow/requirement/ui/`, reflecting its nature as a requirement-level artifact.
  - **UI 产出路径**从 `docs/sparrow/ui/` 改为 `docs/sparrow/requirement/ui/`，体现其需求层产物的性质。

### Removed

- Per-BC frontend-aware logic removed from BC-level `design`, `model`, `plan`, and `apply`. All frontend concerns now handled exclusively by Interaction Context.
  - 从 BC 级的 `design`、`model`、`plan`、`apply` 中移除前端感知逻辑。所有前端关注点完全由交互上下文独立处理。
- `sparrow-ui` standalone skill and its harness (`ui/requirements.md`) deleted. UI exploration constraints merged into `explore/requirements.md`.
  - 删除 `sparrow-ui` 独立技能及其 harness (`ui/requirements.md`)。UI 探索约束合并入 `explore/requirements.md`。

---

## [0.2.1] - 2026-08-07

### Added

- **Constraint assets (Harness)** for the whole DDD pipeline. DDD rules are decoupled from the stage skills and loaded progressively per stage, with two tiers — global (`~/.config/sparrow/harness/`) and project (`docs/sparrow/harness/`) — and project precedence on conflict. A `constitution.md` acts as the aggregate index mapping each stage to its constraint files.
  - 新增覆盖整个 DDD 流程的**约束资产（Harness）**：DDD 纪律与各阶段 skill 解耦，按阶段渐进加载；分全局/项目两级，冲突时项目级优先；`constitution.md` 作为聚合索引。
- New `/sparrow-harness` helper command to view, add, update, or delete project constraints at any time; new constraints are auto-classified into the correct stage file, so you never have to pick a stage.
  - 新增 `/sparrow-harness` 辅助命令：可随时查看、添加/更新/删除项目级约束；新约束自动分类到对应阶段，无需手动选择阶段。
- `sparrow update` CLI command that checks the npm registry, prompts to install the latest `sparrow-ddd`, and syncs global constraint assets on every run.
  - 新增 `sparrow update` CLI 命令：检查 npm 最新版本、确认后安装，并在每次运行时同步全局约束资产。
- **Grill Me interactive requirements exploration** in `sparrow-explore`: one question at a time with a recommended answer, confirmed by **yes / no / modify**, covering actors, core flows, business rules, boundary conditions, exception scenarios, and quality attributes.
  - `sparrow-explore` 新增 **Grill Me 互动式需求探索**：一问一答并给出推荐答案，由用户以“是 / 否 / 修改”确认，覆盖参与者、核心流程、业务规则、边界条件、异常场景、质量属性等维度。
- Publisher-Subscriber added to the context-mapping pattern list.
  - 上下文映射模式新增 **Publisher-Subscriber**（发布-订阅）。

### Changed

- Reworked subdomain identification in `sparrow-arch`: semantic correlation is prioritized over functional correlation, then abstraction and adjustment rules follow.
  - 重构 `sparrow-arch` 子领域识别流程：语义相关性优先于功能相关性，再归纳共同特征并遵循调整规则。
- Refined the bounded-context **autonomy principle**: domain knowledge is minimally complete and self-fulfilling; the logical boundary covers the corresponding data model; isolation is logical only — a bounded context is **not necessarily a microservice**.
  - 细化限界上下文**自治原则**：领域知识最小完备且能自我履行；逻辑边界覆盖领域层对应数据模型；隔离仅体现为逻辑隔离，不必然设计为微服务。
- Split the southbound infrastructure into `port` and `adapter`; a Persistent Object (PO) is a south-gateway message contract responsible for bidirectional conversion; port interfaces must not declare types from outside the domain layer.
  - 南向网关分为 `port` 与 `adapter`；持久化对象（PO）作为南向网关的消息契约并负责双向转换；端口接口禁止声明领域层之外的对象类型。
- Applied OOP principles (Information Expert, Law of Demeter, anti-anemic model, encapsulation) to `sparrow-model` and `sparrow-apply`.
  - 在 `sparrow-model` 与 `sparrow-apply` 中落实面向对象原则（信息专家、迪米特法则、反贫血模型、封装原则）。
- Aligned the cross-context communication constraints in the implementation stage with the application-architecture stage — same-process via southbound Client → northbound local service, cross-process via public API / domain events, and no direct access to another BC's domain objects.
  - 实现阶段跨限界上下文通信约束与应用架构阶段保持一致：同进程经南向 Client → 北向本地服务，跨进程经公开 API / 领域事件，禁止直接跨 BC 访问领域对象。

### Refactored

- Removed duplication between skills and the harness; the constraint assets are now the single source of truth for DDD discipline.
  - 消除 skill 与 harness 间的约束重复，约束资产作为 DDD 纪律的唯一事实来源。

---

## [0.2.0] - 2026-07-18

### Added

- **Revise / change-management workflow**: `docs/sparrow/changes/` with change proposals, per-BC progress tiers (S0–S4), deltas, ADRs, and the `sparrow-archive` command to archive a completed change.
  - 新增变更管理（revise）流程：`docs/sparrow/changes/`、按 BC 档位（S0–S4）确定改动范围、delta 机制，以及 `sparrow-archive` 归档命令。
- Support for more AI coding tools (Codex, Kiro, Qoder, Trae).
  - 支持更多 AI 编码工具（Codex、Kiro、Qoder、Trae）。

### Changed

- Phased the pipeline into **product-level** (explore, arch) and **team-level** (design, model, plan, apply) execution.
  - 流水线阶段按**产品级**（explore、arch）与**团队级**（design、model、plan、apply）划分。

---

## [0.1.1] - 2026-07-03

### Added

- Renamed the npm package from **`sparrow`** to **`sparrow-ddd`** (CLI binary remains `sparrow`), and added the Sparrow brand logo.
  - 将 npm 包名由 **`sparrow`** 改名为 **`sparrow-ddd`**（CLI 命令仍为 `sparrow`），并新增 Sparrow 品牌标识图。
- **`docs/sparrow/project.md`** project catalog index, with project config moved to the `.sparrow/` config directory.
  - 新增 **`docs/sparrow/project.md`** 项目目录索引，并将项目配置迁移至 `.sparrow/` 配置目录管理。
- **`docs/sparrow/design/{slug}/api.md`** — service API contract document spanning the whole project, generated by `sparrow-design` and consumed by `sparrow-model` & `sparrow-apply`.
  - 新增 **`docs/sparrow/design/{slug}/api.md`** 全项目服务接口契约文档，由 `sparrow-design` 生成、`sparrow-model` 与 `sparrow-apply` 消费。
- **Business service** term in `sparrow-explore` and `sparrow-design`: requirements are now decomposed and expressed as business services.
  - 在 `sparrow-explore` 与 `sparrow-design` 中引入**业务服务（business service）**术语：需求以业务服务为单位进行分解和表达。

---

## [0.1.0] - 2026-06-29

### Added

- Initial release — a **spec-driven DDD framework** for AI coding assistants.
  - 首个发布版——面向 AI 编程助手的**规格驱动 DDD 框架**。
- A structured **6-step DDD pipeline**: `sparrow-explore`, `sparrow-arch`, `sparrow-design`, `sparrow-model`, `sparrow-plan`, `sparrow-apply`.
  - 结构化的 **6 阶段 DDD 流水线**：`sparrow-explore`、`sparrow-arch`、`sparrow-design`、`sparrow-model`、`sparrow-plan`、`sparrow-apply`。
- Generate **skills & commands** for Claude Code, OpenCode, and Cursor via `sparrow init` — each stage produces a version-controlled Markdown artifact, read by the next stage.
  - 通过 `sparrow init` 为 Claude Code、OpenCode、Cursor 生成**技能与命令模块**——每个阶段产出可版本化的 Markdown 制品，供下一阶段读取。
- **No multi-agent framework**: relies on each tool's native AI, keeps you free from tools (no lock-in), with **multi-language support** (Java, Python, Node.js/TypeScript, Go, Rust) — each bounded context may choose a different tech stack.
  - **不依赖多代理框架**：复用各工具原生 AI 能力、无供应商锁定，并支持**多语言**（Java、Python、Node.js/TypeScript、Go、Rust）——每个限界上下文可选择不同技术栈。