import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { handleTool } from './tools.js';

const calls = [];

afterEach(() => {
  calls.length = 0;
  globalThis.fetch = originalFetch;
  delete process.env.DISCORD_BOT_TOKEN;
});

const originalFetch = globalThis.fetch;

function mockDiscord(handler) {
  process.env.DISCORD_BOT_TOKEN = 'test-token';
  globalThis.fetch = async (url, init) => {
    const path = String(url).replace('https://discord.com/api/v10', '');
    calls.push({ method: init.method, path, body: init.body });
    const payload = handler(path, init);
    return {
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(payload),
    };
  };
}

test('discord_list_guilds returns compact guilds', async () => {
  mockDiscord(() => [{ id: 'g1', name: 'HQ', owner: true, approximate_member_count: 12 }]);
  const result = await handleTool('discord_list_guilds', {});
  const body = JSON.parse(result.content[0].text);
  assert.equal(body.guilds[0].name, 'HQ');
  assert.equal(body.guilds[0].memberCount, 12);
});

test('discord_read_messages resolves #name via guild channels', async () => {
  mockDiscord((path) => {
    if (path.includes('/messages')) {
      return [
        {
          id: 'm1',
          channel_id: 'c1',
          content: 'hello',
          timestamp: '2026-01-01T00:00:00.000Z',
          author: { id: 'u1', username: 'steve' },
          attachments: [],
        },
      ];
    }
    if (path.includes('/channels')) {
      return [{ id: 'c1', name: 'general', type: 0 }];
    }
    throw new Error(`unexpected path ${path}`);
  });
  const result = await handleTool('discord_read_messages', {
    channel: '#general',
    guildId: 'g1',
    limit: 10,
  });
  const body = JSON.parse(result.content[0].text);
  assert.equal(body.channelId, 'c1');
  assert.equal(body.messages[0].content, 'hello');
});

test('unknown tool throws', async () => {
  await assert.rejects(() => handleTool('nope', {}), /Unknown tool/);
});
