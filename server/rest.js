/** Discord HTTP API v10. Bot token only. No discord.js. */

const API = 'https://discord.com/api/v10';
const UA = 'DiscordBot (https://github.com/stevederico/discord-grok-bot-oss, 0.1.0)';
const MAX_RETRIES = 4;

export function getToken() {
  const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;
  if (!token || !token.trim()) {
    throw new Error(
      'Set DISCORD_BOT_TOKEN. Create a bot at https://discord.com/developers/applications then copy Bot > Reset Token.',
    );
  }
  return token.trim();
}

export function parseIdList(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const ids = raw.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
  return ids.length > 0 ? new Set(ids) : null;
}

export function assertAllowed(kind, id) {
  const envKey = kind === 'guild' ? 'DISCORD_GUILD_IDS' : 'DISCORD_CHANNEL_IDS';
  const allowed = parseIdList(process.env[envKey]);
  if (!allowed) return;
  if (!allowed.has(String(id))) {
    throw new Error(`${kind} ${id} is not in ${envKey}.`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseBody(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function discordRequest(method, path, body) {
  const url = `${API}${path}`;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bot ${getToken()}`,
        'User-Agent': UA,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get('retry-after') || 1);
      await sleep(Math.min(8000, Math.max(250, retryAfter * 1000)));
      continue;
    }
    const text = await res.text();
    const data = parseBody(text);
    if (!res.ok) {
      const message =
        data && typeof data === 'object' && typeof data.message === 'string'
          ? data.message
          : text || res.statusText;
      throw new Error(`Discord ${res.status} ${method} ${path}: ${message}`);
    }
    return data;
  }
  throw new Error(`Discord ${method} ${path}: rate limited`);
}

export function getMe() {
  return discordRequest('GET', '/users/@me');
}

export function getApplication() {
  return discordRequest('GET', '/oauth2/applications/@me');
}

export function listGuilds() {
  return discordRequest('GET', '/users/@me/guilds?with_counts=true&limit=200');
}

export function listChannels(guildId) {
  assertAllowed('guild', guildId);
  return discordRequest('GET', `/guilds/${guildId}/channels`);
}

export function getChannel(channelId) {
  assertAllowed('channel', channelId);
  return discordRequest('GET', `/channels/${channelId}`);
}

export function listMessages(channelId, { limit = 50, before, after } = {}) {
  assertAllowed('channel', channelId);
  const n = Math.min(100, Math.max(1, Number(limit) || 50));
  const query = new URLSearchParams({ limit: String(n) });
  if (before) query.set('before', String(before));
  if (after) query.set('after', String(after));
  return discordRequest('GET', `/channels/${channelId}/messages?${query}`);
}

export function getMessage(channelId, messageId) {
  assertAllowed('channel', channelId);
  return discordRequest('GET', `/channels/${channelId}/messages/${messageId}`);
}

export function sendMessage(channelId, content, replyTo) {
  assertAllowed('channel', channelId);
  const body = { content };
  if (replyTo) {
    body.message_reference = { message_id: String(replyTo), fail_if_not_exists: false };
  }
  return discordRequest('POST', `/channels/${channelId}/messages`, body);
}

export function getGatewayBot() {
  return discordRequest('GET', '/gateway/bot');
}
