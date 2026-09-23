import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSparrowSchema } from '../../../src/kernel/content/validate-sparrow-schema.js';
import { getSparrowSchema } from '../../../src/kernel/content/schema.js';

test('workflow schema validates structurally', () => {
  const schema = getSparrowSchema();
  validateSparrowSchema(schema);
  assert.equal(schema.processWorkflowCount, 8);
  assert.ok(Array.isArray(schema.workflows));
  assert.ok(schema.workflows.length >= 8);

  const requirement = schema.workflows.find((w) => w.id === 'requirement');
  assert.ok(requirement);
  const architecture = schema.workflows.find((w) => w.id === 'architecture');
  assert.ok(architecture);
  assert.equal(architecture.skillId, 'sparrow-architecture');

  const archive = schema.workflows.find((w) => w.id === 'archive');
  assert.ok(archive);

  const teamProcess = schema.workflows.filter((w) => w.kind === 'process' && w.phase === 'team');
  assert.ok(teamProcess.length >= 4);

  for (const workflow of schema.workflows) {
    if (workflow.kind === 'process') {
      assert.ok(workflow.order >= 1 && workflow.order <= schema.processWorkflowCount);
    }
  }
});
