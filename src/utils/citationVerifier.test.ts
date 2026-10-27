import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEpistemicContent, formatCitationIfNeeded } from './citationVerifier';

test('parseEpistemicContent counts citation needed tags accurately', () => {
  const text = `
    The baseline claim relies on [Citation Needed - Verify Source] for the 30% speedup.
    Another claim is cited as [Citation Needed - Verify Source].
  `;
  const result = parseEpistemicContent(text);
  assert.equal(result.citationNeededCount, 2);
});

test('parseEpistemicContent parses epistemic distinction tags and follow-up actions', () => {
  const text = `
    [Extracted Fact] The batch size was set to 512 with AdamW optimizer.
    [Verified Grounding] ResNet-50 was introduced by He et al. (2016).
    [Analytical Inference] The attention collapse likely stems from lack of LayerNorm before the projection.

    ### High-Leverage Follow-Up Actions
    1. Propose an ablation removing LayerNorm to isolate gradient explosion.
    2. Formalize the lower bound of the loss function under bounded weights.
    3. Contrast with competing findings in Zhou et al. (2024).
  `;
  const result = parseEpistemicContent(text);
  assert.equal(result.extractedFactsCount, 1);
  assert.equal(result.verifiedGroundingCount, 1);
  assert.equal(result.inferenceCount, 1);
  assert.equal(result.followUpActions.length, 3);
  assert.match(result.followUpActions[0], /ablation/i);
});

test('formatCitationIfNeeded returns placeholder when title is missing', () => {
  assert.equal(formatCitationIfNeeded(''), '[Citation Needed - Verify Source]');
});
