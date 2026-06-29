# 🪶 Sparrow

> Spec-driven DDD framework for AI coding assistants.

Sparrow transforms raw business requirements into production-ready code through a structured 6-step Domain-Driven Design (DDD) pipeline. It generates **skills and commands** for AI coding assistants (Claude Code, OpenCode, Cursor), letting each host's native AI capabilities guide you from business analysis to code generation — no multi-agent framework required.

## Why Sparrow?

- **No lock-in**: Works with Claude Code, OpenCode, and Cursor out of the box. Uses each tool's native AI — no CrewAI, LangChain, or other agent frameworks.
- **Spec-driven**: Every step produces concrete, version-controlled Markdown artifacts. You always know what was decided and why.
- **DDD-native**: Follows Domain-Driven Design principles end-to-end: business services → subdomains → bounded contexts → domain models → code.
- **Multi-language**: Supports Java, Python, Node.js/TypeScript, Go, and Rust. Each bounded context can use a different tech stack.
- **Incremental & conversational**: Pause at any step, refine artifacts through dialog, then continue. Each skill reads the latest output from the previous step.

## Installation

### From npm (recommended)

```bash
# Global install
npm install -g sparrow-dev

# Or use without installing
npx sparrow-dev init
```

### From local directory (development / offline)

如果你在本地克隆了 Sparrow 仓库，可以通过以下方式直接从本地安装：

```bash
# 方式一：使用 npm link（推荐，方便开发调试）
cd /path/to/sparrow        # 进入 Sparrow 项目根目录
npm install                # 安装依赖
npm run build              # 构建项目
npm link                   # 将 sparrow 链接到全局

# 之后可在任意目录使用
cd /path/to/your-project
sparrow init --tools claude

# 取消链接
npm unlink -g sparrow-dev
```

```bash
# 方式二：从本地路径全局安装
npm install -g /path/to/sparrow

# 方式三：使用 npx 直接运行本地构建产物
node /path/to/sparrow/bin/sparrow.js init --tools claude
```

