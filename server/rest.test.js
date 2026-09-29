import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { assertAllowed, parseIdList } from './rest.js';

afterEach(() => {
  delete process.env.DISCORD_GUILD_IDS;
  delete process.env.DISCORD_CHANNEL_IDS;
});

test('parseIdList splits commas and spaces', () => {
  const ids = parseIdList('1, 2  3');
  assert.deepEqual([...ids], ['1', '2', '3']);
});

test('parseIdList empty is null', () => {
  assert.equal(parseIdList(''), null);
  assert.equal(parseIdList(undefined), null);
});

test('assertAllowed is a no-op when unset', () => {
  assertAllowed('guild', '99');
});

test('assertAllowed throws outside the list', () => {
  process.env.DISCORD_CHANNEL_IDS = '111';
  assert.throws(() => assertAllowed('channel', '222'), /not in DISCORD_CHANNEL_IDS/);
});

test('assertAllowed accepts a listed id', () => {
  process.env.DISCORD_GUILD_IDS = '111,222';
  assertAllowed('guild', '222');
});
