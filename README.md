# 🪶 Sparrow

![Sparrow Logo](assets/sparrow-logo.png)

> Spec-driven DDD framework for AI coding assistants.
>
> The npm package is published as **`sparrow-ddd`**.

Sparrow transforms raw business requirements into production-ready code through a structured DDD pipeline. It introduces the concept of **Interaction Context** — a first-class architecture concept parallel to Bounded Contexts that handles all frontend UI and BFF aggregation. Both backend BCs and the Interaction Context share the same standardized `design → model → plan → apply` workflow, yet remain completely orthogonal — no mutual dependencies, capable of parallel execution.

> 📜 Version history and highlights: see the [CHANGELOG](./CHANGELOG.md) and [GitHub Releases](https://github.com/agiledon/sparrow/releases).

## Why Sparrow?

- **No lock-in**: Works with Claude Code, OpenCode, Cursor, and Pi out of the box. Uses each tool's native AI — no CrewAI, LangChain, or other agent frameworks.
- **Spec-driven**: Every step produces concrete, version-controlled Markdown artifacts. You always know what was decided and why.
- **DDD-native**: Follows Domain-Driven Design principles end-to-end: business services → subdomains → bounded contexts → domain models → code.
- **Multi-language**: Supports Java, Python, Node.js/TypeScript, Go, and Rust. Each bounded context can use a different tech stack.
- **Incremental & conversational**: Pause at any step, refine artifacts through dialog, then continue. Each skill reads the latest output from the previous step.

## Installation

### From npm (recommended)

```bash
# Global install
npm install -g sparrow-ddd

# Or use without installing
npx sparrow-ddd init
```

### From local directory (development / offline)

If you have cloned the Sparrow repository locally, you can install directly from the local directory:

```bash
# Option 1: Use npm link (recommended for development)
cd /path/to/sparrow        # Navigate to the Sparrow project root
npm install                # Install dependencies
npm run build              # Build the project
npm link                   # Link sparrow globally

# Then use it from any directory
cd /path/to/your-project
sparrow init --tools claude

# To unlink
npm unlink -g sparrow-ddd
```

```bash
# Option 2: Install globally from local path
npm install -g /path/to/sparrow

# Option 3: Run the local build artifact directly with npx
node /path/to/sparrow/bin/sparrow.js init --tools claude
```

> **Note**: Local installation is primarily intended for developing and debugging the Sparrow framework itself. For everyday use, install the published version via npm.

**Requirements**: Node.js >= 18

## Quick Start

### 1. Initialize Sparrow in your project

```bash
cd your-project
sparrow init
```

Sparrow detects which AI tools you have installed and asks which to configure. You can also specify explicitly:

```bash
# Set up for Claude Code only
sparrow init --tools claude

# Set up for multiple tools
sparrow init --tools claude,opencode,cursor,pi

# Set up for all supported tools, no prompts
sparrow init --tools all --force
```

This creates skill and command files for each selected tool:

```
your-project/
├── .claude/
│   ├── skills/
│   │   ├── sparrow-explore/SKILL.md
│   │   ├── sparrow-arch/SKILL.md
│   │   ├── sparrow-design/SKILL.md
│   │   ├── sparrow-model/SKILL.md
│   │   ├── sparrow-plan/SKILL.md
│   │   ├── sparrow-apply/SKILL.md
│   │   ├── sparrow-supporting-harness/SKILL.md
│   │   ├── sparrow-supporting-reconcile/SKILL.md
│   │   └── sparrow-supporting-archive/SKILL.md
│   └── commands/sparrow/
│       ├── sparrow-explore.md
│       ├── sparrow-arch.md
│       └── ...
├── .opencode/          # (if OpenCode selected)
│   └── ...
├── .cursor/            # (if Cursor selected)
│   └── ...
├── .pi/                # (if Pi selected)
│   └── ...
├── docs/sparrow/harness/  # Project-level constraint assets (placeholders)
└── sparrow.json        # Project config
```

`sparrow init` also writes the **global constraint assets** (DDD-universal discipline) to the global config directory (`~/.config/sparrow/harness` on macOS/Linux, `%APPDATA%\sparrow\harness` on Windows).

After initialization, you can check for updates at any time:

```bash
sparrow update
```

This compares your local version against the npm registry and prompts you to upgrade if a newer version is available. It also syncs global constraint assets (creating or refreshing managed templates) whenever you run it.

### 3. Run the pipeline

Invoke each skill in order as a slash command in your AI tool:

**Core skills** (`kind: core`) — the DDD pipeline:

| Step | Command | Level | What it does |
|------|---------|-------|--------------|
| 1 | `/sparrow-explore` | Product | Interactive requirement exploration (Grill Me) + generate functional & quality requirement docs + [optional] UI design exploration |
| 2 | `/sparrow-arch` | Product | Define business architecture (subdomains) + application architecture (bounded contexts) + [if UI exists] frontend architecture with Interaction Context |
| 3 | `/sparrow-design @{slug}` | Team | Define API contracts and tech stack for a bounded context or Interaction Context |
| 4 | `/sparrow-model @{slug}` | Team | Domain modeling (backend BC) or ViewModel + component modeling (Interaction Context) |
| 5 | `/sparrow-plan @{slug}` | Team | Devise implementation plan with task checklist |
| 6 | `/sparrow-apply @{slug}` | Team | Generate DDD-structured code (backend) or frontend + BFF code (Interaction Context) |

**Supporting skills** (`kind: supporting`) — available anytime, independent of the pipeline:

| Command | What it does |
|---------|--------------|
| `/sparrow-supporting-harness` | View, add, and maintain constraint assets (harness) |
| `/sparrow-supporting-reconcile` | Reconcile existing spec docs and harness constraints with current code after vibe coding or bugfixes |
| `/sparrow-supporting-archive` | Archive a completed revise-mode change |

> **Important**: Product-level steps (1-2) run once. Team-level steps (3-6) run per slug — all contexts (backend BCs + Interaction Context) share the same commands and are fully orthogonal. They can execute in any order, even in parallel.

### 4. Iterate and refine

After any step, you can:
- Review the generated Markdown artifacts
- Discuss changes with the AI ("Update the subdomain classification...")
- Re-run the skill with modifications
- Continue to the next step — it always reads the latest version

## The 6-Step Pipeline

### Step 1: sparrow-explore (Product-level)

**Input**: Raw requirements document or description  
**Output**:
- `docs/sparrow/requirement/prd-business.md` — structured business service definitions
- `docs/sparrow/requirement/prd-quanlity.md` — system quality attributes (performance, security, high availability, etc.)
- `docs/sparrow/requirement/ui/` — \[optional\] UI design specs, design tokens, component library, and interactive HTML prototypes

sparrow-explore uses a **Grill Me** interactive exploration pattern in two phases. **Phase 1**: Business requirements — covers actors, core flows, business rules, boundary conditions, exception scenarios, and quality attributes. **Phase 2**: After generating the requirement docs, optionally enters **UI design exploration** (also Grill Me), producing user personas, journeys, page concepts, and visual preferences — pure UX, no bounded context associations.

### Step 2: sparrow-arch (Product-level)

**Input**: `requirement/prd-business.md` + `requirement/prd-quanlity.md` + \[optional\] `requirement/ui/`  
**Output**:
- `docs/sparrow/architecture/business.md` — subdomains (core/supporting/generic) + Mermaid business architecture diagram
- `docs/sparrow/architecture/application.md` — bounded contexts, context mapping, four-layer application architecture diagram
- `docs/sparrow/design/{slug}/spec.md` — per-context sliced business specs
- `docs/sparrow/architecture/frontend.md` — \[if UI exists\] frontend architecture with Interaction Context definition, tech stack selection, BFF design, and API contract binding tables

Classifies subdomains into core, supporting, and generic. Maps them to bounded contexts with relationship patterns. **If UI requirements exist**, additionally generates frontend architecture including: interactive tech stack selection (Web/Mobile/QT/BFF), **Interaction Context** definition (a BC-peer encompassing all UI + BFF aggregation), and **API contract binding tables** — the sole synchronization point that guarantees frontend-backend contract consistency, enabling all subsequent BC and Interaction Context design/model/plan/apply steps to run independently without mutual dependencies.

### Step 3: sparrow-design (Team-level, per context)

**Input**: `design/{slug}/spec.md` + architecture docs  
**Output**:
- `docs/sparrow/design/{slug}/api.md` — service contracts (backend BC) or BFF API specs with ViewModel interfaces (Interaction Context)
- `docs/sparrow/design/{slug}/tech.md` — technology stack selection

For **backend BCs**: interactive tech stack selection (Java/Python/Node.js/Go/Rust/REST/gRPC). For **Interaction Context**: BFF aggregation endpoint design, ViewModel definition, and frontend + BFF tech stack selection. The Interaction Context design does NOT read any BC's api.md — contract consistency is guaranteed by the binding table in frontend.md.

### Step 4: sparrow-model (Team-level, per context)

**Input**: `spec.md` + `api.md` + `tech.md`  
**Output**: `docs/sparrow/design/{slug}/model.md`

For **backend BCs**: three-stage domain modeling (static class diagram + dynamic sequence diagram + integration). For **Interaction Context**: ViewModel static models, component tree models, and data flow models.

### Step 5: sparrow-plan (Team-level, per context)

**Input**: `spec.md` + `api.md` + `tech.md` + `model.md`  
**Output**: `docs/sparrow/design/{slug}/plan.md` — ordered implementation plan

For **backend BCs**: tasks organized by DDD layer dependency. For **Interaction Context**: tasks organized by page/feature with parallelization markers, covering frontend component development, BFF aggregation implementation, and integration testing.

### Step 6: sparrow-apply (Team-level, per context)

**Input**: `plan.md`  
**Output**:
- `backend/{slug}/` — DDD four-layer module (api/application/domain/infrastructure) for backend BCs
- `integration-tests/{slug}/` — isolated integration/API tests
- `docs/sparrow/design/{slug}/code_review.md` — review report

For **Interaction Context**, generates frontend code to `frontend/features/` and BFF aggregation code to `edge/bff/`.

## Output Structure

After running the full pipeline, your project will have:

```
your-project/
├── docs/sparrow/
│   ├── requirement/
│   │   ├── prd-business.md               # sparrow-explore (functional requirements)
│   │   ├── prd-quanlity.md               # sparrow-explore (quality attributes)
│   │   └── ui/                            # [optional] sparrow-explore (UI design exploration)
│   │       ├── ui-spec.md
│   │       ├── design-tokens.md
│   │       ├── components/
│   │       └── prototypes/
│   ├── architecture/
│   │   ├── business.md                   # sparrow-arch (subdomains)
│   │   ├── application.md                # sparrow-arch (bounded contexts)
│   │   └── frontend.md                   # [optional] sparrow-arch (frontend + Interaction Context)
│   ├── project.md                        # Project catalog index
│   └── design/{english-slug}/
│       ├── spec.md                       # Per-context sliced spec
│       ├── api.md                        # sparrow-design
│       ├── tech.md                       # sparrow-design
│       ├── model.md                      # sparrow-model
│       ├── plan.md                       # sparrow-plan
│       └── code_review.md                # sparrow-apply
├── backend/{slug}/                       # sparrow-apply (backend BC)
│   ├── api/command/, query/, dto/
│   ├── application/
│   ├── domain/aggregate/, entity/, valueobject/, service/
│   └── infrastructure/port/, adapter/
├── frontend/                             # sparrow-apply (Interaction Context)
│   ├── features/{name}/
│   └── shared/
├── edge/bff/                             # sparrow-apply (BFF aggregation)
├── integration-tests/{slug}/             # sparrow-apply (qa tasks)
└── sparrow.json                          # Project config
```

All bounded contexts share the same project root namespace, but each is an independent module with its own language-specific scaffold and dependency management.

## Constraint Assets (Harness)

Sparrow ships **constraint assets** (harness) — the "must / must not" DDD discipline that each stage enforces. They live in two places:

| Scope | Location | Contents |
|-------|----------|----------|
| **Global** | `~/.config/sparrow/harness/` (macOS/Linux), `%APPDATA%\sparrow\harness` (Windows) | DDD-universal discipline, written by `sparrow init` and synced by `sparrow update` |
| **Project** | `docs/sparrow/harness/` | Project-specific constraints; placeholder files created by `sparrow init`, free to edit |

**Precedence**: project-level constraints > global constraints. On conflict the project level wins; if a project file is empty/missing, the global level is used directly.

The global harness contains one file per stage plus a constitution:

```
harness/
├── constitution.md            # Aggregate index: stage → file → description
├── explore/requirements.md    # Business service identification + UI design exploration discipline
├── arch/business.md           # Subdomain classification discipline
├── arch/application.md        # Bounded context, autonomy & communication discipline
├── arch/frontend.md           # Frontend architecture & Interaction Context discipline
├── design/api-design.md       # Service contract & API discipline
├── model/architecture.md      # Four layers, stereotypes, PO & call rules
├── model/domain-modeling.md   # Aggregates & OOP discipline
├── model/view-modeling.md     # View Model modeling discipline (Interaction Context)
└── apply/implementation.md    # Code generation & encapsulation discipline
```

How it works:

- Each stage skill references the harness in a `📐 约束资产（Harness）` section telling the AI to load the relevant constraint files **before** executing.
- **Supporting skills** (`kind: supporting`) are auxiliary commands independent of the pipeline:
  - **`/sparrow-supporting-harness`** — view the index, and add/update/delete project-level constraints. New constraints are auto-classified into the right stage file.
  - **`/sparrow-supporting-reconcile`** — after vibe coding or bugfixes, reconcile **existing** spec docs and harness constraints with current code (does not change architecture or create new spec files).
  - **`/sparrow-supporting-archive`** — archive a completed revise-mode change.
- Managed global templates are refreshed on version upgrade, but **user-edited files are never overwritten** (project files are always yours).

## Supported AI Tools

| Tool | Skills Directory | Commands Directory | Detection |
|------|-----------------|-------------------|-----------|
| **Claude Code** | `.claude/skills/` | `.claude/commands/sparrow/` | `.claude/` directory |
| **OpenCode** | `.opencode/skills/` | `.opencode/commands/` | `.opencode/` directory |
| **Cursor** | `.cursor/skills/` | `.cursor/commands/` | `.cursor/` directory |
| **Codex (OpenAI)** | `.codex/skills/` | `.codex/commands/` | `.codex/` directory |
| **Kiro** | `.kiro/skills/` | *from skills* | `.kiro/` directory |
| **Qoder** | `.qoder/skills/` | `.qoder/commands/` | `.qoder/` directory |
| **Trae** | `.trae/skills/` | `.trae/commands/` | `.trae/` directory |
| **Pi** | `.pi/skills/` | `.pi/prompts/` (prompt templates) | `.pi/` directory |

## Configuration

### sparrow.json

Generated by `sparrow init` in your project root:

```json
{
  "version": "0.3.0",
  "tools": ["claude", "opencode"],
  "createdAt": "2026-06-29T04:05:45.650Z",
  "outputBase": "docs/sparrow",
  "codeBase": "code"
}
```

### Overriding output paths

Future versions will support a `sparrow.yaml` file for customizing output paths:

```yaml
sparrow_docs_root: docs/my-company
paths:
  requirement_spec: specs/requirements.md
  architecture_business: specs/architecture/biz.md
  architecture_application: specs/architecture/app.md
```

## Supported Languages & Tech Stacks

| Language | Default Framework | Build Tool | Status |
|----------|------------------|------------|--------|
| Java 17+ | Spring Boot 3.x | Maven | ✅ |
| Python 3.12+ | FastAPI | uv | ✅ |
| Node.js | Express / NestJS | npm | ✅ |
| Go 1.22+ | chi / net/http | Go modules | ✅ |
| Rust (stable) | Axum | Cargo | ✅ |

Each language has its own DDD directory layout, coding standards, and anti-pattern rules embedded in the skill prompts.

## How It Works

1. **`sparrow init`** generates skill/command files into each AI tool's directory, plus global and project-level constraint assets (harness)
2. Each **skill** is a Markdown file with YAML frontmatter containing:
   - Role definition (business architect, application architect, DDD expert, etc.)
   - First principles and design rules
   - Step-by-step instructions
   - Output templates with Mermaid/PlantUML examples
   - Quality checklists
3. Each stage skill **loads its constraint assets** (`📐 约束资产（Harness）`) — project-level and global rules — before executing
4. The **AI assistant** reads the skill and executes it, reading input files and writing output files
5. Each skill **checks prerequisites** — if something is missing, it tells you which skill to run first
6. After completing, each skill **hints at the next step**

**No multi-agent framework needed.** The AI coding assistant itself provides intelligence, multi-agent capabilities, and LLM configuration. Sparrow only provides the structured knowledge and process guidance.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Type check
npm run typecheck
# or: npx tsc --noEmit

# Run locally (dev mode)
npm run dev -- init --tools claude --force

# Run compiled binary
node bin/sparrow.js init --tools claude

# Clean build artifacts
npm run clean
```

## License

MIT

---

🪶 *From business requirements to production code — backend and frontend, unified into one spec-driven flow.*
