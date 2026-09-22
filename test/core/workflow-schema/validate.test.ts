import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateWorkflowSchema } from '../../../src/kernel/content/validate-workflow-schema.js';
import type { SparrowWorkflowSchema } from '../../../src/kernel/content/schema-types.js';
import schemaJson from '../../../src/content/schema/schema.json';

test('workflow schema validates structurally', () => {
  const schema = schemaJson as SparrowWorkflowSchema;
  validateWorkflowSchema(schema);
  assert.equal(schema.coreStepCount, 8);
  assert.ok(schema.globalHarness.always.includes('common/always/interactive-interaction.md'));
  assert.ok(schema.globalHarness.always.includes('common/always/document-language.md'));
  assert.equal(schema.globalHarness.conditional[0]?.path, 'common/conditional/brownfield.md');
  const requirement = schema.steps.find((s) => s.id === 'requirement');
  assert.ok(requirement?.outputs?.some((o) => o.dest === 'requirement/business/catalog.md'));
  const arch = schema.steps.find((s) => s.id === 'arch');
  assert.ok(arch?.outputs?.some((o) => o.dest === 'architecture/bounded-contexts.md'));
  assert.ok(arch?.harness?.includes('arch/bounded-contexts.md'));
  assert.ok(!(arch?.harness ?? []).includes('arch/business.md'));
  const archive = schema.steps.find((s) => s.id === 'archive');
  assert.equal(archive?.phase, 'product');
  assert.equal(archive?.scope, undefined);
  const teamCore = schema.steps.filter((s) => s.kind === 'core' && s.phase === 'team');
  assert.deepEqual(
    teamCore.map((s) => s.id),
    ['design', 'model', 'plan', 'apply', 'verify']
  );
  for (const step of schema.steps) {
    if (step.kind === 'core') {
      assert.ok((step.outputs ?? []).length > 0, `${step.id} missing outputs catalog`);
      for (const output of step.outputs ?? []) {
        const destOk =
          output.dest.startsWith('docs/sparrow/master/') ||
          (!output.dest.startsWith('docs/') && !output.dest.startsWith('/'));
        assert.ok(destOk, `${step.id} dest ${output.dest} is not workspace-relative or master/`);
      }
    } else {
      assert.equal(step.outputs, undefined, `${step.id} must not declare pipeline outputs`);
    }
  }
});
