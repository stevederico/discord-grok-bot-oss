/** MCP tool schemas. Keep descriptions short: the model reads these. */

export const TOOLS = [
  {
    name: 'discord_status',
    description:
      'Who the Discord bot is, which servers it can see, and whether DISCORD_GUILD_IDS / DISCORD_CHANNEL_IDS allowlists are set. Call this first.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'discord_list_guilds',
    description: 'List Discord servers (guilds) the bot is in. Use ids from here in later calls.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'discord_list_channels',
    description:
      'List text-like channels in a server. Pass guildId from discord_list_guilds. Optional query filters by name.',
    inputSchema: {
      type: 'object',
      properties: {
        guildId: { type: 'string', description: 'Server snowflake id' },
        query: { type: 'string', description: 'Optional channel name filter' },
      },
      required: ['guildId'],
      additionalProperties: false,
    },
  },
  {
    name: 'discord_read_messages',
    description:
      'Read recent messages in a channel (newest first). channel is a snowflake id or #name (name needs guildId). Default 30, max 100.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel id or #name' },
        guildId: { type: 'string', description: 'Required when channel is a name' },
        limit: { type: 'number', description: '1-100, default 30' },
        before: { type: 'string', description: 'Page older than this message id' },
        after: { type: 'string', description: 'Page newer than this message id' },
      },
      required: ['channel'],
      additionalProperties: false,
    },
  },
  {
    name: 'discord_get_message',
    description: 'Fetch one message by channel + message id.',
    inputSchema: {
      type: 'object',
      properties: {
        channelId: { type: 'string' },
        messageId: { type: 'string' },
      },
      required: ['channelId', 'messageId'],
      additionalProperties: false,
    },
  },
  {
    name: 'discord_search_messages',
    description:
      'Filter the last 100 messages in a channel by a case-insensitive substring. Discord does not give bots a real search API.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string' },
        query: { type: 'string' },
        guildId: { type: 'string' },
      },
      required: ['channel', 'query'],
      additionalProperties: false,
    },
  },
  {
    name: 'discord_send_message',
    description:
      'Send a message to a channel the bot can write in. Confirm with the user before posting. Max 2000 characters.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string' },
        content: { type: 'string' },
        guildId: { type: 'string' },
        replyTo: { type: 'string', description: 'Optional message id to reply to' },
      },
      required: ['channel', 'content'],
      additionalProperties: false,
    },
  },
];
