#!/usr/bin/env node
/** Gateway mention bot. Optional. MCP read path does not need this. */
import { getGatewayBot, getMe, parseIdList, sendMessage } from '../server/rest.js';
import { askGrok, getXaiKey, splitDiscord } from './brain.js';

const log = (...a) => console.error('[discord-bot]', ...a);
const INTENTS = 1 | 512 | 4096 | 32768; // guilds, guild messages, DMs, message content
const seen = new Set();

function allowed(kind, id) {
  const envKey = kind === 'guild' ? 'DISCORD_GUILD_IDS' : 'DISCORD_CHANNEL_IDS';
  const list = parseIdList(process.env[envKey]);
  if (!list) return true;
  return list.has(String(id));
}

function mentioned(message, botId) {
  if (message.mentions?.some((user) => user.id === botId)) return true;
  return typeof message.content === 'string' && message.content.includes(`<@${botId}>`);
}

async function reply(message, botId) {
  if (message.author?.id === botId) return;
  if (message.author?.bot) return;
  if (!mentioned(message, botId)) return;
  if (message.guild_id && !allowed('guild', message.guild_id)) return;
  if (!allowed('channel', message.channel_id)) return;
  if (seen.has(message.id)) return;
  seen.add(message.id);
  if (seen.size > 500) seen.clear();

  const text = String(message.content || '')
    .replace(new RegExp(`<@!?${botId}>`, 'g'), '')
    .trim();
  if (!text) return;
  log('ask', message.channel_id, text.slice(0, 80));
  const answer = await askGrok(
    `You are a Discord bot powered by Grok. Reply in Discord markdown. Keep it short.\n\nUser ${message.author?.username || 'someone'}: ${text}`,
  );
  for (const chunk of splitDiscord(answer)) {
    await sendMessage(message.channel_id, chunk, message.id);
  }
}

function identify(ws, token) {
  ws.send(
    JSON.stringify({
      op: 2,
      d: {
        token,
        intents: INTENTS,
        properties: { os: process.platform, browser: 'discord-grok-bot', device: 'discord-grok-bot' },
      },
    }),
  );
}

async function connect() {
  getXaiKey();
  const me = await getMe();
  const gateway = await getGatewayBot();
  const url = `${gateway.url}?v=10&encoding=json`;
  log('connecting as', me.username, me.id);

  let ws;
  let heartbeat = null;
  let seq = null;

  const open = () => {
    ws = new WebSocket(url);
    ws.addEventListener('message', (ev) => {
      const packet = JSON.parse(String(ev.data));
      if (packet.s != null) seq = packet.s;
      if (packet.op === 10) {
        const interval = packet.d.heartbeat_interval;
        if (heartbeat) clearInterval(heartbeat);
        heartbeat = setInterval(() => {
          ws.send(JSON.stringify({ op: 1, d: seq }));
        }, interval);
        identify(ws, process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN);
        return;
      }
      if (packet.op === 7 || packet.op === 9) {
        log('reconnect');
        ws.close();
        return;
      }
      if (packet.op === 0 && packet.t === 'READY') {
        log('online as', packet.d.user?.username);
        return;
      }
      if (packet.op === 0 && packet.t === 'MESSAGE_CREATE') {
        reply(packet.d, me.id).catch((err) => log('reply failed', err.message));
      }
    });
    ws.addEventListener('close', () => {
      if (heartbeat) clearInterval(heartbeat);
      log('socket closed, retry in 3s');
      setTimeout(open, 3000);
    });
    ws.addEventListener('error', (err) => log('ws', err.message || err));
  };

  open();
}

connect().catch((err) => {
  log('fatal', err);
  process.exit(1);
});
