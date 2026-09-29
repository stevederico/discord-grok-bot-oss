import {
  assertAllowed,
  getApplication,
  getChannel,
  getMe,
  getMessage,
  listChannels,
  listGuilds,
  listMessages,
  parseIdList,
  sendMessage,
} from './rest.js';
import {
  TEXT_CHANNEL_TYPES,
  formatChannel,
  formatGuild,
  formatMessage,
  formatUser,
  isSnowflake,
  matchChannel,
} from './format.js';
import { TOOLS } from './toolDefs.js';

export { TOOLS };

const INVITE_PERMS = 68608; // View Channels + Send Messages + Read Message History

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

async function resolveChannelId(channel, guildId) {
  const raw = String(channel).trim();
  if (isSnowflake(raw)) {
    assertAllowed('channel', raw);
    return raw;
  }
  if (!guildId) {
    throw new Error('guildId is required when channel is a name instead of a snowflake id.');
  }
  const channels = await listChannels(guildId);
  const hit = matchChannel(channels, raw);
  if (!hit) throw new Error(`No channel matching "${raw}" in guild ${guildId}.`);
  assertAllowed('channel', hit.id);
  return hit.id;
}

async function status() {
  const [me, app] = await Promise.all([getMe(), getApplication().catch(() => null)]);
  const guilds = await listGuilds();
  const guildAllow = parseIdList(process.env.DISCORD_GUILD_IDS);
  const channelAllow = parseIdList(process.env.DISCORD_CHANNEL_IDS);
  const visible = guildAllow
    ? guilds.filter((guild) => guildAllow.has(guild.id))
    : guilds;
  const invite = app?.id
    ? `https://discord.com/oauth2/authorize?client_id=${app.id}&permissions=${INVITE_PERMS}&scope=bot`
    : null;
  return ok({
    bot: formatUser(me),
    applicationId: app?.id ?? null,
    inviteUrl: invite,
    guildCount: visible.length,
    guildAllowlist: guildAllow ? [...guildAllow] : null,
    channelAllowlist: channelAllow ? [...channelAllow] : null,
    hint: 'Enable Message Content Intent on the Bot page or message content fields are empty.',
  });
}

async function guilds() {
  const all = await listGuilds();
  const allow = parseIdList(process.env.DISCORD_GUILD_IDS);
  const visible = allow ? all.filter((guild) => allow.has(guild.id)) : all;
  return ok({ guilds: visible.map(formatGuild) });
}

async function channels(args) {
  const all = await listChannels(String(args.guildId));
  let rows = all.filter(
    (channel) => TEXT_CHANNEL_TYPES.has(channel.type) || channel.type === 4 || channel.type === 15,
  );
  if (args.query) {
    const q = String(args.query).replace(/^#/, '').toLowerCase();
    rows = rows.filter((channel) => (channel.name || '').toLowerCase().includes(q));
  }
  return ok({ channels: rows.map(formatChannel) });
}

async function read(args) {
  const channelId = await resolveChannelId(args.channel, args.guildId);
  const limit = args.limit === undefined ? 30 : args.limit;
  const messages = await listMessages(channelId, {
    limit,
    before: args.before,
    after: args.after,
  });
  return ok({ channelId, messages: messages.map(formatMessage) });
}

async function oneMessage(args) {
  const message = await getMessage(String(args.channelId), String(args.messageId));
  return ok(formatMessage(message));
}

async function search(args) {
  const channelId = await resolveChannelId(args.channel, args.guildId);
  const query = String(args.query).toLowerCase();
  const messages = await listMessages(channelId, { limit: 100 });
  const hits = messages
    .map(formatMessage)
    .filter((message) => message.content.toLowerCase().includes(query));
  return ok({ channelId, query: args.query, matches: hits });
}

async function send(args) {
  const content = String(args.content);
  if (!content.trim()) throw new Error('content is empty.');
  if (content.length > 2000) throw new Error('content exceeds Discord 2000 character limit.');
  const channelId = await resolveChannelId(args.channel, args.guildId);
  const channel = await getChannel(channelId);
  if (!TEXT_CHANNEL_TYPES.has(channel.type)) {
    throw new Error(`Channel ${channelId} is ${channel.type}, not a text channel.`);
  }
  const message = await sendMessage(channelId, content, args.replyTo);
  return ok({ sent: formatMessage(message) });
}

export async function handleTool(name, args) {
  switch (name) {
    case 'discord_status':
      return status();
    case 'discord_list_guilds':
      return guilds();
    case 'discord_list_channels':
      return channels(args);
    case 'discord_read_messages':
      return read(args);
    case 'discord_get_message':
      return oneMessage(args);
    case 'discord_search_messages':
      return search(args);
    case 'discord_send_message':
      return send(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
