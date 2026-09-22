## 🖥️ 交互上下文代码生成

> 以下内容适用于**交互上下文**。仅当当前 slug 在 project.md 中标注为「交互上下文」时执行。

### 角色定义

- **Development Engineer** (\`dev\`)：前端页面代码 + BFF 聚合层代码
- **QA Engineer** (\`qa\`)：BFF 契约测试 + 页面组件测试 + E2E 测试
- **Code Review**：代码评审，生成 code_review.md

### 代码目录检查

\`\`\`
frontend/
├── features/                     # 按交互上下文/特性组织
│   └── {feature-name}/
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── adapters/
│       └── stores/
├── shared/
│   ├── components/
│   ├── styles/
│   └── utils/
└── shell/                        # 微前端基座（可选）

edge/
└── bff/
    └── {page-or-feature}/
        └── *Aggregator
\`\`\`

### 必读规约（交互上下文）

除 \`design/{slug}/\` 下的 spec.md / api.md / tech.md / model.md / plan.md 外，还必须读取 sparrow-requirement 产出的 UI 规格：

- \`docs/sparrow/change/current/{activeChangeId}/requirement/ui/ui-spec.md\` — 页面结构、布局、交互方式
- \`docs/sparrow/change/current/{activeChangeId}/requirement/ui/design-tokens.md\` — 色彩体系、字体层级、间距、圆角/阴影
- \`docs/sparrow/change/current/{activeChangeId}/requirement/ui/components/component-library.md\` — 组件定义与变体
- \`docs/sparrow/change/current/{activeChangeId}/requirement/ui/prototypes/*.html\` — 视觉与交互基准（颜色 / 位置 / 大小 / 布局 1:1 还原）

### 前端代码生成规则

1. **页面组件**按 ui-spec.md 的页面结构 / 布局 / 交互方式 + model.md 的组件树实现
2. **视觉样式**必须严格遵循 design-tokens.md（色彩、字体、间距、圆角/阴影），组件复用 component-library.md 的定义与变体，禁止近似色、魔数尺寸
3. **视觉保真**：颜色、位置、大小、布局必须 1:1 还原 \`prototypes/*.html\` 原型，禁止明显偏差（见约束资产 \`apply/implementation.md\`「UI 视觉保真」）
4. **服务层**调用 BFF 端点（不直接调用 BC API），端点路径、方法、请求/响应字段与 api.md 契约一致
5. **适配层**实现 ViewModel ↔ BFF 响应的字段映射
6. **状态管理**按 model.md 的数据流模型配置
7. **Web 端响应式**：支持不同分辨率与终端（桌面 / 平板 / 移动），布局自适应
8. **桌面窗体端（如 QT / QML）**：是否同进程部署由用户确定（给出选项并说明利弊，确认后实现）；窗体没有 CSS，遵循 QT 最佳实践（见约束资产 \`apply/implementation.md\`「桌面窗体端（QT）最佳实践」）

### BFF 代码生成规则

1. 每个 BFF 端点实现为一个聚合器（Aggregator）
2. 聚合器按 api.md 中定义的聚合 BC 调用和降级策略实现
3. BFF 不包含业务逻辑——只做数据聚合和格式转换
4. BFF 代码不放在 \`backend/{slug}/\` 下，放在 \`edge/bff/\` 下
5. **同进程桌面方案**：BFF 退化为进程内聚合器（函数调用），不通过 HTTP
6. **契约桩**：BFF 南向网关 port + MockClient / RealClient 双实现；开发期装配 MockClient（桩），联调期经契约测试通过后切 RealClient（见约束资产 \`apply/implementation.md\`「契约桩」）
7. **edge 语义**：\`edge/bff/\` 承载 BFF 聚合，微服务下可扩展 \`edge/gateway/\` 承担 API 网关职责；edge 属交互上下文独占，后端 BC 不感知 edge

### 样式解耦规则

> 📐 完整约束见 \`apply/implementation.md\`「交互上下文实现约束」。核心要求：
> - 样式（设计令牌 / 主题 / QSS / 样式表）与页面结构、组件逻辑、窗体及前端代码解耦
> - Web 端用设计令牌驱动主题；桌面窗体端用 QSS / 主题表，禁止硬编码样式到业务代码

### 输出结构

\`\`\`
frontend/features/{feature}/
  pages/{PageName}.{ext}
  components/{ComponentName}.{ext}
  services/{bff}Api.{ext}
  adapters/{viewModel}Mapper.{ext}
  stores/{storeName}.{ext}

edge/bff/
  {pageName}/
    {PageName}Aggregator.{ext}

docs/sparrow/change/current/{activeChangeId}/design/{ui-slug}/code_review.md
\`\`\`

### 质量检查清单（交互上下文）

- [ ] 所有页面组件已生成
- [ ] BFF 聚合端点全部实现
- [ ] BFF 端点调用的是 BC API（非直接操作 BC 数据库）
- [ ] ViewModel 适配器正确实现了字段映射
- [ ] 降级策略已实现
- [ ] **页面视觉样式与 design-tokens.md 严格一致**（色彩、字体、间距、圆角/阴影，无近似色 / 魔数）
- [ ] **组件复用 component-library.md 定义**（无重复造轮子）
- [ ] **UI 视觉保真**：颜色、位置、大小、布局与原型页面 1:1 一致，无明显偏差
- [ ] **前端调用的 BFF 端点路径/方法/字段与 api.md 契约一致**
- [ ] **Web 端响应式**：适配不同分辨率与终端（桌面 / 平板 / 移动）
- [ ] **桌面窗体端**：样式与页面/窗体/前端代码解耦，遵循对应框架（QT 等）最佳实践
- [ ] **BFF 契约桩已实现**（MockClient，fixture 形状与契约绑定表一致）
- [ ] **联调后无残留桩**（MockClient 未在生产启用，已切 RealClient）
- [ ] Code Review 完成
- [ ] plan.md 所有步骤标记为 \`- [x]\`

