import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateWorkflowSchema } from './validate.js';
import type { SparrowWorkflowSchema } from './types.js';
import schemaJson from '../../schemas/sparrow-ddd/schema.json';

test('workflow schema validates structurally', () => {
  const schema = schemaJson as SparrowWorkflowSchema;
  validateWorkflowSchema(schema);
  assert.equal(schema.coreStepCount, 8);
});
