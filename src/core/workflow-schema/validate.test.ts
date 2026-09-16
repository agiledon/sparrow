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
});
