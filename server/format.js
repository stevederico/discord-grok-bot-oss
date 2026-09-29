/** Compact Discord payloads for the model. */

export const CHANNEL_TYPES = {
  0: 'text',
  1: 'dm',
  2: 'voice',
  3: 'group_dm',
  4: 'category',
  5: 'announcement',
  10: 'announcement_thread',
  11: 'public_thread',
  12: 'private_thread',
  13: 'stage',
  15: 'forum',
  16: 'media',
};

export const TEXT_CHANNEL_TYPES = new Set([0, 1, 3, 5, 10, 11, 12]);

export function isSnowflake(value) {
  return typeof value === 'string' && /^\d{17,20}$/.test(value);
}

export function formatGuild(guild) {
  return {
    id: guild.id,
    name: guild.name,
    owner: Boolean(guild.owner),
    memberCount: guild.approximate_member_count ?? null,
  };
}

export function formatChannel(channel) {
  return {
    id: channel.id,
    name: channel.name ?? null,
    type: CHANNEL_TYPES[channel.type] ?? String(channel.type),
    typeId: channel.type,
    topic: channel.topic ?? null,
    parentId: channel.parent_id ?? null,
  };
}

export function formatUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.global_name || user.username || 'unknown',
    bot: Boolean(user.bot),
  };
}

export function formatMessage(message) {
  const attachments = Array.isArray(message.attachments)
    ? message.attachments
        .map((file) => file.url || file.filename)
        .filter(Boolean)
    : [];
  return {
    id: message.id,
    channelId: message.channel_id,
    author: formatUser(message.author),
    content: message.content ?? '',
    timestamp: message.timestamp,
    replyTo: message.referenced_message?.id ?? message.message_reference?.message_id ?? null,
    attachments,
  };
}

export function matchChannel(channels, nameOrId) {
  const raw = String(nameOrId).replace(/^#/, '');
  const byId = channels.find((channel) => channel.id === raw);
  if (byId) return byId;
  const needle = raw.toLowerCase();
  const exact = channels.find((channel) => (channel.name || '').toLowerCase() === needle);
  if (exact) return exact;
  const partial = channels.filter((channel) => (channel.name || '').toLowerCase().includes(needle));
  if (partial.length === 1) return partial[0];
  return null;
}
