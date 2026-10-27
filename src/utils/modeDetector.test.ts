import test from 'node:test';
import assert from 'node:assert/strict';
import { detectResearchMode } from './modeDetector';

test('detectResearchMode identifies explicit /analyze slash command', () => {
  const result = detectResearchMode('/analyze Please examine the transformer loss');
  assert.equal(result.mode, 'analyze');
  assert.equal(result.explicitCommand, true);
  assert.equal(result.cleanPrompt, 'Please examine the transformer loss');
});

test('detectResearchMode identifies explicit /draft with NeurIPS style', () => {
  const result = detectResearchMode('/draft Write an Introduction in NeurIPS format');
  assert.equal(result.mode, 'draft');
  assert.equal(result.explicitCommand, true);
  assert.equal(result.draftStyle, 'NeurIPS');
});

test('detectResearchMode infers synthesize mode when multiple papers are present', () => {
  const result = detectResearchMode('What are the key differences between these methods?', true, false);
  assert.equal(result.mode, 'synthesize');
  assert.equal(result.explicitCommand, false);
});

test('detectResearchMode infers review mode when reviewer 2 or critique is requested', () => {
  const result = detectResearchMode('Act as Reviewer #2 and stress-test this proposal');
  assert.equal(result.mode, 'review');
  assert.equal(result.explicitCommand, false);
});

test('detectResearchMode infers ideate mode for novel hypothesis', () => {
  const result = detectResearchMode('Brainstorm a testable hypothesis for reducing quadratic attention complexity');
  assert.equal(result.mode, 'ideate');
  assert.equal(result.explicitCommand, false);
});
