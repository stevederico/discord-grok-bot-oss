import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatMessage, isSnowflake, matchChannel } from './format.js';

test('isSnowflake accepts discord ids', () => {
  assert.equal(isSnowflake('41771983423143937'), true);
  assert.equal(isSnowflake('#general'), false);
});

test('matchChannel finds by name or id', () => {
  const channels = [
    { id: '1', name: 'general' },
    { id: '2', name: 'ops' },
  ];
  assert.equal(matchChannel(channels, '#general').id, '1');
  assert.equal(matchChannel(channels, '2').id, '2');
  assert.equal(matchChannel(channels, 'missing'), null);
});

test('formatMessage keeps author and reply', () => {
  const out = formatMessage({
    id: '9',
    channel_id: '1',
    content: 'hi',
    timestamp: '2026-01-01T00:00:00.000Z',
    author: { id: '8', username: 'mason', bot: false },
    message_reference: { message_id: '7' },
    attachments: [{ url: 'https://cdn.discordapp.com/a.png' }],
  });
  assert.equal(out.author.username, 'mason');
  assert.equal(out.replyTo, '7');
  assert.deepEqual(out.attachments, ['https://cdn.discordapp.com/a.png']);
});
