import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateWorkflowSchema } from './validate.js';
import type { SparrowWorkflowSchema } from './types.js';
import schemaJson from '../../schemas/schema.json';

test('workflow schema validates structurally', () => {
  const schema = schemaJson as SparrowWorkflowSchema;
  validateWorkflowSchema(schema);
  assert.equal(schema.coreStepCount, 8);
  assert.ok(schema.globalHarness.always.includes('common/always/interactive-interaction.md'));
  assert.equal(schema.globalHarness.conditional[0]?.path, 'common/conditional/brownfield.md');
  const requirement = schema.steps.find((s) => s.id === 'requirement');
  assert.ok(requirement?.outputs?.some((o) => o.dest === 'requirement/business/prd-business.md'));
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