> **提示**：本地安装主要用于 Sparrow 框架本身的开发和调试。日常使用请通过 npm 安装发布的版本。

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
sparrow init --tools claude,opencode,cursor

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
│   │   └── sparrow-apply/SKILL.md
│   └── commands/sparrow/
│       ├── sparrow-explore.md
│       ├── sparrow-arch.md
│       └── ...
├── .opencode/          # (if OpenCode selected)
│   └── ...
├── .cursor/            # (if Cursor selected)
│   └── ...
└── sparrow.json        # Project config
```

### 2. Run the pipeline

Invoke each skill in order as a slash command in your AI tool:

| Step | Command | Level | What it does |
|------|---------|-------|--------------|
| 1 | `/sparrow-explore` | Product | Identify business services from raw requirements |
| 2 | `/sparrow-arch` | Product | Define business architecture + application architecture with bounded contexts |
| 3 | `/sparrow-design @{slug}` | Team | Define API contracts and select tech stack for a bounded context |
| 4 | `/sparrow-model @{slug}` | Team | Extract static + dynamic domain model |
| 5 | `/sparrow-plan @{slug}` | Team | Devise implementation plan with task checklist |
| 6 | `/sparrow-apply @{slug}` | Team | Generate DDD-structured code with TDD |

> **Important**: Steps must run in order. Each skill checks that prerequisites exist and will tell you which step to run first if the order is wrong.

### 3. Iterate and refine

After any step, you can:
- Review the generated Markdown artifacts
- Discuss changes with the AI ("Update the subdomain classification...")
- Re-run the skill with modifications
- Continue to the next step — it always reads the latest version

## The 6-Step Pipeline

### Step 1: sparrow-explore (Product-level)

**Input**: Raw requirements document or description  
**Output**: `docs/sparrow/requirement/spec.md` — structured business service definitions

Identifies business services with: service number, name, description (as a user story), trigger event, basic flow, alternative flows, and acceptance criteria.

```
Service ID：I-001
Service Name：Submit Order
Description: As a buyer, I want to submit an order to purchase products.
Trigger: Buyer clicks "Submit Order"
Basic Flow: 1. Validate order; 2. Check inventory; 3. Insert order; ...
Alternative Flow: 1a. If order is invalid, show error...
Acceptance Criteria: ...
```

### Step 2: sparrow-arch (Product-level)

**Input**: `requirement/spec.md`  
**Output**:
- `docs/sparrow/architecture/business.md` — subdomains (core/supporting/generic) + Mermaid business architecture diagram
- `docs/sparrow/architecture/application.md` — bounded contexts, context mapping, four-layer application architecture diagram
- `docs/sparrow/design/{slug}/spec.md` — per-context sliced business specs

Classifies subdomains into core (competitive advantage), supporting (business-essential), and generic (buy vs build). Maps them to bounded contexts with relationship patterns (ACL, OHS, Conformist, Customer-Supplier, Shared Kernel).

### Step 3: sparrow-design (Team-level, per bounded context)

**Input**: `architecture/application.md` + `design/{slug}/spec.md`  
**Output**:
- `docs/sparrow/design/{slug}/api.md` — service contracts with Mermaid sequence diagrams and RESTful API definitions
- `docs/sparrow/design/{slug}/tech.md` — technology stack selection (language, framework, database, messaging, testing)

Interactive tech stack selection: choose from Java (Spring Boot), Python (FastAPI), Node.js/TypeScript (Express/NestJS), Go (chi/net/http), or Rust (Axum). Each language gets multiple concrete stack options.

### Step 4: sparrow-model (Team-level)

**Input**: `spec.md` + `api.md` + `tech.md`  
**Output**: `docs/sparrow/design/{slug}/model.md` — complete domain model

- **Static model**: Unified language glossary, entities (yellow) and value objects (blue), aggregate identification (aggregate root in light red), PlantUML class diagram with relationship modeling (Composite/Aggregation/Association)
- **Dynamic model**: Task decomposition trees, role stereotype assignment (Command/Query/AppService/DomainService/Aggregate/Port), PlantUML sequence diagrams with color-coded participants and strict collaboration constraints

### Step 5: sparrow-plan (Team-level)

**Input**: `spec.md` + `api.md` + `tech.md` + `model.md`  
**Output**: `docs/sparrow/design/{slug}/plan.md` — ordered implementation plan

Creates tasks with `[ ]` checkboxes, sorted by DDD layer dependency (domain → infrastructure → application → api). Each task specifies: executor (`dev` for product code with TDD, `qa` for integration tests), parallelizability, and step-level granularity matching aggregate boundaries.

### Step 6: sparrow-apply (Team-level)

**Input**: `plan.md`  
**Output**:
- `code/{slug}/` — DDD four-layer module (api/application/domain/infrastructure)
- `integration-tests/{slug}/` — isolated integration/API tests
- `docs/sparrow/design/{slug}/code_review.md` — review report

Drives three roles: Development Engineer (DDD code + domain TDD), QA Engineer (integration/API tests), and Code Review. Follows language-specific coding standards and directory layouts. Checks off completed steps in `plan.md`.

## Output Structure

After running the full pipeline, your project will have:

```
your-project/
├── docs/sparrow/
│   ├── requirement/
│   │   └── spec.md                     # sparrow-explore
│   ├── architecture/
│   │   ├── business.md                 # sparrow-arch (phase 1)
│   │   └── application.md              # sparrow-arch (phase 2)
│   ├── project.md                      # Project catalog index
│   └── design/{english-slug}/
│       ├── spec.md                     # Per-context sliced spec
│       ├── api.md                      # sparrow-design
│       ├── tech.md                     # sparrow-design
│       ├── model.md                    # sparrow-model
│       ├── plan.md                     # sparrow-plan
│       └── code_review.md              # sparrow-apply
├── code/{slug}/                        # sparrow-apply
│   ├── api/command/, query/, dto/
│   ├── application/
│   ├── domain/aggregate/, entity/, valueobject/, service/
│   └── infrastructure/port/, adapter/
├── integration-tests/{slug}/           # sparrow-apply (qa tasks)
└── sparrow.json                        # Project config
```

All bounded contexts share the same project root namespace, but each is an independent module with its own language-specific scaffold and dependency management.

## Supported AI Tools

| Tool | Skills Directory | Commands Directory | Detection |
|------|-----------------|-------------------|-----------|
| **Claude Code** | `.claude/skills/` | `.claude/commands/sparrow/` | `.claude/` directory |
| **OpenCode** | `.opencode/skills/` | `.opencode/commands/` | `.opencode/` directory |
| **Cursor** | `.cursor/skills/` | `.cursor/commands/` | `.cursor/` directory |

## Configuration

### sparrow.json

Generated by `sparrow init` in your project root:

```json
{
  "version": "0.1.0",
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

1. **`sparrow init`** generates skill/command files into each AI tool's directory
2. Each **skill** is a Markdown file with YAML frontmatter containing:
   - Role definition (business architect, application architect, DDD expert, etc.)
   - First principles and design rules
   - Step-by-step instructions
   - Output templates with Mermaid/PlantUML examples
   - Quality checklists
3. The **AI assistant** reads the skill and executes it, reading input files and writing output files
4. Each skill **checks prerequisites** — if something is missing, it tells you which skill to run first
5. After completing, each skill **hints at the next step**

**No multi-agent framework needed.** The AI coding assistant itself provides intelligence, multi-agent capabilities, and LLM configuration. Sparrow only provides the structured knowledge and process guidance.

## Comparison with sparrow-ddd

Sparrow is the successor to [sparrow-ddd](https://github.com/agiledon/sparrow-ddd), a Python + CrewAI framework. Key differences:

| | sparrow-ddd | Sparrow |
|---|-------------|---------|
| **Runtime** | Python + CrewAI | Skill files (no runtime) |
| **Agent framework** | CrewAI multi-agent | Host AI's native capabilities |
| **AI tools** | CLI-only | Claude Code, OpenCode, Cursor |
| **Setup** | `pip install` + configure `.env` | `npx sparrow-dev init` |
| **Process** | Same 6-step pipeline | Same 6-step pipeline |
| **Output** | Same document structure | Same document structure |
| **Prompt source** | Same `.sparrow/rules/` | Same content, adapted for host AI |

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

🪶 *From business requirements to production code, one spec at a time.*
