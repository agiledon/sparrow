## 执行顺序检查

在执行之前，请检查当前阶段是否合适：

\`\`\`
当前步骤：sparrow-arch（第 2 步 / 共 8 步）
所属层级：产品级（product-level）
前置条件：
  1. docs/sparrow/change/current/{activeChangeId}/requirement/business/prd-business.md 必须存在
  2. docs/sparrow/change/current/{activeChangeId}/requirement/quality/prd-quality.md （若存在则必须读取）
下一步骤：sparrow-design（团队级，按限界上下文执行）
\`\`\`

**前置条件检查**：
- 如果 \`docs/sparrow/change/current/{activeChangeId}/requirement/business/prd-business.md\` 不存在，请提示用户先执行 **sparrow-requirement**
- 如果已存在 \`docs/sparrow/change/current/{activeChangeId}/architecture/business.md\` 或 \`docs/sparrow/change/current/{activeChangeId}/architecture/application.md\`，请参考下方"输出文件存在性检查"章节处理

{{HARNESS}}
