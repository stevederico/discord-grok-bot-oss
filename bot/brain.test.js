import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitDiscord } from './brain.js';

test('splitDiscord keeps short text whole', () => {
  assert.deepEqual(splitDiscord('hi'), ['hi']);
});

test('splitDiscord chunks long text on newlines', () => {
  const line = 'x'.repeat(100);
  const text = Array.from({ length: 25 }, () => line).join('\n');
  const parts = splitDiscord(text);
  assert.equal(parts.length > 1, true);
  for (const part of parts) {
    assert.equal(part.length <= 1900, true);
  }
});
