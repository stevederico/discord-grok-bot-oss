---
name: discord
description: Read Discord servers, channels, and message history via the Discord MCP plugin. Use when the user asks what is happening in Discord, to summarize a channel, or to look up a message.
---

# Discord

Read the user's Discord through the **discord** MCP server in this plugin. The bot can only see servers it was invited to.

## Setup

1. Confirm `DISCORD_BOT_TOKEN` is set (Grok MCP env or the shell).
2. Call `discord_status` first. If it errors, the token is missing or invalid.
3. Empty `content` on messages means Message Content Intent is off in the Discord Developer Portal.

## Tools

| Tool | Notes |
| --- | --- |
| `discord_status` | Bot identity, guild count, allowlists, invite URL |
| `discord_list_guilds` | Servers the bot is in |
| `discord_list_channels` | `guildId` required; optional `query` |
| `discord_read_messages` | `channel` id or `#name` (name needs `guildId`); default 30 |
| `discord_get_message` | One message by `channelId` + `messageId` |
| `discord_search_messages` | Substring over the last 100 messages in that channel |
| `discord_send_message` | Write. Confirm with the user first |

## Loop

1. `discord_status`
2. `discord_list_guilds` then `discord_list_channels`
3. `discord_read_messages` for the channel
4. Page older history with `before` set to the oldest id you already have
5. `discord_send_message` only after the user agrees

If `DISCORD_GUILD_IDS` or `DISCORD_CHANNEL_IDS` is set, calls outside that list fail.

## Safety

- Do not paste the bot token into Discord, git, or chat.
- Do not send messages until the user confirms the text and the channel.
- Treat channel history as private. Do not copy it to public places.
