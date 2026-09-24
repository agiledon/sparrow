# {限界上下文中文名} - 领域模型定义

## 1. 静态领域模型（阶段一输出）

### 1.1 聚合定义

#### 聚合1：{聚合名称}

- **聚合根**：{AggregateRootName}
- **实体**：{Entity1}, {Entity2}
- **值对象**：{VO1}, {VO2}

### 1.2 领域模型类图（初版）

[PlantUML 类图 — UML 命名风格，聚合根包含阶段一初步定义的操作]

## 2. 动态领域模型（阶段二输出）

> 以下每个 API 入口来自 design/{slug}/api.md

### 2.1 API：{API名称}（来自 api.md）

**API 定义**：`POST /api/v1/resource`

#### 任务树

```
{CommandName}.{method}(Request): Response         ← API 入口（与 api.md 一致）
├── {AppService}.{method}(Request): Response      ← 应用服务（签名与 Command 一致）
│   ├── {DomainService}.{method}(params): result  ← 领域服务
│   │   ├── {Aggregate}.{method}(data): result    ← 聚合操作（原子任务）
│   │   └── {Repository}.{save}(aggregate)        ← 端口调用（原子任务）
│   └── {Client}.{call}(params): result           ← 外部调用（原子任务）
```

#### 角色分配

```
{根任务} → {Command}.{method}(Request): Response
├── {组合任务} → {AppService}.{method}(Request): Response
│   ├── {原子任务1} → {DomainService}.{method}(params): result
│   │   ├── {Aggregate}.{method}(data): result
│   │   └── {Repository}.{save}(aggregate)
│   └── {原子任务2} → {Client}.{call}(params): result
```

#### 序列图

[PlantUML 序列图 — 展示限界上下文内部各角色的协作]

## 3. 动静结合确认（阶段三输出）

### 3.1 职责映射表

[从序列图提取的"角色 → 操作"映射]

### 3.2 领域模型类图（终版）

[经过阶段三确认和调整后的最终 PlantUML 类图，操作与序列图消息完全一致]

## 4. 角色职责定义

[各角色及其最终职责的总结]
