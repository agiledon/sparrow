## 🎨 架构图绘制（Archify）

本阶段的所有图均使用 **Archify** 生成交互式 HTML + 可嵌入的 SVG 静态图，替代 Mermaid/PlantUML。

### 定位 Archify CLI

Archify 由 Sparrow 预装至全局配置目录。CLI 位于（按系统自动匹配）：

```bash
# macOS / Linux
ARCHIFY_BIN="$HOME/.config/sparrow/plugins/archify/bin/archify.mjs"

# Windows (PowerShell)
# $ARCHIFY_BIN="$env:APPDATA\sparrow\plugins\archify\bin\archify.mjs"

# 验证安装
[ -f "$ARCHIFY_BIN" ] || echo "⚠️ Archify 未找到，请执行: sparrow update"
```

> **注意**：以下所有 archify 命令均以 `node $ARCHIFY_BIN` 前缀执行。

### 图类型速查

| 当前阶段需要绘制的图 | Archify type | 说明 |
|---|---|---|
| 子领域示意、限界上下文图、上下文映射图、组件图、静态类图 | `architecture` | 节点 + 关系，支持 grouping/嵌套表达层次 |
| 序列图、API 契约交互图 | `sequence` | 调用链，支持参与者和消息流 |

Archify `architecture` 类型可绘制的 component type：`frontend`, `backend`, `database`, `cloud`, `security`, `messagebus`, `external`。
variant（视觉区分）：`default`（常规）、`emphasis`（重点突出）、`security`（安全边界）、`dashed`（外部/第三方）。

Archify `sequence` 类型：participants 表示参与者，messages 表示调用/返回。

### 通用绘图流程

对每张图执行以下流程：

1. **读取 schema**：读取 Archify 的 `schemas/{type}.schema.json` 和 `schemas/common.schema.json`
2. **编写 JSON IR**：根据本阶段产出的 Markdown 文档生成 typed JSON，遵循约束：
   - 设置 `meta.quality_profile` 为 `"showcase"`
   - 最多 12 个主节点，一条清晰主路径，简短分支
   - 不手动指定坐标，使用自动布局和自动路由
   - 不使用 `via`、`channelX`、`channelY`、`labelAt` 直到诊断要求
   - JSON 文件保存至 `docs/sparrow/images/xxx.json`
3. **验证**：
   ```sh
   node $ARCHIFY_BIN validate <type> docs/sparrow/images/<name>.json --quality showcase --json
   ```
4. **修复**（最多两轮）：只修改诊断的 `subject`，使用 `supportedFixes`
5. **交付 HTML**：
   ```sh
   node $ARCHIFY_BIN deliver <type> docs/sparrow/images/<name>.json docs/sparrow/images/<name>.html --quality showcase --json
   ```

### SVG 静态图提取

HTML 交付后，从 HTML 中提取 SVG 用于 Markdown 嵌入：

```bash
node -e "
const fs=require('fs');
const html=fs.readFileSync('docs/sparrow/images/<name>.html','utf8');
const m=html.match(/<svg[\\\\s\\\\S]*?<\\\\/svg>/);
if(m){fs.writeFileSync('docs/sparrow/images/<name>.svg',m[0]);console.log('SVG extracted')}
else{console.error('No SVG found')}
"
```

### 在 Markdown 中引用图

**交互式 HTML**（保留缩放/聚焦/主题等能力）：
```html
<iframe src="../images/<name>.html" width="100%" height="600" style="border:none;"></iframe>
```

**静态 SVG**（快速预览，不依赖浏览器交互）：
```markdown
![图标题](../images/<name>.svg)
```

两种引用方式均可保留。HTML 文件提供完整交互体验（缩放、聚焦、路由追踪、导出 PNG/SVG/WebM），SVG 文件用于快速嵌入预览。

### 图片输出目录

所有图片（JSON / HTML / SVG）统一输出至：

```
docs/sparrow/images/
```

> 如果目录不存在，请先创建：`mkdir -p docs/sparrow/images`
